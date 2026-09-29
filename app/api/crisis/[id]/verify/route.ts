import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { findOne, updateOne, now } from "@/lib/db";
export async function PATCH(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: reportId } = await params;
  try {
    const u = await requireRole(["admin"]);
    const r: any = await findOne("crisis_reports", { _id: reportId });
    if (!r) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({
      report: await updateOne(
        "crisis_reports",
        { _id: reportId },
        { status: "in_review", updatedAt: now(), verifiedBy: u._id },
      ),
    });
  } catch (e: any) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
