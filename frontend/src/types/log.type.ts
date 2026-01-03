export interface LogEntry {
  id: string;
  _id?: string;
  message: string;
  user_id?: string;
  timestamp: string;
}

export interface Log {
  id: string;
  _id?: string;
  project_id: string;
  data: LogEntry[];
  created_at: string;
  updated_at: string;
}
