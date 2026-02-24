import { apiFetchAuthed, Res } from "@/app/api/orchestra";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/purchase-orders/:id/reject — sets status to CANCELLED */
export async function PATCH(_req: Request, { params }: Params) {
  const { id } = await params;
  const { ok, status, data, error } = await apiFetchAuthed(
    `/purchase-orders/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({ status: "CANCELLED" }),
    }
  );
  if (!ok) return Res.upstream(error!, status);
  return Res.ok(data);
}
