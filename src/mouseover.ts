import { ExternalCommandType, LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin"
import CSSTypeA from "./mouseoverA.css?inline"
import CSSTypeB from "./mouseoverB.css?inline"
import { removeProvideStyle } from "./lib"
import { t } from "logseq-l10n"
const keyShowByMouseOver = "showByMouseOver"
let processingMouseOverButton = false

export const loadShowByMouseOver = () => {

    logseq.App.onAfterCommandInvoked("logseq.ui/toggle-left-sidebar" as ExternalCommandType, () => {
        whenToggleEvent()
    })

    if (logseq.settings!.loadShowByMouseOver === false) {
        //プラグイン設定で無効化されている場合は何もしない 
    } else {

        //初期設定
        if (!logseq.settings!.toggleShowByMouseOver)
            logseq.updateSettings({ toggleShowByMouseOver: "mouseOver" })

        //前回のメモリー
        if (logseq.settings!.toggleShowByMouseOver === "mouseOver")
            selectShowByMouseOverType(logseq.settings!.showByMouseOverType as string)

        handleEvent(300)

    }
    //プラグイン設定変更時
    logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {

        // マウスオーバーの表示方法が変更された場合
        if (oldSet.showByMouseOverType !== newSet.showByMouseOverType
            && newSet.loadShowByMouseOver === true) {

            removeProvideStyle(keyShowByMouseOver)
            selectShowByMouseOverType(newSet.showByMouseOverType as string)
            logseq.UI.showMsg(t("Select mouse over type") + ": " + newSet.showByMouseOverType, "info", { timeout: 2200 })
        }

        // プラグイン設定で無効が有効になった場合は、トグルも強制的に有効にする
        if (oldSet.loadShowByMouseOver === false
            && newSet.loadShowByMouseOver === true)
            setTimeout(() =>
                logseq.updateSettings({ toggleShowByMouseOver: "mouseOver" })
                , 10)
        else
            if (oldSet.loadShowByMouseOver === true
                && newSet.loadShowByMouseOver === false)
                removeProvideStyle(keyShowByMouseOver)
    })
}

const selectShowByMouseOverType = (setting: string) => {

    switch (setting) {
        case "type A":
            logseq.provideStyle({ key: keyShowByMouseOver, style: CSSTypeA })
            break
        default: //type B
            logseq.provideStyle({ key: keyShowByMouseOver, style: CSSTypeB })
            break
    }
    handleEvent(10)
}



const handleEvent = (time: number) => {

    // 待機が必要。ボタンがまだ生成されていない場合がある
    setTimeout(() => {

        if (processingMouseOverButton === true) return
        const button = parent.document.getElementById("left-menu") as HTMLButtonElement | null
        if (!button) {
            console.warn("button is null")
            return
        }
        button.addEventListener("click", whenToggleEvent)

        processingMouseOverButton = true // 連続してイベントが発生しないようにする 一度のみ
    }, time)
}


const whenToggleEvent = () => {

    if (logseq.settings!.loadShowByMouseOver === false) return //プラグイン設定で無効化されている場合は何もしない

    if (logseq.settings!.toggleShowByMouseOver === "mouseOver") {
        //前回のメモリーはマウスオーバー

        //ノーマル表示にする
        logseq.App.setLeftSidebarVisible(true)
        setTimeout(() => {
            removeProvideStyle(keyShowByMouseOver)
            logseq.updateSettings({ toggleShowByMouseOver: "normal" })
            logseq.UI.showMsg(t("Left sidebar is now normal display."), "info", { timeout: 2200 })
        }, 10)
    } else
        if (logseq.settings!.toggleShowByMouseOver === "normal") {
            //前回のメモリーはノーマル表示

            //表示しない
            logseq.App.setLeftSidebarVisible(false)
            setTimeout(() => {
                removeProvideStyle(keyShowByMouseOver)
                logseq.updateSettings({ toggleShowByMouseOver: "off" })
                logseq.UI.showMsg(t("Left sidebar is now hidden."), "info", { timeout: 2200 })
            }, 10)
        } else {
            //前回のメモリーは表示しない

            //マウスオーバーで表示する
            logseq.App.setLeftSidebarVisible(true)
            setTimeout(() => {
                selectShowByMouseOverType(logseq.settings!.showByMouseOverType as string)
                logseq.updateSettings({ toggleShowByMouseOver: "mouseOver" })
                logseq.UI.showMsg(t("Left sidebar is now mouse over display."), "info", { timeout: 2200 })
            }, 10)
        }
}