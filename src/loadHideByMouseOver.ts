import CSShideByMouseOver from "./hideByMouseOver.css?inline";

export const loadHideByMouseOver = () => {

    //logseq.settings!.loadHideByMouseOver : boolean

    //CSS hideByMouseOver
    logseq.provideStyle({ key: "hideByMouseOver", style: CSShideByMouseOver });

};
