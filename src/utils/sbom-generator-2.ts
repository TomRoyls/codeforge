export type SBOMFormat2 = 'SPDX-2.3' | 'CycloneDX-3.0' | 'SWID'
export type SBOMStatus2 = 'draft' | 'final' | 'published' | 'deprecated'

export interface SBOMComponent2 {
  id: string
  name: string
  version: string
  type: 'library' | 'application' | 'framework' | 'container' | 'operating-system' | 'device' | 'file' | 'data'
  supplier: string
  licenses: string[]
  hashes: Record<string, string>
  purl: string
  cpe: string
  dependencies: string[]
  scope: 'required' | 'optional' | 'excluded'
}

export class SBOMGenerator2 {
  private components: Map<string, SBOMComponent2> = new Map()
  private metadata: Map<string, string> = new Map()
  private format: SBOMFormat2 = 'SPDX-2.3'
  private status: SBOMStatus2 = 'draft'
  private creationDate: number = Date.now()
  private tools: string[] = []

  setFormat(format: SBOMFormat2): this { this.format = format; return this }
  getFormat(): SBOMFormat2 { return this.format }

  setStatus(status: SBOMStatus2): this { this.status = status; return this }
  getStatus(): SBOMStatus2 { return this.status }

  addTool(tool: string): this { this.tools.push(tool); return this }
  getTools(): string[] { return [...this.tools] }

  setMetadata(key: string, value: string): this { this.metadata.set(key, value); return this }
  getMetadata(key: string): string | undefined { return this.metadata.get(key) }

  addComponent(component: Omit<SBOMComponent2, 'id'> & { id?: string }): string {
    const id = component.id ?? `component_${this.components.size + 1}`
    this.components.set(id, { ...component, id })
    return id
  }

  getComponent(id: string): SBOMComponent2 | undefined { return this.components.get(id) }

  getByName(name: string): SBOMComponent2[] {
    return Array.from(this.components.values()).filter(c => c.name === name)
  }

  getByType(type: SBOMComponent2['type']): SBOMComponent2[] {
    return Array.from(this.components.values()).filter(c => c.type === type)
  }

  getByScope(scope: SBOMComponent2['scope']): SBOMComponent2[] {
    return Array.from(this.components.values()).filter(c => c.scope === scope)
  }

  getByLicense(license: string): SBOMComponent2[] {
    return Array.from(this.components.values()).filter(c => c.licenses.includes(license))
  }

  addDependency(id: string, depId: string): boolean {
    const c = this.components.get(id)
    if (!c) return false
    if (!c.dependencies.includes(depId)) c.dependencies.push(depId)
    return true
  }

  removeDependency(id: string, depId: string): boolean {
    const c = this.components.get(id)
    if (!c) return false
    const idx = c.dependencies.indexOf(depId)
    if (idx === -1) return false
    c.dependencies.splice(idx, 1)
    return true
  }

  getDependencies(id: string): SBOMComponent2[] {
    const c = this.components.get(id)
    if (!c) return []
    return c.dependencies.map(d => this.components.get(d)).filter(Boolean) as SBOMComponent2[]
  }

  getDependents(id: string): SBOMComponent2[] {
    return Array.from(this.components.values()).filter(c => c.dependencies.includes(id))
  }

  getRootComponents(): SBOMComponent2[] {
    const allDeps = new Set<string>()
    this.components.forEach(c => c.dependencies.forEach(d => allDeps.add(d)))
    return Array.from(this.components.values()).filter(c => !allDeps.has(c.id))
  }

  getLeafComponents(): SBOMComponent2[] {
    return Array.from(this.components.values()).filter(c => c.dependencies.length === 0)
  }

  getOrphaned(): SBOMComponent2[] {
    return this.components.size > 0 ? this.getRootComponents().filter(c => c.dependencies.length === 0 && this.getDependents(c.id).length === 0) : []
  }

  exportJSON(): Record<string, unknown> {
    return {
      format: this.format,
      status: this.status,
      creationDate: this.creationDate,
      tools: this.tools,
      metadata: Object.fromEntries(this.metadata),
      components: Array.from(this.components.values()),
    }
  }

  exportSPDX(): Record<string, unknown> {
    return {
      spdxVersion: 'SPDX-2.3',
      dataLicense: 'CC0-1.0',
      SPDXID: 'SPDXRef-DOCUMENT',
      name: this.metadata.get('name') ?? 'unknown',
      creationInfo: { created: new Date(this.creationDate).toISOString(), creators: this.tools },
      packages: Array.from(this.components.values()).map(c => ({
        SPDXID: `SPDXRef-${c.id}`,
        name: c.name,
        versionInfo: c.version,
        downloadLocation: c.purl,
        licenseConcluded: c.licenses[0] ?? 'NOASSERTION',
      })),
    }
  }

  exportCycloneDX(): Record<string, unknown> {
    return {
      bomFormat: 'CycloneDX',
      specVersion: '1.4',
      version: 1,
      metadata: { timestamp: new Date(this.creationDate).toISOString(), tools: this.tools.map(t => ({ name: t })) },
      components: Array.from(this.components.values()).map(c => ({
        type: c.type,
        'bom-ref': c.id,
        name: c.name,
        version: c.version,
        purl: c.purl,
        licenses: c.licenses.map(l => ({ license: { id: l } })),
      })),
    }
  }

  getSummary(): { totalComponents: number; byType: Record<string, number>; byScope: Record<string, number> } {
    const byType: Record<string, number> = {}
    const byScope: Record<string, number> = {}
    this.components.forEach(c => {
      byType[c.type] = (byType[c.type] ?? 0) + 1
      byScope[c.scope] = (byScope[c.scope] ?? 0) + 1
    })
    return { totalComponents: this.components.size, byType, byScope }
  }

  remove(id: string): boolean { return this.components.delete(id) }
  count(): number { return this.components.size }

  toArray(): SBOMComponent2[] { return Array.from(this.components.values()) }
  toString(): string { return JSON.stringify(this.getSummary()) }
  toJSON(): Record<string, unknown> { return this.getSummary() }
  clone(): SBOMGenerator2 {
    const sg = new SBOMGenerator2()
    sg.format = this.format
    sg.status = this.status
    sg.creationDate = this.creationDate
    sg.tools = [...this.tools]
    this.metadata.forEach((v, k) => sg.metadata.set(k, v))
    this.components.forEach((c, id) => sg.components.set(id, { ...c, licenses: [...c.licenses], hashes: { ...c.hashes }, dependencies: [...c.dependencies] }))
    return sg
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SBOMGenerator2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.components.clear()
    this.metadata.clear()
    this.tools = []
    this.status = 'draft'
  }
}
