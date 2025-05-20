import { sql } from "../../Config/ConnectDB.js";
import { Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import { hashPassword, VerifyPassword } from "../../Utils/HashPassword.js";

export const SignUp = async(req: Request, res: Response): Promise<Response | void> => {
  try {
    const {username, password, user_role} = req.body;
    if(!username || !password || !user_role) {
      return res.status(400).json({ErrorMsg: "Veuilleez remplir tous les champs !"});
    }

    const existingUser = await sql`
      select user_id from users where username = ${username}
    `;

    if (existingUser.length > 0) {
      return res.status(409).json({ ErrorMsg: "Utilisateur inexistant !" });
    }

    const newHashedPassword = await hashPassword(password);

    const insertedUser = await sql`
      insert into users (username, password, user_role)
      values (${username}, ${newHashedPassword}, ${user_role})
      returning user_id, username, user_role
    `;
    const newUser = insertedUser[0];
    return res.status(201).json({SuccessMsg: "Nouvel utilisateur crée !", newUser: newUser.username});
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}

export const Login = async(req: Request, res: Response): Promise<Response | void> => {
  try {
    const {username, password, user_role} = req.body;
    if(!username || !password || !user_role) {
      return res.status(400).json({ErrorMsg: "Veuilleez remplir tous les champs !"});
    }

    const VerifyUser = await sql`
      select * from users where username = ${username}
    `

    if(VerifyUser.length === 0) {
      return res.status(409).json({ ErrorMsg: "Utilisateur inexistant !" });
    }

    const userVerified = VerifyUser[0];

    try {
      await VerifyPassword(userVerified.password, password);
    } catch (err) {
      return res.status(401).json({ ErrorMsg: (err as Error).message });
    }

    if(userVerified.user_role !== user_role) {
      return res.status(401).json({ ErrorMsg: "Veuillez bien choisir votre role !" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if(!jwtSecret) {
      return res.status(500).json({ ErrorMsg: "JWT secret not found" });
    }

    const token = jsonwebtoken.sign({ userId: userVerified.user_id, user_role: userVerified.user_role}, jwtSecret, {expiresIn: "2h"})
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 2 * 1000,
      path: "/",
    })
    console.log("Token generated:", token);
    console.log("User verified:", userVerified);
    
    return res.status(200).json({SuccessMsg: `Bienvenue ${userVerified.username} !`, authenticatedUser: userVerified.username});
    
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error", error: (error as Error).message });
  }
}