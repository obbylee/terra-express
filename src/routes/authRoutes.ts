import { Router, Request, Response } from "express";
import z from "zod";
import { eq, or } from "drizzle-orm";

// Internal modules
import { db } from "../lib/db";
import { usersTable } from "../../drizzle/schema";
import { hashPassword, verifyPassword } from "../utils/password";
import { createToken } from "../utils/token";
import {
  LoginRequestSchema,
  RegisterRequestSchema,
} from "../schemas/authSchema";

const authRoutes = Router();

authRoutes.post("/login", async (req: Request, res: Response) => {
  try {
    const payload = LoginRequestSchema.parse(req.body);

    const user = await db
      .select()
      .from(usersTable)
      .where(
        or(
          eq(usersTable.email, payload.identifier),
          eq(usersTable.username, payload.identifier),
        ),
      );

    if (user.length === 0) {
      return res
        .status(403)
        .json({ message: "Invalid email, username or password" });
    }

    const credentials = await verifyPassword(
      payload.password,
      user[0].passwordHash,
    );

    if (!credentials) {
      return res
        .status(403)
        .json({ message: "Invalid email, username or password" });
    }

    const token = createToken({ userId: user[0].id, email: user[0].email });

    return res.status(200).json({
      token: token,
      message: "Login successfully.",
      userId: user[0].id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const err = error.issues.map((issue) => {
        return `Error on path "${issue.path.join(".")}": ${issue.message}`;
      });

      return res.status(400).json({
        message: "Invalid request payload",
        errors: err,
      });
    }

    console.error("Internal Server Error during login:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

authRoutes.post("/register", async (req: Request, res: Response) => {
  try {
    const payload = RegisterRequestSchema.parse(req.body);

    const hashedPassword = await hashPassword(payload.password);

    const avatarUrl = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${payload.username}&size=64`;

    const newuser = await db
      .insert(usersTable)
      .values({
        username: payload.username,
        email: payload.email,
        passwordHash: hashedPassword,
        profilePicture: avatarUrl,
        bio: "about me",
      })
      .returning();

    const token = createToken({
      userId: newuser[0].id,
      email: newuser[0].email,
    });

    return res.status(201).json({
      token: token,
      message: "User registered successfully.",
      userId: newuser[0].id,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const err = error.issues.map((issue) => {
        return `Error on path "${issue.path.join(".")}": ${issue.message}`;
      });

      return res.status(400).json({
        message: "Invalid request payload",
        errors: err,
      });
    } else if (error.cause?.code === "23505") {
      const constraintName = error.cause.constraint;
      let errorMessage = "A unique constraint was violated.";

      switch (constraintName) {
        case "users_email_unique":
          errorMessage = "Email already registered.";
          break;
        case "users_username_unique":
          errorMessage = "Username already registered.";
          break;
      }
      return res.status(409).json({ message: errorMessage });
    }

    console.error("Internal Server Error during registration:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

export default authRoutes;
