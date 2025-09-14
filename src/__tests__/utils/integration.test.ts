/**
 * Vue + Svelteハイブリッドアーキテクチャの統合テスト
 */

import { mount } from '@vue/test-utils'
import { jest } from '@jest/globals'
import App from '../../components/vue/App.vue'

// 統合テスト用のモック
jest.mock('../../dateSelector', () => ({
  loadDateSelector: jest.fn()
}))

jest.mock('../../page-outline/setup', () => ({
  setupTOCHandlers: jest.fn()
}))

jest.mock('../../page-outline/pageHeaders', () => ({
  refreshPageHeaders: jest.fn()
}))

describe('Vue + Svelteハイブリッドアーキテクチャ統合テスト', () => {
  let wrapper: any
  
  beforeEach(() => {
    // DOMエレメントのモック
    document.getElementById = jest.fn().mockImplementation((id) => {
      const element = document.createElement('div')
      element.id = id
      return element
    })
    
    // logseqオブジェクトの完全なモック
    global.logseq = {
      ready: jest.fn((fn) => Promise.resolve(fn())),
      useSettingsSchema: jest.fn(),
      settings: {
        booleanDateSelector: true,
        booleanTableOfContents: true,
        booleanLeftTOC: true,
        booleanFavAndRecent: true,
        loadShowByMouseOver: true,
        highlightBlockOnHover: true,
        highlightHeaderOnHover: true,
        enableJournalsList: true
      },
      showSettingsUI: jest.fn(),
      beforeunload: jest.fn(),
      App: {
        onCurrentGraphChanged: jest.fn(),
        getInfo: jest.fn().mockResolvedValue('0.10.9')
      },
      DB: {
        onChanged: jest.fn(),
        onBlockChanged: jest.fn()
      }
    }
    
    window.logseq = global.logseq
  })
  
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  test('VueアプリがSvelteコンポーネントを適切に統合することを確認', async () => {
    wrapper = mount(App)
    
    // Vueコンポーネントの基本機能確認
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('#date-selector-mount').exists()).toBe(true)
    expect(wrapper.find('#toc-mount').exists()).toBe(true)
    
    // 設定更新の統合テスト
    wrapper.vm.updateSettings({
      booleanDateSelector: false,
      booleanLeftTOC: true
    })
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.settings.booleanDateSelector).toBe(false)
    expect(wrapper.vm.settings.booleanLeftTOC).toBe(true)
  })

  test('ページ変更時にVueとSvelteコンポーネント間の連携が正常に動作することを確認', async () => {
    wrapper = mount(App)
    
    // 初期状態
    expect(wrapper.vm.currentPage).toBe('')
    
    // ページ更新
    wrapper.vm.updateCurrentPage('test-page', 'test-uuid')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.currentPage).toBe('test-page')
  })

  test('Logseqバージョン変更時の連携が正常に動作することを確認', async () => {
    wrapper = mount(App)
    
    // 初期状態
    expect(wrapper.vm.logseqVersionMd).toBe(false)
    
    // バージョン更新
    wrapper.vm.setLogseqVersionMd(true)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.logseqVersionMd).toBe(true)
  })

  test('設定変更時のリアクティブ更新が正常に動作することを確認', async () => {
    wrapper = mount(App)
    
    const initialDateSelector = wrapper.vm.settings.booleanDateSelector
    const initialTOC = wrapper.vm.settings.booleanLeftTOC
    
    // 設定を変更
    wrapper.vm.updateSettings({
      booleanDateSelector: !initialDateSelector,
      booleanLeftTOC: !initialTOC
    })
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.settings.booleanDateSelector).toBe(!initialDateSelector)
    expect(wrapper.vm.settings.booleanLeftTOC).toBe(!initialTOC)
  })

  test('コンポーネントのクリーンアップが適切に実行されることを確認', async () => {
    wrapper = mount(App)
    
    // マウント状態を確認
    expect(wrapper.exists()).toBe(true)
    
    // アンマウント
    wrapper.unmount()
    
    // クリーンアップ後の状態確認
    expect(wrapper.exists()).toBe(false)
  })

  test('複数の機能が同時に動作することを確認', async () => {
    wrapper = mount(App)
    
    // 複数の設定を同時に有効化
    wrapper.vm.updateSettings({
      booleanDateSelector: true,
      booleanLeftTOC: true,
      booleanTableOfContents: true
    })
    
    // ページとバージョン情報を同時に更新
    wrapper.vm.updateCurrentPage('multi-test-page', 'multi-test-uuid')
    wrapper.vm.setLogseqVersionMd(true)
    
    await wrapper.vm.$nextTick()
    
    // すべての設定が正しく反映されていることを確認
    expect(wrapper.vm.settings.booleanDateSelector).toBe(true)
    expect(wrapper.vm.settings.booleanLeftTOC).toBe(true)
    expect(wrapper.vm.settings.booleanTableOfContents).toBe(true)
    expect(wrapper.vm.currentPage).toBe('multi-test-page')
    expect(wrapper.vm.logseqVersionMd).toBe(true)
  })
})