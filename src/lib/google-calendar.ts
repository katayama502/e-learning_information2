import { google } from 'googleapis';
import { createClient } from '@/utils/supabase/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`
);

/**
 * Get Google Calendar tokens from DB for a given admin email
 */
export async function getGoogleTokens(adminEmail?: string) {
  const supabase = await createClient();

  let query = supabase.from('google_calendar_tokens').select('*');
  if (adminEmail) {
    query = query.eq('user_email', adminEmail);
  }
  // Get the most recently updated token
  const { data } = await query.order('updated_at', { ascending: false }).limit(1).maybeSingle();
  return data;
}

/**
 * Create a Google Calendar event with optional Meet link
 */
export async function createGoogleCalendarEvent(params: {
  title: string;
  description?: string;
  startTime: string; // ISO
  endTime: string; // ISO
  attendeeEmails?: string[];
  location?: string;
  createMeetLink?: boolean;
  adminEmail?: string;
}) {
  const tokens = await getGoogleTokens(params.adminEmail);
  if (!tokens) {
    console.warn('No Google Calendar tokens found');
    return null;
  }

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const eventBody: any = {
    summary: params.title,
    description: params.description || '',
    start: { dateTime: params.startTime, timeZone: 'Asia/Tokyo' },
    end: { dateTime: params.endTime, timeZone: 'Asia/Tokyo' },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  if (params.attendeeEmails && params.attendeeEmails.length > 0) {
    eventBody.attendees = params.attendeeEmails.map(email => ({ email }));
  }

  if (params.location) {
    eventBody.location = params.location;
  }

  if (params.createMeetLink) {
    eventBody.conferenceData = {
      createRequest: {
        requestId: `ehime-base-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventBody,
      conferenceDataVersion: params.createMeetLink ? 1 : 0,
      sendUpdates: 'all',
    });

    return {
      googleEventId: response.data.id,
      meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri || null,
      htmlLink: response.data.htmlLink,
    };
  } catch (error) {
    console.error('Google Calendar API error:', error);
    return null;
  }
}

/**
 * Delete a Google Calendar event
 */
export async function deleteGoogleCalendarEvent(googleEventId: string, adminEmail?: string) {
  const tokens = await getGoogleTokens(adminEmail);
  if (!tokens) return;

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: googleEventId,
      sendUpdates: 'all',
    });
  } catch (error) {
    console.error('Google Calendar delete error:', error);
  }
}
