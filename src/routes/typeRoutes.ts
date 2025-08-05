import { Request, Response, Router } from "express";
import { eq, ilike } from "drizzle-orm";
import z from "zod";
import { db } from "../lib/db";
import { spaceType } from "../../drizzle/schema";
import { isAuthenticated } from "../middlewares/auth";
import {
  CreateSpaceTypeRequestSchema,
  UpdateSpaceTypeRequestSchema,
} from "../schemas/typeSchema";

const IdentifierSchema = z.object({
  identifier: z.string().min(1),
});

const typeRoutes = Router();

typeRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const types = await db.select().from(spaceType);
    return res.status(200).json(types);
  } catch (error) {
    console.error("Failed to fetch space types", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

typeRoutes.get("/:identifier", async (req: Request, res: Response) => {
  try {
    const { identifier } = IdentifierSchema.parse(req.params);

    const paramIsUuid = z.uuid().safeParse(identifier);

    let result = [];

    if (paramIsUuid.success) {
      result = await db
        .select()
        .from(spaceType)
        .where(eq(spaceType.id, paramIsUuid.data))
        .limit(1);
    } else {
      result = await db
        .select()
        .from(spaceType)
        .where(ilike(spaceType.name, identifier))
        .limit(1);
    }

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "Space type not found." });
    }

    return res.status(200).json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid identifier." });
    }

    console.error("Failed to fetch space types", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

typeRoutes.post("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const payload = CreateSpaceTypeRequestSchema.parse(req.body);

    const spaceTypeExist = await db
      .select()
      .from(spaceType)
      .where(ilike(spaceType.name, payload.name));

    if (spaceTypeExist.length > 0) {
      return res.status(409).json({ message: "Space type already exists." });
    }

    const result = await db
      .insert(spaceType)
      .values({
        name: payload.name,
        descriptions: payload.descriptions,
      })
      .returning();

    return res
      .status(201)
      .json({ message: "Space type created successfully.", data: result });
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
    console.error("Internal Server Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

typeRoutes.patch(
  "/:identifier",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { identifier } = req.params;

      const id = z.uuid().parse(identifier);

      const payload = UpdateSpaceTypeRequestSchema.parse(req.body);

      const result = await db
        .update(spaceType)
        .set(payload)
        .where(eq(spaceType.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Space type not found." });
      }

      return res
        .status(200)
        .json({ message: "Space type updated successfully.", data: result });
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

      console.error("Internal Server Error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },
);

typeRoutes.delete(
  "/:identifier",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { identifier } = req.params;

      const id = z.uuid().parse(identifier);

      const result = await db
        .delete(spaceType)
        .where(eq(spaceType.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Space type not found." });
      }

      return res
        .status(200)
        .json({ message: "Space type deleted successfully.", data: result });
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

      console.error("Internal Server Error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },
);

export default typeRoutes;
