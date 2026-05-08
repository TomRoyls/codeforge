import type { APISignature, APISnapshot, APIContractResult, BreakingChange, StabilityPolicy } from './api-types.js'
import { DEFAULT_STABILITY_POLICY, stabilityOrder } from './api-types.js'

export interface APIPolicyViolation {
  signature: APISignature
  policy: StabilityPolicy
  reason: string
}

export class APIContractValidator {
  compare(oldSnapshot: APISnapshot, newSnapshot: APISnapshot): APIContractResult {
    const breakingChanges: BreakingChange[] = []
    const newApis: APISignature[] = []
    const deprecatedApis: APISignature[] = []

    const oldMap = new Map<string, APISignature>()
    for (const sig of oldSnapshot.signatures) {
      oldMap.set(`${sig.module}:${sig.name}`, sig)
    }

    const newMap = new Map<string, APISignature>()
    for (const sig of newSnapshot.signatures) {
      newMap.set(`${sig.module}:${sig.name}`, sig)
    }

    for (const [key, oldSig] of oldMap) {
      const newSig = newMap.get(key)
      if (!newSig) {
        breakingChanges.push({
          signature: oldSig,
          changeType: 'removed',
          previousSignature: oldSig,
          description: `${oldSig.module}:${oldSig.name} was removed`,
        })
        continue
      }

      if (oldSig.kind !== newSig.kind) {
        breakingChanges.push({
          signature: newSig,
          changeType: 'type-changed',
          previousSignature: oldSig,
          description: `${newSig.module}:${newSig.name} changed from ${oldSig.kind} to ${newSig.kind}`,
        })
      }

      if (
        oldSig.stability === 'stable' &&
        (newSig.stability === 'experimental' || newSig.stability === 'deprecated')
      ) {
        breakingChanges.push({
          signature: newSig,
          changeType: 'signature-changed',
          previousSignature: oldSig,
          description: `${newSig.module}:${newSig.name} stability regressed from ${oldSig.stability} to ${newSig.stability}`,
        })
      }
    }

    for (const [key, newSig] of newMap) {
      const oldSig = oldMap.get(key)
      if (!oldSig) {
        newApis.push(newSig)
        continue
      }

      if (oldSig.stability !== 'deprecated' && newSig.stability === 'deprecated') {
        deprecatedApis.push(newSig)
      }
    }

    return {
      compatible: breakingChanges.length === 0,
      breakingChanges,
      newApis,
      deprecatedApis,
    }
  }

  createSnapshot(version: string, signatures: APISignature[]): APISnapshot {
    return {
      version,
      timestamp: Date.now(),
      signatures: [...signatures],
    }
  }

  validatePolicy(snapshot: APISnapshot, policy?: StabilityPolicy): APIPolicyViolation[] {
    const p = policy ?? DEFAULT_STABILITY_POLICY
    const minOrder = stabilityOrder(p.minimumStability)
    const violations: APIPolicyViolation[] = []

    for (const sig of snapshot.signatures) {
      if (sig.stability === 'internal') continue
      const sigOrder = stabilityOrder(sig.stability)
      if (sigOrder < minOrder) {
        violations.push({
          signature: sig,
          policy: p,
          reason: `${sig.module}:${sig.name} has stability '${sig.stability}' which is below minimum '${p.minimumStability}'`,
        })
      }
    }

    return violations
  }

  isBreakingChange(old: APISignature, new_: APISignature): boolean {
    if (old.kind !== new_.kind) return true
    if (old.name !== new_.name || old.module !== new_.module) return true
    if (
      old.stability === 'stable' &&
      (new_.stability === 'experimental' || new_.stability === 'deprecated')
    ) {
      return true
    }
    return false
  }

  serializeSnapshot(snapshot: APISnapshot): string {
    return JSON.stringify(snapshot)
  }

  deserializeSnapshot(json: string): APISnapshot {
    return JSON.parse(json) as APISnapshot
  }

  formatDiff(result: APIContractResult): string {
    const lines: string[] = []

    if (result.breakingChanges.length > 0) {
      lines.push('Breaking Changes:')
      for (const change of result.breakingChanges) {
        lines.push(`  - [${change.changeType}] ${change.description}`)
      }
    }

    if (result.newApis.length > 0) {
      lines.push('New APIs:')
      for (const api of result.newApis) {
        lines.push(`  + ${api.module}:${api.name} (${api.kind}, ${api.stability})`)
      }
    }

    if (result.deprecatedApis.length > 0) {
      lines.push('Deprecated APIs:')
      for (const api of result.deprecatedApis) {
        lines.push(`  ~ ${api.module}:${api.name} (${api.kind})`)
      }
    }

    const status = result.compatible ? 'yes' : 'no'
    lines.push(
      `Compatible: ${status} | ${result.breakingChanges.length} breaking | ${result.newApis.length} new | ${result.deprecatedApis.length} deprecated`,
    )

    return lines.join('\n')
  }
}
