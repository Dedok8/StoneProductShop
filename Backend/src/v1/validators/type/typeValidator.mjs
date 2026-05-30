import { z } from 'zod'

export const typeSchema = z.object({
  title: z.string().min(3, 'Назва типу повинна бути не менше 3 символів'),
  role: z.string().min(3, 'Системна роль повинна бути не менше 3 символів'),
})

export function validateType(req, res, next) {
  // Ensure body exists
  if (!req.body || Object.keys(req.body).length === 0) {
    console.warn('[validateType] Empty body received')
  }

  const result = typeSchema.safeParse(req.body)
  if (!result.success) {
    console.warn('[validateType] Validation failed:', result.error.format())
    const errors = result.error.issues.map((err) => err.message)
    return res.status(400).json({ errors })
  }
  req.validated = result.data
  next()
}
