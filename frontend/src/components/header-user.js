"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth-store";
import { logout } from "../lib/api-client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export function HeaderUser() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure consistent rendering between server and client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  // During SSR and initial render, show consistent fallback
  const displayName = mounted && user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : mounted && (user?.first_name || user?.last_name)
    ? user.first_name || user.last_name
    : "User";

  const displayRole = mounted && user?.role ? user.role : "User";

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium">
          {displayName}
        </p>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {displayRole}
        </p>
      </div>
      <Button
        onClick={handleLogout}
        disabled={loading}
        variant="outline"
        size="sm"
      >
        {loading ? "Signing out…" : "Sign out"}
      </Button>
    </div>
  );
}

