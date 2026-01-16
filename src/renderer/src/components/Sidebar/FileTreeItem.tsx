import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react'
import { useState } from 'react'
import { useFileStore } from '../../stores/useFileStore'

interface DirectoryItem {
  name: string
  path: string
  isDirectory: boolean
  children?: DirectoryItem[]
}

interface FileTreeItemProps {
  item: DirectoryItem
  level?: number
  onContextMenu?: (e: React.MouseEvent, targetPath: string, isDirectory: boolean) => void
}

export const FileTreeItem = ({ item, level = 0, onContextMenu }: FileTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { currentFile, openFileFromTree } = useFileStore()

  const handleClick = () => {
    if (item.isDirectory) {
      setIsExpanded(!isExpanded)
    } else {
      openFileFromTree(item.path)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onContextMenu) {
      onContextMenu(e, item.path, item.isDirectory)
    }
  }

  const isActive = currentFile?.path === item.path

  // 移除 .md 后缀显示
  const displayName = item.isDirectory ? item.name : item.name.replace(/\.md$/i, '')

  return (
    <div>
      <div
        className={`file-tree-item ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${level * 1 + 1}rem` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {item.isDirectory ? (
          <>
            <div className="file-tree-item-icon">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            <div className="file-tree-item-icon">
              <Folder size={16} />
            </div>
          </>
        ) : (
          <div className="file-tree-item-icon" style={{ marginLeft: '1rem' }}>
            <File size={16} />
          </div>
        )}
        <div className="file-tree-item-name">{displayName}</div>
      </div>

      {item.isDirectory && isExpanded && item.children && (
        <div className="file-tree-children">
          {item.children.map((child) => (
            <FileTreeItem
              key={child.path}
              item={child}
              level={level + 1}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  )
}
