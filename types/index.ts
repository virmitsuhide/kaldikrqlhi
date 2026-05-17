export type Unit = 'NASIONAL' | 'SD' | 'SMP' | 'RQ'
export type EventType = 'libur_nasional' | 'libur_semester' | 'ramadhan' | 'agenda' | 'kegiatan_bersama'
export type UnitFilter = 'SEMUA' | 'SD' | 'SMP' | 'RQ' | 'SD+RQ' | 'SMP+RQ' | 'SD+SMP'
export type UserRole = 'admin' | 'guru'

export interface KaldikEvent {
  id: string
  date: string          // 'YYYY-MM-DD'
  title: string
  description?: string
  unit: Unit
  type: EventType
  color: string
  year: number
  created_by?: string
  created_at?: string
}

export interface Profile {
  id: string
  name: string
  role: UserRole
  unit: string
}

export const UNIT_COLORS: Record<Unit, string> = {
  NASIONAL : '#EF4444',
  SD       : '#F59E0B',
  SMP      : '#3B82F6',
  RQ       : '#10B981',
}

export const TYPE_COLORS: Record<EventType, string> = {
  libur_nasional   : '#EF4444',
  libur_semester   : '#DC2626',
  ramadhan         : '#F97316',
  agenda           : '#3B82F6',
  kegiatan_bersama : '#8B5CF6',
}

export const FILTER_OPTIONS: { label: string; value: UnitFilter }[] = [
  { label: 'Semua',   value: 'SEMUA'   },
  { label: 'SDIT',    value: 'SD'      },
  { label: 'SMPIT',   value: 'SMP'     },
  { label: 'RQ',      value: 'RQ'      },
  { label: 'SD + RQ', value: 'SD+RQ'  },
  { label: 'SMP + RQ',value: 'SMP+RQ' },
  { label: 'SD + SMP',value: 'SD+SMP' },
]

export function filterEvents(events: KaldikEvent[], filter: UnitFilter): KaldikEvent[] {
  if (filter === 'SEMUA') return events
  const units: Unit[] = ['NASIONAL', ...filter.split('+') as Unit[]]
  return events.filter(e => units.includes(e.unit))
}

export const MONTHS_ID = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
]

export const DAYS_ID = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']
