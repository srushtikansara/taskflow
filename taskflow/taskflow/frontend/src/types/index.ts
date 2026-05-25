// ── Core domain types ─────────────────────────────────────────────────────

export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "cancelled";
export type UserRole = "admin" | "member";

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  last_login?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  status: TaskStatus;
  creator_id: string;
  assignee_id: string | null;
  tags: string[];
  is_archived: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  creator?: Pick<User, "id" | "full_name" | "avatar_url" | "email">;
  assignee?: Pick<User, "id" | "full_name" | "avatar_url" | "email"> | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "task_assigned" | "task_completed" | "task_due_soon" | "task_overdue" | "mention";
  title: string;
  message: string;
  task_id: string | null;
  is_read: boolean;
  email_sent: boolean;
  created_at: string;
}

// ── API response shapes ────────────────────────────────────────────────────

export interface TasksResponse {
  tasks: Task[];
  count: number;
}

export interface UsersResponse {
  users: User[];
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

// ── Form input types ───────────────────────────────────────────────────────

export interface TaskFormData {
  title: string;
  description?: string;
  due_date?: string;
  priority: Priority;
  status: TaskStatus;
  assignee_id?: string;
  tags?: string[];
}

// ── Filter / sort state ───────────────────────────────────────────────────

export interface TaskFilters {
  status?: TaskStatus | "";
  priority?: Priority | "";
  search?: string;
}

// ── Dashboard stats ────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  overdue: number;
}

// ── Auth context ───────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
