export interface WaterTank {
  id: number;
  community_name: string;
  tank_code: string;
  tank_name: string;
  address: string;
  capacity: number;
  last_cleaned_at: string | null;
  next_clean_deadline: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyCompany {
  id: number;
  name: string;
  contact_person: string;
  contact_phone: string;
}

export interface Contractor {
  id: number;
  name: string;
  license_no: string;
  contact_person: string;
  contact_phone: string;
  status: string;
}

export interface CleanPersonnel {
  id: number;
  contractor_id: number;
  name: string;
  id_card: string;
  health_cert_no: string;
  health_cert_expire: string | null;
  status: string;
  contractor?: Contractor;
}

export interface CleanChemical {
  id: number;
  contractor_id: number;
  plan_id: number | null;
  chemical_name: string;
  batch_no: string;
  dosage: number;
  unit: string;
  registered_at: string;
  contractor?: Contractor;
}

export interface TestInstitution {
  id: number;
  name: string;
  qualification_no: string;
  contact_person: string;
  contact_phone: string;
}

export interface TestReport {
  id: number;
  plan_id: number;
  institution_id: number;
  residual_chlorine: number;
  turbidity: number;
  ph_value: number;
  test_time: string;
  result: string;
  report_no: string;
  institution?: TestInstitution;
}

export interface Notice {
  id: number;
  plan_id: number;
  notice_time: string;
  planned_start: string;
  planned_end: string;
  actual_published_at: string | null;
  is_sufficient: boolean;
  content: string;
}

export interface CleanPlan {
  id: number;
  tank_id: number;
  property_company_id: number;
  contractor_id: number | null;
  plan_date: string;
  status: string;
  announced_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  water_resumed_at: string | null;
  remark: string;
  tank?: WaterTank;
  property_company?: PropertyCompany;
  contractor?: Contractor;
  personnel?: CleanPlanPersonnel[];
  chemicals?: CleanChemical[];
  test_reports?: TestReport[];
  notices?: Notice[];
}

export interface CleanPlanPersonnel {
  id: number;
  plan_id: number;
  personnel_id: number;
  role: string;
  personnel?: CleanPersonnel;
}

export interface OverduePlan {
  plan_id: number;
  community_name: string;
  tank_name: string;
  plan_date: string;
  status: string;
  overdue_days: number;
  property_company: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}
