export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export interface AdminCase {
  id: string;
  case_code: string;
  team_name: string | null;
  course_context: string | null;
  user_facing_stage: string;
  payment_status: string;
  assigned_supporter_auth_user_id: string | null;
  owner: AdminUser;
  created_at: string;
}

export interface Supporter {
  id: string;
  name: string;
  email: string;
}

export interface AdminPayment {
  id: string;
  case_id: string;
  amount: number;
  status: string;
  proof_file_url: string | null;
  created_at: string;
  case: {
    case_code: string;
    team_name: string | null;
    owner: {
      name: string;
    };
  };
}
