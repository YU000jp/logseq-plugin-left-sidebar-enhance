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

// UUIDに基づくエンティティ取得の共通関数
const getEntityByUuid = async <T>(uuid: string, attributes: string[]): Promise<T | null> => {
  const query = `
    [:find (pull ?p [${attributes.join(' ')}])
     :where
     [?p :block/uuid ?uuid]
     [(str ?uuid) ?str]
     [(= ?str "${uuid}")]]`
  const result = await advancedQuery<T[]>(query)
  return result?.[0] ?? null
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

export const getCurrentPageOriginalNameAndUuid = async (versionMd: boolean): Promise<{ originalName: PageEntity["originalName"], uuid: PageEntity["uuid"] } | null> => {

  if (versionMd === true) {
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
  } else {
    // mdバージョンでない場合は、queryで取得できないので、getCurrentPageを使う
    const current = await logseq.Editor.getCurrentPage() as PageEntity | null
    if (current) {
      // propertiesの中にtitleがあるので、titleを取得し、それをoriginalNameとして返す
      const originalName = current.properties!["title"] ?? current.title
      const uuid = current.uuid
      return { originalName, uuid }
    }
    return null
  }
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

export const zoomBlockWhenDb = async (uuid: BlockEntity["uuid"]): Promise<{ uuid: PageEntity["uuid"], title: string } | null> => {
  const query = `
    [:find (pull ?p [{:block/page [:block/uuid :block/title]}])
     :where
     [?p :block/uuid ?uuid]
     [(str ?uuid) ?str]
     [(= ?str "${uuid}")]]`
  const result = await advancedQuery<{ uuid: PageEntity["uuid"], title: string }>(query)
  if (result) {
    const { page } = result[0]
    return page
  }
  return null
}