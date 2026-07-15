export interface CsvColumn<T> {
  header: string
  accessor: (row: T) => string | number
}

export function arrayToCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const escape = (value: string | number): string => {
    const str = String(value)
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
    return str
  }
  const headerLine = columns.map((c) => escape(c.header)).join(',')
  const dataLines = rows.map((row) => columns.map((c) => escape(c.accessor(row))).join(','))
  return [headerLine, ...dataLines].join('\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}