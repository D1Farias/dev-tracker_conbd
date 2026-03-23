import mysql from "mysql2/promise";

export async function connectDB() {
  return await mysql.createConnection({
    host: "localhost",
    user: "devuser",
    password: "1234", // por defecto XAMPP no tiene password
    database: "pruebaxampp",
  });
}
