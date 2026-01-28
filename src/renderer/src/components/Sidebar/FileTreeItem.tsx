import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { JSX } from 'react'
import { useFileStore } from '../../stores/useFileStore'
import { truncateFileName } from '../../utils/filename'

interface DirectoryItem {
  name: string
  path: string
  isDirectory: boolean
  children?: DirectoryItem[]
}

interface FileTreeItemProps {
  item: DirectoryItem
  level?: number
}

export const FileTreeItem = ({ item, level = 0 }: FileTreeItemProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const { currentFile, openFileFromTree } = useFileStore()
  const nameRef = useRef<HTMLDivElement>(null)

  const handleClick = (): void => {
    if (item.isDirectory) {
      setIsExpanded(!isExpanded)
    } else {
      openFileFromTree(item.path)
    }
  }

  const isActive = currentFile?.path === item.path

  // 移除 .md 后缀显示
  const rawName = item.isDirectory ? item.name : item.name.replace(/\.md$/i, '')

  // 根据容器宽度动态计算文件名截断
  useEffect((): (() => void) => {
    const updateDisplayName = (): void => {
      if (!nameRef.current) {
        setDisplayName(rawName)
        return
      }

      const containerWidth = nameRef.current.offsetWidth
      // 估算：每个字符大约14px宽度（根据font-size: 0.875rem）
      const charWidth = 14
      const maxChars = Math.floor(containerWidth / charWidth)

      if (maxChars < 8) {
        // 容器太小，至少显示8个字符
        setDisplayName(truncateFileName(rawName, 8))
      } else {
        setDisplayName(truncateFileName(rawName, maxChars))
      }
    }

    updateDisplayName()

    // 监听窗口大小变化
    const resizeObserver = new ResizeObserver(updateDisplayName)
    if (nameRef.current) {
      resizeObserver.observe(nameRef.current)
    }

    return (): void => {
      resizeObserver.disconnect()
    }
  }, [rawName])

  return (
    <>
      <div
        className={`file-tree-item ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${level * 0.5 + 0.5}rem` }}
        onClick={handleClick}
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
        <div className="file-tree-item-name" ref={nameRef} title={rawName}>
          {displayName}
        </div>
      </div>

      {item.isDirectory && isExpanded && item.children && (
        <div className="file-tree-children">
          {item.children.map((child) => (
            <FileTreeItem key={child.path} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </>
  )
}
