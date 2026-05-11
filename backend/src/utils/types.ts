export type UserRole = 'admin' | 'base_commander' | 'logistics_officer';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  base_id?: string;
  created_at: Date;
}

export interface AuthRequest {
  userId: string;
  role: UserRole;
  baseId?: string;
}

export interface Base {
  id: string;
  name: string;
  location: string;
  created_at: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  base_id: string;
  opening_balance: number;
  created_at: Date;
}

export interface Purchase {
  id: string;
  asset_id: string;
  base_id: string;
  quantity: number;
  purchase_date: Date;
  unit_price: number;
  created_at: Date;
}

export interface Transfer {
  id: string;
  asset_id: string;
  from_base_id: string;
  to_base_id: string;
  quantity: number;
  transfer_date: Date;
  created_at: Date;
}

export interface Assignment {
  id: string;
  asset_id: string;
  personnel_name: string;
  quantity: number;
  assignment_date: Date;
  created_at: Date;
}

export interface Expenditure {
  id: string;
  asset_id: string;
  quantity: number;
  expended_date: Date;
  reason: string;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes: Record<string, any>;
  ip_address: string;
  created_at: Date;
}
