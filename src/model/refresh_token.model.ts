import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { BaseModel } from '@model/index'
import { User } from './user.model'

@Entity({ collection: 'refresh_tokens' })
export class RefreshToken extends BaseModel {
    @ManyToOne({ entity: () => User, hidden: true, mapToPk: true })
    userId!: string

    @Property()
    token!: string

    @Property()
    ip!: string

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date()
}
