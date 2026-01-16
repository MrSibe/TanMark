import { create } from 'zustand'
import type { Editor } from '@tiptap/core'

interface EditorState {
  // 编辑器实例
  editor: Editor | null
  // Markdown 内容
  content: string

  // Actions
  setEditor: (editor: Editor | null) => void
  setContent: (content: string) => void
  updateContent: (content: string) => void
}

export const useEditorStore = create<EditorState>()((set) => ({
  editor: null,
  content:
    '# Welcome to TanMark\n\n开始编辑你的 Markdown 文档...\n\n在中文句子中使用**加粗**和*斜体*无需空格！',

  setEditor: (editor) => set({ editor }),

  setContent: (content) => {
    set({ content })
  },

  updateContent: (content) => {
    set({ content })
  },
}))
