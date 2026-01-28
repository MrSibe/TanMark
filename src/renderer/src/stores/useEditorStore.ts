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
  content: '',

  setEditor: (editor) => set({ editor }),

  setContent: (content) => {
    set({ content })
  },

  updateContent: (content) => {
    set({ content })
  }
}))
