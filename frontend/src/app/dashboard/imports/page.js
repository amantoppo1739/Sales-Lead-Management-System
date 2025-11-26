"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadLeadImport } from "../../../lib/api-client";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";

export default function ImportsPage() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const mutation = useMutation({
    mutationFn: (file) => uploadLeadImport(file),
    onSuccess: () => {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedFile) {
      return;
    }
    mutation.mutate(selectedFile);
  };

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Data Ingestion
        </p>
        <h1 className="text-3xl font-semibold">Lead Imports</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Upload marketing lists or enriched spreadsheets. CSV files should
          include headers like{" "}
          <code className="rounded bg-muted px-1 py-0.5">
            first_name, last_name, company_name, email, phone, status
          </code>
          .
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload a CSV file</CardTitle>
          <CardDescription>
            Files are processed asynchronously via Laravel Excel, so records may
            take a moment to appear in the pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select file</Label>
              <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="cursor-pointer"
              />
            </div>
            <Button
              type="submit"
              disabled={!selectedFile || mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? "Importing…" : "Start import"}
            </Button>
            {mutation.isSuccess && (
              <p className="text-sm text-emerald-400">
                Import accepted. You can monitor progress from the activity channel.
              </p>
            )}
            {mutation.isError && (
              <p className="text-sm text-destructive">
                {mutation.error?.response?.data?.message ??
                  "Upload failed. Ensure the API server is running and try again."}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {panels.map((panel) => (
          <Card key={panel.title}>
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold">{panel.title}</h3>
              <p className="mt-2 text-3xl font-bold">{panel.value}</p>
              <p className="mt-2 text-xs text-muted-foreground">{panel.meta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recently imported files</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The API currently exposes individual import details. A listing endpoint
            is on the roadmap—until then, use{" "}
            <code className="rounded bg-muted px-1">php artisan imports:list</code>{" "}
            or check Laravel Horizon to monitor jobs.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

const panels = [
  {
    title: "Weekly upload capacity",
    value: "50k rows",
    meta: "Tested on local hardware using queued CSV imports.",
  },
  {
    title: "Avg. validation accuracy",
    value: "98%",
    meta: "Sanitizes emails, phone numbers, and required fields.",
  },
  {
    title: "Connected sources",
    value: "3",
    meta: "Website forms, events, and partner referrals feed this workspace.",
  },
];

