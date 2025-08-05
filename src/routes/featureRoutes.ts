import { Request, Response, Router } from "express";
import { eq, ilike } from "drizzle-orm";
import z from "zod";
import { db } from "../lib/db";
import { feature } from "../../drizzle/schema";
import { isAuthenticated } from "../middlewares/auth";
import {
  CreateSpaceFeatureRequestSchema,
  UpdateSpaceFeatureRequestSchema,
} from "../schemas/featureSchema";

const IdentifierSchema = z.object({
  identifier: z.string().min(1),
});

const featureRoutes = Router();

featureRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const features = await db.select().from(feature);
    return res.status(200).json(features);
  } catch (error) {
    console.error("Failed to fetch features", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

featureRoutes.get("/:identifier", async (req: Request, res: Response) => {
  try {
    const { identifier } = IdentifierSchema.parse(req.params);

    const paramIsUuid = z.uuid().safeParse(identifier);

    let result = [];

    if (paramIsUuid.success) {
      result = await db
        .select()
        .from(feature)
        .where(eq(feature.id, paramIsUuid.data))
        .limit(1);
    } else {
      result = await db
        .select()
        .from(feature)
        .where(ilike(feature.name, identifier))
        .limit(1);
    }

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "Feature not found." });
    }

    return res.status(200).json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid identifier." });
    }

    console.error("Failed to fetch features", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

featureRoutes.post(
  "/",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const payload = CreateSpaceFeatureRequestSchema.parse(req.body);

      const featureExist = await db
        .select()
        .from(feature)
        .where(ilike(feature.name, payload.name));

      if (featureExist.length > 0) {
        return res.status(409).json({ message: "Feature already exists." });
      }

      const result = await db
        .insert(feature)
        .values({
          name: payload.name,
          descriptions: payload.descriptions,
        })
        .returning();

      return res
        .status(201)
        .json({ message: "Feature created successfully.", data: result });
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

featureRoutes.patch(
  "/:identifier",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { identifier } = req.params;

      const id = z.uuid().parse(identifier);

      const payload = UpdateSpaceFeatureRequestSchema.parse(req.body);

      const result = await db
        .update(feature)
        .set(payload)
        .where(eq(feature.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Feature not found." });
      }

      return res
        .status(200)
        .json({ message: "Feature updated successfully.", data: result });
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

featureRoutes.delete(
  "/:identifier",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { identifier } = req.params;

      const id = z.uuid().parse(identifier);

      const result = await db
        .delete(feature)
        .where(eq(feature.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Feature not found." });
      }

      return res
        .status(200)
        .json({ message: "Feature deleted successfully.", data: result });
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

export default featureRoutes;
