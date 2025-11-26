"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "../../lib/api-client";
import { useAuthStore } from "../../store/auth-store";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KpiCard } from "../../components/kpi-card";
import { LeadCardSkeleton, LoadingSkeleton } from "../../components/loading-skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

const statusColors = {
  new: "bg-slate-50 border-slate-200",
  qualified: "bg-emerald-50 border-emerald-200",
  contacted: "bg-indigo-50 border-indigo-200",
  converted: "bg-teal-50 border-teal-200",
  lost: "bg-rose-50 border-rose-200",
};

export default function DashboardPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/");
    }
  }, [token, router]);

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["leads", "dashboard"],
    queryFn: () => fetchLeads({ per_page: 50 }),
    enabled: Boolean(token),
  });

  const leads = data?.data ?? [];

  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const converted = leads.filter((lead) => lead.status === "converted").length;
    const activePipeline = leads.filter(
      (lead) => !["converted", "lost"].includes(lead.status),
    ).length;
    const value = leads.reduce(
      (sum, lead) => sum + Number(lead.potential_value ?? 0),
      0,
    );
    const currency = leads[0]?.currency ?? "INR";
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });

    return [
      {
        label: "Pipeline Value",
        value: formatter.format(value),
        helper: `${totalLeads} total leads`,
      },
      {
        label: "Active Pipeline",
        value: activePipeline,
        helper: `${totalLeads - converted} in progress`,
      },
      {
        label: "Conversion Rate",
        value: totalLeads
          ? `${Math.round((converted / totalLeads) * 100)}%`
          : "0%",
        helper: `${converted} converted`,
      },
    ];
  }, [leads]);

  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">
        Checking authentication…
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {isFetching && !data ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 animate-pulse"
              >
                <div className="h-4 bg-slate-800 rounded w-24 mb-2"></div>
                <div className="h-8 bg-slate-800 rounded w-32 mb-1"></div>
                <div className="h-3 bg-slate-800 rounded w-40"></div>
              </div>
            ))}
          </>
        ) : (
          stats.map((stat) => (
            <KpiCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              helper={stat.helper}
            />
          ))
        )}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pipeline Snapshot</h2>
        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          variant="outline"
          size="sm"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Failed to load leads</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {isFetching && !data && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <LeadCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isFetching && !error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leads.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <h3 className="mb-2 text-lg font-semibold">
                    No leads yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get started by importing leads or creating your first lead manually.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            leads.map((lead) => (
              <Link
                key={lead.id}
                href={`/dashboard/leads/${lead.id}`}
                className="block"
              >
                <Card className={cn(
                  "transition-all hover:border-primary/50 hover:shadow-md cursor-pointer",
                  statusColors[lead.status]
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                      <Badge variant="secondary" className="uppercase">
                        {lead.status}
                      </Badge>
                      <span>{lead.lifecycle_stage ?? "Pipeline"}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold">
                      {lead.company_name ?? `${lead.first_name} ${lead.last_name}`}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lead.email ?? "No email"}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
                      <span className="text-muted-foreground">
                        {lead.owner?.name ?? "Unassigned"}
                      </span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: lead.currency ?? "INR",
                          maximumFractionDigits: 0,
                        }).format(lead.potential_value ?? 0)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </section>
  );
}

