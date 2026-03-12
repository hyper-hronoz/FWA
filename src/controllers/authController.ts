import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/db";

export const register = async (req: Request, res: Response) => {
 const { username, email, password, age } = req.body;

 const hash = await bcrypt.hash(password, 10);

 await db.query(
   "INSERT INTO users (username,email,password_hash,age) VALUES (?,?,?,?)",
   [username, email, hash, age]
 );

 res.json({ message: "User created" });
};

export const login = async (req: Request, res: Response) => {
 const { email, password } = req.body;

 const [rows]: any = await db.query(
   "SELECT * FROM users WHERE email=?",
   [email]
 );

 const user = rows[0];

 if (!user) {
   return res.status(404).json({ message: "User not found" });
 }

 const valid = await bcrypt.compare(password, user.password_hash);

 if (!valid) {
   return res.status(401).json({ message: "Invalid password" });
 }

 const token = jwt.sign(
   { id: user.id, email: user.email },
   "SECRET_KEY",
   { expiresIn: "1d" }
 );

 res.json({ token });
};