import { NextResponse } from "next/server";
import { findOne, updateOne, now } from "@/lib/db";
import { requireRole } from "@/lib/auth";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: shelterId } = await params;
  const s = await findOne("shelters", { _id: shelterId });
  return s
    ? NextResponse.json({ shelter: s })
    : NextResponse.json({ message: "Shelter not found" }, { status: 404 });
}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: shelterId } = await params;
  try {
    await requireRole(["admin"]);
    const b = await req.json();
    const s: any = await findOne("shelters", { _id: shelterId });
    if (!s) return NextResponse.json({ message: "Not found" }, { status: 404 });
    const occupancy =
      b.occupancy === undefined ? s.occupancy : Number(b.occupancy);
    const capacity = b.capacity === undefined ? s.capacity : Number(b.capacity);
    const patch = {
      ...b,
      occupancy,
      capacity,
      status:
        occupancy >= capacity
          ? "full"
          : occupancy >= capacity * 0.8
            ? "limited"
            : "available",
      updatedAt: now(),
    };
    return NextResponse.json({
      shelter: await updateOne("shelters", { _id: shelterId }, patch),
    });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
