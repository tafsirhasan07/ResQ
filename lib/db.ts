import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
const storage = path.join(process.cwd(), "storage", "resq.json");
let mongoReady: Promise<boolean> | null = null;
type Root = Record<string, any[]>;
const empty: Root = {
  users: [],
  crisis_reports: [],
  infrastructure_issues: [],
  campaigns: [],
  donations: [],
  shelters: [],
  notifications: [],
  audit_logs: [],
};
async function readLocal(): Promise<Root> {
  try {
    return { ...empty, ...JSON.parse(await fs.readFile(storage, "utf8")) };
  } catch {
    return structuredClone(empty);
  }
}
let writeLock = Promise.resolve();
async function writeLocal(data: Root) {
  writeLock = writeLock.then(async () => {
    await fs.mkdir(path.dirname(storage), { recursive: true });
    await fs.writeFile(storage, JSON.stringify(data, null, 2), "utf8");
  });
  return writeLock;
}
export async function ensureDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MONGODB_URI is required in production.");
    }
    return false;
  }
  if (!mongoReady)
    mongoReady = mongoose
      .connect(mongoUri)
      .then(() => true)
      .catch((error) => {
        if (process.env.NODE_ENV === "production") {
          console.error("MongoDB connection failed in production.");
          throw new Error("MongoDB connection failed.");
        }
        console.warn(
          "MongoDB unavailable; using local development store.",
          error instanceof Error ? error.message : error,
        );
        return false;
      });
  return mongoReady;
}
export async function all<T = any>(collection: string): Promise<T[]> {
  const mongo = await ensureDB();
  if (mongo && mongoose.connection.db) {
    return (await mongoose.connection.db
      .collection(collection)
      .find({})
      .toArray()) as T[];
  }
  const d = await readLocal();
  return (d[collection] || []) as T[];
}
export async function findOne<T = any>(
  collection: string,
  filter: Record<string, any>,
): Promise<T | null> {
  const mongo = await ensureDB();
  if (mongo && mongoose.connection.db)
    return (await mongoose.connection.db
      .collection(collection)
      .findOne(filter)) as T | null;
  const rows = await all<T>(collection);
  return (
    rows.find((r) =>
      Object.entries(filter).every(([k, v]) => (r as any)[k] === v),
    ) || null
  );
}
export async function insert<T extends Record<string, any>>(
  collection: string,
  row: T,
) {
  const mongo = await ensureDB();
  if (mongo && mongoose.connection.db) {
    await mongoose.connection.db.collection(collection).insertOne(row);
    return row;
  }
  const d = await readLocal();
  d[collection] = d[collection] || [];
  d[collection].push(row);
  await writeLocal(d);
  return row;
}
export async function updateOne(
  collection: string,
  filter: Record<string, any>,
  patch: Record<string, any>,
) {
  const mongo = await ensureDB();
  if (mongo && mongoose.connection.db) {
    await mongoose.connection.db
      .collection(collection)
      .updateOne(filter, { $set: patch });
    return findOne(collection, filter);
  }
  const d = await readLocal();
  const i = (d[collection] || []).findIndex((r) =>
    Object.entries(filter).every(([k, v]) => r[k] === v),
  );
  if (i < 0) return null;
  d[collection][i] = { ...d[collection][i], ...patch };
  await writeLocal(d);
  return d[collection][i];
}
export async function removeOne(
  collection: string,
  filter: Record<string, any>,
) {
  const mongo = await ensureDB();
  if (mongo && mongoose.connection.db) {
    await mongoose.connection.db.collection(collection).deleteOne(filter);
    return;
  }
  const d = await readLocal();
  d[collection] = (d[collection] || []).filter(
    (r) => !Object.entries(filter).every(([k, v]) => r[k] === v),
  );
  await writeLocal(d);
}
export async function count(collection: string, filter?: Record<string, any>) {
  const rows = await all(collection);
  return filter
    ? rows.filter((r) => Object.entries(filter).every(([k, v]) => r[k] === v))
        .length
    : rows.length;
}
export function id(prefix = "") {
  return `${prefix}${crypto.randomUUID()}`;
}
export function now() {
  return new Date().toISOString();
}
export async function seedIfEmpty() {
  const users = await all("users");
  if (users.length) return;
  await insert("users", {
    _id: id("usr_"),
    name: "ResQ Admin",
    email: "admin@resq.local",
    passwordHash: await (await import("bcryptjs")).hash("Admin@12345", 12),
    role: "admin",
    createdAt: now(),
  });
  await insert("users", {
    _id: id("usr_"),
    name: "ResQ Staff",
    email: "staff@resq.local",
    passwordHash: await (await import("bcryptjs")).hash("Staff@12345", 12),
    role: "staff",
    createdAt: now(),
  });
  await insert("users", {
    _id: id("usr_"),
    name: "Demo Citizen",
    email: "citizen@resq.local",
    passwordHash: await (await import("bcryptjs")).hash("Citizen@12345", 12),
    role: "citizen",
    createdAt: now(),
  });
  const campaigns: any[] = [
    [
      "Flood Relief 2026",
      "Emergency food, medicine and temporary support for flood-affected families.",
      "Flood",
      "ResQ Relief Team",
      "Bangladesh",
      500000,
      124500,
      true,
    ],
    [
      "Community Medical Support",
      "Help fund essential treatment and medicines for vulnerable patients.",
      "Medical",
      "ResQ Health Fund",
      "Dhaka",
      300000,
      88500,
      false,
    ],
    [
      "Safe Shelter & Sanitation",
      "Support safe temporary accommodation, clean water and sanitation.",
      "Water & Sanitation",
      "ResQ Community",
      "Sylhet",
      250000,
      97000,
      true,
    ],
  ];
  for (const [
    title,
    description,
    category,
    organizer,
    location,
    target,
    raised,
    urgent,
  ] of campaigns)
    await insert("campaigns", {
      _id: id("cmp_"),
      title,
      description,
      category,
      organizer,
      location,
      target,
      raised,
      donorCount: 0,
      verified: true,
      active: true,
      urgent,
      createdAt: now(),
      updatedAt: now(),
    });
  const shelters: any[] = [
    [
      "Banani Emergency Shelter",
      "Road 11, Banani, Dhaka",
      23.7937,
      90.4043,
      "01700000001",
      500,
      180,
      ["Food", "Medical care", "Accessible"],
    ],
    [
      "Dhanmondi Community Shelter",
      "Road 27, Dhanmondi, Dhaka",
      23.7465,
      90.376,
      "01700000002",
      350,
      330,
      ["Food", "Accessible"],
    ],
    [
      "Sylhet Flood Shelter",
      "Zindabazar, Sylhet",
      24.8949,
      91.8687,
      "01700000003",
      700,
      420,
      ["Food", "Medical care", "Pets allowed"],
    ],
  ];
  for (const [
    name,
    address,
    latitude,
    longitude,
    phone,
    capacity,
    occupancy,
    facilities,
  ] of shelters) {
    const status =
      occupancy >= capacity
        ? "full"
        : occupancy >= capacity * 0.8
          ? "limited"
          : "available";
    await insert("shelters", {
      _id: id("sh_"),
      name,
      address,
      latitude,
      longitude,
      phone,
      capacity,
      occupancy,
      facilities,
      status,
      approved: true,
      active: true,
      createdAt: now(),
      updatedAt: now(),
    });
  }
}
