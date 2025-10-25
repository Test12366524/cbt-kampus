export interface Kota {
  id: string;
  province_id: string;
  province_name?: string;
  name: string;
}

export interface KotaResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Kota[];
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

export interface CreateKotaRequest {
  id: string;
  province_id: string;
  name: string;
}

export interface UpdateKotaRequest {
  id: string;
  province_id: string;
  name: string;
}
