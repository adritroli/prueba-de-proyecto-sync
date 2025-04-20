export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
  team_id?: number;
  manager_id?: number;
  team_name?: string;
  manager_name?: string;
  tasks_count?: number;
  completed_tasks?: number;
  code?: string; // Added the 'code' property
}

export interface CreateProjectInput {
  name: string;
  description: string;
  team_id?: number;
  manager_id?: number;
}
