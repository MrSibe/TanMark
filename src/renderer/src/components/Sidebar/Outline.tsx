import type { JSX } from 'react'
import { useMemo, useRef, useLayoutEffect, useState } from 'react'
import { TextSelection } from '@tiptap/pm/state'
import { useEditorStore } from '../../stores/useEditorStore'

interface OutlineItem {
  level: number
  text: string
  index: number
  pos: number
}

const parseOutline = (content: string): OutlineItem[] => {
  const items: OutlineItem[] = []
  const lines = content.split('\n')
  let inCodeBlock = false
  let index = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) {
      continue
    }

    const match = /^(#{1,6})\s+(.*)$/.exec(trimmed)
    if (match) {
      items.push({
        level: match[1].length,
        text: match[2].trim(),
        index,
        pos: 0
      })
      index += 1
    }
  }

  return items
}

const getTextWidth = (text: string, font: string): number => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) {
    return text.length * 8
  }
  context.font = font
  return context.measureText(text).width
}

const truncateToWidth = (text: string, width: number, font: string): string => {
  if (width <= 0 || !text) {
    return ''
  }

  if (getTextWidth(text, font) <= width) {
    return text
  }

  const ellipsis = '...'
  const ellipsisWidth = getTextWidth(ellipsis, font)
  if (ellipsisWidth >= width) {
    return ellipsis
  }

  let low = 2
  let high = text.length
  let best = ellipsis

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const frontChars = Math.ceil(mid * 0.6)
    const backChars = Math.max(mid - frontChars, 1)
    const candidate = `${text.slice(0, frontChars)}${ellipsis}${text.slice(-backChars)}`

    if (getTextWidth(candidate, font) <= width) {
      best = candidate
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return best
}

const smoothScrollTo = (element: HTMLElement, top: number, onDone?: () => void): void => {
  const startTop = element.scrollTop
  const distance = top - startTop
  if (Math.abs(distance) < 1) {
    if (onDone) {
      onDone()
    }
    return
  }

  const duration = 500
  const startTime = performance.now()

  const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t)

  const step = (now: number) => {
    const elapsed = now - startTime
    const progress = Math.min(1, elapsed / duration)
    const eased = easeOutQuad(progress)
    element.scrollTop = startTop + distance * eased
    if (progress < 1) {
      requestAnimationFrame(step)
      return
    }
    if (onDone) {
      onDone()
    }
  }

  requestAnimationFrame(step)
}

export const Outline = (): JSX.Element => {
  const { content, editor } = useEditorStore()
  const listRef = useRef<HTMLDivElement | null>(null)
  const [listWidth, setListWidth] = useState(0)
  const [indentStepPx, setIndentStepPx] = useState(12)
  const [itemPaddingXPx, setItemPaddingXPx] = useState(8)

  useLayoutEffect(() => {
    const element = listRef.current
    if (!element) {
      return
    }

    const toPx = (value: string): number => {
      if (!value) {
        return 0
      }

      if (value.trim().endsWith('px')) {
        return Number.parseFloat(value)
      }

      const probe = document.createElement('div')
      probe.style.width = value
      probe.style.position = 'absolute'
      probe.style.visibility = 'hidden'
      probe.style.pointerEvents = 'none'
      element.appendChild(probe)
      const pixels = probe.getBoundingClientRect().width
      element.removeChild(probe)
      return pixels
    }

    const updateWidth = () => {
      setListWidth(element.clientWidth)
      const styles = window.getComputedStyle(element)
      setIndentStepPx(toPx(styles.getPropertyValue('--outline-indent-step')))
      setItemPaddingXPx(toPx(styles.getPropertyValue('--outline-item-padding-x')))
    }

    updateWidth()

    const observer = new ResizeObserver(() => updateWidth())
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const font = listRef.current ? window.getComputedStyle(listRef.current).font : '13px sans-serif'

  const items = useMemo(() => {
    if (editor) {
      const outline: OutlineItem[] = []
      let index = 0
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name !== 'heading') {
          return true
        }

        const text = node.textContent.trim()
        if (!text) {
          return true
        }

        outline.push({
          level: node.attrs.level ?? 1,
          text,
          index,
          pos
        })
        index += 1
        return true
      })
      return outline
    }

    return parseOutline(content)
  }, [content, editor])

  const handleJump = (pos: number): void => {
    if (!editor) {
      return
    }

    const resolvedPos = Math.min(pos + 1, editor.state.doc.content.size)
    requestAnimationFrame(() => {
      const domResult = editor.view.domAtPos(resolvedPos)
      const domNode =
        domResult.node.nodeType === Node.TEXT_NODE ? domResult.node.parentNode : domResult.node
      const element =
        domNode instanceof HTMLElement ? domNode.closest('h1,h2,h3,h4,h5,h6') || domNode : null
      const container = editor.view.dom.closest('.tanmark-editor-container') as HTMLElement | null
      if (!element || !container) {
        return
      }

      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const offset = elementRect.top - containerRect.top
      const maxTop = container.scrollHeight - container.clientHeight
      const targetTop = Math.max(0, Math.min(container.scrollTop + offset - 8, maxTop))
      smoothScrollTo(container, targetTop, () => {
        const tr = editor.state.tr
          .setSelection(TextSelection.create(editor.state.doc, resolvedPos))
          .setMeta('scrollIntoView', false)
        editor.view.dispatch(tr)
        editor.commands.focus()
      })
    })
  }

  if (items.length === 0) {
    return <div className="outline-empty">暂无大纲</div>
  }

  return (
    <div className="outline-list" ref={listRef}>
      {items.map((item) => (
        <div
          key={`${item.level}-${item.index}-${item.text}`}
          className="outline-item"
          style={{
            paddingLeft: `calc(var(--outline-indent-step) * ${item.level - 1} + var(--outline-item-padding-x))`
          }}
          onClick={() => handleJump(item.pos)}
          role="button"
          tabIndex={0}
          title={item.text}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleJump(item.pos)
            }
          }}
        >
          <span className="outline-item-text" title={item.text}>
            {truncateToWidth(
              item.text,
              listWidth - (item.level - 1) * indentStepPx - itemPaddingXPx * 2,
              font
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
