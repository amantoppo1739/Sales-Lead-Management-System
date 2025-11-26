"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser, fetchReferenceData, fetchTeamUserMetrics } from "../../../lib/api-client";
import {
  BarChart,
  Bar,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";

export default function ReportsPage() {
  const [from, setFrom] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [teamId, setTeamId] = useState(null);

  const { data: meData } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => fetchCurrentUser(),
  });

  const currentUser = meData?.data;
  const role = currentUser?.role;

  const { data: referenceData } = useQuery({
    queryKey: ["reference-data"],
    queryFn: () => fetchReferenceData(),
  });

  const teams = referenceData?.data?.teams ?? [];

  // Manager auto-loads their own team; admin can pick any team
  const effectiveTeamId = useMemo(() => {
    if (teamId) return Number(teamId);
    if (role === "manager" && currentUser?.team_id) {
      return currentUser.team_id;
    }
    return teams[0]?.id ?? null;
  }, [teamId, role, currentUser, teams]);

  const { data: metricsData, isFetching, error: metricsError } = useQuery({
    queryKey: ["metrics", "team-users", effectiveTeamId, from, to],
    queryFn: () =>
      fetchTeamUserMetrics({
        teamId: effectiveTeamId,
        from,
        to,
      }),
    enabled: !!effectiveTeamId && !!from && !!to,
  });

  const rows = metricsData?.data?.users ?? [];
  const months = metricsData?.data?.months ?? [];

  const perRepBarData = useMemo(
    () =>
      rows.map((row) => ({
        name: row.user.name,
        created: row.leads.created,
        owned: row.leads.owned,
        notes: row.activities.notes,
        activities: row.activities.activities,
      })),
    [rows],
  );

  const monthlyRevenueSeries = useMemo(() => {
    if (!months.length || !rows.length) return [];

    return months.map((month) => {
      const entry = { month };
      rows.forEach((row) => {
        const key = row.user.name;
        const point = row.revenue.series.find((item) => item.month === month);
        entry[key] = point?.revenue ?? 0;
      });
      return entry;
    });
  }, [months, rows]);

  const statusStackData = useMemo(
    () =>
      rows.map((row) => ({
        name: row.user.name,
        new: row.statuses.new ?? 0,
        qualified: row.statuses.qualified ?? 0,
        contacted: row.statuses.contacted ?? 0,
        converted: row.statuses.converted ?? 0,
        lost: row.statuses.lost ?? 0,
      })),
    [rows],
  );

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Intelligence
          </p>
          <h1 className="text-3xl font-semibold">
            Team Performance
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Compare how each sales rep is performing across leads, pipeline status, revenue, and activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {(role === "admin" || role === "manager") && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Team</span>
              <Select
                value={effectiveTeamId ? String(effectiveTeamId) : ""}
                onValueChange={(value) => setTeamId(value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={String(team.id)}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">From</span>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">To</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-36"
            />
          </div>
        </div>
      </header>

      {metricsError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <p className="text-sm font-medium text-destructive">Failed to load team metrics</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {metricsError?.response?.data?.message || metricsError?.message || "An error occurred"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Per-Rep Summary</CardTitle>
            <span className="text-xs text-muted-foreground">
              Leads created, owned, and activities within the selected period
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-2 pr-4 text-left font-medium">Rep</th>
                  <th className="py-2 px-4 text-right font-medium">Leads Created</th>
                  <th className="py-2 px-4 text-right font-medium">Leads Owned</th>
                  <th className="py-2 px-4 text-right font-medium">New</th>
                  <th className="py-2 px-4 text-right font-medium">Qualified</th>
                  <th className="py-2 px-4 text-right font-medium">Contacted</th>
                  <th className="py-2 px-4 text-right font-medium">Converted</th>
                  <th className="py-2 px-4 text-right font-medium">Lost</th>
                  <th className="py-2 px-4 text-right font-medium">Notes</th>
                  <th className="py-2 px-4 text-right font-medium">Activities</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-sm text-muted-foreground">
                      {isFetching ? "Loading metrics…" : "No data for this period."}
                    </td>
                  </tr>
                )}
                {rows.map((row) => (
                  <tr key={row.user.id} className="border-b border-border/60">
                    <td className="py-2 pr-4 text-sm font-medium">{row.user.name}</td>
                    <td className="py-2 px-4 text-right tabular-nums">{row.leads.created}</td>
                    <td className="py-2 px-4 text-right tabular-nums">{row.leads.owned}</td>
                    <td className="py-2 px-4 text-right tabular-nums">{row.statuses.new ?? 0}</td>
                    <td className="py-2 px-4 text-right tabular-nums">{row.statuses.qualified ?? 0}</td>
                    <td className="py-2 px-4 text-right tabular-nums">{row.statuses.contacted ?? 0}</td>
                    <td className="py-2 px-4 text-right tabular-nums">{row.statuses.converted ?? 0}</td>
                    <td className="py-2 px-4 text-right tabular-nums">{row.statuses.lost ?? 0}</td>
                    <td className="py-2 px-4 text-right tabular-nums">{row.activities.notes}</td>
                    <td className="py-2 px-4 text-right tabular-nums">{row.activities.activities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Leads & Activity per Rep</CardTitle>
              <span className="text-xs text-muted-foreground">Created, owned, notes, activities</span>
            </div>
          </CardHeader>
          <CardContent>
            {perRepBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={perRepBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="created" stackId="leads" fill="#3b82f6" name="Leads Created" />
                  <Bar dataKey="owned" stackId="leads" fill="#22c55e" name="Leads Owned" />
                  <Bar dataKey="notes" stackId="activity" fill="#a855f7" name="Notes" />
                  <Bar dataKey="activities" stackId="activity" fill="#f97316" name="Activities" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  {isFetching ? "Loading chart…" : "No per-rep data for this period."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Status Breakdown per Rep</CardTitle>
              <span className="text-xs text-muted-foreground">New → Qualified → Contacted → Converted → Lost</span>
            </div>
          </CardHeader>
          <CardContent>
            {statusStackData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={statusStackData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="new" stackId="status" fill="#38bdf8" name="New" />
                  <Bar dataKey="qualified" stackId="status" fill="#22c55e" name="Qualified" />
                  <Bar dataKey="contacted" stackId="status" fill="#f97316" name="Contacted" />
                  <Bar dataKey="converted" stackId="status" fill="#a855f7" name="Converted" />
                  <Bar dataKey="lost" stackId="status" fill="#ef4444" name="Lost" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  {isFetching ? "Loading chart…" : "No status data for this period."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monthly Revenue per Rep</CardTitle>
            <span className="text-xs text-muted-foreground">
              Sum of converted potential value, grouped by month
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {monthlyRevenueSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthlyRevenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      notation: "compact",
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                  formatter={(value) =>
                    new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                />
                <Legend />
                {rows.map((row, index) => (
                  <Line
                    key={row.user.id}
                    type="monotone"
                    dataKey={row.user.name}
                    stroke={["#38bdf8", "#a855f7", "#22c55e", "#f97316", "#facc15", "#ef4444"][index % 6]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {isFetching ? "Loading revenue trends…" : "No converted revenue in this period."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}