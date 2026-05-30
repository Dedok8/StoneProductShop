import express from 'express'

import authRoutes from './authRoutes.mjs'
import userRoutes from './userRoutes.mjs'
import productRoutes from './productRoutes.mjs'
import usersTypesRoutes from './usersTypesRoutes.mjs'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/products', productRoutes)
router.use('/users-types', usersTypesRoutes)

export default router
