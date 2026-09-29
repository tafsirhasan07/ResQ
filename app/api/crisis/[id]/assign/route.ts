import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { findOne, updateOne, now } from "@/lib/db";
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: reportId } = await params;
  try {
    const u = await requireRole(["admin"]);
    const { staffId } = await req.json();
    const r: any = await findOne("crisis_reports", { _id: reportId });
    if (!r) return NextResponse.json({ message: "Not found" }, { status: 404 });
    const history = [
      ...(r.statusHistory || []),
      {
        status: "assigned",
        by: u.name,
        at: now(),
        comment: `Assigned to ${staffId}`,
      },
    ];
    return NextResponse.json({
      report: await updateOne(
        "crisis_reports",
        { _id: reportId },
        {
          assignedTo: staffId,
          status: "assigned",
          statusHistory: history,
          updatedAt: now(),
        },
      ),
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        message:
          e.message === "UNAUTHORIZED" ? "Unauthorized" : "Assignment failed",
      },
      { status: e.message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
