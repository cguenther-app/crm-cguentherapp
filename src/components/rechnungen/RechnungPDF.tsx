'use client'

import { Document, Page, View, Text, Image, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'
import { Invoice } from '@/types'
import { LOGO_BASE64 } from '../angebote/logo-base64'
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

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  logoText: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: PRIMARY,
  },
  logoSub: {
    fontSize: 8,
    color: ACCENT,
    marginTop: 1,
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

  /* ── Address + Meta row ── */
  addressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  addressBlock: {},
  addressLabel: {
    fontSize: 7,
    color: LIGHT_GRAY,
    marginBottom: 4,
  },
  addressName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 9,
    color: GRAY,
    marginBottom: 1,
  },
  metaBlock: {
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    paddingLeft: 10,
    paddingVertical: 4,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  metaLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    width: 65,
  },
  metaValue: {
    fontSize: 8,
    color: BLACK,
  },

  /* ── Subject ── */
  subject: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    marginBottom: 10,
  },

  /* ── Salutation ── */
  bodyText: {
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 14,
  },

  /* ── Table ── */
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f4f8',
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  colPos:       { width: 28, textAlign: 'center' },
  colDesc:      { flex: 1, paddingRight: 8 },
  colQty:       { width: 55, textAlign: 'right', paddingRight: 8 },
  colUnitPrice: { width: 65, textAlign: 'right', paddingRight: 8 },
  colTotal:     { width: 65, textAlign: 'right' },
  thText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: PRIMARY,
  },
  tdText: {
    fontSize: 9,
  },
  tdBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  tdMuted: {
    fontSize: 8,
    color: GRAY,
  },

  /* ── Totals ── */
  totalsBlock: {
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  totalRowBold: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY,
  },
  totalLabel: {
    fontSize: 9,
    width: 200,
    textAlign: 'right',
    paddingRight: 8,
  },
  totalLabelBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    width: 200,
    textAlign: 'right',
    paddingRight: 8,
  },
  totalValue: {
    fontSize: 9,
    width: 65,
    textAlign: 'right',
  },
  totalValueBold: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    width: 65,
    textAlign: 'right',
  },

  /* ── Konditionen ── */
  konditionenSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  konditionenTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  konditionenBox: {
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    paddingLeft: 10,
    paddingVertical: 4,
  },
  konditionenRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  konditionenLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
  },
  konditionenValue: {
    fontSize: 8,
    color: GRAY,
  },

  /* ── Closing ── */
  closing: {
    marginTop: 20,
    fontSize: 9,
    lineHeight: 1.5,
  },

  /* ── Footer ── */
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
  rechnung: Invoice
}

export function RechnungPDFDocument({ rechnung }: Props) {
  const org = rechnung.expand?.organization
  const contact = rechnung.expand?.contact
  const positions = rechnung.positions ?? []
  const total = rechnung.total ?? 0

  const contactName = contact
    ? `${contact.first_name} ${contact.last_name}`
    : ''

  return (
    <Document title={`Rechnung ${rechnung.number}`}>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Image src={LOGO_BASE64} style={{ width: 160, height: 51 }} />
          <View style={s.senderBlock}>
            <Text style={s.senderName}>Christian Günther</Text>
            <Text>Neyetal 15</Text>
            <Text>51688 Wipperfürth</Text>
            <Text>+49 163 3463676</Text>
            <Text>hallo@cguenther.app</Text>
          </View>
        </View>

        {/* ── Address + Meta ── */}
        <View style={s.addressMetaRow}>
          <View style={s.addressBlock}>
            <Text style={s.addressLabel}>Rechnung an:</Text>
            {org ? (
              <>
                <Text style={s.addressName}>{org.name}</Text>
                {contactName ? <Text style={s.addressLine}>{contactName}</Text> : null}
                {org.address_street ? <Text style={s.addressLine}>{org.address_street}</Text> : null}
                {(org.address_zip || org.address_city) ? (
                  <Text style={s.addressLine}>{org.address_zip} {org.address_city}</Text>
                ) : null}
                {(contact?.email || org.phone) ? (
                  <Text style={s.addressLine}>{contact?.email || org.phone}</Text>
                ) : null}
              </>
            ) : (
              <Text style={s.addressName}>–</Text>
            )}
          </View>

          <View style={s.metaBlock}>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Rechnungsnr.:</Text>
              <Text style={s.metaValue}>{rechnung.number}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Datum:</Text>
              <Text style={s.metaValue}>{fmtDate(rechnung.date)}</Text>
            </View>
            {rechnung.due_date ? (
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>Fällig am:</Text>
                <Text style={s.metaValue}>{fmtDate(rechnung.due_date)}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Subject ── */}
        <Text style={s.subject}>Rechnung: {rechnung.title}</Text>

        {/* ── Salutation ── */}
        <Text style={s.bodyText}>
          {contactName
            ? `Sehr geehrte/r ${contactName},`
            : 'Sehr geehrte Damen und Herren,'}
        </Text>
        <Text style={s.bodyText}>
          hiermit stelle ich Ihnen folgendes in Rechnung:
        </Text>

        {/* ── Positions table ── */}
        <View style={s.tableHeader}>
          <Text style={[s.thText, s.colPos]}>Pos.</Text>
          <Text style={[s.thText, s.colDesc]}>Beschreibung</Text>
          <Text style={[s.thText, s.colQty]}>Menge</Text>
          <Text style={[s.thText, s.colUnitPrice]}>Einzelpreis</Text>
          <Text style={[s.thText, s.colTotal]}>Gesamt</Text>
        </View>
        {positions.map((pos, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={[s.tdMuted, s.colPos]}>{i + 1}</Text>
            <View style={s.colDesc}>
              <Text style={s.tdBold}>{pos.title}</Text>
            </View>
            <Text style={[s.tdText, s.colQty]}>
              {pos.qty} {pos.unit}
            </Text>
            <Text style={[s.tdText, s.colUnitPrice]}>{fmtEuro(pos.unit_price)}</Text>
            <Text style={[s.tdText, s.colTotal]}>{fmtEuro(pos.total)}</Text>
          </View>
        ))}

        {/* ── Totals ── */}
        <View style={s.totalsBlock}>
          <View style={s.totalRowBold}>
            <Text style={s.totalLabelBold}>Gesamtbetrag:</Text>
            <Text style={s.totalValueBold}>{fmtEuro(total)}</Text>
          </View>
        </View>

        {/* ── Konditionen ── */}
        <View style={s.konditionenSection}>
          <Text style={s.konditionenTitle}>Zahlungsbedingungen &amp; Hinweise</Text>
          <View style={s.konditionenBox}>
            {rechnung.due_date ? (
              <View style={s.konditionenRow}>
                <Text style={s.konditionenLabel}>Fälligkeitsdatum: </Text>
                <Text style={s.konditionenValue}>Bitte überweisen Sie den Betrag bis zum {fmtDate(rechnung.due_date)}.</Text>
              </View>
            ) : null}
            <View style={s.konditionenRow}>
              <Text style={s.konditionenLabel}>Bankverbindung: </Text>
              <Text style={s.konditionenValue}>IBAN: DE94 3705 0299 1321 0040 85</Text>
            </View>
            <View style={s.konditionenRow}>
              <Text style={s.konditionenLabel}>Hinweis: </Text>
              <Text style={s.konditionenValue}>Kleinunternehmer gem. §19 UStG – es wird keine Umsatzsteuer ausgewiesen.</Text>
            </View>
          </View>
        </View>

        {/* ── Closing ── */}
        <View style={s.closing}>
          <Text>Vielen Dank für Ihr Vertrauen. Bei Fragen stehe ich Ihnen gerne zur Verfügung.</Text>
          <Text style={{ marginTop: 16 }}>Mit freundlichen Grüßen</Text>
          <Text style={{ fontFamily: 'Helvetica-Bold', marginTop: 2 }}>Christian Günther</Text>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text>
            Christian Günther  •  IBAN: DE94 3705 0299 1321 0040 85  •  www.cguenther.app
          </Text>
        </View>

      </Page>
    </Document>
  )
}

export function RechnungPDFButton({ rechnung }: { rechnung: Invoice }) {
  const filename = `Rechnung_${rechnung.number.replace(/\s+/g, '_')}.pdf`

  return (
    <PDFDownloadLink
      document={<RechnungPDFDocument rechnung={rechnung} />}
      fileName={filename}
    >
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          <Download className="h-4 w-4 mr-1" />
          {loading ? 'PDF...' : 'PDF herunterladen'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
