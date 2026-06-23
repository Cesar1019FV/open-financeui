import { type ReactNode } from 'react'

import { ThemeProvider } from './ThemeProvider'
import { LocaleProvider } from './LocaleProvider'
import { CurrencyProvider } from './CurrencyProvider'
import { ToastProvider } from './ToastProvider'
import { CommandPaletteProvider } from './CommandPaletteProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <CurrencyProvider>
          <ToastProvider>
            <CommandPaletteProvider>{children}</CommandPaletteProvider>
          </ToastProvider>
        </CurrencyProvider>
      </LocaleProvider>
    </ThemeProvider>
  )
}