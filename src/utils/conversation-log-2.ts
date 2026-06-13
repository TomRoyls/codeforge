export interface ConversationTurn2 {
  id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  metadata: Record<string, unknown>
}

export class ConversationLog2 {
  private turns: ConversationTurn2[] = []
  private idCounter = 0
  private maxTurns: number
  private participants: Set<string> = new Set()

  constructor(maxTurns = 5000) {
    this.maxTurns = maxTurns
  }

  add(role: ConversationTurn2['role'], content: string, metadata: Record<string, unknown> = {}): ConversationTurn2 {
    const turn: ConversationTurn2 = {
      id: ++this.idCounter,
      role, content, metadata,
      timestamp: Date.now(),
    }
    this.turns.push(turn)
    if (this.turns.length > this.maxTurns) {
      this.turns.shift()
    }
    return turn
  }

  user(content: string, metadata?: Record<string, unknown>): ConversationTurn2 {
    return this.add('user', content, metadata)
  }

  assistant(content: string, metadata?: Record<string, unknown>): ConversationTurn2 {
    return this.add('assistant', content, metadata)
  }

  system(content: string, metadata?: Record<string, unknown>): ConversationTurn2 {
    return this.add('system', content, metadata)
  }

  get(id: number): ConversationTurn2 | undefined {
    return this.turns.find(t => t.id === id)
  }

  getByRole(role: ConversationTurn2['role']): ConversationTurn2[] {
    return this.turns.filter(t => t.role === role)
  }

  getRecent(n: number): ConversationTurn2[] {
    return this.turns.slice(-n)
  }

  search(query: string): ConversationTurn2[] {
    const lower = query.toLowerCase()
    return this.turns.filter(t => t.content.toLowerCase().includes(lower))
  }

  getContext(windowSize: number, turnId: number): ConversationTurn2[] {
    const idx = this.turns.findIndex(t => t.id === turnId)
    if (idx === -1) return []
    const start = Math.max(0, idx - windowSize)
    const end = Math.min(this.turns.length, idx + windowSize + 1)
    return this.turns.slice(start, end)
  }

  getWordCount(): number {
    return this.turns.reduce((sum, t) => sum + t.content.split(/\s+/).filter(Boolean).length, 0)
  }

  getCharCount(): number {
    return this.turns.reduce((sum, t) => sum + t.content.length, 0)
  }

  getDuration(): number {
    if (this.turns.length < 2) return 0
    return this.turns[this.turns.length - 1].timestamp - this.turns[0].timestamp
  }

  summarize(): { turns: number; words: number; roles: Record<string, number> } {
    const roles: Record<string, number> = { user: 0, assistant: 0, system: 0 }
    this.turns.forEach(t => { roles[t.role]++ })
    return { turns: this.turns.length, words: this.getWordCount(), roles }
  }

  remove(id: number): boolean {
    const idx = this.turns.findIndex(t => t.id === id)
    if (idx === -1) return false
    this.turns.splice(idx, 1)
    return true
  }

  addParticipant(name: string): this {
    this.participants.add(name)
    return this
  }

  getParticipants(): string[] { return Array.from(this.participants) }

  count(): number { return this.turns.length }
  getMaxTurns(): number { return this.maxTurns }

  clear(): void {
    this.turns = []
    this.idCounter = 0
    this.participants.clear()
  }

  toArray(): ConversationTurn2[] { return [...this.turns] }
  toString(): string { return JSON.stringify(this.summarize()) }
  toJSON(): Record<string, unknown> { return this.summarize() }
  clone(): ConversationLog2 {
    const cl = new ConversationLog2(this.maxTurns)
    cl.turns = [...this.turns]
    cl.idCounter = this.idCounter
    cl.participants = new Set(this.participants)
    return cl
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ConversationLog2)) return false
    return this.count() === other.count()
  }
}
