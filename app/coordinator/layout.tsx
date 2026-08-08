import { DashboardShell } from "@/components/dashboard/DashboardShell";

const navItems = [
  { href: "/coordinator", label: "Dashboard" },
  { href: "/coordinator/cohorts", label: "Cohorts" },
  { href: "/coordinator/participants", label: "Participants" },
  { href: "/coordinator/attendance", label: "Attendance" },
  { href: "/coordinator/content", label: "Session Content" },
  { href: "/coordinator/projects", label: "Projects" },
  { href: "/coordinator/journeys", label: "Journey Cards" },
  { href: "/coordinator/surveys", label: "Co-Design Surveys" },
  { href: "/coordinator/showcase", label: "Showcase" },
  { href: "/coordinator/safeguarding", label: "Safeguarding" },
  { href: "/coordinator/users", label: "User Management" },
  { href: "/coordinator/reports", label: "Funder Reports" },
];

export default function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Coordinator">
      {children}
    </DashboardShell>
  );
}
