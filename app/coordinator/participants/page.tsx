"use client";

import { useEffect, useState } from "react";
import { Card, Input, Label, Select, Pill } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { AwardBadgeControl } from "@/components/ui/AwardBadgeControl";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Cohort {
  _id: string;
  name: string;
}
interface PartnerOrg {
  _id: string;
  name: string;
}
interface ParentOption {
  _id: string;
  name: string;
}
interface Participant {
  _id: string;
  name: string;
  age: number;
  cohortId?: { _id: string; name: string };
  partnerOrgId?: { _id: string; name: string };
  digitalConsent: boolean;
  publicShowcaseConsent: boolean;
}

const emptyForm = {
  name: "",
  email: "",
  password: "PlayToProgress2026!",
  age: 13,
  emergencyContact: "",
  contactDetails: "",
  digitalConsent: false,
  publicShowcaseConsent: false,
  cohortId: "",
  partnerOrgId: "",
  parentId: "",
};

export default function ParticipantsPage() {
  const { showToast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [orgs, setOrgs] = useState<PartnerOrg[]>([]);
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function load() {
    setLoading(true);
    Promise.all([
      apiFetch<{ participants: Participant[] }>("/api/participants"),
      apiFetch<{ cohorts: Cohort[] }>("/api/cohorts"),
      apiFetch<{ partnerOrgs: PartnerOrg[] }>("/api/partner-orgs"),
      apiFetch<{ parents: ParentOption[] }>("/api/parents"),
    ])
      .then(([p, c, o, pa]) => {
        setParticipants(p.participants);
        setCohorts(c.cohorts);
        setOrgs(o.partnerOrgs);
        setParents(pa.parents);
      })
      .catch((err) => showToast(errorMessage(err, "Couldn't load participants.")))
      .finally(() => setLoading(false));
  }

  useEffect(load, [showToast]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({ ...form, role: "participant" }),
      });
      setShowForm(false);
      setForm(emptyForm);
      showToast("Participant registered.", "success");
      load();
    } catch (err) {
      const msg = errorMessage(err, "Failed to register participant.");
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
          <h1 className="font-display text-3xl font-bold">Participants</h1>
          <p className="text-white/50 text-sm">Register young people and capture consent.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "+ Register Participant"}</Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Age (11–18)</Label>
              <Input
                type="number"
                min={11}
                max={18}
                required
                value={form.age}
                onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Login email</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Temporary password</Label>
              <Input
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <Label>Emergency contact</Label>
              <Input
                required
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              />
            </div>
            <div>
              <Label>Contact details (optional)</Label>
              <Input
                value={form.contactDetails}
                onChange={(e) => setForm({ ...form, contactDetails: e.target.value })}
              />
            </div>
            <div>
              <Label>Cohort</Label>
              <Select
                required
                value={form.cohortId}
                onChange={(e) => setForm({ ...form, cohortId: e.target.value })}
              >
                <option value="">Select cohort…</option>
                {cohorts.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Partner venue</Label>
              <Select
                value={form.partnerOrgId}
                onChange={(e) => setForm({ ...form, partnerOrgId: e.target.value })}
              >
                <option value="">None</option>
                {orgs.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Parent / guardian account (optional)</Label>
              <Select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                <option value="">None — link later once a parent account exists</option>
                {parents.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-white/30 mt-1">
                Create the parent&apos;s account first on the User Management page if it doesn&apos;t
                exist yet — linking here is what lets that parent see this participant&apos;s
                attendance and progress.
              </p>
            </div>
            <div className="md:col-span-2 flex flex-col gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.digitalConsent}
                  onChange={(e) => setForm({ ...form, digitalConsent: e.target.checked })}
                />
                Digital consent captured (required to use the platform)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.publicShowcaseConsent}
                  onChange={(e) => setForm({ ...form, publicShowcaseConsent: e.target.checked })}
                />
                Explicit consent to show full name/photo on the <strong>public</strong> showcase (NF-05)
              </label>
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" loading={saving}>
                Register Participant
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
                <th className="p-4">Age</th>
                <th className="p-4">Cohort</th>
                <th className="p-4">Venue</th>
                <th className="p-4">Consent</th>
                <th className="p-4">Recognition</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p._id} className="border-b border-white/5 last:border-0">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 text-white/60">{p.age}</td>
                  <td className="p-4 text-white/60">{p.cohortId?.name ?? "—"}</td>
                  <td className="p-4 text-white/60">{p.partnerOrgId?.name ?? "—"}</td>
                  <td className="p-4 flex gap-2">
                    <Pill tone={p.digitalConsent ? "green" : "red"}>digital</Pill>
                    <Pill tone={p.publicShowcaseConsent ? "green" : "gray"}>showcase</Pill>
                  </td>
                  <td className="p-4">
                    <AwardBadgeControl participantId={p._id} />
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