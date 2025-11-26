"use client";

import { useEffect } from "react";
import { useRealtimeStore } from "../store/realtime-store";

const ACTION_LABELS = {
  "lead.created": "Lead Created",
  "lead.updated": "Lead Updated",
  "lead.deleted": "Lead Archived",
  "lead.assigned": "Lead Assigned",
  "note.created": "New Note",
};

export function RealtimeToasts() {
  const events = useRealtimeStore((state) => state.events);
  const removeEvent = useRealtimeStore((state) => state.removeEvent);

  useEffect(() => {
    if (events.length === 0) {
      return;
    }

    const timers = events.map((event) =>
      setTimeout(() => {
        removeEvent(event.uuid);
      }, 6000),
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [events, removeEvent]);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2">
      {events.map((event) => (
        <div
          key={event.uuid}
          className="pointer-events-auto w-72 rounded-lg border border-slate-800 bg-slate-900/90 p-4 shadow-lg backdrop-blur"
        >
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {ACTION_LABELS[event.activity?.action] ?? event.activity?.action ?? "Activity"}
          </p>
          <p className="mt-1 text-sm text-slate-200">
            {event.lead?.name ?? "Lead"} • {event.lead?.status ?? "status updated"}
          </p>
          <p className="text-xs text-slate-500">
            {event.activity?.actor?.name ? `By ${event.activity.actor.name}` : "System"}
          </p>
          <button
            className="mt-3 text-xs text-blue-400 hover:text-blue-200"
            onClick={() => removeEvent(event.uuid)}
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}

