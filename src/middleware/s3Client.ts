import AWS from 'aws-sdk'

import path from 'path'

require('dotenv').config()

if (!process.env.AWS_ACCESS_KEY_YTM) {
    throw new Error('Missing AWS_ACCESS_KEY_YTM variable')
}

if (!process.env.AWS_SECRET_ACCESS_KEY_YTM) {
    throw new Error('Missing AWS_SECRET_ACCESS_KEY_YTM variable')
}

if (!process.env.AWS_S3_BUCKET) {
    throw new Error('Missing AWS_S3_BUCKET variable')
}

AWS.config.update({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_YTM,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_YTM,
    },
})

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
