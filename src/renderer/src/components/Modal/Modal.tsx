import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { JSX } from 'react'
import './modal.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  width?: string
  height?: string
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  width = '80vw',
  height = '80vh'
}: ModalProps): JSX.Element | null => {
  const modalRef = useRef<HTMLDivElement>(null)

  // ESC 键关闭
  useEffect((): (() => void) => {
    const handleEsc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // 阻止背景滚动
      document.body.style.overflow = 'hidden'
    }

    return (): void => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // 点击背景关闭
  const handleBackdropClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className="modal-container"
        style={{ width, height }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button className="modal-close-button" onClick={onClose} title="关闭">
              <X size={18} />
            </button>
          </div>
        )}

        {/* 内容区域 */}
        <div className="modal-content">{children}</div>
      </div>
    </div>
  )
}
