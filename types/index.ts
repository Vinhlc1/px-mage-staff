// ─── Shared entity types matching BE DTOs ────────────────────────────────────

export interface Role {
  roleId: number;
  roleName: string;
}

export interface Account {
  customerId: number;
  email: string;
  name: string;
  phoneNumber: string;
  role?: Role;
}

export interface Warehouse {
  id?: number;       // BE may serialize as "id"
  warehouseId: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Inventory {
  id?: number;         // BE may serialize as "id"
  inventoryId: number;
  productId: number;
  warehouseId: number;
  quantity: number;
  lastChecked: string; // ISO datetime
}

export interface Supplier {
  supplierId: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface PurchaseOrderLine {
  lineId: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityPendingReceived: number;
  unitPrice: number;
  totalPrice: number;
  expectedDate: string; // ISO date
  note: string;
}

export interface PurchaseOrder {
  poId: number;
  poNumber: string;
  status: string;
  orderDate: string; // ISO datetime
  expectedDelivery: string;
  warehouseId: number;
  supplierId: number;
  lines?: PurchaseOrderLine[];
}

export interface WarehouseTransaction {
  transactionId: number;
  warehouseId: number;
  productId: number;
  quantity: number;
  transactionType: "IN" | "OUT" | "ADJUSTMENT";
  referenceId: number;
  transactionDate: string; // ISO datetime
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface AccountRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  roleId: number;
}

export interface WarehouseRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface InventoryRequest {
  productId: number;
  warehouseId: number;
  quantity: number;
  lastChecked: string;
}

export interface RoleRequest {
  roleName: string;
}

export interface SupplierRequest {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface PurchaseOrderRequest {
  warehouseId: number;
  supplierId: number;
  poNumber: string;
  status: string;
  orderDate: string;
  expectedDelivery: string;
}

// ─── Catalog / NFC / Commerce types ──────────────────────────────────────────

export type CardProductStatus = "PENDING_BIND" | "READY" | "SOLD" | "LINKED" | "DEACTIVATED";
export type CardCondition = "NEW" | "GOOD" | "DAMAGED";
export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface CardTemplate {
  cardTemplateId: number;
  name: string;
  arcanaType: string;
  suit?: string;
  cardNumber?: number;
  rarity: string;
  active: boolean;
  imagePath?: string;
  description?: string;
}

export interface CardProduct {
  cardProductId: number;
  cardTemplateId: number;
  template?: CardTemplate;
  serialNumber?: string;
  productionBatch?: string;
  condition: CardCondition;
  status: CardProductStatus;
  nfcUid?: string;
}

export interface CardProductBindRequest {
  nfcUid: string;
}

export interface CustomerOrderItem {
  orderItemId: number;
  productId?: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CustomerOrder {
  orderId: number;
  status: OrderStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  shippingAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  customerName?: string;
  customerEmail?: string;
  orderItems?: CustomerOrderItem[];
}

export interface OrderStatusRequest {
  status: OrderStatus;
}

export interface PurchaseOrderLineRequest {
  quantityOrdered: number;
  quantityReceived: number;
  quantityPendingReceived: number;
  unitPrice: number;
  totalPrice: number;
  expectedDate: string;
  note: string;
}

export interface WarehouseTransactionRequest {
  warehouseId: number;
  productId: number;
  quantity: number;
  transactionType: "IN" | "OUT" | "ADJUSTMENT";
  referenceId: number;
  transactionDate: string;
}
