"use client";

import { useEffect, useState } from "react";
import { Card, Input, Label, Select, Pill } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { ResetPasswordControl } from "@/components/ui/ResetPasswordControl";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

// Mirrors the backend's CREATABLE_ROLES_BY_ACTOR for the coordinator role —
// a coordinator can only reset passwords for the roles it's also allowed to
// create (partner/parent/participant), never another coordinator or an admin.
const COORDINATOR_RESETTABLE_ROLES = ["partner", "parent", "participant"];

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function UsersPage() {
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
    role: "partner",
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
      setForm({ name: "", email: "", password: "PlayToProgress2026!", role: "partner" });
      showToast("Account created.", "success");
      load();
    } catch (err) {
      const msg = errorMessage(err, "Failed to create user.");
      setError(msg);
      showToast(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">User Management</h1>
          <p className="text-white/50 text-sm">
            Create accounts for partner organisations and parents. (Participants are created via
            the Participants page, which also captures consent. Coordinator accounts are created
            by a super admin.)
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
                <option value="partner">Partner Organisation</option>
                <option value="parent">Parent / Guardian</option>
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
                    <Pill>{u.role}</Pill>
                  </td>
                  <td className="p-4">
                    {COORDINATOR_RESETTABLE_ROLES.includes(u.role) ? (
                      <ResetPasswordControl userId={u._id} />
                    ) : (
                      <span className="text-xs text-white/20">—</span>
                    )}
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
