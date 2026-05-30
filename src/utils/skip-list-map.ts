export class SkipListMap<K, V> {
  private readonly maxLevel: number
  private level = 1
  private _size = 0
  private readonly head: SkipNode<K, V>
  private readonly compare: (a: K, b: K) => number

  constructor(options: { maxLevel?: number; compare?: (a: K, b: K) => number } = {}) {
    this.maxLevel = options.maxLevel ?? 16
    this.compare = options.compare ?? ((a, b) => (a as number) - (b as number))
    this.head = new SkipNode(null as K, null as V, this.maxLevel)
  }

  set(key: K, value: V): void {
    const update: SkipNode<K, V>[] = new Array(this.maxLevel)
    let current = this.head
    for (let i = this.level - 1; i >= 0; i--) {
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
    if (newLevel > this.level) {
      for (let i = this.level; i < newLevel; i++) {
        update[i] = this.head
      }
      this.level = newLevel
    }
    const node = new SkipNode(key, value, newLevel)
    for (let i = 0; i < newLevel; i++) {
      node.forward[i] = update[i]!.forward[i]
      update[i]!.forward[i] = node
    }
    this._size++
  }

  get(key: K): V | undefined {
    let current = this.head
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] && this.compare(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!
      }
    }
    current = current.forward[0]!
    if (current && this.compare(current.key, key) === 0) return current.value
    return undefined
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  delete(key: K): boolean {
    const update: SkipNode<K, V>[] = new Array(this.maxLevel)
    let current = this.head
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.forward[i] && this.compare(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!
      }
      update[i] = current
    }
    current = current.forward[0]!
    if (!current || this.compare(current.key, key) !== 0) return false
    for (let i = 0; i < this.level; i++) {
      if (update[i]!.forward[i] !== current) break
      update[i]!.forward[i] = current.forward[i]
    }
    while (this.level > 1 && !this.head.forward[this.level - 1]) {
      this.level--
    }
    this._size--
    return true
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  min(): K | undefined {
    return this.head.forward[0]?.key
  }

  *entries(): Generator<[K, V]> {
    let current = this.head.forward[0]
    while (current) {
      yield [current.key, current.value]
      current = current.forward[0]
    }
  }

  *keys(): Generator<K> {
    for (const [k] of this.entries()) yield k
  }

  *values(): Generator<V> {
    for (const [, v] of this.entries()) yield v
  }

  private randomLevel(): number {
    let level = 1
    while (Math.random() < 0.5 && level < this.maxLevel) level++
    return level
  }
}

class SkipNode<K, V> {
  key: K
  value: V
  forward: (SkipNode<K, V> | undefined)[]

  constructor(key: K, value: V, level: number) {
    this.key = key
    this.value = value
    this.forward = new Array(level).fill(undefined)
  }
}
