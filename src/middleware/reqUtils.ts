import { Request } from 'express'

export const getClientIp = (req: Request) => {
    let ipAddr = req.headers['x-forwarded-for'] as string

    if (ipAddr) {
        const list = ipAddr.split(',')
        ipAddr = list[list.length - 1]
    } else {
        ipAddr = req.ip
    }

    return ipAddr
}
