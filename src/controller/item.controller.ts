import ItemFilter from 'src/dto/ItemFilter'
import { Request, Response } from 'express'
import { DI } from '@app'
import { Item } from '@model/index'
import Joi from 'joi'
import { validateRequest } from '@middleware/schemaValidate'
import { deleteFile, uploadFile } from '@middleware/s3Client'
import { fetchImage } from '@middleware/scraper'
import { nanoid } from 'nanoid'

export class ItemController {
    static queryItems = async (req: Request, res: Response) => {
        console.info('ItemController::queryItems')

        const filter = req.body as ItemFilter
        filter.tags ??= []
        filter.page ??= 1
        filter.pageSize ??= 100
        filter.type ??= null

        try {
            const result = await DI.itemRepository.findByFilter(filter)
            res.json(result)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }

    static getAllTypes = async (req: Request, res: Response) => {
        console.info('ItemController::getAllTypes')

        try {
            const result = await DI.itemTypesRepository.findAll()
            res.json(result)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }

    static getItem = async (req: Request, res: Response) => {
        console.info('ItemController::getItem')

        const id = req.query.id as string

        if (!id) {
            return res.status(400).json({ message: 'Expected: id' })
        }

        try {
            const result = await DI.itemRepository.findOne(id, ['user', 'type'])

            if (!result) {
                return res.status(404).json({ message: 'Item not found.' })
            }

            return res.json(result)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }

    static createItem = async (req: Request, res: Response) => {
        console.info('ItemController::createItem')

        const schema = Joi.object({
            name: Joi.string().required().max(255),
            typeId: Joi.required(),
            userId: Joi.required(),
            content: Joi.string().required().allow(''),
            mainImageUrl: Joi.string().optional(),
        })

        const processRequestResult = validateRequest(req.body, schema)

        if (!processRequestResult.ok) {
            return res.status(400).json({ message: processRequestResult.error })
        }

        const { name, typeId, userId, content, mainImageUrl } = processRequestResult.value

        try {
            const typeObj = await DI.itemTypesRepository.findOneOrFail(typeId)

            const user = await DI.userRepository.findOneOrFail(userId)

            let mainImagePath = null

            if (req.files && req.files.mainImage) {
                const mainImage = req.files.mainImage as any

                const imageFileName = 'image_' + nanoid()

                mainImagePath = await uploadFile(imageFileName, mainImage.data, mainImage.mimetype)
            } else if (mainImageUrl) {
                const mainImage = await fetchImage(mainImageUrl)

                const imageFileName = 'image_' + nanoid()
                mainImagePath = await uploadFile(imageFileName, mainImage.data, mainImage.fileType)
            } else {
                return res.status(400).json({ message: 'Missing Item Image.' })
            }

            const item = new Item(
                name,
                content,
                typeObj,
                user,
                false,
                mainImagePath ? [mainImagePath] : []
            )

            await DI.itemRepository.persistAndFlush(item)

            return res.status(201).json({ message: 'Operation Successful' })
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }

    static updateItem = async (req: Request, res: Response) => {
        console.info('ItemController::updateItem')

        const id = req.query.id as string
        const userId = res.locals.jwtPayload.userId as string

        if (!id) {
            return res.status(400).json({ message: 'Expected: id' })
        }

        const schema = Joi.object({
            name: Joi.string(),
            type: Joi.string(),
            content: Joi.string(),
            votes: Joi.number(),
        }).or('name', 'type', 'content', 'votes')

        const processRequestResult = validateRequest(req.body, schema)

        if (!processRequestResult.ok) {
            return res.status(400).json({ message: processRequestResult.error })
        }

        const { name, type, content, votes } = processRequestResult.value

        try {
            const item = await DI.itemRepository.findOneOrFail(id)

            if (item.user.id !== userId) {
                return res
                    .status(403)
                    .json({ message: 'Only the creator of an Item can modify it.' })
            }

            if (name) {
                item.name = name
            }

            if (type) {
                const typeObj = await DI.itemTypesRepository.findOneOrFail(type)
                item.type = typeObj
            }

            if (content) {
                item.content = content
            }

            if (votes) {
                item.votes = votes
            }

            await DI.itemRepository.flush()

            return res.status(200).json({ message: 'Operation Successful' })
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }

    static deleteItem = async (req: Request, res: Response) => {
        console.info('ItemController::deleteItem')

        const id = req.query.id as string
        const userId = res.locals.jwtPayload.userId as string

        if (!id) {
            return res.status(400).json({ message: 'Expected: id' })
        }

        try {
            const item = await DI.itemRepository.findOneOrFail(id)

            console.log(
                `User Id: ${userId} trying to delete item created by userId: ${item.user.id}`
            )

            const itemUser = await DI.userRepository.findOneOrFail(item.user.id)
            const loggedUser = await DI.userRepository.findOneOrFail(userId)

            if (itemUser !== loggedUser) {
                return res
                    .status(403)
                    .json({ message: 'Only the creator of an Item can delete it.' })
            }

            if (item.mainImage) {
                await deleteFile(item.mainImage)
            }

            await DI.itemRepository.remove(item).flush()

            return res.status(200).json({ message: 'Operation Successful' })
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }
}
