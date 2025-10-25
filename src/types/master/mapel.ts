export interface Mapel {
  id: number;
  code: string | null; // unique nullable
  name: string;
  description: string | null; // nullable
  status: boolean | number;
}
