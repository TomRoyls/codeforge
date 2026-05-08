import type { TelemetryEvent, TelemetryConfig } from './types.js'
import { DEFAULT_TELEMETRY_CONFIG } from './types.js'

export class TelemetryCollector {
  private events: TelemetryEvent[] = []
  private sessionId: string | null = null
  private sessionStartTime: number = 0
  private config: TelemetryConfig
  private flushTimer: ReturnType<typeof setInterval> | null = null

  constructor(config?: Partial<TelemetryConfig>) {
    this.config = { ...DEFAULT_TELEMETRY_CONFIG, ...config }
  }

  trackEvent(name: string, properties: Record<string, unknown> = {}): void {
    if (!this.config.enabled) return
    if (this.sessionId === null) return
    if (this.events.length >= this.config.maxQueueSize) return

    const event: TelemetryEvent = {
      name,
      timestamp: Date.now(),
      properties: this.config.anonymize
        ? this.anonymizeProperties(properties)
        : properties,
      sessionId: this.sessionId,
    }
    this.events.push(event)
  }

  trackException(error: Error, context: Record<string, unknown> = {}): void {
    if (!this.config.enabled) return
    if (this.sessionId === null) return

    this.trackEvent('exception', {
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack,
      ...context,
    })
  }

  startSession(): string {
    this.endSession()
    this.sessionId = this.generateSessionId()
    this.sessionStartTime = Date.now()
    this.events = []
    if (this.config.flushIntervalMs > 0) {
      this.flushTimer = setInterval(() => {
        this.flush()
      }, this.config.flushIntervalMs)
    }
    return this.sessionId
  }

  endSession(): void {
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.sessionId = null
    this.sessionStartTime = 0
  }

  getEvents(): TelemetryEvent[] {
    return [...this.events]
  }

  getEventsByName(name: string): TelemetryEvent[] {
    return this.events.filter((e) => e.name === name)
  }

  flush(): TelemetryEvent[] {
    const flushed = [...this.events]
    this.events = []
    return flushed
  }

  clear(): void {
    this.events = []
  }

  getSessionId(): string | null {
    return this.sessionId
  }

  getSessionStartTime(): number {
    return this.sessionStartTime
  }

  getConfig(): TelemetryConfig {
    return { ...this.config }
  }

  isSessionActive(): boolean {
    return this.sessionId !== null
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 10)
    return `sess_${timestamp}_${random}`
  }

  private anonymizeProperties(
    properties: Record<string, unknown>,
  ): Record<string, unknown> {
    const anonymized: Record<string, unknown> = {}
    for (const key of Object.keys(properties)) {
      const value = properties[key]
      if (typeof value === 'string') {
        anonymized[key] = '[redacted]'
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        anonymized[key] = value
      } else {
        anonymized[key] = '[redacted]'
      }
    }
    return anonymized
  }
}
