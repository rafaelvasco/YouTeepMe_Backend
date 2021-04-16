import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { BaseModel, ItemType } from 'model'
import { ItemRepository } from 'repository'
import { User } from './user.model'

@Entity({ collection: 'items', customRepository: () => ItemRepository })
export class Item extends BaseModel {
    @Property()
    name!: string

    @ManyToOne({ entity: () => ItemType })
    type!: ItemType

    @ManyToOne({ entity: () => User, mapToPk: true })
    userId!: string

    constructor(name: string, type: ItemType, userId: string) {
        super()
        this.name = name
        this.type = type
        this.userId = userId
    }
}
