// TimeCal Main Application
import React, { useCallback, useEffect, useRef, useState } from 'react'
import CalendarIcon from './assets/calendar.svg'
import ClockIcon from './assets/clock.svg'
import DarkmodeIcon from './assets/darkmode.svg'
import HomeIcon from './assets/home.svg'
import RestoreIcon from './assets/restore.svg'
import SaveIcon from './assets/save.svg'
import SunIcon from './assets/sun.svg'
import { TimeCalDB } from './db'
import './styles.css'
import type {
  Day,
  KPIGridProps,
  Month,
  MonthViewProps,
  SaveIndicatorProps,
  Stats,
  Year,
  YearListViewProps,
  YearViewProps,
} from './types'

// ============ UTILITY FUNCTIONS ============
const formatHours = (hours: number): string => {
  if (hours === null || hours === undefined || isNaN(hours)) return '0,00'
  return hours.toFixed(2).replace('.', ',')
}

const getDiffClass = (diff: number): string => {
  if (diff > 0.01) return 'diff-positive'
  if (diff < -0.01) return 'diff-negative'
  return 'diff-neutral'
}

const getRowClass = (day: Day): string => {
  if (day.code === 'FT') return 'feiertag'
  if (day.code === 'U') return 'urlaub'
  if (day.code === 'K') return 'krank'
  if (day.code === 'KK') return 'kindkrank'
  if (day.isWeekend) return 'weekend'
  return ''
}

const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
]
const DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

// ============ TIME INPUT WITH ICON ============
interface TimeInputFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const TimeInputField: React.FC<TimeInputFieldProps> = ({
  value,
  onChange,
  disabled,
}) => (
  <div className='time-input-group'>
    <input
      type='time'
      className='time-input'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  </div>
)

// ============ DEBOUNCE HOOK ============
const useDebounce = <T extends (...args: any[]) => Promise<void>>(
  callback: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay],
  )
}

// ============ SAVE INDICATOR ============
const SaveIndicator: React.FC<SaveIndicatorProps> = ({ show }) => {
  if (!show) return null
  return (
    <div className='save-indicator'>
      <img src={SaveIcon} alt='Gespeichert' className='svg-icon svg-icon-sm' />
      Gespeichert
    </div>
  )
}

// ============ KPI DISPLAY ============
const KPIGrid: React.FC<KPIGridProps> = ({ stats }) => (
  <div className='kpi-grid'>
    <div className='kpi-item'>
      <div className='kpi-value'>{stats.arbeitstage}</div>
      <div className='kpi-label'>Arbeitstage</div>
    </div>
    <div className='kpi-item'>
      <div className='kpi-value'>{stats.krank}</div>
      <div className='kpi-label'>Krank (K)</div>
    </div>
    <div className='kpi-item'>
      <div className='kpi-value'>{stats.kindkrank}</div>
      <div className='kpi-label'>Kind krank (KK)</div>
    </div>
    <div className='kpi-item'>
      <div className='kpi-value'>{stats.urlaub}</div>
      <div className='kpi-label'>Urlaub (U)</div>
    </div>
    <div className='kpi-item'>
      <div className='kpi-value'>{stats.feiertag}</div>
      <div className='kpi-label'>Feiertag (FT)</div>
    </div>
    <div className='kpi-item'>
      <div className='kpi-value'>{formatHours(stats.sollStunden)}</div>
      <div className='kpi-label'>Soll-Stunden</div>
    </div>
    <div className='kpi-item'>
      <div className='kpi-value'>{formatHours(stats.istStunden)}</div>
      <div className='kpi-label'>Ist-Stunden</div>
    </div>
    <div className='kpi-item'>
      <div className={`kpi-value ${getDiffClass(stats.differenz)}`}>
        {stats.differenz > 0 ? '+' : ''}
        {formatHours(stats.differenz)}
      </div>
      <div className='kpi-label'>Differenz</div>
    </div>
    <div className='kpi-item'>
      <div className='kpi-value'>{formatHours(stats.durchschnitt)}</div>
      <div className='kpi-label'>Ø pro Tag</div>
    </div>
  </div>
)

// ============ YEAR LIST VIEW ============
const YearListView: React.FC<YearListViewProps> = ({ onSelectYear }) => {
  const [years, setYears] = useState<(Year & { stats: Stats })[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    loadYears()
  }, [])

  const loadYears = async () => {
    setLoading(true)
    const data = await TimeCalDB.getAllYears()
    setYears(data)
    setLoading(false)
  }

  const handleCreateYear = async () => {
    try {
      await TimeCalDB.createYear(newYear)
      await TimeCalDB.syncToSQLite()
      setShowModal(false)
      loadYears()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Fehler')
    }
  }

  const handleDeleteYear = async (e: React.MouseEvent, yearId: number) => {
    e.stopPropagation()
    if (confirm('Jahr wirklich löschen? Alle Daten gehen verloren!')) {
      await TimeCalDB.deleteYear(yearId)
      await TimeCalDB.syncToSQLite()
      loadYears()
    }
  }

  const handleExportBackup = async () => {
    await TimeCalDB.initSQLite()
    await TimeCalDB.exportSQLiteFile()
  }

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    TimeCalDB.initSQLite().then(async () => {
      const success = await TimeCalDB.importSQLiteFile(file)
      if (success) {
        alert('Backup erfolgreich importiert!')
        loadYears()
      } else {
        alert('Fehler beim Importieren des Backups')
      }
    })
  }

  if (loading) {
    return (
      <div className='loading'>
        <div className='spinner'></div>
        Lade Jahre...
      </div>
    )
  }

  return (
    <div>
      <div className='card'>
        <div className='card-header'>
          <h2 className='card-title'>
            <img
              src={CalendarIcon}
              alt='Jahresübersicht'
              className='svg-icon svg-icon-md'
            />
            Jahresübersicht
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className='btn btn-primary'
              onClick={() => setShowModal(true)}
            >
              + Neues Jahr anlegen
            </button>
            <button
              className='btn btn-outline'
              onClick={handleExportBackup}
              title='SQLite Backup exportieren'
            >
              <img
                src={SaveIcon}
                alt='Backup'
                className='svg-icon svg-icon-sm'
              />
              Backup
            </button>
            <label
              className='btn btn-outline'
              style={{ cursor: 'pointer', margin: 0 }}
            >
              <img
                src={RestoreIcon}
                alt='Restore'
                className='svg-icon svg-icon-sm'
              />
              Restore
              <input
                type='file'
                accept='.sqlite'
                onChange={handleImportBackup}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {years.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Noch keine Jahre angelegt.</p>
            <p>Klicke auf "Neues Jahr anlegen" um zu starten.</p>
          </div>
        ) : (
          <div className='year-list'>
            {years.map((year) => (
              <div
                key={year.id}
                className='year-item'
                onClick={() => onSelectYear(year)}
              >
                <div className='year-name'>{year.year}</div>
                <div className='year-stats'>
                  <div className='year-stat'>
                    <span className='year-stat-value'>
                      {year.stats.arbeitstage}
                    </span>
                    <span className='year-stat-label'>Arbeitstage</span>
                  </div>
                  <div className='year-stat'>
                    <span className='year-stat-value'>{year.stats.krank}</span>
                    <span className='year-stat-label'>Krank</span>
                  </div>
                  <div className='year-stat'>
                    <span className='year-stat-value'>{year.stats.urlaub}</span>
                    <span className='year-stat-label'>Urlaub</span>
                  </div>
                  <div className='year-stat'>
                    <span className='year-stat-value'>
                      {formatHours(year.stats.sollStunden)}
                    </span>
                    <span className='year-stat-label'>Soll</span>
                  </div>
                  <div className='year-stat'>
                    <span className='year-stat-value'>
                      {formatHours(year.stats.istStunden)}
                    </span>
                    <span className='year-stat-label'>Ist</span>
                  </div>
                  <div className='year-stat'>
                    <span
                      className={`year-stat-value ${getDiffClass(year.stats.differenz)}`}
                    >
                      {year.stats.differenz > 0 ? '+' : ''}
                      {formatHours(year.stats.differenz)}
                    </span>
                    <span className='year-stat-label'>Differenz</span>
                  </div>
                </div>
                <button
                  className='btn btn-danger btn-sm'
                  onClick={(e) => handleDeleteYear(e, year.id || 0)}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className='modal-overlay' onClick={() => setShowModal(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <h2>Neues Jahr anlegen</h2>
            <input
              type='number'
              value={newYear}
              onChange={(e) => setNewYear(parseInt(e.target.value))}
              min='2000'
              max='2100'
              style={{ width: '100%', marginTop: '10px' }}
            />
            <div className='modal-actions'>
              <button
                className='btn btn-outline'
                onClick={() => setShowModal(false)}
              >
                Abbrechen
              </button>
              <button className='btn btn-primary' onClick={handleCreateYear}>
                Anlegen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ YEAR VIEW (MONTH GRID) ============
const YearView: React.FC<YearViewProps> = ({ year, onSelectMonth }) => {
  const [months, setMonths] = useState<(Month & { stats: Stats })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMonths()
  }, [year.id])

  const loadMonths = async () => {
    setLoading(true)
    const data = await TimeCalDB.getMonthsForYear(year.id || 0)
    setMonths(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className='loading'>
        <div className='spinner'></div>
        Lade Monate...
      </div>
    )
  }

  // Calculate year stats
  const yearStats: Stats = months.reduce((acc: Partial<Stats>, m) => {
    acc.arbeitstage = (acc.arbeitstage || 0) + m.stats.arbeitstage
    acc.krank = (acc.krank || 0) + m.stats.krank
    acc.kindkrank = (acc.kindkrank || 0) + m.stats.kindkrank
    acc.urlaub = (acc.urlaub || 0) + m.stats.urlaub
    acc.feiertag = (acc.feiertag || 0) + m.stats.feiertag
    acc.sollStunden = (acc.sollStunden || 0) + m.stats.sollStunden
    acc.istStunden = (acc.istStunden || 0) + m.stats.istStunden
    return acc
  }, {} as Partial<Stats>) as Stats

  yearStats.differenz = yearStats.istStunden - yearStats.sollStunden
  yearStats.durchschnitt =
    yearStats.arbeitstage > 0 ? yearStats.istStunden / yearStats.arbeitstage : 0

  return (
    <div>
      <div className='card'>
        <div className='card-header'>
          <h2 className='card-title'>📆 Jahr {year.year}</h2>
        </div>
        <KPIGrid stats={yearStats} />
      </div>

      <div className='card'>
        <div className='card-header'>
          <h2 className='card-title'>Monate</h2>
        </div>
        <div className='month-grid'>
          {months.map((month) => (
            <div
              key={month.id}
              className='month-card'
              onClick={() => onSelectMonth(month)}
            >
              <div className='month-card-header'>
                <span className='month-name'>
                  {MONTH_NAMES[month.month - 1]}
                </span>
              </div>
              <div className='month-stats'>
                <div className='month-stat'>
                  <span>Soll:</span>
                  <span>{formatHours(month.stats.sollStunden)}h</span>
                </div>
                <div className='month-stat'>
                  <span>Ist:</span>
                  <span>{formatHours(month.stats.istStunden)}h</span>
                </div>
                <div className='month-stat'>
                  <span>Diff:</span>
                  <span className={getDiffClass(month.stats.differenz)}>
                    {month.stats.differenz > 0 ? '+' : ''}
                    {formatHours(month.stats.differenz)}h
                  </span>
                </div>
                <div className='month-stat'>
                  <span>K/U/FT:</span>
                  <span>
                    {month.stats.krank}/{month.stats.urlaub}/
                    {month.stats.feiertag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ MONTH VIEW (DAY LIST) ============
const MonthView: React.FC<MonthViewProps> = ({ month, year }) => {
  const [days, setDays] = useState<Day[]>([])
  const [loading, setLoading] = useState(true)
  const [showSave, setShowSave] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    loadDays()
  }, [month.id])

  const loadDays = async () => {
    setLoading(true)
    const data = await TimeCalDB.getDaysForMonth(month.id || 0)
    setDays(data)
    setStats(TimeCalDB.calculateStats(data))
    setLoading(false)
  }

  const saveDay = useCallback(
    async (dayId: number, field: keyof Partial<Day>, value: any) => {
      const updates = { [field]: value } as Partial<Day>
      const updatedDay = await TimeCalDB.updateDay(dayId, updates)

      setDays((prev) => {
        if (!updatedDay) return prev
        const newDays = prev.map((d) => (d.id === dayId ? updatedDay : d))
        setStats(TimeCalDB.calculateStats(newDays))
        return newDays
      })

      // Sync to SQLite
      await TimeCalDB.syncToSQLite()

      setShowSave(true)
      setTimeout(() => setShowSave(false), 2000)
    },
    [],
  )

  const debouncedSave = useDebounce(saveDay, 500)

  const handleInputChange = (
    dayId: number,
    field: keyof Partial<Day>,
    value: any,
  ) => {
    // Optimistic update
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, [field]: value } : d)),
    )
    debouncedSave(dayId, field, value)
  }

  const handleCodeApply = async (dayId: number, code: Day['code']) => {
    if (!code) return
    const updatedDay = await TimeCalDB.setDayCode(dayId, code)
    setDays((prev) => {
      if (!updatedDay) return prev
      const newDays = prev.map((d) => (d.id === dayId ? updatedDay : d))
      setStats(TimeCalDB.calculateStats(newDays))
      return newDays
    })
    await TimeCalDB.syncToSQLite()
    setShowSave(true)
    setTimeout(() => setShowSave(false), 2000)
  }

  const handleCodeClear = async (dayId: number) => {
    const updatedDay = await TimeCalDB.clearDayCode(dayId)
    setDays((prev) => {
      if (!updatedDay) return prev
      const newDays = prev.map((d) => (d.id === dayId ? updatedDay : d))
      setStats(TimeCalDB.calculateStats(newDays))
      return newDays
    })
    await TimeCalDB.syncToSQLite()
    setShowSave(true)
    setTimeout(() => setShowSave(false), 2000)
  }

  // Group days by week
  const getWeeklyHours = (): Record<number, number> => {
    const weeks: Record<number, number> = {}
    for (const day of days) {
      if (!weeks[day.isoWeek]) {
        weeks[day.isoWeek] = 0
      }
      weeks[day.isoWeek] += day.istStunden || 0
    }
    return weeks
  }

  if (loading) {
    return (
      <div className='loading'>
        <div className='spinner'></div>
        Lade Tage...
      </div>
    )
  }

  const weeklyHours = getWeeklyHours()
  let lastWeek: number | null = null

  return (
    <div>
      <div className='card'>
        <div className='card-header'>
          <h2 className='card-title'>
            📋 {MONTH_NAMES[month.month - 1]} {year.year}
          </h2>
        </div>
        {stats && <KPIGrid stats={stats} />}
      </div>

      <div className='card'>
        <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th>Tag</th>
                <th>Von</th>
                <th>Bis</th>
                <th>Von 2</th>
                <th>Bis 2</th>
                <th>Pause</th>
                <th>Gesamt</th>
                <th>Differenz</th>
                <th>Code</th>
                <th>Kommentar</th>
                <th>KW</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const diff = day.istStunden - day.sollStunden
                const showWeekSummary =
                  lastWeek !== null && lastWeek !== day.isoWeek
                const weekRow = showWeekSummary ? (
                  <tr key={`week-${lastWeek}`}>
                    <td
                      colSpan={10}
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                      Woche {lastWeek}:
                    </td>
                    <td className='week-summary'>
                      {lastWeek !== null && formatHours(weeklyHours[lastWeek])}h
                    </td>
                  </tr>
                ) : null
                lastWeek = day.isoWeek

                return (
                  <React.Fragment key={day.id}>
                    {weekRow}
                    <tr className={getRowClass(day)}>
                      <td>
                        <strong>{DAY_NAMES[day.dayOfWeek]}</strong>{' '}
                        {String(day.day).padStart(2, '0')}.
                      </td>
                      <td>
                        <TimeInputField
                          value={day.von || ''}
                          onChange={(val) =>
                            handleInputChange(day.id || 0, 'von', val)
                          }
                        />
                      </td>
                      <td>
                        <TimeInputField
                          value={day.bis || ''}
                          onChange={(val) =>
                            handleInputChange(day.id || 0, 'bis', val)
                          }
                        />
                      </td>
                      <td>
                        <TimeInputField
                          value={day.von2 || ''}
                          onChange={(val) =>
                            handleInputChange(day.id || 0, 'von2', val)
                          }
                        />
                      </td>
                      <td>
                        <TimeInputField
                          value={day.bis2 || ''}
                          onChange={(val) =>
                            handleInputChange(day.id || 0, 'bis2', val)
                          }
                        />
                      </td>
                      <td>
                        <TimeInputField
                          value={day.pause || ''}
                          onChange={(val) =>
                            handleInputChange(day.id || 0, 'pause', val)
                          }
                        />
                      </td>
                      <td>
                        <strong>{formatHours(day.istStunden)}h</strong>
                      </td>
                      <td className={getDiffClass(diff)}>
                        {diff > 0 ? '+' : ''}
                        {formatHours(diff)}
                      </td>
                      <td>
                        <CodeSelector
                          day={day}
                          onApply={(code: Day['code']) =>
                            handleCodeApply(day.id || 0, code)
                          }
                          onClear={() => handleCodeClear(day.id || 0)}
                        />
                      </td>
                      <td>
                        <input
                          type='text'
                          className='comment-input'
                          value={day.comment || ''}
                          onChange={(e) =>
                            handleInputChange(
                              day.id || 0,
                              'comment',
                              e.target.value,
                            )
                          }
                          placeholder='Kommentar...'
                        />
                      </td>
                      <td style={{ textAlign: 'center', color: '#666' }}>
                        {day.isoWeek}
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })}
              {/* Last week summary */}
              {lastWeek && (
                <tr>
                  <td
                    colSpan={10}
                    style={{ textAlign: 'right', fontWeight: 'bold' }}
                  >
                    Woche {lastWeek}:
                  </td>
                  <td className='week-summary'>
                    {formatHours(weeklyHours[lastWeek])}h
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SaveIndicator show={showSave} />
    </div>
  )
}

// ============ CODE SELECTOR ============
interface CodeSelectorProps {
  day: Day
  onApply: (code: Day['code']) => void
  onClear: () => void
}

const CodeSelector: React.FC<CodeSelectorProps> = ({
  day,
  onApply,
  onClear,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value as Day['code']
    if (code === '') {
      onClear()
    } else {
      onApply(code)
    }
  }

  return (
    <select
      className='code-select'
      value={day.code || ''}
      onChange={handleChange}
    >
      <option value=''>-</option>
      <option value='K'>K</option>
      <option value='KK'>KK</option>
      <option value='U'>U</option>
      <option value='FT'>FT</option>
    </select>
  )
}

// ============ MAIN APP ============
const App: React.FC = () => {
  const [view, setView] = useState<'years' | 'year' | 'month'>('years')
  const [selectedYear, setSelectedYear] = useState<
    (Year & { stats: Stats }) | null
  >(null)
  const [selectedMonth, setSelectedMonth] = useState<
    (Month & { stats: Stats }) | null
  >(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initialTheme =
      savedTheme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light')
    setTheme(initialTheme)
    document.documentElement.className = `${initialTheme}-theme`
  }, [])

  useEffect(() => {
    document.documentElement.className = `${theme}-theme`
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  // Initialize SQLite and sync data on app start
  useEffect(() => {
    const initApp = async () => {
      try {
        const sqliteReady = await TimeCalDB.initSQLite()
        console.log('[App Init] SQLite ready:', sqliteReady)

        if (sqliteReady) {
          // Check if SQLite has data
          const hasSQLiteData = TimeCalDB.hasSQLiteData()
          console.log('[App Init] SQLite has data:', hasSQLiteData)

          if (hasSQLiteData) {
            // Restore from SQLite to IndexedDB
            console.log('[App Init] Restoring from SQLite to IndexedDB...')
            await TimeCalDB.syncFromSQLite()
            console.log('[App Init] ✓ Restored from SQLite')
          } else {
            // Backup IndexedDB to SQLite
            console.log('[App Init] Backing up IndexedDB to SQLite...')
            await TimeCalDB.syncToSQLite()
            console.log('[App Init] ✓ Backed up to SQLite')
          }
        } else {
          console.log('[App Init] SQLite unavailable - using IndexedDB only')
        }
      } catch (error) {
        console.error('[App Init] Error:', error)
      }
    }

    initApp()
  }, [])

  const handleSelectYear = (year: Year & { stats: Stats }) => {
    setSelectedYear(year)
    setView('year')
  }

  const handleSelectMonth = (month: Month & { stats: Stats }) => {
    setSelectedMonth(month)
    setView('month')
  }

  const handleBack = () => {
    if (view === 'month') {
      setView('year')
      setSelectedMonth(null)
    } else if (view === 'year') {
      setView('years')
      setSelectedYear(null)
    }
  }

  const renderBreadcrumb = () => {
    return (
      <div className='breadcrumb'>
        <a
          onClick={() => {
            setView('years')
            setSelectedYear(null)
            setSelectedMonth(null)
          }}
        >
          <img src={HomeIcon} alt='Start' className='svg-icon svg-icon-lg' />
          Start
        </a>
        {selectedYear && (
          <>
            <span>›</span>
            <a
              onClick={() => {
                setView('year')
                setSelectedMonth(null)
              }}
            >
              {selectedYear.year}
            </a>
          </>
        )}
        {selectedMonth && (
          <>
            <span>›</span>
            <span>{MONTH_NAMES[selectedMonth.month - 1]}</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className='app'>
      <header className='header'>
        <h1>
          <img src={ClockIcon} alt='TimeCal' className='svg-icon svg-icon-lg' />
          Timeo
        </h1>
        {renderBreadcrumb()}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className='btn btn-outline'
            onClick={toggleTheme}
            title={`Wechsle zu ${theme === 'light' ? 'Dunkel' : 'Hell'}modus`}
          >
            {theme === 'light' ? (
              <img
                src={DarkmodeIcon}
                alt='Dunkelmodus'
                className='svg-icon svg-icon-lg'
              />
            ) : (
              <img
                src={SunIcon}
                alt='Hellmodus'
                className='svg-icon svg-icon-lg'
              />
            )}
          </button>
          {view !== 'years' && (
            <button className='btn btn-outline' onClick={handleBack}>
              ← Zurück
            </button>
          )}
        </div>
      </header>

      {view === 'years' && (
        <YearListView
          onSelectYear={(year) =>
            handleSelectYear(year as Year & { stats: Stats })
          }
        />
      )}

      {view === 'year' && selectedYear && (
        <YearView
          year={selectedYear as Year & { stats: Stats }}
          onSelectMonth={(month) =>
            handleSelectMonth(month as Month & { stats: Stats })
          }
          onBack={handleBack}
        />
      )}

      {view === 'month' && selectedMonth && selectedYear && (
        <MonthView
          month={selectedMonth}
          year={selectedYear}
          onBack={handleBack}
        />
      )}
    </div>
  )
}

export default App
