import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowedContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes,
        maximumSizeInBytes: 25 * 1024 * 1024,
      }),
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error("Upload authorization failed", error);
    return NextResponse.json(
      { message: "Unable to authorize upload." },
      { status: 400 },
    );
  }
}
