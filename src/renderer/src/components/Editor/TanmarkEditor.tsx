import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import { StarterKit } from '@tiptap/starter-kit'
import CodeBlock from '@tiptap/extension-code-block'
import Link from '@tiptap/extension-link'
import { CustomImage } from './extensions/CustomImage'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TaskList } from '@tiptap/extension-task-list'
import { Markdown } from 'tiptap-markdown'
import { TaskListConverter } from './extensions/TaskListConverter'
import { CustomTaskItem } from './extensions/CustomTaskItem'
import { useEditorStore } from '../../stores/useEditorStore'
import { useFileStore } from '../../stores/useFileStore'
import { uploadImage } from '../../utils/imageUpload'
import './styles/editor.css'

import type { JSX } from 'react'

export const TanmarkEditor = (): JSX.Element => {
  const { content, setContent, setEditor } = useEditorStore()
  const { currentFile, saveFile, setModified } = useFileStore()

  /**
   * 处理图片上传并插入到编辑器
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleImageUpload = async (file: File, view: any, pos?: number): Promise<void> => {
    if (!currentFile) {
      return
    }

    // 上传图片到 assets 目录
    const result = await uploadImage(file, currentFile.path)

    if (!result) {
      console.error('[Editor] Failed to upload image')
      return
    }

    // 创建图片节点 - 使用绝对路径，导出 Markdown 时保留本机路径
    const { schema } = view.state
    const imageAttrs = {
      src: result.relativePath,
      alt: file.name,
      title: ''
    }

    const node = schema.nodes.image.create(imageAttrs)

    if (pos !== undefined) {
      // 在指定位置插入 (拖拽)
      const tr = view.state.tr.insert(pos, node)
      view.dispatch(tr)
    } else {
      // 在当前光标位置插入 (粘贴)
      const tr = view.state.tr.replaceSelectionWith(node)
      view.dispatch(tr)
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // 使用自定义CodeBlock
        bulletList: false, // 禁用StarterKit的BulletList
        orderedList: false, // 禁用StarterKit的OrderedList
        listItem: false, // 禁用StarterKit的ListItem
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      CodeBlock.configure({
        languageClassPrefix: 'language-',
        HTMLAttributes: {
          class: 'tanmark-codeblock'
        }
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'tanmark-link'
        }
      }),
      CustomImage,
      // 表格支持
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tanmark-table'
        }
      }),
      TableRow,
      TableCell,
      TableHeader,
      // 任务列表支持（必须在BulletList之前）
      TaskList.configure({
        HTMLAttributes: {
          class: 'tanmark-task-list'
        }
      }),
      CustomTaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'tanmark-task-item'
        }
      }),
      // 任务列表转换器（检测 [ ] 和 [x] 并转换列表）
      TaskListConverter,
      // 普通列表（保持正常的inputRules）
      BulletList,
      OrderedList,
      ListItem,
      // Markdown 扩展配置
      Markdown.configure({
        html: false,
        tightLists: true,
        bulletListMarker: '-',
        linkify: true,
        breaks: false,
        transformPastedText: false, // 暂时关闭，看看是否能解决问题
        transformCopiedText: true
      })
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'tanmark-editor focus:outline-none'
      },
      // 处理粘贴事件
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false

        // 查找图片文件
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (file) {
              handleImageUpload(file, view)
            }
            return true
          }
        }
        return false
      },
      // 处理拖拽事件
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false

        const files = event.dataTransfer?.files
        if (!files || files.length === 0) return false

        const file = files[0]
        if (file.type.startsWith('image/')) {
          event.preventDefault()

          // 获取拖拽位置
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY
          })

          if (coordinates) {
            handleImageUpload(file, view, coordinates.pos)
          }
          return true
        }
        return false
      }
    },
    onUpdate: ({ editor, transaction }) => {
      // 检查是否是真实的文档内容修改
      // 如果 transaction 只是选择变化或其他元数据变化，不触发更新
      if (!transaction.docChanged) {
        return
      }

      // 更新 store 中的内容
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newMarkdown = (editor.storage as any).markdown.getMarkdown()

      // 只有在内容真正改变时才更新 store 和标记为已修改
      if (newMarkdown !== content) {
        setContent(newMarkdown)
        // 标记文件为已修改
        if (currentFile) {
          setModified(true)
        }
      }
    }
  })

  // 保存编辑器实例到 store 和 window
  useEffect((): void => {
    if (editor) {
      setEditor(editor)
      // 保存到 window 对象，供 CustomImageView 访问
      ;(window as { editorInstance?: unknown }).editorInstance = editor
    }
  }, [editor, setEditor])

  // 监听 Ctrl+S 保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (editor && currentFile) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const markdown = (editor.storage as any).markdown.getMarkdown()
          saveFile(currentFile, markdown)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return (): void => window.removeEventListener('keydown', handleKeyDown)
  }, [editor, currentFile, saveFile])

  // 当打开新文件时，加载内容
  useEffect((): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (editor && content !== (editor.storage as any).markdown.getMarkdown()) {
      // 使用 emitUpdate: false 避免触发 onUpdate 回调
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  if (!editor) {
    return <div className="flex items-center justify-center h-full">加载编辑器...</div>
  }

  return (
    <div className="tanmark-editor-container h-full overflow-auto p-8 custom-scrollbar">
      <EditorContent editor={editor} />
    </div>
  )
}
