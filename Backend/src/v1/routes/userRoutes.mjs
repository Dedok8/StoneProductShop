// ...existing code...
import express from 'express'
const router = express.Router()
import { signupSchema, validate } from '../validators/user/userValidator.mjs'
import { requireRole } from '../../../middleware/auth.mjs'
import UserController from '../controllers/userController.mjs'
import upload from '../../../middleware/UploadManager.mjs'

// Повертає продавців, які мають товари і тип seller
router.get('/active-sellers', UserController.getActiveSellers)

// Всі маршрути доступні лише для admin
router.use(requireRole('admin'))

router.get('/', UserController.usersList)
router.get('/:id', UserController.registerForm) // To get data for editing
router.get('/config/form', UserController.registerForm) // To get roles for new user form

router.post(
  '/',
  upload.none(),
  validate(signupSchema),
  UserController.registerUser,
)
router.put(
  '/:id',
  upload.none(),
  validate(signupSchema),
  UserController.registerUser,
)
router.delete('/', UserController.deleteUser)

export default router
