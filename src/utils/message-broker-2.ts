export interface BrokerMessage2 {
  id: string
  topic: string
  payload: unknown
  headers: Record<string, string>
  timestamp: number
}

export type BrokerHandler2 = (message: BrokerMessage2) => void | Promise<void>

export interface BrokerSubscription2 {
  id: string
  topic: string
  handler: BrokerHandler2
  pattern: boolean
}

export class MessageBroker2 {
  private subscriptions: Map<string, BrokerSubscription2> = new Map()
  private queue: BrokerMessage2[] = []
  private deadLetterQueue: BrokerMessage2[] = []
  private processing = false
  private maxRetries: number
  private retryCounts: Map<string, number> = new Map()
  private messageIdCounter = 0

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries
  }

  subscribe(topic: string, handler: BrokerHandler2, pattern = false): string {
    const id = `sub_${++this.messageIdCounter}`
    this.subscriptions.set(id, { id, topic, handler, pattern })
    return id
  }

  unsubscribe(subId: string): boolean {
    return this.subscriptions.delete(subId)
  }

  publish(topic: string, payload: unknown, headers: Record<string, string> = {}): string {
    const id = `msg_${++this.messageIdCounter}`
    const message: BrokerMessage2 = {
      id, topic, payload, headers, timestamp: Date.now(),
    }
    this.queue.push(message)
    return id
  }

  async process(): Promise<number> {
    if (this.processing) return 0
    this.processing = true
    let processed = 0

    while (this.queue.length > 0) {
      const message = this.queue.shift()!
      const subscribers = this.getSubscribersForTopic(message.topic)

      if (subscribers.length === 0) {
        this.deadLetterQueue.push(message)
        continue
      }

      let allSucceeded = true
      for (const sub of subscribers) {
        try {
          await sub.handler(message)
        } catch {
          allSucceeded = false
          const retries = this.retryCounts.get(message.id) ?? 0
          if (retries < this.maxRetries) {
            this.retryCounts.set(message.id, retries + 1)
            this.queue.push(message)
          } else {
            this.deadLetterQueue.push(message)
          }
        }
      }
      if (allSucceeded) processed++
    }

    this.processing = false
    return processed
  }

  private getSubscribersForTopic(topic: string): BrokerSubscription2[] {
    return Array.from(this.subscriptions.values()).filter(sub => {
      if (!sub.pattern) return sub.topic === topic
      return this.matchPattern(sub.topic, topic)
    })
  }

  private matchPattern(pattern: string, topic: string): boolean {
    const patternParts = pattern.split('.')
    const topicParts = topic.split('.')
    let pi = 0, ti = 0

    while (pi < patternParts.length && ti < topicParts.length) {
      if (patternParts[pi] === '*') {
        pi++; ti++
      } else if (patternParts[pi] === '#') {
        return pi === patternParts.length - 1
      } else if (patternParts[pi] === topicParts[ti]) {
        pi++; ti++
      } else {
        return false
      }
    }

    return pi === patternParts.length && ti === topicParts.length
  }

  getQueueSize(): number { return this.queue.length }
  getDeadLetterCount(): number { return this.deadLetterQueue.length }
  getSubscriptionCount(): number { return this.subscriptions.size }

  getSubscriptions(): BrokerSubscription2[] {
    return Array.from(this.subscriptions.values())
  }

  getDeadLetterQueue(): BrokerMessage2[] {
    return [...this.deadLetterQueue]
  }

  clearDeadLetterQueue(): void {
    this.deadLetterQueue = []
  }

  count(): number { return this.subscriptions.size }

  toArray(): string[] { return this.getSubscriptions().map(s => s.id) }
  toString(): string { return JSON.stringify({ subscriptions: this.count(), queue: this.queue.length }) }
  toJSON(): Record<string, unknown> { return { subscriptions: this.count(), queue: this.queue.length, dead: this.deadLetterQueue.length } }
  clone(): MessageBroker2 {
    const mb = new MessageBroker2(this.maxRetries)
    this.subscriptions.forEach((sub, id) => mb.subscriptions.set(id, { ...sub }))
    mb.queue = [...this.queue]
    mb.deadLetterQueue = [...this.deadLetterQueue]
    return mb
  }
  equals(other: unknown): boolean {
    if (!(other instanceof MessageBroker2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.subscriptions.clear()
    this.queue = []
    this.deadLetterQueue = []
    this.retryCounts.clear()
  }
}
