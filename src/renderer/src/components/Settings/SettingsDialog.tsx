import type { JSX } from 'react'
import { Dialog, DialogContent } from '../ui/dialog'
import { SettingsSidebar } from './SettingsSidebar'
import { SettingsBody } from './SettingsBody'

export interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: string
}

export function SettingsDialog({
  open,
  onOpenChange,
  defaultTab = 'theme'
}: SettingsDialogProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[1000px] h-[700px] p-0 gap-0 overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-fg)'
        }}
      >
        <div className="flex h-full overflow-hidden">
          {/* 侧边栏 - 复用 sidebar 样式但限制宽度 */}
          <div className="sidebar" style={{ width: '200px', maxWidth: '200px' }}>
            <SettingsSidebar defaultTab={defaultTab} />
          </div>

          {/* 内容区域 - 复用 editor-column 样式 */}
          <div className="editor-column">
            <SettingsBody />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
