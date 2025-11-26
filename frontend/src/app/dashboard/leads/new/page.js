"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createLead, fetchReferenceData } from "../../../../lib/api-client";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { ArrowLeft } from "lucide-react";
import { cn } from "../../../../lib/utils";

const statusOptions = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

export default function CreateLeadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const { data: referenceData } = useQuery({
    queryKey: ["reference-data"],
    queryFn: fetchReferenceData,
    enabled: Boolean(token),
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    company_name: "",
    email: "",
    phone: "",
    status: "new",
    source_id: "",
    team_id: user?.team_id || "",
    potential_value: "",
    currency: "INR",
    territory_code: "",
    expected_close_date: "",
  });

  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: (payload) => createLead(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      router.push(`/dashboard/leads/${data.data.id}`);
    },
    onError: (error) => {
      if (error.response?.status === 422) {
        setErrors(error.response.data?.errors || {});
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      ...formData,
      potential_value: formData.potential_value ? parseFloat(formData.potential_value) : null,
      source_id: formData.source_id || null,
      team_id: formData.team_id || null,
      expected_close_date: formData.expected_close_date || null,
    };

    // Remove empty strings
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") {
        payload[key] = null;
      }
    });

    createMutation.mutate(payload);
  };

  const sources = referenceData?.data?.lead_sources || [];
  const teams = referenceData?.data?.teams || [];

  if (!token) {
    return (
      <p className="text-sm text-slate-400">Checking authentication…</p>
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
            <h1 className="text-2xl font-bold">Create New Lead</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new lead to your pipeline
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
          
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={cn(errors.first_name && "border-destructive")}
                  placeholder="John"
                  required={!formData.company_name}
                />
                {errors.first_name && (
                  <p className="text-xs text-destructive">{errors.first_name[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company_name"
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className={cn(errors.company_name && "border-destructive")}
                placeholder="Acme Corp"
                required={!formData.first_name}
              />
              {errors.company_name && (
                <p className="text-xs text-destructive">{errors.company_name[0]}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(errors.email && "border-destructive")}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1-555-1234"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => handleChange({ target: { name: "status", value } })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source_id">Lead Source</Label>
                <Select
                  value={formData.source_id || undefined}
                  onValueChange={(value) => handleChange({ target: { name: "source_id", value } })}
                >
                  <SelectTrigger id="source_id">
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source.id} value={String(source.id)}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="team_id">Team</Label>
                <Select
                  value={formData.team_id || undefined}
                  onValueChange={(value) => handleChange({ target: { name: "team_id", value } })}
                >
                  <SelectTrigger id="team_id">
                    <SelectValue placeholder="Select a team" />
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

              <div className="space-y-2">
                <Label htmlFor="territory_code">Territory Code</Label>
                <Input
                  id="territory_code"
                  type="text"
                  name="territory_code"
                  value={formData.territory_code}
                  onChange={handleChange}
                  placeholder="NA, EMEA, etc."
                  maxLength={25}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="potential_value">Potential Value</Label>
                <Input
                  id="potential_value"
                  type="number"
                  name="potential_value"
                  value={formData.potential_value}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={cn(errors.potential_value && "border-destructive")}
                  placeholder="50000"
                />
                {errors.potential_value && (
                  <p className="text-xs text-destructive">{errors.potential_value[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleChange({ target: { name: "currency", value } })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_close_date">Expected Close Date</Label>
                <Input
                  id="expected_close_date"
                  type="date"
                  name="expected_close_date"
                  value={formData.expected_close_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/leads">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating…" : "Create Lead"}
          </Button>
        </div>

        {createMutation.isError && !createMutation.error.response?.data?.errors && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">
                {createMutation.error.message || "Failed to create lead. Please try again."}
              </p>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}

