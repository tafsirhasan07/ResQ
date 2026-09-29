import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmail, setSession, verifyPassword } from "@/lib/auth";
import { seedIfEmpty } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV !== "production") await seedIfEmpty();

    const result = loginSchema.safeParse(await req.json());
    if (!result.success) {
      return NextResponse.json(
        { message: "Enter a valid email and password." },
        { status: 400 },
      );
    }

    const { email, password } = result.data;
    const u = await findUserByEmail(email.toLowerCase());
    if (!u || u.blocked || !(await verifyPassword(password, u.passwordHash)))
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    await setSession(u);
    return NextResponse.json({
      user: { id: u._id, name: u.name, email: u.email, role: u.role },
    });
  } catch (error) {
    console.error(
      "Sign-in request failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { message: "Sign-in service unavailable. Check the database configuration." },
      { status: 503 },
    );
  }
}
