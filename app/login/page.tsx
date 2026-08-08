"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/Button";
import { Input, Label, Card } from "@/components/ui/Primitives";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  coordinator: "/coordinator",
  participant: "/participant",
  partner: "/partner",
  parent: "/parent",
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? undefined;
  const urlError = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Surfaces a friendly message if Auth.js ever does redirect back here with
  // an ?error= param (now that /login doubles as our custom error page) —
  // this is the last-resort layer behind the authorize()-side try/catch, so
  // even an unforeseen failure never shows a bare, unbranded error screen.
  const [error, setError] = useState<string | null>(
    urlError ? "Couldn't sign in — please check your details and try again." : null
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", { email, password, redirect: false });

      if (!res || res.error) {
        setError("Incorrect email or password.");
        return;
      }

      // No callbackUrl means the person came from a public page (e.g. the
      // homepage's "Sign in" link) rather than being bounced here by the
      // middleware — send them to their own role's dashboard, not "/".
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        const session = await getSession();
        router.push(ROLE_HOME[session?.user?.role ?? ""] ?? "/");
      }
      router.refresh();
    } catch {
      // Covers network failures reaching the backend, or any unexpected
      // NextAuth error — never let this bubble up as an unhandled
      // rejection or a browser-level navigation to a missing page.
      setError("Couldn't sign in right now. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-black">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Wordmark size="md" className="text-center" />
          </Link>
        </div>
        <Card>
          <h1 className="font-display text-2xl font-bold mb-1">Sign in</h1>
          <p className="text-sm text-white/50 mb-6">
            Play to Progress platform — coordinators, participants, partners &amp; parents.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>
        <p className="text-center text-xs text-white/30 mt-6">
          <Link href="/" className="hover:text-gold">
            ← Back to public showcase
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}