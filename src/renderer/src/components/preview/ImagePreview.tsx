import { useState, useRef, useEffect } from 'react'
import type { JSX } from 'react'

interface ImagePreviewProps {
  src: string // 这里的 src 应该是 tanmark://... 协议的路径
  fileName: string
}

export const ImagePreview = ({ src, fileName }: ImagePreviewProps): JSX.Element => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [initialScale, setInitialScale] = useState(1)
  const dragStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // 计算初始缩放比例，使图片适应容器
  useEffect(() => {
    const img = new Image()
    img.src = src

    img.onload = (): void => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight
      const imgWidth = img.naturalWidth
      const imgHeight = img.naturalHeight

      // 计算适应容器的缩放比例，允许适度放大
      const scaleX = containerWidth / imgWidth
      const scaleY = containerHeight / imgHeight
      const fitScale = Math.min(scaleX, scaleY)
      // 如果图片很小，允许放大到容器的 80%，但不超过原始大小的 2 倍
      const adjustedScale = Math.min(Math.max(fitScale, 0.8), 2)

      setInitialScale(adjustedScale)
      setScale(adjustedScale)
    }
  }, [src])

  // 处理滚轮缩放
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>): void => {
    e.preventDefault()
    // 降低缩放敏感度：每次缩放 5%
    const delta = e.deltaY > 0 ? 0.95 : 1.05
    setScale((prev) => Math.min(Math.max(0.1, prev * delta), 5))
  }

  // 处理拖拽
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    setIsDragging(true)
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      })
    }
  }

  const handleMouseUp = (): void => {
    setIsDragging(false)
  }

  // 双击重置
  const handleDoubleClick = (): void => {
    setScale(initialScale)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden select-none"
      style={{
        backgroundColor: 'var(--color-bg)',
        cursor: scale > initialScale ? (isDragging ? 'grabbing' : 'grab') : 'default'
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      <img
        src={src}
        alt={fileName}
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          maxWidth: scale === initialScale ? '100%' : 'none',
          maxHeight: scale === initialScale ? '100%' : 'none',
          objectFit: 'contain',
          pointerEvents: 'none',
          userSelect: 'none'
        }}
        draggable={false}
      />

      {/* 缩放提示 - 主题风格 */}
      {scale !== initialScale && (
        <div
          className="absolute bottom-6 right-6 px-3 py-1.5 font-mono text-xs pointer-events-none shadow-lg"
          style={{
            backgroundColor: 'var(--color-sidebar-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius)',
            color: 'var(--color-fg)',
            transition:
              'background-color var(--transition-speed) ease, color var(--transition-speed) ease, border-color var(--transition-speed) ease'
          }}
        >
          <span className="font-bold">{Math.round(scale * 100)}%</span>
          <span style={{ margin: '0 0.5rem' }}>•</span>
          <span>双击重置</span>
        </div>
      )}
    </div>
  )
}
