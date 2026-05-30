import { describe, expect, it } from 'vitest'
import { APIContractValidator } from '../../../src/core/api-contract-validator.js'
import type { APISignature, APISnapshot, StabilityPolicy } from '../../../src/core/api-types.js'

describe('APIContractValidator', () => {
  it('creates a new instance', () => {
    const validator = new APIContractValidator()
    expect(validator).toBeInstanceOf(APIContractValidator)
  })

  it('creates a snapshot with version and signatures', () => {
    const validator = new APIContractValidator()
    const signatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const snapshot = validator.createSnapshot('1.0.0', signatures)
    expect(snapshot.version).toBe('1.0.0')
    expect(snapshot.signatures).toHaveLength(1)
    expect(snapshot.timestamp).toBeGreaterThan(0)
  })

  it('compares identical snapshots and returns compatible', () => {
    const validator = new APIContractValidator()
    const signatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const oldSnapshot = validator.createSnapshot('1.0.0', signatures)
    const newSnapshot = validator.createSnapshot('1.0.0', signatures)
    const result = validator.compare(oldSnapshot, newSnapshot)
    expect(result.compatible).toBe(true)
    expect(result.breakingChanges).toHaveLength(0)
  })

  it('detects removed API as breaking change', () => {
    const validator = new APIContractValidator()
    const oldSignatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const newSignatures: APISignature[] = []
    const oldSnapshot = validator.createSnapshot('1.0.0', oldSignatures)
    const newSnapshot = validator.createSnapshot('2.0.0', newSignatures)
    const result = validator.compare(oldSnapshot, newSnapshot)
    expect(result.compatible).toBe(false)
    expect(result.breakingChanges).toHaveLength(1)
    expect(result.breakingChanges[0].changeType).toBe('removed')
  })

  it('detects type change as breaking change', () => {
    const validator = new APIContractValidator()
    const oldSignatures: APISignature[] = [
      {
        name: 'item',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const newSignatures: APISignature[] = [
      {
        name: 'item',
        module: 'core',
        kind: 'class',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const oldSnapshot = validator.createSnapshot('1.0.0', oldSignatures)
    const newSnapshot = validator.createSnapshot('2.0.0', newSignatures)
    const result = validator.compare(oldSnapshot, newSnapshot)
    expect(result.compatible).toBe(false)
    expect(result.breakingChanges[0].changeType).toBe('type-changed')
  })

  it('detects stability regression from stable to experimental as breaking', () => {
    const validator = new APIContractValidator()
    const oldSignatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const newSignatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'experimental',
        sinceVersion: '1.0.0',
      },
    ]
    const oldSnapshot = validator.createSnapshot('1.0.0', oldSignatures)
    const newSnapshot = validator.createSnapshot('2.0.0', newSignatures)
    const result = validator.compare(oldSnapshot, newSnapshot)
    expect(result.compatible).toBe(false)
    expect(result.breakingChanges[0].changeType).toBe('signature-changed')
  })

  it('detects stability regression from stable to deprecated as breaking', () => {
    const validator = new APIContractValidator()
    const oldSignatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const newSignatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'deprecated',
        sinceVersion: '1.0.0',
      },
    ]
    const oldSnapshot = validator.createSnapshot('1.0.0', oldSignatures)
    const newSnapshot = validator.createSnapshot('2.0.0', newSignatures)
    const result = validator.compare(oldSnapshot, newSnapshot)
    expect(result.compatible).toBe(false)
    expect(result.breakingChanges[0].changeType).toBe('signature-changed')
  })

  it('identifies new APIs', () => {
    const validator = new APIContractValidator()
    const oldSignatures: APISignature[] = []
    const newSignatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const oldSnapshot = validator.createSnapshot('1.0.0', oldSignatures)
    const newSnapshot = validator.createSnapshot('2.0.0', newSignatures)
    const result = validator.compare(oldSnapshot, newSnapshot)
    expect(result.compatible).toBe(true)
    expect(result.newApis).toHaveLength(1)
    expect(result.newApis[0].name).toBe('function1')
  })

  it('identifies newly deprecated APIs', () => {
    const validator = new APIContractValidator()
    const oldSignatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const newSignatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'deprecated',
        sinceVersion: '1.0.0',
      },
    ]
    const oldSnapshot = validator.createSnapshot('1.0.0', oldSignatures)
    const newSnapshot = validator.createSnapshot('2.0.0', newSignatures)
    const result = validator.compare(oldSnapshot, newSnapshot)
    expect(result.compatible).toBe(false)
    expect(result.deprecatedApis).toHaveLength(1)
  })

  it('does not identify already deprecated as newly deprecated', () => {
    const validator = new APIContractValidator()
    const oldSignatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'deprecated',
        sinceVersion: '1.0.0',
      },
    ]
    const newSignatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'deprecated',
        sinceVersion: '1.0.0',
      },
    ]
    const oldSnapshot = validator.createSnapshot('1.0.0', oldSignatures)
    const newSnapshot = validator.createSnapshot('2.0.0', newSignatures)
    const result = validator.compare(oldSnapshot, newSnapshot)
    expect(result.deprecatedApis).toHaveLength(0)
  })

  it('serializes snapshot to JSON string', () => {
    const validator = new APIContractValidator()
    const signatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const snapshot = validator.createSnapshot('1.0.0', signatures)
    const serialized = validator.serializeSnapshot(snapshot)
    const parsed = JSON.parse(serialized)
    expect(parsed.version).toBe('1.0.0')
    expect(parsed.signatures).toHaveLength(1)
  })

  it('deserializes snapshot from JSON string', () => {
    const validator = new APIContractValidator()
    const snapshotData = {
      version: '1.0.0',
      timestamp: 1234567890,
      signatures: [
        {
          name: 'function1',
          module: 'core',
          kind: 'function',
          stability: 'stable',
          sinceVersion: '1.0.0',
        },
      ],
    }
    const json = JSON.stringify(snapshotData)
    const snapshot = validator.deserializeSnapshot(json)
    expect(snapshot.version).toBe('1.0.0')
    expect(snapshot.signatures).toHaveLength(1)
  })

  it('validates policy and returns no violations for stable snapshot', () => {
    const validator = new APIContractValidator()
    const signatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const snapshot = validator.createSnapshot('1.0.0', signatures)
    const policy: StabilityPolicy = {
      minimumStability: 'stable',
    }
    const violations = validator.validatePolicy(snapshot, policy)
    expect(violations).toHaveLength(0)
  })

  it('validates policy and returns violations for unstable snapshot', () => {
    const validator = new APIContractValidator()
    const signatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'experimental',
        sinceVersion: '1.0.0',
      },
    ]
    const snapshot = validator.createSnapshot('1.0.0', signatures)
    const policy: StabilityPolicy = {
      minimumStability: 'stable',
    }
    const violations = validator.validatePolicy(snapshot, policy)
    expect(violations).toHaveLength(1)
    expect(violations[0].reason).toContain('experimental')
  })

  it('skips internal APIs in policy validation', () => {
    const validator = new APIContractValidator()
    const signatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'internal',
        sinceVersion: '1.0.0',
      },
    ]
    const snapshot = validator.createSnapshot('1.0.0', signatures)
    const policy: StabilityPolicy = {
      minimumStability: 'stable',
    }
    const violations = validator.validatePolicy(snapshot, policy)
    expect(violations).toHaveLength(0)
  })

  it('uses default policy when none provided', () => {
    const validator = new APIContractValidator()
    const signatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const snapshot = validator.createSnapshot('1.0.0', signatures)
    const violations = validator.validatePolicy(snapshot)
    expect(violations).toBeInstanceOf(Array)
  })

  it('detects breaking change for kind difference', () => {
    const validator = new APIContractValidator()
    const oldSig: APISignature = {
      name: 'func',
      module: 'm',
      kind: 'function',
      stability: 'stable',
      sinceVersion: '1.0.0',
    }
    const newSig: APISignature = {
      name: 'func',
      module: 'm',
      kind: 'class',
      stability: 'stable',
      sinceVersion: '1.0.0',
    }
    const isBreaking = validator.isBreakingChange(oldSig, newSig)
    expect(isBreaking).toBe(true)
  })

  it('detects breaking change for name difference', () => {
    const validator = new APIContractValidator()
    const oldSig: APISignature = {
      name: 'func1',
      module: 'm',
      kind: 'function',
      stability: 'stable',
      sinceVersion: '1.0.0',
    }
    const newSig: APISignature = {
      name: 'func2',
      module: 'm',
      kind: 'function',
      stability: 'stable',
      sinceVersion: '1.0.0',
    }
    const isBreaking = validator.isBreakingChange(oldSig, newSig)
    expect(isBreaking).toBe(true)
  })

  it('detects breaking change for module difference', () => {
    const validator = new APIContractValidator()
    const oldSig: APISignature = {
      name: 'func',
      module: 'm1',
      kind: 'function',
      stability: 'stable',
      sinceVersion: '1.0.0',
    }
    const newSig: APISignature = {
      name: 'func',
      module: 'm2',
      kind: 'function',
      stability: 'stable',
      sinceVersion: '1.0.0',
    }
    const isBreaking = validator.isBreakingChange(oldSig, newSig)
    expect(isBreaking).toBe(true)
  })

  it('detects breaking change for stability regression', () => {
    const validator = new APIContractValidator()
    const oldSig: APISignature = {
      name: 'func',
      module: 'm',
      kind: 'function',
      stability: 'stable',
      sinceVersion: '1.0.0',
    }
    const newSig: APISignature = {
      name: 'func',
      module: 'm',
      kind: 'function',
      stability: 'experimental',
      sinceVersion: '1.0.0',
    }
    const isBreaking = validator.isBreakingChange(oldSig, newSig)
    expect(isBreaking).toBe(true)
  })

  it('does not detect breaking change for identical signatures', () => {
    const validator = new APIContractValidator()
    const sig: APISignature = {
      name: 'func',
      module: 'm',
      kind: 'function',
      stability: 'stable',
      sinceVersion: '1.0.0',
    }
    const isBreaking = validator.isBreakingChange(sig, sig)
    expect(isBreaking).toBe(false)
  })

  it('formats diff report with all sections', () => {
    const validator = new APIContractValidator()
    const oldSignatures: APISignature[] = [
      {
        name: 'removed',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
      {
        name: 'deprecated',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const newSignatures: APISignature[] = [
      {
        name: 'deprecated',
        module: 'core',
        kind: 'function',
        stability: 'deprecated',
        sinceVersion: '1.0.0',
      },
      {
        name: 'added',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '2.0.0',
      },
    ]
    const oldSnapshot = validator.createSnapshot('1.0.0', oldSignatures)
    const newSnapshot = validator.createSnapshot('2.0.0', newSignatures)
    const result = validator.compare(oldSnapshot, newSnapshot)
    const formatted = validator.formatDiff(result)
    expect(formatted).toContain('Breaking Changes:')
    expect(formatted).toContain('New APIs:')
    expect(formatted).toContain('Deprecated APIs:')
    expect(formatted).toContain('Compatible:')
  })

  it('formats diff report for compatible result', () => {
    const validator = new APIContractValidator()
    const signatures: APISignature[] = [
      {
        name: 'function1',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const oldSnapshot = validator.createSnapshot('1.0.0', signatures)
    const newSnapshot = validator.createSnapshot('2.0.0', signatures)
    const result = validator.compare(oldSnapshot, newSnapshot)
    const formatted = validator.formatDiff(result)
    expect(formatted).toContain('Compatible: yes')
  })

  it('formats diff report for incompatible result', () => {
    const validator = new APIContractValidator()
    const oldSignatures: APISignature[] = [
      {
        name: 'removed',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const newSignatures: APISignature[] = []
    const oldSnapshot = validator.createSnapshot('1.0.0', oldSignatures)
    const newSnapshot = validator.createSnapshot('2.0.0', newSignatures)
    const result = validator.compare(oldSnapshot, newSnapshot)
    const formatted = validator.formatDiff(result)
    expect(formatted).toContain('Compatible: no')
  })

  it('handles multiple breaking changes', () => {
    const validator = new APIContractValidator()
    const oldSignatures: APISignature[] = [
      {
        name: 'func1',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
      {
        name: 'func2',
        module: 'core',
        kind: 'function',
        stability: 'stable',
        sinceVersion: '1.0.0',
      },
    ]
    const newSignatures: APISignature[] = []
    const oldSnapshot = validator.createSnapshot('1.0.0', oldSignatures)
    const newSnapshot = validator.createSnapshot('2.0.0', newSignatures)
    const result = validator.compare(oldSnapshot, newSnapshot)
    expect(result.breakingChanges).toHaveLength(2)
  })
})