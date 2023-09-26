import { PageEntity } from "@logseq/libs/dist/LSPlugin.user";

export const loadNewChildPageButton = () => setTimeout(() => {

  //create-button エレメントはホワイトボード機能を有効にしている場合のみ
  const createButtonElement = parent.document.getElementById(
    "create-button"
  ) as HTMLButtonElement | null;
  if (createButtonElement) {
    //新規作成ぼたんが押されたときの処理
    createButtonEvent(createButtonElement);
  } else {
    //ホワイトボード機能をオフにしている場合
    WhenWhiteboardOff();
  }

  //ページメニューに追加
  logseq.App.registerPageMenuItem("New child page", async ({ page }) => openSearchBoxInputHierarchy(true, page));

}, 600);


const createButtonEvent = (createButtonElement: HTMLButtonElement) => {
  createButtonElement.addEventListener("click", async () => {

    if (logseq.settings!.loadNewChildPageButton === false) return;//設定がオフの場合は何もしない

    const page = (await logseq.Editor.getCurrentPage()) as PageEntity | null;
    if (page) {
      //ページ名が取得できる場合のみ
      setTimeout(() => {
        const menuLinkElement = parent.document.querySelector(
          "div#left-sidebar footer button#create-button+div.dropdown-wrapper div.menu-links-wrapper"
        ) as HTMLDivElement | null;
        if (menuLinkElement) {
          menuLinkElement.insertAdjacentHTML(
            "beforeend",
            `
        <a id="${logseq.baseInfo.id}--createPageButton" class="flex justify-between px-4 py-2 text-sm transition ease-in-out duration-150 cursor menu-link">
        <span class="flex-1">
        <div class="flex items-center">
        <div class="type-icon highlight">
        <span class="ui__icon tie tie-new-page"></span></div><div class="title-wrap" style="margin-right: 8px; margin-left: 4px;">New child page</span></div></div></a>
        `
          );
          setTimeout(() => {
            const buttonElement = parent.document.getElementById(
              `${logseq.baseInfo.id}--createPageButton`
            ) as HTMLAnchorElement | null;
            if (buttonElement) {
              buttonElement.addEventListener("click", async () => {
                buttonElement.remove();
                openSearchBoxInputHierarchy(true, page.originalName);
              });
            }
          }, 50);
        }
      }, 30);
    }
  });
};



const WhenWhiteboardOff = () => {
  const newPageLinkElement = parent.document.querySelector(
    "div#left-sidebar footer a.new-page-link"
  ) as HTMLAnchorElement | null;
  if (newPageLinkElement) {
    newPageLinkElement.addEventListener("click", async () => {

      if (logseq.settings!.loadNewChildPageButton === false) return;//設定がオフの場合は何もしない

      const page = (await logseq.Editor.getCurrentPage()) as PageEntity | null; //ページ名が取得できる場合のみ
      if (page && confirm("Insert current page title?\nFor create new the child page"))
        openSearchBoxInputHierarchy(false, page.originalName);
    });
  }
};

const openSearchBoxInputHierarchy = (openSearchUI: Boolean, pageName?: string) => {
  if (openSearchUI === true)
    logseq.App.invokeExternalCommand("logseq.go/search");
  setTimeout(async () => {
    const inputElement = parent.document.querySelector(
      'div[label="ls-modal-search"] div.input-wrap input[type="text"]'
    ) as HTMLInputElement | null;
    if (inputElement) {
      if (pageName) inputElement.value = pageName + "/";
      else {
        const page =
          (await logseq.Editor.getCurrentPage()) as PageEntity | null;
        if (page && page.originalName)
          inputElement.value = page.originalName + "/";
      }
    }
  }, 50);
};