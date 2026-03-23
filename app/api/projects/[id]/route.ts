import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, context: any) {
  try {
    const { id } = await context.params;
    const data = await req.json();
    const { name, color, description } = data;
    
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    
    if (name) { fieldsToUpdate.push("name = ?"); values.push(name); }
    if (color) { fieldsToUpdate.push("color = ?"); values.push(color); }
    if (description !== undefined) { fieldsToUpdate.push("description = ?"); values.push(description); }

    if (fieldsToUpdate.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE projects SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;

    const db = await connectDB();
    await db.query(query, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const { id } = await context.params;
    const db = await connectDB();
    await db.query("DELETE FROM projects WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
