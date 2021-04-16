import { EntityRepository } from '@mikro-orm/mongodb'
import { User } from 'model'

export class UserRepository extends EntityRepository<User> {}
