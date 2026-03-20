import { Request, response, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/db";
import type {AuthResponse} from "../shared/Auth"
import { User } from "../shared/Profile";

export const register = async (req: Request, res: Response) => {
 const { username, email, password, age } = req.body;
 console.log("Received body:", req.body);
 const hash = await bcrypt.hash(password, 10);

 await db.query(
  
   "INSERT INTO users (username,email,password_hash,age) VALUES (?,?,?,?)",
   [username, email, hash, age]
 );

 res.json({ message: "User created" });
};

export const login = async (req: Request, res: Response) => {
 const { email, password } = req.body;
 console.log("Received body:", req.body);
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
  const safeUser: User = {
          id: user.id,
          email: user.email,
          username: user.name,
          age: user.age,
          avatar: user.avatar,
          createdAt: user.createdAt,
          is_admin:user.is_admin
        };
  const response: AuthResponse = {
    user: safeUser,
    token: token
  };

 res.json(response);
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [rows]: any = await db.query(
      "SELECT id, username, email, age FROM users WHERE id = ?",
      [userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logOut = (req: Request, res: Response) => {
  res.json({ message: "Logged out. Delete token on client." });
};