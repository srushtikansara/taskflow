import TaskForm from "@/components/tasks/TaskForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTaskPage() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/tasks" className="btn-ghost p-2 -ml-2">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">New Task</h1>
          <p className="text-slate-500 text-sm">Fill in the details below to create a task</p>
        </div>
      </div>

      <div className="card p-6">
        <TaskForm />
      </div>
    </div>
  );
}
