import { formatDateTime } from "../lib/date-utils";
import { Card, CardContent } from "./ui/card";
import { cn } from "../lib/utils";

export function LeadTimeline({ items = [] }) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No activity yet. Notes, assignments, and imports will show up here.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {items.map((item) => (
        <li key={`${item.type}-${item.id}-${item.timestamp}`}>
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <span
                  className={cn(
                    "mt-1 h-8 w-8 flex-shrink-0 rounded-full text-center text-lg leading-8",
                    iconStyles[item.type] ?? iconStyles.default
                  )}
                >
                  {icons[item.type] ?? icons.default}
                </span>
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold">{item.title}</span>
                    {item.actor && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{item.actor}</span>
                      </>
                    )}
                    <span className="text-muted-foreground">•</span>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {formatDateTime(item.timestamp)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm">{item.description}</p>
                  )}
                  {item.meta && (
                    <p className="text-xs text-muted-foreground">{item.meta}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ol>
  );
}

const icons = {
  note: "✏️",
  status: "⬆️",
  activity: "⚡",
  default: "•",
};

const iconStyles = {
  note: "bg-amber-500/10 text-amber-300 border border-amber-400/30",
  status: "bg-sky-500/10 text-sky-300 border border-sky-400/30",
  activity: "bg-violet-500/10 text-violet-300 border border-violet-400/30",
  default: "bg-slate-800 text-slate-200 border border-slate-700",
};

