export class SkipListNode<K, V> {
  key: K
  value: V
  forward: Array<SkipListNode<K, V> | null>

  constructor(key: K, value: V, level: number) {
    this.key = key
    this.value = value
    this.forward = new Array(level + 1).fill(null)
  }
}

export class SkipListMap<K, V> {
  private head: SkipListNode<K, V>
  private maxLevel: number
  private level = 0
  private _size = 0

  constructor(maxLevel = 16) {
    this.maxLevel = maxLevel
    this.head = new SkipListNode<K, V>(null as K, null as V, maxLevel)
  }

  private randomLevel(): number {
    let lvl = 0
    while (Math.random() < 0.5 && lvl < this.maxLevel) lvl++
    return lvl
  }

  set(key: K, value: V): void {
    const update: Array<SkipListNode<K, V>> = new Array(this.maxLevel + 1)
    let current = this.head

    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] && this.compare(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!
      }
      update[i] = current
    }

    current = current.forward[0]!

    if (current && this.compare(current.key, key) === 0) {
      current.value = value
    } else {
      const newLevel = this.randomLevel()
      if (newLevel > this.level) {
        for (let i = this.level + 1; i <= newLevel; i++) update[i] = this.head
        this.level = newLevel
      }
      const node = new SkipListNode(key, value, newLevel)
      for (let i = 0; i <= newLevel; i++) {
        node.forward[i] = update[i].forward[i]
        update[i].forward[i] = node
      }
      this._size++
    }
  }

  private compare(a: K, b: K): number {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  get(key: K): V | undefined {
    let current = this.head
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] && this.compare(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!
      }
    }
    current = current.forward[0]!
    if (current && this.compare(current.key, key) === 0) return current.value
    return undefined
  }

  has(key: K): boolean { return this.get(key) !== undefined }

  delete(key: K): boolean {
    const update: Array<SkipListNode<K, V>> = new Array(this.maxLevel + 1)
    let current = this.head
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] && this.compare(current.forward[i]!.key, key) < 0) {
        current = current.forward[i]!
      }
      update[i] = current
    }
    current = current.forward[0]!
    if (!current || this.compare(current.key, key) !== 0) return false
    for (let i = 0; i <= this.level; i++) {
      if (update[i].forward[i] !== current) break
      update[i].forward[i] = current.forward[i]
    }
    while (this.level > 0 && !this.head.forward[this.level]) this.level--
    this._size--
    return true
  }

  keys(): K[] {
    const result: K[] = []
    let node = this.head.forward[0]
    while (node) { result.push(node.key); node = node.forward[0] }
    return result
  }

  values(): V[] {
    const result: V[] = []
    let node = this.head.forward[0]
    while (node) { result.push(node.value); node = node.forward[0] }
    return result
  }

  get size(): number { return this._size }
  get isEmpty(): boolean { return this._size === 0 }

  clear(): void {
    this.head = new SkipListNode<K, V>(null as K, null as V, this.maxLevel)
    this.level = 0
    this._size = 0
  }

  toArray(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    let node = this.head.forward[0]
    while (node) { result.push([node.key, node.value]); node = node.forward[0] }
    return result
  }

  toString(): string { return JSON.stringify({ size: this._size, level: this.level }) }
  toJSON(): Record<string, number> { return { size: this._size, level: this.level } }

  clone(): SkipListMap<K, V> {
    const c = new SkipListMap<K, V>(this.maxLevel)
    for (const [k, v] of this.toArray()) c.set(k, v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SkipListMap)) return false
    return this._size === other._size
  }
}
