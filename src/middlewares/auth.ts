import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { usersTable } from "../../drizzle/schema";
import { validateToken } from "../utils/token";

interface UserPayload {
  id: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload | null;
    }
  }
}

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message:
        "Authentication required: Invalid or missing Authorization header.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload: {
      userId: string;
      email: string;
    } | null = validateToken(token);

    if (!payload) {
      throw new Error("Invalid token payload structure.");
    }

    const user = await db
      .select({ id: usersTable.id, username: usersTable.username })
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId));

    if (user.length === 0) {
      return res
        .status(401)
        .json({ message: "Authentication failed: User not found." });
    }

    req.user = { id: user[0].id, username: user[0].username };
    next();
  } catch (error) {
    console.error("Token validation failed:", error);
    return res.status(403).json({ message: "Invalid token." });
  }
};
