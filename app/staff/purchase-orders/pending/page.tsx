import { StaffPurchaseOrdersFeature } from "@/features/purchase-orders";

export default function PendingPurchaseOrdersPage() {
  return (
    <StaffPurchaseOrdersFeature
      initialFilter="PENDING"
      title="Pending Approval"
    />
  );
}
