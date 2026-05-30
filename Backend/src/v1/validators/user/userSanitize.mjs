export const USER_ALLOWED_FIELDS = ["username", "email", "password", "type"];

export function sanitizeUserInput(input) {
  const sanitized = {};
  for (const key of USER_ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      sanitized[key] = input[key];
    }
  }
  return sanitized;
}
