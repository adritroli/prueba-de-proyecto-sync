export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskStatus {
  id: number;
  name: string;
  color: string;
  description?: string;
  order_index: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status_id: number;
  status_name: string;  // Agregado para mostrar el nombre del estado
  status_color: string; // Agregado para mostrar el color del estado
  assignee: number | null | undefined;
    sprint_id: number | null | undefined;
    story_points: number;
  created_at: string;
  updated_at: string;
  due_date?: string;
  tags: string[];
  assignee_name?: string; // Add this property to fix the issue
  task_number: number;
  project_id: number;
  project_code: string;
  task_key: string;
  sprint_name?: string; // Added sprint_name property
  project_badge_color?: string;
  type?: string; // Added type property
    sprint_status?: string;


}

export interface Sprint {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'active' | 'completed';
  goal: string;
}

export interface FilterConfig {
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  priority?: string[];
  status?: string[];
  assignee?: number[];
  storyPoints?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
}

