import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'

interface InputDialogProps {
  title: string
  placeholder: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export const InputDialog = ({
  title,
  placeholder,
  onConfirm,
  onCancel
}: InputDialogProps): JSX.Element => {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect((): (() => void) => {
    // 自动聚焦输入框
    inputRef.current?.focus()

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return (): void => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (value.trim()) {
      onConfirm(value.trim())
    }
  }

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3 className="dialog-title">{title}</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="input dialog-input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="btn btn-primary" disabled={!value.trim()}>
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
