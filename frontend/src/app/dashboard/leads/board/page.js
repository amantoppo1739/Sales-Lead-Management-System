"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLeads, updateLead, exportLeads } from "../../../../lib/api-client";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Download, RefreshCw, Plus, List } from "lucide-react";
import { cn } from "../../../../lib/utils";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const statusColumns = [
  { id: "new", label: "New", color: "bg-slate-800" },
  { id: "qualified", label: "Qualified", color: "bg-emerald-900/50" },
  { id: "contacted", label: "Contacted", color: "bg-indigo-900/50" },
  { id: "converted", label: "Converted", color: "bg-teal-900/70" },
  { id: "lost", label: "Lost", color: "bg-rose-900/60" },
];

function LeadCard({ lead, isDragging }) {
  return (
    <Link href={`/dashboard/leads/${lead.id}`} className="block">
      <Card className={cn(
        "transition-all hover:border-primary/50 hover:shadow-md",
        isDragging && "opacity-50"
      )}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate">
                {lead.company_name ??
                  [lead.first_name, lead.last_name].filter(Boolean).join(" ")}
              </h4>
              {lead.email && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{lead.email}</p>
              )}
            </div>
          </div>
          {lead.potential_value && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs font-medium">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: lead.currency ?? "INR",
                  maximumFractionDigits: 0,
                }).format(lead.potential_value)}
              </p>
            </div>
          )}
          {lead.owner && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs text-muted-foreground">
                {lead.owner.name}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function SortableLeadCard({ lead }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard lead={lead} isDragging={isDragging} />
    </div>
  );
}

function Column({ id, label, color, leads }) {
  const droppableId = `column-${id}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "min-w-[320px] max-w-[320px] flex-shrink-0 transition-colors",
        isOver && "border-primary bg-primary/10"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide">
            {label}
          </h3>
          <Badge variant="secondary">{leads.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 min-h-[200px]">
            {leads.map((lead) => (
              <SortableLeadCard key={lead.id} lead={lead} />
            ))}
            {leads.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Drop leads here
              </div>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}

export default function KanbanBoardPage() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data, isFetching } = useQuery({
    queryKey: ["leads", "board"],
    queryFn: () => fetchLeads({ per_page: 100 }),
    enabled: Boolean(token),
  });

  const statusChangeMutation = useMutation({
    mutationFn: ({ leadId, newStatus }) => updateLead(leadId, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const leads = data?.data ?? [];

  const leadsByStatus = useMemo(() => {
    const grouped = {};
    statusColumns.forEach((col) => {
      grouped[col.id] = leads.filter((lead) => lead.status === col.id);
    });
    return grouped;
  }, [leads]);

  const activeLead = useMemo(() => {
    if (!activeId) return null;
    return leads.find((lead) => lead.id === activeId);
  }, [activeId, leads]);

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const lead = leads.find((l) => l.id === active.id);
    if (!lead) return;

    // Check if dropped on a column (status change)
    const columnMatch = over.id?.toString().startsWith("column-")
      ? over.id.toString().replace("column-", "")
      : null;
    const targetStatus = statusColumns.find((col) => col.id === (columnMatch || over.id));
    if (targetStatus && lead.status !== targetStatus.id) {
      statusChangeMutation.mutate({
        leadId: lead.id,
        newStatus: targetStatus.id,
      });
      return;
    }

    // Check if dropped on another lead (reorder within same column)
    const targetLead = leads.find((l) => l.id === over.id);
    if (targetLead && lead.status === targetLead.status) {
      // Reorder within the same column
      const status = lead.status;
      const statusLeads = [...leadsByStatus[status]];
      const oldIndex = statusLeads.findIndex((l) => l.id === active.id);
      const newIndex = statusLeads.findIndex((l) => l.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(statusLeads, oldIndex, newIndex);
        // Note: Backend doesn't support reordering, so this is just visual
        // In a real implementation, you'd need a `position` or `order` field
      }
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">Checking authentication…</p>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Pipeline
          </p>
          <h1 className="text-3xl font-semibold">Kanban Board</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop leads to change their status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={async () => {
              setIsExporting(true);
              try {
                await exportLeads({}, 'csv');
              } catch (error) {
                console.error('Export failed:', error);
                alert('Failed to export leads. Please try again.');
              } finally {
                setIsExporting(false);
              }
            }}
            disabled={isExporting}
            variant="outline"
            size="sm"
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/leads">
              <List className="h-4 w-4 mr-2" />
              List View
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/leads/new">
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Link>
          </Button>
        </div>
      </div>

      {isFetching && !data ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusColumns.map((col) => (
            <Card key={col.id} className="min-w-[320px] max-w-[320px] flex-shrink-0 animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
        <div className="grid gap-4 pb-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {statusColumns.map((col) => (
              <Column
                key={col.id}
                id={col.id}
                label={col.label}
                color={col.color}
                leads={leadsByStatus[col.id] || []}
              />
            ))}
          </div>
          <DragOverlay>
            {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {statusChangeMutation.isPending && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-lg">
          Updating status...
        </div>
      )}
    </section>
  );
}

