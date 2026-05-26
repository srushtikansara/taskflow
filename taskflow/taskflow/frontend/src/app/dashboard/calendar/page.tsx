"use client";
import { useState } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, eachDayOfInterval, isSameMonth,
  isSameDay, isToday, parseISO,
} from "date-fns";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types";
import { priorityConfig } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const { tasks, isLoading } = useTasks();

  const monthStart = startOfMonth(current);
  const monthEnd   = endOfMonth(current);
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd     = endOfWeek(monthEnd,     { weekStartsOn: 1 });
  const days       = eachDayOfInterval({ start: calStart, end: calEnd });

  const getTasksForDay = (day: Date): Task[] =>
    tasks.filter((t) => {
      if (!t.due_date) return false;
      try { return isSameDay(parseISO(t.due_date), day); }
      catch { return false; }
    });

  const selectedTasks = selected ? getTasksForDay(selected) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3
                      animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            Calendar
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            View tasks by due date
          </p>
        </div>
        <Link href="/dashboard/tasks/new" className="btn-primary px-4 py-2.5 text-sm self-start">
          <Plus size={16} /> New Task
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Calendar grid */}
        <div className="lg:col-span-2 card overflow-hidden animate-fade-in-up delay-100">
          {/* Month nav */}
          <div className="flex items-center justify-between p-4 border-b"
               style={{ borderColor: "var(--border)" }}>
            <button onClick={() => setCurrent(subMonths(current, 1))}
                    className="btn-ghost p-2">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-bold text-lg" style={{ color: "var(--text)" }}>
              {format(current, "MMMM yyyy")}
            </h2>
            <button onClick={() => setCurrent(addMonths(current, 1))}
                    className="btn-ghost p-2">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--border)" }}>
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
              <div key={d}
                   className="py-2 text-center text-xs font-semibold uppercase tracking-wider"
                   style={{ color: "var(--text-muted)" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          {isLoading ? (
            <div className="grid grid-cols-7">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-20 border-b border-r p-1"
                     style={{ borderColor: "var(--border)" }}>
                  <div className="skeleton h-5 w-5 rounded-full mb-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const dayTasks   = getTasksForDay(day);
                const isThisMonth = isSameMonth(day, current);
                const isSelected  = selected && isSameDay(day, selected);
                const isTodayDay  = isToday(day);

                return (
                  <div
                    key={day.toString()}
                    onClick={() => setSelected(isSameDay(day, selected ?? new Date(0)) ? null : day)}
                    className={`min-h-[80px] p-1.5 border-b border-r cursor-pointer
                                transition-colors duration-100
                                ${isSelected
                                  ? "bg-blue-50 dark:bg-blue-900/20"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                }`}
                    style={{ borderColor: "var(--border)" }}
                  >
                    {/* Day number */}
                    <div className={`w-7 h-7 flex items-center justify-center
                                     rounded-full text-sm font-medium mb-1
                                     ${isTodayDay
                                       ? "bg-blue-600 text-white"
                                       : isSelected
                                         ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                                         : ""
                                     }`}
                         style={!isTodayDay && !isSelected
                                ? { color: isThisMonth ? "var(--text)" : "var(--text-muted)" }
                                : {}}>
                      {format(day, "d")}
                    </div>

                    {/* Task dots */}
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 2).map((t) => {
                        const pc = priorityConfig[t.priority];
                        return (
                          <div key={t.id}
                               className={`text-[10px] px-1.5 py-0.5 rounded truncate
                                           ${pc.bg} ${pc.color} font-medium leading-tight`}>
                            {t.title}
                          </div>
                        );
                      })}
                      {dayTasks.length > 2 && (
                        <div className="text-[10px] px-1.5"
                             style={{ color: "var(--text-muted)" }}>
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected day panel */}
        <div className="card p-4 animate-fade-in-up delay-200 self-start">
          <h3 className="font-semibold mb-3 text-sm"
              style={{ color: "var(--text)" }}>
            {selected ? format(selected, "EEEE, MMM d") : "Select a day"}
          </h3>

          {!selected ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Click on a day to see its tasks
            </p>
          ) : selectedTasks.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No tasks due this day
              </p>
              <Link href="/dashboard/tasks/new"
                    className="btn-primary px-3 py-1.5 text-xs mt-3 inline-flex">
                Add task
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map((task) => {
                const pc = priorityConfig[task.priority];
                return (
                  <Link key={task.id} href={`/dashboard/tasks/${task.id}`}
                        className="block p-3 rounded-lg border transition-colors
                                   hover:border-blue-300 dark:hover:border-blue-700"
                        style={{ borderColor: "var(--border)",
                                 background: "var(--surface-2)" }}>
                    <div className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${pc.dot}`} />
                      <div>
                        <p className={`text-sm font-medium
                                       ${task.status === "done" ? "line-through opacity-50" : ""}`}
                           style={{ color: "var(--text)" }}>
                          {task.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {pc.label} priority
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4 animate-fade-in-up delay-300">
        <p className="text-xs font-semibold mb-3 uppercase tracking-wider"
           style={{ color: "var(--text-muted)" }}>Priority Legend</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(priorityConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {cfg.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
