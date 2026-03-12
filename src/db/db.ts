import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "4rfv$RFV",
  database: "anime_dating",
  waitForConnections: true,
  connectionLimit: 10
});