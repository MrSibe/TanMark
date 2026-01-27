import { useFileStore } from '../../stores/useFileStore'
import { Settings } from 'lucide-react'
import type { JSX } from 'react'

interface TitlebarProps {
  position: 'left' | 'right'
  onSettingsClick?: () => void
}

export const Titlebar = ({ position, onSettingsClick }: TitlebarProps): JSX.Element => {
  const { currentFile, isModified } = useFileStore()

  if (position === 'left') {
    return <div className="titlebar" />
  }

  return (
    <div className="titlebar">
      <div className="titlebar-title">
        {currentFile ? currentFile.name : 'TanMark'}
        {isModified && ' •'}
      </div>
      {onSettingsClick && (
        <button className="titlebar-settings-button" onClick={onSettingsClick} title="设置">
          <Settings size={16} />
        </button>
      )}
    </div>
  )
}
