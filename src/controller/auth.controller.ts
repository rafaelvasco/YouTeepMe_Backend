import { NextFunction, Request, Response } from 'express'
import { DI } from '@app'
import { User } from '@model/index'
import Joi from 'joi'
import { validateRequest } from '@middleware/schemaValidate'
import { createTokenPair, verifyPassword, verifyRefreshToken } from '@middleware/authFunctions'
import { RefreshToken } from '@model/refresh_token.model'
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@config/auth_config'

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined

export class AuthController {
    static signup = async (req: Request, res: Response) => {
        const schema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required(),
            role: Joi.string().required(),
        })

        const processRequestResult = validateRequest(req.body, schema)

        if (!processRequestResult.ok) {
            return res.status(400).json(processRequestResult.error)
        }

        const { email, password, role } = processRequestResult.value

        try {
            const existingUser = await DI.userRepository.findOne({ email })

            if (existingUser) {
                return res.status(409).json({ message: 'E-mail already registered.' })
            }

            const user = new User(email, password, role, false)

            await DI.userRepository.persistAndFlush(user)

            const { accessToken, refreshToken } = createTokenPair(user)

            await AuthController.saveRefreshToken(refreshToken.token, user, req.ip)

            res.cookie(AUTH_COOKIE_NAME, accessToken.token, {
                maxAge: accessToken.maxAge,
                httpOnly: true,
                domain: COOKIE_DOMAIN,
                secure: true,
            })

            res.cookie(REFRESH_COOKIE_NAME, refreshToken.token, {
                maxAge: refreshToken.maxAge,
                httpOnly: true,
                domain: COOKIE_DOMAIN,
                secure: true,
            })

            return res.status(201).json(user)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }

    static saveRefreshToken = async (token: string, user: User, ip: string) => {
        const existingRefreshToken = await DI.refreshTokenRepository.findOne({ userId: user.id })

        if (existingRefreshToken) {
            existingRefreshToken.token = token

            await DI.refreshTokenRepository.flush()

            console.log('Updated Refresh Token')
        } else {
            const refreshTokenDoc = new RefreshToken()
            refreshTokenDoc.token = token
            refreshTokenDoc.userId = user.id
            refreshTokenDoc.ip = ip

            await DI.refreshTokenRepository.persistAndFlush(refreshTokenDoc)

            console.log('Saved Refresh Token')
        }
    }

    static logout = async (req: Request, res: Response) => {
        const refreshToken = req.cookies[REFRESH_COOKIE_NAME]
        const authToken = req.cookies[AUTH_COOKIE_NAME]

        const tokenDb = await DI.refreshTokenRepository.findOne({ token: refreshToken })

        if (tokenDb) {
            await DI.refreshTokenRepository.removeAndFlush(tokenDb)
        }

        if (authToken) {
            res.clearCookie(AUTH_COOKIE_NAME)
        }

        if (refreshToken) {
            res.clearCookie(REFRESH_COOKIE_NAME)
        }

        return res.status(200).json(true)
    }

    static login = async (req: Request, res: Response) => {
        const schema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required(),
        })

        const processRequestResult = validateRequest(req.body, schema)

        if (!processRequestResult.ok) {
            return res.status(400).json(processRequestResult.error)
        }

        let { email, password } = processRequestResult.value

        try {
            const user = await DI.userRepository.findOne({ email })

            if (!user) {
                return res.status(403).json({ message: 'Invalid email or password.' })
            }

            const validPassword = await verifyPassword(password, user.password)

            if (validPassword) {
                const { accessToken, refreshToken } = createTokenPair(user)

                await AuthController.saveRefreshToken(refreshToken.token, user, req.ip)

                res.cookie(AUTH_COOKIE_NAME, accessToken.token, {
                    maxAge: accessToken.maxAge,
                    httpOnly: true,
                    domain: COOKIE_DOMAIN,
                    secure: true,
                })

                res.cookie(REFRESH_COOKIE_NAME, refreshToken.token, {
                    maxAge: refreshToken.maxAge,
                    httpOnly: true,
                    domain: COOKIE_DOMAIN,
                    secure: true,
                })

                return res.status(201).json(user)
            } else {
                return res.status(403).json({ message: 'Invalid email or password.' })
            }
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }

    static refreshAuthorize = async (req: Request, res: Response, next: NextFunction) => {
        console.log('Refresh Authorize')

        const refreshToken = req.cookies[REFRESH_COOKIE_NAME]
        const authToken = req.cookies[AUTH_COOKIE_NAME]

        if (!refreshToken) {
            console.log('Error: Missing Token')
            return res.status(403).json({ message: 'Missing Token' })
        }

        try {
            verifyRefreshToken(refreshToken)

            const tokenDoc = await DI.refreshTokenRepository.findOne({
                token: refreshToken,
                ip: req.ip,
            })

            if (!tokenDoc) {
                console.log('Error: Token not found in db')
                return res.status(403).json({ message: 'Token not found in DB' })
            }

            const user = await DI.userRepository.findOne(tokenDoc.userId)

            if (!user) {
                await DI.refreshTokenRepository.removeAndFlush(tokenDoc)
                console.log('Error: Invalid token user')
                return res.status(403).json({ message: 'Invalid Token User' })
            }

            if (!authToken) {
                const { accessToken, refreshToken } = createTokenPair(user)

                await AuthController.saveRefreshToken(refreshToken.token, user, req.ip)

                res.cookie(AUTH_COOKIE_NAME, accessToken.token, {
                    maxAge: accessToken.maxAge,
                    httpOnly: true,
                    domain: COOKIE_DOMAIN,
                    secure: true,
                })

                res.cookie(REFRESH_COOKIE_NAME, refreshToken.token, {
                    maxAge: refreshToken.maxAge,
                    httpOnly: true,
                    domain: COOKIE_DOMAIN,
                    secure: true,
                })
            }

            return res.status(200).json(user)
        } catch (e) {
            if (e.name === 'TokenExpiredError') {
                console.log('Session timed out, please login again')
                return res.status(403).json({ message: 'Session timed out,please login again' })
            } else if (e.name === 'JsonWebTokenError') {
                console.log('Invalid token,please login again!')
                return res.status(403).json({ message: 'Invalid token,please login again!' })
            } else {
                console.error(e)
                return res.status(500).json({ e })
            }
        }
    }

    static changePassword = async (req: Request, res: Response) => {
        const userId = res.locals.jwtPayload.userId as string

        const schema = Joi.object({
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().required(),
        })

        const processRequestResult = validateRequest(req.body, schema)

        if (!processRequestResult.ok) {
            return res.status(400).json(processRequestResult.error)
        }

        const { oldPassword, newPassword } = processRequestResult.value

        let user: User

        try {
            user = await DI.userRepository.findOneOrFail(userId)

            if (!user.checkPassword(oldPassword)) {
                return res.status(403).json("Invalid 'oldPassword'")
            }

            user.password = newPassword

            await DI.userRepository.flush()

            return res.status(201).json({ message: 'Operation Successful' })
        } catch (e) {
            return res.status(500).json(e.message)
        }
    }
}
