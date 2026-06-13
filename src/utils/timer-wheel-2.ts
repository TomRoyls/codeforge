export interface TimerEntry {
  id: number
  callback: () => void
  deadline: number
  cancelled: boolean
}

export class TimerWheel2 {
  private entries: TimerEntry[] = []
  private nextId = 0
  private currentTime = 0

  schedule(delay: number, callback: () => void): number {
    const id = this.nextId++
    const entry: TimerEntry = { id, callback, deadline: this.currentTime + delay, cancelled: false }
    this.insertEntry(entry)
    return id
  }

  private insertEntry(entry: TimerEntry): void {
    let i = 0
    while (i < this.entries.length && this.entries[i].deadline <= entry.deadline) i++
    this.entries.splice(i, 0, entry)
  }

  cancel(id: number): boolean {
    const entry = this.entries.find(e => e.id === id)
    if (entry) { entry.cancelled = true; return true }
    return false
  }

  tick(deltaTime: number): void {
    this.currentTime += deltaTime
    while (this.entries.length > 0 && this.entries[0].deadline <= this.currentTime) {
      const entry = this.entries.shift()!
      if (!entry.cancelled) entry.callback()
    }
  }

  get size(): number { return this.entries.filter(e => !e.cancelled).length }
  get time(): number { return this.currentTime }

  clear(): void { this.entries = []; this.nextId = 0; this.currentTime = 0 }

  toArray(): number[] { return this.entries.filter(e => !e.cancelled).map(e => e.id) }
  toString(): string { return JSON.stringify({ pending: this.size, time: this.currentTime }) }
  toJSON(): Record<string, number> { return { pending: this.size, time: this.currentTime } }
  clone(): TimerWheel2 { return new TimerWheel2() }
  equals(other: unknown): boolean { return other instanceof TimerWheel2 }
}
