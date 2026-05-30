import express from 'express'
import FilterService from '../controllers/filtersController.mjs'

const router = express.Router()

router.get('/', FilterService.getFiltersData)

export default router
