type Slot<T> = (value: T) => void

export class SignalSlot2<T> {
  private slots: Slot<T>[] = []
  private blocked = false

  connect(slot: Slot<T>): () => void {
    this.slots.push(slot)
    return () => this.disconnect(slot)
  }

  disconnect(slot: Slot<T>): boolean {
    const idx = this.slots.indexOf(slot)
    if (idx === -1) return false
    this.slots.splice(idx, 1)
    return true
  }

  emit(value: T): void {
    if (this.blocked) return
    for (const slot of [...this.slots]) slot(value)
  }

  block(): void { this.blocked = true }
  unblock(): void { this.blocked = false }

  get slotCount(): number { return this.slots.length }
  get isBlocked(): boolean { return this.blocked }

  clear(): void { this.slots = []; this.blocked = false }

  toArray(): Slot<T>[] { return [...this.slots] }
  toString(): string { return JSON.stringify({ slots: this.slotCount }) }
  toJSON(): Record<string, number> { return { slots: this.slotCount } }
  clone(): SignalSlot2<T> { return new SignalSlot2<T>() }
  equals(other: unknown): boolean { return other instanceof SignalSlot2 }
}
