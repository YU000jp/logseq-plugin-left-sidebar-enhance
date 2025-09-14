// Jest setup file for testing environment
require('@testing-library/jest-dom')

// Mock @logseq/libs
jest.mock('@logseq/libs', () => ({
  default: {
    ready: jest.fn(),
    useSettingsSchema: jest.fn(),
    settings: {},
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
}))

// Mock logseq global object
global.logseq = {
  ready: jest.fn((fn) => {
    const result = fn && fn()
    return Promise.resolve(result)
  }),
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

// Mock window object
Object.defineProperty(window, 'logseq', {
  value: global.logseq,
  writable: true
})

// Mock DOM methods
document.getElementById = jest.fn()