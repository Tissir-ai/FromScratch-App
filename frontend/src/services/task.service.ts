"use client";
import { mainApi } from './main-api';
import type { TaskUserSelector, TaskItem } from '@/types/task.type';
import { getUserById } from './user.service';
/**
 * Load task members for a project
 */
export async function loadTasksmembers(projectId: string) {
  const data = await mainApi.get<any>(`/v1/projects/${projectId}/members`);
  const results : TaskUserSelector[] = [];

  for (const member of data) {
    results.push({
      id: member.id || member._id,
      name : member.name || '',
      info_id: member.info_id || '',
      email: member.email || '',
      role: member.role,
      team: member.team,
    });
  }
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
          id: user.id  || user._id,
          name: user.name,
          email: user.email,
          info_id: user.info_id,
        } : undefined,
        asign_date: task.asign_date ? new Date(task.asign_date) : undefined,
        due_date: task.due_date ? new Date(task.due_date) : undefined,
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

    const payload: {
      title: string;
      description: string;
      priority: string;
      status: string;
      assignee_id?: string | null; 
      info_id?: string | null;
      email: string | null;
      asign_date: Date | null;
      due_date: Date | null;
    } = {
      title: task.title || "New Task",
      description: task.description || "",
      priority: task.priority || "medium",
      status: task.status || "backlog",
      assignee_id : task.assignee?.id, // Id from the server
      info_id : task.assignee?.info_id, // Use info_id as assignee_id
      email: null,
      asign_date: task.assignee?.id != null ? new Date() : null,
      due_date: task.due_date ?? null,
    };
    if(payload.info_id != null) {
      const userInfo = await getUserById(payload.info_id);
      payload.email = userInfo.email ?? null;
    }
    const created = await mainApi.post<any>(`/v1/tasks/${projectId}`, payload);
    
    return {
      id: created._id || created.id,
      title: created.title,
      description: created.description || "",
      status: created.status,
      priority: created.priority,
      assignee: created.assignee_id ? {
        id: task.assignee?.id || created.assignee_id,
        name: task.assignee?.name || "",
        email: task.assignee?.email,
        info_id: task.assignee?.info_id || created.assignee_id,
      } : undefined,
      asign_date: created.asign_date ? new Date(created.asign_date) : undefined,
      due_date: created.due_date ? new Date(created.due_date) : undefined,
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

    // Send complete TaskStructure data as expected by backend
    const payload :{
      id: string,
      title: string;
      description: string;
      priority: string;
      status: string;
      assignee_id?: string | null; 
      info_id?: string | null;
      email: string | null; 
      asign_date: Date | null;
      due_date: Date | null;
    } = {
      id: docId,
      title: patch.title || "Task",
      description: patch.description || "",
      status: patch.status || "backlog",
      priority: patch.priority || "medium",
      assignee_id: patch.assignee?.id ?? null, // Id from the server, null when unassigned
      email: null,
      info_id: patch.assignee?.info_id ?? null,
      asign_date: patch.assignee ? (patch.asign_date || null) : null, // Clear asign_date when unassigned
      due_date: patch.due_date || null,
    };
    if(payload.info_id != null) {
      const userInfo = await getUserById(payload.info_id);
      payload.email = userInfo.email ?? null;
    }
    const updated = await mainApi.put<any>(`/v1/tasks/${projectId}/${docId}`, payload);
    // Remove one day from due_date if present
    const dueDate = updated.due_date ? new Date(updated.due_date) : null;
    if (dueDate) {
      dueDate.setDate(dueDate.getDate() - 1);
    }

    return {
      id: updated._id || updated.id,
      title: updated.title,
      description: updated.description || "",
      status: updated.status,
      priority: updated.priority,
      assignee: updated.assignee_id ? {
      id: updated.assignee_id,
      name: patch.assignee?.name || "",
      email: patch.assignee?.email || "",
      info_id: patch.assignee?.info_id,
      } : undefined,
      asign_date: updated.asign_date ? new Date(updated.asign_date) : undefined,
      due_date: dueDate ? dueDate : undefined,
      createdAt: updated.created_at || new Date().toISOString(),
      updatedAt: updated.updated_at || new Date().toISOString()
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
