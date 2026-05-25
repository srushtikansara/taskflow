/**
 * Tasks service – all task-related API calls in one place.
 */
import api from "@/lib/api";
import { Task, TaskFormData, TaskFilters, TasksResponse, TaskStatus } from "@/types";

export const tasksService = {
  async list(filters?: TaskFilters): Promise<TasksResponse> {
    const params = new URLSearchParams();
    if (filters?.status)   params.set("status",   filters.status);
    if (filters?.priority) params.set("priority", filters.priority);
    if (filters?.search)   params.set("search",   filters.search);
    const { data } = await api.get<TasksResponse>("/tasks", { params });
    return data;
  },

  async get(id: string): Promise<Task> {
    const { data } = await api.get<Task>(`/tasks/${id}`);
    return data;
  },

  async create(payload: TaskFormData): Promise<Task> {
    const { data } = await api.post<Task>("/tasks", payload);
    return data;
  },

  async update(id: string, payload: Partial<TaskFormData>): Promise<Task> {
    const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
    return data;
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const { data } = await api.patch<Task>(`/tasks/${id}/status`, { status });
    return data;
  },

  async assign(id: string, assigneeId: string, note?: string): Promise<void> {
    await api.post(`/tasks/${id}/assign`, { assignee_id: assigneeId, note });
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
