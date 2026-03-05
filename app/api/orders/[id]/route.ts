import { apiFetchAuthed, Res } from "@/app/api/orchestra";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { ok, status, data, error } = await apiFetchAuthed(`/orders/${id}`);
  if (!ok) return Res.upstream(error!, status);
  return Res.ok(data);
}
