import { DI } from 'app'
import { AUTH_COOKIE_NAME } from 'config/auth_config'
import { NextFunction, Request, Response } from 'express'
import { verifyToken } from './authFunctions'

require('dotenv').config()

const AUTH_SECRET = process.env.AUTH_SECRET

if (!AUTH_SECRET) {
    throw 'Missing auth secret env Variable'
}

export type AuthResult = {
    jwtToken: string
    refreshToken: string
}

export const authorize = (roles: string[] = []) => {
    return [
        (req: Request, res: Response, next: NextFunction) => {
            const token = req.cookies[AUTH_COOKIE_NAME]

            console.log('Authorizing')

            if (!token) {
                console.log('Access denied, token missing')
                return res.status(401).json({ message: 'Access denied, token missing.' })
            } else {
                try {
                    const jwtPayload = verifyToken(token)
                    res.locals.jwtPayload = jwtPayload
                    return next()
                } catch (e) {
                    if (e.name === 'TokenExpiredError') {
                        return res
                            .status(401)
                            .json({ message: 'Session timed out,please login again' })
                    } else if (e.name === 'JsonWebTokenError') {
                        return res
                            .status(401)
                            .json({ message: 'Invalid token,please login again!' })
                    } else {
                        //catch other unprecedented errors
                        console.error(e)
                        return res.status(400).json({ e })
                    }
                }
            }
        },

        async (req: Request, res: Response, next: NextFunction) => {
            const id = res.locals.jwtPayload.userId as string

            if (!id) {
                return res.status(401).send()
            }

            const user = await DI.userRepository.findOne(id)

            if (!user || (roles.length && !roles.includes(user.role))) {
                return res.status(401).send()
            }

            return next()
        },
    ]
}
