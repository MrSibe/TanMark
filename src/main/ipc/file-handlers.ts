import { ipcMain, dialog } from 'electron'
import fs from 'fs/promises'
import path from 'path'

export interface FileInfo {
  path: string
  name: string
  content: string
  isImage?: boolean // 新增：标识是否为图片文件
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
export function registerFileHandlers(): void {
  // 图片文件扩展名
  const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i

  // 打开文件对话框
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown'] },
        { name: 'All Files', extensions: ['*'] }
      ]
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
      content
    } as FileInfo
  })

  // 打开文件夹对话框
  ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
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
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (result.canceled || !result.filePath) {
      return null
    }

    try {
      await fs.writeFile(result.filePath, content, 'utf-8')
      return {
        path: result.filePath,
        name: path.basename(result.filePath),
        content
      } as FileInfo
    } catch (error) {
      console.error('Error saving file:', error)
      return null
    }
  })

  // 读取目录树
  ipcMain.handle('directory:readTree', async (_, dirPath: string) => {
    try {
      const tree = await readDirectoryTree(dirPath)
      return tree
    } catch (error) {
      console.error('[Main] Error reading directory:', error)
      return []
    }
  })

  // 读取文件内容
  ipcMain.handle('file:read', async (_, filePath: string) => {
    try {
      // 检查是否为图片文件
      const isImage = IMAGE_EXTENSIONS.test(path.basename(filePath))

      if (isImage) {
        // 图片文件：返回特殊标识
        return {
          path: filePath,
          name: path.basename(filePath),
          content: '',
          isImage: true
        } as FileInfo
      }

      // 文本文件：正常读取
      const content = await fs.readFile(filePath, 'utf-8')
      const name = path.basename(filePath)
      return {
        path: filePath,
        name,
        content,
        isImage: false
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

  // 重命名文件或文件夹
  ipcMain.handle('file:rename', async (_, oldPath: string, newName: string) => {
    try {
      // 获取目录路径
      const dirPath = path.dirname(oldPath)
      const newPath = path.join(dirPath, newName)

      // 检查新名称是否已存在
      try {
        await fs.access(newPath)
        return { success: false, error: 'File or folder with this name already exists' }
      } catch {
        // 不存在，可以重命名
      }

      // 执行重命名
      await fs.rename(oldPath, newPath)
      return { success: true, path: newPath }
    } catch (error) {
      console.error('[Main] Error renaming:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // 保存图片到 assets 目录
  ipcMain.handle(
    'image:save',
    async (_, currentFilePath: string, imageData: ArrayBuffer, fileName: string) => {
      try {
        // 获取当前 Markdown 文件所在目录
        const fileDir = path.dirname(currentFilePath)
        const assetsDir = path.join(fileDir, 'assets')

        // 确保 assets 目录存在
        try {
          await fs.access(assetsDir)
        } catch {
          // 目录不存在,创建它
          await fs.mkdir(assetsDir, { recursive: true })
        }

        // 生成唯一文件名 (避免覆盖)
        let finalFileName = fileName
        let counter = 1
        let targetPath = path.join(assetsDir, finalFileName)

        while (true) {
          try {
            await fs.access(targetPath)
            // 文件存在,添加序号
            const ext = path.extname(fileName)
            const baseName = path.basename(fileName, ext)
            finalFileName = `${baseName}-${counter}${ext}`
            targetPath = path.join(assetsDir, finalFileName)
            counter++
          } catch {
            // 文件不存在,使用此文件名
            break
          }
        }

        // 保存图片文件
        const buffer = Buffer.from(imageData)
        await fs.writeFile(targetPath, buffer)

        // 返回相对路径和绝对路径
        return {
          success: true,
          relativePath: `assets/${finalFileName}`, // Markdown 中使用
          absolutePath: targetPath // 协议加载使用
        }
      } catch (error) {
        console.error('[IPC] Error saving image:', error)
        return {
          success: false,
          error: (error as Error).message
        }
      }
    }
  )
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
      isDirectory: item.isDirectory()
    }

    // 如果是目录，递归读取子目录
    if (item.isDirectory()) {
      treeItem.children = await readDirectoryTree(itemPath)
    }

    // 只显示 Markdown 文件、图片文件和目录
    const isMarkdown = item.name.match(/\.(md|markdown)$/i)
    const isImage = item.name.match(/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i)
    if (item.isDirectory() || isMarkdown || isImage) {
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
