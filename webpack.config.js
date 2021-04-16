import { resolve } from 'path'

export const entry = './src/index.ts'
export const output = {
    path: resolve(__dirname, 'dist'),
    fileName: 'api.bundle.js',
}
export const target = 'node'
