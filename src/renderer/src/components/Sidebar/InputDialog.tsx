import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

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

    return (): void => undefined
  }, [onCancel])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (value.trim()) {
      onConfirm(value.trim())
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (!open ? onCancel() : undefined)}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit" disabled={!value.trim()}>
              确定
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
