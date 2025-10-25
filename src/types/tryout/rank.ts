export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// Generic pagination
export interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface PaginatedData<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

// Detail test (sesuai sample)
export interface ParticipantTestDetails {
  id: number;
  code: string | null;
  slug: string;
  title: string;
  end_date: string | null; // ISO string
  is_graded: boolean;
  sub_title: string | null;
  created_at: string; // ISO string
  pass_grade: number;
  score_type: string; // mis. "irt"
  start_date: string | null; // ISO string
  timer_type: string; // "per_category" | "per_test" | ...
  total_time: number;
  updated_at: string; // ISO string
  description: string | null; // HTML allowed
  max_attempts: string | null;
  assessment_type: string; // mis. "point"
  total_questions: number;
  shuffle_questions: boolean | number;
  total_participants: number;
  is_explanation_released: boolean;
}

// Item history peserta
export interface ParticipantHistoryItem {
  id: number;
  test_id: number;
  user_id: number;

  test_details: ParticipantTestDetails;

  participant_name: string;
  participant_email: string;
  participant_phone: string | null;

  grade: number;

  start_date: string | null; // ISO string
  end_date: string | null; // ISO string

  is_passed: boolean;
  is_started: boolean;

  created_at: string; // ISO string
  updated_at: string; // ISO string
}

// Bentuk paginated khusus untuk ParticipantHistoryItem
export type ParticipantHistoryPage = PaginatedData<ParticipantHistoryItem>;