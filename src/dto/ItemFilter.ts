type ItemFilter = {
    type: string | null
    tags: string[] | null
    page: number
    pageSize: number
    queryText: string | null
    active?: boolean
}

export default ItemFilter
