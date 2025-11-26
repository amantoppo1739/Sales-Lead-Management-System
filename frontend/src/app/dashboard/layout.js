"use client";

import Link from "next/link";
import { HeaderUser } from "../../components/header-user";
import { NavLinks } from "../../components/nav-links";
import { Separator } from "../../components/ui/separator";
import { useAuthStore } from "../../store/auth-store";

export default function DashboardLayout({ children }) {
  const role = useAuthStore((state) => state.user?.role);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar-background">
        <div className="px-6 py-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Aurora CRM
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-sidebar-foreground">Sales Suite</h1>
        </div>
        <Separator />
        <NavLinks />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Lead Management System
              </p>
              <h2 className="text-2xl font-semibold">Revenue Command Center</h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/leads" className="hover:text-foreground transition-colors">
                Leads
              </Link>
              <Link href="/dashboard/imports" className="hover:text-foreground transition-colors">
                Imports
              </Link>
              {role === "admin" && (
                <>
                  <Link href="/dashboard/users" className="hover:text-foreground transition-colors">
                    Users
                  </Link>
                  <Link href="/dashboard/settings" className="hover:text-foreground transition-colors">
                    Settings
                  </Link>
                </>
              )}
              <HeaderUser />
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

