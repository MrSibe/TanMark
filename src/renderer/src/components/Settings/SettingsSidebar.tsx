import { useEffect } from 'react'
import type { JSX } from 'react'
import { Settings, FileText, Palette, Keyboard, Info } from 'lucide-react'
import { useSettingsStore, SettingsTab } from '../../stores/useSettingsStore'

export interface SettingsSidebarProps {
  defaultTab?: string
}

export function SettingsSidebar({ defaultTab }: SettingsSidebarProps): JSX.Element {
  const { activeTab, setActiveTab } = useSettingsStore()

  // 初始化时设置默认标签页
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab as SettingsTab)
    }
  }, [defaultTab, setActiveTab])

  const settingsTabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'general', label: '通用', icon: Settings },
    { id: 'editor', label: '编辑器', icon: FileText },
    { id: 'theme', label: '主题', icon: Palette },
    { id: 'keybindings', label: '快捷键', icon: Keyboard },
    { id: 'about', label: '关于', icon: Info }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* 复用 .sidebar-header 样式 */}
      <div className="sidebar-header">
        <div className="sidebar-title">设置</div>
      </div>

      {/* 导航菜单 - 复用文件树的样式结构 */}
      <nav className="file-tree">
        <ul>
          {settingsTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <li key={tab.id}>
                <div
                  onClick={() => setActiveTab(tab.id)}
                  className={`file-tree-item ${isActive ? 'active' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="file-tree-item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="file-tree-item-name">{tab.label}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
