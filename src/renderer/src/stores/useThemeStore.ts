// Tanmark 主题状态管理
import { create } from 'zustand'

interface ThemeInfo {
  id: string
  name: string
  path: string
  content: string
  isDefault: boolean
  source: 'builtin' | 'user'
}

interface ThemeState {
  // 当前激活的主题
  currentTheme: ThemeInfo | null
  // 所有可用主题列表
  availableThemes: ThemeInfo[]
  // 主题是否已加载
  isLoaded: boolean

  // Actions
  setCurrentTheme: (theme: ThemeInfo) => void
  setAvailableThemes: (themes: ThemeInfo[]) => void
  loadThemes: () => Promise<void>
  loadCurrentTheme: () => Promise<void>
  switchTheme: (themeId: string) => Promise<void>
  applyTheme: (cssContent: string) => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: null,
  availableThemes: [],
  isLoaded: false,

  setCurrentTheme: (theme) => set({ currentTheme: theme }),

  setAvailableThemes: (themes) => set({ availableThemes: themes }),

  // 加载所有可用主题
  loadThemes: async () => {
    try {
      console.log('[Theme] Loading themes...')
      const themes = await window.api.theme.getAll()
      console.log('[Theme] Loaded themes:', themes)

      set({ availableThemes: themes, isLoaded: true })
    } catch (error) {
      console.error('[Theme] Error loading themes:', error)
    }
  },

  // 从设置中读取当前主题 ID 并应用
  loadCurrentTheme: async () => {
    try {
      // 从设置中获取当前主题 ID
      const settings = await window.api.settings.getAll()
      const currentThemeId = settings.theme?.current

      if (currentThemeId) {
        // 应用设置中保存的主题
        const { availableThemes } = get()
        const theme = availableThemes.find((t) => t.id === currentThemeId)

        if (theme) {
          get().applyTheme(theme.content)
          set({ currentTheme: theme })
          console.log('[Theme] Loaded theme from settings:', currentThemeId)
          return
        }
      }

      // 如果没有设置或找不到主题，加载默认主题
      const defaultTheme = await window.api.theme.getDefault()
      if (defaultTheme) {
        get().applyTheme(defaultTheme.content)
        set({ currentTheme: defaultTheme })
        // 保存到设置
        await window.api.settings.set('theme.current', defaultTheme.id)
        console.log('[Theme] Loaded default theme:', defaultTheme.id)
      }
    } catch (error) {
      console.error('[Theme] Error loading current theme:', error)
    }
  },

  // 切换主题（即时生效）
  switchTheme: async (themeId: string) => {
    try {
      const { availableThemes } = get()
      const theme = availableThemes.find((t) => t.id === themeId)

      if (!theme) {
        console.error('[Theme] Theme not found:', themeId)
        return
      }

      // 立即应用主题到 UI
      get().applyTheme(theme.content)
      set({ currentTheme: theme })

      // 持久化到配置文件
      await window.api.settings.set('theme.current', themeId)

      console.log('[Theme] Switched to theme:', themeId)
    } catch (error) {
      console.error('[Theme] Error switching theme:', error)
    }
  },

  // 应用主题 CSS（动态注入）
  applyTheme: (cssContent: string) => {
    // 移除旧的主题样式
    const oldThemeStyle = document.getElementById('tanmark-theme')
    if (oldThemeStyle) {
      oldThemeStyle.remove()
    }

    // 创建新的 <style> 标签注入主题
    const styleElement = document.createElement('style')
    styleElement.id = 'tanmark-theme'
    styleElement.textContent = cssContent
    document.head.appendChild(styleElement)
  }
}))
