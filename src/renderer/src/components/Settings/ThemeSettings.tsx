import { useThemeStore } from '../../stores/useThemeStore'
import { FolderOpen } from 'lucide-react'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent } from '../ui/card'
import { Separator } from '../ui/separator'
import type { JSX } from 'react'

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
      {/* 主题选择下拉框 */}
      <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border)]">
        <CardContent className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-fg)]">选择主题</label>
          <Select value={currentTheme?.id || ''} onValueChange={(value) => switchTheme(value)}>
            <SelectTrigger
              className="w-full"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--border-radius-md)'
              }}
            >
              <SelectValue placeholder="选择主题..." />
            </SelectTrigger>
            <SelectContent
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--border-radius-md)'
              }}
            >
              {availableThemes.map((theme) => (
                <SelectItem
                  key={theme.id}
                  value={theme.id}
                  style={{
                    color: 'var(--color-fg)',
                    borderRadius: 'var(--border-radius-sm)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-sm border"
                      style={{
                        backgroundColor: theme.previewColor || '#4a9eff',
                        borderColor: 'var(--color-border)'
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{theme.name}</span>
                      <span className="text-xs text-[var(--color-fg-muted)]">
                        {theme.source === 'builtin' ? '内置' : '用户'}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 当前主题信息 */}
      {currentTheme && (
        <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border)]">
          <CardContent className="space-y-2">
            <div className="text-sm font-semibold text-[var(--color-fg)]">当前主题</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-fg-secondary)]">名称：</span>
                <span className="text-[var(--color-fg)]">{currentTheme.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-fg-secondary)]">版本：</span>
                <span className="text-[var(--color-fg)]">
                  {currentTheme.config?.meta.version || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-fg-secondary)]">作者：</span>
                <span className="text-[var(--color-fg)]">
                  {currentTheme.config?.meta.author || '-'}
                </span>
              </div>
              {currentTheme.config?.meta.description && (
                <>
                  <Separator className="bg-[var(--color-divider)]" />
                  <div className="text-[var(--color-fg-secondary)]">
                    {currentTheme.config.meta.description}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <div className="space-y-3">
        <Separator className="bg-[var(--color-divider)]" />
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleOpenUserThemesFolder}
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          打开用户主题文件夹
        </Button>
        <p className="text-xs text-[var(--color-fg-secondary)]">
          💡 提示：将自定义主题 JSON 文件放入用户主题文件夹即可。参考 template.json
          创建你自己的主题。
        </p>
      </div>
    </div>
  )
}
