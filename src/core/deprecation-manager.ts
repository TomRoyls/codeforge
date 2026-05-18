import type { APISignature, DeprecationNotice, StabilityLevel, APIVersion, BreakingChange } from './api-types.js'
import { parseAPIVersion } from './api-types.js'
import { append } from '../utils/map-helpers.js'

/**
 * @stable
 */
export class DeprecationManager {
  private deprecations: Map<string, APISignature>
  private warnings: DeprecationNotice[]
  private silenceSet: Set<string>

  constructor() {
    this.deprecations = new Map()
    this.warnings = []
    this.silenceSet = new Set()
  }

  registerDeprecation(signature: APISignature): void {
    const key = `${signature.module}:${signature.name}`
    this.deprecations.set(key, signature)
  }

  removeDeprecation(name: string, module: string): boolean {
    const key = `${module}:${name}`
    return this.deprecations.delete(key)
  }

  getDeprecations(): APISignature[] {
    return Array.from(this.deprecations.values())
  }

  getDeprecationsByModule(module: string): APISignature[] {
    return this.getDeprecations().filter((s) => s.module === module)
  }

  getDeprecationsByStability(level: StabilityLevel): APISignature[] {
    return this.getDeprecations().filter((s) => s.stability === level)
  }

  isDeprecated(name: string, module: string): boolean {
    const key = `${module}:${name}`
    return this.deprecations.has(key)
  }

  getDeprecation(name: string, module: string): APISignature | undefined {
    const key = `${module}:${name}`
    return this.deprecations.get(key)
  }

  createNotice(name: string, module: string): DeprecationNotice | null {
    const key = `${module}:${name}`
    if (this.silenceSet.has(key)) {
      return null
    }
    const sig = this.deprecations.get(key)
    if (!sig) {
      return null
    }

    const parts: string[] = []
    parts.push(`[${sig.kind}] ${module}:${name} is deprecated since version ${sig.deprecatedSince ?? sig.sinceVersion}`)
    if (sig.removedIn) {
      parts.push(`Will be removed in version ${sig.removedIn}`)
    }
    if (sig.replacement) {
      parts.push(`Replacement: ${sig.replacement}`)
    }
    if (sig.reason) {
      parts.push(`Reason: ${sig.reason}`)
    }

    let severity: 'low' | 'medium' | 'high' = 'medium'
    if (sig.removedIn) {
      severity = 'high'
    } else if (sig.replacement) {
      severity = 'low'
    }

    const notice: DeprecationNotice = {
      signature: sig,
      message: parts.join('. '),
      severity,
    }
    this.warnings.push(notice)
    return notice
  }

  getWarnings(): DeprecationNotice[] {
    return [...this.warnings]
  }

  clearWarnings(): void {
    this.warnings = []
  }

  silence(name: string, module: string): void {
    const key = `${module}:${name}`
    this.silenceSet.add(key)
  }

  isSilenced(name: string, module: string): boolean {
    const key = `${module}:${name}`
    return this.silenceSet.has(key)
  }

  formatNotices(): string {
    const deprecations = this.getDeprecations()
    if (deprecations.length === 0) {
      return 'No deprecations.'
    }

    const byModule = new Map<string, APISignature[]>()
    for (const sig of deprecations) {
      append(byModule, sig.module, sig)
    }

    const lines: string[] = []
    for (const [module, sigs] of byModule) {
      lines.push(`[${module}]`)
      for (const sig of sigs) {
        const since = sig.deprecatedSince ?? sig.sinceVersion
        let line = `  - ${sig.name} (${sig.kind}, since ${since})`
        if (sig.removedIn) {
          line += ` | removal: ${sig.removedIn}`
        }
        if (sig.replacement) {
          line += ` | replacement: ${sig.replacement}`
        }
        lines.push(line)
      }
    }

    return lines.join('\n')
  }

  getRemovalsByVersion(version: APIVersion): APISignature[] {
    return this.getDeprecations().filter((sig) => {
      if (!sig.removedIn) return false
      try {
        const removed = parseAPIVersion(sig.removedIn)
        return (
          removed.major < version.major ||
          (removed.major === version.major && removed.minor < version.minor) ||
          (removed.major === version.major && removed.minor === version.minor && removed.patch <= version.patch)
        )
      } catch {
        return false
      }
    })
  }

  validateRemovals(currentVersion: APIVersion): BreakingChange[] {
    const removals = this.getRemovalsByVersion(currentVersion)
    return removals.map((sig) => ({
      signature: sig,
      changeType: 'removed' as const,
      description: `${sig.module}:${sig.name} was scheduled for removal in ${sig.removedIn} (current: ${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch})`,
    }))
  }
}
