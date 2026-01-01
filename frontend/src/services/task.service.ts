"use client";
import { mainApi } from './main-api';
import {getUserById} from './auth.service';
import type { AuthUser } from '@/types/user.type';
import type { TaskUserSelector, TaskItem } from '@/types/task.type';

/**
 * Load task members for a project
 */
export async function loadTasksmembers(projectId: string) {
  console.log('[TaskService] Loading task members for project:', projectId);
  const data = await mainApi.get<any>(`/v1/projects/${projectId}/members`);
  console.log('[TaskService] Members data received:', data);
  const results : TaskUserSelector[] = [];
  for (const member of data) {
    const userRes : AuthUser = await getUserById(member.info_id);
    results.push({
      id: member.user_id,
      first_name: userRes.firstName,
      last_name: userRes.lastName,
      email: userRes.email,
      role: member.role,
      team: member.team,
    });
  }
  console.log('[TaskService] Processed members count:', results.length);
  return results;
}

/**
 * List all tasks for a project
 * GET /api/v1/tasks/{project_id}
 */
export const listTasks = async (projectId: string): Promise<TaskItem[]> => {
  try {
    const response = await mainApi.get<any>(`/v1/tasks/${projectId}`);
    if (!response || response.length === 0) {
      return [];
    }
    
    // Backend returns array of {task, user} objects
    const tasks: TaskItem[] = response.map((item: any) => {
      const task = item.task;
      const user = item.user;
      
      return {
        id: task._id || task.id,
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assignee: user ? {
          id: user.id,
          name: user.name
        } : undefined,
        asign_date: task.asign_date,
        due_date: task.due_date,
        createdAt: task.created_at || new Date().toISOString(),
        updatedAt: task.updated_at || new Date().toISOString(),
      };
    });
    
    return tasks;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new task
 * POST /api/v1/tasks/{project_id}
 */
export const createTask = async (projectId: string, task: Partial<TaskItem>): Promise<TaskItem> => {
  try {
    console.log('[TaskService] Creating task for project:', projectId, '| Task data:', task);
    const payload = {
      _id: task.id,
      title: task.title || "New Task",
      description: task.description || "",
      status: task.status || "backlog",
      priority: task.priority || "medium",
      assignee_id: task.assignee?.id || "",
      asign_date: task.asign_date,
      due_date: task.due_date,
    };
    
    console.log('[TaskService] Payload to send:', payload);
    const created = await mainApi.post<any>(`/v1/tasks/${projectId}`, payload);
    console.log('[TaskService] Task created successfully:', created);
    
    return {
      id: created._id || created.id,
      title: created.title,
      description: created.description || "",
      status: created.status,
      priority: created.priority,
      assignee: created.assignee_id ? {
        id: created.assignee_id,
        name: task.assignee?.name || ""
      } : undefined,
      asign_date: created.asign_date,
      due_date: created.due_date,
      createdAt: created.created_at || new Date().toISOString(),
      updatedAt: created.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to create task:', error);
    throw error;
  }
};

/**
 * Update an existing task
 * PUT /api/v1/tasks/{project_id}/{doc_id}
 */
export const updateTask = async (
  projectId: string, 
  docId: string, 
  patch: Partial<TaskItem>
): Promise<TaskItem> => {
  try {
    console.log('[TaskService] Updating task:', docId, 'in project:', projectId, '| Patch data:', patch);
    const payload = {
      id: docId,
      title: patch.title,
      description: patch.description || "",
      status: patch.status,
      priority: patch.priority,
      assignee_id: patch.assignee?.id || "",
      user : {
          email : "ayman@example.com",
          first_name : "Ayman",
          last_name : "Hassan"
      },
      asign_date: patch.asign_date,
      due_date: patch.due_date,
      updated_at: new Date().toISOString(),
      created_at: patch.createdAt,
    };

    console.log('[TaskService] Payload to send:', payload);
    const updated = await mainApi.put<any>(`/v1/tasks/${projectId}/${docId}`, payload);
    console.log('[TaskService] Task updated successfully:', updated);
    
    return {
      id: updated._id || updated.id,
      title: updated.title,
      description: updated.description || "",
      status: updated.status,
      priority: updated.priority,
      assignee: updated.assignee_id ? {
        id: updated.assignee_id,
        name: patch.assignee?.name || ""
      } : undefined,
      asign_date: updated.asign_date,
      due_date: updated.due_date,
      createdAt: updated.created_at || new Date().toISOString(),
      updatedAt: updated.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to update task:', error);
    throw error;
  }
};

/**
 * Delete a task
 * DELETE /api/v1/tasks/{project_id}/{doc_id}
 */
export const deleteTask = async (projectId: string, docId: string): Promise<boolean> => {
  try {
    console.log('[TaskService] Deleting task:', docId, 'from project:', projectId);
    await mainApi.delete<{ deleted: boolean }>(`/v1/tasks/${projectId}/${docId}`);
    console.log('[TaskService] Task deleted successfully:', docId);
    return true;
  } catch (error) {
    console.error('Failed to delete task:', error);
    throw error;
  }
};

export default { loadTasksmembers, listTasks, createTask, updateTask, deleteTask };
