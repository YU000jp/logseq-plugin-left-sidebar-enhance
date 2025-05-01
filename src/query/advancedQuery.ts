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

// 共通のクエリビルダー
const buildQuery = (attributes: string[], whereClause: string): string => `
  [:find (pull ?p [${attributes.join(' ')}])
   :in $ ${whereClause.includes('?input') ? '?input' : ''}
   :where
   ${whereClause}]
`

// UUIDに基づくエンティティ取得の共通関数
const getEntityByUuid = async <T>(uuid: string, attributes: string[]): Promise<T | null> => {
  const query = buildQuery(attributes, `
    [?p :block/uuid ?uuid]
    [(str ?uuid) ?str]
    [(= ?str "${uuid}")]`)
  const result = await advancedQuery<T[]>(query)
  return result?.[0] ?? null
}

export const getPageUuid = async (pageName: string): Promise<PageEntity["uuid"] | null> => {
  const query = buildQuery([':block/uuid'], `
    [?p :block/name ?name]
    [(= ?name ?input)]
    [?p :block/uuid ?uuid]`)
  const result = await advancedQuery<{ uuid: PageEntity["uuid"] }[]>(query, `"${pageName}"`)
  return result?.[0]?.uuid ?? null
}

export const getCurrentPageOriginalNameAndUuid = async (versionMd: boolean): Promise<{ originalName: PageEntity["originalName"], uuid: PageEntity["uuid"] } | null> => {

  if (versionMd === true) {
    // mdバージョンの場合は original-nameが取得できる
    const query = buildQuery([':block/original-name', ':block/uuid'], `
    [?p :block/name ?name]
    [(= ?name ?current)]
    [?p :block/uuid ?uuid]
    [?p :block/original-name ?original-name]`)
    const result = await advancedQuery<{ "original-name": PageEntity["originalName"], uuid: PageEntity["uuid"] }[]>(query, ":current-page")
    if (result?.[0]) {
      const { "original-name": originalName, uuid } = result[0]
      return { originalName, uuid }
    }
    return null
  } else {
    // mdバージョンでない場合は、queryで取得できないので、getCurrentPageを使う
    const current = await logseq.Editor.getCurrentPage() as PageEntity | null
    if (current?.properties) {
      // propertiesの中にtitleがあるので、titleを取得し、それをoriginalNameとして返す
      const originalName = current.properties["title"] ?? current.title
      const uuid = current.uuid
      return { originalName, uuid }
    }
    return null
  }
}

export const getContentFromUuid = async (uuid: BlockEntity["uuid"]): Promise<BlockEntity["content"] | null> => {
  const result = await getEntityByUuid<{ content: BlockEntity["content"] }>(uuid, [':block/content'])
  return result?.content ?? null
}

export const getBlockParentPageFromUuid = async (uuid: BlockEntity["uuid"]): Promise<BlockEntity["page"] | null> => {
  const result = await getEntityByUuid<{ page: BlockEntity["page"] }>(uuid, [':block/page'])
  return result?.page ?? null
}