export const LEAD_STATUS = [
  'lead',
  'contacted',
  'responded',
  'interested',
  'offer_sent',
  'customer',
  'no_interest',
  'paused',
] as const

export type LeadStatus = (typeof LEAD_STATUS)[number]

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  lead: 'Lead',
  contacted: 'Kontaktiert',
  responded: 'Reagiert',
  interested: 'Interesse',
  offer_sent: 'Angebot gesendet',
  customer: 'Kunde',
  no_interest: 'Kein Interesse',
  paused: 'Pausiert',
}

export const NOTE_TYPES = [
  'internal',
  'call',
  'visit',
  'email_in',
  'email_out',
  'other',
] as const

export type NoteType = (typeof NOTE_TYPES)[number]

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  internal: 'Intern',
  call: 'Telefonnotiz',
  visit: 'Besuch',
  email_in: 'E-Mail-Eingang',
  email_out: 'E-Mail-Ausgang',
  other: 'Sonstige',
}

export interface Organization {
  id: string
  name: string
  industry: string
  address_street: string
  address_zip: string
  address_city: string
  website: string
  phone: string
  status: LeadStatus
  tags: string
  created: string
  updated: string
}

export interface Contact {
  id: string
  organization: string
  first_name: string
  last_name: string
  role: string
  email: string
  phone: string
  mobile: string
  is_primary: boolean
  created: string
  updated: string
  expand?: {
    organization?: Organization
  }
}

export interface Note {
  id: string
  organization: string
  contact: string
  type: NoteType
  content: string
  noted_at: string
  created_by: string
  created: string
  updated: string
  expand?: {
    organization?: Organization
    contact?: Contact
  }
}
