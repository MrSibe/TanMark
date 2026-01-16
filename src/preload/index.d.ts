import { ElectronAPI } from '@electron-toolkit/preload'
import { AppSettings } from '../shared/types/settings'

interface FileInfo {
  path: string
  name: string
  content: string
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
  readDirectoryTree: (dirPath: string) => Promise<DirectoryItem[]>
  createFolder: (
    dirPath: string,
    folderName: string
  ) => Promise<{ success: boolean; path?: string; error?: string }>

  // 设置 API
  settings: {
    getAll: () => Promise<AppSettings>
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<boolean>
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
  }
}
