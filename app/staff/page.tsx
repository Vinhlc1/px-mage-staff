import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { DashboardStats } from "./dashboard-stats";

export default function StaffDashboardPage() {
  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold">Staff Dashboard</h1>
        </div>
      </Header>
      <Main>
        <DashboardStats />
      </Main>
    </>
  );
}

