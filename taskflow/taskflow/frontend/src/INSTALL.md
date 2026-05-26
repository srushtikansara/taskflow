# TaskFlow Frontend Updates — Installation Guide

## Files to copy and where they go

| File in this package | Copy to in your project |
|---------------------|------------------------|
| pages/login-page.tsx | src/app/auth/login/page.tsx |
| pages/kanban-page.tsx | src/app/dashboard/kanban/page.tsx (NEW folder) |
| pages/calendar-page.tsx | src/app/dashboard/calendar/page.tsx (NEW folder) |
| pages/analytics-page.tsx | src/app/dashboard/analytics/page.tsx (NEW folder) |
| pages/profile-page.tsx | src/app/dashboard/profile/page.tsx (NEW folder) |
| pages/dashboard-layout.tsx | src/app/dashboard/layout.tsx (REPLACE) |
| components/ui-components.tsx | Split into two files (see below) |

---

## Step 1 — Create new folders

In your frontend/src/app/dashboard/ folder create these folders:
- kanban/
- calendar/
- analytics/
- profile/

---

## Step 2 — Split ui-components.tsx into two files

The ui-components.tsx file contains two components.
Split it into:

### src/components/ui/Skeleton.tsx
Copy everything from the top until the SearchHighlight section.

### src/components/ui/SearchHighlight.tsx
Copy just the SearchHighlight part at the bottom.

---

## Step 3 — Install date-fns (if not already installed)

npm install date-fns

---

## Step 4 — Update tasks list page to use SearchHighlight

In src/app/dashboard/tasks/page.tsx replace the task title display:

FIND:
  {task.title}

REPLACE with:
  import { SearchHighlight } from "@/components/ui/SearchHighlight";
  
  <SearchHighlight text={task.title} query={search} />

---

## What each file adds

1. login-page.tsx     — Animated particle background, branding hero, glass card
2. kanban-page.tsx    — Drag & drop Kanban board with 4 columns
3. calendar-page.tsx  — Monthly calendar with task due dates
4. analytics-page.tsx — Charts, KPIs, completion rings, weekly bar chart
5. profile-page.tsx   — User profile with stats and account info
6. dashboard-layout   — Task count badges on sidebar, new nav sections
7. ui-components      — Skeleton loaders + search text highlighting
