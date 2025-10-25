export interface IRTTestInfo {
  id: number;
  title: string;
  sub_title: string | null;
  description: string | null;
}

export type IRTQuestion = Record<string, unknown>;

export interface IRTCategoryQuestions {
  category: string;
  category_code: string;
  category_id: number;
  questions: IRTQuestion[];
}

export interface TestIRTData {
  test: IRTTestInfo;
  total_participant_submit: number;
  questions: IRTCategoryQuestions[];
}