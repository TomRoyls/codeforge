export class TimerWheel<T> {
  private readonly wheel: Array<Array<{ deadline: number; payload: T }>>
  private readonly mask: number
  private currentTick = 0

  constructor(bits = 8) {
    if (bits < 1 || bits > 16) throw new Error('bits must be between 1 and 16')
    const size = 1 << bits
    this.mask = size - 1
    this.wheel = new Array(size)
    for (let i = 0; i < size; i++) {
      this.wheel[i] = []
    }
  }

  schedule(tick: number, payload: T): void {
    const slot = tick & this.mask
    this.wheel[slot]!.push({ deadline: tick, payload })
  }

  advance(): T[] {
    const slot = this.currentTick & this.mask
    const entries = this.wheel[slot]!
    this.wheel[slot] = []

    const ready: T[] = []
    const pending: Array<{ deadline: number; payload: T }> = []

    for (const entry of entries) {
      if (entry.deadline <= this.currentTick) {
        ready.push(entry.payload)
      } else {
        pending.push(entry)
      }
    }

    for (const entry of pending) {
      const newSlot = entry.deadline & this.mask
      this.wheel[newSlot]!.push(entry)
    }

    this.currentTick++
    return ready
  }

  advanceMultiple(ticks: number): T[] {
    const result: T[] = []
    for (let i = 0; i < ticks; i++) {
      result.push(...this.advance())
    }
    return result
  }

  get current(): number {
    return this.currentTick
  }

  get pendingCount(): number {
    let count = 0
    for (const slot of this.wheel) {
      count += slot.length
    }
    return count
  }

  get size(): number {
    return this.wheel.length
  }

  clear(): void {
    for (let i = 0; i < this.wheel.length; i++) {
      this.wheel[i] = []
    }
  }
}
