export class CompactIntSet {
  private data: Uint8Array
  private _size: number
  private _byteLength: number

  constructor(sorted?: number[]) {
    this.data = new Uint8Array(64)
    this._size = 0
    this._byteLength = 0
    if (sorted) {
      for (const v of sorted) {
        this.add(v)
      }
    }
  }

  add(value: number): boolean {
    if (value < 0) return false
    if (this._size === 0) {
      this.encodeAndAppend(value)
      this._size++
      return true
    }
    const values = this.decodeAll()
    let lo = 0
    let hi = values.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (values[mid]! < value) lo = mid + 1
      else hi = mid
    }
    if (lo < values.length && values[lo] === value) return false
    values.splice(lo, 0, value)
    this.rebuild(values)
    return true
  }

  has(value: number): boolean {
    if (value < 0 || this._size === 0) return false
    const values = this.decodeAll()
    let lo = 0
    let hi = values.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (values[mid]! < value) lo = mid + 1
      else hi = mid
    }
    return lo < values.length && values[lo] === value
  }

  delete(value: number): boolean {
    if (value < 0 || this._size === 0) return false
    const values = this.decodeAll()
    let lo = 0
    let hi = values.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (values[mid]! < value) lo = mid + 1
      else hi = mid
    }
    if (lo >= values.length || values[lo] !== value) return false
    values.splice(lo, 1)
    this.rebuild(values)
    return true
  }

  toArray(): number[] {
    return this.decodeAll()
  }

  get size(): number {
    return this._size
  }

  get byteLength(): number {
    return this._byteLength
  }

  union(other: CompactIntSet): CompactIntSet {
    const a = this.decodeAll()
    const b = other.decodeAll()
    const result: number[] = []
    let i = 0
    let j = 0
    while (i < a.length && j < b.length) {
      if (a[i]! < b[j]!) {
        result.push(a[i]!)
        i++
      } else if (a[i]! > b[j]!) {
        result.push(b[j]!)
        j++
      } else {
        result.push(a[i]!)
        i++
        j++
      }
    }
    while (i < a.length) result.push(a[i++]!)
    while (j < b.length) result.push(b[j++]!)
    return new CompactIntSet(result)
  }

  intersection(other: CompactIntSet): CompactIntSet {
    const a = this.decodeAll()
    const b = other.decodeAll()
    const result: number[] = []
    let i = 0
    let j = 0
    while (i < a.length && j < b.length) {
      if (a[i]! < b[j]!) i++
      else if (a[i]! > b[j]!) j++
      else {
        result.push(a[i]!)
        i++
        j++
      }
    }
    return new CompactIntSet(result)
  }

  private decodeAll(): number[] {
    const result: number[] = []
    let prev = 0
    let pos = 0
    while (pos < this._byteLength) {
      let shift = 0
      let byte: number
      let value = 0
      do {
        byte = this.data[pos]!
        pos++
        value |= (byte & 0x7F) << shift
        shift += 7
      } while (byte & 0x80)
      const actual = prev + value
      result.push(actual)
      prev = actual
    }
    return result
  }

  private encodeAndAppend(delta: number): void {
    const needed = this.vByteLength(delta)
    while (this._byteLength + needed > this.data.length) {
      const newData = new Uint8Array(this.data.length * 2)
      newData.set(this.data)
      this.data = newData
    }
    let val = delta
    while (val >= 0x80) {
      this.data[this._byteLength] = (val & 0x7F) | 0x80
      this._byteLength++
      val >>>= 7
    }
    this.data[this._byteLength] = val
    this._byteLength++
  }

  private rebuild(sorted: number[]): void {
    this.data = new Uint8Array(64)
    this._byteLength = 0
    this._size = 0
    let prev = 0
    for (const v of sorted) {
      this.encodeAndAppend(v - prev)
      prev = v
      this._size++
    }
  }

  private vByteLength(value: number): number {
    let len = 1
    while (value >= 0x80) {
      value >>>= 7
      len++
    }
    return len
  }
}
