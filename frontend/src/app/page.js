"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { login } from "../lib/api-client";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => router.push("/dashboard"),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
            {loginMutation.isError && (
              <div className="text-sm text-destructive">
                <p className="font-medium">Login failed</p>
                {loginMutation.error?.response?.data?.message ? (
                  <p className="mt-1 text-xs">{loginMutation.error.response.data.message}</p>
                ) : loginMutation.error?.response?.data?.errors ? (
                  <ul className="mt-1 text-xs list-disc list-inside">
                    {Object.entries(loginMutation.error.response.data.errors).map(([field, messages]) => (
                      <li key={field}>
                        {field}: {Array.isArray(messages) ? messages.join(", ") : messages}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-xs">{loginMutation.error.message}</p>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
