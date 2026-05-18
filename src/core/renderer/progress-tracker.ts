import type { ProgressConfig, ProgressState } from './types.js'
import { DEFAULT_PROGRESS_CONFIG } from './types.js'
import { clamp } from '../../utils/math-helpers.js'

export class ProgressTracker {
  private config: ProgressConfig = { ...DEFAULT_PROGRESS_CONFIG }
  private state: ProgressState | null = null

  start(total: number, config?: Partial<ProgressConfig>): void {
    this.config = { ...DEFAULT_PROGRESS_CONFIG, ...config, total }
    this.state = {
      current: 0,
      total,
      percent: 0,
      elapsed: 0,
      eta: 0,
      startTime: Date.now(),
    }
  }

  update(increment: number): void {
    if (!this.state) return
    this.state.current = Math.min(this.state.current + increment, this.state.total)
    this.recalculate()
  }

  setProgress(current: number): void {
    if (!this.state) return
    this.state.current = clamp(current, 0, this.state.total)
    this.recalculate()
  }

  getState(): ProgressState {
    if (!this.state) {
      return { current: 0, total: 0, percent: 0, elapsed: 0, eta: 0, startTime: 0 }
    }
    return { ...this.state }
  }

  render(): string {
    if (!this.state) return ''
    const { current, total, percent, eta } = this.state
    const { width, fillChar, emptyChar, showPercent, showCount, showETA } = this.config

    const filled = Math.round((percent / 100) * width)
    const empty = width - filled
    const bar = fillChar.repeat(filled) + emptyChar.repeat(empty)

    const parts: string[] = [`[${bar}]`]
    if (showPercent) parts.push(`${percent.toFixed(1)}%`)
    if (showCount) parts.push(`${current}/${total}`)
    if (showETA && eta > 0) {
      const mins = Math.floor(eta / 60)
      const secs = Math.floor(eta % 60)
      parts.push(`ETA: ${mins > 0 ? `${mins}m ` : ''}${secs}s`)
    }

    return parts.join(' ')
  }

  stop(): void {
    this.state = null
  }

  isComplete(): boolean {
    if (!this.state) return false
    return this.state.current >= this.state.total
  }

  reset(): void {
    if (this.state) {
      this.state.current = 0
      this.state.percent = 0
      this.state.elapsed = 0
      this.state.eta = 0
      this.state.startTime = Date.now()
    }
  }

  private recalculate(): void {
    if (!this.state) return
    const { current, total, startTime } = this.state
    this.state.percent = total > 0 ? (current / total) * 100 : 0
    this.state.elapsed = (Date.now() - startTime) / 1000
    if (current > 0 && current < total) {
      const rate = current / this.state.elapsed
      const remaining = total - current
      this.state.eta = rate > 0 ? remaining / rate : 0
    } else {
      this.state.eta = 0
    }
  }
}
