export function LoadingSkeleton({ className = "" }) {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      <div className="h-4 bg-slate-800 rounded w-3/4"></div>
      <div className="h-4 bg-slate-800 rounded w-1/2"></div>
      <div className="h-4 bg-slate-800 rounded w-5/6"></div>
    </div>
  );
}

export function LeadCardSkeleton() {
  return (
    <div className="rounded border border-slate-900 bg-slate-900/50 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 bg-slate-800 rounded w-16"></div>
        <div className="h-3 bg-slate-800 rounded w-20"></div>
      </div>
      <div className="h-5 bg-slate-800 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-800 rounded w-1/2 mb-4"></div>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-800 rounded w-24"></div>
        <div className="h-4 bg-slate-800 rounded w-20"></div>
      </div>
    </div>
  );
}

