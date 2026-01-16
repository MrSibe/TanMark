import { ipcMain, dialog } from 'electron'
import fs from 'fs/promises'
import path from 'path'

export interface FileInfo {
  path: string
  name: string
  content: string
}

export interface DirectoryItem {
  name: string
  path: string
  isDirectory: boolean
  children?: DirectoryItem[]
}

/**
 * 注册所有文件系统相关的 IPC 处理器
 */
export function registerFileHandlers() {
  // 打开文件对话框
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const filePath = result.filePaths[0]
    const content = await fs.readFile(filePath, 'utf-8')
    const name = path.basename(filePath)

    return {
      path: filePath,
      name,
      content,
    } as FileInfo
  })

  // 打开文件夹对话框
  ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  })

  // 保存文件
  ipcMain.handle('file:save', async (_, filePath: string, content: string) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (error) {
      console.error('Error saving file:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // 另存为
  ipcMain.handle('dialog:saveAs', async (_, content: string) => {
    const result = await dialog.showSaveDialog({
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })

    if (result.canceled || !result.filePath) {
      return null
    }

    try {
      await fs.writeFile(result.filePath, content, 'utf-8')
      return {
        path: result.filePath,
        name: path.basename(result.filePath),
        content,
      } as FileInfo
    } catch (error) {
      console.error('Error saving file:', error)
      return null
    }
  })

  // 读取目录树
  ipcMain.handle('directory:readTree', async (_, dirPath: string) => {
    try {
      console.log('[Main] Reading directory tree:', dirPath)
      const tree = await readDirectoryTree(dirPath)
      console.log('[Main] Directory tree loaded successfully, total items:', tree.length)
      return tree
    } catch (error) {
      console.error('[Main] Error reading directory:', error)
      return []
    }
  })

  // 读取文件内容
  ipcMain.handle('file:read', async (_, filePath: string) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const name = path.basename(filePath)
      return {
        path: filePath,
        name,
        content,
      } as FileInfo
    } catch (error) {
      console.error('Error reading file:', error)
      return null
    }
  })

  // 创建新文件
  ipcMain.handle('file:create', async (_, dirPath: string, fileName: string) => {
    try {
      // 确保文件名以 .md 结尾
      const fullFileName = fileName.endsWith('.md') ? fileName : `${fileName}.md`
      const filePath = path.join(dirPath, fullFileName)

      // 检查文件是否已存在
      try {
        await fs.access(filePath)
        return { success: false, error: 'File already exists' }
      } catch {
        // 文件不存在，可以创建
      }

      // 创建空文件
      await fs.writeFile(filePath, '', 'utf-8')
      return { success: true, path: filePath }
    } catch (error) {
      console.error('[Main] Error creating file:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // 创建新文件夹
  ipcMain.handle('folder:create', async (_, dirPath: string, folderName: string) => {
    try {
      const folderPath = path.join(dirPath, folderName)

      // 检查文件夹是否已存在
      try {
        await fs.access(folderPath)
        return { success: false, error: 'Folder already exists' }
      } catch {
        // 文件夹不存在，可以创建
      }

      // 创建文件夹
      await fs.mkdir(folderPath, { recursive: false })
      return { success: true, path: folderPath }
    } catch (error) {
      console.error('[Main] Error creating folder:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // 删除文件或文件夹
  ipcMain.handle('file:delete', async (_, targetPath: string) => {
    try {
      const stats = await fs.stat(targetPath)

      if (stats.isDirectory()) {
        // 递归删除文件夹
        await fs.rm(targetPath, { recursive: true, force: true })
      } else {
        // 删除文件
        await fs.unlink(targetPath)
      }

      return { success: true }
    } catch (error) {
      console.error('[Main] Error deleting:', error)
      return { success: false, error: (error as Error).message }
    }
  })
}

/**
 * 递归读取目录树
 */
async function readDirectoryTree(dirPath: string): Promise<DirectoryItem[]> {
  const items = await fs.readdir(dirPath, { withFileTypes: true })
  const tree: DirectoryItem[] = []

  for (const item of items) {
    // 跳过隐藏文件和 node_modules
    if (item.name.startsWith('.') || item.name === 'node_modules') {
      continue
    }

    const itemPath = path.join(dirPath, item.name)
    const treeItem: DirectoryItem = {
      name: item.name,
      path: itemPath,
      isDirectory: item.isDirectory(),
    }

    // 如果是目录，递归读取子目录
    if (item.isDirectory()) {
      treeItem.children = await readDirectoryTree(itemPath)
    }

    // 只显示 Markdown 文件和目录
    if (item.isDirectory() || item.name.match(/\.(md|markdown)$/i)) {
      tree.push(treeItem)
    }
  }

  // 排序：目录在前，文件在后，都按字母排序
  return tree.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1
    if (!a.isDirectory && b.isDirectory) return 1
    return a.name.localeCompare(b.name)
  })
}
