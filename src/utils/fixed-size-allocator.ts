export class FixedSizeAllocator {
  private slots: boolean[]
  private slotSize: number

  constructor(numSlots: number, slotSize = 1) {
    this.slots = new Array(numSlots).fill(false)
    this.slotSize = slotSize
  }

  allocate(): number {
    for (let i = 0; i < this.slots.length; i++) {
      if (!this.slots[i]) {
        this.slots[i] = true
        return i
      }
    }
    return -1
  }

  deallocate(index: number): boolean {
    if (index < 0 || index >= this.slots.length || !this.slots[index]) return false
    this.slots[index] = false
    return true
  }

  isAllocated(index: number): boolean {
    return index >= 0 && index < this.slots.length && this.slots[index]
  }

  get usedCount(): number { return this.slots.filter(Boolean).length }
  get freeCount(): number { return this.slots.length - this.usedCount }
  get totalSlots(): number { return this.slots.length }
  get isEmpty(): boolean { return this.usedCount === 0 }
  get isFull(): boolean { return this.freeCount === 0 }

  clear(): void { this.slots.fill(false) }

  toArray(): boolean[] { return [...this.slots] }
  toString(): string { return JSON.stringify({ used: this.usedCount, free: this.freeCount }) }
  toJSON(): Record<string, number> { return { used: this.usedCount, free: this.freeCount, total: this.totalSlots } }

  clone(): FixedSizeAllocator {
    const c = new FixedSizeAllocator(this.totalSlots, this.slotSize)
    c.slots = [...this.slots]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof FixedSizeAllocator)) return false
    return this.totalSlots === other.totalSlots
  }
}
