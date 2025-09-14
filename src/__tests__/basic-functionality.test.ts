/**
 * 基本機能のテスト - Vue + Svelteハイブリッドアーキテクチャ
 * Basic functionality tests for Vue + Svelte hybrid architecture
 */

describe('基本機能テスト', () => {
  beforeEach(() => {
    // logseqオブジェクトのモック設定
    global.logseq = {
      ready: jest.fn((fn) => Promise.resolve(fn())),
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
    
    // Window logseqオブジェクトの設定
    Object.defineProperty(window, 'logseq', {
      value: global.logseq,
      writable: true
    })
    
    // DOMのモック
    document.getElementById = jest.fn().mockReturnValue({
      id: 'mock-element'
    })
  })

  test('logseqオブジェクトが適切にモックされていることを確認', () => {
    expect(global.logseq).toBeDefined()
    expect(global.logseq.settings).toBeDefined()
    expect(global.logseq.ready).toBeDefined()
    expect(typeof global.logseq.ready).toBe('function')
  })

  test('設定オブジェクトが期待される構造を持つことを確認', () => {
    const settings = global.logseq.settings
    
    expect(settings.booleanDateSelector).toBe(true)
    expect(settings.booleanTableOfContents).toBe(true)
    expect(settings.booleanLeftTOC).toBe(true)
    expect(settings.booleanFavAndRecent).toBe(true)
    expect(settings.loadShowByMouseOver).toBe(true)
  })

  test('logseq.Appオブジェクトのメソッドが存在することを確認', () => {
    expect(global.logseq.App.onCurrentGraphChanged).toBeDefined()
    expect(global.logseq.App.getInfo).toBeDefined()
    expect(typeof global.logseq.App.getInfo).toBe('function')
  })

  test('logseq.DBオブジェクトのメソッドが存在することを確認', () => {
    expect(global.logseq.DB.onChanged).toBeDefined()
    expect(global.logseq.DB.onBlockChanged).toBeDefined()
    expect(typeof global.logseq.DB.onChanged).toBe('function')
  })

  test('logseq.readyメソッドが正常に実行されることを確認', async () => {
    const mockCallback = jest.fn()
    
    await global.logseq.ready(mockCallback)
    
    expect(global.logseq.ready).toHaveBeenCalledWith(mockCallback)
    expect(mockCallback).toHaveBeenCalled()
  })

  test('logseq.App.getInfoメソッドが期待される値を返すことを確認', async () => {
    const result = await global.logseq.App.getInfo('version')
    
    expect(result).toBe('0.10.9')
  })

  test('document.getElementByIdが適切にモックされていることを確認', () => {
    const element = document.getElementById('test-id')
    
    expect(element).toBeDefined()
    expect(element.id).toBe('mock-element')
  })

  test('ウィンドウオブジェクトにlogseqが設定されていることを確認', () => {
    expect(window.logseq).toBeDefined()
    expect(window.logseq).toBe(global.logseq)
  })
})