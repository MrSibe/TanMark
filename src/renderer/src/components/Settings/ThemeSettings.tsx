import { useThemeStore } from '../../stores/useThemeStore'
import { Check, FolderOpen } from 'lucide-react'
import { Button } from '../ui/button'
import type { JSX } from 'react'
import { cn } from '../../lib/utils'

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
    <div className="space-y-6">
      {/* 主题列表 */}
      <div>
        <div className="grid grid-cols-1 gap-3">
          {availableThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => switchTheme(theme.id)}
              className={cn(
                'group relative flex items-center justify-between rounded-lg border p-4 text-left transition-all',
                currentTheme?.id === theme.id
                  ? 'border-[var(--color-accent)] bg-[var(--color-bg-secondary)]'
                  : 'border-[var(--color-border)] hover:bg-[var(--color-hover)]'
              )}
              style={{
                borderRadius: 'var(--border-radius-md)'
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-md border"
                  style={{
                    backgroundColor: theme.previewColor || '#4a9eff',
                    borderColor:
                      currentTheme?.id === theme.id ? 'currentColor' : 'var(--color-border)',
                    borderRadius: 'var(--border-radius-sm)'
                  }}
                />
                <div>
                  <div className="font-medium text-[var(--color-fg)]">{theme.name}</div>
                  <div className="text-sm text-[var(--color-fg-secondary)]">
                    {theme.source === 'builtin' ? '内置主题' : '用户主题'}
                  </div>
                </div>
              </div>
              {currentTheme?.id === theme.id && (
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-fg-on-dark)',
                    borderRadius: 'var(--border-radius-md)'
                  }}
                >
                  <Check className="h-4 w-4" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--color-divider)' }}>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleOpenUserThemesFolder}
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          打开用户主题文件夹
        </Button>
        <p className="text-xs text-[var(--color-fg-secondary)]">
          提示：你可以将自定义主题文件（.json）放入用户主题文件夹中。参考 template.json
          创建你自己的主题。
        </p>
      </div>
    </div>
  )
}
