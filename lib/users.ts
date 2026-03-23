import { connectDB } from "@/lib/db";

export async function getUsers() {
  const db = await connectDB();
  const [rows] = await db.query("SELECT * FROM users");
  return rows as any[];
}
