import { TaskItem, UserRef } from "./types";

export const mockUsers: UserRef[] = [
  { id: "u1", name: "Ayman Gassi", email: "ayman@example.com" }
  
];

function uid() { return Math.random().toString(36).slice(2, 9); }

export const sampleTasks: TaskItem[] = [
  {
    id: uid(),
    title: "Design landing hero",
    description: "Create hero section draft with headline, CTA, and illustration.",
    status: "backlog",
    priority: "medium",
    assignee: mockUsers[0],
    tags: ["design", "landing"],
    points: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uid(),
    title: "Implement auth page",
    description: "Build sign-in and sign-up forms using shadcn/ui components.",
    status: "todo",
    priority: "high",
    assignee: mockUsers[1],
    tags: ["frontend", "auth"],
    points: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uid(),
    title: "API health endpoint",
    description: "Confirm FastAPI health endpoint returns OK and wire to UI.",
    status: "in-progress",
    priority: "low",
    assignee: mockUsers[2],
    tags: ["backend"],
    points: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uid(),
    title: "Write unit tests for board",
    description: "Cover drag and drop reducers and state transitions.",
    status: "review",
    priority: "medium",
    assignee: mockUsers[3],
    tags: ["testing"],
    points: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uid(),
    title: "Deploy preview",
    description: "Create Vercel preview and check performance vitals.",
    status: "done",
    priority: "low",
    assignee: mockUsers[0],
    tags: ["devops"],
    points: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
