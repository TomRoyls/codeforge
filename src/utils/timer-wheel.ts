export class TimerWheel<T> {
  private readonly wheel: Array<Array<{ deadline: number; payload: T; callback?: () => void }>>
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

  schedule(tick: number, payload: T): void
  schedule(payload: T, tick: number, callback: () => void): void
  schedule(arg1: number | T, arg2: T | number, arg3?: () => void): void {
    let tick: number
    let payload: T
    let callback: (() => void) | undefined
    if (typeof arg1 === 'number') {
      tick = arg1
      payload = arg2 as T
    } else {
      payload = arg1 as T
      tick = arg2 as number
      callback = arg3
    }
    const slot = tick & this.mask
    this.wheel[slot]!.push({ deadline: tick, payload, callback })
  }

  advance(): T[] {
    const slot = this.currentTick & this.mask
    const entries = this.wheel[slot]!
    this.wheel[slot] = []

    const ready: T[] = []
    const pending: Array<{ deadline: number; payload: T; callback?: () => void }> = []

    for (const entry of entries) {
      if (entry.deadline <= this.currentTick) {
        ready.push(entry.payload)
        if (entry.callback) entry.callback()
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
