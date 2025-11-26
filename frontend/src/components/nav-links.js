"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "../store/auth-store";

const baseLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/imports", label: "Imports" },
  { href: "/dashboard/reports", label: "Reports" },
];

export function NavLinks() {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role);

  const links = [...baseLinks];
  if (role === "admin") {
    links.push({ href: "/dashboard/users", label: "Users" });
    links.push({ href: "/dashboard/settings", label: "Settings" });
  }

  return (
    <nav className="flex-1 space-y-1 px-3">
      {links.map((link) => {
        let isActive = false;
        if (link.href === "/dashboard") {
          isActive = pathname === link.href;
        } else {
          isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

