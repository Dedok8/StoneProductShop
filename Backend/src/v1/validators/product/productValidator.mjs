import { z } from 'zod'

export const productSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  image: z.string().optional(),
  seller: z.string().optional(), // Seller ID
})

export function validateProduct(schema) {
  return (req, res, next) => {
    // For multipart/form-data, numbers often come as strings.
    // Convert strings to numbers, and empty strings to undefined.
    if (req.body) {
      ;['price', 'quantity'].forEach((field) => {
        if (req.body[field] === '') delete req.body[field]
        else if (req.body[field] !== undefined)
          req.body[field] = Number(req.body[field])
      })
      ;['seller', 'description'].forEach((field) => {
        if (req.body[field] === '') delete req.body[field]
      })
    }

    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.issues.map((err) => err.message)
      return res.status(400).json({ errors })
    }
    req.validated = result.data
    next()
  }
}
