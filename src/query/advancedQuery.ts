import { BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin.user"

// クエリを実行
const advancedQuery = async <T>(query: string, ...input: Array<any>): Promise<T | null> => {
  try {
    const result = await logseq.DB.datascriptQuery(query, ...input)
    return result?.flat() as T
  } catch (err) {
    console.warn("Query execution failed:", err)
    return null
  }
}

// フィールドを取得するクエリ
const createBaseQuery = (field: string): string => `
  [:find (pull ?b [:block/${field}])
   :in $ ?name
   :where
   [?b :block/original-name ?name]
   [?b :block/${field} ?${field}]] 
`

// ページが存在するかどうかを確認
export const isPageExist = async (pageName: string): Promise<boolean> => {
  const result = await advancedQuery<{ uuid: PageEntity["uuid"] }[]>(createBaseQuery("uuid"), `"${pageName}"`)
  return !!result?.[0]?.uuid
}

export const getCurrentPageOriginalNameAndUuid = async (): Promise<{ originalName: PageEntity["originalName"], uuid: PageEntity["uuid"] } | null> => {
  const query = `
    [:find (pull ?p [:block/original-name :block/uuid])
     :in $ ?current
     :where
     [?p :block/name ?name]
     [(= ?name ?current)]
     [?p :block/uuid ?uuid]
     [?p :block/original-name ?original-name]]
  `
  const result = await advancedQuery<{ "original-name": PageEntity["originalName"], uuid: PageEntity["uuid"] }[]>(query, ":current-page")
  if (result?.[0]) {
    const { "original-name": originalName, uuid } = result[0]
    return { originalName, uuid }
  }
  return null
}

export const getContentFromUuid = async (uuid: BlockEntity["uuid"]): Promise<BlockEntity["content"] | null> => {
  const query = `
    [:find (pull ?p [:block/content])
     :where
     [?p :block/uuid ?uuid]
     [(str ?uuid) ?str]
     [(= ?str "${uuid}")]]
  `
  const result = await advancedQuery<{ content: BlockEntity["content"] }[]>(query)
  return result?.[0]?.["content"] ?? null
}
