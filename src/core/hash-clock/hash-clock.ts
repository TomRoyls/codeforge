import type { HashClockOptions, HashClockRecord } from './types.js'
import { DEFAULT_HASH_CLOCK_OPTIONS } from './types.js'

export class HashClock {
  private chain: HashClockRecord[] = []
  private options: HashClockOptions
  private genesisHash: string

  constructor(options?: Partial<HashClockOptions>) {
    this.options = { ...DEFAULT_HASH_CLOCK_OPTIONS, ...options }
    this.genesisHash = this.options.hashFunction(this.options.seed)
  }

  tick(event: string): string {
    const tickNumber = this.chain.length + 1
    const prevHash = this.chain.length === 0
      ? this.genesisHash
      : this.chain[this.chain.length - 1]!.hash
    const hash = this.options.hashFunction(prevHash + event + String(tickNumber))
    const record: HashClockRecord = {
      tick: tickNumber,
      event,
      hash,
      prevHash,
    }
    this.chain.push(record)
    return hash
  }

  verify(): boolean {
    for (let i = 0; i < this.chain.length; i++) {
      const record = this.chain[i]!
      const expectedPrevHash = i === 0
        ? this.genesisHash
        : this.chain[i - 1]!.hash
      if (record.prevHash !== expectedPrevHash) {
        return false
      }
      const expectedHash = this.options.hashFunction(record.prevHash + record.event + String(record.tick))
      if (record.hash !== expectedHash) {
        return false
      }
    }
    return true
  }

  getTick(tickNumber: number): HashClockRecord | undefined {
    if (tickNumber < 1 || tickNumber > this.chain.length) {
      return undefined
    }
    return { ...this.chain[tickNumber - 1]! }
  }

  get currentTick(): number {
    return this.chain.length
  }

  get currentHash(): string {
    if (this.chain.length === 0) {
      return this.genesisHash
    }
    return this.chain[this.chain.length - 1]!.hash
  }

  get size(): number {
    return this.chain.length
  }

  get events(): string[] {
    return this.chain.map(r => r.event)
  }

  getRange(from: number, to: number): HashClockRecord[] {
    if (from < 1 || to > this.chain.length || from > to) {
      return []
    }
    const result: HashClockRecord[] = []
    for (let i = from; i <= to; i++) {
      result.push(this.chain[i - 1]!)
    }
    return result
  }

  verifyRange(from: number, to: number): boolean {
    if (from < 1 || to > this.chain.length || from > to) {
      return false
    }
    for (let i = from; i <= to; i++) {
      const record = this.chain[i - 1]!
      const expectedPrevHash = i === 1
        ? this.genesisHash
        : this.chain[i - 2]!.hash
      if (record.prevHash !== expectedPrevHash) {
        return false
      }
      const expectedHash = this.options.hashFunction(record.prevHash + record.event + String(record.tick))
      if (record.hash !== expectedHash) {
        return false
      }
    }
    return true
  }

  fork(fromTick: number): HashClock {
    if (fromTick < 0 || fromTick > this.chain.length) {
      return new HashClock({ ...this.options })
    }
    const forked = new HashClock({ ...this.options })
    for (let i = 0; i < fromTick; i++) {
      forked.chain.push({ ...this.chain[i]! })
    }
    return forked
  }

  merge(other: HashClock): boolean {
    if (!other.verify()) {
      return false
    }
    if (other.size === 0) {
      return true
    }
    for (const record of other.chain) {
      const prevHash = this.chain.length === 0
        ? this.genesisHash
        : this.chain[this.chain.length - 1]!.hash
      const expectedHash = this.options.hashFunction(prevHash + record.event + String(this.chain.length + 1))
      this.chain.push({
        tick: this.chain.length + 1,
        event: record.event,
        hash: expectedHash,
        prevHash,
      })
    }
    return true
  }

  reset(): void {
    this.chain = []
  }

  hasEvent(event: string): boolean {
    return this.chain.some(r => r.event === event)
  }

  findEvent(event: string): number {
    for (let i = 0; i < this.chain.length; i++) {
      if (this.chain[i]!.event === event) {
        return this.chain[i]!.tick
      }
    }
    return -1
  }
}

export { DEFAULT_HASH_CLOCK_OPTIONS } from './types.js'
export type { HashClockOptions, HashClockRecord } from './types.js'
