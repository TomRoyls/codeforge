import { VersionParser } from './version-parser.js'
import type { DependencyInfo, UpdatePlan, UpdateEntry, UpdateConflict } from './types.js'

export class UpdateResolver {
  private parser: VersionParser

  constructor() {
    this.parser = new VersionParser()
  }

  resolveUpdates(dependencies: DependencyInfo[]): UpdatePlan {
    const updates: UpdateEntry[] = []
    let breakingChanges = 0

    for (const dep of dependencies) {
      const updateType = this.classifyUpdate(dep.currentVersion, dep.latestVersion)
      if (updateType === 'none') continue

      const isBreaking = this.isBreaking(dep.currentVersion, dep.latestVersion)
      const entry: UpdateEntry = {
        dependency: dep,
        updateType,
        isBreaking,
        riskLevel: 'low',
      }
      entry.riskLevel = this.assessRisk(entry)
      if (isBreaking) breakingChanges++
      updates.push(entry)
    }

    const conflicts = this.findConflicts(updates)

    return {
      updates: this.sortUpdates(updates),
      conflicts,
      totalUpdates: updates.length,
      breakingChanges,
    }
  }

  classifyUpdate(current: string, latest: string): 'major' | 'minor' | 'patch' | 'prerelease' | 'none' {
    try {
      const cur = this.parser.parse(current)
      const lat = this.parser.parse(latest)
      if (this.parser.compare(cur, lat) === 0) return 'none'
      if (lat.prerelease.length > 0) return 'prerelease'
      if (lat.major !== cur.major) return 'major'
      if (lat.minor !== cur.minor) return 'minor'
      return 'patch'
    } catch {
      return 'none'
    }
  }

  isBreaking(current: string, latest: string): boolean {
    try {
      const cur = this.parser.parse(current)
      const lat = this.parser.parse(latest)
      if (cur.major === 0 && lat.major === 0) {
        return lat.minor !== cur.minor || (lat.minor === cur.minor && lat.patch !== cur.patch)
      }
      return lat.major > cur.major
    } catch {
      return false
    }
  }

  assessRisk(entry: UpdateEntry): 'low' | 'medium' | 'high' {
    if (entry.isBreaking) return 'high'
    if (entry.dependency.isVulnerable) return 'high'
    if (entry.updateType === 'major') return 'high'
    if (entry.updateType === 'minor') return 'medium'
    if (entry.updateType === 'prerelease') return 'medium'
    if (entry.dependency.isDeprecated) return 'medium'
    return 'low'
  }

  findConflicts(updates: UpdateEntry[]): UpdateConflict[] {
    const nameMap = new Map<string, string[]>()
    for (const entry of updates) {
      const name = entry.dependency.name
      const versions = nameMap.get(name)
      if (versions) {
        if (!versions.includes(entry.dependency.latestVersion)) {
          versions.push(entry.dependency.latestVersion)
        }
      } else {
        nameMap.set(name, [entry.dependency.currentVersion, entry.dependency.latestVersion])
      }
    }
    const conflicts: UpdateConflict[] = []
    for (const [name, versions] of nameMap) {
      if (versions.length > 1) {
        conflicts.push({ dependency: name, conflictingVersions: versions })
      }
    }
    return conflicts
  }

  sortUpdates(updates: UpdateEntry[]): UpdateEntry[] {
    const riskOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
    const typeOrder: Record<string, number> = { major: 0, minor: 1, patch: 2, prerelease: 3 }
    return [...updates].sort((a, b) => {
      const riskDiff = (riskOrder[a.riskLevel] ?? 0) - (riskOrder[b.riskLevel] ?? 0)
      if (riskDiff !== 0) return riskDiff
      return (typeOrder[a.updateType] ?? 0) - (typeOrder[b.updateType] ?? 0)
    })
  }

  filterByRisk(plan: UpdatePlan, maxRisk: 'low' | 'medium' | 'high'): UpdateEntry[] {
    const riskLevels: Record<string, number> = { low: 0, medium: 1, high: 2 }
    const maxLevel = riskLevels[maxRisk] ?? 0
    return plan.updates.filter((entry) => (riskLevels[entry.riskLevel] ?? 0) <= maxLevel)
  }
}
