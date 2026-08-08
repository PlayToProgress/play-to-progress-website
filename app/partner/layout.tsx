import { DashboardShell } from "@/components/dashboard/DashboardShell";

const navItems = [
  { href: "/partner", label: "Dashboard" },
  { href: "/partner/participants", label: "Our Participants" },
  { href: "/partner/surveys", label: "Co-Design Surveys" },
];

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Partner">
      {children}
    </DashboardShell>
  );
}
