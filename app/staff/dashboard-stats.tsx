"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { CardProduct, CustomerOrder } from "@/types";

export function DashboardStats() {
  const [pendingBind, setPendingBind] = useState<number | null>(null);
  const [activeOrders, setActiveOrders] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get<CardProduct[]>("/api/card-products").then((res) => {
      if (!res.error && Array.isArray(res.data)) {
        setPendingBind(
          res.data.filter((c) => c.status === "PENDING_BIND").length
        );
      }
    });
    apiClient.get<CustomerOrder[]>("/api/orders").then((res) => {
      if (!res.error && Array.isArray(res.data)) {
        setActiveOrders(
          res.data.filter(
            (o) => o.status === "PENDING" || o.status === "PROCESSING"
          ).length
        );
      }
    });
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-medium text-muted-foreground">Welcome</h2>
        <p className="mt-1 text-2xl font-semibold">PX Mage Staff</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the sidebar to manage Purchase Orders, bind NFC cards, and fulfil
          customer orders.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-medium text-muted-foreground">
          Cards Pending Bind
        </h2>
        <p className="mt-1 text-3xl font-bold">
          {pendingBind === null ? "—" : pendingBind}
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-medium text-muted-foreground">
          Orders to Fulfil
        </h2>
        <p className="mt-1 text-3xl font-bold">
          {activeOrders === null ? "—" : activeOrders}
        </p>
      </div>
    </div>
  );
}
