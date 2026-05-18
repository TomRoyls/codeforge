class SkipNode<K, V> {
  key: K | undefined
  value: V | undefined
  next: (SkipNode<K, V> | null)[]

  constructor(key: K | undefined, value: V | undefined, height: number) {
    this.key = key
    this.value = value
    this.next = new Array<SkipNode<K, V> | null>(height).fill(null)
  }
}

export class SkipList<K, V> {
  private maxHeight: number
  private compare: (a: K, b: K) => number
  private head: SkipNode<K, V>
  private _size: number = 0
  private _height: number = 1

  constructor(options?: { maxHeight?: number; comparator?: (a: K, b: K) => number }) {
    this.maxHeight = options?.maxHeight ?? 32
    this.compare = options?.comparator ?? ((a: K, b: K) => (a as number) - (b as number))
    this.head = new SkipNode<K, V>(undefined, undefined, this.maxHeight)
  }

  private randomLevel(): number {
    let level = 1
    while (level < this.maxHeight && Math.random() < 0.5) {
      level++
    }
    return level
  }

  insert(key: K, value: V): void {
    const update: (SkipNode<K, V> | null)[] = new Array(this.maxHeight).fill(null)
    let current: SkipNode<K, V> | null = this.head

    for (let i = this._height - 1; i >= 0; i--) {
      while (current!.next[i] && this.compare(current!.next[i]!.key!, key) < 0) {
        current = current!.next[i]
      }
      update[i] = current
    }

    const existing = current!.next[0]
    if (existing && this.compare(existing.key!, key) === 0) {
      existing.value = value
      return
    }

    const newLevel = this.randomLevel()
    if (newLevel > this._height) {
      for (let i = this._height; i < newLevel; i++) {
        update[i] = this.head
      }
      this._height = newLevel
    }

    const newNode = new SkipNode<K, V>(key, value, newLevel)
    for (let i = 0; i < newLevel; i++) {
      newNode.next[i] = update[i]!.next[i]
      update[i]!.next[i] = newNode
    }

    this._size++
  }

  delete(key: K): boolean {
    const update: (SkipNode<K, V> | null)[] = new Array(this.maxHeight).fill(null)
    let current: SkipNode<K, V> | null = this.head

    for (let i = this._height - 1; i >= 0; i--) {
      while (current!.next[i] && this.compare(current!.next[i]!.key!, key) < 0) {
        current = current!.next[i]
      }
      update[i] = current
    }

    const target = current!.next[0]
    if (!target || this.compare(target.key!, key) !== 0) {
      return false
    }

    for (let i = 0; i < this._height; i++) {
      if (update[i]!.next[i] !== target) break
      update[i]!.next[i] = target.next[i]
    }

    while (this._height > 1 && this.head.next[this._height - 1] === null) {
      this._height--
    }

    this._size--
    return true
  }

  find(key: K): V | undefined {
    let current: SkipNode<K, V> | null = this.head

    for (let i = this._height - 1; i >= 0; i--) {
      while (current!.next[i] && this.compare(current!.next[i]!.key!, key) < 0) {
        current = current!.next[i]
      }
    }

    const found = current!.next[0]
    if (found && this.compare(found.key!, key) === 0) {
      return found.value
    }
    return undefined
  }

  contains(key: K): boolean {
    return this.find(key) !== undefined
  }

  get min(): K | undefined {
    return this.head.next[0]?.key
  }

  get max(): K | undefined {
    let current: SkipNode<K, V> | null = this.head
    for (let i = this._height - 1; i >= 0; i--) {
      while (current!.next[i]) {
        current = current!.next[i]!
      }
    }
    return current === this.head ? undefined : current!.key
  }

  get size(): number {
    return this._size
  }

  get height(): number {
    return this._height
  }

  forEach(callback: (key: K, value: V) => void): void {
    let current: SkipNode<K, V> | null = this.head.next[0]
    while (current) {
      callback(current.key!, current.value!)
      current = current.next[0]
    }
  }

  clear(): void {
    this.head = new SkipNode<K, V>(undefined, undefined, this.maxHeight)
    this._size = 0
    this._height = 1
  }

  range(minKey: K, maxKey: K): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = []
    let current: SkipNode<K, V> | null = this.head

    for (let i = this._height - 1; i >= 0; i--) {
      while (current!.next[i] && this.compare(current!.next[i]!.key!, minKey) < 0) {
        current = current!.next[i]
      }
    }

    current = current!.next[0]
    while (current && this.compare(current.key!, maxKey) <= 0) {
      result.push({ key: current.key!, value: current.value! })
      current = current.next[0]
    }

    return result
  }
}
