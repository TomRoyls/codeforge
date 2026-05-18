import type { ProgressItem, ProgressSnapshot, TrackerConfig } from './types.js'
import { DEFAULT_TRACKER_CONFIG } from './types.js'
import { ETACalculator } from './eta-calculator.js'
import { clampPercent } from '../../utils/math-helpers.js'

export class ProgressTracker {
  private items: Map<string, ProgressItem> = new Map()
  private eta: Map<string, ETACalculator> = new Map()
  private config: TrackerConfig

  constructor(config?: Partial<TrackerConfig>) {
    this.config = { ...DEFAULT_TRACKER_CONFIG, ...config }
  }

  addItem(id: string, label: string, total: number): void {
    const item: ProgressItem = {
      id,
      label,
      total,
      current: 0,
      status: this.config.autoStart ? 'in_progress' : 'pending',
      startedAt: this.config.autoStart ? Date.now() : undefined,
    }
    this.items.set(id, item)
    this.eta.set(id, new ETACalculator(this.config.historySize))
  }

  update(id: string, current: number): void {
    const item = this.items.get(id)
    if (!item) return
    item.current = current
    if (item.status === 'pending') {
      item.status = 'in_progress'
      item.startedAt = Date.now()
    }
    const calculator = this.eta.get(id)
    if (calculator) {
      calculator.record(Date.now(), current)
    }
  }

  complete(id: string): void {
    const item = this.items.get(id)
    if (!item) return
    item.status = 'completed'
    item.completedAt = Date.now()
    if (item.startedAt === undefined) {
      item.startedAt = item.completedAt
    }
    item.current = item.total
  }

  fail(id: string): void {
    const item = this.items.get(id)
    if (!item) return
    item.status = 'failed'
    item.completedAt = Date.now()
    if (item.startedAt === undefined) {
      item.startedAt = item.completedAt
    }
  }

  getSnapshot(id: string): ProgressSnapshot | null {
    const item = this.items.get(id)
    if (!item) return null
    const calculator = this.eta.get(id)
    const now = Date.now()
    const startedAt = item.startedAt ?? now
    const elapsed = now - startedAt
    const rate = calculator ? calculator.calculateRate() : 0
    const remaining = calculator
      ? calculator.calculateETA(item.current, item.total)
      : 0
    const percent = calculator
      ? calculator.calculatePercent(item.current, item.total)
      : item.total === 0
        ? 0
        : clampPercent((item.current / item.total) * 100)

    return {
      itemId: item.id,
      current: item.current,
      total: item.total,
      percent,
      elapsed,
      remaining,
      rate,
    }
  }

  getAllSnapshots(): ProgressSnapshot[] {
    const snapshots: ProgressSnapshot[] = []
    for (const key of this.items.keys()) {
      const snapshot = this.getSnapshot(key)
      if (snapshot) {
        snapshots.push(snapshot)
      }
    }
    return snapshots
  }

  getOverallProgress(): {
    totalCurrent: number
    totalTotal: number
    percent: number
  } {
    let totalCurrent = 0
    let totalTotal = 0
    for (const item of this.items.values()) {
      totalCurrent += item.current
      totalTotal += item.total
    }
    const percent =
      totalTotal === 0
        ? 0
        : clampPercent((totalCurrent / totalTotal) * 100)
    return { totalCurrent, totalTotal, percent }
  }

  getSummary(): {
    total: number
    completed: number
    inProgress: number
    failed: number
    pending: number
  } {
    let completed = 0
    let inProgress = 0
    let failed = 0
    let pending = 0
    for (const item of this.items.values()) {
      switch (item.status) {
        case 'completed':
          completed++
          break
        case 'in_progress':
          inProgress++
          break
        case 'failed':
          failed++
          break
        case 'pending':
          pending++
          break
      }
    }
    return {
      total: this.items.size,
      completed,
      inProgress,
      failed,
      pending,
    }
  }

  reset(): void {
    this.items.clear()
    this.eta.clear()
  }

  getConfig(): TrackerConfig {
    return { ...this.config }
  }
}
