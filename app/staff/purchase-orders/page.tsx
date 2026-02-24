import { StaffPurchaseOrdersFeature } from "@/features/purchase-orders";

export default function AllPurchaseOrdersPage() {
  return <StaffPurchaseOrdersFeature initialFilter="ALL" title="All Purchase Orders" />;
}
