-- Allow Instructors to update applications for their own events
CREATE POLICY "Instructors can update applications for own events" ON reskill_event_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM reskill_events e
      JOIN instructors i ON e.instructor_id = i.id
      WHERE e.id = reskill_event_applications.event_id
      AND i.user_id = auth.uid()
    )
  );
