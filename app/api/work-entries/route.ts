import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await connectDB();
    const [rows] = await db.query("SELECT * FROM work_entries");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching work entries:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { userId, projectId, taskId, date, hours, description } = data;
    const db = await connectDB();

    const [rows]: any = await db.query("SELECT MAX(CAST(id AS UNSIGNED)) as maxId FROM work_entries");
    const id = ((rows[0].maxId || 0) + 1).toString();

    await db.query(
      "INSERT INTO work_entries (id, userId, projectId, task_id, date, hours, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, userId, projectId, taskId ?? null, date, hours, description || ""]
    );
    return NextResponse.json({ success: true, workEntry: { ...data, id, taskId: taskId ?? null } }, { status: 201 });
  } catch (error) {
    console.error("Error creating work entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
