import CSSShowByMouseOver from "./ShowByMouseOver.css?inline";
import { removeProvideStyle } from "./lib";
const keyHideByMouseOver = "hideByMouseOver";

export const loadShowByMouseOver = () => {

    //初期設定
    if (!logseq.settings!.toggleShowByMouseOver) logseq.updateSettings({ toggleShowByMouseOver: "mouseOver" });

    //前回のメモリー
    if (logseq.settings!.toggleShowByMouseOver === "mouseOver") logseq.provideStyle({ key: keyHideByMouseOver, style: CSSShowByMouseOver });

    //ボタンを押した時の挙動
    setTimeout(() => {
        const button = parent.document.getElementById("left-menu") as HTMLButtonElement | null;
        if (!button) {
            console.log("button is null");
            return;
        }
        button.addEventListener("click", () => {//Toggle 3 pattern: mouse over, normal, and hide
            if (logseq.settings!.toggleShowByMouseOver === "mouseOver") {//前回のメモリーはマウスオーバー
                //ノーマル表示にする
                logseq.App.setLeftSidebarVisible(true);
                setTimeout(() => {
                    removeProvideStyle(keyHideByMouseOver);
                    logseq.updateSettings({ toggleShowByMouseOver: "normal" });
                    logseq.UI.showMsg("Left sidebar is now normal display.", "info", { timeout: 2000 });
                }, 10);
            } else if (logseq.settings!.toggleShowByMouseOver === "normal") {//前回のメモリーはノーマル表示
                //表示しない
                logseq.App.setLeftSidebarVisible(false);
                setTimeout(() => {
                    removeProvideStyle(keyHideByMouseOver);
                    logseq.updateSettings({ toggleShowByMouseOver: "off" });
                    logseq.UI.showMsg("Left sidebar is now hidden.", "info", { timeout: 2000 });
                }, 10);
            } else {//前回のメモリーは表示しない
                //マウスオーバーで表示する
                logseq.App.setLeftSidebarVisible(true);
                setTimeout(() => {
                    logseq.provideStyle({ key: keyHideByMouseOver, style: CSSShowByMouseOver });
                    logseq.updateSettings({ toggleShowByMouseOver: "mouseOver" });
                    logseq.UI.showMsg("Left sidebar is now mouse over display.", "info", { timeout: 2000 });
                }, 10);
            }
        });
    }, 300);
};

