// sanitize product input fields to prevent injection and allow only whitelisted fields

export const PRODUCT_ALLOWED_FIELDS = [
  'title',
  'price',
  'description',
  'image',
  'seller',
  'owner',
]

export function sanitizeProductInput(input) {
  const sanitized = {}
  for (const key of PRODUCT_ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      sanitized[key] = input[key]
    }
  }
  return sanitized
}
