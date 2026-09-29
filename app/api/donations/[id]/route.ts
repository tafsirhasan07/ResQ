import { NextResponse } from "next/server";
import { findOne } from "@/lib/db";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: campaignId } = await params;
  const c = await findOne("campaigns", { _id: campaignId });
  return c
    ? NextResponse.json({ campaign: c })
    : NextResponse.json({ message: "Campaign not found" }, { status: 404 });
}
