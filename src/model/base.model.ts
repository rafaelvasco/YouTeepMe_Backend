import { Entity, PrimaryKey, SerializedPrimaryKey } from '@mikro-orm/core'
import { ObjectId } from '@mikro-orm/mongodb'

@Entity({ abstract: true })
export abstract class BaseModel {
    @PrimaryKey()
    _id!: ObjectId

    @SerializedPrimaryKey()
    id!: string
}
