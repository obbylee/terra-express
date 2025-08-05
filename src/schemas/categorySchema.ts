import z from "zod";

export const CreateSpaceCategoryRequestSchema = z.object({
  name: z.string().min(1),
  descriptions: z.string().nullable().optional(),
});

export const UpdateSpaceCategoryRequestSchema =
  CreateSpaceCategoryRequestSchema.partial();
