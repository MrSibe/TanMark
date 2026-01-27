import { Image } from '@tiptap/extension-image'
import { nodeInputRule, nodePasteRule } from '@tiptap/core'
import { ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import { Plugin, TextSelection } from '@tiptap/pm/state'
import { useMemo, useState, useEffect, useRef } from 'react'
import type { ReactElement } from 'react'
import { useFileStore } from '../../../stores/useFileStore'

const imageInputRegex = /(?:^|)(!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?\))$/
const imagePasteRegex = /!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?\)/g
const imageFullRegex = /^!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?\)$/

const buildImageMarkdown = (attrs: { alt?: string; src?: string; title?: string }): string => {
  const alt = attrs.alt ?? ''
  const src = attrs.src ?? ''
  const title = attrs.title ?? ''

  if (title) {
    return `![${alt}](${src} "${title}")`
  }

  return `![${alt}](${src})`
}

const parseImageMarkdown = (value: string): { alt: string; src: string; title: string } | null => {
  const match = value.match(imageFullRegex)
  if (!match) return null

  return {
    alt: match[1] || '',
    src: match[2] || '',
    title: match[3] || ''
  }
}

/**
 * Typora 风格的图片组件 - 智能语法退化模式
 * - 未选中：显示渲染后的图片
 * - 选中：显示完整的 Markdown 源码
 * - 语法错误：立即转换为普通文本节点
 */
const CustomImageView = (props: NodeViewProps): ReactElement => {
  const { node, selected, updateAttributes, getPos, editor } = props
  const { src, alt, title } = node.attrs

  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  // 计算应该显示的 markdown 文本
  const computedRawText = useMemo(() => buildImageMarkdown({ alt, src, title }), [alt, src, title])

  // 当前显示的文本：编辑时显示 editText，否则显示 computedRawText
  const displayText = isEditing ? editText : computedRawText

  // 聚焦输入框
  useEffect(() => {
    if (!isEditing) return
    const input = inputRef.current
    if (!input) return
    const length = input.value.length
    input.focus()
    input.setSelectionRange(length, length)
  }, [isEditing])

  // 获取当前文件路径
  const currentFilePath = useFileStore((state) => state.currentFile?.path)

  // 计算预览 URL（tanmark:// 协议）
  const previewUrl = useMemo(() => {
    if (!src) return ''

    if (src.startsWith('http://') || src.startsWith('https')) {
      return src
    }

    if (src.startsWith('tanmark://')) {
      return src
    }

    if (!currentFilePath) {
      return src
    }

    try {
      const currentDir = window.path.dirname(currentFilePath)
      const absolutePath = window.path.resolve(currentDir, src)
      return `tanmark://${absolutePath}`
    } catch {
      return src
    }
  }, [src, currentFilePath])

  const applyAttributes = (attrs: { alt: string; src: string; title: string }): void => {
    if (attrs.alt !== alt || attrs.src !== src || attrs.title !== title) {
      updateAttributes(attrs)
    }
  }

  const convertToText = (text: string, cursorPos?: number | null): void => {
    // 情况 B：语法被破坏，转换为普通文本节点
    // 注意：这个功能需要访问编辑器实例
    try {
      if (!editor || typeof getPos !== 'function') return

      const pos = getPos()
      if (typeof pos !== 'number' || pos < 0) return

      const { state, view } = editor
      const { tr, schema } = state
      const safeText = text ?? ''

      if (safeText.length === 0) {
        tr.delete(pos, pos + node.nodeSize)
        const selectionPos = Math.max(0, pos - 1)
        tr.setSelection(TextSelection.create(tr.doc, Math.min(selectionPos, tr.doc.content.size)))
        view.dispatch(tr)
        return
      }

      // 删除图片节点，插入文本节点，并尽量保持光标位置
      tr.replaceWith(pos, pos + node.nodeSize, schema.text(safeText))
      if (typeof cursorPos === 'number') {
        const safeOffset = Math.max(0, Math.min(cursorPos, safeText.length))
        const selectionPos = pos + 1 + safeOffset
        tr.setSelection(TextSelection.create(tr.doc, selectionPos))
      }
      view.dispatch(tr)
    } catch (error) {
      console.error('[CustomImage] Failed to commit image markdown:', error)
    }
  }

  const handleCommit = (): void => {
    const parsed = parseImageMarkdown(editText)
    if (!parsed) {
      convertToText(editText)
      setIsEditing(false)
      return
    }

    applyAttributes(parsed)
    setIsEditing(false)
  }

  const handleInputChange = (value: string, cursorPos?: number | null): void => {
    setEditText(value)

    const parsed = parseImageMarkdown(value)
    if (!parsed) {
      convertToText(value, cursorPos)
      setIsEditing(false)
      return
    }

    applyAttributes(parsed)
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.stopPropagation()
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      handleCommit()
    }
  }

  return (
    <NodeViewWrapper
      as="div"
      className="image-node-wrapper block leading-none my-2"
      onClick={(e: { target: HTMLElement }) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'IMG') return
        if (editor && typeof getPos === 'function') {
          const pos = getPos()
          if (typeof pos === 'number') {
            editor.commands.setNodeSelection(pos)
          }
        }
        // 开始编辑时初始化 editText
        if (!isEditing) {
          setEditText(computedRawText)
        }
        setIsEditing(true)
      }}
    >
      {selected && isEditing && (
        <input
          ref={inputRef}
          type="text"
          className="tanmark-inline-input bg-transparent outline-none px-1 py-0.5 block w-full mb-2"
          value={displayText}
          onChange={(e) => {
            const target = e.target as HTMLInputElement
            handleInputChange(target.value, target.selectionStart)
          }}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          placeholder="![alt](src)"
        />
      )}

      <img
        draggable={false}
        src={previewUrl}
        alt={alt}
        title={title}
        contentEditable={false}
        onDragStart={(e) => {
          e.preventDefault()
        }}
        onClick={() => {
          if (!isEditing) {
            setEditText(computedRawText)
          }
          setIsEditing(true)
        }}
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          cursor: 'default'
        }}
      />
    </NodeViewWrapper>
  )
}

export const CustomImage = Image.extend({
  name: 'image',
  draggable: false,

  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          const { src, alt, title } = node.attrs
          let markdown = '!['

          if (alt) {
            markdown += alt
          }

          markdown += '](' + src

          if (title) {
            markdown += ' "' + title.replace(/"/g, '\\"') + '"'
          }

          markdown += ')'
          state.write(markdown)

          // 关键：确保图片后有两个换行符，与后续内容分隔
          state.ensureNewLine()
          state.ensureNewLine()

          state.closeBlock(node)
        }
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (transactions, _oldState, newState) => {
          // 只有在文档真的改变时才处理
          if (!transactions.some((tr) => tr.docChanged)) {
            return null
          }

          const { selection } = newState
          const { $from } = selection
          const parent = $from.parent

          if (!parent.isTextblock || parent.type.name === 'codeBlock') {
            return null
          }

          const parsed = parseImageMarkdown(parent.textContent)
          if (!parsed) {
            return null
          }

          const imageNode = newState.schema.nodes.image.create(parsed)
          const tr = newState.tr.replaceWith($from.before(), $from.after(), imageNode)
          const safePos = Math.min($from.before(), tr.doc.content.size)
          tr.setSelection(TextSelection.near(tr.doc.resolve(safePos)))
          return tr
        }
      })
    ]
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: imageInputRegex,
        type: this.type,
        getAttributes: (match) => {
          return {
            alt: match[2] || '',
            src: match[3] || '',
            title: match[4] || ''
          }
        }
      })
    ]
  },
  addPasteRules() {
    return [
      nodePasteRule({
        find: imagePasteRegex,
        type: this.type,
        getAttributes: (match) => {
          return {
            alt: match[1] || '',
            src: match[2] || '',
            title: match[3] || ''
          }
        }
      })
    ]
  },
  addNodeView() {
    return ReactNodeViewRenderer(CustomImageView)
  }
})
