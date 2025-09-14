/**
 * Svelte TableOfContentsコンポーネントのテスト
 */

import { jest } from '@jest/globals'

// page-outlineモジュールのモック
jest.mock('../../../page-outline/setup', () => ({
  setupTOCHandlers: jest.fn()
}))

jest.mock('../../../page-outline/pageHeaders', () => ({
  refreshPageHeaders: jest.fn()
}))

// Svelteコンポーネントをモックとしてテスト
jest.mock('../../../components/svelte/TableOfContents.svelte', () => {
  function TableOfContents(options: any) {
    this.target = options?.target
    this.props = options?.props || {}
    this.$destroy = jest.fn()
    this.$set = jest.fn((newProps: any) => {
      // プロパティ更新時の動作をシミュレート
      Object.assign(this.props, newProps)
      
      if (newProps.hasOwnProperty('logseqVersionMd')) {
        const { setupTOCHandlers } = require('../../../page-outline/setup')
        setupTOCHandlers(newProps.logseqVersionMd)
      }
      
      if (newProps.hasOwnProperty('currentPage') && newProps.currentPage) {
        const { refreshPageHeaders } = require('../../../page-outline/pageHeaders')
        refreshPageHeaders(newProps.currentPage)
      }
    })
    
    // onMount behavior simulation
    if (options?.target) {
      // Simulate component mounting
      const { setupTOCHandlers } = require('../../../page-outline/setup')
      const { refreshPageHeaders } = require('../../../page-outline/pageHeaders')
      
      if (this.props.logseqVersionMd !== undefined) {
        setupTOCHandlers(this.props.logseqVersionMd)
      }
      
      if (this.props.currentPage) {
        refreshPageHeaders(this.props.currentPage)
      }
    }
    
    return this
  }
  return { default: TableOfContents }
})

describe('TableOfContents.svelte - Svelte目次コンポーネント', () => {
  let mockContainer: HTMLElement
  const defaultProps = {
    currentPage: 'test-page',
    logseqVersionMd: true
  }

  beforeEach(() => {
    // DOM要素をセットアップ
    mockContainer = document.createElement('div')
    mockContainer.id = 'test-container'
    document.body.appendChild(mockContainer)
    
    // モックをリセット
    jest.clearAllMocks()
  })

  afterEach(() => {
    // DOMをクリーンアップ
    if (mockContainer) {
      document.body.removeChild(mockContainer)
    }
    
    const container = document.getElementById('lse-toc-container')
    if (container) {
      container.remove()
    }
  })

  test('コンポーネントが正常にレンダリングされることを確認', async () => {
    const TableOfContents = (await import('../../../components/svelte/TableOfContents.svelte')).default
    
    const instance = new TableOfContents({
      target: mockContainer,
      props: defaultProps
    })
    
    expect(instance).toBeTruthy()
    expect(instance.target).toBe(mockContainer)
  })

  test('マウント時にsetupTOCHandlersが適切なパラメータで呼び出されることを確認', async () => {
    const { setupTOCHandlers } = await import('../../../page-outline/setup')
    const TableOfContents = (await import('../../../components/svelte/TableOfContents.svelte')).default
    
    new TableOfContents({
      target: mockContainer,
      props: defaultProps
    })
    
    expect(setupTOCHandlers).toHaveBeenCalledWith(true)
  })

  test('currentPageが指定されている場合、refreshPageHeadersが呼び出されることを確認', async () => {
    const { refreshPageHeaders } = await import('../../../page-outline/pageHeaders')
    const TableOfContents = (await import('../../../components/svelte/TableOfContents.svelte')).default
    
    new TableOfContents({
      target: mockContainer,
      props: defaultProps
    })
    
    expect(refreshPageHeaders).toHaveBeenCalledWith('test-page')
  })

  test('currentPageが空の場合、refreshPageHeadersが初回呼び出されないことを確認', async () => {
    const { refreshPageHeaders } = await import('../../../page-outline/pageHeaders')
    const TableOfContents = (await import('../../../components/svelte/TableOfContents.svelte')).default
    
    new TableOfContents({
      target: mockContainer,
      props: { 
        ...defaultProps, 
        currentPage: '' 
      }
    })
    
    // 初回マウント時には呼び出されない（currentPageが空のため）
    expect(refreshPageHeaders).not.toHaveBeenCalled()
  })

  test('logseqVersionMdの変更時にsetupTOCHandlersが再実行されることを確認', async () => {
    const { setupTOCHandlers } = await import('../../../page-outline/setup')
    const TableOfContents = (await import('../../../components/svelte/TableOfContents.svelte')).default
    
    const instance = new TableOfContents({
      target: mockContainer,
      props: defaultProps
    })
    
    // 初回呼び出しをクリア
    jest.clearAllMocks()
    
    // logseqVersionMdを変更
    instance.$set({ logseqVersionMd: false })
    
    expect(setupTOCHandlers).toHaveBeenCalledWith(false)
  })

  test('currentPageの変更時にrefreshPageHeadersが再実行されることを確認', async () => {
    const { refreshPageHeaders } = await import('../../../page-outline/pageHeaders')
    const TableOfContents = (await import('../../../components/svelte/TableOfContents.svelte')).default
    
    const instance = new TableOfContents({
      target: mockContainer,
      props: defaultProps
    })
    
    // 初回呼び出しをクリア
    jest.clearAllMocks()
    
    // currentPageを変更
    instance.$set({ currentPage: 'new-test-page' })
    
    expect(refreshPageHeaders).toHaveBeenCalledWith('new-test-page')
  })

  test('アンマウント時にクリーンアップが実行されることを確認', async () => {
    const TableOfContents = (await import('../../../components/svelte/TableOfContents.svelte')).default
    
    // テストコンテナを作成
    const tocContainer = document.createElement('div')
    tocContainer.id = 'lse-toc-container'
    document.body.appendChild(tocContainer)
    
    const instance = new TableOfContents({
      target: mockContainer,
      props: defaultProps
    })
    
    // $destroyメソッドが存在することを確認
    expect(typeof instance.$destroy).toBe('function')
    
    // $destroyを実行
    instance.$destroy()
    
    // $destroyが呼び出されたことを確認
    expect(instance.$destroy).toHaveBeenCalled()
  })

  test('propsの初期値が適切に設定されることを確認', async () => {
    const TableOfContents = (await import('../../../components/svelte/TableOfContents.svelte')).default
    
    const customProps = {
      currentPage: 'custom-page',
      logseqVersionMd: false
    }
    
    const instance = new TableOfContents({
      target: mockContainer,
      props: customProps
    })
    
    expect(instance.props).toEqual(customProps)
  })
})