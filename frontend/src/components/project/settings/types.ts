// Types for Settings (Teams and Members)

export const AVAILABLE_PAGES = [
  "dashboard",
  "diagrams",
  "user-stories",
  "requirements",
  "tasks",
  "reports",
  "settings",
] as const;

export type AvailablePage = (typeof AVAILABLE_PAGES)[number];

export const ROLES = ["Admin", "Member", "Viewer"] as const;
export type Role = (typeof ROLES)[number];

export interface Team {
  id: string;
  name: string;
  pageAccess: string[];
  memberIds: string[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId?: string;
  permissions: {
    read: string[];
    write: string[];
  };
}

export interface NewMemberInput {
  name: string;
  email: string;
  role: Role;
  teamId?: string;
}
