import { Request, Response, Router } from "express";
import z from "zod";
import { category } from "../../drizzle/schema";
import { db } from "../lib/db";
import { eq, ilike } from "drizzle-orm";
import {
  CreateSpaceCategoryRequestSchema,
  UpdateSpaceCategoryRequestSchema,
} from "../schemas/categorySchema";
import { isAuthenticated } from "../middlewares/auth";

const IdentifierSchema = z.object({
  identifier: z.string().min(1),
});

const categoryRoutes = Router();

categoryRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const categories = await db.select().from(category);
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

categoryRoutes.get("/:identifier", async (req: Request, res: Response) => {
  try {
    const { identifier } = IdentifierSchema.parse(req.params);

    const paramIsUuid = z.uuid().safeParse(identifier);

    let result = [];

    if (paramIsUuid.success) {
      result = await db
        .select()
        .from(category)
        .where(eq(category.id, paramIsUuid.data))
        .limit(1);
    } else {
      result = await db
        .select()
        .from(category)
        .where(ilike(category.name, identifier))
        .limit(1);
    }

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }

    return res.status(200).json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid identifier." });
    }

    console.error("Failed to fetch categories", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

categoryRoutes.post(
  "/",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const payload = CreateSpaceCategoryRequestSchema.parse(req.body);

      const categoryExist = await db
        .select()
        .from(category)
        .where(ilike(category.name, payload.name));

      if (categoryExist.length > 0) {
        return res.status(409).json({ message: "Category already exists." });
      }

      const result = await db
        .insert(category)
        .values({
          name: payload.name,
          descriptions: payload.descriptions,
        })
        .returning();

      return res
        .status(201)
        .json({ message: "Category created successfully.", data: result });
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

categoryRoutes.patch(
  "/:identifier",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { identifier } = req.params;

      const id = z.uuid().parse(identifier);

      const payload = UpdateSpaceCategoryRequestSchema.parse(req.body);

      const result = await db
        .update(category)
        .set(payload)
        .where(eq(category.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Category not found." });
      }

      return res
        .status(200)
        .json({ message: "Category updated successfully.", data: result });
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

categoryRoutes.delete(
  "/:identifier",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { identifier } = req.params;

      const id = z.uuid().parse(identifier);

      const result = await db
        .delete(category)
        .where(eq(category.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Category not found." });
      }

      return res
        .status(200)
        .json({ message: "Category deleted successfully.", data: result });
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

export default categoryRoutes;
