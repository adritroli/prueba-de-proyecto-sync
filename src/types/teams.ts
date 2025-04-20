export interface Team {
  id: number;
  team_name: string;
  description: string;
  status: 'active' | 'inactive';
  members_count: number;
  members?: {
    id: number;
    name: string;
    avatar: string;
  }[];
  created_at: string;
  updated_at: string;
}