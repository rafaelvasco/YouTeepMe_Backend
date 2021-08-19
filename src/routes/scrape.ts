import { ScraperController } from '@controller/scraper.controller'
import { Router } from 'express'
//import { authorize } from 'middleware/authorize'

const router = Router()

router.get('/scrapeImages', ScraperController.scrapeImagesAPI)

export default router
