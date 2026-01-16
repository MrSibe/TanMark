import { create } from 'zustand'

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

interface FileState {
  // 当前文件
  currentFile: FileInfo | null
  // 当前仓库（工作目录）
  workingDirectory: string | null
  // 目录树
  directoryTree: DirectoryItem[]
  // 是否已修改
  isModified: boolean

  // Actions
  setCurrentFile: (file: FileInfo | null) => void
  setWorkingDirectory: (dir: string | null) => void
  setDirectoryTree: (tree: DirectoryItem[]) => void
  setModified: (modified: boolean) => void
  openFile: () => Promise<void>
  openFolder: () => Promise<void>
  saveFile: (file: FileInfo, content: string) => Promise<void>
  saveFileAs: (content: string) => Promise<void>
  loadDirectoryTree: (dirPath: string) => Promise<void>
  openFileFromTree: (filePath: string) => Promise<void>
}

export const useFileStore = create<FileState>()((set, get) => ({
  currentFile: null,
  workingDirectory: null,
  directoryTree: [],
  isModified: false,

  setCurrentFile: (file) => set({ currentFile: file, isModified: false }),
  setWorkingDirectory: (dir) => set({ workingDirectory: dir }),
  setDirectoryTree: (tree) => set({ directoryTree: tree }),
  setModified: (modified) => set({ isModified: modified }),

  openFile: async () => {
    try {
      console.log('Opening file dialog...')
      const file = await window.api.openFile()
      console.log('Selected file:', file)
      if (file) {
        set({ currentFile: file, isModified: false })
        // 同时更新编辑器内容
        const { useEditorStore } = await import('./useEditorStore')
        useEditorStore.getState().setContent(file.content)
      }
    } catch (error) {
      console.error('Error opening file:', error)
    }
  },

  openFolder: async () => {
    try {
      console.log('Opening vault dialog...')
      const dirPath = await window.api.openFolder()
      console.log('Selected vault:', dirPath)
      if (dirPath) {
        set({ workingDirectory: dirPath })
        await get().loadDirectoryTree(dirPath)
      }
    } catch (error) {
      console.error('Error opening vault:', error)
    }
  },

  saveFile: async (file, content) => {
    const result = await window.api.saveFile(file.path, content)
    if (result.success) {
      set({ isModified: false })
      console.log('File saved successfully')
    } else {
      console.error('Failed to save file:', result.error)
    }
  },

  saveFileAs: async (content) => {
    const file = await window.api.saveAs(content)
    if (file) {
      set({ currentFile: file, isModified: false })
    }
  },

  loadDirectoryTree: async (dirPath) => {
    try {
      console.log('Loading directory tree:', dirPath)
      const tree = await window.api.readDirectoryTree(dirPath)
      console.log('Directory tree data:', tree)
      set({ directoryTree: tree })
      console.log('Directory tree updated, total items:', tree.length)
    } catch (error) {
      console.error('Error loading directory tree:', error)
      set({ directoryTree: [] })
    }
  },

  openFileFromTree: async (filePath) => {
    try {
      console.log('Opening file from tree:', filePath)
      const file = await window.api.readFile(filePath)
      console.log('Read file:', file)
      if (file) {
        set({ currentFile: file, isModified: false })
        // 更新编辑器内容
        const { useEditorStore } = await import('./useEditorStore')
        useEditorStore.getState().setContent(file.content)
      }
    } catch (error) {
      console.error('Error opening file from tree:', error)
    }
  },
}))
