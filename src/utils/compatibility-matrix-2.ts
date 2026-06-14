export type CompatLevel2 = 'compatible' | 'partial' | 'incompatible' | 'unknown'
export type Platform2 = 'node' | 'browser' | 'deno' | 'bun' | 'worker'

export interface CompatResult2 {
  package: string
  version: string
  platform: Platform2
  level: CompatLevel2
  issues: string[]
  polyfills: string[]
  minRuntime: string
}

export class CompatibilityMatrix2 {
  private results: Map<string, CompatResult2> = new Map()
  private runtimeVersion: Map<Platform2, string> = new Map()
  private polyfillMap: Map<string, string[]> = new Map()

  setRuntimeVersion(platform: Platform2, version: string): this {
    this.runtimeVersion.set(platform, version)
    return this
  }

  getRuntimeVersion(platform: Platform2): string | undefined { return this.runtimeVersion.get(platform) }

  registerPolyfill(feature: string, polyfills: string[]): this {
    this.polyfillMap.set(feature, polyfills)
    return this
  }

  check(packageName: string, version: string, platform: Platform2, issues: string[] = [], minRuntime = ''): CompatResult2 {
    const level: CompatLevel2 = issues.length === 0 ? 'compatible' : issues.length <= 2 ? 'partial' : 'incompatible'
    const polyfills: string[] = []
    issues.forEach(issue => {
      const pf = this.polyfillMap.get(issue)
      if (pf) polyfills.push(...pf)
    })
    const key = `${packageName}@${version}:${platform}`
    const result: CompatResult2 = { package: packageName, version, platform, level, issues, polyfills, minRuntime }
    this.results.set(key, result)
    return result
  }

  get(packageName: string, version: string, platform: Platform2): CompatResult2 | undefined {
    return this.results.get(`${packageName}@${version}:${platform}`)
  }

  getByPackage(packageName: string): CompatResult2[] {
    return Array.from(this.results.values()).filter(r => r.package === packageName)
  }

  getByPlatform(platform: Platform2): CompatResult2[] {
    return Array.from(this.results.values()).filter(r => r.platform === platform)
  }

  getByLevel(level: CompatLevel2): CompatResult2[] {
    return Array.from(this.results.values()).filter(r => r.level === level)
  }

  getCompatible(): CompatResult2[] { return this.getByLevel('compatible') }
  getIncompatible(): CompatResult2[] { return this.getByLevel('incompatible') }
  getPartial(): CompatResult2[] { return this.getByLevel('partial') }

  isCompatible(packageName: string, version: string, platform: Platform2): boolean {
    const r = this.get(packageName, version, platform)
    return r ? r.level === 'compatible' : false
  }

  getPolyfillsFor(packageName: string, version: string, platform: Platform2): string[] {
    const r = this.get(packageName, version, platform)
    return r ? r.polyfills : []
  }

  getPlatformCoverage(platform: Platform2): number {
    const platformResults = this.getByPlatform(platform)
    if (platformResults.length === 0) return 0
    const compatible = platformResults.filter(r => r.level === 'compatible').length
    return compatible / platformResults.length
  }

  getOverallCoverage(): number {
    if (this.results.size === 0) return 0
    return this.getCompatible().length / this.results.size
  }

  getStats(): Record<CompatLevel2, number> {
    return {
      compatible: this.getCompatible().length,
      partial: this.getPartial().length,
      incompatible: this.getIncompatible().length,
      unknown: this.getByLevel('unknown').length,
    }
  }

  remove(key: string): boolean { return this.results.delete(key) }
  count(): number { return this.results.size }

  toArray(): CompatResult2[] { return Array.from(this.results.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): CompatibilityMatrix2 {
    const cm = new CompatibilityMatrix2()
    this.results.forEach((r, k) => cm.results.set(k, { ...r, issues: [...r.issues], polyfills: [...r.polyfills] }))
    this.runtimeVersion.forEach((v, p) => cm.runtimeVersion.set(p, v))
    this.polyfillMap.forEach((pf, f) => cm.polyfillMap.set(f, [...pf]))
    return cm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CompatibilityMatrix2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.results.clear()
    this.runtimeVersion.clear()
    this.polyfillMap.clear()
  }
}
