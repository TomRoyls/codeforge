export type DeclarationType2 = 'function' | 'class' | 'variable' | 'interface' | 'type' | 'enum' | 'const' | 'let' | 'var'

export interface Declaration2 {
  id: string
  name: string
  type: DeclarationType2
  file: string
  line: number
  exported: boolean
  used: boolean
  usageCount: number
  usedIn: Set<string>
  size: number
}

export class DeadCodeDetector2 {
  private declarations: Map<string, Declaration2> = new Map()
  private entryPoints: Set<string> = new Set()
  private analyzed = false

  declare(id: string, name: string, type: DeclarationType2, file: string, line: number, exported = false, size = 0): this {
    this.declarations.set(id, {
      id, name, type, file, line, exported,
      used: false, usageCount: 0,
      usedIn: new Set(), size,
    })
    return this
  }

  addUsage(declId: string, usedInFile: string): boolean {
    const decl = this.declarations.get(declId)
    if (!decl) return false
    decl.used = true
    decl.usageCount++
    decl.usedIn.add(usedInFile)
    return true
  }

  addEntryPoint(declId: string): boolean {
    if (!this.declarations.has(declId)) return false
    this.entryPoints.add(declId)
    const decl = this.declarations.get(declId)!
    decl.used = true
    return true
  }

  analyze(): this {
    this.declarations.forEach(decl => {
      if (decl.exported) decl.used = true
      if (this.entryPoints.has(decl.id)) decl.used = true
    })
    this.analyzed = true
    return this
  }

  getDeadCode(): Declaration2[] {
    if (!this.analyzed) this.analyze()
    return Array.from(this.declarations.values()).filter(d => !d.used)
  }

  getDeadCodeByFile(): Map<string, Declaration2[]> {
    const result = new Map<string, Declaration2[]>()
    this.getDeadCode().forEach(d => {
      const existing = result.get(d.file) ?? []
      existing.push(d)
      result.set(d.file, existing)
    })
    return result
  }

  getDeadCodeStats(): { total: number; dead: number; live: number; deadSize: number; totalSize: number } {
    const dead = this.getDeadCode()
    const deadSize = dead.reduce((sum, d) => sum + d.size, 0)
    const totalSize = Array.from(this.declarations.values()).reduce((sum, d) => sum + d.size, 0)
    return {
      total: this.declarations.size,
      dead: dead.length,
      live: this.declarations.size - dead.length,
      deadSize,
      totalSize,
    }
  }

  getDeadCodePercentage(): number {
    if (this.declarations.size === 0) return 0
    return (this.getDeadCode().length / this.declarations.size) * 100
  }

  getDeadCodeByType(): Record<DeclarationType2, number> {
    const result: Record<DeclarationType2, number> = {
      function: 0, class: 0, variable: 0, interface: 0, type: 0, enum: 0, const: 0, let: 0, var: 0,
    }
    this.getDeadCode().forEach(d => { result[d.type]++ })
    return result
  }

  getMostUsed(n = 10): Declaration2[] {
    return Array.from(this.declarations.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, n)
  }

  getLeastUsed(n = 10): Declaration2[] {
    return Array.from(this.declarations.values())
      .filter(d => d.used)
      .sort((a, b) => a.usageCount - b.usageCount)
      .slice(0, n)
  }

  getDeclaration(id: string): Declaration2 | undefined { return this.declarations.get(id) }

  getByName(name: string): Declaration2[] {
    return Array.from(this.declarations.values()).filter(d => d.name === name)
  }

  getByFile(file: string): Declaration2[] {
    return Array.from(this.declarations.values()).filter(d => d.file === file)
  }

  getByType(type: DeclarationType2): Declaration2[] {
    return Array.from(this.declarations.values()).filter(d => d.type === type)
  }

  removeDeclaration(id: string): boolean { return this.declarations.delete(id) }

  getEntryPoints(): string[] { return Array.from(this.entryPoints) }

  isDead(id: string): boolean {
    if (!this.analyzed) this.analyze()
    const decl = this.declarations.get(id)
    return decl ? !decl.used : false
  }

  count(): number { return this.declarations.size }
  getDeadCount(): number { return this.getDeadCode().length }

  toArray(): Declaration2[] { return Array.from(this.declarations.values()) }
  toString(): string { return JSON.stringify(this.getDeadCodeStats()) }
  toJSON(): Record<string, unknown> { return this.getDeadCodeStats() }
  clone(): DeadCodeDetector2 {
    const d = new DeadCodeDetector2()
    this.declarations.forEach((decl, id) => {
      d.declarations.set(id, { ...decl, usedIn: new Set(decl.usedIn) })
    })
    this.entryPoints.forEach(ep => d.entryPoints.add(ep))
    d.analyzed = this.analyzed
    return d
  }
  equals(other: unknown): boolean {
    if (!(other instanceof DeadCodeDetector2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.declarations.clear()
    this.entryPoints.clear()
    this.analyzed = false
  }
}
