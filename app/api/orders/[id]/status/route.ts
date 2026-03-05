import { apiFetchAuthed, Res } from "@/app/api/orchestra";
import type { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { ok, status, data, error } = await apiFetchAuthed(
    `/orders/${id}/status`,
    { method: "PATCH", body: JSON.stringify(body) }
  );
  if (!ok) return Res.upstream(error!, status);
  return Res.ok(data);
}
