export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  previous_price?: number | null;
  last_price_changed_at?: string | null;
  last_price_changed_by?: string | null;
  features: string[] | Record<string, any>;
  created_at: string;
  updated_at: string;
}
