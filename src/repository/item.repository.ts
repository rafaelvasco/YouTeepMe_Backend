import { QueryOrder } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/mongodb'
import { DI } from '@app'
import { Item } from '@model/index'
import ItemFilter from 'src/dto/ItemFilter'
import ItemQueryResult from 'src/dto/ItemQueryResult'

export class ItemRepository extends EntityRepository<Item> {
    async findByFilter(itemFilter: ItemFilter): Promise<ItemQueryResult> {
        let filter = {} as any

        if (itemFilter.type) {
            const itemType = await DI.itemTypesRepository.findOneOrFail(itemFilter.type)
            filter.type = itemType
        }

        if (itemFilter.queryText) {
            filter.name = { $re: new RegExp(itemFilter.queryText, 'i') }
        }

        const offset = (itemFilter.page - 1) * itemFilter.pageSize

        const [result, count] = await super.findAndCount(filter, {
            populate: ['type', 'user'],
            orderBy: { votes: QueryOrder.DESC, createdAt: QueryOrder.DESC },
            limit: itemFilter.pageSize,
            offset: offset,
        })

        return {
            items: result,
            totalQty: count,
        }
    }
}
