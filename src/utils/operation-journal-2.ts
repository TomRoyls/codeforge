export interface JournalEntry2<T = unknown> {
  id: number
  operation: string
  data: T
  timestamp: number
  undone: boolean
}

export class OperationJournal2<T = unknown> {
  private entries: JournalEntry2<T>[] = []
  private idCounter = 0
  private maxSize: number
  private operationFilter: Set<string> | null = null

  constructor(maxSize = 10000) {
    this.maxSize = maxSize
  }

  record(operation: string, data: T): JournalEntry2<T> {
    const entry: JournalEntry2<T> = {
      id: ++this.idCounter,
      operation, data,
      timestamp: Date.now(),
      undone: false,
    }
    this.entries.push(entry)
    if (this.entries.length > this.maxSize) this.entries.shift()
    return entry
  }

  get(id: number): JournalEntry2<T> | undefined {
    return this.entries.find(e => e.id === id)
  }

  getByOperation(operation: string): JournalEntry2<T>[] {
    return this.entries.filter(e => e.operation === operation)
  }

  getByTimeRange(start: number, end: number): JournalEntry2<T>[] {
    return this.entries.filter(e => e.timestamp >= start && e.timestamp <= end)
  }

  markUndone(id: number): boolean {
    const entry = this.get(id)
    if (!entry) return false
    entry.undone = true
    return true
  }

  getUndone(): JournalEntry2<T>[] {
    return this.entries.filter(e => e.undone)
  }

  getActive(): JournalEntry2<T>[] {
    return this.entries.filter(e => !e.undone)
  }

  getRecent(n: number): JournalEntry2<T>[] {
    return this.entries.slice(-n)
  }

  search(query: string): JournalEntry2<T>[] {
    const lower = query.toLowerCase()
    return this.entries.filter(e => e.operation.toLowerCase().includes(lower))
  }

  getFrequency(): Map<string, number> {
    const freq = new Map<string, number>()
    this.entries.forEach(e => freq.set(e.operation, (freq.get(e.operation) ?? 0) + 1))
    return freq
  }

  getOperations(): string[] {
    return Array.from(new Set(this.entries.map(e => e.operation)))
  }

  setFilter(operations: string[]): this {
    this.operationFilter = new Set(operations)
    return this
  }

  clearFilter(): this {
    this.operationFilter = null
    return this
  }

  getFiltered(): JournalEntry2<T>[] {
    if (!this.operationFilter) return [...this.entries]
    return this.entries.filter(e => this.operationFilter!.has(e.operation))
  }

  compact(): number {
    const before = this.entries.length
    this.entries = this.entries.filter(e => !e.undone)
    return before - this.entries.length
  }

  count(): number { return this.entries.length }
  getMaxSize(): number { return this.maxSize }
  setMaxSize(size: number): this {
    this.maxSize = size
    while (this.entries.length > size) this.entries.shift()
    return this
  }

  toArray(): JournalEntry2<T>[] { return [...this.entries] }
  toString(): string { return JSON.stringify({ entries: this.count(), operations: this.getOperations().length }) }
  toJSON(): Record<string, unknown> { return { entries: this.count(), operations: this.getOperations().length, undone: this.getUndone().length } }
  clone(): OperationJournal2<T> {
    const j = new OperationJournal2<T>(this.maxSize)
    j.entries = [...this.entries]
    j.idCounter = this.idCounter
    j.operationFilter = this.operationFilter ? new Set(this.operationFilter) : null
    return j
  }
  equals(other: unknown): boolean {
    if (!(other instanceof OperationJournal2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.entries = []
    this.idCounter = 0
    this.operationFilter = null
  }
}
