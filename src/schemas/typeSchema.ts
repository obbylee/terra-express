import { z } from "zod";

export const CreateSpaceTypeRequestSchema = z.object({
  name: z.string().min(1),
  descriptions: z.string().nullable().optional(),
});

export const UpdateSpaceTypeRequestSchema =
  CreateSpaceTypeRequestSchema.partial();
