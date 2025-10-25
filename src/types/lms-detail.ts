export interface Media {
  id: number;
  model_type: string; // contoh: "App\\Models\\Lms\\LmsDetail"
  model_id: number;
  uuid: string;
  collection_name: string; // contoh: "file"
  name: string; // contoh: "test-barcode"
  file_name: string; // contoh: "test-barcode.pdf"
  mime_type: string; // contoh: "application/pdf"
  disk: string; // contoh: "public"
  conversions_disk: string; // contoh: "public"
  size: number; // bytes

  manipulations: unknown[];
  custom_properties: unknown[];
  generated_conversions: unknown[];
  responsive_images: unknown[];

  order_column: number;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  original_url: string; // URL file asli
  preview_url: string; // URL preview (bisa kosong)
}

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
  media: Media[];
}
