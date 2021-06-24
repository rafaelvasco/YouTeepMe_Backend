import { Router } from 'express'

import auth from './auth'
import user from './user'
import item from './item'
import reddit from './reddit'
import scrape from './scrape'

const routes = Router()

routes.use('/api/auth', auth)
routes.use('/api/user', user)
routes.use('/api/item', item)
routes.use('/api/reddit', reddit)
routes.use('/api/scrape', scrape)

export default routes
