import { z } from "zod";

export const CreateSpaceFeatureRequestSchema = z.object({
  name: z.string().min(1),
  descriptions: z.string().nullable().optional(),
});

export const UpdateSpaceFeatureRequestSchema =
  CreateSpaceFeatureRequestSchema.partial();
