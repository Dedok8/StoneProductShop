import express from 'express'
import TypeController from '../controllers/usersTypesController.mjs'
import { requireRole } from '../../../middleware/auth.mjs'
import { ROLES } from '../constants/roles.mjs'
import { validateType } from '../validators/type/typeValidator.mjs'
import upload from '../../../middleware/UploadManager.mjs'

const router = express.Router()

router.get('/', TypeController.getList)
router.get('/:id', TypeController.getById)

router.post(
  '/',
  upload.none(),
  requireRole(ROLES.ADMIN),
  validateType,
  TypeController.register,
)
router.put(
  '/:id',
  upload.none(),
  requireRole(ROLES.ADMIN),
  validateType,
  TypeController.register,
)
router.delete('/', TypeController.delete)

export default router
