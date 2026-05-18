import { AuditEntry } from './audit-entry.js'
import type { AuditEntryData, AuditFilter, AuditStats, AuditSeverity, AuditCategory } from './types.js'
import { ALL_SEVERITIES, ALL_CATEGORIES } from './types.js'
import { append } from '../../utils/map-helpers.js'

export class AuditStore {
  private entries: AuditEntry[] = []
  private index: Map<string, AuditEntry> = new Map()
  private correlationIndex: Map<string, AuditEntry[]> = new Map()

  add(data: AuditEntryData): void {
    const entry = new AuditEntry(data)
    this.entries.push(entry)
    this.index.set(data.id, entry)

    if (data.correlationId) {
      append(this.correlationIndex, data.correlationId, entry)
    }
  }

  get(id: string): AuditEntryData | null {
    const entry = this.index.get(id)
    return entry ? entry.getData() : null
  }

  query(filter: AuditFilter): AuditEntryData[] {
    let results = this.entries.filter((entry) => entry.matches(filter))

    if (filter.offset !== undefined && filter.offset > 0) {
      results = results.slice(filter.offset)
    }
    if (filter.limit !== undefined && filter.limit > 0) {
      results = results.slice(0, filter.limit)
    }

    return results.map((e) => e.getData())
  }

  count(filter?: AuditFilter): number {
    if (!filter) return this.entries.length
    return this.entries.filter((entry) => entry.matches(filter)).length
  }

  getStats(): AuditStats {
    const bySeverity = this.initSeverityMap()
    const byCategory = this.initCategoryMap()
    const byAction: Record<string, number> = {}
    let totalDuration = 0
    let durationCount = 0

    for (const entry of this.entries) {
      const data = entry.getData()
      bySeverity[data.severity]++
      byCategory[data.category]++
      byAction[data.action] = (byAction[data.action] ?? 0) + 1
      if (data.duration !== undefined) {
        totalDuration += data.duration
        durationCount++
      }
    }

    const timeRange = this.entries.length > 0
      ? {
          start: this.entries[0]!.getTimestamp(),
          end: this.entries[this.entries.length - 1]!.getTimestamp(),
        }
      : null

    return {
      total: this.entries.length,
      bySeverity,
      byCategory,
      byAction,
      timeRange,
      avgDuration: durationCount > 0 ? totalDuration / durationCount : 0,
    }
  }

  clear(): void {
    this.entries = []
    this.index.clear()
    this.correlationIndex.clear()
  }

  export(format: 'json' | 'csv' | 'text'): string {
    if (this.entries.length === 0) {
      return format === 'json' ? '[]' : ''
    }

    if (format === 'json') {
      const items = this.entries.map((e) => e.toJSON())
      return JSON.stringify(items, null, 2)
    }

    if (format === 'csv') {
      const header = 'id,timestamp,severity,category,action,message,source,userId,sessionId,duration,correlationId'
      const rows = this.entries.map((e) => e.toCSV())
      return [header, ...rows].join('\n')
    }

    return this.entries.map((e) => e.toText()).join('\n')
  }

  prune(maxEntries: number): number {
    if (this.entries.length <= maxEntries) return 0

    const toRemove = this.entries.length - maxEntries
    const removed = this.entries.splice(0, toRemove)

    for (const entry of removed) {
      const data = entry.getData()
      this.index.delete(data.id)
      if (data.correlationId) {
        const corrEntries = this.correlationIndex.get(data.correlationId)
        if (corrEntries) {
          const idx = corrEntries.indexOf(entry)
          if (idx !== -1) {
            corrEntries.splice(idx, 1)
          }
          if (corrEntries.length === 0) {
            this.correlationIndex.delete(data.correlationId)
          }
        }
      }
    }

    return removed.length
  }

  getByTimeRange(start: number, end: number): AuditEntryData[] {
    return this.entries
      .filter((e) => {
        const ts = e.getTimestamp()
        return ts >= start && ts <= end
      })
      .map((e) => e.getData())
  }

  getByCorrelationId(correlationId: string): AuditEntryData[] {
    const entries = this.correlationIndex.get(correlationId)
    if (!entries) return []
    return entries.map((e) => e.getData())
  }

  private initSeverityMap(): Record<AuditSeverity, number> {
    const map = {} as Record<AuditSeverity, number>
    for (const sev of ALL_SEVERITIES) {
      map[sev] = 0
    }
    return map
  }

  private initCategoryMap(): Record<AuditCategory, number> {
    const map = {} as Record<AuditCategory, number>
    for (const cat of ALL_CATEGORIES) {
      map[cat] = 0
    }
    return map
  }
}
