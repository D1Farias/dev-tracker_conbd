import { getUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
    // Llamamos a la base de datos directamente desde el servidor
    const usuarios = await getUsers();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Lista de Usuarios</h1>
            <ul>
                {usuarios.map((user: any) => (
                    <li key={user.id} className="mb-2 p-2 border rounded">
                        {user.name} - {user.email}
                    </li>
                ))}
            </ul>
        </div>
    );
}
