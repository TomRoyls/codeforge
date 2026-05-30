export interface HistoryPoint {
  timestamp: number
  value: number
}
import { clampPercent } from '../../utils/math-helpers.js'

export class ETACalculator {
  private buffer: HistoryPoint[]
  private head: number = 0
  private tail: number = 0
  private count: number = 0
  private readonly capacity: number

  constructor(historySize: number = 100) {
    this.capacity = historySize
    this.buffer = new Array<HistoryPoint>(historySize)
  }

  record(timestamp: number, value: number): void {
    this.buffer[this.tail] = { timestamp, value }
    this.tail = (this.tail + 1) % this.capacity
    if (this.count === this.capacity) {
      this.head = (this.head + 1) % this.capacity
    } else {
      this.count++
    }
  }

  private getOldest(): HistoryPoint | undefined {
    if (this.count === 0) return undefined
    return this.buffer[this.head]
  }

  private getNewest(): HistoryPoint | undefined {
    if (this.count === 0) return undefined
    return this.buffer[(this.tail - 1 + this.capacity) % this.capacity]
  }

  calculateRate(): number {
    if (this.count < 2) return 0
    const earliest = this.getOldest()!
    const latest = this.getNewest()!
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
    const result: HistoryPoint[] = []
    for (let i = 0; i < this.count; i++) {
      result.push(this.buffer[(this.head + i) % this.capacity]!)
    }
    return result
  }

  clear(): void {
    this.head = 0
    this.tail = 0
    this.count = 0
  }
}
