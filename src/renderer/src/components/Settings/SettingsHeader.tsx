import type { JSX } from 'react'

export interface SettingsHeaderProps {
  title: string
  description: string
}

export function SettingsHeader({ title, description }: SettingsHeaderProps): JSX.Element {
  return (
    <div className="px-8 pt-8 pb-6">
      <h1 className="text-2xl font-semibold text-[var(--color-fg)] mb-2">{title}</h1>
      <p className="text-sm text-[var(--color-fg-secondary)] leading-relaxed">{description}</p>
    </div>
  )
}
