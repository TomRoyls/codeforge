export type ChannelState2 = 'open' | 'closing' | 'closed' | 'error'

export interface Channel2 {
  id: string
  name: string
  state: ChannelState2
  subscribers: Set<string>
  queue: unknown[]
  maxQueue: number
  createdAt: number
  messageCount: number
  lastMessageAt: number | null
}

export class ChannelPool2 {
  private channels: Map<string, Channel2> = new Map()
  private nameIndex: Map<string, string> = new Map()
  private idCounter = 0
  private maxChannels: number = 1000
  private defaultMaxQueue: number = 10000
  private listeners: Array<(event: string, channel: Channel2) => void> = []

  setMaxChannels(n: number): this { this.maxChannels = n; return this }
  setDefaultMaxQueue(n: number): this { this.defaultMaxQueue = n; return this }

  create(name: string, maxQueue: number = this.defaultMaxQueue): string {
    if (this.channels.size >= this.maxChannels) throw new Error('Max channels reached')
    if (this.nameIndex.has(name)) return this.nameIndex.get(name)!
    const id = `ch_${++this.idCounter}`
    const channel: Channel2 = {
      id, name,
      state: 'open',
      subscribers: new Set(),
      queue: [],
      maxQueue,
      createdAt: Date.now(),
      messageCount: 0,
      lastMessageAt: null,
    }
    this.channels.set(id, channel)
    this.nameIndex.set(name, id)
    this.notify('created', channel)
    return id
  }

  close(id: string): boolean {
    const channel = this.channels.get(id)
    if (!channel) return false
    channel.state = 'closed'
    this.notify('closed', channel)
    return true
  }

  destroy(id: string): boolean {
    const channel = this.channels.get(id)
    if (!channel) return false
    this.channels.delete(id)
    this.nameIndex.delete(channel.name)
    this.notify('destroyed', channel)
    return true
  }

  subscribe(id: string, subscriber: string): boolean {
    const channel = this.channels.get(id)
    if (!channel || channel.state !== 'open') return false
    channel.subscribers.add(subscriber)
    this.notify('subscribed', channel)
    return true
  }

  unsubscribe(id: string, subscriber: string): boolean {
    const channel = this.channels.get(id)
    if (!channel) return false
    const deleted = channel.subscribers.delete(subscriber)
    if (deleted) this.notify('unsubscribed', channel)
    return deleted
  }

  publish(id: string, message: unknown): boolean {
    const channel = this.channels.get(id)
    if (!channel || channel.state !== 'open') return false
    if (channel.queue.length >= channel.maxQueue) return false
    channel.queue.push(message)
    channel.messageCount++
    channel.lastMessageAt = Date.now()
    this.notify('published', channel)
    return true
  }

  consume(id: string): unknown {
    const channel = this.channels.get(id)
    if (!channel) return undefined
    return channel.queue.shift()
  }

  consumeAll(id: string): unknown[] {
    const channel = this.channels.get(id)
    if (!channel) return []
    const messages = [...channel.queue]
    channel.queue = []
    return messages
  }

  get(id: string): Channel2 | undefined { return this.channels.get(id) }
  getByName(name: string): Channel2 | undefined {
    const id = this.nameIndex.get(name)
    return id ? this.channels.get(id) : undefined
  }

  getOpen(): Channel2[] { return Array.from(this.channels.values()).filter(c => c.state === 'open') }
  getClosed(): Channel2[] { return Array.from(this.channels.values()).filter(c => c.state === 'closed') }

  flush(id: string): number {
    const channel = this.channels.get(id)
    if (!channel) return 0
    const count = channel.queue.length
    channel.queue = []
    return count
  }

  purge(): number {
    let purged = 0
    this.channels.forEach(channel => {
      if (channel.state === 'closed') {
        this.destroy(channel.id)
        purged++
      }
    })
    return purged
  }

  listen(fn: (event: string, channel: Channel2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, channel: Channel2): void {
    this.listeners.forEach(fn => fn(event, channel))
  }

  getStats(): { total: number; open: number; closed: number; totalMessages: number; totalSubscribers: number } {
    return {
      total: this.channels.size,
      open: this.getOpen().length,
      closed: this.getClosed().length,
      totalMessages: Array.from(this.channels.values()).reduce((s, c) => s + c.messageCount, 0),
      totalSubscribers: Array.from(this.channels.values()).reduce((s, c) => s + c.subscribers.size, 0),
    }
  }

  count(): number { return this.channels.size }

  toArray(): Channel2[] { return Array.from(this.channels.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ChannelPool2 {
    const cp = new ChannelPool2()
    cp.maxChannels = this.maxChannels
    cp.defaultMaxQueue = this.defaultMaxQueue
    cp.idCounter = this.idCounter
    return cp
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ChannelPool2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.channels.clear()
    this.nameIndex.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
