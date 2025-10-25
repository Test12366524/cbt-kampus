export interface TestCategory {
  id: number;
  test_id: number;
  question_category_id: number;
  total_questions: number;
  total_time: number;
  order: number;
  created_at: string;
  updated_at: string;
  question_category_code: string;
  question_category_name: string;
  question_category_description: string;
}