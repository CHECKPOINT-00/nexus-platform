export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  features: string[] | Record<string, any>;
  created_at: string;
  updated_at: string;
}
