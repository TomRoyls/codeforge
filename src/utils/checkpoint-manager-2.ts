export interface Checkpoint2 {
  id: string
  position: number
  data?: unknown
  timestamp: number
  label?: string
}

export class CheckpointManager2 {
  private checkpoints: Map<string, Checkpoint2> = new Map()
  private order: string[] = []
  private currentPosition = 0

  save(position: number, data?: unknown, label?: string): string {
    const id = `cp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const cp: Checkpoint2 = { id, position, data, timestamp: Date.now(), label }
    this.checkpoints.set(id, cp)
    this.order.push(id)
    this.currentPosition = position
    return id
  }

  restore(id: string): Checkpoint2 | undefined {
    const cp = this.checkpoints.get(id)
    if (cp) this.currentPosition = cp.position
    return cp
  }

  get(id: string): Checkpoint2 | undefined {
    return this.checkpoints.get(id)
  }

  has(id: string): boolean {
    return this.checkpoints.has(id)
  }

  remove(id: string): boolean {
    if (!this.checkpoints.delete(id)) return false
    this.order = this.order.filter(i => i !== id)
    return true
  }

  getCurrentPosition(): number {
    return this.currentPosition
  }

  setPosition(pos: number): void {
    this.currentPosition = pos
  }

  all(): Checkpoint2[] {
    return this.order.map(id => this.checkpoints.get(id)!).filter(Boolean)
  }

  count(): number { return this.checkpoints.size }

  findByLabel(label: string): Checkpoint2[] {
    return this.all().filter(cp => cp.label === label)
  }

  findByPosition(position: number): Checkpoint2 | undefined {
    return this.all().find(cp => cp.position === position)
  }

  last(): Checkpoint2 | undefined {
    if (this.order.length === 0) return undefined
    return this.checkpoints.get(this.order[this.order.length - 1])
  }

  first(): Checkpoint2 | undefined {
    if (this.order.length === 0) return undefined
    return this.checkpoints.get(this.order[0])
  }

  clear(): void {
    this.checkpoints.clear()
    this.order = []
    this.currentPosition = 0
  }

  toArray(): string[] { return [...this.order] }
  toString(): string { return JSON.stringify({ count: this.count(), position: this.currentPosition }) }
  toJSON(): Record<string, unknown> { return { count: this.count(), position: this.currentPosition } }
  clone(): CheckpointManager2 {
    const cm = new CheckpointManager2()
    cm.currentPosition = this.currentPosition
    this.checkpoints.forEach((cp, id) => cm.checkpoints.set(id, { ...cp }))
    cm.order = [...this.order]
    return cm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CheckpointManager2)) return false
    return this.count() === other.count()
  }
}
