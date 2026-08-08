"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

export function ResetPasswordControl({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (newPassword.length < 8) {
      setError("Must be at least 8 characters.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      });
      setDone(true);
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <span className="text-xs text-gold">
        Password reset.{" "}
        <button
          className="underline hover:text-white cursor-pointer"
          onClick={() => {
            setDone(false);
            setOpen(false);
          }}
        >
          Close
        </button>
      </span>
    );
  }

  if (!open) {
    return (
      <button className="text-xs text-white/40 hover:text-gold underline cursor-pointer" onClick={() => setOpen(true)}>
        Reset password
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="password"
        placeholder="New password"
        className="w-36 py-1 text-xs"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <Button className="text-xs px-2 py-1" loading={saving} onClick={submit}>
        Set
      </Button>
      <button className="text-xs text-white/40 cursor-pointer" onClick={() => setOpen(false)}>
        Cancel
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}