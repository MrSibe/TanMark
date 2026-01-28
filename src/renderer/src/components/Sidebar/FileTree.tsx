import { useState } from 'react'
import type { JSX } from 'react'
import { useFileStore } from '../../stores/useFileStore'
import { FileTreeItem } from './FileTreeItem'
import { ContextMenu } from './ContextMenu'
import { InputDialog } from './InputDialog'
import { ConfirmDialog } from './ConfirmDialog'

export const FileTree = (): JSX.Element => {
  const { directoryTree, workingDirectory, loadDirectoryTree, currentFile } = useFileStore()
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    targetPath: string
    isDirectory: boolean
  } | null>(null)
  const [inputDialog, setInputDialog] = useState<{
    title: string
    placeholder: string
    onConfirm: (value: string) => void
  } | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  const handleContextMenu = (
    e: React.MouseEvent,
    targetPath?: string,
    isDirectory = true
  ): void => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      targetPath: targetPath || workingDirectory || '',
      isDirectory
    })
  }

  const handleNewFile = async (): Promise<void> => {
    const targetPath = contextMenu?.targetPath

    if (!targetPath) return

    setInputDialog({
      title: '新建文件',
      placeholder: '请输入文件名（不需要 .md 后缀）',
      onConfirm: async (fileName) => {
        setInputDialog(null)

        try {
          const result = await window.api.createFile(targetPath, fileName)

          if (result.success) {
            if (workingDirectory) {
              await loadDirectoryTree(workingDirectory)
            }
          } else {
            alert(`创建文件失败：${result.error}`)
          }
        } catch (error) {
          console.error('Error creating file:', error)
          alert('创建文件时发生错误')
        }
      }
    })
  }

  const handleNewFolder = async (): Promise<void> => {
    const targetPath = contextMenu?.targetPath

    if (!targetPath) return

    setInputDialog({
      title: '新建文件夹',
      placeholder: '请输入文件夹名',
      onConfirm: async (folderName) => {
        setInputDialog(null)

        try {
          const result = await window.api.createFolder(targetPath, folderName)

          if (result.success) {
            if (workingDirectory) {
              await loadDirectoryTree(workingDirectory)
            }
          } else {
            alert(`创建文件夹失败：${result.error}`)
          }
        } catch (error) {
          console.error('Error creating folder:', error)
          alert('创建文件夹时发生错误')
        }
      }
    })
  }

  const handleDelete = async (): Promise<void> => {
    const targetPath = contextMenu?.targetPath

    if (!targetPath) return

    // 获取文件/文件夹名称
    const name = targetPath.split('/').pop() || targetPath.split('\\').pop() || '此项'

    setConfirmDialog({
      title: '确认删除',
      message: `确定要删除 "${name}" 吗？此操作无法撤销。`,
      onConfirm: async () => {
        setConfirmDialog(null)

        try {
          const result = await window.api.deleteFile(targetPath)

          if (result.success) {
            if (workingDirectory) {
              await loadDirectoryTree(workingDirectory)
            }
          } else {
            alert(`删除失败：${result.error}`)
          }
        } catch (error) {
          console.error('Error deleting:', error)
          alert('删除时发生错误')
        }
      }
    })
  }

  const handleRename = async (): Promise<void> => {
    const targetPath = contextMenu?.targetPath

    if (!targetPath) return

    setInputDialog({
      title: '重命名',
      placeholder: '请输入新名称',
      onConfirm: async (newName) => {
        setInputDialog(null)

        try {
          const result = await window.api.renameFile(targetPath, newName)

          if (result.success) {
            // 如果重命名的是当前打开的文件，更新当前文件路径
            if (currentFile?.path === targetPath && result.path) {
              const { setCurrentFile } = useFileStore.getState()
              // 读取新文件以更新内容
              const fileData = await window.api.readFile(result.path)
              if (fileData) {
                setCurrentFile({
                  path: result.path,
                  name: fileData.name,
                  content: fileData.content
                })
              }
            }

            // 重新加载目录树
            if (workingDirectory) {
              await loadDirectoryTree(workingDirectory)
            }
          } else {
            alert(`重命名失败：${result.error}`)
          }
        } catch (error) {
          console.error('Error renaming:', error)
          alert('重命名时发生错误')
        }
      }
    })
  }

  if (directoryTree.length === 0) {
    return (
      <>
        <div className="file-tree-empty" onContextMenu={handleContextMenu}>
          仓库为空
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              isDirectory={contextMenu.isDirectory}
              showDelete={contextMenu.targetPath !== workingDirectory}
              onClose={() => setContextMenu(null)}
              onNewFile={handleNewFile}
              onNewFolder={handleNewFolder}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          )}
        </div>
        {inputDialog && (
          <InputDialog
            title={inputDialog.title}
            placeholder={inputDialog.placeholder}
            onConfirm={inputDialog.onConfirm}
            onCancel={() => setInputDialog(null)}
          />
        )}
        {confirmDialog && (
          <ConfirmDialog
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="file-tree custom-scrollbar" onContextMenu={handleContextMenu}>
        {directoryTree.map((item) => (
          <FileTreeItem key={item.path} item={item} onContextMenu={handleContextMenu} />
        ))}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            isDirectory={contextMenu.isDirectory}
            showDelete={contextMenu.targetPath !== workingDirectory}
            onClose={() => setContextMenu(null)}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        )}
      </div>
      {inputDialog && (
        <InputDialog
          title={inputDialog.title}
          placeholder={inputDialog.placeholder}
          onConfirm={inputDialog.onConfirm}
          onCancel={() => setInputDialog(null)}
        />
      )}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </>
  )
}
