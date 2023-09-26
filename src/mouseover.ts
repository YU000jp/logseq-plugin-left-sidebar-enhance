import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin";
import CSSTypeA from "./mouseoverA.css?inline";
import CSSTypeB from "./mouseoverB.css?inline";
import { removeProvideStyle } from "./lib";
import { t } from "logseq-l10n";
const keyShowByMouseOver = "showByMouseOver";


export const loadShowByMouseOver = () => {

    //初期設定
    if (!logseq.settings!.toggleShowByMouseOver) logseq.updateSettings({ toggleShowByMouseOver: "mouseOver" });

    //前回のメモリー
    if (logseq.settings!.toggleShowByMouseOver === "mouseOver") selectShowByMouseOverType(logseq.settings!.showByMouseOverType);


    buttonEvent();
    //プラグイン設定変更時
    logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
        if (oldSet.showByMouseOverType !== newSet.showByMouseOverType) {
            if (newSet.loadShowByMouseOver === true) {
                removeProvideStyle(keyShowByMouseOver);
                selectShowByMouseOverType(newSet.showByMouseOverType);
                logseq.UI.showMsg(t("select mouse over type: ") + newSet.showByMouseOverType, "info", { timeout: 2200 });
            }
        }
        //
        if (oldSet.loadShowByMouseOver === false && newSet.loadShowByMouseOver === true) {
            newSet.toggleShowByMouseOver = "mouseOver";
            selectShowByMouseOverType(newSet.showByMouseOverType);
        } else if (oldSet.loadShowByMouseOver === true && newSet.loadShowByMouseOver === false) {
            removeProvideStyle(keyShowByMouseOver);
        }
    });

    //プラグイン無効化時
    logseq.beforeunload(async () => {
        removeProvideStyle(keyShowByMouseOver);
        logseq.updateSettings({ toggleShowByMouseOver: "mouseOver" });
    });

};

const selectShowByMouseOverType = (setting: string) => {
    switch (setting) {
        case "type A":
            logseq.provideStyle({ key: keyShowByMouseOver, style: CSSTypeA });
            break;
        default: //type B
            logseq.provideStyle({ key: keyShowByMouseOver, style: CSSTypeB });
            break;
    }
};



const buttonEvent = () => setTimeout(() => {
    const button = parent.document.getElementById("left-menu") as HTMLButtonElement | null;
    if (!button) {
        console.log("button is null");
        return;
    }
    button.addEventListener("click", () => {
        if (logseq.settings!.loadShowByMouseOver === false) return; //プラグイン設定で無効化されている場合は何もしない
        if (logseq.settings!.toggleShowByMouseOver === "mouseOver") { //前回のメモリーはマウスオーバー
            //ノーマル表示にする
            logseq.App.setLeftSidebarVisible(true);
            setTimeout(() => {
                removeProvideStyle(keyShowByMouseOver);
                logseq.updateSettings({ toggleShowByMouseOver: "normal" });
                logseq.UI.showMsg(t("Left sidebar is now normal display."), "info", { timeout: 2200 });
            }, 10);
        } else if (logseq.settings!.toggleShowByMouseOver === "normal") { //前回のメモリーはノーマル表示
            //表示しない
            logseq.App.setLeftSidebarVisible(false);
            setTimeout(() => {
                removeProvideStyle(keyShowByMouseOver);
                logseq.updateSettings({ toggleShowByMouseOver: "off" });
                logseq.UI.showMsg(t("Left sidebar is now hidden."), "info", { timeout: 2200 });
            }, 10);
        } else { //前回のメモリーは表示しない
            //マウスオーバーで表示する
            logseq.App.setLeftSidebarVisible(true);
            setTimeout(() => {
                selectShowByMouseOverType(logseq.settings!.showByMouseOverType);
                logseq.updateSettings({ toggleShowByMouseOver: "mouseOver" });
                logseq.UI.showMsg(t("Left sidebar is now mouse over display."), "info", { timeout: 2200 });
            }, 10);
        }
    });
}, 300);