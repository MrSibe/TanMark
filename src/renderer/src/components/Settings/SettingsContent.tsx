import { useSettingsStore } from '../../stores/useSettingsStore'
import type { JSX } from 'react'
import { ThemeSettings } from './ThemeSettings'
import { Separator } from '../ui/separator'

export function SettingsContent(): JSX.Element {
  const { activeTab } = useSettingsStore()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-8">
        {activeTab === 'general' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">通用设置</h2>
              <p className="text-muted-foreground mt-2">配置应用程序的通用行为和外观</p>
            </div>
            <Separator />
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 border">
                <p className="text-sm text-muted-foreground text-center py-4">
                  通用设置功能开发中...
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">编辑器设置</h2>
              <p className="text-muted-foreground mt-2">自定义编辑器的字体、显示和其他编辑选项</p>
            </div>
            <Separator />
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 border">
                <p className="text-sm text-muted-foreground text-center py-4">
                  编辑器设置功能开发中...
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'theme' && <ThemeSettings />}

        {activeTab === 'keybindings' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">快捷键设置</h2>
              <p className="text-muted-foreground mt-2">查看和自定义键盘快捷键</p>
            </div>
            <Separator />
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 border">
                <p className="text-sm text-muted-foreground text-center py-4">
                  快捷键设置功能开发中...
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">关于 Tanmark</h2>
              <p className="text-muted-foreground mt-2">版本信息和应用程序详情</p>
            </div>
            <Separator />
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 border">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">版本</span>
                    <span className="text-sm text-muted-foreground">1.0.0</span>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <span className="text-sm font-medium block mb-2">描述</span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Tanmark 是一个基于 Electron 的 Markdown 编辑器，支持实时预览和主题定制。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
