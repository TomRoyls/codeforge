export type WalEntryType2 = 'insert' | 'update' | 'delete'

export interface WalEntry2 {
  lsn: number
  type: WalEntryType2
  table: string
  key: string
  before: unknown
  after: unknown
  timestamp: number
  committed: boolean
}

export class WriteAheadLog2 {
  private entries: WalEntry2[] = []
  private lsnCounter = 0
  private pendingTransactions: Map<string, number[]> = new Map()
  private checkpointLsn = 0
  private maxSize: number

  constructor(maxSize = 100000) {
    this.maxSize = maxSize
  }

  begin(txnId: string): this {
    this.pendingTransactions.set(txnId, [])
    return this
  }

  append(txnId: string, type: WalEntryType2, table: string, key: string, before: unknown = null, after: unknown = null): number {
    const lsn = ++this.lsnCounter
    const entry: WalEntry2 = {
      lsn, type, table, key, before, after,
      timestamp: Date.now(), committed: false,
    }
    this.entries.push(entry)
    const txn = this.pendingTransactions.get(txnId)
    if (txn) txn.push(lsn)
    this.enforceMaxSize()
    return lsn
  }

  commit(txnId: string): WalEntry2[] {
    const lsns = this.pendingTransactions.get(txnId)
    if (!lsns) return []
    const committed = lsns.map(lsn => {
      const entry = this.entries.find(e => e.lsn === lsn)
      if (entry) entry.committed = true
      return entry
    }).filter(Boolean) as WalEntry2[]
    this.pendingTransactions.delete(txnId)
    return committed
  }

  rollback(txnId: string): WalEntry2[] {
    const lsns = this.pendingTransactions.get(txnId)
    if (!lsns) return []
    const rolledBack: WalEntry2[] = []
    lsns.forEach(lsn => {
      const idx = this.entries.findIndex(e => e.lsn === lsn)
      if (idx !== -1) {
        rolledBack.push(this.entries[idx])
        this.entries.splice(idx, 1)
      }
    })
    this.pendingTransactions.delete(txnId)
    return rolledBack
  }

  getEntry(lsn: number): WalEntry2 | undefined {
    return this.entries.find(e => e.lsn === lsn)
  }

  getCommitted(): WalEntry2[] {
    return this.entries.filter(e => e.committed)
  }

  getUncommitted(): WalEntry2[] {
    return this.entries.filter(e => !e.committed)
  }

  getByTable(table: string): WalEntry2[] {
    return this.entries.filter(e => e.table === table)
  }

  getByType(type: WalEntryType2): WalEntry2[] {
    return this.entries.filter(e => e.type === type)
  }

  getSince(lsn: number): WalEntry2[] {
    return this.entries.filter(e => e.lsn > lsn)
  }

  getRange(startLsn: number, endLsn: number): WalEntry2[] {
    return this.entries.filter(e => e.lsn >= startLsn && e.lsn <= endLsn)
  }

  checkpoint(lsn?: number): number {
    this.checkpointLsn = lsn ?? this.lsnCounter
    this.entries = this.entries.filter(e => e.lsn > this.checkpointLsn || !e.committed)
    return this.checkpointLsn
  }

  getCheckpointLsn(): number { return this.checkpointLsn }
  getCurrentLsn(): number { return this.lsnCounter }

  replay(handler: (entry: WalEntry2) => void, fromLsn = 0): number {
    let count = 0
    for (const entry of this.entries) {
      if (entry.committed && entry.lsn > fromLsn) {
        handler(entry)
        count++
      }
    }
    return count
  }

  getPendingTransactionCount(): number { return this.pendingTransactions.size }

  count(): number { return this.entries.length }

  toArray(): WalEntry2[] { return [...this.entries] }
  toString(): string { return JSON.stringify({ entries: this.count(), lsn: this.lsnCounter }) }
  toJSON(): Record<string, unknown> { return { entries: this.count(), lsn: this.lsnCounter, checkpoint: this.checkpointLsn, pending: this.getPendingTransactionCount() } }
  clone(): WriteAheadLog2 {
    const wal = new WriteAheadLog2(this.maxSize)
    wal.entries = [...this.entries]
    wal.lsnCounter = this.lsnCounter
    wal.checkpointLsn = this.checkpointLsn
    this.pendingTransactions.forEach((lsns, id) => wal.pendingTransactions.set(id, [...lsns]))
    return wal
  }
  equals(other: unknown): boolean {
    if (!(other instanceof WriteAheadLog2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.entries = []
    this.lsnCounter = 0
    this.checkpointLsn = 0
    this.pendingTransactions.clear()
  }

  private enforceMaxSize(): void {
    while (this.entries.length > this.maxSize) {
      this.entries.shift()
    }
  }
}
