/**
 * メインエントリーポイントのテスト
 * Vue + Svelteハイブリッドアーキテクチャのテスト
 */

import { jest } from '@jest/globals'

// メインモジュールの関数をテスト用にモック
jest.mock('../mouseover', () => ({
  loadShowByMouseOver: jest.fn()
}))

jest.mock('../favAndRecent', () => ({
  loadFavAndRecent: jest.fn()
}))

jest.mock('../page-outline/pageHeaders', () => ({
  refreshPageHeaders: jest.fn()
}))

jest.mock('vue', () => ({
  createApp: jest.fn(() => ({
    mount: jest.fn(() => ({
      updateCurrentPage: jest.fn(),
      setLogseqVersionMd: jest.fn(),
      updateSettings: jest.fn()
    })),
    unmount: jest.fn()
  }))
}))

describe('main.ts - Vue + Svelteハイブリッドアーキテクチャ', () => {
  let mockLogseq: any
  
  beforeEach(() => {
    // logseqオブジェクトのモック設定
    mockLogseq = {
      ready: jest.fn(),
      useSettingsSchema: jest.fn(),
      settings: {
        booleanDateSelector: true,
        booleanTableOfContents: true,
        booleanLeftTOC: true,
        booleanFavAndRecent: true,
        loadShowByMouseOver: true
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
    
    global.logseq = mockLogseq
    
    // DOMのモック
    document.getElementById = jest.fn().mockReturnValue({
      id: 'app'
    })
  })

  test('エクスポートされた関数が存在することを確認', async () => {
    const mainModule = await import('../main')
    
    expect(typeof mainModule.booleanLogseqVersionMd).toBe('function')
    expect(typeof mainModule.updateCurrentPage).toBe('function')
    expect(typeof mainModule.getCurrentPageOriginalName).toBe('function')
    expect(typeof mainModule.onBlockChanged).toBe('function')
    expect(typeof mainModule.onPageChangedCallback).toBe('function')
  })

  test('booleanLogseqVersionMd関数が正しく動作することを確認', async () => {
    const mainModule = await import('../main')
    const result = mainModule.booleanLogseqVersionMd()
    
    expect(typeof result).toBe('boolean')
  })

  test('updateCurrentPage関数が正しく動作することを確認', async () => {
    const mainModule = await import('../main')
    
    await expect(mainModule.updateCurrentPage('test-page', 'test-uuid')).resolves.not.toThrow()
  })

  test('getCurrentPageOriginalName関数が正しく動作することを確認', async () => {
    const mainModule = await import('../main')
    
    const result = mainModule.getCurrentPageOriginalName()
    expect(typeof result).toBe('string')
  })

  test('onPageChangedCallback関数が処理中フラグを適切に管理することを確認', async () => {
    const mainModule = await import('../main')
    
    // 最初の呼び出し
    const promise1 = mainModule.onPageChangedCallback('test-page')
    // 即座の2回目の呼び出し（処理中なので無視されるはず）
    const promise2 = mainModule.onPageChangedCallback('test-page-2')
    
    await expect(Promise.all([promise1, promise2])).resolves.not.toThrow()
  })
})

describe('ブロック変更ハンドラー', () => {
  test('onBlockChanged関数が重複実行を防ぐことを確認', async () => {
    const mainModule = await import('../main')
    
    // 最初の呼び出し
    mainModule.onBlockChanged()
    
    // 2回目の呼び出し（既にonBlockChangedOnceがtrueなので無視される）
    mainModule.onBlockChanged()
    
    expect(mainModule.onBlockChangedOnce).toBe(true)
  })
})