export type WidgetType = 
  | 'projectSummary'
  | 'tasksByStatus'
  | 'teamPerformance'
  | 'recentActivity'
  | 'userTasks'
  | "mainStats"
  | "activeSprint"
  | "topPerformers"
  | "userStats";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: number;
  visible: boolean;
  settings?: {
    height?: number;
    refreshInterval?: number;
    maxItems?: number;
  };
}


export interface DashboardConfig {
  userId: number;
  layout: string;
  widgets: Array<{
    id: string;
    type: WidgetType;
    position: number;
    visible: boolean;
  }>;
}

