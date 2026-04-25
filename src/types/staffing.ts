export type StaffingWorkerStatus =
  | 'pending'
  | 'interview_scheduled'
  | 'approved'
  | 'rejected'
  | 'inactive';

export type StaffingJobStatus = 'draft' | 'recruiting' | 'closed' | 'completed';

export type StaffingAssignmentStatus =
  | 'proposed'
  | 'confirmed'
  | 'attended'
  | 'no_show'
  | 'cancelled';

export interface StaffingWorker {
  id: string;
  user_id: string | null;
  name: string;
  name_kana: string | null;
  gender: string | null;
  birth_date: string | null;
  attribute: string | null;
  phone: string | null;
  email: string | null;
  postal_code: string | null;
  address: string | null;
  occupation: string | null;
  emergency_contact: string | null;
  source: string | null;
  status: StaffingWorkerStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffingJob {
  id: string;
  client_organization_id: string;
  title: string;
  description: string | null;
  location: string | null;
  hourly_wage: number | null;
  fee_per_worker: number | null;
  status: StaffingJobStatus;
  work_type: string | null;
  meeting_place_address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  reminder_template: string | null;
  public_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffingJobAttachment {
  id: string;
  job_id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  content_type: string | null;
  size_bytes: number | null;
  kind: 'meeting_place' | 'day_of_flow' | 'other';
  sort_order: number;
  created_at: string;
}

export const ATTACHMENT_KIND_LABEL: Record<StaffingJobAttachment['kind'], string> = {
  meeting_place: '集合場所案内',
  day_of_flow: '当日の動き',
  other: 'その他',
};

export interface StaffingShift {
  id: string;
  job_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  meeting_time: string | null;
  capacity: number;
  created_at: string;
}

export interface StaffingAssignment {
  id: string;
  worker_id: string;
  shift_id: string;
  status: StaffingAssignmentStatus;
  attended_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffingClientSettings {
  organization_id: string;
  report_to_email: string | null;
  report_to_name: string | null;
  report_cc: string[];
  report_sender_name: string | null;
  report_sender_email: string | null;
  contract_type: 'introduction' | 'dispatch';
  notes: string | null;
}

export const WORKER_STATUS_LABEL: Record<StaffingWorkerStatus, string> = {
  pending: '未対応',
  interview_scheduled: '面談予定',
  approved: '採用',
  rejected: '不採用',
  inactive: '休止',
};

export const JOB_STATUS_LABEL: Record<StaffingJobStatus, string> = {
  draft: '下書き',
  recruiting: '募集中',
  closed: '締切',
  completed: '完了',
};

export const ASSIGNMENT_STATUS_LABEL: Record<StaffingAssignmentStatus, string> = {
  proposed: '打診中',
  confirmed: '確定',
  attended: '出勤済',
  no_show: '欠勤',
  cancelled: 'キャンセル',
};
