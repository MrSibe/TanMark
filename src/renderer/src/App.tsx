import { MainLayout } from './components/Layout/MainLayout'
import { useTheme } from './hooks/useTheme'
import { useSettingsStore } from './stores/useSettingsStore'
import { useEffect } from 'react'

function App(): React.JSX.Element {
  // 自动加载主题
  useTheme()

  // 加载设置
  const { loadSettings } = useSettingsStore()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return <MainLayout />
}

export default App
