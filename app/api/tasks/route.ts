import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await connectDB();
    const [rows] = await db.query("SELECT * FROM tasks");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { title, description, projectId, status, assignedTo } = data;
    const db = await connectDB();
    
    const [rows]: any = await db.query("SELECT MAX(CAST(id AS UNSIGNED)) as maxId FROM tasks");
    const id = ((rows[0].maxId || 0) + 1).toString();
    
    await db.query(
      "INSERT INTO tasks (id, title, description, projectId, status, assignedTo) VALUES (?, ?, ?, ?, ?, ?)",
      [id, title, description, projectId, status || 'pending', assignedTo || null]
    );

    return NextResponse.json({ success: true, task: { ...data, id } }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
