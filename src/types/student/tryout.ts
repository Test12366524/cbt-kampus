export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "essay"
  | "multiple_choice_multiple_answer"
  | "multiple_choice_multiple_category"
  | "matching";

export type MCOption = {
  option: string; // "a", "b", ...
  text: string; // HTML
  point: number;
};

export type CategorizedOption = {
  text: string; // HTML
  accurate: boolean;
  not_accurate: boolean;
  point: number;
};

export type QuestionBase = {
  id: number;
  question_category_id: number;
  question: string; // HTML
  total_point: number;
  type: QuestionType;
  answer: string | null; // kunci (bila ada)
  explanation: string | null; // HTML
  created_at: string;
  updated_at: string;
};

export type QuestionDetailsMC =
  | QuestionBase & {
      type:
        | "multiple_choice"
        | "true_false"
        | "multiple_choice_multiple_answer";
      options: MCOption[];
    };

export type QuestionDetailsCategorized = QuestionBase & {
  type: "multiple_choice_multiple_category";
  options: CategorizedOption[];
};

export type QuestionDetailsEssay = QuestionBase & {
  type: "essay";
  options: null;
};

export type QuestionDetails =
  | QuestionDetailsMC
  | QuestionDetailsCategorized
  | QuestionDetailsEssay
  | (QuestionBase & { type: "matching"; options?: never }); // jika nanti ada

export type QuestionCategory = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
};

export type TestQuestionCategoryDetails = {
  id: number;
  test_id: number;
  question_category_id: number;
  total_questions: number;
  total_time: number; // detik/menit (sesuai API)
  order: number;
  created_at: string;
  updated_at: string;
  // beberapa response menyertakan nested question_category
  question_category?: QuestionCategory;
};

export type ParticipantQuestionCategory = {
  id: number;
  participant_test_id: number;
  test_question_category_id: number;
  question_category_id: number;
  test_question_category_details: TestQuestionCategoryDetails;
  question_category_details: QuestionCategory;
  participant_questions?: [];
  grade: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type TestDetails = {
  id: number;
  title: string;
  sub_title: string | null;
  slug: string;
  description: string | null;
  total_time: number;
  total_questions: number;
  pass_grade: number;
  shuffle_questions: boolean | number;
  assessment_type: string; // "point" | ...
  timer_type: "per_test" | "per_category";
  score_type: string; // "irt" | ...
  start_date: string;
  end_date: string;
  code: string | null;
  max_attempts: number | null;
  total_participants: number;
  is_graded: boolean;
  is_explanation_released: boolean;
  created_at: string;
  updated_at: string;
};

export type ParticipantTest = {
  id: number;
  test_id: number;
  user_id: number;
  test_details: TestDetails;
  participant_name: string;
  participant_email: string;
  participant_phone: string | null;
  grade: number;
  start_date: string | null;
  end_date: string | null;
  is_passed: boolean | null;
  is_started: boolean;
  created_at: string;
  updated_at: string;
  // kadang ada field ini di akhir sesi:
  active_participant_question_category?: ParticipantQuestionCategory | null;
};

export type ParticipantAnswer = {
  question_id: number;
  question_details: QuestionDetails;
  user_answer: string | null; // contoh: "a" | "a,c,d" | "accurate,..." | esai
  point: number | null;
  is_correct: boolean | null;
  is_flagged: boolean;
};

export type QuestionGroup = {
  participant_question_category_id: number;
  question_category_details: QuestionCategory;
  questions: ParticipantAnswer[];
};

export type ParticipantHistoryItem = ParticipantTest & {
  participant_question_categories?: ParticipantQuestionCategory[];
  participant_test_question_category_id?: number;
  test_id?: number;
  is_ongoing?: 0 | 1;
  is_completed?: 0 | 1;
  is_graded?: 0 | 1;
  started_at?: string | null;
  ended_at?: string | null;
};

export type PaginatedResponse<T> = {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: T[];
    last_page: number;
    total: number;
    per_page: number;
  };
};

export type ItemResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type ContinueTestData = {
  test: ParticipantTest;
  category: ParticipantQuestionCategory | null;
  questions: QuestionGroup[];
};

export type ContinueTestResponse = ItemResponse<ContinueTestData>;

export type ActiveCategoryResponse =
  | ItemResponse<ParticipantQuestionCategory>
  | { code: number; message: string; data: null };

export type EndCategoryData =
  | { next_category: ParticipantQuestionCategory }
  | ParticipantTest;

export type EndCategoryResponse = ItemResponse<EndCategoryData>;

export type EndSessionResponse = ItemResponse<ParticipantTest>;

export type SaveAnswerPayload = {
  question_id: number;
  // untuk konsistensi sisi client, kirim "type" juga
  type: QuestionType;
  answer: string; // "a" | "a,c,d" | "accurate,not_accurate,..." | teks esai
};

export type ResetAnswerPayload = {
  question_id: number;
};

export type FlagQuestionPayload = {
  question_id: number;
  is_flagged: boolean;
};

export type AnswerResponse = ItemResponse<ParticipantAnswer>;

export type GenerateTestPayload = { test_id: number };

export type GenerateTestResponse = ItemResponse<ParticipantTest>;