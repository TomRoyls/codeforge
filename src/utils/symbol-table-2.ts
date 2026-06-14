export type SymbolKind2 = 'function' | 'class' | 'variable' | 'interface' | 'type' | 'enum' | 'namespace' | 'parameter'

export interface SymbolEntry2 {
  id: number
  name: string
  kind: SymbolKind2
  scope: string
  type: string
  line: number
  column: number
  exported: boolean
  references: number
  metadata: Record<string, unknown>
}

export interface Scope2 {
  id: string
  name: string
  parentId: string | null
  symbols: Map<string, number>
  children: string[]
}

export class SymbolTable2 {
  private symbols: Map<number, SymbolEntry2> = new Map()
  private scopes: Map<string, Scope2> = new Map()
  private nameIndex: Map<string, Set<number>> = new Map()
  private scopeIndex: Map<string, Set<number>> = new Map()
  private idCounter = 0
  private scopeIdCounter = 0
  private currentScopeId: string

  constructor() {
    this.currentScopeId = this.createScope('global', null)
  }

  createScope(name: string, parentId: string | null = null): string {
    const id = `scope_${++this.scopeIdCounter}`
    const scope: Scope2 = { id, name, parentId, symbols: new Map(), children: [] }
    this.scopes.set(id, scope)
    if (parentId && this.scopes.has(parentId)) {
      this.scopes.get(parentId)!.children.push(id)
    }
    return id
  }

  enterScope(scopeId: string): boolean {
    if (!this.scopes.has(scopeId)) return false
    this.currentScopeId = scopeId
    return true
  }

  exitScope(): string | null {
    const current = this.scopes.get(this.currentScopeId)
    if (!current || !current.parentId) return null
    this.currentScopeId = current.parentId
    return this.currentScopeId
  }

  getCurrentScope(): string { return this.currentScopeId }

  define(name: string, kind: SymbolKind2, type = '', line = 0, column = 0, exported = false): number {
    const id = ++this.idCounter
    const entry: SymbolEntry2 = {
      id, name, kind, type, line, column, exported,
      scope: this.currentScopeId,
      references: 0,
      metadata: {},
    }
    this.symbols.set(id, entry)
    const scope = this.scopes.get(this.currentScopeId)!
    scope.symbols.set(name, id)
    if (!this.nameIndex.has(name)) this.nameIndex.set(name, new Set())
    this.nameIndex.get(name)!.add(id)
    if (!this.scopeIndex.has(this.currentScopeId)) this.scopeIndex.set(this.currentScopeId, new Set())
    this.scopeIndex.get(this.currentScopeId)!.add(id)
    return id
  }

  lookup(name: string): SymbolEntry2 | undefined {
    let scopeId: string | null = this.currentScopeId
    while (scopeId) {
      const scope = this.scopes.get(scopeId)
      if (!scope) break
      if (scope.symbols.has(name)) {
        const id = scope.symbols.get(name)!
        const entry = this.symbols.get(id)!
        entry.references++
        return entry
      }
      scopeId = scope.parentId
    }
    return undefined
  }

  get(id: number): SymbolEntry2 | undefined { return this.symbols.get(id) }

  getByName(name: string): SymbolEntry2[] {
    const ids = this.nameIndex.get(name)
    if (!ids) return []
    return Array.from(ids).map(id => this.symbols.get(id)).filter(Boolean) as SymbolEntry2[]
  }

  getByScope(scopeId: string): SymbolEntry2[] {
    const ids = this.scopeIndex.get(scopeId)
    if (!ids) return []
    return Array.from(ids).map(id => this.symbols.get(id)).filter(Boolean) as SymbolEntry2[]
  }

  getByKind(kind: SymbolKind2): SymbolEntry2[] {
    return Array.from(this.symbols.values()).filter(s => s.kind === kind)
  }

  getExported(): SymbolEntry2[] {
    return Array.from(this.symbols.values()).filter(s => s.exported)
  }

  remove(id: number): boolean {
    const entry = this.symbols.get(id)
    if (!entry) return false
    this.symbols.delete(id)
    this.nameIndex.get(entry.name)?.delete(id)
    this.scopeIndex.get(entry.scope)?.delete(id)
    const scope = this.scopes.get(entry.scope)
    if (scope) scope.symbols.delete(entry.name)
    return true
  }

  setMetadata(id: number, key: string, value: unknown): boolean {
    const entry = this.symbols.get(id)
    if (!entry) return false
    entry.metadata[key] = value
    return true
  }

  resolveScope(scopeName: string): Scope2 | undefined {
    return Array.from(this.scopes.values()).find(s => s.name === scopeName)
  }

  getScope(id: string): Scope2 | undefined { return this.scopes.get(id) }
  getAllScopes(): Scope2[] { return Array.from(this.scopes.values()) }

  getMostReferenced(n = 10): SymbolEntry2[] {
    return Array.from(this.symbols.values())
      .sort((a, b) => b.references - a.references)
      .slice(0, n)
  }

  getUnused(): SymbolEntry2[] {
    return Array.from(this.symbols.values()).filter(s => s.references === 0 && !s.exported)
  }

  count(): number { return this.symbols.size }
  getScopeCount(): number { return this.scopes.size }

  toArray(): SymbolEntry2[] { return Array.from(this.symbols.values()) }
  toString(): string { return JSON.stringify({ symbols: this.count(), scopes: this.getScopeCount() }) }
  toJSON(): Record<string, unknown> { return { symbols: this.count(), scopes: this.getScopeCount(), unused: this.getUnused().length } }
  clone(): SymbolTable2 {
    const st = new SymbolTable2()
    this.symbols.forEach((s, id) => st.symbols.set(id, { ...s, metadata: { ...s.metadata } }))
    this.scopes.forEach((s, id) => st.scopes.set(id, { ...s, symbols: new Map(s.symbols), children: [...s.children] }))
    this.nameIndex.forEach((s, name) => st.nameIndex.set(name, new Set(s)))
    this.scopeIndex.forEach((s, scope) => st.scopeIndex.set(scope, new Set(s)))
    st.idCounter = this.idCounter
    st.scopeIdCounter = this.scopeIdCounter
    st.currentScopeId = this.currentScopeId
    return st
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SymbolTable2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.symbols.clear()
    this.scopes.clear()
    this.nameIndex.clear()
    this.scopeIndex.clear()
    this.idCounter = 0
    this.scopeIdCounter = 0
    this.currentScopeId = this.createScope('global', null)
  }
}
