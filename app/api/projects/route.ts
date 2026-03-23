import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await connectDB();
    const [rows] = await db.query("SELECT * FROM projects");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, color, description } = data;
    const db = await connectDB();
    
    const [rows]: any = await db.query("SELECT MAX(CAST(id AS UNSIGNED)) as maxId FROM projects");
    const id = ((rows[0].maxId || 0) + 1).toString();
    
    await db.query(
      "INSERT INTO projects (id, name, color, description) VALUES (?, ?, ?, ?)",
      [id, name, color, description || ""]
    );
    return NextResponse.json({ success: true, project: { ...data, id } }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
