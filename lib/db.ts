import mysql from "mysql2/promise";

// Evitar múltiples pools en desarrollo debido a Fast Refresh de Next.js
declare global {
  var _mysqlPool: mysql.Pool | undefined;
}

if (!global._mysqlPool) {
  global._mysqlPool = mysql.createPool({
    host: "localhost",
    user: "devuser",
    password: "1234",
    database: "pruebaxampp",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

export async function connectDB() {
  return global._mysqlPool!;
}
