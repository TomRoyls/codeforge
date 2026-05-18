import { EventStore } from './event-store.js'
import { logger } from '../../utils/logger.js'
import { sortedByDesc } from '../../utils/array-helpers.js'
import type {
  Event,
  EventListener,
  Subscription,
  Middleware,
  EventBusConfig,
  EventBusStats,
} from './types.js'
import { DEFAULT_EVENT_BUS_CONFIG } from './types.js'

class EventBusV2 {
  private config: EventBusConfig
  private subscriptions: Map<string, Subscription> = new Map()
  private middlewares: Middleware[] = []
  private store: EventStore
  private idCounter = 0
  private stats: { totalEvents: number; errors: number; eventsByType: Record<string, number> }

  constructor(config?: Partial<EventBusConfig>) {
    this.config = { ...DEFAULT_EVENT_BUS_CONFIG, ...config }
    this.store = new EventStore()
    this.stats = { totalEvents: 0, errors: 0, eventsByType: {} }
  }

  on<T>(
    type: string,
    listener: EventListener<T>,
    options?: { priority?: number },
  ): string {
    const id = this.generateId()
    const priority = options?.priority ?? 0
    const sub: Subscription = {
      id,
      eventType: type,
      listener: listener as EventListener,
      priority,
      once: false,
      active: true,
    }
    this.subscriptions.set(id, sub)
    return id
  }

  once<T>(type: string, listener: EventListener<T>): string {
    const id = this.generateId()
    const sub: Subscription = {
      id,
      eventType: type,
      listener: listener as EventListener,
      priority: 0,
      once: true,
      active: true,
    }
    this.subscriptions.set(id, sub)
    return id
  }

  off(subscriptionId: string): boolean {
    const sub = this.subscriptions.get(subscriptionId)
    if (!sub) {
      return false
    }
    sub.active = false
    this.subscriptions.delete(subscriptionId)
    return true
  }

  offByType(type: string): number {
    let count = 0
    for (const [id, sub] of this.subscriptions) {
      if (sub.eventType === type) {
        sub.active = false
        this.subscriptions.delete(id)
        count++
      }
    }
    return count
  }

  emit<T>(
    type: string,
    data: T,
    options?: { source?: string; correlationId?: string },
  ): void {
    const event: Event<T> = {
      type,
      data,
      timestamp: Date.now(),
      source: options?.source,
      correlationId: options?.correlationId,
      canceled: false,
    }

    this.stats.totalEvents++
    this.stats.eventsByType[type] = (this.stats.eventsByType[type] ?? 0) + 1

    if (this.config.enableHistory) {
      this.store.add(event)
      if (this.store.size() > this.config.maxHistorySize) {
        this.store.prune(this.config.maxHistorySize)
      }
    }

    this.runMiddleware(event, () => {
      this.dispatch(event)
    })
  }

  async emitAsync<T>(type: string, data: T): Promise<void> {
    const event: Event<T> = {
      type,
      data,
      timestamp: Date.now(),
      canceled: false,
    }

    this.stats.totalEvents++
    this.stats.eventsByType[type] = (this.stats.eventsByType[type] ?? 0) + 1

    if (this.config.enableHistory) {
      this.store.add(event)
      if (this.store.size() > this.config.maxHistorySize) {
        this.store.prune(this.config.maxHistorySize)
      }
    }

    await new Promise<void>((resolve) => {
      this.runMiddleware(event, () => {
        const promises = this.getMatchingSubscriptions(event.type).map((sub) => {
          if (!event.canceled) {
            return Promise.resolve(sub.listener(event))
          }
          return Promise.resolve()
        })
        Promise.all(promises)
          .then(() => resolve())
          .catch(() => resolve())
      })
    })
  }

  use(middleware: Middleware): void {
    this.middlewares.push(middleware)
  }

  getHistory(type?: string): Event[] {
    if (type) {
      return this.store.getByType(type)
    }
    return this.store.getAll()
  }

  getSubscriptions(type?: string): Subscription[] {
    const all = Array.from(this.subscriptions.values())
    if (type) {
      return all.filter((s) => s.eventType === type)
    }
    return all
  }

  getStats(): EventBusStats {
    return {
      totalEvents: this.stats.totalEvents,
      totalListeners: this.subscriptions.size,
      eventsByType: { ...this.stats.eventsByType },
      errors: this.stats.errors,
    }
  }

  clear(): void {
    this.subscriptions.clear()
    this.store.clear()
    this.middlewares = []
    this.stats = { totalEvents: 0, errors: 0, eventsByType: {} }
  }

  hasListeners(type: string): boolean {
    for (const sub of this.subscriptions.values()) {
      if (sub.active && this.matchPattern(sub.eventType, type)) {
        return true
      }
    }
    return false
  }

  listenerCount(type: string): number {
    let count = 0
    for (const sub of this.subscriptions.values()) {
      if (sub.active && this.matchPattern(sub.eventType, type)) {
        count++
      }
    }
    return count
  }

  getConfig(): EventBusConfig {
    return { ...this.config }
  }

  matchPattern(pattern: string, eventType: string): boolean {
    if (pattern === eventType) {
      return true
    }
    if (pattern === '*') {
      return true
    }
    if (!pattern.includes('*')) {
      return false
    }
    const delimiter = this.config.wildcardDelimiter
    const patternParts = pattern.split(delimiter)
    const eventParts = eventType.split(delimiter)

    if (patternParts.length !== eventParts.length) {
      return false
    }

    for (let i = 0; i < patternParts.length; i++) {
      const pp = patternParts[i]!
      if (pp === '*') {
        continue
      }
      const ep = eventParts[i]!
      if (pp !== ep) {
        return false
      }
    }

    return true
  }

  private generateId(): string {
    this.idCounter++
    return `sub_${this.idCounter}_${Date.now()}`
  }

  private getMatchingSubscriptions(eventType: string): Subscription[] {
    const matches: Subscription[] = []
    const toRemove: string[] = []

    for (const [id, sub] of this.subscriptions) {
      if (sub.active && this.matchPattern(sub.eventType, eventType)) {
        matches.push(sub)
        if (sub.once) {
          toRemove.push(id)
        }
      }
    }

    for (const id of toRemove) {
      const sub = this.subscriptions.get(id)
      if (sub) {
        sub.active = false
        this.subscriptions.delete(id)
      }
    }

    return sortedByDesc(matches, m => m.priority)
  }

  private dispatch(event: Event): void {
    const matches = this.getMatchingSubscriptions(event.type)

    for (const sub of matches) {
      if (event.canceled) {
        break
      }
      try {
        const result = sub.listener(event)
        if (result instanceof Promise) {
          result.catch((err: unknown) => {
            this.handleError(err)
          })
        }
      } catch (err: unknown) {
        this.handleError(err)
      }
    }
  }

  private runMiddleware(event: Event, finalAction: () => void): void {
    if (this.middlewares.length === 0) {
      finalAction()
      return
    }

    let index = 0

    const next = (): void => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index]!
        index++
        middleware(event, next)
      } else {
        finalAction()
      }
    }

    next()
  }

  private handleError(err: unknown): void {
    this.stats.errors++
    if (this.config.errorHandling === 'throw') {
      throw err
    } else if (this.config.errorHandling === 'log') {
      logger.error(`[EventBusV2] Error in listener: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}

export { EventBusV2 }
