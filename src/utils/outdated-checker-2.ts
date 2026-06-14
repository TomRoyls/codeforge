export type UpdateType2 = 'major' | 'minor' | 'patch' | 'none'
export type UpdateStatus2 = 'available' | 'up-to-date' | 'deprecated' | 'unsupported'

export interface PackageInfo2 {
  name: string
  currentVersion: string
  latestVersion: string
  type: UpdateType2
  status: UpdateStatus2
  deprecated: boolean
  deprecationReason: string
  releaseDate: number | null
  homepage: string
  repository: string
}

export class OutdatedChecker2 {
  private packages: Map<string, PackageInfo2> = new Map()
  private ignoreList: Set<string> = new Set()
  private pinnedVersions: Map<string, string> = new Map()
  private allowedTypes: Set<UpdateType2> = new Set(['major', 'minor', 'patch'])

  register(name: string, currentVersion: string): this {
    this.packages.set(name, {
      name, currentVersion, latestVersion: currentVersion,
      type: 'none', status: 'up-to-date',
      deprecated: false, deprecationReason: '',
      releaseDate: null, homepage: '', repository: '',
    })
    return this
  }

  setLatest(name: string, version: string, releaseDate: number | null = null): boolean {
    const pkg = this.packages.get(name)
    if (!pkg) return false
    pkg.latestVersion = version
    pkg.releaseDate = releaseDate
    pkg.type = this.compareVersions(pkg.currentVersion, version)
    pkg.status = pkg.type === 'none' ? 'up-to-date' : 'available'
    return true
  }

  markDeprecated(name: string, reason: string): boolean {
    const pkg = this.packages.get(name)
    if (!pkg) return false
    pkg.deprecated = true
    pkg.deprecationReason = reason
    pkg.status = 'deprecated'
    return true
  }

  markUnsupported(name: string): boolean {
    const pkg = this.packages.get(name)
    if (!pkg) return false
    pkg.status = 'unsupported'
    return true
  }

  pin(name: string, version: string): this {
    this.pinnedVersions.set(name, version)
    return this
  }

  unpin(name: string): boolean { return this.pinnedVersions.delete(name) }
  isPinned(name: string): boolean { return this.pinnedVersions.has(name) }

  ignore(name: string): this { this.ignoreList.add(name); return this }
  unignore(name: string): this { this.ignoreList.delete(name); return this }

  allowType(type: UpdateType2): this { this.allowedTypes.add(type); return this }
  disallowType(type: UpdateType2): this { this.allowedTypes.delete(type); return this }

  private compareVersions(current: string, latest: string): UpdateType2 {
    const cur = current.split('.').map(Number)
    const lat = latest.split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      const c = cur[i] ?? 0
      const l = lat[i] ?? 0
      if (l > c) {
        if (i === 0) return 'major'
        if (i === 1) return 'minor'
        return 'patch'
      }
      if (l < c) return 'none'
    }
    return 'none'
  }

  getOutdated(): PackageInfo2[] {
    return Array.from(this.packages.values())
      .filter(p => !this.ignoreList.has(p.name) && !this.isPinned(p.name) && p.type !== 'none')
      .filter(p => this.allowedTypes.has(p.type))
  }

  getByType(type: UpdateType2): PackageInfo2[] {
    return Array.from(this.packages.values()).filter(p => p.type === type)
  }

  getDeprecated(): PackageInfo2[] {
    return Array.from(this.packages.values()).filter(p => p.deprecated)
  }

  getMajorUpdates(): PackageInfo2[] { return this.getByType('major') }
  getMinorUpdates(): PackageInfo2[] { return this.getByType('minor') }
  getPatchUpdates(): PackageInfo2[] { return this.getByType('patch') }
  getUpToDate(): PackageInfo2[] { return this.getByType('none') }

  get(name: string): PackageInfo2 | undefined { return this.packages.get(name) }

  getStats(): { total: number; outdated: number; major: number; minor: number; patch: number; deprecated: number } {
    const pkgs = Array.from(this.packages.values())
    return {
      total: pkgs.length,
      outdated: pkgs.filter(p => p.type !== 'none').length,
      major: pkgs.filter(p => p.type === 'major').length,
      minor: pkgs.filter(p => p.type === 'minor').length,
      patch: pkgs.filter(p => p.type === 'patch').length,
      deprecated: pkgs.filter(p => p.deprecated).length,
    }
  }

  getReport(): { urgent: PackageInfo2[]; recommended: PackageInfo2[]; optional: PackageInfo2[] } {
    return {
      urgent: this.getMajorUpdates().filter(p => p.deprecated),
      recommended: [...this.getMinorUpdates(), ...this.getPatchUpdates()],
      optional: this.getMajorUpdates().filter(p => !p.deprecated),
    }
  }

  remove(name: string): boolean { return this.packages.delete(name) }
  count(): number { return this.packages.size }

  toArray(): PackageInfo2[] { return Array.from(this.packages.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): OutdatedChecker2 {
    const oc = new OutdatedChecker2()
    this.packages.forEach((p, name) => oc.packages.set(name, { ...p }))
    this.ignoreList.forEach(n => oc.ignoreList.add(n))
    this.pinnedVersions.forEach((v, n) => oc.pinnedVersions.set(n, v))
    this.allowedTypes.forEach(t => oc.allowedTypes.add(t))
    return oc
  }
  equals(other: unknown): boolean {
    if (!(other instanceof OutdatedChecker2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.packages.clear()
    this.ignoreList.clear()
    this.pinnedVersions.clear()
  }
}
