import api from "@/lib/api";
import { User, UsersResponse, NotificationsResponse } from "@/types";

export const usersService = {
  async list(search?: string): Promise<User[]> {
    const params = search ? { search } : {};
    const { data } = await api.get<UsersResponse>("/users", { params });
    return data.users;
  },

  async get(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },
};

export const notificationsService = {
  async list(): Promise<NotificationsResponse> {
    const { data } = await api.get<NotificationsResponse>("/notifications");
    return data;
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}`);
  },

  async markAllRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
