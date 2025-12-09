// Mock data for Settings (Teams and Members)
// Use these to seed UI or for local development/testing.

import { Member, Team } from "./types";

export const mockTeams: Team[] = [
  {
    id: "team-design",
    name: "Design",
    pageAccess: ["dashboard", "diagrams", "user-stories"],
    memberIds: ["mem-ava", "mem-liam"],
  },
  {
    id: "team-eng",
    name: "Engineering",
    pageAccess: ["dashboard", "requirements", "tasks", "reports"],
    memberIds: ["mem-zoe", "mem-noah"],
  },
];

export const mockMembers: Member[] = [
  {
    id: "mem-liam",
    name: "Liam Patel",
    email: "liam@example.com",
    role: "Member",
    teamId: "team-design",
    permissions: {
      read: ["dashboard", "user-stories"],
      write: ["user-stories"],
    },
  },
  {
    id: "mem-zoe",
    name: "Zoe Chen",
    email: "zoe@example.com",
    role: "Member",
    teamId: "team-eng",
    permissions: {
      read: ["dashboard", "requirements", "tasks"],
      write: ["tasks"],
    },
  },
  {
    id: "mem-noah",
    name: "Noah Smith",
    email: "noah@example.com",
    role: "Viewer",
    teamId: "team-eng",
    permissions: {
      read: ["dashboard", "reports"],
      write: [],
    },
  },
  {
    id: "mem-guest",
    name: "Guest User",
    email: "guest@example.com",
    role: "Viewer",
    // No teamId => treated as Guest
    permissions: {
      read: [],
      write: [],
    },
  },
];

export default { mockTeams, mockMembers };
