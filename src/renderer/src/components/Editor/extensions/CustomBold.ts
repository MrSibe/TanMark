import { Mark, markInputRule, markPasteRule } from '@tiptap/core'

export interface BoldOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customBold: {
      setBold: () => ReturnType
      toggleBold: () => ReturnType
      unsetBold: () => ReturnType
    }
  }
}

/**
 * 自定义 Bold 扩展，优化 CJK 输入体验
 *
 * 核心改动：移除正则表达式中的空格要求
 * - 默认正则: /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))$/
 * - Tanmark 正则: /(?:^|)((?:\*\*)((?:[^*]+))(?:\*\*))$/
 *
 * 这样在中文句子中间输入 **加粗** 不需要前后空格
 */
export const CustomBold = Mark.create<BoldOptions>({
  name: 'bold',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'strong',
      },
      {
        tag: 'b',
        getAttrs: (node) => (node as HTMLElement).style.fontWeight !== 'normal' && null,
      },
      {
        style: 'font-weight',
        getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['strong', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      setBold:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name)
        },
      toggleBold:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name)
        },
      unsetBold:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-B': () => this.editor.commands.toggleBold(),
    }
  },

  addInputRules() {
    return [
      // 关键修改：移除 \s (空格要求)
      // 原版: /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))$/
      // CJK 版: /(?:^|)((?:\*\*)((?:[^*]+))(?:\*\*))$/
      markInputRule({
        find: /(?:^|)((?:\*\*)((?:[^*]+))(?:\*\*))$/,
        type: this.type,
      }),
      // 也支持 __ 语法
      markInputRule({
        find: /(?:^|)((?:__)((?:[^_]+))(?:__))$/,
        type: this.type,
      }),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: /(?:^|)((?:\*\*)((?:[^*]+))(?:\*\*))/g,
        type: this.type,
      }),
      markPasteRule({
        find: /(?:^|)((?:__)((?:[^_]+))(?:__))/g,
        type: this.type,
      }),
    ]
  },
})
