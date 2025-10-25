export interface SubMapel {
  id: number;
  subject_id: number;
  code: string | null; // unique nullable
  name: string;
  description: string | null; // nullable
  status: boolean | number;
  subject_code: string;
  subject_name: string;
}
