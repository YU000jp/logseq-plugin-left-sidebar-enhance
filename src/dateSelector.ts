import { AppUserConfigs, PageEntity } from "@logseq/libs/dist/LSPlugin.user";
import format from "date-fns/format";


export const loadDateSelector = () => {

    if (logseq.settings!.booleanDateSelector === true) {
        //match[0]はcurrentPageName
        //match[1]は年
        //match[2]は月

        if (parent.document.getElementById("th-dateSelector-container")) return;//すでに存在する場合はキャンセル
        setTimeout(async () => {
            //左サイドバーのnav-contents-containerにスペースを追加する
            const navElement: HTMLDivElement | null = parent.document.querySelector("div#main-container div#left-sidebar>div.left-sidebar-inner div.nav-contents-container") as HTMLDivElement | null;
            if (navElement === null) return; //nullの場合はキャンセル
            navElement.innerHTML += (`
        <div class="nav-content-item mt-3 is-expand flex-shrink-0" style="min-height: 56px;">
        <div class="nav-content-item-inner">
        <div class="header items-center" id="th-dateSelector-container"></div>
        </div>
        </div>
        <style>
        div#left-sidebar div#th-dateSelector-container>label {
            & p{
                white-space: nowrap;
                overflow: visible;
            &>input {
                width:100%;
                border-radius: 4px;
                border: 1px solid var(--ls-secondary-text-color);
                /* background: var(--ls-secondary-background-color);
                color: var(--ls-primary-text-color); */
                color: var(--ls-secondary-background-color);
                margin-right: .4em;
            }
            }
        }
        </style>
    `);

            const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;

            //スペースに日付セレクターを追加する
            setTimeout(() => {
                const dateSelectorHereElement: HTMLDivElement | null = parent.document.getElementById("th-dateSelector-container") as HTMLDivElement | null;
                if (dateSelectorHereElement === null) return; //nullの場合はキャンセル

                //すでに存在する場合はキャンセル
                if (dateSelectorHereElement.dataset.flag !== "true") createSelector(preferredDateFormat, dateSelectorHereElement);//label>input#th-dateSelector

                dateSelectorHereElement.dataset.flag = "true"; //フラグを立てる
            }, 1);

        }, 500);
    }
};


const createSelector = (preferredDateFormat: string, dateSelectorHereElement: HTMLDivElement) => {
    const selectorLabel: HTMLLabelElement = document.createElement("label");
    const pElement: HTMLParagraphElement = document.createElement("p");
    const p2Element: HTMLParagraphElement = document.createElement("p");
    //type: date
    pElement.title = "Date";
    const selectorInput: HTMLInputElement = document.createElement("input");
    selectorInput.type = "date";
    selectorInput.id = "th-dateSelector-date";
    selectorInput.value = new Date().toISOString().slice(0, 10);
    //OKボタン
    const okButton: HTMLButtonElement = document.createElement("button");
    okButton.textContent = "OK";
    pElement.append(selectorInput, okButton);
    //日付をもとにページを開くイベント
    okButton.addEventListener("click", async ({ shiftKey }) => {
        const date = parent.document.getElementById("th-dateSelector-date") as HTMLInputElement | null;
        if (!date) return;
        await pageOpen(format(new Date(date.value), preferredDateFormat), shiftKey);
    });
    //type: month
    p2Element.title = "Month";
    const selectorInputMonth: HTMLInputElement = document.createElement("input");
    selectorInputMonth.type = "month";
    selectorInputMonth.id = "th-dateSelector-month";
    selectorInputMonth.value = new Date().toISOString().slice(0, 7);
    //OKボタン
    const okButton2: HTMLButtonElement = document.createElement("button");
    okButton2.textContent = "OK";
    p2Element.append(selectorInputMonth, okButton2);
    //日付をもとにページを開くイベント(年/月)
    okButton2.addEventListener("click", async ({ shiftKey }) => {
        const date = parent.document.getElementById("th-dateSelector-month") as HTMLInputElement | null;
        if (!date) return;
        await pageOpen(format(new Date(date.value), "yyyy/MM"), shiftKey);
    });
    selectorLabel.append(pElement);
    selectorLabel.append(p2Element);
    dateSelectorHereElement.appendChild(selectorLabel);
};


const pageOpen = async (pageName: string, shiftKey: boolean) => {
    const page = await logseq.Editor.getPage(pageName) as PageEntity | null;
    if (page) {
        if (shiftKey) logseq.Editor.openInRightSidebar(page.uuid);
        else logseq.Editor.scrollToBlockInPage(pageName, page.uuid, { replaceState: true });
    }
};

