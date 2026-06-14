export type FiberState2 = 'created' | 'suspended' | 'running' | 'yielded' | 'done' | 'errored'

export interface Fiber2 {
  id: string
  name: string
  state: FiberState2
  priority: number
  yieldCount: number
  createdAt: number
  lastRunAt: number | null
  result: unknown
  error: string | null
  gen: Generator
  parentId: string | null
}

export class FiberScheduler2 {
  private fibers: Map<string, Fiber2> = new Map()
  private ready: string[] = []
  private idCounter = 0
  private listeners: Array<(event: string, fiber: Fiber2) => void> = []

  spawn(name: string, genFn: () => Generator, priority = 0, parentId: string | null = null): string {
    const id = `fiber_${++this.idCounter}`
    const fiber: Fiber2 = {
      id, name, priority, parentId,
      state: 'created',
      yieldCount: 0,
      createdAt: Date.now(),
      lastRunAt: null,
      result: undefined,
      error: null,
      gen: genFn(),
    }
    this.fibers.set(id, fiber)
    this.ready.push(id)
    this.sortReady()
    this.notify('spawned', fiber)
    return id
  }

  private sortReady(): void {
    this.ready.sort((a, b) => {
      const fa = this.fibers.get(a)!
      const fb = this.fibers.get(b)!
      return fb.priority - fa.priority
    })
  }

  step(id: string): boolean {
    const fiber = this.fibers.get(id)
    if (!fiber || fiber.state === 'done' || fiber.state === 'errored') return false
    fiber.state = 'running'
    fiber.lastRunAt = Date.now()
    try {
      const result = fiber.gen.next()
      if (result.done) {
        fiber.state = 'done'
        fiber.result = result.value
        this.ready = this.ready.filter(rid => rid !== id)
        this.notify('done', fiber)
      } else {
        fiber.state = 'yielded'
        fiber.yieldCount++
        this.notify('yielded', fiber)
      }
    } catch (e) {
      fiber.state = 'errored'
      fiber.error = String(e)
      this.ready = this.ready.filter(rid => rid !== id)
      this.notify('errored', fiber)
    }
    return true
  }

  runOne(): boolean {
    if (this.ready.length === 0) return false
    const id = this.ready.shift()!
    const fiber = this.fibers.get(id)
    if (!fiber || fiber.state === 'done' || fiber.state === 'errored') return this.runOne()
    this.step(id)
    if (fiber.state === 'yielded') {
      this.ready.push(id)
      this.sortReady()
    }
    return true
  }

  runAll(): number {
    let count = 0
    while (this.runOne()) count++
    return count
  }

  runUntilDone(maxSteps = 100000): number {
    let count = 0
    while (this.ready.length > 0 && count < maxSteps) {
      this.runOne()
      count++
    }
    return count
  }

  yield(id: string): boolean {
    const fiber = this.fibers.get(id)
    if (!fiber) return false
    fiber.state = 'suspended'
    this.ready = this.ready.filter(rid => rid !== id)
    this.notify('suspended', fiber)
    return true
  }

  resume(id: string): boolean {
    const fiber = this.fibers.get(id)
    if (!fiber || fiber.state !== 'suspended') return false
    fiber.state = 'yielded'
    this.ready.push(id)
    this.sortReady()
    this.notify('resumed', fiber)
    return true
  }

  cancel(id: string): boolean {
    const fiber = this.fibers.get(id)
    if (!fiber || fiber.state === 'done') return false
    fiber.state = 'done'
    this.ready = this.ready.filter(rid => rid !== id)
    this.notify('cancelled', fiber)
    return true
  }

  get(id: string): Fiber2 | undefined { return this.fibers.get(id) }
  getState(id: string): FiberState2 | undefined { return this.fibers.get(id)?.state }
  getResult(id: string): unknown { return this.fibers.get(id)?.result }

  getByState(state: FiberState2): Fiber2[] {
    return Array.from(this.fibers.values()).filter(f => f.state === state)
  }

  getActive(): Fiber2[] {
    return Array.from(this.fibers.values()).filter(f => f.state === 'running' || f.state === 'yielded')
  }

  getChildren(parentId: string): Fiber2[] {
    return Array.from(this.fibers.values()).filter(f => f.parentId === parentId)
  }

  setPriority(id: string, priority: number): boolean {
    const fiber = this.fibers.get(id)
    if (!fiber) return false
    fiber.priority = priority
    this.sortReady()
    return true
  }

  listen(fn: (event: string, fiber: Fiber2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, fiber: Fiber2): void {
    this.listeners.forEach(fn => fn(event, fiber))
  }

  getStats(): { total: number; ready: number; active: number; done: number; errored: number } {
    return {
      total: this.fibers.size,
      ready: this.ready.length,
      active: this.getActive().length,
      done: this.getByState('done').length,
      errored: this.getByState('errored').length,
    }
  }

  count(): number { return this.fibers.size }

  toArray(): Fiber2[] { return Array.from(this.fibers.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): FiberScheduler2 {
    const fs = new FiberScheduler2()
    this.fibers.forEach((f, id) => fs.fibers.set(id, { ...f }))
    fs.ready = [...this.ready]
    fs.idCounter = this.idCounter
    return fs
  }
  equals(other: unknown): boolean {
    if (!(other instanceof FiberScheduler2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.fibers.clear()
    this.ready = []
    this.listeners = []
    this.idCounter = 0
  }
}
