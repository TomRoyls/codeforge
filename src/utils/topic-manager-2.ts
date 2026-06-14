export type TopicState2 = 'active' | 'paused' | 'deleted'
export type RetentionPolicy2 = 'max-age' | 'max-count' | 'max-size'

export interface TopicConfig2 {
  name: string
  state: TopicState2
  partitions: number
  retention: RetentionPolicy2
  retentionValue: number
  createdAt: number
  messageCount: number
  totalBytes: number
  subscribers: Set<string>
  partitionIndex: number
}

export interface StoredMessage2 {
  id: string
  topic: string
  partition: number
  payload: unknown
  timestamp: number
  size: number
  offset: number
}

export class TopicManager2 {
  private topics: Map<string, TopicConfig2> = new Map()
  private messages: Map<string, StoredMessage2[]> = new Map()
  private offsets: Map<string, Map<string, number>> = new Map()
  private idCounter = 0
  private defaultPartitions: number = 1
  private listeners: Array<(event: string, data: unknown) => void> = []

  setDefaultPartitions(n: number): this { this.defaultPartitions = n; return this }

  createTopic(name: string, partitions: number = this.defaultPartitions, retention: RetentionPolicy2 = 'max-count', retentionValue: number = 10000): boolean {
    if (this.topics.has(name)) return false
    const topic: TopicConfig2 = {
      name, partitions, retention, retentionValue,
      state: 'active',
      createdAt: Date.now(),
      messageCount: 0,
      totalBytes: 0,
      subscribers: new Set(),
      partitionIndex: 0,
    }
    this.topics.set(name, topic)
    this.messages.set(name, [])
    this.notify('topic-created', topic)
    return true
  }

  deleteTopic(name: string): boolean {
    const topic = this.topics.get(name)
    if (!topic) return false
    topic.state = 'deleted'
    this.topics.delete(name)
    this.messages.delete(name)
    this.offsets.delete(name)
    this.notify('topic-deleted', topic)
    return true
  }

  pauseTopic(name: string): boolean {
    const topic = this.topics.get(name)
    if (!topic) return false
    topic.state = 'paused'
    this.notify('topic-paused', topic)
    return true
  }

  resumeTopic(name: string): boolean {
    const topic = this.topics.get(name)
    if (!topic) return false
    topic.state = 'active'
    this.notify('topic-resumed', topic)
    return true
  }

  subscribe(topicName: string, subscriber: string): boolean {
    const topic = this.topics.get(topicName)
    if (!topic || topic.state !== 'active') return false
    topic.subscribers.add(subscriber)
    if (!this.offsets.has(topicName)) this.offsets.set(topicName, new Map())
    this.offsets.get(topicName)!.set(subscriber, 0)
    this.notify('subscribed', { topic: topicName, subscriber })
    return true
  }

  unsubscribe(topicName: string, subscriber: string): boolean {
    const topic = this.topics.get(topicName)
    if (!topic) return false
    const deleted = topic.subscribers.delete(subscriber)
    this.offsets.get(topicName)?.delete(subscriber)
    return deleted
  }

  publish(topicName: string, payload: unknown): string | null {
    const topic = this.topics.get(topicName)
    if (!topic || topic.state !== 'active') return null

    const partition = topic.partitionIndex % topic.partitions
    topic.partitionIndex++

    const id = `msg_${++this.idCounter}`
    const messages = this.messages.get(topicName) || []
    const size = JSON.stringify(payload).length
    const message: StoredMessage2 = {
      id, topic: topicName, partition, payload,
      timestamp: Date.now(),
      size,
      offset: messages.length,
    }
    messages.push(message)
    this.messages.set(topicName, messages)

    topic.messageCount++
    topic.totalBytes += size

    this.applyRetention(topicName)
    this.notify('published', message)
    return id
  }

  consume(topicName: string, subscriber: string, max = 1): StoredMessage2[] {
    const topic = this.topics.get(topicName)
    if (!topic || !topic.subscribers.has(subscriber)) return []
    const messages = this.messages.get(topicName) || []
    const offset = this.offsets.get(topicName)?.get(subscriber) || 0
    const result = messages.slice(offset, offset + max)
    this.offsets.get(topicName)?.set(subscriber, offset + result.length)
    return result
  }

  private applyRetention(topicName: string): void {
    const topic = this.topics.get(topicName)
    if (!topic) return
    const messages = this.messages.get(topicName)
    if (!messages) return

    let trimmed = 0
    switch (topic.retention) {
      case 'max-count':
        while (messages.length > topic.retentionValue) {
          messages.shift()
          trimmed++
        }
        break
      case 'max-size':
        while (topic.totalBytes > topic.retentionValue && messages.length > 0) {
          const msg = messages.shift()!
          topic.totalBytes -= msg.size
          trimmed++
        }
        break
      case 'max-age':
        const cutoff = Date.now() - topic.retentionValue
        while (messages.length > 0 && messages[0].timestamp < cutoff) {
          const msg = messages.shift()!
          topic.totalBytes -= msg.size
          trimmed++
        }
        break
    }
    if (trimmed > 0) {
      topic.messageCount -= trimmed
      this.notify('retention-applied', { topic: topicName, trimmed })
    }
  }

  getTopic(name: string): TopicConfig2 | undefined { return this.topics.get(name) }
  getMessages(topicName: string): StoredMessage2[] { return this.messages.get(topicName) || [] }
  getActiveTopics(): TopicConfig2[] { return Array.from(this.topics.values()).filter(t => t.state === 'active') }

  getSubscriberOffset(topicName: string, subscriber: string): number {
    return this.offsets.get(topicName)?.get(subscriber) || 0
  }

  resetOffset(topicName: string, subscriber: string): boolean {
    const offsets = this.offsets.get(topicName)
    if (!offsets) return false
    offsets.set(subscriber, 0)
    return true
  }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { topics: number; active: number; paused: number; totalMessages: number; totalSubscribers: number } {
    const topics = Array.from(this.topics.values())
    return {
      topics: topics.length,
      active: topics.filter(t => t.state === 'active').length,
      paused: topics.filter(t => t.state === 'paused').length,
      totalMessages: topics.reduce((s, t) => s + t.messageCount, 0),
      totalSubscribers: topics.reduce((s, t) => s + t.subscribers.size, 0),
    }
  }

  count(): number { return this.topics.size }

  toArray(): TopicConfig2[] { return Array.from(this.topics.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): TopicManager2 {
    const tm = new TopicManager2()
    tm.defaultPartitions = this.defaultPartitions
    tm.idCounter = this.idCounter
    return tm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof TopicManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.topics.clear()
    this.messages.clear()
    this.offsets.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
