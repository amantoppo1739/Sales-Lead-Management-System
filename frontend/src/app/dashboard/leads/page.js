"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLeads, updateLead, exportLeads } from "../../../lib/api-client";
import { LeadCardSkeleton } from "../../../components/loading-skeleton";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Download, RefreshCw } from "lucide-react";
import { cn } from "../../../lib/utils";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const statusColors = {
  new: "bg-secondary text-secondary-foreground",
  qualified: "bg-emerald-900/50 text-emerald-200",
  contacted: "bg-indigo-900/50 text-indigo-200",
  converted: "bg-teal-900/70 text-teal-200",
  lost: "bg-destructive/20 text-destructive",
};

export default function LeadsListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const queryClient = useQueryClient();
  const [changingStatusId, setChangingStatusId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["leads", { search, status }],
    queryFn: () =>
      fetchLeads({
        search: search || undefined,
        status: status || undefined,
        per_page: 50,
      }),
  });

  const statusChangeMutation = useMutation({
    mutationFn: ({ leadId, newStatus }) => updateLead(leadId, { status: newStatus }),
    onSuccess: () => {
      setChangingStatusId(null);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const handleQuickStatusChange = (leadId, newStatus) => {
    statusChangeMutation.mutate({ leadId, newStatus });
  };

  const handleExport = async (format = 'csv') => {
    setIsExporting(true);
    try {
      await exportLeads(
        {
          search: search || undefined,
          status: status || undefined,
        },
        format
      );
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to export leads. Please try again.';
      alert(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // Laravel pagination returns: { data: [...], links: {...}, meta: {...} }
  const leads = data?.data ?? [];

  const grouped = useMemo(() => {
    return leads.reduce((acc, lead) => {
      const key = lead.status ?? "unknown";
      acc[key] = acc[key] ?? [];
      acc[key].push(lead);
      return acc;
    }, {});
  }, [leads]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Pipeline
          </p>
          <h1 className="text-3xl font-semibold">Lead Workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Filter, prioritize, and jump into any lead record.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/leads/board">Board View</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/leads/new">+ New Lead</Link>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by company, owner, or email…"
          className="flex-1"
        />
        <Select value={status || "all"} onValueChange={(value) => setStatus(value === "all" ? "" : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleExport('csv')}
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
                Export CSV
              </>
            )}
          </Button>
          <Button onClick={() => refetch()} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {isFetching && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <LeadCardSkeleton key={index} />
          ))}
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error loading leads</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isFetching && !error && leads.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No leads yet</h3>
              <p className="text-sm text-muted-foreground">
                Import a CSV, connect a source, or create a lead manually to get
                started.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(grouped).length > 0 && (
        <div className="space-y-8">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold capitalize">
                  {group} ({items.length})
                </h2>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {items.length} lead{items.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((lead) => (
                  <Card
                    key={lead.id}
                    className="transition hover:border-primary/50 hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>{lead.lifecycle_stage ?? "Pipeline"}</span>
                        <div className="flex items-center gap-2">
                          {changingStatusId === lead.id ? (
                            <Select
                              value={lead.status}
                              onValueChange={(value) => {
                                if (value !== lead.status) {
                                  handleQuickStatusChange(lead.id, value);
                                } else {
                                  setChangingStatusId(null);
                                }
                              }}
                              onOpenChange={(open) => {
                                if (!open) setChangingStatusId(null);
                              }}
                            >
                              <SelectTrigger className="h-6 w-[100px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="converted">Converted</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              variant="secondary"
                              className={cn(
                                "cursor-pointer uppercase",
                                statusColors[lead.status]
                              )}
                              onClick={(e) => {
                                e.preventDefault();
                                setChangingStatusId(lead.id);
                              }}
                            >
                              {lead.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Link href={`/dashboard/leads/${lead.id}`}>
                        <h3 className="mt-2 text-lg font-semibold hover:text-primary transition-colors">
                          {lead.company_name ??
                            [lead.first_name, lead.last_name]
                              .filter(Boolean)
                              .join(" ")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {lead.email ?? "No email"}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">
                            {lead.source?.name ?? "Unknown source"}
                          </span>
                          <span className="font-semibold">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: lead.currency ?? "INR",
                              maximumFractionDigits: 0,
                            }).format(lead.potential_value ?? 0)}
                          </span>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

