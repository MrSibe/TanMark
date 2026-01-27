import { useThemeStore } from '../../stores/useThemeStore'
import { Check, FolderOpen } from 'lucide-react'
import type { JSX } from 'react'
import './theme-settings.css'

export const ThemeSettings = (): JSX.Element => {
  const { currentTheme, availableThemes, switchTheme } = useThemeStore()

  const handleOpenUserThemesFolder = async (): Promise<void> => {
    try {
      await window.api.theme.openUserThemesFolder()
    } catch (error) {
      console.error('打开用户主题文件夹失败:', error)
    }
  }

  return (
    <div className="theme-settings">
      <div className="settings-section">
        <h3 className="settings-section-title">主题设置</h3>
        <p className="settings-section-description">
          选择你喜欢的主题外观。你也可以在用户主题文件夹中创建自定义主题。
        </p>

        <div className="settings-group">
          <div className="theme-list">
            {availableThemes.map((theme) => (
              <button
                key={theme.id}
                className={`theme-card ${currentTheme?.id === theme.id ? 'active' : ''}`}
                onClick={() => switchTheme(theme.id)}
              >
                <div className="theme-card-header">
                  <div className="theme-card-info">
                    <div className="theme-card-name">{theme.name}</div>
                    <div className="theme-card-source">
                      {theme.source === 'builtin' ? '内置主题' : '用户主题'}
                    </div>
                  </div>
                  {currentTheme?.id === theme.id && (
                    <div className="theme-card-check">
                      <Check size={18} />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-group">
          <button className="open-folder-button" onClick={handleOpenUserThemesFolder}>
            <FolderOpen size={18} />
            <span>打开用户主题文件夹</span>
          </button>
          <p className="settings-hint">
            你可以将自定义主题文件（.css）放入用户主题文件夹中。参考 template.css
            模板创建你自己的主题。
          </p>
        </div>
      </div>
    </div>
  )
}
