import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { findOne, updateOne, now } from "@/lib/db";
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: issueId } = await params;
  try {
    const u = await requireRole(["admin"]);
    const { staffId, note } = await req.json();
    const r: any = await findOne("infrastructure_issues", { _id: issueId });
    if (!r) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({
      issue: await updateOne(
        "infrastructure_issues",
        { _id: issueId },
        {
          assignedTo: staffId,
          status: "assigned",
          internalNote: note,
          updatedAt: now(),
          statusHistory: [
            ...(r.statusHistory || []),
            { status: "assigned", by: u.name, comment: note, at: now() },
          ],
        },
      ),
    });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
