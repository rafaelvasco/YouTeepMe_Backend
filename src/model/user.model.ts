import { BeforeCreate, Entity, Enum, Property } from '@mikro-orm/core'
import bcrypt from 'bcryptjs'
import { BaseModel } from '@model/index'
import { UserRepository } from '@repository/index'
import { UserRole } from 'src/dto/UserRole'

@Entity({ collection: 'users', customRepository: () => UserRepository })
export class User extends BaseModel {
    @Property()
    email!: string

    @Property({ hidden: true })
    password!: string

    @Enum()
    role!: UserRole

    @Property()
    active!: boolean

    constructor(email: string, password: string, role: UserRole, active: boolean) {
        super()
        this.email = email
        this.password = password
        this.role = role
        this.active = active
    }

    @BeforeCreate()
    hashPassword() {
        const salt = bcrypt.genSaltSync(12)
        this.password = bcrypt.hashSync(this.password, salt)
    }

    checkPassword(unencrypted: string) {
        return bcrypt.compareSync(unencrypted, this.password)
    }
}
