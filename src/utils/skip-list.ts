const DEFAULT_MAX_LEVEL = 32
const P = 0.5

function defaultComparator<K>(a: K, b: K): number {
  const na = Number(a)
  const nb = Number(b)
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
  return a < b ? -1 : a > b ? 1 : 0
}

class SkipNode<K, V> {
  key: K
  value: V
  forward: Array<SkipNode<K, V> | null>

  constructor(key: K, value: V, level: number) {
    this.key = key
    this.value = value
    this.forward = new Array(level).fill(null)
  }
}

export interface SkipListOptions<K> {
  comparator?: (a: K, b: K) => number
  maxHeight?: number
}

export class SkipList<K, V> {
  private head: SkipNode<K, V>
  private _size = 0
  private _level = 1
  private _maxLevel: number
  private compare: (a: K, b: K) => number

  constructor(options?: SkipListOptions<K>) {
    this.compare = options?.comparator ?? defaultComparator
    this._maxLevel = options?.maxHeight ?? DEFAULT_MAX_LEVEL
    this.head = new SkipNode<K, V>(null as K, null as V, this._maxLevel)
  }

  private randomLevel(): number {
    let level = 1
    while (Math.random() < P && level < this._maxLevel) {
      level++
    }
    return level
  }

  insert(key: K, value: V): void {
    const update: Array<SkipNode<K, V> | null> = new Array(this._maxLevel).fill(null)
    let current = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (current.forward[i] && this.compare(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!
      }
      update[i] = current
    }
    current = current.forward[0]!
    if (current && this.compare(current.key, key) === 0) {
      current.value = value
      return
    }
    const newLevel = this.randomLevel()
    if (newLevel > this._level) {
      for (let i = this._level; i < newLevel; i++) {
        update[i] = this.head
      }
      this._level = newLevel
    }
    const newNode = new SkipNode(key, value, newLevel)
    for (let i = 0; i < newLevel; i++) {
      const up = update[i]!
      newNode.forward[i] = up.forward[i]!
      up.forward[i] = newNode
    }
    this._size++
  }

  find(key: K): V | undefined {
    let current = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (current.forward[i] && this.compare(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!
      }
    }
    current = current.forward[0]!
    if (current && this.compare(current.key, key) === 0) {
      return current.value
    }
    return undefined
  }

  contains(key: K): boolean {
    return this.find(key) !== undefined
  }

  delete(key: K): boolean {
    const update: Array<SkipNode<K, V> | null> = new Array(this._maxLevel).fill(null)
    let current = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (current.forward[i] && this.compare(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!
      }
      update[i] = current
    }
    current = current.forward[0]!
    if (!current || this.compare(current.key, key) !== 0) {
      return false
    }
    for (let i = 0; i < this._level; i++) {
      const up = update[i]!
      if (up.forward[i] !== current) break
      up.forward[i] = current.forward[i]!
    }
    while (this._level > 1 && this.head.forward[this._level - 1] === null) {
      this._level--
    }
    this._size--
    return true
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get min(): K | undefined {
    const first = this.head.forward[0]
    return first ? first.key : undefined
  }

  get max(): K | undefined {
    let current = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (current.forward[i]) {
        current = current.forward[i]!
      }
    }
    return current === this.head ? undefined : current.key
  }

  get height(): number {
    return this._level
  }

  clear(): void {
    this.head = new SkipNode<K, V>(null as K, null as V, this._maxLevel)
    this._level = 1
    this._size = 0
  }

  range(min: K, max: K): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = []
    let current = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (current.forward[i] && this.compare(current.forward[i]!.key, min) < 0) {
        current = current.forward[i]!
      }
    }
    current = current.forward[0]!
    while (current && this.compare(current.key, max) <= 0) {
      result.push({ key: current.key, value: current.value })
      current = current.forward[0]!
    }
    return result
  }

  forEach(callback: (key: K, value: V) => void): void {
    let current = this.head.forward[0]
    while (current) {
      callback(current.key, current.value)
      current = current.forward[0]
    }
  }

  keys(): K[] {
    const result: K[] = []
    let current = this.head.forward[0]
    while (current) {
      result.push(current.key)
      current = current.forward[0]
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    let current = this.head.forward[0]
    while (current) {
      result.push(current.value)
      current = current.forward[0]
    }
    return result
  }

  entries(): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = []
    let current = this.head.forward[0]
    while (current) {
      result.push({ key: current.key, value: current.value })
      current = current.forward[0]
    }
    return result
  }

  toArray(): Array<{ key: K; value: V }> {
    return this.entries()
  }

  [Symbol.iterator](): Iterator<{ key: K; value: V }> {
    let current = this.head.forward[0]
    return {
      next: () => {
        if (current) {
          const entry = { key: current.key, value: current.value }
          current = current.forward[0]
          return { value: entry, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<{ key: K; value: V }>
      },
    }
  }
}
