import { useEffect, useRef } from 'react'
import { FileText, FolderPlus, Trash2, Edit3 } from 'lucide-react'

interface ContextMenuProps {
  x: number
  y: number
  isDirectory: boolean
  showDelete: boolean
  onClose: () => void
  onNewFile: () => void
  onNewFolder: () => void
  onRename: () => void
  onDelete?: () => void
}

export const ContextMenu = ({
  x,
  y,
  isDirectory,
  showDelete,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete
}: ContextMenuProps): JSX.Element => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect((): (() => void) => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`
      }}
    >
      {isDirectory && (
        <>
          <div
            className="context-menu-item"
            onClick={(e: React.MouseEvent): void => {
              e.stopPropagation()
              onNewFile()
              onClose()
            }}
          >
            <FileText size={14} />
            <span>新建文件</span>
          </div>
          <div
            className="context-menu-item"
            onClick={(e: React.MouseEvent): void => {
              e.stopPropagation()
              onNewFolder()
              onClose()
            }}
          >
            <FolderPlus size={14} />
            <span>新建文件夹</span>
          </div>
        </>
      )}
      <div
        className="context-menu-item"
        onClick={(e: React.MouseEvent): void => {
          e.stopPropagation()
          onRename()
          onClose()
        }}
      >
        <Edit3 size={14} />
        <span>重命名</span>
      </div>
      {showDelete && onDelete && (
        <div
          className="context-menu-item"
          onClick={(e: React.MouseEvent): void => {
            e.stopPropagation()
            onDelete()
            onClose()
          }}
        >
          <Trash2 size={14} />
          <span>删除</span>
        </div>
      )}
    </div>
  )
}
