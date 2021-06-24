import snoowrap from 'snoowrap'

require('dotenv').config()

const r = new snoowrap({
    userAgent: process.env.REDD_USER_AGENT as string,
    clientId: process.env.REDD_CLIENT_ID as string,
    clientSecret: process.env.REDD_CLIENT_SECRET as string,
    refreshToken: process.env.REDD_REFRESH_TOKEN as string
})

export type PostData = {
    id: string,
    title: string,
    text_html: string | null,
    upvotes: number
}

export const queryTopPostsFromSubreddit = async(sub: string, query: string): Promise<PostData[]> => {

    const topPosts = (await r.getSubreddit(sub).search({query: query, sort: 'top'})).map(post => ({
        id: post.id,
        title: post.title,
        text_html: post.selftext_html,
        upvotes: post.ups
    }));
    return topPosts;

}
