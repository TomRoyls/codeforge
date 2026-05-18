export interface HistoryPoint {
  timestamp: number
  value: number
}
import { clampPercent } from '../../utils/math-helpers.js'

export class ETACalculator {
  private history: HistoryPoint[] = []
  private maxSize: number

  constructor(historySize: number = 100) {
    this.maxSize = historySize
  }

  record(timestamp: number, value: number): void {
    this.history.push({ timestamp, value })
    if (this.history.length > this.maxSize) {
      this.history = this.history.slice(this.history.length - this.maxSize)
    }
  }

  calculateRate(): number {
    if (this.history.length < 2) return 0
    const earliest = this.history[0]!
    const latest = this.history[this.history.length - 1]!
    const valueDiff = latest.value - earliest.value
    const timeDiff = latest.timestamp - earliest.timestamp
    if (timeDiff === 0) return 0
    return valueDiff / (timeDiff / 1000)
  }

  calculateETA(current: number, total: number): number {
    const rate = this.calculateRate()
    if (rate <= 0) return 0
    const remaining = total - current
    if (remaining <= 0) return 0
    return (remaining / rate) * 1000
  }

  calculatePercent(current: number, total: number): number {
    if (total === 0) return 0
    const raw = (current / total) * 100
    return clampPercent(raw)
  }

  getHistory(): HistoryPoint[] {
    return [...this.history]
  }

  clear(): void {
    this.history = []
  }
}
