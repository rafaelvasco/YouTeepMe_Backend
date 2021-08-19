export interface ItemType {
    id: string | null
    name: string
    color: string | null
}

export function everything(): ItemType {
    return {
        id: null,
        name: 'Everything',
        color: null,
    }
}
