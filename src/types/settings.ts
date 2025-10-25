export interface Setting {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  about: string;
  google_analytics: string | null;
  privacy_policy: string | null;
  term_of_service: string | null;
  created_at: string;
  updated_at: string;
  mail_email_show: string;
  mail_driver: string;
  mail_host: string;
  mail_port: string;
  mail_encryption: string;
  mail_username: string;
  mail_password: string;
  mail_from_address: string;
  mail_from_name: string;
  logo: string;
  favicon: string;
  media: string[];
}
