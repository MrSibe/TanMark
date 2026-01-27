import { useState } from 'react'
import type { JSX } from 'react'
import { Modal } from '../Modal/Modal'
import { Palette } from 'lucide-react'
import { ThemeSettings } from './ThemeSettings'
import './settings-window.css'

interface SettingsWindowProps {
  isOpen: boolean
  onClose: () => void
}

type SettingsCategory = 'theme' // 未来可以添加更多分类

const CATEGORIES = [
  {
    id: 'theme' as SettingsCategory,
    name: '主题',
    icon: Palette
  }
  // 未来可以添加更多分类：
  // { id: 'editor', name: '编辑器', icon: FileText },
  // { id: 'general', name: '通用', icon: Settings },
]

interface SettingsWindowContentProps {
  activeCategory: SettingsCategory
  onCategoryChange: (category: SettingsCategory) => void
  children: React.ReactNode
}

const SettingsWindowContent = ({
  activeCategory,
  onCategoryChange,
  children
}: SettingsWindowContentProps): JSX.Element => {
  return (
    <div className="settings-window">
      {/* 左侧侧边栏 */}
      <div className="settings-sidebar">
        <div className="settings-sidebar-title">设置</div>
        <nav className="settings-nav">
          {CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                className={`settings-nav-item ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => onCategoryChange(category.id)}
              >
                <Icon size={18} />
                <span>{category.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* 右侧内容区域 */}
      <div className="settings-content">{children}</div>
    </div>
  )
}

export const SettingsWindow = ({ isOpen, onClose }: SettingsWindowProps): JSX.Element => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('theme')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="设置" width="900px" height="600px">
      <SettingsWindowContent activeCategory={activeCategory} onCategoryChange={setActiveCategory}>
        {/* 根据 activeCategory 渲染不同的设置页面 */}
        {activeCategory === 'theme' && <ThemeSettings />}
      </SettingsWindowContent>
    </Modal>
  )
}
