import { Request, Response } from 'express'
import { DI } from '@app'
import { User } from '@model/index'
import Joi from 'joi'
import { validateRequest } from '@middleware/schemaValidate'

export class UserController {
    static getOneById = async (req: Request, res: Response) => {
        const id = req.query.id as string

        if (!id) {
            return res.status(400).json({ message: 'Expected: id' })
        }

        try {
            const user = await DI.userRepository.findOneOrFail(id)
            return res.json(user)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }

    static getAllUsers = async (req: Request, res: Response) => {
        try {
            const result = await DI.userRepository.findAll()
            return res.json(result)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }

    static editUser = async (req: Request, res: Response) => {
        const id = req.query.id as string

        const roleUserLogged = res.locals.jwtPayload.role as string
        const idUserLogged = res.locals.jwtPayload.userId as string

        const userLogged = await DI.userRepository.findOneOrFail(idUserLogged)
        const userRequest = await DI.userRepository.findOneOrFail(id)

        if (roleUserLogged !== 'ADMIN' && userRequest !== userLogged) {
            return res
                .status(403)
                .json({ message: "You don't have permission to execute this operation." })
        }

        const schema = Joi.object({
            role: Joi.string(),
            active: Joi.bool(),
        }).or('role', 'active')

        const processRequestResult = validateRequest(req.body, schema)

        if (!processRequestResult.ok) {
            return res.status(400).json(processRequestResult.error)
        }

        const { role, active } = req.body

        let user: User

        try {
            user = await DI.userRepository.findOneOrFail(id)

            if (role) {
                user.role = role
            }

            if (typeof active !== 'undefined') {
                user.active = active
            }

            await DI.userRepository.flush()

            return res.status(200).json({ message: 'Operation Successful' })
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }

    static deleteUser = async (req: Request, res: Response) => {
        const id = req.query.id as string

        const roleUserLogged = res.locals.jwtPayload.role as string
        const idUserLogged = res.locals.jwtPayload.userId as string

        const userRequest = await DI.userRepository.findOneOrFail(id)
        const userLogged = await DI.userRepository.findOneOrFail(idUserLogged)

        if (id) {
            return res.status(400).json({ message: 'Expected: id' })
        }

        if (roleUserLogged !== 'ADMIN' && userRequest !== userLogged) {
            return res
                .status(403)
                .json({ message: "You don't have permission to execute this operation." })
        }

        try {
            const user = await DI.userRepository.findOneOrFail(id)
            await DI.userRepository.removeAndFlush(user)
            return res.status(200).json({ message: 'Operation Successful' })
        } catch (error) {
            return res.status(500).json(error)
        }
    }
}
