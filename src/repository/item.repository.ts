import { QueryOrder } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/mongodb'
import { DI } from '@app'
import { Item, ItemType } from '@model/index'
import ItemFilter from 'src/dto/ItemFilter'
import ItemQueryResult from 'src/dto/ItemQueryResult'

export class ItemRepository extends EntityRepository<Item> {
    async findByFilter(itemFilter: ItemFilter): Promise<ItemQueryResult> {
        let filter = {} as {
            type: ItemType
        }

        if (itemFilter.type) {
            const itemType = await DI.itemTypesRepository.findOneOrFail(itemFilter.type)
            filter.type = itemType
        }

        const offset = (itemFilter.page - 1) * itemFilter.pageSize

        const [result, count] = await super.findAndCount(
            filter,
            ['type', 'user'],
            { votes: QueryOrder.DESC, createdAt: QueryOrder.DESC },
            itemFilter.pageSize,
            offset
        )

        return {
            items: result,
            totalQty: count,
        }
    }
}
