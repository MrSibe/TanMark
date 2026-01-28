import { useSettingsStore } from '../../stores/useSettingsStore'
import type { JSX } from 'react'
import { ThemeSettings } from './ThemeSettings'
import { SettingsHeader } from './SettingsHeader'
import { GeneralSettings } from './GeneralSettings'
import { EditorSettings } from './EditorSettings'

export function SettingsBody(): JSX.Element {
  const { activeTab } = useSettingsStore()

  return (
    <>
      {/* 顶栏 - 标题和描述 */}
      {activeTab === 'general' && (
        <SettingsHeader title="通用设置" description="配置应用程序的通用行为和外观。" />
      )}
      {activeTab === 'editor' && (
        <SettingsHeader title="编辑器设置" description="自定义编辑器的字体、显示和其他编辑选项。" />
      )}
      {activeTab === 'theme' && (
        <SettingsHeader
          title="主题设置"
          description="选择你喜欢的主题外观。你也可以在用户主题文件夹中创建自定义主题。"
        />
      )}
      {activeTab === 'keybindings' && (
        <SettingsHeader title="快捷键设置" description="查看和自定义键盘快捷键。" />
      )}
      {activeTab === 'about' && (
        <SettingsHeader title="关于 Tanmark" description="版本信息和应用程序详情。" />
      )}

      {/* 内容栏 */}
      <div className="px-8 pb-8">
        {activeTab === 'general' && <GeneralSettings />}

        {activeTab === 'editor' && <EditorSettings />}

        {activeTab === 'theme' && <ThemeSettings />}

        {activeTab === 'keybindings' && (
          <div className="bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] p-8">
            <p className="text-sm text-[var(--color-fg-secondary)] text-center py-4">
              快捷键设置功能开发中...
            </p>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-[var(--color-fg)]">版本</span>
                <span className="text-sm text-[var(--color-fg-secondary)]">1.0.0</span>
              </div>
              <div className="border-t border-[var(--color-divider)] my-4" />
              <div>
                <span className="text-sm font-medium text-[var(--color-fg)] block mb-2">描述</span>
                <p className="text-sm text-[var(--color-fg-secondary)] leading-relaxed">
                  Tanmark 是一个基于 Electron 的 Markdown 编辑器，支持实时预览和主题定制。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
