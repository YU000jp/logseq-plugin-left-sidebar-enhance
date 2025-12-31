import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin.user"
import { removeProvideStyle } from "./util/lib"
import { settingKeys } from './settings/keys'
const key = "lse-FavAndRecent"
let processing = false

export const loadFavAndRecent = () => {
    // 設定変更は中央ディスパッチャで処理するため、ここでは登録しない

    // 初回実行
    if (logseq.settings?.[settingKeys.common.booleanFavAndRecent] === true)
        filterRecentItems()
}

/**
 * 設定変更時のハンドラ（中央ディスパッチャから呼び出される）
 * - `booleanFavAndRecent` が変更されたときにフィルタ処理を開始/停止する
 */
export const handleFavAndRecentSettingsChanged = async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']): Promise<void> => {
    if (oldSet[settingKeys.common.booleanFavAndRecent] !== newSet[settingKeys.common.booleanFavAndRecent])
        if (newSet[settingKeys.common.booleanFavAndRecent] === true)
            filterRecentItems()
        else
            removeProvideStyle(key)//非表示にする
}



const filterRecentItems = async () => {

    if (processing) return
    processing = true
    setTimeout(() => processing = false, 300)


    const favoriteArray = await logseq.App.getCurrentGraphFavorites() as Array<string> | null
    if (favoriteArray && favoriteArray.length > 0) {
        logseq.provideStyle({
            key,
            style: `
                    #left-sidebar div.nav-content-item.recent li[title].recent-item {
                        ${favoriteArray.map((value) => `&[data-ref="${value}"],\n&:has(span.page-title[data-orig-text="${value}"])`).join(", ")} {
                        display: none;
                        }
                    }
                    `})
        // console.log("Hide duplicate favorites and history")
    }

    // 10分毎に再実行
    setTimeout(() => {
        if (logseq.settings?.[settingKeys.common.booleanFavAndRecent] === true)
            filterRecentItems()
    }, 600000)

}