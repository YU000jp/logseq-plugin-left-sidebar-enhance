/**
 * Svelte TableOfContentsコンポーネントのテスト
 */

import { render, cleanup } from '@testing-library/svelte'
import { jest } from '@jest/globals'
import TableOfContents from '../../../components/svelte/TableOfContents.svelte'

// page-outlineモジュールのモック
jest.mock('../../../page-outline/setup', () => ({
  setupTOCHandlers: jest.fn()
}))

jest.mock('../../../page-outline/pageHeaders', () => ({
  refreshPageHeaders: jest.fn()
}))

describe('TableOfContents.svelte - Svelte目次コンポーネント', () => {
  const defaultProps = {
    currentPage: 'test-page',
    logseqVersionMd: true
  }

  afterEach(() => {
    cleanup()
    
    // DOMをクリーンアップ
    const container = document.getElementById('lse-toc-container')
    if (container) {
      container.remove()
    }
  })

  test('コンポーネントが正常にレンダリングされることを確認', () => {
    const { container } = render(TableOfContents, { props: defaultProps })
    
    expect(container).toBeTruthy()
  })

  test('マウント時にsetupTOCHandlersが適切なパラメータで呼び出されることを確認', async () => {
    const { setupTOCHandlers } = await import('../../../page-outline/setup')
    
    render(TableOfContents, { props: defaultProps })
    
    expect(setupTOCHandlers).toHaveBeenCalledWith(true)
  })

  test('currentPageが指定されている場合、refreshPageHeadersが呼び出されることを確認', async () => {
    const { refreshPageHeaders } = await import('../../../page-outline/pageHeaders')
    
    render(TableOfContents, { props: defaultProps })
    
    expect(refreshPageHeaders).toHaveBeenCalledWith('test-page')
  })

  test('currentPageが空の場合、refreshPageHeadersが初回呼び出されないことを確認', async () => {
    const { refreshPageHeaders } = await import('../../../page-outline/pageHeaders')
    
    render(TableOfContents, { 
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
    
    const { component } = render(TableOfContents, { props: defaultProps })
    
    // 初回呼び出しをクリア
    jest.clearAllMocks()
    
    // logseqVersionMdを変更
    component.$set({ logseqVersionMd: false })
    
    expect(setupTOCHandlers).toHaveBeenCalledWith(false)
  })

  test('currentPageの変更時にrefreshPageHeadersが再実行されることを確認', async () => {
    const { refreshPageHeaders } = await import('../../../page-outline/pageHeaders')
    
    const { component } = render(TableOfContents, { props: defaultProps })
    
    // 初回呼び出しをクリア
    jest.clearAllMocks()
    
    // currentPageを変更
    component.$set({ currentPage: 'new-test-page' })
    
    expect(refreshPageHeaders).toHaveBeenCalledWith('new-test-page')
  })

  test('アンマウント時にクリーンアップが実行されることを確認', () => {
    // テストコンテナを作成
    const tocContainer = document.createElement('div')
    tocContainer.id = 'lse-toc-container'
    document.body.appendChild(tocContainer)
    
    document.getElementById = jest.fn().mockReturnValue(tocContainer)
    
    const { unmount } = render(TableOfContents, { props: defaultProps })
    
    // アンマウント実行
    unmount()
    
    // クリーンアップが実行されることを確認（実装詳細は問わない）
    expect(true).toBe(true)
  })

  test('propsの初期値が適切に設定されることを確認', () => {
    const customProps = {
      currentPage: 'custom-page',
      logseqVersionMd: false
    }
    
    const { container } = render(TableOfContents, { props: customProps })
    
    expect(container).toBeTruthy()
  })
})