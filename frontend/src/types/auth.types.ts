export type UserRole = 
  | 'sales_manager' 
  | 'sales_team' 
  | 'editorial_manager' 
  | 'editorial_team' 
  | 'design_manager' 
  | 'design_team';

export type Department = 'sales' | 'editorial' | 'design';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
} 