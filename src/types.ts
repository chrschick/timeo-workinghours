// ============ DATA MODELS ============

export interface Stats {
  arbeitstage: number
  krank: number
  kindkrank: number
  urlaub: number
  feiertag: number
  sollStunden: number
  istStunden: number
  differenz: number
  durchschnitt: number
}

export interface Day {
  id?: number
  monthId: number
  yearId: number
  year: number
  month: number
  day: number
  date: string
  dayOfWeek: number
  isWeekend: boolean
  isoWeek: number
  von: string
  bis: string
  von2: string
  bis2: string
  pause: string
  code: 'K' | 'KK' | 'U' | 'FT' | ''
  comment: string
  sollStunden: number
  istStunden: number
}

export interface Month {
  id?: number
  yearId: number
  year: number
  month: number
  stats?: Stats
}

export interface Year {
  id?: number
  year: number
  stats?: Stats
}

export interface DayCode {
  K: 'Krank'
  KK: 'Kind krank'
  U: 'Urlaub'
  FT: 'Feiertag'
}

// ============ COMPONENT PROPS ============

export interface SaveIndicatorProps {
  show: boolean
}

export interface KPIGridProps {
  stats: Stats
}

export interface YearListViewProps {
  onSelectYear: (year: Year & { stats: Stats }) => void
}

export interface YearViewProps {
  year: Year & { stats: Stats }
  onSelectMonth: (month: Month & { stats: Stats }) => void
  onBack: () => void
}

export interface MonthViewProps {
  month: Month
  year: Year
  onBack: () => void
}

export interface CodeSelectorProps {
  day: Day
  onApply: (code: Day['code']) => void
  onClear: () => void
}

export interface MonthCardProps {
  month: Month
  onClick: () => void
}
