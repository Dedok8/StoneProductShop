import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.string().optional().or(z.null()),
  type: z.string().optional().or(z.null()),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.errors.issues.map((err) => err.message);
    }
    req.validated = result.data;
    next();
  };
}
