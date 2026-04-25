// ============================================
// インタビューシップ機能 型定義
// ============================================

export interface InterviewshipCompany {
  id: string;
  organization_id: string;
  interview_available_times?: string;
  max_students: number;
  available_topics?: string[];
  pr_message?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  // Joined data
  organization?: {
    id: string;
    name: string;
    type: string;
    description?: string;
    location?: string;
    logo_url?: string;
    cover_image_url?: string;
    website_url?: string;
    business_content?: string;
    employee_count?: string;
    representative_name?: string;
    philosophy?: string;
    images?: string[];
  };
}

export interface InterviewshipProgram {
  id: string;
  name: string;
  school_name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  application_start?: string;
  application_end?: string;
  student_application_enabled: boolean;
  max_applications_per_student: number;
  status: 'draft' | 'active' | 'closed' | 'archived';
  created_by?: string;
  created_at: string;
  updated_at?: string;
  // Aggregated
  company_count?: number;
  application_count?: number;
}

export interface InterviewshipProgramCompany {
  id: string;
  program_id: string;
  company_id: string;
  slots: number;
  slots_used: number;
  status: 'active' | 'inactive' | 'full';
  created_at: string;
  // Joined data
  company?: InterviewshipCompany;
}

export interface InterviewshipFormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'email' | 'number' | 'tel';
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select, radio, checkbox
  description?: string;
}

export interface InterviewshipForm {
  id: string;
  program_id?: string;
  name: string;
  form_type: 'company_entry' | 'student_application';
  fields: InterviewshipFormField[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  // Joined
  program?: InterviewshipProgram;
}

export interface InterviewshipFormSubmission {
  id: string;
  form_id: string;
  program_id?: string;
  company_id?: string;
  submitted_by?: string;
  submitted_by_name?: string;
  submitted_by_email?: string;
  data: Record<string, unknown>;
  status: 'submitted' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  // Joined
  form?: InterviewshipForm;
  company?: InterviewshipCompany;
}

export interface InterviewshipStudentApplication {
  id: string;
  program_id: string;
  program_company_id: string;
  student_user_id?: string;
  student_name: string;
  student_email?: string;
  student_school?: string;
  form_submission_id?: string;
  status: 'applied' | 'confirmed' | 'cancelled' | 'completed';
  applied_at: string;
  // Joined
  program_company?: InterviewshipProgramCompany;
  program?: InterviewshipProgram;
}

export interface InterviewshipAdmin {
  id: string;
  user_id: string;
  role: 'admin' | 'viewer';
  created_at: string;
  // Joined
  profile?: {
    email: string;
    full_name?: string;
  };
}
