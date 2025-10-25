export interface Kelurahan {
  id: string;
  district_id: string;
  district_name?: string;
  regency_name?: string;
  province_name?: string;
  name: string;
}

export interface KelurahanResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Kelurahan[];
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

export interface CreateKelurahanRequest {
  id: string;
  district_id: string;
  name: string;
}

export interface UpdateKelurahanRequest {
  id: string;
  district_id: string;
  name: string;
}
