export class QuotientFilter2 {
  private slots: string[]
  private _quotientBits: number
  private _remainderBits: number
  private _size: number

  constructor(qBits: number = 10, rBits: number = 8) {
    this._quotientBits = qBits
    this._remainderBits = rBits
    const numSlots = 1 << qBits
    this.slots = []
    for (let i = 0; i < numSlots; i++) {
      this.slots.push('')
    }
    this._size = 0
  }

  insert(item: string): void {
    const hash = this.hash(item)
    const quotient = this.getQuotient(hash)
    const remainder = this.getRemainder(hash)
    const slotIndex = quotient % this.slots.length
    if (this.slots[slotIndex] === '') {
      this.slots[slotIndex] = remainder
    } else {
      const existing = this.slots[slotIndex]
      const combined = existing + ',' + remainder
      this.slots[slotIndex] = combined
    }
    this._size++
  }

  query(item: string): boolean {
    if (this._size === 0) {
      return false
    }
    const hash = this.hash(item)
    const quotient = this.getQuotient(hash)
    const remainder = this.getRemainder(hash)
    const slotIndex = quotient % this.slots.length
    const slotContent = this.slots[slotIndex]!
    if (slotContent === '') {
      return false
    }
    const remainders = slotContent.split(',')
    for (const r of remainders) {
      if (r === remainder) {
        return true
      }
    }
    return false
  }

  remove(item: string): boolean {
    if (this._size === 0) {
      return false
    }
    const hash = this.hash(item)
    const quotient = this.getQuotient(hash)
    const remainder = this.getRemainder(hash)
    const slotIndex = quotient % this.slots.length
    const slotContent = this.slots[slotIndex]!
    if (slotContent === '') {
      return false
    }
    const remainders = slotContent.split(',')
    const index = remainders.indexOf(remainder)
    if (index === -1) {
      return false
    }
    remainders.splice(index, 1)
    this.slots[slotIndex] = remainders.join(',')
    this._size--
    return true
  }

  size(): number {
    return this._size
  }

  loadFactor(): number {
    const totalSlots = this.slots.length
    if (totalSlots === 0) {
      return 0
    }
    return this._size / totalSlots
  }

  private hash(str: string): number {
    let h = 0x811c9dc5
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i)
      h = Math.imul(h, 0x01000193)
    }
    return h >>> 0
  }

  private getQuotient(hash: number): number {
    return hash >>> this._remainderBits
  }

  private getRemainder(hash: number): string {
    const mask = (1 << this._remainderBits) - 1
    return (hash & mask).toString()
  }
}
