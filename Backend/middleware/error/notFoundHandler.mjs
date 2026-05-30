/**
 * Middleware для обробки 404 Not Found
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Not Found', reqId: req?.id })
}
