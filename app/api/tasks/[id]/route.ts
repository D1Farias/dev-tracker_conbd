import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function PUT(req: Request, context: any) {
  try {
    const { id } = await context.params;
    const data = await req.json();
    const { title, description, projectId, status, assignedTo } = data;
    
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    if (title !== undefined) { fieldsToUpdate.push("title = ?"); values.push(title); }
    if (description !== undefined) { fieldsToUpdate.push("description = ?"); values.push(description); }
    if (projectId !== undefined) { fieldsToUpdate.push("projectId = ?"); values.push(projectId); }
    if (status !== undefined) { fieldsToUpdate.push("status = ?"); values.push(status); }
    if (assignedTo !== undefined) { fieldsToUpdate.push("assignedTo = ?"); values.push(assignedTo || null); }

    if (fieldsToUpdate.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE tasks SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;

    const db = await connectDB();
    await db.query(query, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const { id } = await context.params;
    const db = await connectDB();
    
    // Eliminar registros de trabajo asociados a esta tarea
    await db.query("DELETE FROM work_entries WHERE task_id = ?", [id]);
    // Eliminar la tarea
    await db.query("DELETE FROM tasks WHERE id = ?", [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
