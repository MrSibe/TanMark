// Tanmark 主题 Hook
import { useEffect } from 'react'
import { useThemeStore } from '../stores/useThemeStore'

/**
 * 主题管理 Hook
 * 自动加载主题，并提供主题切换功能
 */
export function useTheme() {
  const { currentTheme, availableThemes, isLoaded, loadThemes, loadCurrentTheme, switchTheme } =
    useThemeStore()

  // 应用启动时加载主题
  useEffect(() => {
    if (!isLoaded) {
      // 先加载所有可用主题列表
      loadThemes().then(() => {
        // 然后加载并应用当前主题
        loadCurrentTheme()
      })
    }
  }, [isLoaded, loadThemes, loadCurrentTheme])

  return {
    currentTheme,
    availableThemes,
    isLoaded,
    switchTheme
  }
}
