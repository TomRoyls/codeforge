import type { StripeLockedMapOptions, StripeLockedMapStatistics } from './types.js'
import { DEFAULT_STRIPE_LOCKED_MAP_OPTIONS } from './types.js'

interface Stripe<V> {
  map: Map<string, V>
  locked: boolean
}

export class StripeLockedMap<V = unknown> {
  private stripes: Stripe<V>[]
  private _stripeCount: number
  private hashFunction: (key: string) => number
  private _sets: number = 0
  private _gets: number = 0
  private _deletes: number = 0
  private _lockAcquisitions: number = 0
  private _lockContentions: number = 0
  private _stripeUsage: number[]

  constructor(options?: Partial<StripeLockedMapOptions>) {
    const merged = { ...DEFAULT_STRIPE_LOCKED_MAP_OPTIONS, ...options }
    this._stripeCount = merged.stripeCount ?? 16
    this.hashFunction = merged.hashFunction ?? ((key: string) => {
      let hash = 0
      for (let i = 0; i < key.length; i++) {
        const char = key.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      return Math.abs(hash)
    })
    this.stripes = []
    this._stripeUsage = []
    for (let i = 0; i < this._stripeCount; i++) {
      this.stripes.push({ map: new Map(), locked: false })
      this._stripeUsage.push(0)
    }
  }

  private getStripeIndex(key: string): number {
    return this.hashFunction(String(key)) % this._stripeCount
  }

  private acquireLock(stripeIndex: number): void {
    const stripe = this.stripes[stripeIndex]!
    if (stripe.locked) {
      this._lockContentions++
    }
    stripe.locked = true
    this._lockAcquisitions++
    this._stripeUsage[stripeIndex]!++
  }

  private releaseLock(stripeIndex: number): void {
    this.stripes[stripeIndex]!.locked = false
  }

  set(key: string, value: V): this {
    const idx = this.getStripeIndex(key)
    this.acquireLock(idx)
    try {
      this.stripes[idx]!.map.set(key, value)
      this._sets++
    } finally {
      this.releaseLock(idx)
    }
    return this
  }

  get(key: string): V | undefined {
    const idx = this.getStripeIndex(key)
    this.acquireLock(idx)
    try {
      this._gets++
      return this.stripes[idx]!.map.get(key)
    } finally {
      this.releaseLock(idx)
    }
  }

  delete(key: string): boolean {
    const idx = this.getStripeIndex(key)
    this.acquireLock(idx)
    try {
      const result = this.stripes[idx]!.map.delete(key)
      this._deletes++
      return result
    } finally {
      this.releaseLock(idx)
    }
  }

  has(key: string): boolean {
    const idx = this.getStripeIndex(key)
    this.acquireLock(idx)
    try {
      return this.stripes[idx]!.map.has(key)
    } finally {
      this.releaseLock(idx)
    }
  }

  get size(): number {
    let total = 0
    for (let i = 0; i < this._stripeCount; i++) {
      this.acquireLock(i)
      try {
        total += this.stripes[i]!.map.size
      } finally {
        this.releaseLock(i)
      }
    }
    return total
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    for (let i = 0; i < this._stripeCount; i++) {
      this.acquireLock(i)
      try {
        this.stripes[i]!.map.clear()
      } finally {
        this.releaseLock(i)
      }
    }
  }

  keys(): string[] {
    const result: string[] = []
    for (let i = 0; i < this._stripeCount; i++) {
      this.acquireLock(i)
      try {
        result.push(...Array.from(this.stripes[i]!.map.keys()))
      } finally {
        this.releaseLock(i)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let i = 0; i < this._stripeCount; i++) {
      this.acquireLock(i)
      try {
        result.push(...Array.from(this.stripes[i]!.map.values()))
      } finally {
        this.releaseLock(i)
      }
    }
    return result
  }

  entries(): Array<[string, V]> {
    const result: Array<[string, V]> = []
    for (let i = 0; i < this._stripeCount; i++) {
      this.acquireLock(i)
      try {
        result.push(...Array.from(this.stripes[i]!.map.entries()))
      } finally {
        this.releaseLock(i)
      }
    }
    return result
  }

  forEach(callback: (value: V, key: string, map: StripeLockedMap<V>) => void): void {
    for (let i = 0; i < this._stripeCount; i++) {
      this.acquireLock(i)
      try {
        this.stripes[i]!.map.forEach((value, key) => {
          callback(value, key, this)
        })
      } finally {
        this.releaseLock(i)
      }
    }
  }

  *[Symbol.iterator](): Iterator<[string, V]> {
    for (let i = 0; i < this._stripeCount; i++) {
      this.acquireLock(i)
      try {
        const entries = Array.from(this.stripes[i]!.map.entries())
        for (const entry of entries) {
          yield entry
        }
      } finally {
        this.releaseLock(i)
      }
    }
  }

  withLock<R>(key: string, callback: (map: Map<string, V>) => R): R {
    const idx = this.getStripeIndex(key)
    this.acquireLock(idx)
    try {
      return callback(this.stripes[idx]!.map)
    } finally {
      this.releaseLock(idx)
    }
  }

  getStripe(key: string): number {
    return this.getStripeIndex(key)
  }

  stripeCount(): number {
    return this._stripeCount
  }

  getStatistics(): StripeLockedMapStatistics {
    return {
      sets: this._sets,
      gets: this._gets,
      deletes: this._deletes,
      lockAcquisitions: this._lockAcquisitions,
      lockContentions: this._lockContentions,
      stripeUsage: [...this._stripeUsage],
    }
  }

  toArray(): Array<[string, V]> {
    return this.entries()
  }
}

export { DEFAULT_STRIPE_LOCKED_MAP_OPTIONS } from './types.js'
export type { StripeLockedMapOptions, StripeLockedMapStatistics } from './types.js'
