import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export type UserRole = "admin" | "coordinator" | "participant" | "partner" | "parent";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    };
  }
  interface User {
    role?: UserRole;
    accessToken?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  // Defining a custom error page too (not just signIn) matters: if anything
  // ever does slip through as an uncaught error, Auth.js lands the person
  // back on our own /login page instead of its bare-bones default error
  // screen — belt-and-suspenders alongside the try/catch below.
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        // Authentication is delegated entirely to the NestJS API — this
        // frontend never talks to MongoDB directly. NextAuth here is only
        // acting as the session/cookie layer around the backend's JWT.
        //
        // Everything below is wrapped in try/catch on purpose: if authorize()
        // throws for ANY reason (backend unreachable, CORS, a non-JSON
        // response, wrong credentials returning a body we don't expect),
        // Auth.js treats that as a server "Configuration" error and hard-
        // redirects to its own generic error page — which is exactly the
        // broken page reported. Returning null instead, always, means every
        // failure surfaces as a normal, inline "incorrect email or password"
        // message on our own login form, never a redirect.
        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!res.ok) return null;

          const data = (await res.json()) as {
            accessToken: string;
            user: { sub: string; name: string; email: string; role: UserRole };
          };

          if (!data?.accessToken || !data?.user) return null;

          return {
            id: data.user.sub,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            accessToken: data.accessToken,
          };
        } catch {
          // Network failure reaching the backend, or a response that wasn't
          // valid JSON (e.g. NEXT_PUBLIC_API_URL pointing at the wrong host
          // and hitting this frontend's own 404 page instead of the API) —
          // all treated the same as "couldn't sign in", never re-thrown.
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role;
        token.accessToken = (user as { accessToken?: string }).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token as { id?: string }).id as string;
        session.user.role = (token as { role?: UserRole }).role as UserRole;
      }
      session.accessToken = (token as { accessToken?: string }).accessToken as string;
      return session;
    },
  },
});