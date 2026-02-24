import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
