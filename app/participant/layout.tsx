import { DashboardShell } from "@/components/dashboard/DashboardShell";

const navItems = [
  { href: "/participant", label: "Dashboard" },
  { href: "/participant/journey-card", label: "Journey Card" },
  { href: "/participant/modules", label: "Weekly Modules" },
  { href: "/participant/portfolio", label: "My Portfolio" },
  { href: "/participant/checkin", label: "Check-In" },
  { href: "/participant/surveys", label: "Surveys" },
];

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Participant">
      {children}
    </DashboardShell>
  );
}
