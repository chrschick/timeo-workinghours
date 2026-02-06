// TimeCal Database - Dexie.js (IndexedDB Wrapper)
import Dexie, { type Table } from 'dexie'
import initSqlJs from 'sql.js'
import type { Day, Month, Stats, Year } from './types'

class TimeCalDBInstance extends Dexie {
  years!: Table<Year, number>
  months!: Table<Month, number>
  days!: Table<Day, number>

  constructor() {
    super('TimeCalDB')
    this.version(1).stores({
      years: '++id, year',
      months: '++id, yearId, year, month',
      days: '++id, monthId, yearId, year, month, day, date',
    })
  }
}

const db = new TimeCalDBInstance()

// Database Helper Functions
const TimeCalDB = {
  sqlDB: null as any,

  // ============ YEARS ============
  async getAllYears(): Promise<(Year & { stats: Stats })[]> {
    const years = (await db.years.orderBy('year').reverse().toArray()) as Year[]
    // Calculate stats for each year
    for (const year of years) {
      ;(year as any).stats = await this.getYearStats(year.id || 0)
    }
    return years as (Year & { stats: Stats })[]
  },

  async getYear(yearId: number): Promise<Year | undefined> {
    return (await db.years.get(yearId)) as Year | undefined
  },

  async getYearByNumber(year: number): Promise<Year | undefined> {
    return (await db.years.where('year').equals(year).first()) as
      | Year
      | undefined
  },

  async createYear(year: number): Promise<number> {
    // Check if year already exists
    const existing = await this.getYearByNumber(year)
    if (existing) {
      throw new Error(`Jahr ${year} existiert bereits`)
    }

    // Create year entry
    const yearId = await db.years.add({ year })

    // Create all 12 months
    for (let month = 1; month <= 12; month++) {
      await this.createMonth(yearId, year, month)
    }

    return yearId
  },

  async deleteYear(yearId: number): Promise<void> {
    // Delete all days
    await db.days.where('yearId').equals(yearId).delete()
    // Delete all months
    await db.months.where('yearId').equals(yearId).delete()
    // Delete year
    await db.years.delete(yearId)
  },

  async getYearStats(yearId: number): Promise<Stats> {
    const days = (await db.days
      .where('yearId')
      .equals(yearId)
      .toArray()) as Day[]
    return this.calculateStats(days)
  },

  // ============ MONTHS ============
  async getMonthsForYear(
    yearId: number,
  ): Promise<(Month & { stats: Stats })[]> {
    const months = (await db.months
      .where('yearId')
      .equals(yearId)
      .toArray()) as Month[]
    // Sort by month
    months.sort((a, b) => a.month - b.month)
    // Calculate stats for each month
    for (const month of months) {
      ;(month as any).stats = await this.getMonthStats(month.id || 0)
    }
    return months as (Month & { stats: Stats })[]
  },

  async getMonth(monthId: number): Promise<Month | undefined> {
    return (await db.months.get(monthId)) as Month | undefined
  },

  async createMonth(
    yearId: number,
    year: number,
    month: number,
  ): Promise<number> {
    const monthId = await db.months.add({ yearId, year, month })

    // Create all days for this month
    const daysInMonth = new Date(year, month, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const isoWeek = this.getISOWeek(date)

      await db.days.add({
        monthId,
        yearId,
        year,
        month,
        day,
        date: date.toISOString().split('T')[0],
        dayOfWeek,
        isWeekend,
        isoWeek,
        von: '',
        bis: '',
        von2: '',
        bis2: '',
        pause: isWeekend ? '' : '00:30',
        code: '',
        comment: '',
        sollStunden: isWeekend ? 0 : 8,
        istStunden: 0,
      } as Day)
    }

    return monthId
  },

  async getMonthStats(monthId: number): Promise<Stats> {
    const days = (await db.days
      .where('monthId')
      .equals(monthId)
      .toArray()) as Day[]
    return this.calculateStats(days)
  },

  // ============ DAYS ============
  async getDaysForMonth(monthId: number): Promise<Day[]> {
    const days = (await db.days
      .where('monthId')
      .equals(monthId)
      .toArray()) as Day[]
    // Sort by day
    days.sort((a, b) => a.day - b.day)
    return days
  },

  async getDay(dayId: number): Promise<Day | undefined> {
    return (await db.days.get(dayId)) as Day | undefined
  },

  async updateDay(
    dayId: number,
    updates: Partial<Day>,
  ): Promise<Day | undefined> {
    // Recalculate istStunden if time fields changed
    if (
      updates.von !== undefined ||
      updates.bis !== undefined ||
      updates.von2 !== undefined ||
      updates.bis2 !== undefined ||
      updates.pause !== undefined ||
      updates.code !== undefined
    ) {
      const day = (await db.days.get(dayId)) as Day
      const merged = { ...day, ...updates }

      // If code is set, automatically set 8 hours
      if (merged.code && ['K', 'KK', 'U', 'FT'].includes(merged.code)) {
        updates.istStunden = 8
        updates.sollStunden = 8
      } else {
        updates.istStunden = this.calculateWorkHours(
          merged.von,
          merged.bis,
          merged.von2,
          merged.bis2,
          merged.pause,
        )
      }
    }

    await db.days.update(dayId, updates)
    const result = (await db.days.get(dayId)) as Day | undefined

    // Sync to SQLite in background
    this.syncToSQLite().catch((error) =>
      console.warn('SQLite sync failed:', error),
    )

    return result
  },

  async setDayCode(dayId: number, code: Day['code']): Promise<Day | undefined> {
    const codeLabels: Record<Exclude<Day['code'], ''>, string> = {
      K: 'Krank',
      KK: 'Kind krank',
      U: 'Urlaub',
      FT: 'Feiertag',
    }

    await db.days.update(dayId, {
      code,
      comment: codeLabels[code as Exclude<Day['code'], ''>] || '',
      von: '08:00',
      bis: '16:00',
      von2: '',
      bis2: '',
      pause: '00:00',
      istStunden: 8,
      sollStunden: 8,
    })

    const result = (await db.days.get(dayId)) as Day | undefined

    // Sync to SQLite in background
    this.syncToSQLite().catch((error) =>
      console.warn('SQLite sync failed:', error),
    )

    return result
  },

  async clearDayCode(dayId: number): Promise<Day | undefined> {
    const day = (await db.days.get(dayId)) as Day

    await db.days.update(dayId, {
      code: '',
      comment: '',
      von: '',
      bis: '',
      von2: '',
      bis2: '',
      pause: day.isWeekend ? '' : '00:30',
      istStunden: 0,
      sollStunden: day.isWeekend ? 0 : 8,
    })

    const result = (await db.days.get(dayId)) as Day | undefined

    // Sync to SQLite in background
    this.syncToSQLite().catch((error) =>
      console.warn('SQLite sync failed:', error),
    )

    return result
  },

  // ============ CALCULATIONS ============
  calculateWorkHours(
    von: string,
    bis: string,
    von2: string,
    bis2: string,
    pause: string,
  ): number {
    let totalMinutes = 0

    // First block
    if (von && bis) {
      const [vonH, vonM] = von.split(':').map(Number)
      const [bisH, bisM] = bis.split(':').map(Number)
      totalMinutes += bisH * 60 + bisM - (vonH * 60 + vonM)
    }

    // Second block
    if (von2 && bis2) {
      const [von2H, von2M] = von2.split(':').map(Number)
      const [bis2H, bis2M] = bis2.split(':').map(Number)
      totalMinutes += bis2H * 60 + bis2M - (von2H * 60 + von2M)
    }

    // Subtract pause
    if (pause) {
      const [pauseH, pauseM] = pause.split(':').map(Number)
      totalMinutes -= pauseH * 60 + pauseM
    }

    // Return hours as decimal
    return Math.max(0, totalMinutes / 60)
  },

  calculateStats(days: Day[]): Stats {
    let arbeitstage = 0
    let krank = 0
    let kindkrank = 0
    let urlaub = 0
    let feiertag = 0
    let sollStunden = 0
    let istStunden = 0

    for (const day of days) {
      if (!day.isWeekend) {
        arbeitstage++
      }

      switch (day.code) {
        case 'K':
          krank++
          break
        case 'KK':
          kindkrank++
          break
        case 'U':
          urlaub++
          break
        case 'FT':
          feiertag++
          break
      }

      sollStunden += day.sollStunden || 0
      istStunden += day.istStunden || 0
    }

    const differenz = istStunden - sollStunden
    const durchschnitt = arbeitstage > 0 ? istStunden / arbeitstage : 0

    return {
      arbeitstage,
      krank,
      kindkrank,
      urlaub,
      feiertag,
      sollStunden,
      istStunden,
      differenz,
      durchschnitt,
    }
  },

  getISOWeek(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    )
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  },

  // ============ SQLite BACKUP ============
  async initSQLite() {
    if (this.sqlDB) {
      console.log('SQLite already initialized')
      return true
    }

    try {
      // Initialize sql.js with proper WASM configuration
      const SQL = await initSqlJs({
        locateFile: (filename: string) => {
          // Tell sql.js where to find the WASM file
          return `https://sql.js.org/dist/${filename}`
        },
      })

      // Try to load existing DB from IndexedDB
      const savedDb = await this.getSQLiteFromStorage()

      if (savedDb) {
        try {
          this.sqlDB = new SQL.Database(savedDb)
          console.log('✓ SQLite DB loaded from storage')
        } catch (error) {
          console.warn(
            'Failed to load SQLite from storage, creating new DB:',
            error,
          )
          this.sqlDB = new SQL.Database()
          this.createSQLiteSchema()
        }
      } else {
        this.sqlDB = new SQL.Database()
        this.createSQLiteSchema()
        console.log('✓ SQLite DB created (new)')
      }

      return true
    } catch (error) {
      // SQLite initialization failed - app works without backup/restore
      console.warn(
        '⚠ SQLite not available (app will work with IndexedDB only):',
        error instanceof Error ? error.message : String(error),
      )
      this.sqlDB = null
      return false
    }
  },

  createSQLiteSchema() {
    this.sqlDB.run(`
      CREATE TABLE IF NOT EXISTS years (
        id INTEGER PRIMARY KEY,
        year INTEGER UNIQUE
      )
    `)

    this.sqlDB.run(`
      CREATE TABLE IF NOT EXISTS months (
        id INTEGER PRIMARY KEY,
        yearId INTEGER,
        year INTEGER,
        month INTEGER,
        FOREIGN KEY(yearId) REFERENCES years(id)
      )
    `)

    this.sqlDB.run(`
      CREATE TABLE IF NOT EXISTS days (
        id INTEGER PRIMARY KEY,
        monthId INTEGER,
        yearId INTEGER,
        year INTEGER,
        month INTEGER,
        day INTEGER,
        date TEXT,
        dayOfWeek INTEGER,
        isWeekend BOOLEAN,
        isoWeek INTEGER,
        von TEXT,
        bis TEXT,
        von2 TEXT,
        bis2 TEXT,
        pause TEXT,
        code TEXT,
        comment TEXT,
        sollStunden REAL,
        istStunden REAL,
        FOREIGN KEY(monthId) REFERENCES months(id)
      )
    `)
  },

  hasSQLiteData(): boolean {
    if (!this.sqlDB) {
      console.warn('hasSQLiteData: SQLite not initialized')
      return false
    }
    try {
      const result = this.sqlDB.exec('SELECT COUNT(*) as count FROM years')
      const count = result[0]?.values[0]?.[0] || 0
      console.log(`SQLite has ${count} years (has data: ${count > 0})`)
      return count > 0
    } catch (error) {
      console.warn('hasSQLiteData check failed:', error)
      return false
    }
  },

  async syncToSQLite() {
    if (!this.sqlDB) return

    try {
      // Get all data from IndexedDB
      const years = await db.years.toArray()
      const months = await db.months.toArray()
      const days = await db.days.toArray()

      // Clear SQLite tables
      this.sqlDB.run('DELETE FROM days')
      this.sqlDB.run('DELETE FROM months')
      this.sqlDB.run('DELETE FROM years')

      // Insert into SQLite
      for (const year of years) {
        this.sqlDB.run('INSERT INTO years (id, year) VALUES (?, ?)', [
          year.id,
          year.year,
        ])
      }

      for (const month of months) {
        this.sqlDB.run(
          'INSERT INTO months (id, yearId, year, month) VALUES (?, ?, ?, ?)',
          [month.id, month.yearId, month.year, month.month],
        )
      }

      for (const day of days) {
        this.sqlDB.run(
          `INSERT INTO days VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            day.id,
            day.monthId,
            day.yearId,
            day.year,
            day.month,
            day.day,
            day.date,
            day.dayOfWeek,
            day.isWeekend,
            day.isoWeek,
            day.von,
            day.bis,
            day.von2,
            day.bis2,
            day.pause,
            day.code,
            day.comment,
            day.sollStunden,
            day.istStunden,
          ],
        )
      }

      // Save to storage
      await this.saveSQLiteToStorage()
      console.log('Data synced to SQLite')
    } catch (error) {
      console.error('Sync to SQLite failed:', error)
    }
  },

  async getSQLiteFromStorage(): Promise<Uint8Array | null> {
    // Try LocalStorage first (persistent across IndexedDB clears)
    try {
      const base64Data = localStorage.getItem('timecal_sqlite_backup')
      if (base64Data) {
        try {
          const binaryString = atob(base64Data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          console.log(
            `✓ SQLite restored from LocalStorage (${bytes.length} bytes)`,
          )
          return bytes
        } catch (decodeError) {
          console.warn('Base64 decode failed:', decodeError)
        }
      }
    } catch (error) {
      console.warn('LocalStorage restore failed:', error)
    }

    // Fallback to IndexedDB
    return new Promise((resolve) => {
      const request = indexedDB.open('TimeCalDB_SQLite', 1)
      request.onerror = () => {
        console.warn('IndexedDB restore failed')
        resolve(null)
      }
      request.onsuccess = (event) => {
        const dbx = (event.target as IDBOpenDBRequest).result as IDBDatabase
        const tx = dbx.transaction(['sqlitedb'], 'readonly')
        const store = tx.objectStore('sqlitedb')
        const getRequest = store.get('backup')
        getRequest.onsuccess = () => {
          if (getRequest.result?.data) {
            console.log(
              `✓ SQLite restored from IndexedDB (${getRequest.result.data.length} bytes)`,
            )
          }
          resolve(getRequest.result?.data || null)
          dbx.close()
        }
      }
      request.onupgradeneeded = (event) => {
        const dbx = (event.target as IDBOpenDBRequest).result as IDBDatabase
        if (!dbx.objectStoreNames.contains('sqlitedb')) {
          dbx.createObjectStore('sqlitedb')
        }
      }
    })
  },

  async saveSQLiteToStorage(): Promise<void> {
    if (!this.sqlDB) return

    const data = this.sqlDB.export()

    // Save to LocalStorage (persistent across IndexedDB clear)
    // Convert to Base64 to avoid encoding issues
    // Use a chunked approach to avoid "Maximum call stack size exceeded"
    let binaryString = ''
    const chunkSize = 8192
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.subarray(i, i + chunkSize)
      binaryString += String.fromCharCode(...(chunk as unknown as number[]))
    }
    const base64Data = btoa(binaryString)
    localStorage.setItem('timecal_sqlite_backup', base64Data)
    console.log('✓ SQLite saved to LocalStorage')

    // Also save to IndexedDB for larger storage
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TimeCalDB_SQLite', 1)
      request.onerror = reject
      request.onsuccess = (event) => {
        const dbx = (event.target as IDBOpenDBRequest).result as IDBDatabase
        const tx = dbx.transaction(['sqlitedb'], 'readwrite')
        const store = tx.objectStore('sqlitedb')
        store.put({ data }, 'backup')
        tx.oncomplete = () => {
          console.log('✓ SQLite saved to IndexedDB')
          resolve(undefined)
          dbx.close()
        }
      }
      request.onupgradeneeded = (event) => {
        const dbx = (event.target as IDBOpenDBRequest).result as IDBDatabase
        if (!dbx.objectStoreNames.contains('sqlitedb')) {
          dbx.createObjectStore('sqlitedb')
        }
      }
    })
  },

  async exportSQLiteFile() {
    if (!this.sqlDB) return null

    await this.syncToSQLite()
    const data = this.sqlDB.export()
    const blob = new Blob([data], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timecal_backup_${new Date().toISOString().slice(0, 10)}.sqlite`
    a.click()
    URL.revokeObjectURL(url)
  },

  async importSQLiteFile(file: File) {
    if (!this.sqlDB) return false

    try {
      const buffer = await file.arrayBuffer()
      const SQL = await initSqlJs()
      this.sqlDB = new SQL.Database(new Uint8Array(buffer))

      // Sync SQLite data to IndexedDB
      await this.syncFromSQLite()
      await this.saveSQLiteToStorage()

      return true
    } catch (error) {
      console.error('Import SQLite failed:', error)
      return false
    }
  },

  async syncFromSQLite() {
    if (!this.sqlDB) {
      console.warn('syncFromSQLite: SQLite not initialized')
      return
    }

    try {
      // Clear IndexedDB
      await db.years.clear()
      await db.months.clear()
      await db.days.clear()
      console.log('Cleared IndexedDB tables')

      // Get data from SQLite
      const yearsResult = this.sqlDB.exec('SELECT * FROM years')
      const monthsResult = this.sqlDB.exec('SELECT * FROM months')
      const daysResult = this.sqlDB.exec('SELECT * FROM days')

      let yearsCount = 0
      let monthsCount = 0
      let daysCount = 0

      // Insert into IndexedDB
      if (yearsResult[0]?.values) {
        const yearCols = yearsResult[0].columns
        for (const row of yearsResult[0].values) {
          const yearData: Record<string, any> = {}
          yearCols.forEach((col: string, idx: number) => {
            yearData[col] = row[idx]
          })
          await db.years.add(yearData as Year)
          yearsCount++
        }
        console.log(`Restored ${yearsCount} years from SQLite`)
      }

      if (monthsResult[0]?.values) {
        const monthCols = monthsResult[0].columns
        for (const row of monthsResult[0].values) {
          const monthData: Record<string, any> = {}
          monthCols.forEach((col: string, idx: number) => {
            monthData[col] = row[idx]
          })
          await db.months.add(monthData as Month)
          monthsCount++
        }
        console.log(`Restored ${monthsCount} months from SQLite`)
      }

      if (daysResult[0]?.values) {
        const dayCols = daysResult[0].columns
        for (const row of daysResult[0].values) {
          const dayData: Record<string, any> = {}
          dayCols.forEach((col: string, idx: number) => {
            dayData[col] = row[idx]
          })
          await db.days.add(dayData as Day)
          daysCount++
        }
        console.log(`Restored ${daysCount} days from SQLite`)
      }

      console.log(
        `✓ Synced from SQLite: ${yearsCount} years, ${monthsCount} months, ${daysCount} days`,
      )
    } catch (error) {
      console.error('Sync from SQLite failed:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
    }
  },
}

// Export for use in app
export { TimeCalDB }
