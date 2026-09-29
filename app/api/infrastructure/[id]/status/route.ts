import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { findOne, updateOne, now } from "@/lib/db";
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: issueId } = await params;
  try {
    const u = await requireRole(["staff", "admin"]);
    const { status, comment } = await req.json();
    if (
      ![
        "pending",
        "in_review",
        "assigned",
        "in_progress",
        "resolved",
        "rejected",
      ].includes(status)
    )
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    const r: any = await findOne("infrastructure_issues", { _id: issueId });
    if (!r) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({
      issue: await updateOne(
        "infrastructure_issues",
        { _id: issueId },
        {
          status,
          statusHistory: [
            ...(r.statusHistory || []),
            { status, by: u.name, comment, at: now() },
          ],
          updatedAt: now(),
        },
      ),
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: "Unauthorized or invalid request" },
      { status: 401 },
    );
  }
}
