"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, PackageCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import type { PurchaseOrder, Supplier, Warehouse } from "@/types";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "RECEIVED" | "CANCELLED";

type ActionType = "approve" | "reject" | "receive";

type PendingAction = {
  type: ActionType;
  po: PurchaseOrder;
};

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "RECEIVED") return "default";
  if (status === "APPROVED") return "secondary";
  if (status === "CANCELLED") return "destructive";
  return "outline";
}

const ACTION_LABELS: Record<ActionType, string> = {
  approve: "Approve",
  reject: "Reject",
  receive: "Mark as Received",
};

const ACTION_DESCRIPTIONS: Record<ActionType, string> = {
  approve: "This will approve the purchase order and notify the relevant parties.",
  reject: "This will cancel the purchase order. This action cannot be undone.",
  receive: "This will mark the purchase order as received, confirming delivery.",
};

type Props = {
  initialFilter?: StatusFilter;
  title?: string;
};

export function StaffPurchaseOrdersFeature({
  initialFilter = "ALL",
  title = "Purchase Orders",
}: Props) {
  const [items, setItems] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialFilter);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [acting, setActing] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  const fetchAll = async () => {
    const [poRes, supRes, whRes] = await Promise.all([
      apiClient.get<PurchaseOrder[]>("/api/purchase-orders"),
      apiClient.get<Supplier[]>("/api/suppliers"),
      apiClient.get<Warehouse[]>("/api/warehouses"),
    ]);
    if (poRes.error) toast.error(poRes.error);
    else setItems(Array.isArray(poRes.data) ? poRes.data : []);
    if (!supRes.error) setSuppliers(Array.isArray(supRes.data) ? supRes.data : []);
    if (!whRes.error) setWarehouses(Array.isArray(whRes.data) ? whRes.data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const supplierName = (id: number) =>
    suppliers.find((s) => s.supplierId === id)?.name ?? String(id);
  const warehouseName = (id: number) =>
    warehouses.find((w) => w.warehouseId === id)?.name ?? String(id);

  const filteredItems =
    statusFilter === "ALL"
      ? items
      : items.filter((po) => po.status === statusFilter);

  const confirmAction = (type: ActionType, po: PurchaseOrder) => {
    setPendingAction({ type, po });
  };

  const executeAction = async () => {
    if (!pendingAction) return;
    setActing(true);

    const { type, po } = pendingAction;
    const endpoint = `/api/purchase-orders/${po.poId}/${type}`;
    const res = await fetch(endpoint, { method: "PATCH" });

    setActing(false);
    setPendingAction(null);

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      toast.error(payload?.error ?? "Action failed.");
      return;
    }

    const successMessages: Record<ActionType, string> = {
      approve: "Purchase order approved.",
      reject: "Purchase order rejected.",
      receive: "Purchase order marked as received.",
    };
    toast.success(successMessages[type]);
    fetchAll();
  };

  const STATUS_FILTERS: StatusFilter[] = [
    "ALL",
    "PENDING",
    "APPROVED",
    "RECEIVED",
    "CANCELLED",
  ];

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-lg font-semibold">{title}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {statusFilter === "ALL" ? "All Statuses" : statusFilter}
                <ChevronDown className="ml-1 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STATUS_FILTERS.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={statusFilter === s ? "font-medium" : ""}
                >
                  {s === "ALL" ? "All Statuses" : s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Header>

      <Main>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {loading ? (
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            ) : (
            <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No purchase orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((po, i) => (
                    <TableRow
                      key={po.poId ?? i}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => setSelectedPo(po)}
                    >
                      <TableCell className="font-mono text-sm">
                        {po.poId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {po.poNumber}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(po.status)}>
                          {po.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{supplierName(po.supplierId)}</TableCell>
                      <TableCell>{warehouseName(po.warehouseId)}</TableCell>
                      <TableCell>
                        {po.orderDate
                          ? new Date(po.orderDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {po.expectedDelivery
                          ? new Date(po.expectedDelivery).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {po.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Approve"
                                onClick={() => confirmAction("approve", po)}
                              >
                                <CheckCircle className="size-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Reject"
                                onClick={() => confirmAction("reject", po)}
                              >
                                <XCircle className="size-4 text-destructive" />
                              </Button>
                            </>
                          )}
                          {po.status === "APPROVED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Mark as Received"
                              onClick={() => confirmAction("receive", po)}
                            >
                              <PackageCheck className="size-4 text-blue-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
        </TableBody>
            )}
          </Table>
        </div>
      </Main>

      {/* PO Detail Sheet */}
      <Sheet open={!!selectedPo} onOpenChange={() => setSelectedPo(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>PO #{selectedPo?.poNumber}</SheetTitle>
          </SheetHeader>
          {selectedPo && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusVariant(selectedPo.status)}>
                  {selectedPo.status}
                </Badge>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Supplier</span>
                <span className="font-medium">
                  {supplierName(selectedPo.supplierId)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Warehouse</span>
                <span className="font-medium">
                  {warehouseName(selectedPo.warehouseId)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Order Date</span>
                <span>
                  {selectedPo.orderDate
                    ? new Date(selectedPo.orderDate).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Expected Delivery</span>
                <span>
                  {selectedPo.expectedDelivery
                    ? new Date(selectedPo.expectedDelivery).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              {/* Action buttons inside sheet */}
              <div className="flex flex-col gap-2 pt-4">
                {selectedPo.status === "PENDING" && (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedPo(null);
                        confirmAction("approve", selectedPo);
                      }}
                    >
                      <CheckCircle className="mr-2 size-4" /> Approve PO
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        setSelectedPo(null);
                        confirmAction("reject", selectedPo);
                      }}
                    >
                      <XCircle className="mr-2 size-4" /> Reject PO
                    </Button>
                  </>
                )}
                {selectedPo.status === "APPROVED" && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedPo(null);
                      confirmAction("receive", selectedPo);
                    }}
                  >
                    <PackageCheck className="mr-2 size-4" /> Mark as Received
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirm Action Dialog */}
      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={() => setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction
                ? ACTION_LABELS[pendingAction.type]
                : ""}{" "}
              Purchase Order?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction ? ACTION_DESCRIPTIONS[pendingAction.type] : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={acting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction} disabled={acting}>
              {acting ? "Processing…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
