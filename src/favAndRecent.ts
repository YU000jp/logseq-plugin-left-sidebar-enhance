import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin.user"
import { removeProvideStyle } from "./lib"
const key = "lse-FavAndRecent"
let processing = false

export const loadFavAndRecent = () => {

    // プラグイン設定変更時
    logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
        if (oldSet.booleanFavAndRecent !== newSet.booleanFavAndRecent)
            if (newSet.booleanFavAndRecent === true)
                main()
            else
                removeProvideStyle(key)//非表示にする
    })

    // 初回実行
    if (logseq.settings!.booleanFavAndRecent === true)
        main()
}



const main = async () => {

    if (processing) return
    processing = true
    setTimeout(() => processing = false, 300)


    const favoriteArray = await logseq.App.getCurrentGraphFavorites() as Array<string> | null
    const RecentArray = await logseq.App.getCurrentGraphRecent() as Array<string> | null

    if (favoriteArray
        && RecentArray) {
        //favoriteArrayとRecentArrayと重複しているものをCSSで取り除きたい
        const matchArray = favoriteArray.filter(value => RecentArray.includes(value))
        if (matchArray.length > 0) {
            logseq.provideStyle({
                key,
                style: `
                    div#left-sidebar div.nav-content-item.recent li[title].recent-item {
                        ${matchArray.map((value) => `&:has(span.page-title[data-orig-text="${value}"])`).join(", ")} {
                        display: none;
                        }
                    }
                    `})
            console.log("Hide duplicate favorites and history")
        }
    }

    // 10分毎に再実行
    setTimeout(() => {
        if (logseq.settings!.booleanFavAndRecent === true)
            main()
    }, 600000)

}