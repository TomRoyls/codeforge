export interface GrammarRule2 {
  lhs: string
  rhs: string[][]
}

export class Grammar2 {
  private rules: Map<string, string[][]> = new Map()
  private startSymbol: string = ''
  private terminals: Set<string> = new Set()
  private nonTerminals: Set<string> = new Set()

  setStart(symbol: string): this {
    this.startSymbol = symbol
    this.nonTerminals.add(symbol)
    return this
  }

  getStart(): string {
    return this.startSymbol
  }

  addRule(lhs: string, rhs: string[]): this {
    if (!this.rules.has(lhs)) {
      this.rules.set(lhs, [])
    }
    this.rules.get(lhs)!.push(rhs)
    this.nonTerminals.add(lhs)
    for (const sym of rhs) {
      const first = sym[0]
      if (first !== sym[0].toUpperCase() || sym === '_') {
        this.terminals.add(sym)
      } else {
        this.nonTerminals.add(sym)
      }
    }
    return this
  }

  removeRule(lhs: string, rhs: string[]): boolean {
    const productions = this.rules.get(lhs)
    if (!productions) return false
    const idx = productions.findIndex(p => p.length === rhs.length && p.every((s, i) => s === rhs[i]))
    if (idx === -1) return false
    productions.splice(idx, 1)
    if (productions.length === 0) this.rules.delete(lhs)
    return true
  }

  getProductions(lhs: string): string[][] {
    return this.rules.get(lhs) ?? []
  }

  getNonTerminals(): string[] {
    return Array.from(this.nonTerminals)
  }

  getTerminals(): string[] {
    return Array.from(this.terminals)
  }

  isTerminal(symbol: string): boolean {
    return this.terminals.has(symbol)
  }

  isNonTerminal(symbol: string): boolean {
    return this.nonTerminals.has(symbol)
  }

  hasRule(lhs: string): boolean {
    return this.rules.has(lhs)
  }

  count(): number {
    let total = 0
    this.rules.forEach(prods => total += prods.length)
    return total
  }

  getRuleCount(lhs: string): number {
    return this.rules.get(lhs)?.length ?? 0
  }

  getLeftFactoredPrefix(lhs: string): string[] {
    const productions = this.rules.get(lhs)
    if (!productions || productions.length < 2) return []
    const sorted = [...productions].sort()
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const prefix: string[] = []
    const minLen = Math.min(first.length, last.length)
    for (let i = 0; i < minLen; i++) {
      if (first[i] === last[i]) prefix.push(first[i])
      else break
    }
    return prefix
  }

  isLL1(): boolean {
    for (const [lhs] of this.rules) {
      const productions = this.rules.get(lhs)!
      if (productions.length < 2) continue
      const firstSets = productions.map(p => this.computeFirst(p))
      for (let i = 0; i < firstSets.length; i++) {
        for (let j = i + 1; j < firstSets.length; j++) {
          const intersection = firstSets[i].filter(x => firstSets[j].includes(x))
          if (intersection.length > 0) return false
        }
      }
    }
    return true
  }

  computeFirst(symbols: string[]): string[] {
    const result = new Set<string>()
    for (const sym of symbols) {
      if (this.isTerminal(sym)) {
        result.add(sym)
        return Array.from(result)
      }
      const productions = this.rules.get(sym)
      if (!productions) continue
      let hasEpsilon = false
      for (const prod of productions) {
        if (prod.length === 0 || prod[0] === '_') {
          hasEpsilon = true
          continue
        }
        const subFirst = this.computeFirst(prod)
        subFirst.forEach(s => result.add(s))
      }
      if (!hasEpsilon) return Array.from(result)
    }
    return Array.from(result)
  }

  toArray(): string[] { return this.getNonTerminals() }
  toString(): string { return JSON.stringify({ rules: this.count(), start: this.startSymbol }) }
  toJSON(): Record<string, unknown> { return { rules: this.count(), start: this.startSymbol, nonTerminals: this.getNonTerminals() } }
  clone(): Grammar2 {
    const g = new Grammar2().setStart(this.startSymbol)
    this.rules.forEach((prods, lhs) => prods.forEach(rhs => g.addRule(lhs, rhs)))
    return g
  }
  equals(other: unknown): boolean {
    if (!(other instanceof Grammar2)) return false
    return this.count() === other.count()
  }
  clear(): void { this.rules.clear(); this.terminals.clear(); this.nonTerminals.clear(); this.startSymbol = '' }
}
