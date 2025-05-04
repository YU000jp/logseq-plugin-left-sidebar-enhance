import { BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin.user"

// クエリを実行する共通関数
const advancedQuery = async <T>(query: string, ...input: Array<any>): Promise<T | null> => {
  try {
    const result = await logseq.DB.datascriptQuery(query, ...input)
    return result?.flat() as T
  } catch (err) {
    console.warn("Query execution failed:", err)
    return null
  }
}

export const getPageUuid = async (pageName: string): Promise<PageEntity["uuid"] | null> => {
  const query = `
    [:find (pull ?p [:block/uuid])
     :in $ ?input
     :where
     [?p :block/name ?name]
     [(= ?name ?input)]
     [?p :block/uuid ?uuid]]`
  const result = await advancedQuery<{ uuid: PageEntity["uuid"] }[]>(query, `"${pageName}"`)
  return result?.[0]?.uuid ?? null
}

export const getContentFromUuid = async (uuid: BlockEntity["uuid"]): Promise<BlockEntity["content"] | null> => {
  const query = `
    [:find (pull ?p [:block/content])
     :where
     [?p :block/uuid ?uuid]
     [(str ?uuid) ?str]
     [(= ?str "${uuid}")]]`
  const result = await advancedQuery<{ content: BlockEntity["content"] }>(query)
  return result?.content ?? null
}



// MD バージョン用の関数

export const getCurrentPageForMd = async (): Promise<{ originalName: PageEntity["originalName"], uuid: PageEntity["uuid"] } | null> => {
  // mdバージョンの場合は original-nameが取得できる
  const query = `
      [:find (pull ?p [:block/original-name :block/uuid])
       :in $ ?current
       :where
       [?p :block/name ?name]
       [(= ?name ?current)]
       [?p :block/uuid ?uuid]
       [?p :block/original-name ?original-name]]`
  const result = await advancedQuery<{ "original-name": PageEntity["originalName"], uuid: PageEntity["uuid"] }[]>(query, ":current-page")
  if (result?.[0]) {
    const { "original-name": originalName, uuid } = result[0]
    return { originalName, uuid }
  }
  return null
}

export const getCurrentZoomForMd = async (): Promise<{ uuid: BlockEntity["uuid"], page: { originalName: PageEntity["originalName"], uuid: PageEntity["uuid"] } } | null> => {
  // mdバージョンの場合は original-nameが取得できる
  const query = `
      [:find (pull ?b [:block/uuid {:block/page [:block/uuid :block/original-name]}])
       :in $ ?current
       :where
       [?b :block/uuid ?uuid]
       [(str ?uuid) ?str]
       [(= ?str ?current)]]`
  const result = await advancedQuery<{ uuid: BlockEntity["uuid"], page: { originalName: PageEntity["originalName"], uuid: PageEntity["uuid"] } }[]>(query, ":current-page")
  if (result?.[0])
    return { uuid: result[0].uuid, page: { originalName: result[0].page["original-name"], uuid: result[0].page.uuid } }
  return null
}



// DB バージョン用の関数


export const zoomBlockWhenDb = async (uuid: BlockEntity["uuid"]): Promise<{ uuid: PageEntity["uuid"], title: string } | null> => {
  const query = `
    [:find (pull ?p [{:block/page [:block/uuid :block/title]}])
     :where
     [?p :block/uuid ?uuid]
     [(str ?uuid) ?str]
     [(= ?str "${uuid}")]]`
  const result = await advancedQuery<{ uuid: PageEntity["uuid"], title: string }>(query)
  if (result)
    return result[0] ?
      { uuid: result[0].page.uuid, title: result[0].page.title }
      : null
  return null
}