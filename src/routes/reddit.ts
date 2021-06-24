import { RedditController } from 'controller'
import { Router } from 'express'
import { authorize } from 'middleware/authorize'

const router = Router()

router.get('/queryTopPosts',  authorize(['ADMIN']), RedditController.queryTopPostsFromSubreddit)

export default router