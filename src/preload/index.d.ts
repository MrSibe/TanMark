import { ElectronAPI } from '@electron-toolkit/preload'
import { AppSettings } from '../shared/types/settings'

interface FileInfo {
  path: string
  name: string
  content: string
  isImage?: boolean // 新增：标识是否为图片文件
}

interface DirectoryItem {
  name: string
  path: string
  isDirectory: boolean
  children?: DirectoryItem[]
}

interface API {
  openFile: () => Promise<FileInfo | null>
  openFolder: () => Promise<string | null>
  saveAs: (content: string) => Promise<FileInfo | null>
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
  readFile: (filePath: string) => Promise<FileInfo | null>
  createFile: (
    dirPath: string,
    fileName: string
  ) => Promise<{ success: boolean; path?: string; error?: string }>
  deleteFile: (targetPath: string) => Promise<{ success: boolean; error?: string }>
  renameFile: (
    oldPath: string,
    newName: string
  ) => Promise<{ success: boolean; path?: string; error?: string }>
  readDirectoryTree: (dirPath: string) => Promise<DirectoryItem[]>
  createFolder: (
    dirPath: string,
    folderName: string
  ) => Promise<{ success: boolean; path?: string; error?: string }>

  // 设置 API
  settings: {
    getAll: () => Promise<AppSettings>
    get: (key: keyof AppSettings) => Promise<AppSettings[keyof AppSettings]>
    set: (key: keyof AppSettings, value: AppSettings[keyof AppSettings]) => Promise<boolean>
    openFile: () => Promise<boolean>
    onUpdate: (callback: (settings: AppSettings) => void) => () => void
  }

  // 主题 API
  theme: {
    getAll: () => Promise<ThemeInfo[]>
    getContent: (themeId: string) => Promise<string | null>
    getDefault: () => Promise<ThemeInfo | null>
    getUserThemesPath: () => Promise<string>
    openUserThemesFolder: () => Promise<boolean>
    applyTheme: (cssContent: string) => Promise<boolean>
  }

  // 图片操作
  saveImage: (
    currentFilePath: string,
    imageData: ArrayBuffer,
    fileName: string
  ) => Promise<{
    success: boolean
    relativePath?: string
    absolutePath?: string
    error?: string
  }>

  // 路径工具
  path: {
    resolve: (...pathSegments: string[]) => string
    relative: (from: string, to: string) => string
    dirname: (p: string) => string
    basename: (p: string, ext?: string) => string
    join: (...pathSegments: string[]) => string
    sep: string
  }
}

interface ThemeInfo {
  id: string
  name: string
  path: string
  content: string
  isDefault: boolean
  source: 'builtin' | 'user'
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
    path: {
      resolve: (...pathSegments: string[]) => string
      relative: (from: string, to: string) => string
      dirname: (p: string) => string
      basename: (p: string, ext?: string) => string
      join: (...pathSegments: string[]) => string
      sep: string
    }
  }
}
