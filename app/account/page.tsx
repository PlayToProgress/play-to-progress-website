"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, Input, Label } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/brand/Wordmark";
import { apiFetch } from "@/lib/api";
import { errorMessage } from "@/components/ui/Toast";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  coordinator: "/coordinator",
  participant: "/participant",
  partner: "/partner",
  parent: "/parent",
};

export default function ChangePasswordPage() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const homeHref = ROLE_HOME[session?.user?.role ?? ""] ?? "/";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(errorMessage(err, "Failed to change password."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-black">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <Link href={homeHref}>
            <Wordmark size="md" className="text-center" />
          </Link>
        </div>
        <Card>
          <h1 className="font-display text-2xl font-bold mb-1">Change Password</h1>
          <p className="text-sm text-white/50 mb-6">
            Signed in as {session?.user?.name ?? "…"}. Choose a new password of at least 8
            characters.
          </p>

          {success ? (
            <div className="space-y-4">
              <p className="text-sm text-gold">Your password has been updated.</p>
              <Link href={homeHref}>
                <Button className="w-full">Back to dashboard</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" className="w-full" loading={saving}>
                Update Password
              </Button>
            </form>
          )}
        </Card>
        <p className="text-center text-xs text-white/30 mt-6">
          <Link href={homeHref} className="hover:text-gold">
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
