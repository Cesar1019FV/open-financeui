import type { SVGProps } from 'react'

export type IconName =
  | 'dashboard' | 'income' | 'expense' | 'balance' | 'debt' | 'loan'
  | 'savings' | 'investment' | 'history' | 'settings' | 'plus' | 'edit'
  | 'trash' | 'close' | 'search' | 'filter' | 'chevron-left' | 'chevron-right'
  | 'chevron-down' | 'sun' | 'moon' | 'system' | 'check' | 'alert' | 'calendar'
  | 'menu' | 'dollar' | 'colon' | 'arrow-up' | 'arrow-down' | 'external'

const paths: Record<IconName, string> = {
  dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  income: 'M12 4v16m0-16l-4 4m4-4l4 4M4 20h16',
  expense: 'M12 20V4m0 16l-4-4m4 4l4-4M4 4h16',
  balance: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 0v18M3 12h18',
  debt: 'M12 1v22M6 7h9a3 3 0 010 6H9a3 3 0 000 6h9M5 5l14 14',
  loan: 'M12 1v22M5 5l14 14M6 11a6 6 0 1112 0 6 6 0 01-12 0z',
  savings: 'M19 5h-2V3H7v2H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2zM9 11a3 3 0 116 0 3 3 0 01-6 0z',
  investment: 'M3 17l6-6 4 4 8-8m0 0v6m0-6h-6',
  history: 'M12 8v5l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zm9-3a9 9 0 01-.18 1.8l2.1 1.6-2 3.4-2.5-1a9 9 0 01-3.1 1.8l-.4 2.6h-4l-.4-2.6a9 9 0 01-3.1-1.8l-2.5 1-2-3.4 2.1-1.6A9 9 0 013 12a9 9 0 01.18-1.8L1.08 8.6l2-3.4 2.5 1a9 9 0 013.1-1.8L9.1 1.8h4l.4 2.6a9 9 0 013.1 1.8l2.5-1 2 3.4-2.1 1.6A9 9 0 0121 12z',
  plus: 'M12 5v14m-7-7h14',
  edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-1.5-9.5a2.1 2.1 0 11-3 3L12 9l-2 5 5-2 6.5-6.5z',
  trash: 'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z',
  close: 'M18 6L6 18M6 6l12 12',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-4.3-4.3',
  filter: 'M3 4h18l-7 8v6l-4 2v-8L3 4z',
  'chevron-left': 'M15 18l-6-6 6-6',
  'chevron-right': 'M9 18l6-6-6-6',
  'chevron-down': 'M6 9l6 6 6-6',
  sun: 'M12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 7a5 5 0 100 10 5 5 0 000-10z',
  moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
  system: 'M4 5h16v12H4zm8 14h.01M2 21h20',
  check: 'M20 6L9 17l-5-5',
  alert: 'M12 9v4m0 4h.01M10.3 3.9l-8.4 14a2 2 0 001.7 3h16.8a2 2 0 001.7-3l-8.4-14a2 2 0 00-3.4 0z',
  calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  menu: 'M3 12h18M3 6h18M3 18h18',
  dollar: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  colon: 'M8 4v16M8 8h4a4 4 0 014 4 4 4 0 01-4 4H8',
  'arrow-up': 'M12 19V5m-7 7l7-7 7 7',
  'arrow-down': 'M12 5v14m-7-7l7 7 7-7',
  external: 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m6-2h6v6m-11 5L21 3',
}

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 20, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  )
}