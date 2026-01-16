import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 自定义 API
const api = {
  // 文件对话框
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  saveAs: (content: string) => ipcRenderer.invoke('dialog:saveAs', content),

  // 文件操作
  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('file:save', filePath, content),
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
  createFile: (dirPath: string, fileName: string) =>
    ipcRenderer.invoke('file:create', dirPath, fileName),
  deleteFile: (targetPath: string) => ipcRenderer.invoke('file:delete', targetPath),

  // 目录操作
  readDirectoryTree: (dirPath: string) => ipcRenderer.invoke('directory:readTree', dirPath),
  createFolder: (dirPath: string, folderName: string) =>
    ipcRenderer.invoke('folder:create', dirPath, folderName),

  // 设置 API
  settings: {
    getAll: () => ipcRenderer.invoke('settings:get'),
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
    openFile: () => ipcRenderer.invoke('settings:openFile'),
    onUpdate: (callback: (settings: any) => void) => {
      const listener = (_event: any, settings: any) => callback(settings)
      ipcRenderer.on('settings:updated', listener)
      // 返回清理函数
      return () => {
        ipcRenderer.removeListener('settings:updated', listener)
      }
    }
  },

  // 主题 API
  theme: {
    getAll: () => ipcRenderer.invoke('theme:getAll'),
    getContent: (themeId: string) => ipcRenderer.invoke('theme:getContent', themeId),
    getDefault: () => ipcRenderer.invoke('theme:getDefault'),
    getUserThemesPath: () => ipcRenderer.invoke('theme:getUserThemesPath'),
    openUserThemesFolder: () => ipcRenderer.invoke('theme:openUserThemesFolder')
  }
}

// 暴露 API 到渲染进程
try {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} catch (error) {
  console.error('[Preload] Error exposing API:', error)
}
