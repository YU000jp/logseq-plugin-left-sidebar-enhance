import type { TocBlock } from "../page-outline/pageHeaders"

let cachedHeaders: TocBlock[] | null = null

// export const getCachedHeaders = (): TocBlock[] | null => {
//              return cachedHeaders
// }

export const setCachedHeaders = (headers: TocBlock[]): void => {
             cachedHeaders = headers
}

export const clearCachedHeaders = (): void => {
             cachedHeaders = null
}

export const isHeadersCacheEqual = (headers: TocBlock[]): boolean => {
             if (cachedHeaders === null || cachedHeaders.length !== headers.length) {
                          return false
             }
             return headers.every((header, index) => {
                          const cached = cachedHeaders![index]
                          return header.content === cached.content &&
                                       header.uuid === cached.uuid
             })
}