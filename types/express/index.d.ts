import { IpwareIpInfo } from '@fullerstack/nax-ipware'
import { Express } from 'express-serve-static-core'

declare global {
    namespace Express {
        interface Request {
            clientIp?: string | null
        }
    }
}
