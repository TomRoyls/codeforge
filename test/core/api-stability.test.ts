import { describe, it, expect } from 'vitest'
import {
  parseAPIVersion,
  formatAPIVersion,
  isPrerelease,
  compareStability,
  stabilityOrder,
  STABILITY_ORDER,
  DEFAULT_STABILITY_POLICY,
} from '../../src/core/api-types.js'
import type { APISignature, APISnapshot } from '../../src/core/api-types.js'
import { DeprecationManager } from '../../src/core/deprecation-manager.js'
import { APIContractValidator } from '../../src/core/api-contract-validator.js'

function makeSig(overrides: Partial<APISignature> = {}): APISignature {
  return {
    name: 'testFn',
    kind: 'function',
    module: 'test-module',
    stability: 'stable',
    sinceVersion: '1.0.0',
    ...overrides,
  }
}

function makeSnapshot(version: string, sigs: APISignature[]): APISnapshot {
  return { version, timestamp: Date.now(), signatures: sigs }
}

describe('api-types', () => {
  describe('parseAPIVersion', () => {
    it('parses a simple version', () => {
      const v = parseAPIVersion('1.2.3')
      expect(v).toEqual({ major: 1, minor: 2, patch: 3, prerelease: undefined })
    })

    it('parses a version with prerelease', () => {
      const v = parseAPIVersion('2.0.0-beta.1')
      expect(v).toEqual({ major: 2, minor: 0, patch: 0, prerelease: 'beta.1' })
    })

    it('parses 0.0.0', () => {
      const v = parseAPIVersion('0.0.0')
      expect(v).toEqual({ major: 0, minor: 0, patch: 0, prerelease: undefined })
    })

    it('parses large version numbers', () => {
      const v = parseAPIVersion('100.200.300')
      expect(v.major).toBe(100)
      expect(v.minor).toBe(200)
      expect(v.patch).toBe(300)
    })

    it('throws on invalid version format', () => {
      expect(() => parseAPIVersion('invalid')).toThrow('Invalid version format')
    })

    it('throws on partial version', () => {
      expect(() => parseAPIVersion('1.2')).toThrow('Invalid version format')
    })

    it('throws on empty string', () => {
      expect(() => parseAPIVersion('')).toThrow('Invalid version format')
    })

    it('throws on version with leading v', () => {
      expect(() => parseAPIVersion('v1.2.3')).toThrow('Invalid version format')
    })

    it('parses alpha prerelease', () => {
      const v = parseAPIVersion('3.1.0-alpha')
      expect(v.prerelease).toBe('alpha')
    })

    it('parses rc prerelease', () => {
      const v = parseAPIVersion('1.0.0-rc.5')
      expect(v.prerelease).toBe('rc.5')
    })
  })

  describe('formatAPIVersion', () => {
    it('formats version without prerelease', () => {
      expect(formatAPIVersion({ major: 1, minor: 2, patch: 3 })).toBe('1.2.3')
    })

    it('formats version with prerelease', () => {
      expect(formatAPIVersion({ major: 2, minor: 0, patch: 0, prerelease: 'beta.1' })).toBe(
        '2.0.0-beta.1',
      )
    })

    it('roundtrips with parseAPIVersion for simple version', () => {
      const original = '1.2.3'
      expect(formatAPIVersion(parseAPIVersion(original))).toBe(original)
    })

    it('roundtrips with parseAPIVersion for prerelease version', () => {
      const original = '3.0.0-rc.1'
      expect(formatAPIVersion(parseAPIVersion(original))).toBe(original)
    })
  })

  describe('isPrerelease', () => {
    it('returns false for version without prerelease', () => {
      expect(isPrerelease({ major: 1, minor: 0, patch: 0 })).toBe(false)
    })

    it('returns true for version with prerelease', () => {
      expect(isPrerelease({ major: 1, minor: 0, patch: 0, prerelease: 'beta' })).toBe(true)
    })

    it('returns false for undefined prerelease', () => {
      expect(isPrerelease({ major: 1, minor: 0, patch: 0, prerelease: undefined })).toBe(false)
    })

    it('returns true for empty string prerelease is not possible via parse', () => {
      expect(isPrerelease({ major: 1, minor: 0, patch: 0, prerelease: 'alpha' })).toBe(true)
    })
  })

  describe('stabilityOrder', () => {
    it('returns 0 for internal', () => {
      expect(stabilityOrder('internal')).toBe(0)
    })

    it('returns 1 for experimental', () => {
      expect(stabilityOrder('experimental')).toBe(1)
    })

    it('returns 2 for stable', () => {
      expect(stabilityOrder('stable')).toBe(2)
    })

    it('returns 3 for deprecated', () => {
      expect(stabilityOrder('deprecated')).toBe(3)
    })
  })

  describe('compareStability', () => {
    it('returns negative when a < b', () => {
      expect(compareStability('internal', 'stable')).toBeLessThan(0)
    })

    it('returns positive when a > b', () => {
      expect(compareStability('deprecated', 'experimental')).toBeGreaterThan(0)
    })

    it('returns 0 for same level', () => {
      expect(compareStability('stable', 'stable')).toBe(0)
    })

    it('compares internal vs experimental', () => {
      expect(compareStability('internal', 'experimental')).toBeLessThan(0)
    })

    it('compares stable vs deprecated', () => {
      expect(compareStability('stable', 'deprecated')).toBeLessThan(0)
    })

    it('compares experimental vs deprecated', () => {
      expect(compareStability('experimental', 'deprecated')).toBeLessThan(0)
    })
  })

  describe('STABILITY_ORDER', () => {
    it('has 4 levels', () => {
      expect(STABILITY_ORDER).toHaveLength(4)
    })

    it('is in correct order', () => {
      expect(STABILITY_ORDER).toEqual(['internal', 'experimental', 'stable', 'deprecated'])
    })
  })

  describe('DEFAULT_STABILITY_POLICY', () => {
    it('has correct defaults', () => {
      expect(DEFAULT_STABILITY_POLICY.minimumStability).toBe('stable')
      expect(DEFAULT_STABILITY_POLICY.allowedBreakingChangesPerMajor).toBe(10)
      expect(DEFAULT_STABILITY_POLICY.deprecationGraceVersions).toBe(2)
    })
  })
})

describe('DeprecationManager', () => {
  describe('registerDeprecation and getDeprecations', () => {
    it('registers and retrieves a deprecation', () => {
      const mgr = new DeprecationManager()
      const sig = makeSig({ stability: 'deprecated', deprecatedSince: '1.1.0' })
      mgr.registerDeprecation(sig)
      expect(mgr.getDeprecations()).toHaveLength(1)
      expect(mgr.getDeprecations()[0]!.name).toBe('testFn')
    })

    it('registers multiple deprecations', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1' }))
      mgr.registerDeprecation(makeSig({ name: 'fn2' }))
      expect(mgr.getDeprecations()).toHaveLength(2)
    })

    it('overwrites existing deprecation with same key', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', reason: 'old' }))
      mgr.registerDeprecation(makeSig({ name: 'fn1', reason: 'updated' }))
      expect(mgr.getDeprecations()).toHaveLength(1)
      expect(mgr.getDeprecations()[0]!.reason).toBe('updated')
    })
  })

  describe('isDeprecated', () => {
    it('returns true for registered deprecation', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', module: 'mod1' }))
      expect(mgr.isDeprecated('fn1', 'mod1')).toBe(true)
    })

    it('returns false for non-registered name', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', module: 'mod1' }))
      expect(mgr.isDeprecated('fn2', 'mod1')).toBe(false)
    })

    it('returns false for wrong module', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', module: 'mod1' }))
      expect(mgr.isDeprecated('fn1', 'mod2')).toBe(false)
    })

    it('returns false when nothing registered', () => {
      const mgr = new DeprecationManager()
      expect(mgr.isDeprecated('fn1', 'mod1')).toBe(false)
    })
  })

  describe('getDeprecation', () => {
    it('returns the signature for a known deprecation', () => {
      const mgr = new DeprecationManager()
      const sig = makeSig({ name: 'fn1', module: 'mod1' })
      mgr.registerDeprecation(sig)
      expect(mgr.getDeprecation('fn1', 'mod1')).toEqual(sig)
    })

    it('returns undefined for unknown deprecation', () => {
      const mgr = new DeprecationManager()
      expect(mgr.getDeprecation('fn1', 'mod1')).toBeUndefined()
    })
  })

  describe('getDeprecationsByModule', () => {
    it('filters by module', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', module: 'mod-a' }))
      mgr.registerDeprecation(makeSig({ name: 'fn2', module: 'mod-b' }))
      mgr.registerDeprecation(makeSig({ name: 'fn3', module: 'mod-a' }))
      const result = mgr.getDeprecationsByModule('mod-a')
      expect(result).toHaveLength(2)
      expect(result.every((s) => s.module === 'mod-a')).toBe(true)
    })

    it('returns empty for unknown module', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ module: 'mod-a' }))
      expect(mgr.getDeprecationsByModule('mod-z')).toHaveLength(0)
    })
  })

  describe('getDeprecationsByStability', () => {
    it('filters by stability level', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', stability: 'deprecated' }))
      mgr.registerDeprecation(makeSig({ name: 'fn2', stability: 'experimental' }))
      mgr.registerDeprecation(makeSig({ name: 'fn3', stability: 'deprecated' }))
      const result = mgr.getDeprecationsByStability('deprecated')
      expect(result).toHaveLength(2)
      expect(result.every((s) => s.stability === 'deprecated')).toBe(true)
    })

    it('returns empty for level with no matches', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ stability: 'deprecated' }))
      expect(mgr.getDeprecationsByStability('stable')).toHaveLength(0)
    })
  })

  describe('removeDeprecation', () => {
    it('removes an existing deprecation', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', module: 'mod1' }))
      expect(mgr.removeDeprecation('fn1', 'mod1')).toBe(true)
      expect(mgr.isDeprecated('fn1', 'mod1')).toBe(false)
    })

    it('returns false for non-existent deprecation', () => {
      const mgr = new DeprecationManager()
      expect(mgr.removeDeprecation('fn1', 'mod1')).toBe(false)
    })
  })

  describe('createNotice', () => {
    it('returns a notice for a registered deprecation', () => {
      const mgr = new DeprecationManager()
      const sig = makeSig({
        name: 'fn1',
        module: 'mod1',
        deprecatedSince: '1.1.0',
        removedIn: '2.0.0',
        replacement: 'fn2',
        reason: 'Use fn2 instead',
      })
      mgr.registerDeprecation(sig)
      const notice = mgr.createNotice('fn1', 'mod1')
      expect(notice).not.toBeNull()
      expect(notice!.signature).toEqual(sig)
      expect(notice!.message).toContain('deprecated since version 1.1.0')
      expect(notice!.message).toContain('removed in version 2.0.0')
      expect(notice!.message).toContain('Replacement: fn2')
      expect(notice!.message).toContain('Reason: Use fn2 instead')
      expect(notice!.severity).toBe('high')
    })

    it('returns null for unknown API', () => {
      const mgr = new DeprecationManager()
      expect(mgr.createNotice('fn1', 'mod1')).toBeNull()
    })

    it('returns low severity when replacement exists without removal', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', replacement: 'fn2' }))
      const notice = mgr.createNotice('fn1', 'test-module')
      expect(notice!.severity).toBe('low')
    })

    it('returns medium severity when no replacement and no removal', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1' }))
      const notice = mgr.createNotice('fn1', 'test-module')
      expect(notice!.severity).toBe('medium')
    })

    it('accumulates warnings', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1' }))
      mgr.registerDeprecation(makeSig({ name: 'fn2' }))
      mgr.createNotice('fn1', 'test-module')
      mgr.createNotice('fn2', 'test-module')
      expect(mgr.getWarnings()).toHaveLength(2)
    })
  })

  describe('silence', () => {
    it('prevents notice generation', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1' }))
      mgr.silence('fn1', 'test-module')
      expect(mgr.createNotice('fn1', 'test-module')).toBeNull()
    })

    it('isSilenced returns true after silencing', () => {
      const mgr = new DeprecationManager()
      mgr.silence('fn1', 'test-module')
      expect(mgr.isSilenced('fn1', 'test-module')).toBe(true)
    })

    it('isSilenced returns false when not silenced', () => {
      const mgr = new DeprecationManager()
      expect(mgr.isSilenced('fn1', 'test-module')).toBe(false)
    })

    it('does not affect other APIs', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1' }))
      mgr.registerDeprecation(makeSig({ name: 'fn2' }))
      mgr.silence('fn1', 'test-module')
      expect(mgr.createNotice('fn1', 'test-module')).toBeNull()
      expect(mgr.createNotice('fn2', 'test-module')).not.toBeNull()
    })
  })

  describe('getWarnings and clearWarnings', () => {
    it('returns accumulated warnings', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1' }))
      mgr.createNotice('fn1', 'test-module')
      expect(mgr.getWarnings()).toHaveLength(1)
    })

    it('clears all warnings', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1' }))
      mgr.createNotice('fn1', 'test-module')
      mgr.clearWarnings()
      expect(mgr.getWarnings()).toHaveLength(0)
    })

    it('does not affect deprecations when clearing warnings', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1' }))
      mgr.createNotice('fn1', 'test-module')
      mgr.clearWarnings()
      expect(mgr.isDeprecated('fn1', 'test-module')).toBe(true)
    })
  })

  describe('formatNotices', () => {
    it('returns "No deprecations." when empty', () => {
      const mgr = new DeprecationManager()
      expect(mgr.formatNotices()).toBe('No deprecations.')
    })

    it('formats notices grouped by module', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(
        makeSig({ name: 'fn1', module: 'mod-a', deprecatedSince: '1.0.0', removedIn: '2.0.0', replacement: 'fn2' }),
      )
      mgr.registerDeprecation(
        makeSig({ name: 'fn3', module: 'mod-b', deprecatedSince: '1.1.0' }),
      )
      const output = mgr.formatNotices()
      expect(output).toContain('[mod-a]')
      expect(output).toContain('[mod-b]')
      expect(output).toContain('fn1')
      expect(output).toContain('fn3')
      expect(output).toContain('removal: 2.0.0')
      expect(output).toContain('replacement: fn2')
    })

    it('uses sinceVersion when deprecatedSince is absent', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', module: 'mod1', sinceVersion: '0.9.0' }))
      const output = mgr.formatNotices()
      expect(output).toContain('since 0.9.0')
    })
  })

  describe('getRemovalsByVersion', () => {
    it('returns APIs scheduled for removal before given version', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', removedIn: '1.0.0' }))
      mgr.registerDeprecation(makeSig({ name: 'fn2', removedIn: '2.0.0' }))
      mgr.registerDeprecation(makeSig({ name: 'fn3' }))
      const removals = mgr.getRemovalsByVersion({ major: 1, minor: 5, patch: 0 })
      expect(removals).toHaveLength(1)
      expect(removals[0]!.name).toBe('fn1')
    })

    it('returns empty when no removals scheduled', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1' }))
      expect(mgr.getRemovalsByVersion({ major: 2, minor: 0, patch: 0 })).toHaveLength(0)
    })

    it('returns APIs at exact version boundary', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', removedIn: '2.0.0' }))
      const removals = mgr.getRemovalsByVersion({ major: 2, minor: 0, patch: 0 })
      expect(removals).toHaveLength(1)
    })

    it('skips APIs with invalid removedIn version', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', removedIn: 'not-a-version' }))
      expect(mgr.getRemovalsByVersion({ major: 2, minor: 0, patch: 0 })).toHaveLength(0)
    })
  })

  describe('validateRemovals', () => {
    it('returns breaking changes for past-removal deprecations', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', module: 'mod1', removedIn: '1.0.0' }))
      const results = mgr.validateRemovals({ major: 2, minor: 0, patch: 0 })
      expect(results).toHaveLength(1)
      expect(results[0]!.changeType).toBe('removed')
      expect(results[0]!.description).toContain('fn1')
    })

    it('returns empty when no removals overdue', () => {
      const mgr = new DeprecationManager()
      mgr.registerDeprecation(makeSig({ name: 'fn1', removedIn: '3.0.0' }))
      expect(mgr.validateRemovals({ major: 1, minor: 0, patch: 0 })).toHaveLength(0)
    })
  })
})

describe('APIContractValidator', () => {
  const validator = new APIContractValidator()

  describe('compare', () => {
    it('returns compatible with identical snapshots', () => {
      const sigs = [makeSig({ name: 'fn1' })]
      const oldSnap = makeSnapshot('1.0.0', sigs)
      const newSnap = makeSnapshot('1.0.0', sigs)
      const result = validator.compare(oldSnap, newSnap)
      expect(result.compatible).toBe(true)
      expect(result.breakingChanges).toHaveLength(0)
      expect(result.newApis).toHaveLength(0)
      expect(result.deprecatedApis).toHaveLength(0)
    })

    it('detects removed API as breaking change', () => {
      const oldSnap = makeSnapshot('1.0.0', [makeSig({ name: 'fn1' })])
      const newSnap = makeSnapshot('2.0.0', [])
      const result = validator.compare(oldSnap, newSnap)
      expect(result.compatible).toBe(false)
      expect(result.breakingChanges).toHaveLength(1)
      expect(result.breakingChanges[0]!.changeType).toBe('removed')
      expect(result.breakingChanges[0]!.description).toContain('was removed')
    })

    it('detects new APIs', () => {
      const oldSnap = makeSnapshot('1.0.0', [])
      const newSnap = makeSnapshot('1.1.0', [makeSig({ name: 'fn1' })])
      const result = validator.compare(oldSnap, newSnap)
      expect(result.newApis).toHaveLength(1)
      expect(result.newApis[0]!.name).toBe('fn1')
      expect(result.compatible).toBe(true)
    })

    it('detects newly deprecated APIs', () => {
      const oldSnap = makeSnapshot('1.0.0', [makeSig({ name: 'fn1', stability: 'stable' })])
      const newSnap = makeSnapshot('1.1.0', [makeSig({ name: 'fn1', stability: 'deprecated' })])
      const result = validator.compare(oldSnap, newSnap)
      expect(result.deprecatedApis).toHaveLength(1)
    })

    it('detects type change as breaking', () => {
      const oldSnap = makeSnapshot('1.0.0', [makeSig({ name: 'fn1', kind: 'function' })])
      const newSnap = makeSnapshot('2.0.0', [makeSig({ name: 'fn1', kind: 'class' })])
      const result = validator.compare(oldSnap, newSnap)
      expect(result.compatible).toBe(false)
      expect(result.breakingChanges).toHaveLength(1)
      expect(result.breakingChanges[0]!.changeType).toBe('type-changed')
    })

    it('detects stability regression from stable to experimental', () => {
      const oldSnap = makeSnapshot('1.0.0', [makeSig({ name: 'fn1', stability: 'stable' })])
      const newSnap = makeSnapshot('1.1.0', [makeSig({ name: 'fn1', stability: 'experimental' })])
      const result = validator.compare(oldSnap, newSnap)
      expect(result.compatible).toBe(false)
      const stabilityChange = result.breakingChanges.find((c) => c.changeType === 'signature-changed')
      expect(stabilityChange).toBeDefined()
    })

    it('does not flag stability change from experimental to stable', () => {
      const oldSnap = makeSnapshot('1.0.0', [makeSig({ name: 'fn1', stability: 'experimental' })])
      const newSnap = makeSnapshot('1.1.0', [makeSig({ name: 'fn1', stability: 'stable' })])
      const result = validator.compare(oldSnap, newSnap)
      expect(result.compatible).toBe(true)
      expect(result.breakingChanges).toHaveLength(0)
    })

    it('handles multiple changes at once', () => {
      const oldSnap = makeSnapshot('1.0.0', [
        makeSig({ name: 'fn1', stability: 'stable' }),
        makeSig({ name: 'fn2', stability: 'stable' }),
        makeSig({ name: 'fn3', stability: 'stable' }),
      ])
      const newSnap = makeSnapshot('2.0.0', [
        makeSig({ name: 'fn2', stability: 'stable' }),
        makeSig({ name: 'fn3', stability: 'deprecated' }),
        makeSig({ name: 'fn4', stability: 'stable' }),
      ])
      const result = validator.compare(oldSnap, newSnap)
      expect(result.compatible).toBe(false)
      expect(result.breakingChanges).toHaveLength(2)
      const removed = result.breakingChanges.find((c) => c.changeType === 'removed')
      const sigChanged = result.breakingChanges.find((c) => c.changeType === 'signature-changed')
      expect(removed).toBeDefined()
      expect(sigChanged).toBeDefined()
      expect(result.newApis).toHaveLength(1)
      expect(result.deprecatedApis).toHaveLength(1)
    })

    it('detects stability regression from stable to deprecated', () => {
      const oldSnap = makeSnapshot('1.0.0', [makeSig({ name: 'fn1', stability: 'stable' })])
      const newSnap = makeSnapshot('2.0.0', [makeSig({ name: 'fn1', stability: 'deprecated' })])
      const result = validator.compare(oldSnap, newSnap)
      expect(result.breakingChanges.some((c) => c.changeType === 'signature-changed')).toBe(true)
    })

    it('does not flag already-deprecated APIs continuing as deprecated', () => {
      const oldSnap = makeSnapshot('1.0.0', [makeSig({ name: 'fn1', stability: 'deprecated' })])
      const newSnap = makeSnapshot('1.1.0', [makeSig({ name: 'fn1', stability: 'deprecated' })])
      const result = validator.compare(oldSnap, newSnap)
      expect(result.deprecatedApis).toHaveLength(0)
    })

    it('handles empty snapshots', () => {
      const result = validator.compare(makeSnapshot('1.0.0', []), makeSnapshot('1.0.0', []))
      expect(result.compatible).toBe(true)
      expect(result.breakingChanges).toHaveLength(0)
    })

    it('includes previousSignature in breaking changes', () => {
      const oldSig = makeSig({ name: 'fn1', kind: 'function' })
      const oldSnap = makeSnapshot('1.0.0', [oldSig])
      const newSnap = makeSnapshot('2.0.0', [makeSig({ name: 'fn1', kind: 'class' })])
      const result = validator.compare(oldSnap, newSnap)
      expect(result.breakingChanges[0]!.previousSignature).toEqual(oldSig)
    })
  })

  describe('createSnapshot', () => {
    it('creates a snapshot with version and signatures', () => {
      const sigs = [makeSig({ name: 'fn1' })]
      const snap = validator.createSnapshot('1.0.0', sigs)
      expect(snap.version).toBe('1.0.0')
      expect(snap.signatures).toHaveLength(1)
      expect(snap.timestamp).toBeGreaterThan(0)
    })

    it('creates a copy of the signatures array', () => {
      const sigs = [makeSig({ name: 'fn1' })]
      const snap = validator.createSnapshot('1.0.0', sigs)
      sigs.push(makeSig({ name: 'fn2' }))
      expect(snap.signatures).toHaveLength(1)
    })
  })

  describe('serializeSnapshot / deserializeSnapshot', () => {
    it('roundtrips a snapshot', () => {
      const snap = makeSnapshot('1.0.0', [makeSig({ name: 'fn1' }), makeSig({ name: 'fn2' })])
      const json = validator.serializeSnapshot(snap)
      const restored = validator.deserializeSnapshot(json)
      expect(restored).toEqual(snap)
    })

    it('preserves all signature fields', () => {
      const snap = makeSnapshot('2.0.0', [
        makeSig({
          name: 'fn1',
          deprecatedSince: '1.5.0',
          removedIn: '3.0.0',
          replacement: 'fn2',
          reason: 'Replaced by better API',
        }),
      ])
      const json = validator.serializeSnapshot(snap)
      const restored = validator.deserializeSnapshot(json)
      expect(restored.signatures[0]).toEqual(snap.signatures[0])
    })

    it('handles empty snapshot', () => {
      const snap = makeSnapshot('0.0.1', [])
      const json = validator.serializeSnapshot(snap)
      const restored = validator.deserializeSnapshot(json)
      expect(restored.signatures).toHaveLength(0)
    })
  })

  describe('validatePolicy', () => {
    it('catches violations below minimum stability', () => {
      const snap = makeSnapshot('1.0.0', [
        makeSig({ name: 'fn1', stability: 'experimental', module: 'public-api' }),
      ])
      const violations = validator.validatePolicy(snap)
      expect(violations).toHaveLength(1)
      expect(violations[0]!.reason).toContain('below minimum')
    })

    it('passes for signatures meeting minimum stability', () => {
      const snap = makeSnapshot('1.0.0', [
        makeSig({ name: 'fn1', stability: 'stable' }),
        makeSig({ name: 'fn2', stability: 'deprecated' }),
      ])
      const violations = validator.validatePolicy(snap)
      expect(violations).toHaveLength(0)
    })

    it('skips internal APIs', () => {
      const snap = makeSnapshot('1.0.0', [
        makeSig({ name: 'fn1', stability: 'internal' }),
      ])
      const violations = validator.validatePolicy(snap)
      expect(violations).toHaveLength(0)
    })

    it('uses default policy when none provided', () => {
      const snap = makeSnapshot('1.0.0', [
        makeSig({ name: 'fn1', stability: 'experimental' }),
      ])
      const violations = validator.validatePolicy(snap)
      expect(violations).toHaveLength(1)
    })

    it('respects custom policy', () => {
      const snap = makeSnapshot('1.0.0', [
        makeSig({ name: 'fn1', stability: 'experimental' }),
      ])
      const violations = validator.validatePolicy(snap, {
        minimumStability: 'experimental',
        allowedBreakingChangesPerMajor: 5,
        deprecationGraceVersions: 1,
      })
      expect(violations).toHaveLength(0)
    })

    it('detects internal as below custom minimum when internal is not skipped', () => {
      const snap = makeSnapshot('1.0.0', [
        makeSig({ name: 'fn1', stability: 'internal' }),
      ])
      const violations = validator.validatePolicy(snap, {
        minimumStability: 'internal',
        allowedBreakingChangesPerMajor: 5,
        deprecationGraceVersions: 1,
      })
      expect(violations).toHaveLength(0)
    })
  })

  describe('isBreakingChange', () => {
    it('detects kind change', () => {
      const old = makeSig({ kind: 'function' })
      const new_ = makeSig({ kind: 'class' })
      expect(validator.isBreakingChange(old, new_)).toBe(true)
    })

    it('detects stability regression from stable to experimental', () => {
      const old = makeSig({ stability: 'stable' })
      const new_ = makeSig({ stability: 'experimental' })
      expect(validator.isBreakingChange(old, new_)).toBe(true)
    })

    it('detects stability regression from stable to deprecated', () => {
      const old = makeSig({ stability: 'stable' })
      const new_ = makeSig({ stability: 'deprecated' })
      expect(validator.isBreakingChange(old, new_)).toBe(true)
    })

    it('detects name change', () => {
      const old = makeSig({ name: 'fn1' })
      const new_ = makeSig({ name: 'fn2' })
      expect(validator.isBreakingChange(old, new_)).toBe(true)
    })

    it('detects module change', () => {
      const old = makeSig({ module: 'mod1' })
      const new_ = makeSig({ module: 'mod2' })
      expect(validator.isBreakingChange(old, new_)).toBe(true)
    })

    it('returns false for non-breaking change', () => {
      const old = makeSig({ stability: 'experimental' })
      const new_ = makeSig({ stability: 'stable' })
      expect(validator.isBreakingChange(old, new_)).toBe(false)
    })

    it('returns false for identical signatures', () => {
      const sig = makeSig()
      expect(validator.isBreakingChange(sig, sig)).toBe(false)
    })

    it('returns false for experimental to deprecated', () => {
      const old = makeSig({ stability: 'experimental' })
      const new_ = makeSig({ stability: 'deprecated' })
      expect(validator.isBreakingChange(old, new_)).toBe(false)
    })
  })

  describe('formatDiff', () => {
    it('shows Compatible: yes for compatible result', () => {
      const result: import('../../src/core/api-contract-validator.js').APIContractResult = {
        compatible: true,
        breakingChanges: [],
        newApis: [makeSig({ name: 'fn1' })],
        deprecatedApis: [makeSig({ name: 'fn2', stability: 'deprecated' })],
      }
      const output = validator.formatDiff(result)
      expect(output).toContain('Compatible: yes')
      expect(output).toContain('New APIs:')
      expect(output).toContain('Deprecated APIs:')
    })

    it('shows Compatible: no for breaking result', () => {
      const result: import('../../src/core/api-contract-validator.js').APIContractResult = {
        compatible: false,
        breakingChanges: [
          {
            signature: makeSig({ name: 'fn1' }),
            changeType: 'removed',
            description: 'test-module:fn1 was removed',
          },
        ],
        newApis: [],
        deprecatedApis: [],
      }
      const output = validator.formatDiff(result)
      expect(output).toContain('Compatible: no')
      expect(output).toContain('Breaking Changes:')
      expect(output).toContain('1 breaking')
    })

    it('shows summary line with counts', () => {
      const result: import('../../src/core/api-contract-validator.js').APIContractResult = {
        compatible: true,
        breakingChanges: [],
        newApis: [makeSig({ name: 'a' }), makeSig({ name: 'b' })],
        deprecatedApis: [makeSig({ name: 'c' })],
      }
      const output = validator.formatDiff(result)
      expect(output).toContain('0 breaking | 2 new | 1 deprecated')
    })

    it('shows change type in breaking changes', () => {
      const result: import('../../src/core/api-contract-validator.js').APIContractResult = {
        compatible: false,
        breakingChanges: [
          {
            signature: makeSig({ name: 'fn1' }),
            changeType: 'type-changed',
            description: 'test-module:fn1 changed from function to class',
          },
        ],
        newApis: [],
        deprecatedApis: [],
      }
      const output = validator.formatDiff(result)
      expect(output).toContain('[type-changed]')
    })

    it('shows new API details', () => {
      const result: import('../../src/core/api-contract-validator.js').APIContractResult = {
        compatible: true,
        breakingChanges: [],
        newApis: [makeSig({ name: 'newFn', kind: 'function', stability: 'stable' })],
        deprecatedApis: [],
      }
      const output = validator.formatDiff(result)
      expect(output).toContain('+ test-module:newFn (function, stable)')
    })

    it('shows deprecated API details', () => {
      const result: import('../../src/core/api-contract-validator.js').APIContractResult = {
        compatible: true,
        breakingChanges: [],
        newApis: [],
        deprecatedApis: [makeSig({ name: 'oldFn', kind: 'function', stability: 'deprecated' })],
      }
      const output = validator.formatDiff(result)
      expect(output).toContain('~ test-module:oldFn (function)')
    })
  })
})
