import { Entity, Property } from '@mikro-orm/core'
import { BaseModel } from 'model'

@Entity({ collection: 'types' })
export class ItemType extends BaseModel {
    @Property()
    name!: string

    @Property()
    color!: string

    constructor(name: string, color: string) {
        super()
        this.name = name
        this.color = color
    }
}
