// Tanmark 主题状态管理 - 支持 JSON 和 CSS 双格式
import { create } from 'zustand'
import { ThemeInfo, ThemeConfig } from '@shared/types/theme'
import { ThemeCompiler } from '@shared/theme-compiler'

interface ThemeState {
  // 当前激活的主题
  currentTheme: ThemeInfo | null
  // 所有可用主题列表
  availableThemes: ThemeInfo[]
  // 主题是否已加载
  isLoaded: boolean

  // 当前 JSON 主题配置（仅 JSON 主题有值）
  currentJSONConfig: ThemeConfig | null

  // Actions
  setCurrentTheme: (theme: ThemeInfo) => void
  setAvailableThemes: (themes: ThemeInfo[]) => void
  loadThemes: () => Promise<void>
  loadCurrentTheme: () => Promise<void>
  switchTheme: (themeId: string) => Promise<void>
  applyTheme: (cssContent: string) => void

  // JSON 主题相关方法
  getThemeConfig: (themeId: string) => Promise<ThemeConfig | null>
  saveTheme: (themeId: string, config: ThemeConfig) => Promise<{ success: boolean; error?: string }>
  updateThemeConfig: (config: ThemeConfig) => void // 实时预览更新
  validateTheme: (config: ThemeConfig) => Promise<{ valid: boolean; error?: string }>

  // 内部方法（不暴露给外部）
  validateThemeSync: (config: ThemeConfig) => { valid: boolean; error?: string }
  compileThemeToCSS: (config: ThemeConfig) => string
}

export type { ThemeState }

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: null,
  availableThemes: [],
  isLoaded: false,
  currentJSONConfig: null,

  setCurrentTheme: (theme) => set({ currentTheme: theme }),

  setAvailableThemes: (themes) => set({ availableThemes: themes }),

  // 加载所有可用主题
  loadThemes: async () => {
    try {
      const themes = await window.api.theme.getAll()
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
      const currentThemeId = settings.theme?.current as string | undefined

      if (currentThemeId) {
        // 应用设置中保存的主题
        const { availableThemes } = get()
        const theme = availableThemes.find((t) => t.id === currentThemeId)

        if (theme && theme.content) {
          get().applyTheme(theme.content)
          set({ currentTheme: theme })

          // 如果是 JSON 主题，加载配置
          if (theme.format === 'json') {
            const config = await get().getThemeConfig(theme.id)
            if (config) {
              set({ currentJSONConfig: config })
            }
          }
          return
        }
      }

      // 如果没有设置或找不到主题，加载默认主题
      const defaultTheme = await window.api.theme.getDefault()
      if (defaultTheme && defaultTheme.content) {
        get().applyTheme(defaultTheme.content)
        set({ currentTheme: defaultTheme })

        // 如果是 JSON 主题，加载配置
        if (defaultTheme.format === 'json') {
          const config = await get().getThemeConfig(defaultTheme.id)
          if (config) {
            set({ currentJSONConfig: config })
          }
        }

        // 保存到设置
        await (window.api.settings.set as any)('theme.current', defaultTheme.id)
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

      if (!theme || !theme.content) {
        console.error('[Theme] Theme not found:', themeId)
        return
      }

      // 立即应用主题到 UI
      get().applyTheme(theme.content)
      set({ currentTheme: theme })

      // 如果是 JSON 主题，加载配置
      if (theme.format === 'json') {
        const config = await get().getThemeConfig(theme.id)
        if (config) {
          set({ currentJSONConfig: config })
        }
      } else {
        set({ currentJSONConfig: null })
      }

      // 持久化到配置文件
      await (window.api.settings.set as any)('theme.current', themeId)
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

    // 更新窗口背景色（防止快速拖动时闪烁白色）
    window.api.theme.applyTheme(cssContent)
  },

  // 获取主题的 JSON 配置
  getThemeConfig: async (themeId: string) => {
    try {
      const config = await window.api.theme.getConfig(themeId)
      return config
    } catch (error) {
      console.error('[Theme] Error getting theme config:', error)
      return null
    }
  },

  // 保存 JSON 主题
  saveTheme: async (themeId: string, config: ThemeConfig) => {
    try {
      const result = await window.api.theme.saveJSON(themeId, config)

      if (result.success) {
        // 重新加载主题列表
        await get().loadThemes()
      }

      return result
    } catch (error) {
      console.error('[Theme] Error saving theme:', error)
      return { success: false, error: (error as Error).message }
    }
  },

  // 更新主题配置（实时预览）
  updateThemeConfig: (config: ThemeConfig) => {
    try {
      // 验证配置
      const validation = get().validateThemeSync(config)

      if (!validation.valid) {
        console.error('[Theme] Invalid theme config:', validation.error)
        return
      }

      // 编译为 CSS
      const css = get().compileThemeToCSS(config)

      // 应用 CSS
      get().applyTheme(css)

      // 更新当前配置
      set({ currentJSONConfig: config })
    } catch (error) {
      console.error('[Theme] Error updating theme config:', error)
    }
  },

  // 验证主题配置（同步版本，用于实时预览）
  validateThemeSync: (config: ThemeConfig) => {
    // 基本验证
    if (!config.meta) {
      return { valid: false, error: 'Missing meta section' }
    }

    if (!config.meta.id || !config.meta.name) {
      return { valid: false, error: 'Invalid meta: missing id or name' }
    }

    if (!config.colors || !config.typography || !config.ui) {
      return { valid: false, error: 'Missing required sections' }
    }

    return { valid: true }
  },

  // 编译主题为 CSS
  compileThemeToCSS: (config: ThemeConfig) => {
    const compiler = new ThemeCompiler()
    return compiler.compileToCSS(config)
  },

  // 验证主题配置
  validateTheme: async (config: ThemeConfig) => {
    try {
      const result = await window.api.theme.validate(config)
      return result
    } catch (error) {
      return { valid: false, error: (error as Error).message }
    }
  }
}))
