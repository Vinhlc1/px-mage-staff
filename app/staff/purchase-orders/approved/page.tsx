import { StaffPurchaseOrdersFeature } from "@/features/purchase-orders";

export default function ApprovedPurchaseOrdersPage() {
  return (
    <StaffPurchaseOrdersFeature
      initialFilter="APPROVED"
      title="Ready to Receive"
    />
  );
}
