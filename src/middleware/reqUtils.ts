import { Request } from 'express'

export const getClientIp = (req: Request) => {
    let ipAddr = req.ip

    if (!ipAddr) {
        ipAddr = req.headers['x-forwarded-for'] as string

        if (ipAddr) {
            const list = ipAddr.split(',')
            ipAddr = list[list.length - 1]
        }
    }

    return ipAddr
}
