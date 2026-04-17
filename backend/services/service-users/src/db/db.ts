import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "anime_app",
  password: process.env.DB_PASSWORD || "anime_app_password",
  database: process.env.DB_NAME || "anime_dating",
  waitForConnections: true,
  connectionLimit: 10
});
