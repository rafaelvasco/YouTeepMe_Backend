import { User } from 'model'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Token } from 'types/Token'
import { TokenPair } from 'types/TokenPair'

export const createAuthToken = (user: User): Token => {
    const JWT_SECRET = process.env.AUTH_SECRET
    const AUTH_EXPIRE_TIME = process.env.AUTH_EXPIRE_TIME

    if (!JWT_SECRET) {
        throw 'Missing JWT_SECRET'
    }

    if (!AUTH_EXPIRE_TIME) {
        throw 'Missing AUTH_EXPIRE_TIME'
    }

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        {
            expiresIn: parseInt(AUTH_EXPIRE_TIME),
        }
    )

    return {
        token,
        maxAge: parseInt(AUTH_EXPIRE_TIME) * 1000,
    }
}

export const createRefreshToken = (user: User): Token => {
    const REFRESH_SECRET = process.env.REFRESH_SECRET
    const REFRESH_EXPIRE_TIME = process.env.REFRESH_EXPIRE_TIME

    if (!REFRESH_SECRET) {
        throw 'Missing REFRESH_SECRET'
    }

    if (!REFRESH_EXPIRE_TIME) {
        throw 'Missing REFRESH_EXPIRE_TIME'
    }

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role,
        },
        REFRESH_SECRET,
        {
            expiresIn: parseInt(REFRESH_EXPIRE_TIME),
        }
    )

    return {
        token,
        maxAge: parseInt(REFRESH_EXPIRE_TIME) * 1000,
    }
}

export const createTokenPair = (user: User): TokenPair => {
    console.log('Created new Tokens')

    const accessToken = createAuthToken(user)
    const refreshToken = createRefreshToken(user)

    return { accessToken, refreshToken }
}

export const verifyToken = (token: string) => {
    const AUTH_SECRET = process.env.AUTH_SECRET

    if (!AUTH_SECRET) {
        throw 'Missing JWT_SECRET'
    }

    const jwtPayload = jwt.verify(token, AUTH_SECRET)

    return jwtPayload
}

export const verifyRefreshToken = (token: string) => {
    const REFRESH_SECRET = process.env.REFRESH_SECRET

    if (!REFRESH_SECRET) {
        throw 'Missing JWT_SECRET'
    }

    const jwtPayload = jwt.verify(token, REFRESH_SECRET)

    return jwtPayload
}

export const verifyPassword = async (unencryped: string, encrypted: string) => {
    return await bcrypt.compare(unencryped, encrypted)
}
