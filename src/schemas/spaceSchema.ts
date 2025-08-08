import { z } from "zod";

const JsonValueSchema = z.any().nullable().optional();

export const CreateSpaceRequestSchema = z.object({
  name: z.string().min(1),
  alternateNames: z.array(z.string()).optional(),
  descriptions: z.string().nullable().optional(),
  activities: z.array(z.string()).optional(),
  historicalContext: z.string().nullable().optional(),
  architecturalStyle: z.string().nullable().optional(),
  operatingHours: JsonValueSchema,
  entranceFee: JsonValueSchema,
  contactInfo: JsonValueSchema,
  accessibility: JsonValueSchema,
  typeId: z.uuid(),
  categoryIds: z.array(z.uuid()).optional(),
  featureIds: z.array(z.uuid()).optional(),
});

export const UpdateSpaceRequestSchema = CreateSpaceRequestSchema.partial();
