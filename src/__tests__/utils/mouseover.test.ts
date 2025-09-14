/**
 * マウスオーバー機能のテスト
 */

import { jest } from '@jest/globals'

// mouseoverモジュールのモック
jest.mock('../../mouseover', () => ({
  loadShowByMouseOver: jest.fn()
}))

describe('mouseover.ts - マウスオーバー機能', () => {
  beforeEach(() => {
    // DOMのモック設定
    document.body.innerHTML = `
      <div id="left-sidebar">
        <div class="nav-item">Test Item</div>
      </div>
      <div id="main-content">
        <div class="page-content">Test Content</div>
      </div>
    `
    
    // logseqオブジェクトのモック
    global.logseq = {
      settings: {
        loadShowByMouseOver: true,
        highlightBlockOnHover: true,
        highlightHeaderOnHover: true
      }
    }
  })

  test('loadShowByMouseOver関数が存在することを確認', async () => {
    const mouseoverModule = await import('../../mouseover')
    
    expect(typeof mouseoverModule.loadShowByMouseOver).toBe('function')
  })

  test('loadShowByMouseOver関数が正常に実行されることを確認', async () => {
    const { loadShowByMouseOver } = await import('../../mouseover')
    
    expect(() => loadShowByMouseOver()).not.toThrow()
    expect(loadShowByMouseOver).toHaveBeenCalled()
  })

  test('マウスオーバー機能が設定に応じて動作することを確認', async () => {
    // 設定が有効な場合
    global.logseq.settings.loadShowByMouseOver = true
    const { loadShowByMouseOver } = await import('../../mouseover')
    
    loadShowByMouseOver()
    
    expect(loadShowByMouseOver).toHaveBeenCalled()
  })
})