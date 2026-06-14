export type DisposePhase2 = 'immediate' | 'before-exit' | 'on-idle' | 'manual'
export type DisposeStatus2 = 'registered' | 'disposing' | 'disposed' | 'failed'

export interface Disposable2 {
  id: string
  name: string
  phase: DisposePhase2
  status: DisposeStatus2
  priority: number
  dispose: () => void
  order: number
  timeout: number
  error: string | null
}

export class DisposeManager2 {
  private disposables: Map<string, Disposable2> = new Map()
  private order: string[] = []
  private seqCounter = 0
  private listeners: Array<(event: string, id: string) => void> = []

  register(name: string, dispose: () => void, priority = 0, phase: DisposePhase2 = 'manual', timeout = 5000): string {
    const id = `disp_${name}_${++this.seqCounter}`
    this.disposables.set(id, {
      id, name, dispose, priority, phase,
      status: 'registered', order: this.seqCounter,
      timeout, error: null,
    })
    this.order.push(id)
    this.rebuildOrder()
    return id
  }

  unregister(id: string): boolean {
    const deleted = this.disposables.delete(id)
    if (deleted) {
      this.order = this.order.filter(oid => oid !== id)
      this.rebuildOrder()
    }
    return deleted
  }

  private rebuildOrder(): void {
    this.order = Array.from(this.disposables.values())
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority
        return a.order - b.order
      })
      .map(d => d.id)
  }

  disposeOne(id: string): boolean {
    const disposable = this.disposables.get(id)
    if (!disposable || disposable.status === 'disposed') return false
    disposable.status = 'disposing'
    try {
      disposable.dispose()
      disposable.status = 'disposed'
      this.notify('disposed', id)
      return true
    } catch (e) {
      disposable.status = 'failed'
      disposable.error = String(e)
      this.notify('failed', id)
      return false
    }
  }

  disposeAll(): { disposed: number; failed: number } {
    let disposed = 0
    let failed = 0
    for (const id of [...this.order]) {
      if (this.disposeOne(id)) disposed++
      else failed++
    }
    return { disposed, failed }
  }

  disposeByPhase(phase: DisposePhase2): { disposed: number; failed: number } {
    let disposed = 0
    let failed = 0
    this.order.forEach(id => {
      const d = this.disposables.get(id)
      if (d && d.phase === phase) {
        if (this.disposeOne(id)) disposed++
        else failed++
      }
    })
    return { disposed, failed }
  }

  get(id: string): Disposable2 | undefined { return this.disposables.get(id) }
  getStatus(id: string): DisposeStatus2 | undefined { return this.disposables.get(id)?.status }

  getPending(): Disposable2[] { return Array.from(this.disposables.values()).filter(d => d.status === 'registered') }
  getDisposed(): Disposable2[] { return Array.from(this.disposables.values()).filter(d => d.status === 'disposed') }
  getFailed(): Disposable2[] { return Array.from(this.disposables.values()).filter(d => d.status === 'failed') }

  setPriority(id: string, priority: number): boolean {
    const d = this.disposables.get(id)
    if (!d) return false
    d.priority = priority
    this.rebuildOrder()
    return true
  }

  setPhase(id: string, phase: DisposePhase2): boolean {
    const d = this.disposables.get(id)
    if (!d) return false
    d.phase = phase
    return true
  }

  getOrder(): string[] { return [...this.order] }

  listen(fn: (event: string, id: string) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, id: string): void {
    this.listeners.forEach(fn => fn(event, id))
  }

  reset(id: string): boolean {
    const d = this.disposables.get(id)
    if (!d) return false
    d.status = 'registered'
    d.error = null
    return true
  }

  getStats(): { total: number; pending: number; disposed: number; failed: number } {
    return {
      total: this.disposables.size,
      pending: this.getPending().length,
      disposed: this.getDisposed().length,
      failed: this.getFailed().length,
    }
  }

  count(): number { return this.disposables.size }

  toArray(): Disposable2[] { return Array.from(this.disposables.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): DisposeManager2 {
    const dm = new DisposeManager2()
    this.disposables.forEach((d, id) => dm.disposables.set(id, { ...d }))
    dm.order = [...this.order]
    dm.seqCounter = this.seqCounter
    return dm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof DisposeManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.disposables.clear()
    this.order = []
    this.listeners = []
    this.seqCounter = 0
  }
}
