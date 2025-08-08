import { Request, Response, Router } from "express";
import { db } from "../lib/db";
import {
  category,
  feature,
  space,
  spaceToCategories,
  spaceToFeatures,
  spaceType,
  usersTable,
} from "../../drizzle/schema";
import { eq, ilike, inArray } from "drizzle-orm";
import z from "zod";
import {
  CreateSpaceRequestSchema,
  UpdateSpaceRequestSchema,
} from "../schemas/spaceSchema";
import { isAuthenticated } from "../middlewares/auth";
import { ensureUniqueSlug } from "../utils/slug";

const spaceRoutes = Router();

spaceRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const spaces = await db.query.space.findMany({
      columns: {
        submittedBy: false,
        typeId: false,
        createdAt: false,
        updatedAt: false,
      },
      with: {
        submittedBy: { columns: { username: true, email: true, bio: true } },
        spaceType: { columns: { name: true, descriptions: true } },
        categories: { with: { category: true } },
        features: { with: { feature: true } },
      },
    });

    const formattedSpaces = spaces.map((space) => {
      return {
        ...space,
        categories: space.categories.map((c) => c.category.name),
        features: space.features.map((f) => f.feature.name),
      };
    });

    return res.status(200).json(formattedSpaces);
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

spaceRoutes.get("/:identifier", async (req: Request, res: Response) => {
  try {
    const { identifier } = z
      .object({ identifier: z.string().min(1) })
      .parse(req.params);

    const isUuid = z.uuid().safeParse(identifier);

    const spaces = await db.query.space.findMany({
      columns: {
        submittedBy: false,
        typeId: false,
        createdAt: false,
        updatedAt: false,
      },
      with: {
        submittedBy: { columns: { username: true, email: true, bio: true } },
        spaceType: { columns: { name: true, descriptions: true } },
        categories: { with: { category: true } },
        features: { with: { feature: true } },
      },
      where: isUuid.success
        ? eq(space.id, isUuid.data)
        : ilike(space.slug, identifier),
    });

    if (spaces.length === 0) {
      return res.status(404).json({ message: "Space not found." });
    }

    const formattedSpaces = spaces.map((space) => {
      return {
        ...space,
        categories: space.categories.map((c) => c.category.name),
        features: space.features.map((f) => f.feature.name),
      };
    });

    return res.status(200).json(formattedSpaces);
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

spaceRoutes.post("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const payload = CreateSpaceRequestSchema.parse(req.body);

    const { name, typeId, categoryIds, featureIds, ...otherSpaceData } =
      payload;

    const typeExist = await db
      .select()
      .from(spaceType)
      .where(eq(spaceType.id, typeId));

    if (typeExist.length === 0) {
      return res
        .status(400)
        .json({ message: `Space Type with ID '${typeId}' not found.` });
    }

    if (categoryIds && categoryIds.length > 0) {
      const foundCategories = await db
        .select({ id: category.id })
        .from(category)
        .where(inArray(category.id, categoryIds));

      if (foundCategories.length !== categoryIds.length) {
        const foundIds = new Set(foundCategories.map((c) => c.id));
        const missingIds = categoryIds.filter((id) => !foundIds.has(id));
        return res.status(400).json({
          message: `One or more Category IDs not found: ${missingIds.join(", ")}.`,
        });
      }
    }

    if (featureIds && featureIds.length > 0) {
      const foundFeatures = await db
        .select({ id: feature.id })
        .from(feature)
        .where(inArray(feature.id, featureIds));

      if (foundFeatures.length !== featureIds.length) {
        const foundIds = new Set(foundFeatures.map((f) => f.id));
        const missingIds = featureIds.filter((id) => !foundIds.has(id));
        return res.status(400).json({
          message: `One or more Feature IDs not found: ${missingIds.join(", ")}.`,
        });
      }
    }

    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Authentication failed: User ID not available." });
    }

    const userId = req.user.id;
    const generatedSlug = await ensureUniqueSlug(name);

    const newSpaceData = await db.transaction(async (tx) => {
      const spaceResult = await db
        .insert(space)
        .values({
          name: name,
          slug: generatedSlug,
          ...otherSpaceData,
          descriptions: otherSpaceData.descriptions || "",
          submittedBy: userId,
          typeId: typeId,
        })
        .returning({ id: space.id });

      if (spaceResult.length === 0) {
        // If space creation fails, throw an error to trigger a rollback
        throw new Error("Failed to create space in database.");
      }

      const newSpaceId = spaceResult[0].id;

      if (categoryIds && categoryIds.length > 0) {
        const categoryInsertValues = categoryIds.map((categoryId) => ({
          spaceId: newSpaceId,
          categoryId: categoryId,
        }));
        await db.insert(spaceToCategories).values(categoryInsertValues);
      }

      if (featureIds && featureIds.length > 0) {
        const featureInsertValues = featureIds.map((featureId) => ({
          spaceId: newSpaceId,
          featureId: featureId,
        }));
        await db.insert(spaceToFeatures).values(featureInsertValues);
      }

      return spaceResult[0];
    });

    return res.status(201).json({
      message: "Space created successfully.",
      data: newSpaceData,
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
      if (constraintName === "space_slug_unique") {
        return res.status(409).json({
          message: "Space with this name already exists (slug conflict).",
        });
      }
      return res
        .status(409)
        .json({ message: "A unique constraint was violated." });
    }

    console.error("Internal Server Error during space creation:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

spaceRoutes.patch(
  "/:identifier",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const currentUser = req.user?.id as string;

      const { identifier } = z
        .object({ identifier: z.uuid() })
        .parse(req.params);

      const payload = UpdateSpaceRequestSchema.parse(req.body);

      const existingSpace = await db
        .select({
          name: space.name,
          typeId: space.typeId,
          author: space.submittedBy,
        })
        .from(space)
        .where(eq(space.id, identifier));

      if (existingSpace.length === 0) {
        return res.status(404).json({ message: "Space not found." });
      }

      if (existingSpace[0].author !== currentUser) {
        return res.status(403).json({
          message:
            "Forbidden: You do not have permission to update this space.",
        });
      }

      const { name, typeId, categoryIds, featureIds, ...otherSpaceData } =
        payload;

      // Prepare fields for update
      const fieldsToUpdate: Record<string, any> = { ...otherSpaceData };

      // Check if name is provided and generate new slug
      if (name !== undefined && name !== existingSpace[0].name) {
        fieldsToUpdate.name = name;
        fieldsToUpdate.slug = await ensureUniqueSlug(name);
      }

      if (typeId !== undefined && typeId !== existingSpace[0].typeId) {
        const typeExists = await db
          .select({ id: spaceType.id })
          .from(spaceType)
          .where(eq(spaceType.id, typeId));

        if (typeExists.length === 0) {
          return res
            .status(400)
            .json({ message: `Space Type with ID '${typeId}' not found.` });
        }

        fieldsToUpdate.typeId = typeId;
      }

      const updatedSpaceData = await db.transaction(async (tx) => {
        const spaceUpdateResult = await tx
          .update(space)
          .set(fieldsToUpdate)
          .where(eq(space.id, identifier))
          .returning();

        if (spaceUpdateResult.length === 0) {
          // If no rows were updated, the space was not found
          throw new Error("Space not found for update."); // This will be caught by the outer catch
        }

        const updatedSpace = spaceUpdateResult[0];

        if (categoryIds !== undefined) {
          // Validate provided category IDs
          if (categoryIds.length > 0) {
            const foundCategories = await tx
              .select({ id: category.id })
              .from(category)
              .where(inArray(category.id, categoryIds));

            if (foundCategories.length !== categoryIds.length) {
              const foundIds = new Set(foundCategories.map((c) => c.id));
              const missingIds = categoryIds.filter((id) => !foundIds.has(id));
              throw new Error(
                `One or more Category IDs not found: ${missingIds.join(", ")}.`,
              );
            }
          }

          // Delete existing relations for this space
          await tx
            .delete(spaceToCategories)
            .where(eq(spaceToCategories.spaceId, identifier));

          // Insert new relations if categoryIds are provided
          if (categoryIds.length > 0) {
            const categoryInsertValues = categoryIds.map((catId) => ({
              spaceId: identifier,
              categoryId: catId,
            }));
            await tx.insert(spaceToCategories).values(categoryInsertValues);
          }
        }

        if (featureIds !== undefined) {
          // Validate provided feature IDs
          if (featureIds.length > 0) {
            const foundFeatures = await tx
              .select({ id: feature.id })
              .from(feature)
              .where(inArray(feature.id, featureIds));

            if (foundFeatures.length !== featureIds.length) {
              const foundIds = new Set(foundFeatures.map((f) => f.id));
              const missingIds = featureIds.filter((id) => !foundIds.has(id));
              throw new Error(
                `One or more Feature IDs not found: ${missingIds.join(", ")}.`,
              );
            }
          }

          // Delete existing relations for this space
          await tx
            .delete(spaceToFeatures)
            .where(eq(spaceToFeatures.spaceId, identifier));

          // Insert new relations if featureIds are provided
          if (featureIds.length > 0) {
            const featureInsertValues = featureIds.map((featId) => ({
              spaceId: identifier,
              featureId: featId,
            }));
            await tx.insert(spaceToFeatures).values(featureInsertValues);
          }
        }

        return updatedSpace;
      });

      return res.status(200).json({
        message: "Space updated successfully.",
        data: updatedSpaceData,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const err = error.issues.map((issue) => {
          return `Error on path "${issue.path.join(".")}": ${issue.message}`;
        });
        return res.status(400).json({
          message: "Invalid request payload or identifier",
          errors: err,
        });
      } else if (error.message === "Space not found for update.") {
        return res.status(404).json({ message: "Space not found." });
      } else if (error.cause?.code === "23505") {
        // Unique constraint violation
        const constraintName = error.cause.constraint;
        if (constraintName === "space_slug_unique") {
          return res.status(409).json({
            message: "Space with this name already exists (slug conflict).",
          });
        }
        return res
          .status(409)
          .json({ message: "A unique constraint was violated." });
      } else if (
        error.message.includes("Category IDs not found") ||
        error.message.includes("Feature IDs not found")
      ) {
        // Catch errors thrown during category/feature ID validation inside the transaction
        return res.status(400).json({ message: error.message });
      }

      console.error("Internal Server Error during space update:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },
);

spaceRoutes.delete(
  "/:identifier",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      if (!req.user || !req.user.id) {
        return res
          .status(401)
          .json({ message: "Authentication failed: User ID not available." });
      }

      const currentUser = req.user.id;

      const { identifier } = z
        .object({ identifier: z.uuid() })
        .parse(req.params);

      const existingSpace = await db
        .select({
          submittedBy: space.submittedBy,
        })
        .from(space)
        .where(eq(space.id, identifier));

      if (existingSpace.length === 0) {
        return res.status(404).json({ message: "Space not found." });
      }

      if (existingSpace[0].submittedBy !== currentUser) {
        return res.status(403).json({
          message:
            "Forbidden: You do not have permission to delete this space.",
        });
      }

      const deletedSpace = await db
        .delete(space)
        .where(eq(space.id, identifier))
        .returning({ id: space.id });

      if (deletedSpace.length === 0) {
        throw new Error(
          "Failed to delete space (might have been deleted by another process).",
        );
      }

      return res.status(200).json({
        message: "Space deleted successfully.",
        data: deletedSpace[0],
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Handle validation errors from Zod
        const err = error.issues.map((issue) => {
          return `Error on path "${issue.path.join(".")}": ${issue.message}`;
        });
        return res.status(400).json({
          message: "Invalid identifier format",
          errors: err,
        });
      } else if (
        error.message ===
        "Failed to delete space (might have been deleted by another process)."
      ) {
        // This specific error indicates an unexpected state after initial check
        return res
          .status(500)
          .json({ message: "Failed to delete space unexpectedly." });
      }

      console.error("Internal Server Error during space deletion:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },
);

export default spaceRoutes;
