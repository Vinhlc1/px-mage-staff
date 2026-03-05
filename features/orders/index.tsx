"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import type { CustomerOrder, OrderStatus, OrderStatusRequest } from "@/types";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
];

function orderStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "COMPLETED") return "default";
  if (status === "PROCESSING") return "secondary";
  if (status === "CANCELLED") return "destructive";
  return "outline";
}

function paymentStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "PAID") return "default";
  if (status === "REFUNDED") return "secondary";
  if (status === "FAILED") return "destructive";
  return "outline";
}

export function StaffOrdersFeature() {
  const [items, setItems] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(
    null
  );
  const [newStatus, setNewStatus] = useState<OrderStatus>("PENDING");
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const res = await apiClient.get<CustomerOrder[]>("/api/orders");
    if (res.error) toast.error(res.error);
    else setItems(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openManage = (order: CustomerOrder) => {
    setNewStatus(order.status);
    setSelectedOrder(order);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    const body: OrderStatusRequest = { status: newStatus };
    const res = await apiClient.patch<CustomerOrder>(
      `/api/orders/${selectedOrder.orderId}/status`,
      body
    );
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Order status updated.");
    setSelectedOrder(null);
    fetchAll();
  };

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold">Orders</h1>
        </div>
      </Header>

      <Main>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell>#{order.orderId}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {order.customerName ?? "—"}
                      </div>
                      {order.customerEmail && (
                        <div className="text-xs text-muted-foreground">
                          {order.customerEmail}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={orderStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusVariant(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openManage(order)}
                      >
                        <Eye className="mr-1 size-3" />
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Main>

      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Order #{selectedOrder?.orderId}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>{" "}
                  <span className="font-medium">
                    {selectedOrder.customerName ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium">
                    {selectedOrder.customerEmail ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment:</span>{" "}
                  <Badge
                    variant={paymentStatusVariant(selectedOrder.paymentStatus)}
                  >
                    {selectedOrder.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>{" "}
                  <span className="font-medium">
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
                {selectedOrder.shippingAddress && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Shipping:</span>{" "}
                    <span>{selectedOrder.shippingAddress}</span>
                  </div>
                )}
              </div>

              {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                <div>
                  <p className="mb-1.5 text-sm font-medium">Items</p>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.orderItems.map((item) => (
                          <TableRow key={item.orderItemId}>
                            <TableCell>{item.productName ?? `#${item.productId}`}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${item.subtotal.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Update Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as OrderStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedOrder(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={saving}>
              {saving ? "Saving…" : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
