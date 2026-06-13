export interface CommandEntry2 {
  id: number
  command: string
  args: string[]
  timestamp: number
  exitCode: number | null
  output: string
}

export class CommandHistory2 {
  private entries: CommandEntry2[] = []
  private idCounter = 0
  private maxSize: number
  private cursor: number = -1

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
  }

  add(command: string, args: string[] = [], exitCode: number | null = null, output = ''): CommandEntry2 {
    const entry: CommandEntry2 = {
      id: ++this.idCounter,
      command, args, exitCode, output,
      timestamp: Date.now(),
    }
    this.entries.push(entry)
    if (this.entries.length > this.maxSize) {
      this.entries.shift()
    }
    this.cursor = this.entries.length
    return entry
  }

  get(id: number): CommandEntry2 | undefined {
    return this.entries.find(e => e.id === id)
  }

  search(query: string): CommandEntry2[] {
    const lower = query.toLowerCase()
    return this.entries.filter(e => e.command.toLowerCase().includes(lower))
  }

  getRecent(n: number): CommandEntry2[] {
    return this.entries.slice(-n)
  }

  getSuccessful(): CommandEntry2[] {
    return this.entries.filter(e => e.exitCode === 0)
  }

  getFailed(): CommandEntry2[] {
    return this.entries.filter(e => e.exitCode !== null && e.exitCode !== 0)
  }

  getUnique(): string[] {
    const seen = new Set<string>()
    this.entries.forEach(e => seen.add(e.command))
    return Array.from(seen)
  }

  getFrequency(): Map<string, number> {
    const freq = new Map<string, number>()
    this.entries.forEach(e => freq.set(e.command, (freq.get(e.command) ?? 0) + 1))
    return freq
  }

  navigatePrevious(): CommandEntry2 | null {
    if (this.cursor < 0) this.cursor = this.entries.length
    if (this.cursor > 0) {
      this.cursor--
      return this.entries[this.cursor] ?? null
    }
    return null
  }

  navigateNext(): CommandEntry2 | null {
    if (this.cursor >= this.entries.length - 1) {
      this.cursor = this.entries.length
      return null
    }
    this.cursor++
    return this.entries[this.cursor] ?? null
  }

  resetCursor(): void { this.cursor = this.entries.length }

  clear(): void {
    this.entries = []
    this.idCounter = 0
    this.cursor = -1
  }

  count(): number { return this.entries.length }
  getMaxSize(): number { return this.maxSize }
  setMaxSize(size: number): this {
    this.maxSize = size
    while (this.entries.length > size) this.entries.shift()
    return this
  }

  toArray(): CommandEntry2[] { return [...this.entries] }
  toString(): string { return JSON.stringify({ entries: this.count() }) }
  toJSON(): Record<string, unknown> { return { entries: this.count(), unique: this.getUnique().length } }
  clone(): CommandHistory2 {
    const ch = new CommandHistory2(this.maxSize)
    ch.entries = [...this.entries]
    ch.idCounter = this.idCounter
    ch.cursor = this.cursor
    return ch
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CommandHistory2)) return false
    return this.count() === other.count()
  }
}
