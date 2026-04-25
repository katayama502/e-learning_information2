
export interface Reel {
    id: string;
    url: string;
    type: 'file' | 'youtube';
    thumbnail?: string;
    title: string;
    caption?: string;
    description?: string;
    link_url?: string;
    link_text?: string;
    likes: number;
    entityType?: 'company' | 'job' | 'quest' | 'other';
}

export interface Job {
    id: string;
    companyId: string;
    title: string;
    type: 'quest' | 'job' | 'internship';
    category: string;
    reward?: string;
    description: string;
    isExperience: boolean;
    requirements?: string;
    salary?: string;
    workingHours?: string;
    holidays?: string;
    welfare?: string;
    selectionProcess?: string;
    tags: string[];
    location?: string;
    reels?: Reel[];
    organization?: Company; // For UI convenience
    cover_image_url?: string; // Supabase field
    value_tags_ai?: any; // AI field
    is_public: boolean;
    hiring_status: 'open' | 'closed';
    view_count?: number; // 閲覧数
    applicationCount?: number; // 応募数
}

export interface Company {
    id: string;
    name: string;
    industry: string;
    location: string;
    description: string;
    rjpNegatives: string;
    rjp_negatives?: string; // DB field name
    rjpPositives?: string;
    rjp_positives?: string; // DB field name
    isPremium: boolean;
    is_premium?: boolean;
    image: string;
    logoColor: string;
    logo_color?: string; // DB field name
    foundingYear?: number;
    established_date?: string; // DB field name
    capital?: string;
    employeeCount?: string;
    employee_count?: string; // DB field name
    representative?: string;
    representative_name?: string; // DB field name
    address?: string;
    phone?: string;
    website?: string;
    website_url?: string; // DB field name
    businessDetails?: string;
    business_content?: string; // DB field name
    philosophy?: string;
    benefits?: string;
    images?: string[];
    reels?: Reel[];
    videos?: string[];
    cover_image_url?: string;
    logo_url?: string;
    status?: string;
    is_public: boolean;
    view_count?: number;
    // New fields
    access?: string;
    sns_links?: {
        twitter?: string;
        instagram?: string;
        facebook?: string;
        linkedin?: string;
    };
    message_to_seekers?: string;
}

// E-Learning Types
export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation?: string;
}

export interface Lesson {
    id: string;
    curriculumId: string;
    title: string;
    description: string;
    youtubeUrl: string;
    duration: string;
    attachments?: { name: string; url: string; size: string }[];
    quiz?: QuizQuestion[];
    order: number;
    material_url?: string;
    // UI/DB Compatibility fields
    url?: string;
    youtube_url?: string;
    thumbnail?: string;
    thumbnail_url?: string;
}

export interface Curriculum {
    id: string;
    courseId: string;
    title: string;
    description: string;
    lessons: Lesson[];
    order: number;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    instructor?: { // Made optional as Modules don't have it
        name: string;
        role: string;
        image: string;
    };
    category?: string; // Optional
    level?: '初級' | '中級' | '上級'; // Optional
    duration?: string; // Optional
    image?: string; // Optional
    thumbnail?: string; // コースサムネイル
    thumbnail_url?: string; // Supabaseのサムネイル
    curriculums?: Curriculum[]; // Make optional
    lessons?: Lesson[]; // Add direct lessons support
    isFeatured?: boolean;
    // New fields for approval and soft delete
    created_by?: string;
    instructor_id?: string;
    is_official?: boolean;
    status?: 'draft' | 'pending' | 'approved' | 'rejected';
    updated_at?: string | number;
    deleted_at?: string | null;
}

export interface LearningTrack {
    id: string;
    title: string;
    description: string;
    courseIds: string[];
    image?: string;
    courses?: { id: string; title: string; }[]; // For UI display
}

export interface UserCourseRecommendation {
    id: string;
    user_id: string;
    course_id: string;
    value_id: number;
    reason_message: string;
    created_at: string;
}
