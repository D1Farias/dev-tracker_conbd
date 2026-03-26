import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, context: any) {
  try {
    const { id } = await context.params;
    const db = await connectDB();
    const [rows]: any = await db.query("SELECT * FROM work_entries WHERE id = ?", [id]);
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Work entry not found" }, { status: 404 });
    }
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching work entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: any) {
  try {
    const { id } = await context.params;
    const data = await req.json();
    const { userId, projectId, date, hours, description } = data;

    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    if (userId) { fieldsToUpdate.push("userId = ?"); values.push(userId); }
    if (projectId) { fieldsToUpdate.push("projectId = ?"); values.push(projectId); }
    if (date) { fieldsToUpdate.push("date = ?"); values.push(date); }
    if (hours !== undefined) { fieldsToUpdate.push("hours = ?"); values.push(hours); }
    if (description !== undefined) { fieldsToUpdate.push("description = ?"); values.push(description); }

    if (fieldsToUpdate.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE work_entries SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;

    const db = await connectDB();
    await db.query(query, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating work entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const { id } = await context.params;
    const db = await connectDB();
    await db.query("DELETE FROM work_entries WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting work entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
