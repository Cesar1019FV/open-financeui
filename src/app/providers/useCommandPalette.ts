import { createContext, useContext } from 'react'

export interface CommandAction {
  id: string
  label: string
  hint?: string
  run: () => void
}

export interface CommandPaletteContextValue {
  open: () => void
  close: () => void
  register: (actions: CommandAction[]) => void
}

export const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext)
  if (!ctx) throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  return ctx
}