export type RouteStrategy2 = 'round-robin' | 'hash' | 'broadcast' | 'sticky'
export type MessageState2 = 'pending' | 'routed' | 'delivered' | 'failed' | 'dead-letter'

export interface RoutedMessage2 {
  id: string
  topic: string
  payload: unknown
  state: MessageState2
  routeKey: string | null
  targetConsumer: string | null
  createdAt: number
  deliveredAt: number | null
  attempts: number
  error: string | null
  headers: Record<string, string>
}

export interface Consumer2 {
  id: string
  name: string
  topics: string[]
  active: boolean
  deliveredCount: number
  failedCount: number
  lastDeliveredAt: number | null
}

export class MessageRouter2 {
  private messages: Map<string, RoutedMessage2> = new Map()
  private consumers: Map<string, Consumer2> = new Map()
  private topicConsumers: Map<string, string[]> = new Map()
  private rrIndex: Map<string, number> = new Map()
  private strategy: RouteStrategy2 = 'round-robin'
  private deadLetters: string[] = []
  private maxAttempts: number = 3
  private idCounter = 0
  private listeners: Array<(event: string, data: unknown) => void> = []

  setStrategy(s: RouteStrategy2): this { this.strategy = s; return this }
  setMaxAttempts(n: number): this { this.maxAttempts = n; return this }

  registerConsumer(name: string, topics: string[]): string {
    const id = `consumer_${++this.idCounter}`
    const consumer: Consumer2 = {
      id, name, topics,
      active: true,
      deliveredCount: 0,
      failedCount: 0,
      lastDeliveredAt: null,
    }
    this.consumers.set(id, consumer)
    topics.forEach(topic => {
      const list = this.topicConsumers.get(topic) || []
      list.push(id)
      this.topicConsumers.set(topic, list)
    })
    this.notify('consumer-registered', consumer)
    return id
  }

  unregisterConsumer(id: string): boolean {
    const consumer = this.consumers.get(id)
    if (!consumer) return false
    consumer.topics.forEach(topic => {
      const list = this.topicConsumers.get(topic) || []
      this.topicConsumers.set(topic, list.filter(cid => cid !== id))
    })
    this.consumers.delete(id)
    this.notify('consumer-unregistered', consumer)
    return true
  }

  deactivateConsumer(id: string): boolean {
    const consumer = this.consumers.get(id)
    if (!consumer) return false
    consumer.active = false
    return true
  }

  activateConsumer(id: string): boolean {
    const consumer = this.consumers.get(id)
    if (!consumer) return false
    consumer.active = true
    return true
  }

  publish(topic: string, payload: unknown, headers: Record<string, string> = {}, routeKey: string | null = null): string {
    const id = `msg_${++this.idCounter}`
    const message: RoutedMessage2 = {
      id, topic, payload, headers, routeKey,
      state: 'pending',
      targetConsumer: null,
      createdAt: Date.now(),
      deliveredAt: null,
      attempts: 0,
      error: null,
    }
    this.messages.set(id, message)
    this.route(id)
    return id
  }

  private route(messageId: string): void {
    const message = this.messages.get(messageId)
    if (!message) return
    const consumers = this.getActiveConsumersForTopic(message.topic)
    if (consumers.length === 0) {
      message.state = 'failed'
      message.error = 'No consumers'
      this.notify('no-consumers', message)
      return
    }

    let targetId: string
    switch (this.strategy) {
      case 'round-robin':
        targetId = this.selectRoundRobin(message.topic, consumers)
        break
      case 'hash':
        targetId = this.selectHash(message.routeKey || message.id, consumers)
        break
      case 'broadcast':
        this.broadcast(messageId, consumers)
        return
      case 'sticky':
        targetId = consumers[0]
        break
      default:
        targetId = consumers[0]
    }

    message.targetConsumer = targetId
    message.state = 'routed'
    this.notify('routed', message)
  }

  private getActiveConsumersForTopic(topic: string): string[] {
    const ids = this.topicConsumers.get(topic) || []
    return ids.filter(id => {
      const c = this.consumers.get(id)
      return c && c.active
    })
  }

  private selectRoundRobin(topic: string, consumers: string[]): string {
    const idx = (this.rrIndex.get(topic) || 0) % consumers.length
    this.rrIndex.set(topic, (this.rrIndex.get(topic) || 0) + 1)
    return consumers[idx]
  }

  private selectHash(key: string, consumers: string[]): string {
    let hash = 0
    for (let i = 0; i < key.length; i++) hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0
    return consumers[Math.abs(hash) % consumers.length]
  }

  private broadcast(messageId: string, consumers: string[]): void {
    consumers.forEach(consumerId => {
      const message = this.messages.get(messageId)!
      message.targetConsumer = consumerId
      message.state = 'routed'
      this.notify('routed', message)
    })
  }

  acknowledge(messageId: string): boolean {
    const message = this.messages.get(messageId)
    if (!message) return false
    message.state = 'delivered'
    message.deliveredAt = Date.now()
    if (message.targetConsumer) {
      const consumer = this.consumers.get(message.targetConsumer)
      if (consumer) {
        consumer.deliveredCount++
        consumer.lastDeliveredAt = Date.now()
      }
    }
    this.notify('delivered', message)
    return true
  }

  fail(messageId: string, error: string): boolean {
    const message = this.messages.get(messageId)
    if (!message) return false
    message.attempts++
    message.error = error
    if (message.attempts >= this.maxAttempts) {
      message.state = 'dead-letter'
      this.deadLetters.push(messageId)
      this.notify('dead-lettered', message)
    } else {
      message.state = 'pending'
      this.route(messageId)
    }
    if (message.targetConsumer) {
      const consumer = this.consumers.get(message.targetConsumer)
      if (consumer) consumer.failedCount++
    }
    return true
  }

  getMessage(id: string): RoutedMessage2 | undefined { return this.messages.get(id) }
  getConsumer(id: string): Consumer2 | undefined { return this.consumers.get(id) }
  getConsumersForTopic(topic: string): Consumer2[] {
    const ids = this.topicConsumers.get(topic) || []
    return ids.map(id => this.consumers.get(id)).filter(Boolean) as Consumer2[]
  }

  getDeadLetters(): RoutedMessage2[] {
    return this.deadLetters.map(id => this.messages.get(id)).filter(Boolean) as RoutedMessage2[]
  }

  getPending(): RoutedMessage2[] {
    return Array.from(this.messages.values()).filter(m => m.state === 'pending' || m.state === 'routed')
  }

  replayDeadLetter(id: string): boolean {
    const idx = this.deadLetters.indexOf(id)
    if (idx === -1) return false
    const message = this.messages.get(id)
    if (!message) return false
    message.state = 'pending'
    message.attempts = 0
    message.error = null
    this.deadLetters.splice(idx, 1)
    this.route(id)
    return true
  }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { messages: number; consumers: number; delivered: number; failed: number; deadLettered: number; pending: number } {
    const messages = Array.from(this.messages.values())
    return {
      messages: messages.length,
      consumers: this.consumers.size,
      delivered: messages.filter(m => m.state === 'delivered').length,
      failed: messages.filter(m => m.state === 'failed').length,
      deadLettered: this.deadLetters.length,
      pending: this.getPending().length,
    }
  }

  count(): number { return this.messages.size }

  toArray(): RoutedMessage2[] { return Array.from(this.messages.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): MessageRouter2 {
    const mr = new MessageRouter2()
    mr.strategy = this.strategy
    mr.maxAttempts = this.maxAttempts
    return mr
  }
  equals(other: unknown): boolean {
    if (!(other instanceof MessageRouter2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.messages.clear()
    this.consumers.clear()
    this.topicConsumers.clear()
    this.rrIndex.clear()
    this.deadLetters = []
    this.listeners = []
    this.idCounter = 0
  }
}
