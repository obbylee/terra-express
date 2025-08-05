import { z } from "zod";

export const LoginRequestSchema = z.object({
  identifier: z.string(),
  password: z.string().min(6),
});

export const RegisterRequestSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long.")
    .max(50, "Username cannot exceed 50 characters."),
  email: z.string().email("Invalid email address format."),
  password: z.string().min(6, "Password must be at least 8 characters long."),
});
