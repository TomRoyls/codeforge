export type Subscriber<T = unknown> = (message: T) => void

export class PubSub2<T = unknown> {
  private subscribers: Map<string, Subscriber<T>[]> = new Map()
  private topicSubscriptions: Map<string, number> = new Map()
  private messageQueue: { topic: string; message: T }[] = []
  private buffering = false

  subscribe(topic: string, subscriber: Subscriber<T>): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, [])
    }
    this.subscribers.get(topic)!.push(subscriber)
    this.topicSubscriptions.set(topic, (this.topicSubscriptions.get(topic) ?? 0) + 1)
    return () => this.unsubscribe(topic, subscriber)
  }

  unsubscribe(topic: string, subscriber: Subscriber<T>): boolean {
    const subs = this.subscribers.get(topic)
    if (!subs) return false
    const idx = subs.indexOf(subscriber)
    if (idx === -1) return false
    subs.splice(idx, 1)
    this.topicSubscriptions.set(topic, (this.topicSubscriptions.get(topic) ?? 1) - 1)
    return true
  }

  unsubscribeAll(topic: string): number {
    const subs = this.subscribers.get(topic)
    if (!subs) return 0
    const count = subs.length
    subs.length = 0
    this.topicSubscriptions.set(topic, 0)
    return count
  }

  publish(topic: string, message: T): number {
    if (this.buffering) {
      this.messageQueue.push({ topic, message })
      return 0
    }
    return this.deliver(topic, message)
  }

  private deliver(topic: string, message: T): number {
    const subs = this.subscribers.get(topic)
    if (!subs || subs.length === 0) return 0
    const copy = [...subs]
    for (const sub of copy) sub(message)
    return copy.length
  }

  startBuffering(): void { this.buffering = true }

  flush(): number {
    this.buffering = false
    let count = 0
    while (this.messageQueue.length > 0) {
      const { topic, message } = this.messageQueue.shift()!
      count += this.deliver(topic, message)
    }
    return count
  }

  subscriberCount(topic: string): number {
    return this.subscribers.get(topic)?.length ?? 0
  }

  topics(): string[] {
    return Array.from(this.subscribers.keys()).filter(t => this.subscriberCount(t) > 0)
  }

  hasTopic(topic: string): boolean {
    return this.subscriberCount(topic) > 0
  }

  patternSubscribe(pattern: string, subscriber: Subscriber<T>): () => void {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    return this.subscribe('*', (msg) => {
      for (const topic of this.topics()) {
        if (regex.test(topic)) subscriber(msg)
      }
    })
  }

  clear(): void {
    this.subscribers.clear()
    this.topicSubscriptions.clear()
    this.messageQueue = []
    this.buffering = false
  }

  toArray(): string[] { return this.topics() }
  toString(): string { return JSON.stringify({ topics: this.topics() }) }
  toJSON(): Record<string, number> {
    const result: Record<string, number> = {}
    this.subscribers.forEach((subs, topic) => { result[topic] = subs.length })
    return result
  }
  clone(): PubSub2<T> { return new PubSub2<T>() }
  equals(other: unknown): boolean {
    if (!(other instanceof PubSub2)) return false
    return this.topics().length === other.topics().length
  }
}
