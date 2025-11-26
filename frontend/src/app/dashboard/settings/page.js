"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, updateSettings } from "../../../lib/api-client";
import { useAuthStore } from "../../../store/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";

export default function SettingsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    general: {
      company_name: "",
      default_currency: "INR",
      default_timezone: "Asia/Kolkata",
    },
    features: {
      tasks_enabled: true,
      territory_map_enabled: false,
    },
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const { data, isFetching } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    onSuccess: (payload) => {
      if (payload?.data) {
        setFormData((prev) => ({
          ...prev,
          ...payload.data,
        }));
      }
    },
    enabled: role === "admin",
  });

  const mutation = useMutation({
    mutationFn: (payload) => updateSettings(payload),
    onSuccess: (payload) => {
      setMessage("Settings saved successfully.");
      setError(null);
      if (payload?.data) {
        setFormData((prev) => ({
          ...prev,
          ...payload.data,
        }));
      }
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (err) => {
      setError(err?.response?.data?.message || err.message || "Failed to save settings.");
      setMessage(null);
    },
  });

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    mutation.mutate(formData);
  };

  if (role !== "admin") {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          You need administrator access to view system settings.
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Administration</p>
        <h1 className="text-3xl font-semibold">System Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure workspace defaults and feature flags before rolling out the mobile app.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Global settings that apply to all users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.general.company_name}
                onChange={(e) => handleChange("general", "company_name", e.target.value)}
                placeholder="Aurora CRM"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="default_currency">Default Currency</Label>
                <Input
                  id="default_currency"
                  value={formData.general.default_currency}
                  onChange={(e) => handleChange("general", "default_currency", e.target.value)}
                  placeholder="INR"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_timezone">Default Timezone</Label>
                <Input
                  id="default_timezone"
                  value={formData.general.default_timezone}
                  onChange={(e) => handleChange("general", "default_timezone", e.target.value)}
                  placeholder="Asia/Kolkata"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Toggle major modules on or off for this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <p className="font-medium">Tasks</p>
                <p className="text-xs text-muted-foreground">
                  Enable lightweight task management for sales reps on lead detail pages.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleChange("features", "tasks_enabled", !formData.features.tasks_enabled)
                }
                className="inline-flex h-6 w-11 items-center rounded-full border bg-background px-0.5"
              >
                <span
                  className={`h-5 w-5 rounded-full bg-primary transition-transform ${
                    formData.features.tasks_enabled ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <p className="font-medium">Territory Map</p>
                <p className="text-xs text-muted-foreground">
                  Show India territory maps and geo-distribution of leads for managers.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleChange("features", "territory_map_enabled", !formData.features.territory_map_enabled)
                }
                className="inline-flex h-6 w-11 items-center rounded-full border bg-background px-0.5"
              >
                <span
                  className={`h-5 w-5 rounded-full bg-primary transition-transform ${
                    formData.features.territory_map_enabled ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-emerald-600">{message}</p>}

        <Button type="submit" disabled={mutation.isPending || isFetching}>
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </section>
  );
}


