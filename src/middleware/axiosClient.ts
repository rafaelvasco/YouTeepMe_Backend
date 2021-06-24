import axios, { AxiosRequestConfig } from 'axios'

const REQUEST_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43"

export const axiosGet = (url: string, params: any) => {

    const requestOptions = {
        headers: {
            "User-Agent": REQUEST_USER_AGENT
        },
        params: params
        
    } as AxiosRequestConfig

    return axios.get(url, requestOptions)
}

export const axiosRemoveDownLinks = async (urls: string[]) => {

    const upLinks = [] as string[]

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];

        try {
            const result = await axios.head(url)    

            if (result.status === 200) {
                upLinks.push(url)
            }

        } catch (error) {
            
        }
    }

    return upLinks
}

