import { NextFunction, Request, Response } from 'express'

export const injectIpOnRequest = (req: Request, res: Response, next: NextFunction) => {
    const fwd = req.headers['X-Forwarded-For'] as string

    req.clientIp = fwd || req.ip

    next()
}

export const getReqIp = (req: Request) => {
    return req.clientIp ?? 'localhost'
}
