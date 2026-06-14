export type BackpressureLevel2 = 'none' | 'low' | 'medium' | 'high' | 'critical'

export interface BackpressureConfig2 {
  thresholds: Record<BackpressureLevel2, number>
  checkInterval: number
  maxQueueSize: number
}

export class BackpressureController2 {
  private level: BackpressureLevel2 = 'none'
  private queueSize = 0
  private processingRate = 0
  private incomingRate = 0
  private config: BackpressureConfig2
  private listeners: ((level: BackpressureLevel2) => void)[] = []
  private history: { time: number; level: BackpressureLevel2; queueSize: number }[] = []
  private droppedCount = 0
  private throttledCount = 0
  private maxHistorySize: number

  constructor(config?: Partial<BackpressureConfig2>, maxHistorySize = 1000) {
    this.maxHistorySize = maxHistorySize
    this.config = {
      thresholds: config?.thresholds ?? {
        none: 0,
        low: 100,
        medium: 500,
        high: 1000,
        critical: 2000,
      },
      checkInterval: config?.checkInterval ?? 1000,
      maxQueueSize: config?.maxQueueSize ?? 10000,
    }
  }

  observe(queueSize: number, processingRate: number, incomingRate: number): BackpressureLevel2 {
    this.queueSize = queueSize
    this.processingRate = processingRate
    this.incomingRate = incomingRate
    const newLevel = this.calculateLevel()
    if (newLevel !== this.level) {
      this.level = newLevel
      this.listeners.forEach(l => l(newLevel))
    }
    this.recordHistory()
    return newLevel
  }

  private calculateLevel(): BackpressureLevel2 {
    if (this.queueSize >= this.config.thresholds.critical) return 'critical'
    if (this.queueSize >= this.config.thresholds.high) return 'high'
    if (this.queueSize >= this.config.thresholds.medium) return 'medium'
    if (this.queueSize >= this.config.thresholds.low) return 'low'
    return 'none'
  }

  shouldAccept(): boolean {
    return this.level !== 'critical' && this.queueSize < this.config.maxQueueSize
  }

  shouldThrottle(): boolean {
    return this.level === 'high' || this.level === 'critical'
  }

  shouldShed(): boolean {
    return this.level === 'critical'
  }

  getDropProbability(): number {
    switch (this.level) {
      case 'none': return 0
      case 'low': return 0
      case 'medium': return 0.1
      case 'high': return 0.3
      case 'critical': return 0.7
    }
  }

  getThrottleDelay(): number {
    switch (this.level) {
      case 'none': return 0
      case 'low': return 0
      case 'medium': return 10
      case 'high': return 50
      case 'critical': return 200
    }
  }

  recordDrop(count = 1): void { this.droppedCount += count }
  recordThrottle(count = 1): void { this.throttledCount += count }

  getLevel(): BackpressureLevel2 { return this.level }
  getQueueSize(): number { return this.queueSize }
  getProcessingRate(): number { return this.processingRate }
  getIncomingRate(): number { return this.incomingRate }
  getDroppedCount(): number { return this.droppedCount }
  getThrottledCount(): number { return this.throttledCount }

  getSaturationRatio(): number {
    if (this.processingRate === 0) return this.incomingRate > 0 ? 1 : 0
    return this.incomingRate / this.processingRate
  }

  onLevelChange(listener: (level: BackpressureLevel2) => void): this {
    this.listeners.push(listener)
    return this
  }

  getHistory(): typeof this.history { return [...this.history] }

  setThreshold(level: BackpressureLevel2, threshold: number): this {
    this.config.thresholds[level] = threshold
    return this
  }

  getThresholds(): Record<BackpressureLevel2, number> { return { ...this.config.thresholds } }
  getMaxQueueSize(): number { return this.config.maxQueueSize }

  count(): number { return this.queueSize }

  toArray(): BackpressureLevel2[] { return this.history.map(h => h.level) }
  toString(): string { return JSON.stringify({ level: this.level, queue: this.queueSize }) }
  toJSON(): Record<string, unknown> { return { level: this.level, queueSize: this.queueSize, dropped: this.droppedCount, throttled: this.throttledCount } }
  clone(): BackpressureController2 {
    const bc = new BackpressureController2(this.config, this.maxHistorySize)
    bc.level = this.level
    bc.queueSize = this.queueSize
    bc.processingRate = this.processingRate
    bc.incomingRate = this.incomingRate
    bc.droppedCount = this.droppedCount
    bc.throttledCount = this.throttledCount
    bc.history = [...this.history]
    return bc
  }
  equals(other: unknown): boolean {
    if (!(other instanceof BackpressureController2)) return false
    return this.level === other.level
  }
  clear(): void {
    this.level = 'none'
    this.queueSize = 0
    this.processingRate = 0
    this.incomingRate = 0
    this.droppedCount = 0
    this.throttledCount = 0
    this.history = []
  }

  private recordHistory(): void {
    this.history.push({ time: Date.now(), level: this.level, queueSize: this.queueSize })
    if (this.history.length > this.maxHistorySize) this.history.shift()
  }
}
