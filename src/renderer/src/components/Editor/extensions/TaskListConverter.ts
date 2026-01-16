import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'

export const TaskListConverter = Extension.create({
  name: 'taskListConverter',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('taskListConverter'),
        props: {
          handleTextInput(view, from, to, text) {
            const { state, dispatch } = view
            const { selection, doc, schema } = state
            const { $from } = selection

            // 检查是否在列表项中
            const listItem = $from.node(-1)
            if (!listItem || listItem.type.name !== 'listItem') {
              return false
            }

            // 检查父节点是否是普通列表
            const list = $from.node(-2)
            if (!list || list.type.name !== 'bulletList') {
              return false
            }

            // 获取当前列表项的文本内容（加上刚输入的字符）
            const textContent = listItem.textContent + text

            // 检测 [ ] 或 [x] 模式，中间必须有空格，后面也要有空格
            const uncheckedMatch = /^\[ \]\s$/.test(textContent)
            const checkedMatch = /^\[x\]\s$/i.test(textContent)

            if (uncheckedMatch || checkedMatch) {
              const tr = state.tr

              // 找到列表的位置
              const listPos = $from.before(-2)
              const listNode = doc.nodeAt(listPos)

              if (!listNode) return false

              // 找到当前列表项的位置和索引
              const listItemPos = $from.before(-1)
              let currentItemIndex = 0
              let offset = listPos + 1
              listNode.forEach((child, childOffset, index) => {
                if (offset === listItemPos) {
                  currentItemIndex = index
                }
                offset += child.nodeSize
              })

              // 创建任务列表
              const taskListType = schema.nodes.taskList
              const taskItemType = schema.nodes.taskItem

              if (!taskListType || !taskItemType) return false

              // 转换所有列表项为任务项
              const taskItems: ProseMirrorNode[] = []
              listNode.forEach((child, childOffset, index) => {
                // 如果是当前项，需要删除 [ ] 或 [x] 文本
                let taskItemContent
                if (index === currentItemIndex) {
                  // 创建空段落节点作为 taskItem 的内容
                  taskItemContent = schema.nodes.paragraph.create()
                } else {
                  // 保持原有内容，但需要确保是段落节点
                  const firstChild = child.content.firstChild
                  if (firstChild && firstChild.type.name === 'paragraph') {
                    taskItemContent = firstChild
                  } else {
                    // 如果不是段落，包装成段落
                    taskItemContent = schema.nodes.paragraph.create(null, child.content)
                  }
                }

                const checked = checkedMatch
                const taskItem = taskItemType.create({ checked }, taskItemContent)
                taskItems.push(taskItem)
              })

              // 创建新的任务列表
              const taskList = taskListType.create(null, taskItems)

              // 替换原列表
              tr.replaceWith(listPos, listPos + listNode.nodeSize, taskList)

              // 计算新的光标位置（在转换后的任务项内部的段落中）
              let newPos = listPos + 1 // 进入 taskList
              for (let i = 0; i < currentItemIndex; i++) {
                newPos += taskItems[i].nodeSize
              }
              newPos += 2 // 进入当前 taskItem(+1) + 进入段落(+1)

              // 使用 TextSelection 确保光标在正确位置
              const $pos = tr.doc.resolve(newPos)
              tr.setSelection(state.selection.constructor.near($pos))

              dispatch(tr)
              return true
            }

            return false
          },
        },
      }),
    ]
  },
})
