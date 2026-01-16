import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import { StarterKit } from '@tiptap/starter-kit'
import CodeBlock from '@tiptap/extension-code-block'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
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
import './styles/editor.css'

export const TanmarkEditor = () => {
  const { content, setContent, setEditor } = useEditorStore()
  const { currentFile, saveFile, setModified } = useFileStore()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // 使用自定义CodeBlock
        bulletList: false, // 禁用StarterKit的BulletList
        orderedList: false, // 禁用StarterKit的OrderedList
        listItem: false, // 禁用StarterKit的ListItem
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      CodeBlock.configure({
        languageClassPrefix: 'language-',
        HTMLAttributes: {
          class: 'tanmark-codeblock',
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'tanmark-link',
        },
      }),
      Image,
      // 表格支持
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tanmark-table',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      // 任务列表支持（必须在BulletList之前）
      TaskList.configure({
        HTMLAttributes: {
          class: 'tanmark-task-list',
        },
      }),
      CustomTaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'tanmark-task-item',
        },
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
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'tanmark-editor focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      // 更新 store 中的内容
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const markdown = (editor.storage as any).markdown.getMarkdown()
      setContent(markdown)
      // 标记文件为已修改
      if (currentFile) {
        setModified(true)
      }
    },
  })

  // 保存编辑器实例到 store
  useEffect(() => {
    if (editor) {
      setEditor(editor)
    }
  }, [editor, setEditor])

  // 监听 Ctrl+S 保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (editor && currentFile) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const markdown = (editor.storage as any).markdown.getMarkdown()
          saveFile(currentFile, markdown)
          console.log('File saved:', currentFile.name)
        } else if (editor && !currentFile) {
          console.log('No file opened, please open or create a file first')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editor, currentFile, saveFile])

  // 当打开新文件时，加载内容
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (editor && content !== (editor.storage as any).markdown.getMarkdown()) {
      // 使用 emitUpdate: false 避免触发 onUpdate 回调
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full">加载编辑器...</div>
    )
  }

  return (
    <div className="tanmark-editor-container h-full overflow-auto p-8 custom-scrollbar">
      <EditorContent editor={editor} />
    </div>
  )
}
