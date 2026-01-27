import { PanelLeft } from 'lucide-react'
import type { JSX } from 'react'
import { Titlebar } from '../Titlebar/Titlebar'
import { Sidebar } from '../Sidebar/Sidebar'
import { TanmarkEditor } from '../Editor/TanmarkEditor'
import { SettingsWindow } from '../Settings/SettingsWindow'
import { ImagePreview } from '../preview/ImagePreview'
import { useSidebarStore } from '../../stores/useSidebarStore'
import { useFileStore } from '../../stores/useFileStore'
import { useState, useRef, useEffect, useCallback } from 'react'

export const MainLayout = (): JSX.Element => {
  const { isOpen, open, width, setWidth } = useSidebarStore()
  const { currentFile } = useFileStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const handleMouseDown = (e: React.MouseEvent): void => {
    setIsDragging(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
    e.preventDefault()
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent): void => {
      const delta = e.clientX - startXRef.current
      const newWidth = Math.max(150, Math.min(600, startWidthRef.current + delta))
      setWidth(newWidth)
    },
    [setWidth]
  )

  const handleMouseUp = useCallback((): void => {
    setIsDragging(false)
  }, [])

  // 监听鼠标移动和释放
  useEffect((): (() => void) => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return (): void => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div className="flex h-full w-full">
      {/* 左栏：文件目录区域 */}
      {isOpen && (
        <>
          <div className="sidebar-column" style={{ width: `${width}px` }}>
            <div className="titlebar-left">
              <Titlebar position="left" />
            </div>
            <Sidebar />
          </div>

          {/* 可拖动的分隔条 */}
          <div className="resizer" onMouseDown={handleMouseDown} />
        </>
      )}

      {/* 右栏：编辑器区域 */}
      <div className="editor-column">
        <div className="titlebar-right">
          <Titlebar position="right" onSettingsClick={() => setIsSettingsOpen(true)} />
          {!isOpen && (
            <button className="sidebar-toggle-button" onClick={open} title="显示侧边栏">
              <PanelLeft size={14} />
            </button>
          )}
        </div>
        <div className="editor-wrapper">
          {currentFile?.isImage ? (
            <ImagePreview src={`tanmark://${currentFile.path}`} fileName={currentFile.name} />
          ) : (
            <TanmarkEditor />
          )}
        </div>
      </div>

      {/* 设置窗口 */}
      <SettingsWindow isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
