import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import * as path from 'path'
import { AppSettings } from '../shared/types/settings'

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
  renameFile: (oldPath: string, newName: string) =>
    ipcRenderer.invoke('file:rename', oldPath, newName),

  // 目录操作
  readDirectoryTree: (dirPath: string) => ipcRenderer.invoke('directory:readTree', dirPath),
  createFolder: (dirPath: string, folderName: string) =>
    ipcRenderer.invoke('folder:create', dirPath, folderName),

  // 设置 API
  settings: {
    getAll: () => ipcRenderer.invoke('settings:get'),
    get: (key: keyof AppSettings) => ipcRenderer.invoke('settings:get', key),
    set: (key: keyof AppSettings, value: AppSettings[keyof AppSettings]) =>
      ipcRenderer.invoke('settings:set', key, value),
    openFile: () => ipcRenderer.invoke('settings:openFile'),
    onUpdate: (callback: (settings: AppSettings) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, settings: AppSettings): void =>
        callback(settings)
      ipcRenderer.on('settings:updated', listener)
      // 返回清理函数
      return () => {
        ipcRenderer.removeListener('settings:updated', listener)
      }
    }
  },

  // 主题 API（扩展支持 JSON）
  theme: {
    getAll: () => ipcRenderer.invoke('theme:getAll'),
    getContent: (themeId: string) => ipcRenderer.invoke('theme:getContent', themeId),
    getDefault: () => ipcRenderer.invoke('theme:getDefault'),
    getUserThemesPath: () => ipcRenderer.invoke('theme:getUserThemesPath'),
    openUserThemesFolder: () => ipcRenderer.invoke('theme:openUserThemesFolder'),
    applyTheme: (cssContent: string) => ipcRenderer.invoke('theme:applyTheme', cssContent),
    // 新增：JSON 主题支持
    getConfig: (themeId: string) => ipcRenderer.invoke('theme:getConfig', themeId),
    saveJSON: (themeId: string, config: any) =>
      ipcRenderer.invoke('theme:saveJSON', themeId, config),
    validate: (config: any) => ipcRenderer.invoke('theme:validate', config)
  },

  // 图片操作
  saveImage: (currentFilePath: string, imageData: ArrayBuffer, fileName: string) =>
    ipcRenderer.invoke('image:save', currentFilePath, imageData, fileName),

  // 路径工具（暴露安全的 path 方法）
  path: {
    resolve: (...pathSegments: string[]) => path.resolve(...pathSegments),
    relative: (from: string, to: string) => path.relative(from, to),
    dirname: (p: string) => path.dirname(p),
    basename: (p: string, ext?: string) => path.basename(p, ext),
    join: (...pathSegments: string[]) => path.join(...pathSegments),
    sep: path.sep
  }
}

// 暴露 API 到渲染进程
try {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
  // 单独暴露 path 为全局对象，方便使用
  contextBridge.exposeInMainWorld('path', {
    resolve: (...pathSegments: string[]) => path.resolve(...pathSegments),
    relative: (from: string, to: string) => path.relative(from, to),
    dirname: (p: string) => path.dirname(p),
    basename: (p: string, ext?: string) => path.basename(p, ext),
    join: (...pathSegments: string[]) => path.join(...pathSegments),
    sep: path.sep
  })
} catch (error) {
  console.error('[Preload] Error exposing API:', error)
}
