import { NextResponse } from "next/server";
import { findOne } from "@/lib/db";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: issueId } = await params;
  const r = await findOne("infrastructure_issues", { _id: issueId });
  return r
    ? NextResponse.json({ issue: r })
    : NextResponse.json({ message: "Issue not found" }, { status: 404 });
}
