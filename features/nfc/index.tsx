"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
import { apiClient } from "@/lib/api-client";
import type { CardProduct, CardProductBindRequest } from "@/types";

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "READY") return "default";
  if (status === "PENDING_BIND") return "outline";
  if (status === "SOLD" || status === "LINKED") return "secondary";
  if (status === "DEACTIVATED") return "destructive";
  return "outline";
}

export function NfcFeature() {
  const [items, setItems] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [bindTarget, setBindTarget] = useState<CardProduct | null>(null);
  const [nfcUid, setNfcUid] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const res = await apiClient.get<CardProduct[]>("/api/card-products");
    if (res.error) toast.error(res.error);
    else setItems(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const displayedItems = showAll
    ? items
    : items.filter((c) => c.status === "PENDING_BIND");

  const openBind = (card: CardProduct) => {
    setNfcUid(card.nfcUid ?? "");
    setBindTarget(card);
  };

  const handleBind = async () => {
    if (!bindTarget) return;
    if (!nfcUid.trim()) {
      toast.error("NFC UID is required.");
      return;
    }
    setSaving(true);
    const body: CardProductBindRequest = { nfcUid: nfcUid.trim() };
    const res = await apiClient.patch<CardProduct>(
      `/api/card-products/${bindTarget.cardProductId}/bind`,
      body
    );
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("NFC UID bound successfully.");
    setBindTarget(null);
    setNfcUid("");
    fetchAll();
  };

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-lg font-semibold">NFC Binding</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Show Pending Only" : "Show All Cards"}
          </Button>
        </div>
      </Header>

      <Main>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Serial #</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>NFC UID</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : displayedItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No cards found.
                  </TableCell>
                </TableRow>
              ) : (
                displayedItems.map((card) => (
                  <TableRow key={card.cardProductId}>
                    <TableCell>{card.cardProductId}</TableCell>
                    <TableCell>
                      {card.template?.name ?? `Template #${card.cardTemplateId}`}
                    </TableCell>
                    <TableCell>{card.serialNumber ?? "—"}</TableCell>
                    <TableCell>{card.productionBatch ?? "—"}</TableCell>
                    <TableCell>{card.condition}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(card.status)}>
                        {card.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {card.nfcUid ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openBind(card)}
                        disabled={card.status === "DEACTIVATED"}
                      >
                        <Link2 className="mr-1 size-3" />
                        Bind
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Main>

      <Dialog open={!!bindTarget} onOpenChange={() => setBindTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bind NFC UID</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Card:{" "}
              <span className="font-medium text-foreground">
                {bindTarget?.template?.name ??
                  `Template #${bindTarget?.cardTemplateId}`}{" "}
                — #{bindTarget?.serialNumber ?? bindTarget?.cardProductId}
              </span>
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="nfc-uid">NFC UID</Label>
              <Input
                id="nfc-uid"
                value={nfcUid}
                onChange={(e) => setNfcUid(e.target.value)}
                placeholder="e.g. 04AB12CD"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBindTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleBind} disabled={saving}>
              {saving ? "Saving…" : "Bind"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
