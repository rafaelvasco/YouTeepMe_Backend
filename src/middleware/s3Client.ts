import AWS from 'aws-sdk'

require('dotenv').config()

const client = new AWS.S3()

export const uploadFile = async (fileName: string, content: Buffer) => {
    const data = await client
        .upload({
            Bucket: process.env.AWS_S3_BUCKET as string,
            Key: fileName,
            Body: content,
        })
        .promise()

    return data.Location
}
