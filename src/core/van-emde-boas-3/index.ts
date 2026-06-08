function nextPowerOf2(n: number): number {
  if (n <= 1) return 2
  let p = 1
  while (p < n) p *= 2
  return p
}

function log2Int(n: number): number {
  let k = 0
  while ((1 << k) < n) k++
  return k
}

function upperSqrt(u: number): number {
  return 1 << Math.ceil(log2Int(u) / 2)
}

function lowerSqrt(u: number): number {
  return 1 << Math.floor(log2Int(u) / 2)
}

function high(x: number, u: number): number {
  return Math.floor(x / lowerSqrt(u))
}

function low(x: number, u: number): number {
  return x % lowerSqrt(u)
}

function index(i: number, j: number, u: number): number {
  return i * lowerSqrt(u) + j
}

class VanEmdeBoas3 {
  private universeSize: number
  private _min: number | undefined
  private _max: number | undefined
  private summary: VanEmdeBoas3 | undefined
  private cluster: VanEmdeBoas3[] | undefined
  private _size: number

  constructor(universeSize: number) {
    this.universeSize = nextPowerOf2(universeSize)
    this._min = undefined
    this._max = undefined
    this._size = 0

    if (this.universeSize > 2) {
      const upper = upperSqrt(this.universeSize)
      const lower = lowerSqrt(this.universeSize)
      this.summary = new VanEmdeBoas3(upper)
      this.cluster = []
      for (let i = 0; i < upper; i++) {
        this.cluster.push(new VanEmdeBoas3(lower))
      }
    }
  }

  isEmpty(): boolean {
    return this._min === undefined
  }

  get size(): number {
    return this._size
  }

  min(): number | undefined {
    return this._min
  }

  max(): number | undefined {
    return this._max
  }

  has(value: number): boolean {
    if (value < 0 || value >= this.universeSize) return false
    if (value === this._min || value === this._max) return true
    if (this.universeSize === 2) return false
    if (this.isEmpty()) return false
    const h = high(value, this.universeSize)
    const l = low(value, this.universeSize)
    return this.cluster![h]!.has(l)
  }

  insert(value: number): void {
    if (value < 0 || value >= this.universeSize) return
    if (this.has(value)) return
    if (this.isEmpty()) {
      this._min = value
      this._max = value
      this._size = 1
      return
    }
    if (value < this._min!) {
      const temp = value
      value = this._min!
      this._min = temp
    }
    if (this.universeSize > 2) {
      const h = high(value, this.universeSize)
      const l = low(value, this.universeSize)
      if (this.cluster![h]!.isEmpty()) {
        this.summary!.insert(h)
      }
      this.cluster![h]!.insert(l)
    }
    if (value > this._max!) {
      this._max = value
    }
    this._size++
  }

  delete(value: number): void {
    if (!this.has(value)) return

    if (this._min === this._max) {
      this._min = undefined
      this._max = undefined
      this._size = 0
      return
    }

    if (this.universeSize === 2) {
      if (value === 0) {
        this._min = 1
      } else {
        this._min = 0
      }
      this._max = this._min
      this._size = 1
      return
    }

    if (value === this._min!) {
      const firstCluster = this.summary!.min()
      value = index(firstCluster!, this.cluster![firstCluster!]!.min()!, this.universeSize)
      this._min = value
    }

    const h = high(value, this.universeSize)
    const l = low(value, this.universeSize)
    this.cluster![h]!.delete(l)

    if (this.cluster![h]!.isEmpty()) {
      this.summary!.delete(h)
      if (value === this._max!) {
        const summaryMax = this.summary!.max()
        if (summaryMax === undefined) {
          this._max = this._min
        } else {
          this._max = index(summaryMax, this.cluster![summaryMax]!.max()!, this.universeSize)
        }
      }
    } else if (value === this._max!) {
      this._max = index(h, this.cluster![h]!.max()!, this.universeSize)
    }

    this._size--
  }

  successor(value: number): number | undefined {
    if (value < 0 || value >= this.universeSize) return undefined
    if (this.isEmpty()) return undefined

    if (this.universeSize === 2) {
      if (value === 0 && this._max === 1) return 1
      return undefined
    }

    if (this._min !== undefined && value < this._min) {
      return this._min
    }

    const h = high(value, this.universeSize)
    const l = low(value, this.universeSize)
    const maxLow = this.cluster![h]!.max()

    if (maxLow !== undefined && l < maxLow) {
      const offset = this.cluster![h]!.successor(l)
      return index(h, offset!, this.universeSize)
    }

    const succCluster = this.summary!.successor(h)
    if (succCluster === undefined) return undefined

    const offset = this.cluster![succCluster]!.min()
    return index(succCluster, offset!, this.universeSize)
  }

  predecessor(value: number): number | undefined {
    if (value < 0 || value >= this.universeSize) return undefined
    if (this.isEmpty()) return undefined

    if (this.universeSize === 2) {
      if (value === 1 && this._min === 0) return 0
      return undefined
    }

    if (this._max !== undefined && value > this._max) {
      return this._max
    }

    const h = high(value, this.universeSize)
    const l = low(value, this.universeSize)
    const minLow = this.cluster![h]!.min()

    if (minLow !== undefined && l > minLow) {
      const offset = this.cluster![h]!.predecessor(l)
      return index(h, offset!, this.universeSize)
    }

    const predCluster = this.summary!.predecessor(h)
    if (predCluster === undefined) {
      if (this._min !== undefined && value > this._min) {
        return this._min
      }
      return undefined
    }

    const offset = this.cluster![predCluster]!.max()
    return index(predCluster, offset!, this.universeSize)
  }
}

export { VanEmdeBoas3 }
