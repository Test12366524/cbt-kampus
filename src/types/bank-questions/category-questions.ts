export interface CategoryQuestion {
  code: string; // unique
  name: string;
  description: string;
  status: boolean | number;
  updated_at: string;
  created_at: string;
  id: number;
}