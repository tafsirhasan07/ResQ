import { NextResponse } from "next/server";
import { findOne } from "@/lib/db";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: reportId } = await params;
  const r = await findOne("crisis_reports", { _id: reportId });
  return r
    ? NextResponse.json({ report: r })
    : NextResponse.json({ message: "Report not found" }, { status: 404 });
}
