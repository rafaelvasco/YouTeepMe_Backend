import { axiosGet, axiosGetOptions, axiosRemoveDownLinks } from './axiosClient'

const GOOGLE_SEARCH_URL = 'https://www.google.com/search'

const IMAGE_SCRAPE_PATTERN =
    /\[1,\[0,"(?<id>[\d\w\-_]+)",\["https?:\/\/(?:[^"]+)",\d+,\d+\]\s?,\["(?<url>https?:\/\/(?:[^"]+))",\d+,\d+\]/gm

export type ImageData = {
    name: string
    data: any
    fileType: string
}

export const fetchImage = async (url: string): Promise<ImageData> => {
    const result = await axiosGetOptions(url, {
        responseType: 'arraybuffer',
        reponseEncoding: 'binary',
    })
    const fileName = url.substring(url.lastIndexOf('/') + 1)
    return {
        name: fileName,
        data: Buffer.from(result.data),
        fileType: result.headers['content-type'],
    }
}

export const scrapeImages = async (query: string, maxResults: number): Promise<string[]> => {
    const encodedQuery = encodeURI(query)

    const requestParams = {
        q: `${encodedQuery}`,
        tbm: 'isch',
    }

    const result = await axiosGet(GOOGLE_SEARCH_URL, requestParams)

    if (result.status === 200) {
        const data = result.data

        const links = [] as string[]

        const images = data.match(IMAGE_SCRAPE_PATTERN) as string[]

        if (images) {
            images.slice(0, maxResults).map((el: string, i: number) => {
                const indexStart = el.lastIndexOf('"http') + 1
                const indexEnd = el.lastIndexOf('",')
                links[i] = el.slice(indexStart, indexEnd)
            })

            const fixedLinks = [] as string[]

            links.map((el: string, i: number) => {
                let fixedLink: string

                if (el.lastIndexOf('.jpg?') !== -1) {
                    const indexEnd = el.lastIndexOf('.jpg?') + 4
                    fixedLink = el.slice(0, indexEnd)
                } else if (el.lastIndexOf('.jpeg?') !== -1) {
                    const indexEnd = el.lastIndexOf('.jpeg?') + 5
                    fixedLink = el.slice(0, indexEnd)
                } else if (el.lastIndexOf('.png?') !== -1) {
                    const indexEnd = el.lastIndexOf('.png?') + 4
                    fixedLink = el.slice(0, indexEnd)
                } else fixedLink = el

                fixedLinks[i] = fixedLink
            })

            const upLinks = await axiosRemoveDownLinks(fixedLinks)

            return upLinks
        }
    }

    return []
}
