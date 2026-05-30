import { describe, expect, it } from 'vitest'
import { DeprecationManager } from '../../../src/core/deprecation-manager.js'
import type { APISignature } from '../../../src/core/api-types.js'

describe('DeprecationManager', () => {
  it('creates a new instance with empty state', () => {
    const manager = new DeprecationManager()
    expect(manager.getDeprecations()).toHaveLength(0)
    expect(manager.getWarnings()).toHaveLength(0)
  })

  it('registers a deprecation', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
      deprecatedSince: '2.0.0',
      removedIn: '3.0.0',
      replacement: 'newFunction',
      reason: 'Performance improvement',
    }
    manager.registerDeprecation(signature)
    expect(manager.getDeprecations()).toHaveLength(1)
    expect(manager.getDeprecations()[0]).toEqual(signature)
  })

  it('removes a deprecation', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    manager.registerDeprecation(signature)
    const removed = manager.removeDeprecation('oldFunction', 'utils')
    expect(removed).toBe(true)
    expect(manager.getDeprecations()).toHaveLength(0)
  })

  it('returns false when removing non-existent deprecation', () => {
    const manager = new DeprecationManager()
    const removed = manager.removeDeprecation('nonExistent', 'module')
    expect(removed).toBe(false)
  })

  it('checks if a signature is deprecated', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    manager.registerDeprecation(signature)
    expect(manager.isDeprecated('oldFunction', 'utils')).toBe(true)
    expect(manager.isDeprecated('otherFunction', 'utils')).toBe(false)
  })

  it('gets a specific deprecation', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    manager.registerDeprecation(signature)
    const result = manager.getDeprecation('oldFunction', 'utils')
    expect(result).toEqual(signature)
    expect(manager.getDeprecation('other', 'module')).toBeUndefined()
  })

  it('gets deprecations by module', () => {
    const manager = new DeprecationManager()
    const sig1: APISignature = {
      name: 'func1',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    const sig2: APISignature = {
      name: 'func2',
      module: 'core',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    manager.registerDeprecation(sig1)
    manager.registerDeprecation(sig2)
    const utilsDeps = manager.getDeprecationsByModule('utils')
    expect(utilsDeps).toHaveLength(1)
    expect(utilsDeps[0].name).toBe('func1')
  })

  it('gets deprecations by stability level', () => {
    const manager = new DeprecationManager()
    const sig1: APISignature = {
      name: 'func1',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    const sig2: APISignature = {
      name: 'func2',
      module: 'core',
      kind: 'function',
      stability: 'stable',
      sinceVersion: '1.0.0',
    }
    manager.registerDeprecation(sig1)
    manager.registerDeprecation(sig2)
    const deprecatedDeps = manager.getDeprecationsByStability('deprecated')
    expect(deprecatedDeps).toHaveLength(1)
    expect(deprecatedDeps[0].stability).toBe('deprecated')
  })

  it('creates a deprecation notice', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
      deprecatedSince: '2.0.0',
      removedIn: '3.0.0',
      replacement: 'newFunction',
      reason: 'Performance',
    }
    manager.registerDeprecation(signature)
    const notice = manager.createNotice('oldFunction', 'utils')
    expect(notice).not.toBeNull()
    expect(notice?.message).toContain('oldFunction is deprecated')
    expect(notice?.message).toContain('3.0.0')
    expect(notice?.message).toContain('newFunction')
    expect(notice?.message).toContain('Performance')
    expect(notice?.severity).toBe('high')
  })

  it('returns null for notice when signature is not found', () => {
    const manager = new DeprecationManager()
    const notice = manager.createNotice('nonExistent', 'module')
    expect(notice).toBeNull()
  })

  it('silences a deprecation', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    manager.registerDeprecation(signature)
    manager.silence('oldFunction', 'utils')
    expect(manager.isSilenced('oldFunction', 'utils')).toBe(true)
    const notice = manager.createNotice('oldFunction', 'utils')
    expect(notice).toBeNull()
  })

  it('gets all warnings', () => {
    const manager = new DeprecationManager()
    const sig1: APISignature = {
      name: 'func1',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    const sig2: APISignature = {
      name: 'func2',
      module: 'core',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    manager.registerDeprecation(sig1)
    manager.registerDeprecation(sig2)
    manager.createNotice('func1', 'utils')
    manager.createNotice('func2', 'core')
    expect(manager.getWarnings()).toHaveLength(2)
  })

  it('clears warnings', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    manager.registerDeprecation(signature)
    manager.createNotice('oldFunction', 'utils')
    manager.clearWarnings()
    expect(manager.getWarnings()).toHaveLength(0)
  })

  it('formats notices when empty', () => {
    const manager = new DeprecationManager()
    const formatted = manager.formatNotices()
    expect(formatted).toBe('No deprecations.')
  })

  it('formats notices with multiple deprecations', () => {
    const manager = new DeprecationManager()
    const sig1: APISignature = {
      name: 'func1',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
      removedIn: '2.0.0',
      replacement: 'newFunc1',
    }
    const sig2: APISignature = {
      name: 'func2',
      module: 'utils',
      kind: 'class',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    manager.registerDeprecation(sig1)
    manager.registerDeprecation(sig2)
    const formatted = manager.formatNotices()
    expect(formatted).toContain('[utils]')
    expect(formatted).toContain('func1')
    expect(formatted).toContain('func2')
  })

  it('gets removals by version with major version match', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
      removedIn: '2.0.0',
    }
    manager.registerDeprecation(signature)
    const removals = manager.getRemovalsByVersion({ major: 3, minor: 0, patch: 0 })
    expect(removals).toHaveLength(1)
  })

  it('gets removals by version with exact version match', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
      removedIn: '2.0.0',
    }
    manager.registerDeprecation(signature)
    const removals = manager.getRemovalsByVersion({ major: 2, minor: 0, patch: 0 })
    expect(removals).toHaveLength(1)
  })

  it('gets removals by version with no match', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
      removedIn: '3.0.0',
    }
    manager.registerDeprecation(signature)
    const removals = manager.getRemovalsByVersion({ major: 2, minor: 0, patch: 0 })
    expect(removals).toHaveLength(0)
  })

  it('validates removals and returns breaking changes', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
      removedIn: '2.0.0',
    }
    manager.registerDeprecation(signature)
    const breakingChanges = manager.validateRemovals({ major: 3, minor: 0, patch: 0 })
    expect(breakingChanges).toHaveLength(1)
    expect(breakingChanges[0].changeType).toBe('removed')
    expect(breakingChanges[0].description).toContain('oldFunction')
  })

  it('handles deprecation without removedIn version', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    manager.registerDeprecation(signature)
    const removals = manager.getRemovalsByVersion({ major: 3, minor: 0, patch: 0 })
    expect(removals).toHaveLength(0)
  })

  it('determines high severity for deprecation with removedIn', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
      removedIn: '3.0.0',
    }
    manager.registerDeprecation(signature)
    const notice = manager.createNotice('oldFunction', 'utils')
    expect(notice?.severity).toBe('high')
  })

  it('determines low severity for deprecation with replacement', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
      replacement: 'newFunction',
    }
    manager.registerDeprecation(signature)
    const notice = manager.createNotice('oldFunction', 'utils')
    expect(notice?.severity).toBe('low')
  })

  it('determines medium severity for basic deprecation', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    manager.registerDeprecation(signature)
    const notice = manager.createNotice('oldFunction', 'utils')
    expect(notice?.severity).toBe('medium')
  })

  it('uses deprecatedSince when available in notice message', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
      deprecatedSince: '2.0.0',
    }
    manager.registerDeprecation(signature)
    const notice = manager.createNotice('oldFunction', 'utils')
    expect(notice?.message).toContain('2.0.0')
  })

  it('falls back to sinceVersion when deprecatedSince is missing', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    manager.registerDeprecation(signature)
    const notice = manager.createNotice('oldFunction', 'utils')
    expect(notice?.message).toContain('1.0.0')
  })

  it('handles invalid version string in getRemovalsByVersion', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
      removedIn: 'invalid.version',
    }
    manager.registerDeprecation(signature)
    const removals = manager.getRemovalsByVersion({ major: 2, minor: 0, patch: 0 })
    expect(removals).toHaveLength(0)
  })

  it('stores notices when created', () => {
    const manager = new DeprecationManager()
    const signature: APISignature = {
      name: 'oldFunction',
      module: 'utils',
      kind: 'function',
      stability: 'deprecated',
      sinceVersion: '1.0.0',
    }
    manager.registerDeprecation(signature)
    manager.createNotice('oldFunction', 'utils')
    expect(manager.getWarnings()).toHaveLength(1)
  })
})