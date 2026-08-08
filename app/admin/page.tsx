"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard, Card } from "@/components/ui/Primitives";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface UserRow {
  _id: string;
  role: string;
}

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserRow[] | null>(null);

  useEffect(() => {
    apiFetch<{ users: UserRow[] }>("/api/users")
      .then((d) => setUsers(d.users))
      .catch((err) => showToast(errorMessage(err, "Couldn't load account data.")));
  }, [showToast]);

  const countByRole = (role: string) => users?.filter((u) => u.role === role).length ?? 0;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-white/50 text-sm mb-8">
        System-wide account overview. Only super admins can create other admins and
        coordinators.
      </p>

      {!users ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-gold rounded-lg h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Admins" value={countByRole("admin")} />
          <StatCard label="Coordinators" value={countByRole("coordinator")} />
          <StatCard label="Partners" value={countByRole("partner")} />
          <StatCard label="Parents" value={countByRole("parent")} />
          <StatCard label="Participants" value={countByRole("participant")} />
        </div>
      )}

      <Card className="mt-8">
        <p className="font-display text-lg font-bold mb-2">What you can do here</p>
        <p className="text-sm text-white/50 mb-4">
          Create new admin or coordinator accounts from{" "}
          <Link href="/admin/users" className="text-gold hover:underline">
            Admins &amp; Coordinators
          </Link>
          . Everyday programme management — cohorts, attendance, projects, funder reports — lives
          in the coordinator area, which your admin account can also open.
        </p>
        <Link href="/coordinator" className="text-sm text-gold hover:underline">
          Open the programme area →
        </Link>
      </Card>
    </div>
  );
}
