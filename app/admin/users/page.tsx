"use client";

import { useEffect, useState } from "react";
import { Card, Input, Label, Select, Pill } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { ResetPasswordControl } from "@/components/ui/ResetPasswordControl";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "PlayToProgress2026!",
    role: "coordinator",
  });

  function load() {
    setLoading(true);
    apiFetch<{ users: UserRow[] }>("/api/users")
      .then((d) => setUsers(d.users))
      .catch((err) => showToast(errorMessage(err, "Couldn't load accounts.")))
      .finally(() => setLoading(false));
  }
  useEffect(load, [showToast]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/users", { method: "POST", body: JSON.stringify(form) });
      setShowForm(false);
      setForm({ name: "", email: "", password: "PlayToProgress2026!", role: "coordinator" });
      showToast("Account created.", "success");
      load();
    } catch (err) {
      const msg = errorMessage(err, "Failed to create account.");
      setError(msg);
      showToast(msg);
    } finally {
      setSaving(false);
    }
  }

  const roleTone: Record<string, "gold" | "green" | "gray"> = {
    admin: "gold",
    coordinator: "green",
    partner: "gray",
    parent: "gray",
    participant: "gray",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Admins &amp; Coordinators</h1>
          <p className="text-white/50 text-sm">
            Only super admins can create these two roles — every other account is created from
            the coordinator area.
          </p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "+ New Account"}</Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="coordinator">Coordinator</option>
                <option value="admin">Super Admin</option>
              </Select>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Temporary password</Label>
              <Input required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" loading={saving}>
                Create Account
              </Button>
              {error && <span className="text-sm text-red-400">{error}</span>}
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="skeleton-gold rounded-lg h-64" />
      ) : (
        <div className="overflow-x-auto card-surface rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 uppercase text-xs border-b border-white/10">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Account</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-white/5 last:border-0">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-white/60">{u.email}</td>
                  <td className="p-4">
                    <Pill tone={roleTone[u.role] ?? "gray"}>{u.role}</Pill>
                  </td>
                  <td className="p-4">
                    <ResetPasswordControl userId={u._id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
