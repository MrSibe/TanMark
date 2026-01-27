import { PanelLeft } from 'lucide-react'
import type { JSX } from 'react'
import { Titlebar } from '../Titlebar/Titlebar'
import { AppSidebar } from '../Sidebar/Sidebar'
import { TanmarkEditor } from '../Editor/TanmarkEditor'
import { SettingsWindow } from '../Settings/SettingsWindow'
import { ImagePreview } from '../preview/ImagePreview'
import { useSidebarStore } from '../../stores/useSidebarStore'
import { useFileStore } from '../../stores/useFileStore'
import { useState, useEffect, useCallback } from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '../../components/ui/resizable'

export const MainLayout = (): JSX.Element => {
  const { isOpen, open, width } = useSidebarStore()
  const { currentFile } = useFileStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  const minSidebarWidth = 200

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 将像素宽度转换为百分比
  const minPercent = (minSidebarWidth / windowWidth) * 100
  const maxPercent = 50

  // 使用 useCallback 避免频繁重新渲染
  const handleLayoutChange = useCallback((sizes: { [id: string]: number }) => {
    const sidebarSize = sizes['sidebar']
    if (sidebarSize !== undefined) {
      const newWidth = Math.max(
        minSidebarWidth,
        Math.round((sidebarSize / 100) * windowWidth)
      )
      useSidebarStore.getState().setWidth(newWidth)
    }
  }, [minSidebarWidth, windowWidth])

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-full w-full"
      onLayoutChanged={handleLayoutChange}
    >
      {/* 左栏：文件目录区域 */}
      {isOpen && (
        <>
          <ResizablePanel
            id="sidebar"
            defaultSize={width}
            minSize={minSidebarWidth}
            maxSize={`${maxPercent}%`}
          >
            <div className="flex h-full flex-col">
              <div className="titlebar-left">
                <Titlebar position="left" />
              </div>
              <AppSidebar />
            </div>
          </ResizablePanel>

          {/* 可拖动的分隔条 */}
          <ResizableHandle />
        </>
      )}

      {/* 右栏：编辑器区域 */}
      <ResizablePanel id="editor" defaultSize={isOpen ? undefined : 100}>
        <div className="editor-column flex h-full flex-col">
          <div className="titlebar-right">
            <Titlebar position="right" onSettingsClick={() => setIsSettingsOpen(true)} />
            {!isOpen && (
              <button className="sidebar-toggle-button" onClick={open} title="显示侧边栏">
                <PanelLeft size={14} />
              </button>
            )}
          </div>
          <div className="editor-wrapper flex-1">
            {currentFile?.isImage ? (
              <ImagePreview src={`tanmark://${currentFile.path}`} fileName={currentFile.name} />
            ) : (
              <TanmarkEditor />
            )}
          </div>
        </div>
      </ResizablePanel>

      {/* 设置窗口 */}
      <SettingsWindow isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </ResizablePanelGroup>
  )
}
