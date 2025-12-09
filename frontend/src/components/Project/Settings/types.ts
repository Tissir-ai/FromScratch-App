export const ROLES = ["Owner", "Member", "Viewer"] as const;
export type Role = typeof ROLES[number];

export interface Restrictions {
  read: string[];
  write: string[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId?: string; // No team => treated as Guest
  permissions: Restrictions; // Per-member permissions limited to their team's pageAccess
}

export interface Team {
  id: string;
  name: string;
  pageAccess: string[]; // Pages this team can access
  memberIds: string[];
}

export type NewMemberInput = Omit<Member, "id">;

export const AVAILABLE_PAGES = [
  "dashboard",
  "diagrams",
  "requirements",
  "user-stories",
  "tasks",
  "cost",
  "reports",
  "settings",
];
