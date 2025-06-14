
export interface User {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface Profile {
  id: string;
  user_id: string;
  role: 'admin' | 'employee';
  full_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  location?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Employee {
  id: string;
  user_id: string;
  employee_number: string;
  full_name: string;
  position?: string;
  hourly_rate: number;
  created_at: Date;
  updated_at: Date;
}

export interface WorkSession {
  id: string;
  employee_id: string;
  event_id: string;
  start_time: Date;
  end_time?: Date;
  break_duration?: number;
  total_hours?: number;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PayrollReport {
  id: string;
  employee_id: string;
  event_id: string;
  period_start: Date;
  period_end: Date;
  total_hours: number;
  total_amount: number;
  status: 'draft' | 'approved' | 'paid';
  created_at: Date;
  updated_at: Date;
}
