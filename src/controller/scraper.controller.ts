import { Request, Response } from 'express'
import Joi from 'joi'
import { validateRequest } from '@middleware/schemaValidate'
import { scrapeImages } from '@middleware/scraper'

export class ScraperController {
    static scrapeImagesAPI = async (req: Request, res: Response) => {
        const schema = Joi.object({
            query: Joi.string().required(),
            maxResults: Joi.number().default(10),
        })

        const processRequestResult = validateRequest(req.query, schema)

        if (!processRequestResult.ok) {
            return res.status(400).json(processRequestResult.error)
        }

        const { query, maxResults } = processRequestResult.value

        const result = await scrapeImages(query, maxResults)

        return res.status(200).json(result)
    }
}
