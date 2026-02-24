import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";

export default function StaffDashboardPage() {
  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold">Staff Dashboard</h1>
        </div>
      </Header>
      <Main>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-medium text-muted-foreground">Welcome</h2>
            <p className="mt-1 text-2xl font-semibold">PX Mage Staff</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Use the sidebar to manage Purchase Orders — approve, reject, or mark deliveries as received.
            </p>
          </div>
        </div>
      </Main>
    </>
  );
}
