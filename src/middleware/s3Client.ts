import AWS from 'aws-sdk'

import path from 'path'

require('dotenv').config()

const client = new AWS.S3()

const getFileNameFromPath = (filePath: string): string => {
    return path.basename(filePath)
}

export const deleteFile = async (filePath: string) => {
    await client
        .deleteObject({
            Bucket: process.env.AWS_S3_BUCKET as string,
            Key: getFileNameFromPath(filePath),
        })
        .promise()
}

export const uploadFile = async (fileName: string, content: Buffer) => {
    const data = await client
        .upload({
            Bucket: process.env.AWS_S3_BUCKET as string,
            Key: fileName,
            Body: content,
            Metadata: {
                'Content-Type': 'image/*',
            },
        })
        .promise()

    return data.Location
}
