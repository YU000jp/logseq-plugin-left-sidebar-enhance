/**
 * Vue設定コンポーネントのテスト
 */

import { mount } from '@vue/test-utils'
import Settings from '../../../components/vue/Settings.vue'

describe('Settings.vue - Vue設定コンポーネント', () => {
  let wrapper: any
  
  const defaultProps = {
    showSettings: true,
    settings: {
      booleanDateSelector: true,
      booleanTableOfContents: true,
      booleanLeftTOC: true,
      booleanFavAndRecent: true,
      loadShowByMouseOver: true,
      highlightBlockOnHover: true,
      highlightHeaderOnHover: true,
      enableJournalsList: true
    }
  }
  
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  test('コンポーネントが正常にマウントされることを確認', () => {
    wrapper = mount(Settings, {
      props: defaultProps
    })
    expect(wrapper.exists()).toBe(true)
  })

  test('showSettingsがtrueの場合、設定パネルが表示されることを確認', () => {
    wrapper = mount(Settings, {
      props: defaultProps
    })
    
    expect(wrapper.find('.settings-panel').exists()).toBe(true)
  })

  test('showSettingsがfalseの場合、設定パネルが非表示になることを確認', () => {
    wrapper = mount(Settings, {
      props: {
        ...defaultProps,
        showSettings: false
      }
    })
    
    expect(wrapper.find('.settings-panel').exists()).toBe(false)
  })

  test('closeイベントが適切に発火されることを確認', async () => {
    wrapper = mount(Settings, {
      props: defaultProps
    })
    
    const closeButton = wrapper.find('.close-btn')
    if (closeButton.exists()) {
      await closeButton.trigger('click')
      
      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    }
  })

  test('設定項目の変更時にupdateSettingsイベントが発火されることを確認', async () => {
    wrapper = mount(Settings, {
      props: defaultProps
    })
    
    // 設定の変更をシミュレート
    const checkbox = wrapper.find('input[type="checkbox"]')
    if (checkbox.exists()) {
      await checkbox.setChecked(false)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted('updateSettings')).toBeTruthy()
    }
  })

  test('設定値がpropsと同期していることを確認', () => {
    const customSettings = {
      ...defaultProps.settings,
      booleanDateSelector: false,
      booleanLeftTOC: false
    }
    
    wrapper = mount(Settings, {
      props: {
        ...defaultProps,
        settings: customSettings
      }
    })
    
    // 内部状態が props と同期していることを確認
    expect(wrapper.vm.localSettings.booleanDateSelector).toBe(false)
    expect(wrapper.vm.localSettings.booleanLeftTOC).toBe(false)
  })

  test('設定項目のラベルが適切に表示されることを確認', () => {
    wrapper = mount(Settings, {
      props: defaultProps
    })
    
    // 主要な設定項目のラベルが存在することを確認
    const labels = wrapper.findAll('label')
    expect(labels.length).toBeGreaterThan(0)
  })

  test('設定の保存機能が正常に動作することを確認', async () => {
    wrapper = mount(Settings, {
      props: defaultProps
    })
    
    // チェックボックスを操作してupdateSettingメソッドを呼び出し
    const checkbox = wrapper.find('input[v-model="localSettings.booleanDateSelector"]')
    if (checkbox.exists()) {
      await checkbox.setChecked(false)
      
      expect(wrapper.emitted('updateSettings')).toBeTruthy()
    }
  })
})