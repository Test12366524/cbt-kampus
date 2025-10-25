export interface LmsDetail {
  id: number;
  lms_id: number;
  title: string;
  sub_title: string | null;
  slug: string;
  description: string | null;
  type: string; // required|in:video,audio,pdf,image,external_link
  link: string | null; // required_if:type,external_link|url
  status: boolean | number;
  file: File | string | null; // required_if:type,video,audio,pdf,image|file|mimeTypes:video/*,audio/*,application/pdf,image/*|max:10240
  created_at: string;
  updated_at: string;
  lms_title: string;
  lms_sub_title: string;
  subject_code: string;
  subject_name: string;
  subject_sub_code: string;
  subject_sub_name: string;
}