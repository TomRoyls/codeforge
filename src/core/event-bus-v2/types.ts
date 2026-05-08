type EventListener<T = unknown> = (event: Event<T>) => void | Promise<void>

interface Event<T = unknown> {
  type: string
  data: T
  timestamp: number
  source?: string
  correlationId?: string
  canceled: boolean
}

interface Subscription {
  id: string
  eventType: string
  listener: EventListener
  priority: number
  once: boolean
  active: boolean
}

type Middleware = (event: Event, next: () => void) => void

interface EventBusConfig {
  maxListeners: number
  maxHistorySize: number
  wildcardDelimiter: string
  enableHistory: boolean
  errorHandling: 'throw' | 'log' | 'ignore'
}

interface EventBusStats {
  totalEvents: number
  totalListeners: number
  eventsByType: Record<string, number>
  errors: number
}

const DEFAULT_EVENT_BUS_CONFIG: EventBusConfig = {
  maxListeners: 100,
  maxHistorySize: 1000,
  wildcardDelimiter: '.',
  enableHistory: true,
  errorHandling: 'log',
}

export type { EventListener, Event, Subscription, Middleware, EventBusConfig, EventBusStats }
export { DEFAULT_EVENT_BUS_CONFIG }
