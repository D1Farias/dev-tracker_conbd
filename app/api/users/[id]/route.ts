import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, context: any) {
  try {
    const { id } = await context.params;
    const data = await req.json();
    const { name, email, password, role, avatar } = data;
    
    // Construir la query dinámicamente según lo que venga en el body
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    
    if (name) { fieldsToUpdate.push("name = ?"); values.push(name); }
    if (email) { fieldsToUpdate.push("email = ?"); values.push(email); }
    if (password) { fieldsToUpdate.push("password = ?"); values.push(password); }
    if (role) { fieldsToUpdate.push("role = ?"); values.push(role); }
    if (avatar) { fieldsToUpdate.push("avatar = ?"); values.push(avatar); }

    if (fieldsToUpdate.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE users SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;

    const db = await connectDB();
    await db.query(query, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const { id } = await context.params;
    const db = await connectDB();
    
    // Eliminar registros del usuario
    await db.query("DELETE FROM work_entries WHERE userId = ?", [id]);
    // Desasignar tareas
    await db.query("UPDATE tasks SET assignedTo = NULL WHERE assignedTo = ?", [id]);
    // Eliminar usuario
    await db.query("DELETE FROM users WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
