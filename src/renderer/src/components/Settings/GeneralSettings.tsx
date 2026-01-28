import { useSettingsStore } from '../../stores/useSettingsStore'
import type { JSX } from 'react'
import { Switch } from '../ui/switch'

export const GeneralSettings = (): JSX.Element => {
  const { settings, updateSetting } = useSettingsStore()

  return (
    <div className="space-y-4">
      <div
        className="bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] p-6"
        style={{ borderRadius: 'var(--border-radius-md)' }}
      >
        <div
          className="flex items-center justify-between py-3 border-b"
          style={{ borderColor: 'var(--color-divider)' }}
        >
          <div className="flex-1">
            <div className="font-medium text-[var(--color-fg)]">自动保存</div>
            <div className="text-sm text-[var(--color-fg-secondary)] mt-1">编辑时自动保存文档</div>
          </div>
          <Switch
            checked={settings.system.autoSave}
            onCheckedChange={(checked) => updateSetting('system.autoSave', checked)}
          />
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex-1">
            <div className="font-medium text-[var(--color-fg)]">自动保存间隔</div>
            <div className="text-sm text-[var(--color-fg-secondary)] mt-1">
              {settings.system.autoSaveInterval} 毫秒
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
