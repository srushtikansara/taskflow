-- ============================================================
-- TaskFlow - Complete Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         TEXT UNIQUE NOT NULL,
    full_name     TEXT NOT NULL,
    avatar_url    TEXT,
    google_id     TEXT UNIQUE,
    role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    is_active     BOOLEAN NOT NULL DEFAULT true,
    last_login    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 255),
    description   TEXT,
    due_date      TIMESTAMPTZ,
    priority      TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status        TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')),
    creator_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assignee_id   UUID REFERENCES public.users(id) ON DELETE SET NULL,
    tags          TEXT[] DEFAULT '{}',
    is_archived   BOOLEAN NOT NULL DEFAULT false,
    completed_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: task_assignments  (history / audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_assignments (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id       UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    assigned_by   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_to   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    note          TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type          TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_completed', 'task_due_soon', 'task_overdue', 'mention')),
    title         TEXT NOT NULL,
    message       TEXT NOT NULL,
    task_id       UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    is_read       BOOLEAN NOT NULL DEFAULT false,
    email_sent    BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_tasks_creator_id    ON public.tasks(creator_id);
CREATE INDEX idx_tasks_assignee_id   ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_status        ON public.tasks(status);
CREATE INDEX idx_tasks_priority      ON public.tasks(priority);
CREATE INDEX idx_tasks_due_date      ON public.tasks(due_date);
CREATE INDEX idx_tasks_created_at    ON public.tasks(created_at DESC);
CREATE INDEX idx_tasks_is_archived   ON public.tasks(is_archived);

CREATE INDEX idx_notifications_user_id   ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read   ON public.notifications(is_read);
CREATE INDEX idx_notifications_created   ON public.notifications(created_at DESC);

CREATE INDEX idx_assignments_task_id     ON public.task_assignments(task_id);
CREATE INDEX idx_assignments_assigned_to ON public.task_assignments(assigned_to);

-- ============================================================
-- TRIGGERS: auto-update updated_at columns
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TRIGGER: set completed_at when status = 'done'
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'done' AND OLD.status != 'done' THEN
        NEW.completed_at = NOW();
    ELSIF NEW.status != 'done' THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_completed_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.set_task_completed_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;

-- Users: visible to all authenticated users (for assignment dropdowns)
CREATE POLICY "users_select_authenticated"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

-- Tasks: user can see tasks they created OR are assigned to
CREATE POLICY "tasks_select_own"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (
        creator_id  = auth.uid() OR
        assignee_id = auth.uid()
    );

CREATE POLICY "tasks_insert_own"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (creator_id = auth.uid());

CREATE POLICY "tasks_update_own"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (
        creator_id  = auth.uid() OR
        assignee_id = auth.uid()
    );

CREATE POLICY "tasks_delete_own"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (creator_id = auth.uid());

-- Notifications: user sees only their own
CREATE POLICY "notifications_own"
    ON public.notifications FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- Assignments: user sees assignments involving them
CREATE POLICY "assignments_involved"
    ON public.task_assignments FOR SELECT
    TO authenticated
    USING (
        assigned_by = auth.uid() OR
        assigned_to = auth.uid()
    );

CREATE POLICY "assignments_insert"
    ON public.task_assignments FOR INSERT
    TO authenticated
    WITH CHECK (assigned_by = auth.uid());

-- ============================================================
-- VIEWS (helpful for dashboard queries)
-- ============================================================
CREATE OR REPLACE VIEW public.task_summary AS
SELECT
    t.id,
    t.title,
    t.status,
    t.priority,
    t.due_date,
    t.created_at,
    t.completed_at,
    c.full_name AS creator_name,
    c.avatar_url AS creator_avatar,
    a.full_name AS assignee_name,
    a.avatar_url AS assignee_avatar,
    a.email     AS assignee_email
FROM public.tasks t
JOIN public.users c ON t.creator_id = c.id
LEFT JOIN public.users a ON t.assignee_id = a.id
WHERE t.is_archived = false;

-- ============================================================
-- SEED: Insert a demo admin user (update with real values)
-- ============================================================
-- INSERT INTO public.users (email, full_name, role)
-- VALUES ('admin@yourapp.com', 'Admin User', 'admin');
