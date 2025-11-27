"use client";

import { use } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLeadNote, fetchLead, updateLead, fetchReferenceData } from "../../../../lib/api-client";
import { useAuthStore } from "../../../../store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LeadTimeline } from "../../../../components/lead-timeline";
import { getEcho } from "../../../../lib/echo-client";
import { formatDate } from "../../../../lib/date-utils";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { ArrowLeft, Edit, X, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "../../../../lib/utils";

const statusColors = {
  new: "bg-secondary text-secondary-foreground",
  qualified: "bg-emerald-900/50 text-emerald-200",
  contacted: "bg-indigo-900/50 text-indigo-200",
  converted: "bg-teal-900/70 text-teal-200",
  lost: "bg-destructive/20 text-destructive",
  follow_up: "bg-sky-900/60 text-sky-200",
};

export default function LeadDetailPage({ params }) {
  // Next.js 15+ requires unwrapping params Promise
  const resolvedParams = use(params);
  const leadId = resolvedParams.id;
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [noteBody, setNoteBody] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    company_name: "",
    email: "",
    phone: "",
    status: "new",
    source_id: "",
    team_id: "",
    potential_value: "",
    currency: "INR",
    territory_code: "",
    expected_close_date: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusComment, setStatusComment] = useState("");

  useEffect(() => {
    if (!token) {
      router.replace("/");
    }
  }, [token, router]);

  useEffect(() => {
    if (!token || !leadId) {
      return;
    }

    const echo = getEcho(token);

    if (!echo) {
      return;
    }

    const channel = echo.private(`leads.${leadId}`);

    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    };

    channel.listen(".ActivityLogged", handler).listen(".LeadUpdated", handler).listen(".LeadNoteAdded", handler);

    return () => {
      channel.stopListening(".ActivityLogged", handler);
      channel.stopListening(".LeadUpdated", handler);
      channel.stopListening(".LeadNoteAdded", handler);
      channel.unsubscribe();
    };
  }, [token, leadId, queryClient]);

  const { data, isFetching, error } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => fetchLead(leadId),
    enabled: Boolean(token && leadId),
  });

  const { data: referenceData } = useQuery({
    queryKey: ["reference-data"],
    queryFn: fetchReferenceData,
    enabled: Boolean(token && isEditing),
  });

  const noteMutation = useMutation({
    mutationFn: (payload) => createLeadNote(leadId, payload),
    onSuccess: () => {
      setNoteBody("");
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => updateLead(leadId, payload),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => {
      console.error("Lead update error:", error);
      if (error.response?.status === 422) {
        setEditErrors(error.response.data?.errors || {});
      } else {
        // Show general error message
        setEditErrors({ _general: [error.response?.data?.message || error.message || "Failed to update lead. Please try again."] });
      }
    },
  });

  const statusChangeMutation = useMutation({
    mutationFn: (newStatus) => updateLead(leadId, { 
      status: newStatus,
      status_comment: statusComment || null,
    }),
    onSuccess: () => {
      setIsChangingStatus(false);
      setStatusComment("");
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const handleStatusChange = (newStatus) => {
    if (newStatus === lead.status) return;
    statusChangeMutation.mutate(newStatus);
  };

  const lead = data?.data;

  // Initialize edit form when entering edit mode
  useEffect(() => {
    if (isEditing && lead) {
      setEditFormData({
        first_name: lead.first_name || "",
        last_name: lead.last_name || "",
        company_name: lead.company_name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        status: lead.status || "new",
        source_id: lead.source?.id || "",
        team_id: lead.team?.id || "",
        potential_value: lead.potential_value || "",
        currency: lead.currency || "INR",
        territory_code: lead.territory_code || "",
        expected_close_date: lead.expected_close_date || "",
      });
      setEditErrors({});
    }
  }, [isEditing, lead]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setEditErrors({});

    // Build payload with proper type conversions
    const payload = {};

    // String fields - send trimmed values or null
    payload.first_name = editFormData.first_name?.trim() || null;
    payload.last_name = editFormData.last_name?.trim() || null;
    payload.company_name = editFormData.company_name?.trim() || null;
    payload.email = editFormData.email?.trim() || null;
    payload.phone = editFormData.phone?.trim() || null;
    payload.territory_code = editFormData.territory_code?.trim() || null;

    // Status - always required
    payload.status = editFormData.status || "new";

    // Currency - must be exactly 3 characters
    payload.currency = (editFormData.currency && editFormData.currency.length === 3) ? editFormData.currency : "INR";

    // Numeric fields
    if (editFormData.potential_value && editFormData.potential_value !== "") {
      const parsed = parseFloat(editFormData.potential_value);
      if (!isNaN(parsed) && parsed >= 0) {
        payload.potential_value = parsed;
      } else {
        payload.potential_value = null;
      }
    } else {
      payload.potential_value = null;
    }

    // ID fields - must be integers or null
    if (editFormData.source_id && editFormData.source_id !== "" && editFormData.source_id !== "none") {
      const parsed = parseInt(editFormData.source_id, 10);
      payload.source_id = !isNaN(parsed) ? parsed : null;
    } else {
      payload.source_id = null;
    }

    if (editFormData.team_id && editFormData.team_id !== "" && editFormData.team_id !== "none") {
      const parsed = parseInt(editFormData.team_id, 10);
      payload.team_id = !isNaN(parsed) ? parsed : null;
    } else {
      payload.team_id = null;
    }

    // Date field
    payload.expected_close_date = (editFormData.expected_close_date && editFormData.expected_close_date !== "") 
      ? editFormData.expected_close_date 
      : null;

    console.log("Submitting payload:", payload);
    updateMutation.mutate(payload);
  };

  const timelineItems = useMemo(() => {
    if (!lead) return [];

    const events = [];

    (lead.status_history ?? []).forEach((history) => {
      events.push({
        id: history.id,
        type: "status",
        timestamp: history.changed_at,
        title: `Status changed to ${history.to_status}`,
        description: history.comment,
        actor: history.actor?.name ?? "System",
        meta: history.from_status
          ? `From ${history.from_status} to ${history.to_status}`
          : undefined,
      });
    });

    (lead.activities ?? []).forEach((activity) => {
      events.push({
        id: activity.id,
        type: "activity",
        timestamp: activity.occurred_at,
        title: activity.action.replace(".", " ").toUpperCase(),
        description: activity.properties?.summary,
        actor: activity.actor?.name ?? "System",
      });
    });

    (lead.notes ?? []).forEach((note) => {
      events.push({
        id: note.id,
        type: "note",
        timestamp: note.created_at,
        title: "Note added",
        description: note.body,
        actor: note.author?.name ?? "Unknown",
      });
    });

    return events
      .filter((event) => Boolean(event.timestamp))
      .sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [lead]);

  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">Checking authentication…</p>
    );
  }

  if (isFetching && !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
        <div className="h-64 bg-muted rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Failed to load lead</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!lead) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Lead not found</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/leads">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {lead.company_name ?? `${lead.first_name} ${lead.last_name}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Lead #{lead.id} • {lead.reference ?? "No reference"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {!isChangingStatus ? (
                <Badge
                  variant="secondary"
                  className={cn(
                    "cursor-pointer uppercase",
                    statusColors[lead.status]
                  )}
                  onClick={() => setIsChangingStatus(true)}
                >
                  {lead.status}
                  {!statusChangeMutation.isPending && (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  )}
                  {statusChangeMutation.isPending && (
                    <Loader2 className="h-3 w-3 ml-1 animate-spin" />
                  )}
                </Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Select
                    value={lead.status}
                    onValueChange={handleStatusChange}
                    disabled={statusChangeMutation.isPending}
                  >
                    <SelectTrigger className="h-8 w-[120px] text-xs">
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
                  <Input
                    type="text"
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    placeholder="Comment (optional)"
                    className="h-8 w-40 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsChangingStatus(false);
                        setStatusComment("");
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      setIsChangingStatus(false);
                      setStatusComment("");
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          )}
          {!isChangingStatus && !isEditing && (
            <Badge
              variant="secondary"
              className={cn("uppercase", statusColors[lead.status])}
            >
              {lead.status}
            </Badge>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit_first_name">First Name</Label>
                    <Input
                      id="edit_first_name"
                      type="text"
                      name="first_name"
                      value={editFormData.first_name}
                      onChange={handleEditChange}
                      className={cn(editErrors.first_name && "border-destructive")}
                    />
                    {editErrors.first_name && (
                      <p className="text-xs text-destructive">{editErrors.first_name[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_last_name">Last Name</Label>
                    <Input
                      id="edit_last_name"
                      type="text"
                      name="last_name"
                      value={editFormData.last_name}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_company_name">Company Name</Label>
                  <Input
                    id="edit_company_name"
                    type="text"
                    name="company_name"
                    value={editFormData.company_name}
                    onChange={handleEditChange}
                    className={cn(editErrors.company_name && "border-destructive")}
                  />
                  {editErrors.company_name && (
                    <p className="text-xs text-destructive">{editErrors.company_name[0]}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit_email">Email</Label>
                    <Input
                      id="edit_email"
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditChange}
                      className={cn(editErrors.email && "border-destructive")}
                    />
                    {editErrors.email && (
                      <p className="text-xs text-destructive">{editErrors.email[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_phone">Phone</Label>
                    <Input
                      id="edit_phone"
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_territory_code">Territory Code</Label>
                  <Input
                    id="edit_territory_code"
                    type="text"
                    name="territory_code"
                    value={editFormData.territory_code}
                    onChange={handleEditChange}
                    maxLength={25}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit_status">Status</Label>
                    <Select
                      name="status"
                      value={editFormData.status}
                      onValueChange={(value) => handleEditChange({ target: { name: "status", value } })}
                    >
                      <SelectTrigger id="edit_status">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_source_id">Lead Source</Label>
                    <Select
                      value={editFormData.source_id || undefined}
                      onValueChange={(value) => handleEditChange({ target: { name: "source_id", value: value === "none" ? "" : value } })}
                    >
                      <SelectTrigger id="edit_source_id">
                        <SelectValue placeholder="Select a source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {(referenceData?.data?.lead_sources || []).map((source) => (
                          <SelectItem key={source.id} value={String(source.id)}>
                            {source.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_team_id">Team</Label>
                  <Select
                    value={editFormData.team_id || undefined}
                    onValueChange={(value) => handleEditChange({ target: { name: "team_id", value: value === "none" ? "" : value } })}
                  >
                    <SelectTrigger id="edit_team_id">
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {(referenceData?.data?.teams || []).map((team) => (
                        <SelectItem key={team.id} value={String(team.id)}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit_potential_value">Potential Value</Label>
                    <Input
                      id="edit_potential_value"
                      type="number"
                      name="potential_value"
                      value={editFormData.potential_value}
                      onChange={handleEditChange}
                      step="0.01"
                      min="0"
                      className={cn(editErrors.potential_value && "border-destructive")}
                    />
                    {editErrors.potential_value && (
                      <p className="text-xs text-destructive">{editErrors.potential_value[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_currency">Currency</Label>
                    <Select
                      value={editFormData.currency}
                      onValueChange={(value) => handleEditChange({ target: { name: "currency", value } })}
                    >
                      <SelectTrigger id="edit_currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_expected_close_date">Expected Close Date</Label>
                    <Input
                      id="edit_expected_close_date"
                      type="date"
                      name="expected_close_date"
                      value={editFormData.expected_close_date}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Read-only fields</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned To:</span>
                      <span>{lead.owner?.name ?? "Unassigned"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              onClick={() => setIsEditing(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>

          {updateMutation.isError && (
            <>
              {!updateMutation.error.response?.data?.errors && (
                <Card className="border-destructive">
                  <CardContent className="pt-6">
                    <p className="text-sm text-destructive">
                      {updateMutation.error.response?.data?.message || updateMutation.error.message || "Failed to update lead. Please try again."}
                    </p>
                  </CardContent>
                </Card>
              )}
              {editErrors._general && (
                <Card className="border-destructive">
                  <CardContent className="pt-6">
                    <p className="text-sm text-destructive">
                      {editErrors._general[0]}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </form>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    First Name
                  </dt>
                  <dd className="mt-1">
                    {lead.first_name ?? "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Last Name
                  </dt>
                  <dd className="mt-1">
                    {lead.last_name ?? "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Email
                  </dt>
                  <dd className="mt-1">
                    {lead.email ?? "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Phone
                  </dt>
                  <dd className="mt-1">
                    {lead.phone ?? "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Company
                  </dt>
                  <dd className="mt-1">
                    {lead.company_name ?? "Not provided"}
                  </dd>
                </div>
                {lead.territory_code && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      Territory
                    </dt>
                    <dd className="mt-1">{lead.territory_code}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Potential Value
                  </dt>
                  <dd className="mt-1 text-lg font-semibold">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: lead.currency ?? "INR",
                      maximumFractionDigits: 0,
                    }).format(lead.potential_value ?? 0)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Assigned To
                  </dt>
                  <dd className="mt-1">
                    {lead.owner?.name ?? "Unassigned"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Team
                  </dt>
                  <dd className="mt-1">
                    {lead.team?.name ?? "No team"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Source
                  </dt>
                  <dd className="mt-1">
                    {lead.source?.name ?? "Unknown"}
                  </dd>
                </div>
                {lead.expected_close_date && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      Expected Close
                    </dt>
                    <dd className="mt-1">
                      {formatDate(lead.expected_close_date)}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      )}

      {lead.score && (
        <Card>
          <CardHeader>
            <CardTitle>Lead Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">
                {lead.score.value}
              </div>
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    style={{ width: `${lead.score.value}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Score breakdown: {Object.keys(lead.score.breakdown || {}).join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {lead.products && lead.products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lead.products.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span>{product.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Qty: {product.pivot?.quantity ?? 1}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notes</CardTitle>
              {lead.notes?.length ? (
                <Badge variant="secondary">{lead.notes.length} total</Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (!noteBody.trim()) return;
                noteMutation.mutate({ body: noteBody });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="note-body">Add a note</Label>
                <Textarea
                  id="note-body"
                  value={noteBody}
                  onChange={(event) => setNoteBody(event.target.value)}
                  rows={4}
                  placeholder="Document next steps, meeting notes, or objections…"
                />
              </div>
              {noteMutation.isError && (
                <p className="text-xs text-destructive">
                  {noteMutation.error?.response?.data?.message ?? "Failed to save note."}
                </p>
              )}
              <Button
                type="submit"
                disabled={noteMutation.isPending}
                className="w-full"
              >
                {noteMutation.isPending ? "Saving…" : "Save note"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              {(lead.notes ?? []).map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{note.author?.name ?? "Unknown"}</span>
                      <span>{note.created_at && formatDate(note.created_at)}</span>
                    </div>
                    <p className="mt-2 text-sm">{note.body}</p>
                  </CardContent>
                </Card>
              ))}
              {(!lead.notes || lead.notes.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No notes yet — capture context for your teammates here.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadTimeline items={timelineItems} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

