import { ExternalCommandType, LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin"
import CSSTypeA from "./mouseoverA.css?inline"
import CSSTypeB from "./mouseoverB.css?inline"
import { removeProvideStyle } from "./utils/lib"
import { t } from "logseq-l10n"
const keyShowByMouseOver = "showByMouseOver"
let processingMouseOverButton = false

export const loadShowByMouseOver = () => {

    setTimeout(() => {
        logseq.App.onAfterCommandInvoked("logseq.ui/toggle-left-sidebar" as ExternalCommandType, () => {
            if (logseq.settings!.loadShowByMouseOver === true)
                whenToggleEvent()
        })

        //プラグイン設定変更時
        logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {

            // マウスオーバーの表示方法が変更された場合
            if (oldSet.showByMouseOverType !== newSet.showByMouseOverType
                && newSet.loadShowByMouseOver === true) {

                removeProvideStyle(keyShowByMouseOver)
                if (newSet.toggleShowByMouseOver === "mouseOver")
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
    }, 1000)


    if (logseq.settings!.loadShowByMouseOver === true) {

        //前回のメモリーで、マウスオーバー表示の場合
        if (logseq.settings!.toggleShowByMouseOver === "mouseOver") {
            selectShowByMouseOverType(logseq.settings!.showByMouseOverType as string)
            logseq.App.setLeftSidebarVisible(true)
        } else
            if (logseq.settings!.toggleShowByMouseOver === "normal") {
                logseq.App.setLeftSidebarVisible(true)
            } else
                if (logseq.settings!.toggleShowByMouseOver === "off") {
                    logseq.App.setLeftSidebarVisible(false)
                }

        // 左メニューのボタンのスイッチング用
        handleEvent(1000)
    }

}

const selectShowByMouseOverType = (setting: string) => {
    switch (setting) {
        case "type A":
            logseq.provideStyle({ key: keyShowByMouseOver, style: CSSTypeA })
            break
        case "type B":
            logseq.provideStyle({ key: keyShowByMouseOver, style: CSSTypeB })
            break
    }

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
        //前回のメモリーがマウスオーバーの場合、ノーマル表示にする
        logseq.App.setLeftSidebarVisible(true)
        setTimeout(() => {
            removeProvideStyle(keyShowByMouseOver)
            logseq.updateSettings({ toggleShowByMouseOver: "normal" })
            logseq.UI.showMsg(t("Left sidebar is now normal display."), "info", { timeout: 2200 })
        }, 10)
    } else
        if (logseq.settings!.toggleShowByMouseOver === "normal") {
            //前回のメモリーはノーマル表示の場合、非表示にする
            logseq.App.setLeftSidebarVisible(false)
            setTimeout(() => {
                removeProvideStyle(keyShowByMouseOver)
                logseq.updateSettings({ toggleShowByMouseOver: "off" })
                logseq.UI.showMsg(t("Left sidebar is now hidden."), "info", { timeout: 2200 })
            }, 10)
        } else
            if (logseq.settings!.toggleShowByMouseOver === "off") {
                //前回のメモリーが非表示の場合、マウスオーバーにする
                logseq.App.setLeftSidebarVisible(true)
                setTimeout(() => {
                    selectShowByMouseOverType(logseq.settings!.showByMouseOverType as string)
                    handleEvent(100)
                    logseq.updateSettings({ toggleShowByMouseOver: "mouseOver" })
                    logseq.UI.showMsg(t("Left sidebar is now mouse over display."), "info", { timeout: 2200 })
                }, 10)
            }
}