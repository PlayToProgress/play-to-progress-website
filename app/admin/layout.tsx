import { DashboardShell } from "@/components/dashboard/DashboardShell";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Admins & Coordinators" },
  { href: "/coordinator", label: "Programme Area →" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Super Admin">
      {children}
    </DashboardShell>
  );
}
