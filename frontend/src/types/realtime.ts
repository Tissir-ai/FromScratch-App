export type CrudVerb = "created" | "updated" | "deleted";

export interface CrudChangeEvent {
  resource: string;
  action: CrudVerb;
  data: unknown;
  projectId?: string | null;
  pageId?: string | null;
  receivedAt: number;
}

export interface CursorPeer {
  userId: string;
  x: number;
  y: number;
  color: string;
  updatedAt: number;
}

export type ConnectionState = "idle" | "connecting" | "open" | "closed" | "error";
