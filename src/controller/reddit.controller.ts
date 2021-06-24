import { Request, Response } from "express"
import Joi from "joi"
import { queryTopPostsFromSubreddit } from "middleware/redditClient"
import { validateRequest } from "middleware/schemaValidate"

export class RedditController {
    
    static queryTopPostsFromSubreddit = async (req: Request, res: Response)  => {

        const schema = Joi.object({
            subreddit: Joi.string().required(),
            query: Joi.string().required()
        })

        const processRequestResult = validateRequest(req.body, schema)

        if (!processRequestResult.ok) {
            return res.status(400).json(processRequestResult.error)
        }

        const { subreddit, query } = processRequestResult.value

        const result = await queryTopPostsFromSubreddit(subreddit, query)
        return res.status(200).json(result)
    }
}