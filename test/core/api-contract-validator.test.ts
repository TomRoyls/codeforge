import { describe, expect, it } from 'vitest'

import type { APISignature, APISnapshot } from '../../src/core/api-types.js'

import { APIContractValidator } from '../../src/core/api-contract-validator.js'

// ─── Helpers ───

function makeSig(overrides: Partial<APISignature> = {}): APISignature {
  return {
    name: overrides.name ?? 'fn1',
    kind: overrides.kind ?? 'function',
    module: overrides.module ?? 'mod1',
    stability: overrides.stability ?? 'stable',
    sinceVersion: overrides.sinceVersion ?? '1.0.0',
    ...overrides,
  }
}

function makeSnapshot(sigs: APISignature[], version = '1.0.0'): APISnapshot {
  return { version, timestamp: Date.now(), signatures: sigs }
}

// ─── compare ───

describe('APIContractValidator.compare', () => {
  const validator = new APIContractValidator()

  it('returns compatible when snapshots are identical', () => {
    const snap = makeSnapshot([makeSig()])
    const result = validator.compare(snap, snap)
    expect(result.compatible).toBe(true)
    expect(result.breakingChanges).toEqual([])
  })

  it('detects removed API as breaking change', () => {
    const old = makeSnapshot([makeSig({ name: 'fn1', module: 'mod1' })])
    const new_ = makeSnapshot([])
    const result = validator.compare(old, new_)
    expect(result.compatible).toBe(false)
    expect(result.breakingChanges).toHaveLength(1)
    expect(result.breakingChanges[0]!.changeType).toBe('removed')
    expect(result.breakingChanges[0]!.description).toContain('removed')
  })

  it('detects kind change as breaking', () => {
    const old = makeSnapshot([makeSig({ kind: 'function' })])
    const new_ = makeSnapshot([makeSig({ kind: 'class' })])
    const result = validator.compare(old, new_)
    expect(result.compatible).toBe(false)
    expect(result.breakingChanges.some((c) => c.changeType === 'type-changed')).toBe(true)
  })

  it('detects stability regression from stable to experimental', () => {
    const old = makeSnapshot([makeSig({ stability: 'stable' })])
    const new_ = makeSnapshot([makeSig({ stability: 'experimental' })])
    const result = validator.compare(old, new_)
    expect(result.compatible).toBe(false)
    expect(result.breakingChanges.some((c) => c.changeType === 'signature-changed')).toBe(true)
  })

  it('detects stability regression from stable to deprecated', () => {
    const old = makeSnapshot([makeSig({ stability: 'stable' })])
    const new_ = makeSnapshot([makeSig({ stability: 'deprecated' })])
    const result = validator.compare(old, new_)
    expect(result.compatible).toBe(false)
  })

  it('does not flag experimental to stable as breaking', () => {
    const old = makeSnapshot([makeSig({ stability: 'experimental' })])
    const new_ = makeSnapshot([makeSig({ stability: 'stable' })])
    const result = validator.compare(old, new_)
    expect(result.compatible).toBe(true)
  })

  it('detects new APIs', () => {
    const old = makeSnapshot([])
    const new_ = makeSnapshot([makeSig({ name: 'newFn' })])
    const result = validator.compare(old, new_)
    expect(result.newApis).toHaveLength(1)
    expect(result.newApis[0]!.name).toBe('newFn')
  })

  it('detects newly deprecated APIs', () => {
    const old = makeSnapshot([makeSig({ stability: 'stable' })])
    const new_ = makeSnapshot([makeSig({ stability: 'deprecated' })])
    const result = validator.compare(old, new_)
    expect(result.deprecatedApis).toHaveLength(1)
  })

  it('does not flag already-deprecated as new deprecation', () => {
    const old = makeSnapshot([makeSig({ stability: 'deprecated' })])
    const new_ = makeSnapshot([makeSig({ stability: 'deprecated' })])
    const result = validator.compare(old, new_)
    expect(result.deprecatedApis).toHaveLength(0)
  })

  it('handles multiple signatures across modules', () => {
    const old = makeSnapshot([
      makeSig({ name: 'fn1', module: 'mod1' }),
      makeSig({ name: 'fn2', module: 'mod2' }),
    ])
    const new_ = makeSnapshot([
      makeSig({ name: 'fn1', module: 'mod1' }),
      makeSig({ name: 'fn3', module: 'mod2' }),
    ])
    const result = validator.compare(old, new_)
    expect(result.breakingChanges).toHaveLength(1)
    expect(result.newApis).toHaveLength(1)
  })

  it('returns compatible for empty snapshots', () => {
    const empty = makeSnapshot([])
    const result = validator.compare(empty, empty)
    expect(result.compatible).toBe(true)
  })
})

// ─── createSnapshot ───

describe('APIContractValidator.createSnapshot', () => {
  const validator = new APIContractValidator()

  it('creates snapshot with version and signatures', () => {
    const sigs = [makeSig(), makeSig({ name: 'fn2' })]
    const snap = validator.createSnapshot('2.0.0', sigs)
    expect(snap.version).toBe('2.0.0')
    expect(snap.signatures).toHaveLength(2)
    expect(snap.timestamp).toBeGreaterThan(0)
  })

  it('copies signatures array', () => {
    const sigs = [makeSig()]
    const snap = validator.createSnapshot('1.0.0', sigs)
    sigs.push(makeSig({ name: 'extra' }))
    expect(snap.signatures).toHaveLength(1)
  })
})

// ─── validatePolicy ───

describe('APIContractValidator.validatePolicy', () => {
  const validator = new APIContractValidator()

  it('passes for stable APIs with stable minimum', () => {
    const snap = makeSnapshot([makeSig({ stability: 'stable' })])
    const violations = validator.validatePolicy(snap, {
      minimumStability: 'stable',
      allowedBreakingChangesPerMajor: 10,
      deprecationGraceVersions: 2,
    })
    expect(violations).toHaveLength(0)
  })

  it('flags experimental API below stable minimum', () => {
    const snap = makeSnapshot([makeSig({ stability: 'experimental' })])
    const violations = validator.validatePolicy(snap, {
      minimumStability: 'stable',
      allowedBreakingChangesPerMajor: 10,
      deprecationGraceVersions: 2,
    })
    expect(violations).toHaveLength(1)
    expect(violations[0]!.reason).toContain('below minimum')
  })

  it('skips internal APIs', () => {
    const snap = makeSnapshot([makeSig({ stability: 'internal' })])
    const violations = validator.validatePolicy(snap)
    expect(violations).toHaveLength(0)
  })

  it('uses default policy when none provided', () => {
    const snap = makeSnapshot([makeSig({ stability: 'experimental' })])
    const violations = validator.validatePolicy(snap)
    expect(violations).toHaveLength(1)
  })

  it('returns empty for empty snapshot', () => {
    const snap = makeSnapshot([])
    const violations = validator.validatePolicy(snap)
    expect(violations).toHaveLength(0)
  })
})

// ─── isBreakingChange ───

describe('APIContractValidator.isBreakingChange', () => {
  const validator = new APIContractValidator()

  it('detects kind change as breaking', () => {
    expect(validator.isBreakingChange(makeSig({ kind: 'function' }), makeSig({ kind: 'class' }))).toBe(true)
  })

  it('detects name change as breaking', () => {
    expect(validator.isBreakingChange(makeSig({ name: 'a' }), makeSig({ name: 'b' }))).toBe(true)
  })

  it('detects module change as breaking', () => {
    expect(validator.isBreakingChange(makeSig({ module: 'a' }), makeSig({ module: 'b' }))).toBe(true)
  })

  it('detects stable to experimental regression', () => {
    expect(validator.isBreakingChange(
      makeSig({ stability: 'stable' }),
      makeSig({ stability: 'experimental' }),
    )).toBe(true)
  })

  it('detects stable to deprecated regression', () => {
    expect(validator.isBreakingChange(
      makeSig({ stability: 'stable' }),
      makeSig({ stability: 'deprecated' }),
    )).toBe(true)
  })

  it('non-breaking when identical', () => {
    const sig = makeSig()
    expect(validator.isBreakingChange(sig, sig)).toBe(false)
  })

  it('non-breaking when only stability improves', () => {
    expect(validator.isBreakingChange(
      makeSig({ stability: 'experimental' }),
      makeSig({ stability: 'stable' }),
    )).toBe(false)
  })
})

// ─── serializeSnapshot / deserializeSnapshot ───

describe('APIContractValidator serialization', () => {
  const validator = new APIContractValidator()

  it('round-trips a snapshot through JSON', () => {
    const original = makeSnapshot([makeSig(), makeSig({ name: 'fn2' })], '3.0.0')
    const json = validator.serializeSnapshot(original)
    const restored = validator.deserializeSnapshot(json)
    expect(restored.version).toBe('3.0.0')
    expect(restored.signatures).toHaveLength(2)
    expect(restored.signatures[0]!.name).toBe('fn1')
  })
})

// ─── formatDiff ───

describe('APIContractValidator.formatDiff', () => {
  const validator = new APIContractValidator()

  it('shows breaking changes', () => {
    const result = {
      compatible: false,
      breakingChanges: [{
        signature: makeSig({ name: 'fn1' }),
        changeType: 'removed' as const,
        description: 'fn1 was removed',
      }],
      newApis: [],
      deprecatedApis: [],
    }
    const output = validator.formatDiff(result)
    expect(output).toContain('Breaking Changes:')
    expect(output).toContain('[removed]')
    expect(output).toContain('no')
  })

  it('shows new APIs', () => {
    const result = {
      compatible: true,
      breakingChanges: [],
      newApis: [makeSig({ name: 'newFn', kind: 'function', stability: 'stable' })],
      deprecatedApis: [],
    }
    const output = validator.formatDiff(result)
    expect(output).toContain('New APIs:')
    expect(output).toContain('newFn')
    expect(output).toContain('yes')
  })

  it('shows deprecated APIs', () => {
    const result = {
      compatible: true,
      breakingChanges: [],
      newApis: [],
      deprecatedApis: [makeSig({ name: 'oldFn', kind: 'function' })],
    }
    const output = validator.formatDiff(result)
    expect(output).toContain('Deprecated APIs:')
    expect(output).toContain('oldFn')
  })

  it('shows summary line', () => {
    const result = {
      compatible: true,
      breakingChanges: [],
      newApis: [makeSig()],
      deprecatedApis: [],
    }
    const output = validator.formatDiff(result)
    expect(output).toContain('Compatible: yes')
    expect(output).toContain('0 breaking')
    expect(output).toContain('1 new')
  })
})
