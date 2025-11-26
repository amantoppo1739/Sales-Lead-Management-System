export function KpiCard({ label, value, helper }) {
  return (
    <article className="rounded-2xl border border-slate-900 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-4 shadow-lg shadow-slate-950/50">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {helper && <p className="text-sm text-slate-400">{helper}</p>}
    </article>
  );
}

