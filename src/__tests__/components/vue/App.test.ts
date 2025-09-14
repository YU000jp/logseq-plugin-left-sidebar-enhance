/**
 * Vueメインアプリケーションコンポーネントのテスト
 */

import { mount } from '@vue/test-utils'
import { jest } from '@jest/globals'
import App from '../../../components/vue/App.vue'

// Svelteコンポーネントのモック
jest.mock('../../../components/svelte/DateSelector.svelte', () => {
  return jest.fn().mockImplementation(() => ({
    $destroy: jest.fn(),
    $set: jest.fn()
  }))
})

jest.mock('../../../components/svelte/TableOfContents.svelte', () => {
  return jest.fn().mockImplementation(() => ({
    $destroy: jest.fn(),
    $set: jest.fn()
  }))
})

describe('App.vue - Vueメインコンポーネント', () => {
  let wrapper: any
  
  beforeEach(() => {
    // DOMエレメントのモック
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'date-selector-mount' || id === 'toc-mount') {
        return document.createElement('div')
      }
      return null
    })
    
    // logseqオブジェクトのモック
    global.logseq = {
      settings: {
        booleanDateSelector: true,
        booleanTableOfContents: true,
        booleanLeftTOC: true,
        booleanFavAndRecent: true
      }
    }
    
    window.logseq = global.logseq
  })
  
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  test('コンポーネントが正常にマウントされることを確認', () => {
    wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })

  test('設定に応じてdate-selectorとtoc-mountが表示されることを確認', async () => {
    wrapper = mount(App)
    
    // 初期状態でbooleanDateSelectorとbooleanLeftTOCがtrueなので、両方表示される
    await wrapper.vm.$nextTick()
    
    const dateSelectorMount = wrapper.find('#date-selector-mount')
    const tocMount = wrapper.find('#toc-mount')
    
    expect(dateSelectorMount.exists()).toBe(true)
    expect(tocMount.exists()).toBe(true)
  })

  test('updateCurrentPage メソッドが正常に動作することを確認', () => {
    wrapper = mount(App)
    
    wrapper.vm.updateCurrentPage('test-page', 'test-uuid')
    
    expect(wrapper.vm.currentPage).toBe('test-page')
  })

  test('setLogseqVersionMd メソッドが正常に動作することを確認', () => {
    wrapper = mount(App)
    
    wrapper.vm.setLogseqVersionMd(true)
    
    expect(wrapper.vm.logseqVersionMd).toBe(true)
  })

  test('updateSettings メソッドが設定を適切に更新することを確認', () => {
    wrapper = mount(App)
    
    const newSettings = {
      booleanDateSelector: false,
      booleanLeftTOC: false
    }
    
    wrapper.vm.updateSettings(newSettings)
    
    expect(wrapper.vm.settings.booleanDateSelector).toBe(false)
    expect(wrapper.vm.settings.booleanLeftTOC).toBe(false)
  })

  test('設定変更時にSvelteコンポーネントの表示が切り替わることを確認', async () => {
    wrapper = mount(App)
    
    // 初期状態確認
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#date-selector-mount').exists()).toBe(true)
    expect(wrapper.find('#toc-mount').exists()).toBe(true)
    
    // booleanDateSelectorをfalseに変更
    wrapper.vm.updateSettings({ booleanDateSelector: false })
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('#date-selector-mount').exists()).toBe(false)
    expect(wrapper.find('#toc-mount').exists()).toBe(true)
  })

  test('キーボードショートカット（Ctrl+Shift+S）で設定パネルが開閉することを確認', async () => {
    wrapper = mount(App)
    
    expect(wrapper.vm.showSettings).toBe(false)
    
    // Ctrl+Shift+Sのキーイベントをシミュレート
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'S',
      ctrlKey: true,
      shiftKey: true
    })
    
    document.dispatchEvent(keyEvent)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.showSettings).toBe(true)
  })

  test('defineExposeで公開されたメソッドが適切に動作することを確認', () => {
    wrapper = mount(App)
    
    // 公開されたメソッドの存在確認
    expect(typeof wrapper.vm.updateCurrentPage).toBe('function')
    expect(typeof wrapper.vm.setLogseqVersionMd).toBe('function')
    expect(typeof wrapper.vm.updateSettings).toBe('function')
    
    // プロパティの存在確認
    expect(wrapper.vm.currentPage).toBeDefined()
    expect(wrapper.vm.logseqVersionMd).toBeDefined()
  })
})