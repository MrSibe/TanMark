import { useSettingsStore } from '../../stores/useSettingsStore'
import type { JSX } from 'react'
import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'
import { Card, CardContent } from '../ui/card'
import { Separator } from '../ui/separator'

export const GeneralSettings = (): JSX.Element => {
  const { settings, updateSetting } = useSettingsStore()

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border)]">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-[var(--color-fg)]">自动保存</div>
              <div className="text-sm text-[var(--color-fg-secondary)] mt-1">
                编辑时自动保存文档
              </div>
            </div>
            <Switch
              checked={settings.system.autoSave}
              onCheckedChange={(checked) => updateSetting('system.autoSave', checked)}
            />
          </div>

          <Separator className="bg-[var(--color-divider)]" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-[var(--color-fg)]">自动保存间隔</div>
              <div className="text-sm text-[var(--color-fg-secondary)]">
                {settings.system.autoSaveInterval} ms
              </div>
            </div>
            <Slider
              value={[settings.system.autoSaveInterval]}
              onValueChange={([value]) => updateSetting('system.autoSaveInterval', value)}
              min={1000}
              max={15000}
              step={500}
            />
          </div>

          <Separator className="bg-[var(--color-divider)]" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-[var(--color-fg)]">侧栏折叠阈值</div>
              <div className="text-sm text-[var(--color-fg-secondary)]">
                {settings.system.sidebarCollapseThreshold}px
              </div>
            </div>
            <Slider
              value={[settings.system.sidebarCollapseThreshold]}
              onValueChange={([value]) => updateSetting('system.sidebarCollapseThreshold', value)}
              min={8}
              max={64}
              step={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
