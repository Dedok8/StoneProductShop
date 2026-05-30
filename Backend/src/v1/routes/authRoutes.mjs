import express from 'express'

import AuthController from '../controllers/authController.mjs'
import {
  signupSchema,
  loginSchema,
  validate,
} from '../validators/user/userValidator.mjs'

import upload from '../../../middleware/UploadManager.mjs'

const router = express.Router()

router.post('/signup', upload.none(), validate(signupSchema), AuthController.signup)
router.post('/login', upload.none(), validate(loginSchema), AuthController.login)
// Endpoint для оновлення accessToken через refreshToken
router.post('/refresh-token', AuthController.refreshToken)
// Endpoint для логауту
router.post('/logout', AuthController.logout)

export default router
