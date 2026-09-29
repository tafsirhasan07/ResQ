import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import { ensureDB, findOne, id, insert, now, updateOne } from "../lib/db";

async function main() {
  loadEnvConfig(process.cwd());

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required to create a production admin.");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Set ADMIN_EMAIL to a valid email address.");
  }
  if (!password || password.length < 16) {
    throw new Error("Set ADMIN_PASSWORD to at least 16 characters.");
  }
  if (!(await ensureDB())) {
    throw new Error("Could not connect to MongoDB.");
  }

  const existing = await findOne<Record<string, any>>("users", { email });
  const passwordHash = await bcrypt.hash(password, 12);
  const name = process.env.ADMIN_NAME?.trim() || existing?.name || "ResQ Admin";
  if (existing) {
    await updateOne(
      "users",
      { email },
      { name, passwordHash, role: "admin", blocked: false },
    );
  } else {
    await insert("users", {
      _id: id("usr_"),
      name,
      email,
      passwordHash,
      role: "admin",
      createdAt: now(),
    });
  }

  console.log(`Admin account ready for ${email}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Admin setup failed.");
  process.exitCode = 1;
});
