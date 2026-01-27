import { useEffect } from 'react'
import type { JSX } from 'react'

interface ConfirmDialogProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  title,
  message,
  onConfirm,
  onCancel
}: ConfirmDialogProps): JSX.Element => {
  useEffect((): (() => void) => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return (): void => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3 className="dialog-title">{title}</h3>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            删除
          </button>
        </div>
      </div>
    </div>
  )
}
