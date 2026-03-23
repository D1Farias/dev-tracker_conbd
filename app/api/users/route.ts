import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await connectDB();
    const [rows] = await db.query("SELECT * FROM users");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, password, role, avatar } = data;
    const db = await connectDB();

    const [rows]: any = await db.query("SELECT MAX(CAST(id AS UNSIGNED)) as maxId FROM users");
    const id = ((rows[0].maxId || 0) + 1).toString();

    await db.query(
      "INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name, email, password, role || 'developer', avatar || 'U']
    );
    return NextResponse.json({ success: true, user: { ...data, id } }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
