"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { RoleGate } from "@/components/auth/role-gate";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleGate roles={["admin"]}><AdminShell>{children}</AdminShell></RoleGate>;
}
