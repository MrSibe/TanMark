import { create } from 'zustand'

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
  createNewFile: () => Promise<void>
  loadDirectoryTree: (dirPath: string) => Promise<void>
  openFileFromTree: (filePath: string) => Promise<void>
}

export const useFileStore = create<FileState>()((set, get) => ({
  currentFile: null,
  workingDirectory: null,
  directoryTree: [],
  isModified: false,

  setCurrentFile: (file) => {
    set({ currentFile: file, isModified: false })
  },
  setWorkingDirectory: (dir) => set({ workingDirectory: dir }),
  setDirectoryTree: (tree) => set({ directoryTree: tree }),
  setModified: (modified) => set({ isModified: modified }),

  openFile: async () => {
    try {
      const file = await window.api.openFile()
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
      const dirPath = await window.api.openFolder()
      if (dirPath) {
        set({ workingDirectory: dirPath })
        await get().loadDirectoryTree(dirPath)
      }
    } catch (error) {
      console.error('Error opening vault:', error)
    }
  },

  saveFile: async (file, content) => {
    if (!file.path) {
      await get().saveFileAs(content)
      return
    }

    const result = await window.api.saveFile(file.path, content)
    if (result.success) {
      set({ isModified: false, currentFile: { ...file, content } })
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

  createNewFile: async () => {
    set({
      currentFile: {
        path: '',
        name: '未命名.md',
        content: ''
      },
      isModified: false
    })
    const { useEditorStore } = await import('./useEditorStore')
    useEditorStore.getState().setContent('')
  },

  loadDirectoryTree: async (dirPath) => {
    try {
      const tree = await window.api.readDirectoryTree(dirPath)
      set({ directoryTree: tree })
    } catch (error) {
      console.error('Error loading directory tree:', error)
      set({ directoryTree: [] })
    }
  },

  openFileFromTree: async (filePath) => {
    try {
      const file = await window.api.readFile(filePath)

      if (file) {
        // 检查是否为图片文件
        if (file.isImage) {
          // 图片文件：设置 isImage 标识，content 留空
          set({
            currentFile: { ...file, content: '' },
            isModified: false
          })
          return
        }

        // 文本文件：正常加载
        set({ currentFile: file, isModified: false })
        const { useEditorStore } = await import('./useEditorStore')
        useEditorStore.getState().setContent(file.content)
      }
    } catch (error) {
      console.error('Error opening file from tree:', error)
    }
  }
}))
