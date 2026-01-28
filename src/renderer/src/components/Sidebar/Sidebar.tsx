import { FolderOpen, PanelLeftClose, FileText, List } from 'lucide-react'
import { useState } from 'react'
import type { JSX } from 'react'
import { useFileStore } from '../../stores/useFileStore'
import { useSidebarStore } from '../../stores/useSidebarStore'
import { FileTree } from './FileTree'
import { Outline } from './Outline'

export const AppSidebar = (): JSX.Element => {
  const { openFolder, workingDirectory } = useFileStore()
  const { close } = useSidebarStore()
  const [activeView, setActiveView] = useState<'files' | 'outline'>('files')

  // 从路径中提取文件夹名称
  const vaultName = workingDirectory
    ? workingDirectory.split('/').pop() || workingDirectory.split('\\').pop() || '仓库'
    : '仓库'

  const isFilesView = activeView === 'files'
  const headerTitle = isFilesView ? '文件' : '大纲'

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-actions">
          <button
            className="sidebar-button"
            onClick={() => setActiveView(isFilesView ? 'outline' : 'files')}
            title={isFilesView ? '切换到大纲' : '切换到文件树'}
          >
            {isFilesView ? <List size={12} /> : <FileText size={12} />}
          </button>
        </div>
        <div className="sidebar-title">{headerTitle}</div>
        <div className="sidebar-actions">
          <button className="sidebar-button" onClick={close} title="隐藏侧边栏">
            <PanelLeftClose size={12} />
          </button>
        </div>
      </div>
      <div className="sidebar-body">{isFilesView ? <FileTree /> : <Outline />}</div>
      <button className="sidebar-bottom" onClick={openFolder} title="选择文件夹">
        <FolderOpen size={14} />
        <span className="sidebar-bottom-title">{vaultName}</span>
      </button>
    </div>
  )
}
