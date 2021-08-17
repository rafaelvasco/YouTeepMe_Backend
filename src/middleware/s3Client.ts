import AWS from 'aws-sdk'

import path from 'path'

require('dotenv').config()

const client = new AWS.S3()

const baseObjectUrl = process.env.AWS_OBJECT_BASE_URL

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

export const uploadFile = async (fileName: string, content: Buffer, fileType: string) => {
    console.log(content)

    await client
        .putObject({
            ACL: 'public-read',
            Bucket: process.env.AWS_S3_BUCKET as string,
            Key: fileName,
            Body: content,
            ContentType: fileType,
        })
        .promise()

    return baseObjectUrl + fileName
}
