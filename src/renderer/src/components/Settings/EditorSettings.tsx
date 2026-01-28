import { useSettingsStore } from '../../stores/useSettingsStore'
import type { JSX } from 'react'
import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'

export const EditorSettings = (): JSX.Element => {
  const { settings, updateSetting } = useSettingsStore()

  return (
    <div className="space-y-4">
      <div
        className="bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] p-6"
        style={{ borderRadius: 'var(--border-radius-md)' }}
      >
        {/* 字体大小 */}
        <div className="space-y-3 pb-4 border-b" style={{ borderColor: 'var(--color-divider)' }}>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--color-fg)]">字体大小</label>
            <span className="text-sm text-[var(--color-fg-secondary)]">
              {settings.editor.fontSize}px
            </span>
          </div>
          <Slider
            value={[settings.editor.fontSize]}
            onValueChange={([value]) => updateSetting('editor.fontSize', value)}
            min={12}
            max={24}
            step={1}
            className="flex-1"
          />
        </div>

        {/* 行高 */}
        <div className="space-y-3 py-4 border-b" style={{ borderColor: 'var(--color-divider)' }}>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--color-fg)]">行高</label>
            <span className="text-sm text-[var(--color-fg-secondary)]">
              {settings.editor.lineHeight}
            </span>
          </div>
          <Slider
            value={[settings.editor.lineHeight]}
            onValueChange={([value]) => updateSetting('editor.lineHeight', value)}
            min={1.0}
            max={2.5}
            step={0.1}
            className="flex-1"
          />
        </div>

        {/* 显示行号 */}
        <div
          className="flex items-center justify-between py-3 border-b"
          style={{ borderColor: 'var(--color-divider)' }}
        >
          <div className="flex-1">
            <div className="font-medium text-[var(--color-fg)]">显示行号</div>
            <div className="text-sm text-[var(--color-fg-secondary)] mt-1">
              在编辑器左侧显示行号
            </div>
          </div>
          <Switch
            checked={settings.editor.showLineNumbers}
            onCheckedChange={(checked) => updateSetting('editor.showLineNumbers', checked)}
          />
        </div>

        {/* 总是显示 Markdown 预览 */}
        <div className="flex items-center justify-between py-3">
          <div className="flex-1">
            <div className="font-medium text-[var(--color-fg)]">总是显示 Markdown 预览</div>
            <div className="text-sm text-[var(--color-fg-secondary)] mt-1">
              自动显示渲染后的 Markdown 内容
            </div>
          </div>
          <Switch
            checked={settings.editor.alwaysShowMarkdown}
            onCheckedChange={(checked) => updateSetting('editor.alwaysShowMarkdown', checked)}
          />
        </div>
      </div>
    </div>
  )
}
