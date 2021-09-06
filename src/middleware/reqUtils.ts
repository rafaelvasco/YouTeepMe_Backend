import { Ipware } from '@fullerstack/nax-ipware'
import { NextFunction, Request, Response } from 'express'

export const injectIpOnRequest = (req: Request, res: Response, next: NextFunction) => {
    const ipWare = new Ipware()
    req.ipInfo = ipWare.getClientIP(req)
    next()
}

export const getReqIp = (req: Request) => {
    return req.ipInfo?.ip ?? 'localhost'
}
