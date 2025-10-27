export interface Lms {
  id: number;
  subject_id: number;
  subject_sub_id: number;
  title: string;
  sub_title: string | null;
  slug: string;
  description: string | null;
  status: boolean | number;
  created_at: string;
  updated_at: string;
  subject_code: string;
  subject_name: string;
  subject_sub_code: string;
  subject_sub_name: string;
  cover: File | string | null;
  school_id: number;
  school_name: string;
}