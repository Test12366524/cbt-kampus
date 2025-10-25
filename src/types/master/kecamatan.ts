export interface Kecamatan {
  id: string;
  province_name?: string;
  regency_id: string;
  regency_name?: string;
  name: string;
}

export interface KecamatanResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Kecamatan[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface CreateKecamatanRequest {
  id: string;
  regency_id: string;
  name: string;
}

export interface UpdateKecamatanRequest {
  id: string;
  regency_id: string;
  name: string;
}
