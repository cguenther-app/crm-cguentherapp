'use client'

import { Document, Page, View, Text, Image, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'
import { AccountingEntry } from '@/types'
import { LOGO_BASE64 } from '@/components/angebote/logo-base64'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

const PRIMARY = '#3D5A80'
const ACCENT = '#F58220'
const BLACK = '#1a1a1a'
const GRAY = '#555555'
const LIGHT_GRAY = '#999999'
const BORDER = '#dddddd'

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: BLACK,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  senderBlock: {
    alignItems: 'flex-end',
    fontSize: 8,
    color: GRAY,
  },
  senderName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: BLACK,
    marginBottom: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: GRAY,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: PRIMARY,
    marginBottom: 6,
    marginTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f4f8',
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  thText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: PRIMARY,
  },
  tdText: { fontSize: 8 },
  tdMuted: { fontSize: 8, color: GRAY },
  colDate: { width: 60 },
  colDesc: { flex: 1, paddingRight: 8 },
  colRef: { width: 80, paddingRight: 8 },
  colAmount: { width: 65, textAlign: 'right' },
  totalBlock: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: PRIMARY,
  },
  totalLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    width: 140,
    textAlign: 'right',
    paddingRight: 8,
  },
  totalValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    width: 65,
    textAlign: 'right',
  },
  summaryBox: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 4,
    padding: 12,
  },
  summaryTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: PRIMARY,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  summaryRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginTop: 2,
  },
  summaryLabel: { fontSize: 9, color: GRAY },
  summaryValue: { fontSize: 9 },
  summaryLabelBold: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BLACK },
  summaryValueBold: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: PRIMARY },
  ustNote: {
    marginTop: 20,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
  },
  ustNoteText: {
    fontSize: 8,
    color: GRAY,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: 6,
    textAlign: 'center',
    fontSize: 7,
    color: LIGHT_GRAY,
  },
})

function fmtDate(d: string) {
  if (!d) return '–'
  const p = d.slice(0, 10).split('-')
  return `${p[2]}.${p[1]}.${p[0]}`
}

function fmtEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' \u20AC'
}

interface Props {
  entries: AccountingEntry[]
  label: string
}

export function EuerPDFDocument({ entries, label }: Props) {
  const income = entries.filter((e) => e.type === 'income')
  const expenses = entries.filter((e) => e.type === 'expense')
  const totalIncome = income.reduce((s, e) => s + e.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const profit = totalIncome - totalExpenses

  const TableSection = ({
    title,
    rows,
    total,
  }: {
    title: string
    rows: AccountingEntry[]
    total: number
  }) => (
    <View>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.tableHeader}>
        <Text style={[s.thText, s.colDate]}>Datum</Text>
        <Text style={[s.thText, s.colDesc]}>Beschreibung</Text>
        <Text style={[s.thText, s.colRef]}>Belegnummer</Text>
        <Text style={[s.thText, s.colAmount]}>Betrag</Text>
      </View>
      {rows.length === 0 ? (
        <View style={s.tableRow}>
          <Text style={[s.tdMuted, { flex: 1 }]}>Keine Einträge</Text>
        </View>
      ) : (
        rows.map((e, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={[s.tdMuted, s.colDate]}>{fmtDate(e.date)}</Text>
            <View style={s.colDesc}>
              <Text style={s.tdText}>{e.description || e.category || '–'}</Text>
              {e.category && e.description ? (
                <Text style={s.tdMuted}>{e.category}</Text>
              ) : null}
            </View>
            <Text style={[s.tdMuted, s.colRef]}>{e.reference_number || '–'}</Text>
            <Text style={[s.tdText, s.colAmount]}>{fmtEuro(e.amount)}</Text>
          </View>
        ))
      )}
      <View style={s.totalBlock}>
        <Text style={s.totalLabel}>Summe {title}:</Text>
        <Text style={s.totalValue}>{fmtEuro(total)}</Text>
      </View>
    </View>
  )

  return (
    <Document title={`EÜR ${label}`}>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <Image src={LOGO_BASE64} style={{ width: 140, height: 45 }} />
          <View style={s.senderBlock}>
            <Text style={s.senderName}>Christian Günther</Text>
            <Text>Neyetal 15, 51688 Wipperfürth</Text>
            <Text>+49 163 3463676</Text>
            <Text>hallo@cguenther.app</Text>
          </View>
        </View>

        <Text style={s.title}>Einnahmenüberschussrechnung {label}</Text>
        <Text style={s.subtitle}>
          Kleinunternehmer gem. §19 UStG
        </Text>

        {/* Income table */}
        <TableSection title="Einnahmen" rows={income} total={totalIncome} />

        {/* Expense table */}
        <TableSection title="Ausgaben" rows={expenses} total={totalExpenses} />

        {/* Profit summary */}
        <View style={s.summaryBox}>
          <Text style={s.summaryTitle}>Gewinnermittlung</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Einnahmen gesamt</Text>
            <Text style={s.summaryValue}>{fmtEuro(totalIncome)}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Ausgaben gesamt</Text>
            <Text style={s.summaryValue}>− {fmtEuro(totalExpenses)}</Text>
          </View>
          <View style={s.summaryRowFinal}>
            <Text style={s.summaryLabelBold}>Gewinn / Verlust</Text>
            <Text style={[s.summaryValueBold, { color: profit >= 0 ? PRIMARY : '#C0532A' }]}>
              {fmtEuro(profit)}
            </Text>
          </View>
        </View>

        {/* §19 UStG note */}
        <View style={s.ustNote}>
          <Text style={s.ustNoteText}>
            Hinweis: Kleinunternehmer gem. §19 UStG – alle Beträge sind Nettobeträge (keine
            Umsatzsteuer ausgewiesen). Diese Aufstellung dient als Grundlage für die
            Einkommensteuererklärung / Anlage EÜR.
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>
            Christian Günther  •  IBAN: DE94 3705 0299 1321 0040 85  •  www.cguenther.app
          </Text>
        </View>

      </Page>
    </Document>
  )
}

export function EuerPDFButton({ entries, label }: { entries: AccountingEntry[]; label: string }) {
  return (
    <PDFDownloadLink
      document={<EuerPDFDocument entries={entries} label={label} />}
      fileName={`EUeR_${label.replace(/[\s/]/g, '_')}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          <Download className="h-4 w-4 mr-1" />
          {loading ? 'PDF...' : 'EÜR-PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
