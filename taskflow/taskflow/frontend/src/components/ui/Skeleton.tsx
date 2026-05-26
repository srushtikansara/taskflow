
export function TaskCardSkeleton() {
  return (
    <div className="card p-5 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-16 rounded-full" />
        <div className="skeleton h-4 w-20 rounded-full" />
      </div>
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
      <div className="flex items-center justify-between pt-1">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton w-6 h-6 rounded-full" />
      </div>
    </div>
  );
}

export function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="skeleton w-5 h-5 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-48 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
      <div className="skeleton h-5 w-16 rounded-full" />
      <div className="skeleton h-5 w-20 rounded-full hidden sm:block" />
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="skeleton w-9 h-9 rounded-lg mb-3" />
      <div className="skeleton h-7 w-12 mb-1 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="animate-pulse space-y-2 mb-6">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="skeleton h-4 w-64 rounded" />
    </div>
  );
}

export function KanbanCardSkeleton() {
  return (
    <div className="card p-3 space-y-2 animate-pulse">
      <div className="skeleton h-4 w-14 rounded-full" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-3 w-3/4 rounded" />
      <div className="flex justify-between pt-1">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton w-5 h-5 rounded-full" />
      </div>
    </div>
  );
}


