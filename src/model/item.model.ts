import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { BaseModel, ItemType, User } from 'model'
import { ItemRepository } from 'repository'

@Entity({ collection: 'items', customRepository: () => ItemRepository })
export class Item extends BaseModel {
    @Property()
    name!: string

    @Property()
    content!: string

    @ManyToOne({ entity: () => ItemType })
    type!: ItemType

    @ManyToOne({ entity: () => User })
    user!: User

    @Property()
    active!: boolean

    @Property()
    createdAt = new Date()

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date()

    @Property()
    mainImage: string | null

    constructor(
        name: string,
        content: string,
        type: ItemType,
        user: User,
        active: boolean,
        images: string[]
    ) {
        super()
        this.name = name
        this.type = type
        this.content = content
        this.user = user
        this.active = active
        this.mainImage = images.length > 0 ? images[0] : null
    }
}
