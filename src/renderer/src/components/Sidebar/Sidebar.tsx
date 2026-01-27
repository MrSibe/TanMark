import { FolderOpen, PanelLeftClose } from 'lucide-react'
import type { JSX } from 'react'
import { useFileStore } from '../../stores/useFileStore'
import { useSidebarStore } from '../../stores/useSidebarStore'
import { FileTree } from './FileTree'

export const AppSidebar = (): JSX.Element => {
  const { openFolder, workingDirectory } = useFileStore()
  const { close } = useSidebarStore()

  // 从路径中提取文件夹名称
  const vaultName = workingDirectory
    ? workingDirectory.split('/').pop() || workingDirectory.split('\\').pop() || '仓库'
    : '仓库'

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-actions">
          <button className="sidebar-button" onClick={openFolder} title="打开仓库">
            <FolderOpen size={12} />
          </button>
        </div>
        <div className="sidebar-title">{vaultName}</div>
        <div className="sidebar-actions">
          <button className="sidebar-button" onClick={close} title="隐藏侧边栏">
            <PanelLeftClose size={12} />
          </button>
        </div>
      </div>
      <FileTree />
    </div>
  )
}
