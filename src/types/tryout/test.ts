export interface Test {
  id: number;
  school_id: number;
  title: string;
  sub_title: string | null;
  slug: string;
  description: string | null;
  total_time: number;
  total_questions: number;
  pass_grade: number;
  shuffle_questions: boolean | number;
  assessment_type: string;
  timer_type: string;
  score_type: string;
  start_date: string;
  end_date: string;
  code: string | null;
  max_attempts: string | null;
  total_participants: number;
  is_graded: boolean;
  is_explanation_released: boolean;
  created_at: string;
  updated_at: string;
  school_name: string;
  status?: boolean | number;
  user_id: number | null;
  pengawas_name: string | null;
}

// ===== API enums yang dipakai payload =====
export type TimerType = string;
export type ScoreType = string; // 'irt' | 'default'
export type AssessmentType = string; // 'irt' | 'standard'

// ===== Payload untuk CREATE/UPDATE ke backend =====
export interface TestPayload {
  school_id: number;
  title: string;
  sub_title: string | null;
  shuffle_questions: boolean | number;        // <- sesuai backend
  timer_type: TimerType;           // 'per_test' | 'per_category'
  score_type: ScoreType;           // 'irt' | 'default'

  // field kondisional:
  total_time?: number;             // wajib jika timer_type = 'per_test'
  start_date?: string;             // wajib jika score_type = 'irt'
  end_date?: string;               // wajib jika score_type = 'irt'

  // field lain yang backend-mu terima (opsional)
  slug?: string;
  description?: string | null;
  total_questions?: number;
  pass_grade?: number;
  assessment_type?: AssessmentType;
  code?: string | null;
  max_attempts?: string | null;
  status?: number;
  is_graded?: boolean;
  is_explanation_released?: boolean;
}

// Untuk update jika backend mengizinkan parsial
export type TestUpdatePayload = Partial<TestPayload>;