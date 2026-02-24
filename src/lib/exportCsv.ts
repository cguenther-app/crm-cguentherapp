import { AccountingEntry, ENTRY_TYPE_LABELS } from '@/types'

export function downloadCsv(entries: AccountingEntry[], label: string): void {
  const header = ['Datum', 'Typ', 'Betrag (€)', 'Kategorie', 'Beschreibung', 'Belegnummer', 'Notiz']

  const rows = entries.map((e) => [
    e.date,
    ENTRY_TYPE_LABELS[e.type] ?? e.type,
    e.amount.toFixed(2).replace('.', ','),
    e.category ?? '',
    e.description ?? '',
    e.reference_number ?? '',
    e.notes ?? '',
  ])

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const csvContent = [header, ...rows]
    .map((row) => row.map(escape).join(';'))
    .join('\r\n')

  const bom = '\uFEFF' // UTF-8 BOM for Excel
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `EUeR_${label.replace(/[\s/]/g, '_')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
