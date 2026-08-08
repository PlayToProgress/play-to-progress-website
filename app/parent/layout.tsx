import { DashboardShell } from "@/components/dashboard/DashboardShell";

const navItems = [{ href: "/parent", label: "My Children" }];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Parent / Guardian">
      {children}
    </DashboardShell>
  );
}
