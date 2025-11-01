export interface Questions {
  id: number;
  question: string;
  type: string; // multiple_choice, essay, true_false, ...
  answer: string;
  total_point: number;
  explanation?: string | null;
  created_at: string;
  updated_at: string;
  category_name: string;
  question_category_id: number;
  category_id: number;
}

export interface ServiceUpload {
  file: File | string | null;
}