import ItemFilter from 'types/ItemFilter'
import { Request, Response } from 'express'
import { DI } from 'app'
import { Item } from 'model'
import Joi from 'joi'
import { validateRequest } from 'middleware/schemaValidate'

export class ItemController {
    static queryItems = async (req: Request, res: Response) => {
        console.info('ItemController::queryItems')

        const filter = req.body as ItemFilter
        filter.tags ??= []
        filter.page ??= 1
        filter.pageSize ??= 100
        filter.itemTypeId ??= null

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
            const result = await DI.itemRepository.findOne(id)

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
            type: Joi.required(),
            userId: Joi.required(),
        })

        const processRequestResult = validateRequest(req.body, schema)

        if (!processRequestResult.ok) {
            return res.status(400).json({ message: processRequestResult.error })
        }

        const { name, type, userId } = processRequestResult.value

        try {
            const typeObj = await DI.itemTypesRepository.findOneOrFail(type.id)

            let item = new Item(name, typeObj, userId)

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
        }).or('name', 'type')

        const processRequestResult = validateRequest(req.body, schema)

        if (!processRequestResult.ok) {
            return res.status(400).json(processRequestResult.error)
        }

        const { name, type } = processRequestResult.value

        try {
            const item = await DI.itemRepository.findOneOrFail(id)

            if (item.userId !== userId) {
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
                `User Id: ${userId} trying to delete item created by userId: ${item.userId}`
            )

            const itemUser = await DI.userRepository.findOneOrFail(item.userId)
            const loggedUser = await DI.userRepository.findOneOrFail(userId)

            if (itemUser !== loggedUser) {
                return res
                    .status(403)
                    .json({ message: 'Only the creator of an Item can delete it.' })
            }

            await DI.itemRepository.remove(item).flush()
            return res.status(200).json({ message: 'Operation Successful' })
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }
}
