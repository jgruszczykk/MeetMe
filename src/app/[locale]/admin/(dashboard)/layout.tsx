import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      <AdminNav />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
