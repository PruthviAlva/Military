export interface User {
  id: string;
  email: string;
  role: 'admin' | 'base_commander' | 'logistics_officer';
  baseId?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  base_id: string;
  opening_balance: number;
  purchase_count?: number;
  total_purchases?: number;
  total_transfers_out?: number;
  total_transfers_in?: number;
  total_expended?: number;
  total_assigned?: number;
  created_at: string;
}

export interface Purchase {
  id: string;
  asset_id: string;
  base_id: string;
  quantity: number;
  unit_price: number;
  purchase_date: string;
  created_at: string;
}

export interface Transfer {
  id: string;
  asset_id: string;
  from_base_id: string;
  to_base_id: string;
  quantity: number;
  transfer_date: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  asset_id: string;
  personnel_name: string;
  quantity: number;
  assignment_date: string;
  created_at: string;
}

export interface Expenditure {
  id: string;
  asset_id: string;
  quantity: number;
  reason: string;
  expended_date: string;
  created_at: string;
}

export interface ClosingBalance {
  openingBalance: number;
  purchases: number;
  transfersIn: number;
  transfersOut: number;
  assigned: number;
  expended: number;
  closingBalance: number;
}
