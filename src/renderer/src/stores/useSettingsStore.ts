// Tanmark 设置状态管理
import { create } from 'zustand'
import { AppSettings, defaultSettings } from '../../../shared/types/settings'

interface SettingsState {
  settings: AppSettings
  isLoaded: boolean

  // Actions
  loadSettings: () => Promise<void>
  updateSetting: (path: string, value: any) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings, // 初始值，防止闪烁
  isLoaded: false,

  // 从 Electron 读取硬盘上的配置
  loadSettings: async () => {
    try {
      const saved = await window.api.settings.getAll()
      set({ settings: saved, isLoaded: true })
      console.log('[Settings] Loaded settings:', saved)
    } catch (error) {
      console.error('[Settings] Error loading settings:', error)
    }
  },

  // 更新设置
  updateSetting: async (path, value) => {
    // 1. 乐观更新（UI 立刻变）
    const keys = path.split('.')
    set((state) => {
      const newSettings = { ...state.settings }
      let current: any = newSettings

      // 导航到需要更新的嵌套属性
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }

      // 设置新值
      current[keys[keys.length - 1]] = value

      return { settings: newSettings }
    })

    // 2. 通知 Electron 写入硬盘
    try {
      await window.api.settings.set(path, value)
      console.log('[Settings] Updated setting:', path, '=', value)
    } catch (error) {
      console.error('[Settings] Error updating setting:', error)

      // 如果保存失败，回滚到原值
      await get().loadSettings()
    }
  }
}))

// 监听来自主进程的更新（比如用户手动改了 JSON 文件，或者其他窗口改了设置）
if (typeof window !== 'undefined' && window.api) {
  window.api.settings.onUpdate((newSettings) => {
    useSettingsStore.setState({ settings: newSettings })
    console.log('[Settings] Settings updated from main process')
  })
}
