export interface User {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  image?: string | null;
  created_at: string;
  updated_at: string;
  role: "user" | "supporter" | "admin" | string;
  banned: boolean;
  ban_reason?: string | null;
  ban_expires?: string | null;
  username?: string | null;
  display_username?: string | null;
}

export interface Session {
  id: string;
  expires_at: string;
  token: string;
  created_at: string;
  updated_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
  user_id: string;
}
