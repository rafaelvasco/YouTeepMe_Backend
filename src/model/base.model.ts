import { PrimaryKey, SerializedPrimaryKey } from '@mikro-orm/core'
import { ObjectId } from '@mikro-orm/mongodb'

export abstract class BaseModel {
    @PrimaryKey()
    _id!: ObjectId

    @SerializedPrimaryKey()
    id!: string
}
