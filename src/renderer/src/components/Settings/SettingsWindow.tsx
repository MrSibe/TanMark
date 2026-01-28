import { SettingsDialog } from './SettingsDialog'
import type { JSX } from 'react'

interface SettingsWindowProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: string
}

export const SettingsWindow = ({
  isOpen,
  onClose,
  defaultTab
}: SettingsWindowProps): JSX.Element => {
  return <SettingsDialog open={isOpen} onOpenChange={onClose} defaultTab={defaultTab} />
}
