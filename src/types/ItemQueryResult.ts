import { Item } from 'model'

type ItemQueryResult = {
    items: Item[]
    totalQty: number
    pageSize: number
}

export default ItemQueryResult
