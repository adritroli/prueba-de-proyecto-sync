export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  user_status: 'active' | 'inactive' | 'paused';
  role_group_id: number;
  team_id: number;
  avatar?: string;
  audit_date?: string;
  modif_date?: string;
  last_name?: string;
  last_connection?: string;
  connection_status?: 'online' | 'away' | 'offline';
  team_name?: string;
  name_rol?: string;
}

export interface CreateUserInput {
  name: string;
  username: string;
  email: string;
  password: string;
  team_id: number;
  role_group_id: number;
  last_name?: string;
}
