import { Class } from "./master/class";
import { School } from "./master/school";

export interface Student {
  id: number;
  user_id: number;
  nim: number | string;
  school_id: number;
  status: boolean | number;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string | null;
  school_name: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  class_id: number;
  class_name: string;
  school: School;
  class: Class | null;
}