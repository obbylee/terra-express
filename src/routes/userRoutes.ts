import { Request, Response, Router } from "express";
import { db } from "../lib/db";
import { usersTable } from "../../drizzle/schema";
import { eq, or } from "drizzle-orm";

const userRoutes = Router();

userRoutes.use((req: Request, res: Response, next) => {
  console.log("Time:", Date.now(), " - Request to /users api route");
  next();
});

userRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        profilePicture: usersTable.profilePicture,
        bio: usersTable.bio,
      })
      .from(usersTable);
    return res.status(200).json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

userRoutes.get("/:identifier", async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;

    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        profilePicture: usersTable.profilePicture,
        bio: usersTable.bio,
      })
      .from(usersTable)
      .where(
        or(
          eq(usersTable.email, identifier),
          eq(usersTable.username, identifier),
        ),
      );

    if (users.length > 0) {
      return res.status(200).json(users[0]);
    }

    return res.status(404).json({ message: "User not found." });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

userRoutes.get("/:identifier/spaces", async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;

    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        profilePicture: usersTable.profilePicture,
        bio: usersTable.bio,
      })
      .from(usersTable)
      .where(
        or(
          eq(usersTable.email, identifier),
          eq(usersTable.username, identifier),
        ),
      );

    if (users.length > 0) {
      return res.status(200).json(users[0]);
    }

    return res.status(404).json({ message: "User not found." });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default userRoutes;
