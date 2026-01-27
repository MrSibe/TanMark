import { Mark, markInputRule, markPasteRule } from '@tiptap/core'

export interface ItalicOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customItalic: {
      setItalic: () => ReturnType
      toggleItalic: () => ReturnType
      unsetItalic: () => ReturnType
    }
  }
}

/**
 * 自定义 Italic 扩展，优化 CJK 输入体验
 *
 * 核心改动：移除正则表达式中的空格要求
 * - 默认正则: /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/
 * - Tanmark 正则: /(?:^|)((?:\*)((?:[^*]+))(?:\*))$/
 */
export const CustomItalic = Mark.create<ItalicOptions>({
  name: 'italic',

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  parseHTML() {
    return [
      {
        tag: 'em'
      },
      {
        tag: 'i',
        getAttrs: (node) => (node as HTMLElement).style.fontStyle !== 'normal' && null
      },
      {
        style: 'font-style=italic'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['em', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      setItalic:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name)
        },
      toggleItalic:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name)
        },
      unsetItalic:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-i': () => this.editor.commands.toggleItalic(),
      'Mod-I': () => this.editor.commands.toggleItalic()
    }
  },

  addInputRules() {
    return [
      // 关键修改：移除 \s (空格要求)
      // 原版: /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/
      // CJK 版: /(?:^|)((?:\*)((?:[^*]+))(?:\*))$/
      markInputRule({
        find: /(?:^|)((?:\*)((?:[^*]+))(?:\*))$/,
        type: this.type
      }),
      // 也支持 _ 语法
      markInputRule({
        find: /(?:^|)((?:_)((?:[^_]+))(?:_))$/,
        type: this.type
      })
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: /(?:^|)((?:\*)((?:[^*]+))(?:\*))/g,
        type: this.type
      }),
      markPasteRule({
        find: /(?:^|)((?:_)((?:[^_]+))(?:_))/g,
        type: this.type
      })
    ]
  }
})
