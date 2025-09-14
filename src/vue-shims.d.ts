declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.svelte' {
  import { SvelteComponent } from 'svelte'
  export default class extends SvelteComponent<any, any, any> {}
}

declare global {
  interface Window {
    logseq?: any
  }
}