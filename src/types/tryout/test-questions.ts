export interface TestQuestion {
  id: number;
  question: string;
  type: string; // multiple_choice, essay, true_false, multiple_choice_multiple_answer, multiple_choice_multiple_category
  answer: string;
  total_point: number;
  created_at: string;
  updated_at: string;
  category_name: string;
  test_question_id: number;
  question_ids: number[];
}