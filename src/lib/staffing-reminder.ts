/**
 * リマインドメッセージのテンプレート展開。
 * 案件ごとに編集された reminder_template に対して、シフト情報・連絡先を変数置換する。
 *
 * 使える変数:
 *   {{prefix}}                 — "1週間前" / "1日前" / "本日"
 *   {{shift_date}}             — "4/16(木)"
 *   {{shift_time}}             — "12:00 - 16:00"
 *   {{meeting_time}}           — "11:30"
 *   {{meeting_place}}          — "ISSEIビル 入口前"
 *   {{work_type}}              — "通行量調査"
 *   {{emergency_contact_name}} — "川本"
 *   {{emergency_contact_phone}}— "09095505962"
 */

export const DEFAULT_REMINDER_TEMPLATE = `就業{{prefix}}となりましたので、お知らせいたします。

就業内容：{{work_type}}
就業日時：{{shift_date}} {{shift_time}}
集合時間：{{meeting_time}} 時間厳守
集合場所：{{meeting_place}}（添付ファイル参照）

「集合場所」と「当日の動き」のファイルを必ずご確認ください！
※緊急時の連絡先：{{emergency_contact_phone}}（{{emergency_contact_name}}）

こちらとファイルの内容が確認できましたら、
スタンプかメッセージを送信してください！`;

export interface ReminderVars {
  prefix: string;
  shift_date: string;
  shift_time: string;
  meeting_time: string;
  meeting_place: string;
  work_type: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function formatShiftDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const w = WEEKDAYS[d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${w})`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
}

export function renderReminderTemplate(template: string, vars: ReminderVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = vars[key as keyof ReminderVars];
    return v ?? '';
  });
}

export function buildReminderVars(input: {
  prefix: string;
  shift: { shift_date: string; start_time: string; end_time: string; meeting_time: string | null };
  job: {
    work_type: string | null;
    meeting_place_address: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
  };
}): ReminderVars {
  return {
    prefix: input.prefix,
    shift_date: formatShiftDate(input.shift.shift_date),
    shift_time: formatTimeRange(input.shift.start_time, input.shift.end_time),
    meeting_time: input.shift.meeting_time ? input.shift.meeting_time.slice(0, 5) : '—',
    meeting_place: input.job.meeting_place_address ?? '',
    work_type: input.job.work_type ?? '',
    emergency_contact_name: input.job.emergency_contact_name ?? '',
    emergency_contact_phone: input.job.emergency_contact_phone ?? '',
  };
}
