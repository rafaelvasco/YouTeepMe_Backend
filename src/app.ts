import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import routes from '@routes/index'
import { EntityManager, MikroORM, RequestContext } from '@mikro-orm/core'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { EntityRepository } from '@mikro-orm/mongodb'
import { ItemRepository, UserRepository } from '@repository/index'
import { Item, ItemType, User } from '@model/index'
import { RefreshToken } from '@model/refresh_token.model'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import { MAX_FILE_SIZE } from '@config/fileupload_config'
import { injectIpOnRequest } from '@middleware/reqUtils'

require('dotenv').config()

export const DI = {} as {
    orm: MikroORM
    em: EntityManager
    itemRepository: ItemRepository
    itemTypesRepository: EntityRepository<ItemType>
    userRepository: UserRepository
    refreshTokenRepository: EntityRepository<RefreshToken>
}

class App {
    public express: express.Application

    constructor() {
        console.log('Initializing YTM App')
        this.express = express()
        this.initDb()
        this.configureMiddleWare()
        this.configureRoutes()
    }

    private async initDb() {
        const DB_NAME = process.env.MONGODB_DB
        const DB_URL = process.env.MONGODB_URI

        if (!(DB_NAME && DB_URL)) {
            throw 'Missing DB_NAME and DB_URL'
        }

        DI.orm = await MikroORM.init({
            metadataProvider: TsMorphMetadataProvider,
            entities: ['./dist/model/*.model.js'],
            entitiesTs: ['./src/model/*.model.ts'],
            dbName: DB_NAME,
            type: 'mongo',
            clientUrl: DB_URL,
        })

        console.log('Database Connected')

        DI.em = DI.orm.em
        DI.itemRepository = DI.orm.em.getRepository(Item)

        DI.itemTypesRepository = DI.orm.em.getRepository(ItemType)

        DI.userRepository = DI.orm.em.getRepository(User)

        DI.refreshTokenRepository = DI.orm.em.getRepository(RefreshToken)

        this.express.use((req: Request, res: Response, next: NextFunction) => {
            RequestContext.create(DI.orm.em, next)
        })
    }

    private configureMiddleWare() {
        const ORIGIN = process.env.ORIGIN || 'localhost:3000'

        this.express.use(
            cors({
                credentials: true,
                origin: ORIGIN,
            })
        )
        this.express.use(helmet())
        this.express.use(express.json())
        this.express.use(express.urlencoded({ extended: true }))
        this.express.use(cookieParser())
        this.express.use(
            fileUpload({
                limits: {
                    fileSize: MAX_FILE_SIZE * 1024 * 1024,
                },
            })
        )

        this.express.use(injectIpOnRequest)

        if (process.env.NODE_ENV == 'production') {
            this.express.set('trust proxy', true)
        }
    }

    private configureRoutes() {
        this.express.get('/', (_, res) => {
            res.status(200).json('YouTeepMe API: Hello World!')
        })

        this.express.use('/', routes)

        this.express.use('*', (_, res) => {
            res.status(404).json({
                message: 'Invalid Url Request',
            })
        })
    }
}

export default new App().express
