export interface Provinsi {
  id: string;
  name: string;
}

export interface ProvinsiResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Provinsi[];
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

export interface CreateProvinsiRequest {
  id: string;
  name: string;
}

export interface UpdateProvinsiRequest {
  id: string;
  name: string;
}
