import { describe, expect, it } from 'vitest'

import { DeprecationManager } from '../../src/core/deprecation-manager.js'

import type { APISignature } from '../../src/core/api-types.js'

// ─── Helpers ───

function makeSig(overrides: Partial<APISignature> = {}): APISignature {
  return {
    kind: 'function',
    module: 'core',
    name: 'oldFn',
    sinceVersion: '1.0.0',
    stability: 'deprecated',
    ...overrides,
  }
}

// ─── registerDeprecation / isDeprecated / getDeprecation ───

describe('DeprecationManager register', () => {
  it('registers a deprecation', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig())
    expect(mgr.isDeprecated('oldFn', 'core')).toBe(true)
  })

  it('is not deprecated before registration', () => {
    const mgr = new DeprecationManager()
    expect(mgr.isDeprecated('oldFn', 'core')).toBe(false)
  })

  it('retrieves registered deprecation', () => {
    const mgr = new DeprecationManager()
    const sig = makeSig({ reason: 'old' })
    mgr.registerDeprecation(sig)
    expect(mgr.getDeprecation('oldFn', 'core')).toEqual(sig)
  })

  it('returns undefined for unknown deprecation', () => {
    const mgr = new DeprecationManager()
    expect(mgr.getDeprecation('nope', 'core')).toBeUndefined()
  })
})

// ─── removeDeprecation ───

describe('DeprecationManager removeDeprecation', () => {
  it('removes a deprecation', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig())
    expect(mgr.removeDeprecation('oldFn', 'core')).toBe(true)
    expect(mgr.isDeprecated('oldFn', 'core')).toBe(false)
  })

  it('returns false for non-existent deprecation', () => {
    const mgr = new DeprecationManager()
    expect(mgr.removeDeprecation('nope', 'core')).toBe(false)
  })
})

// ─── getDeprecations ───

describe('DeprecationManager getDeprecations', () => {
  it('returns all deprecations', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig({ name: 'a' }))
    mgr.registerDeprecation(makeSig({ name: 'b' }))
    expect(mgr.getDeprecations().length).toBe(2)
  })

  it('returns empty for no deprecations', () => {
    expect(new DeprecationManager().getDeprecations()).toEqual([])
  })
})

// ─── getDeprecationsByModule ───

describe('DeprecationManager getDeprecationsByModule', () => {
  it('filters by module', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig({ module: 'core', name: 'a' }))
    mgr.registerDeprecation(makeSig({ module: 'utils', name: 'b' }))
    expect(mgr.getDeprecationsByModule('core').length).toBe(1)
    expect(mgr.getDeprecationsByModule('utils').length).toBe(1)
  })
})

// ─── getDeprecationsByStability ───

describe('DeprecationManager getDeprecationsByStability', () => {
  it('filters by stability', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig({ stability: 'deprecated' }))
    mgr.registerDeprecation(makeSig({ name: 'expFn', stability: 'experimental' }))
    expect(mgr.getDeprecationsByStability('deprecated').length).toBe(1)
    expect(mgr.getDeprecationsByStability('experimental').length).toBe(1)
  })
})

// ─── createNotice ───

describe('DeprecationManager createNotice', () => {
  it('creates notice for registered deprecation', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig({ deprecatedSince: '2.0.0' }))
    const notice = mgr.createNotice('oldFn', 'core')
    expect(notice).not.toBeNull()
    expect(notice!.message).toContain('deprecated')
    expect(notice!.message).toContain('2.0.0')
  })

  it('returns null for unknown', () => {
    const mgr = new DeprecationManager()
    expect(mgr.createNotice('nope', 'core')).toBeNull()
  })

  it('includes removedIn in message', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig({ removedIn: '3.0.0' }))
    const notice = mgr.createNotice('oldFn', 'core')
    expect(notice!.message).toContain('removed in version 3.0.0')
  })

  it('includes replacement in message', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig({ replacement: 'newFn' }))
    const notice = mgr.createNotice('oldFn', 'core')
    expect(notice!.message).toContain('newFn')
  })

  it('includes reason in message', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig({ reason: 'use newFn instead' }))
    const notice = mgr.createNotice('oldFn', 'core')
    expect(notice!.message).toContain('use newFn instead')
  })

  it('assigns high severity when removedIn is set', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig({ removedIn: '3.0.0' }))
    const notice = mgr.createNotice('oldFn', 'core')
    expect(notice!.severity).toBe('high')
  })

  it('assigns low severity when replacement exists', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig({ replacement: 'newFn' }))
    const notice = mgr.createNotice('oldFn', 'core')
    expect(notice!.severity).toBe('low')
  })

  it('assigns medium severity by default', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig())
    const notice = mgr.createNotice('oldFn', 'core')
    expect(notice!.severity).toBe('medium')
  })

  it('returns null when silenced', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig())
    mgr.silence('oldFn', 'core')
    expect(mgr.createNotice('oldFn', 'core')).toBeNull()
  })
})

// ─── warnings ───

describe('DeprecationManager warnings', () => {
  it('accumulates warnings', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig({ name: 'a' }))
    mgr.registerDeprecation(makeSig({ name: 'b' }))
    mgr.createNotice('a', 'core')
    mgr.createNotice('b', 'core')
    expect(mgr.getWarnings().length).toBe(2)
  })

  it('clearWarnings clears all warnings', () => {
    const mgr = new DeprecationManager()
    mgr.registerDeprecation(makeSig())
    mgr.createNotice('oldFn', 'core')
    mgr.clearWarnings()
    expect(mgr.getWarnings()).toEqual([])
  })
})
