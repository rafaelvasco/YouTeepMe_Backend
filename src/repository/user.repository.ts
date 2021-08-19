import { EntityRepository } from '@mikro-orm/mongodb'
import { User } from '@model/index'

export class UserRepository extends EntityRepository<User> {}
