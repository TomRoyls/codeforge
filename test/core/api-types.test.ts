import { describe, expect, it } from 'vitest'

import {
  compareStability,
  formatAPIVersion,
  isPrerelease,
  parseAPIVersion,
  stabilityOrder,
  STABILITY_ORDER,
} from '../../src/core/api-types.js'

// ─── parseAPIVersion ───

describe('parseAPIVersion', () => {
  it('parses basic version', () => {
    const v = parseAPIVersion('1.2.3')
    expect(v.major).toBe(1)
    expect(v.minor).toBe(2)
    expect(v.patch).toBe(3)
    expect(v.prerelease).toBeUndefined()
  })

  it('parses version with prerelease', () => {
    const v = parseAPIVersion('1.0.0-alpha')
    expect(v.prerelease).toBe('alpha')
  })

  it('throws for invalid version', () => {
    expect(() => parseAPIVersion('invalid')).toThrow('Invalid version format')
  })

  it('parses zero version', () => {
    const v = parseAPIVersion('0.0.0')
    expect(v.major).toBe(0)
  })
})

// ─── formatAPIVersion ───

describe('formatAPIVersion', () => {
  it('formats basic version', () => {
    expect(formatAPIVersion({ major: 1, minor: 2, patch: 3 })).toBe('1.2.3')
  })

  it('formats with prerelease', () => {
    expect(formatAPIVersion({ major: 1, minor: 0, patch: 0, prerelease: 'beta' })).toBe('1.0.0-beta')
  })
})

// ─── isPrerelease ───

describe('isPrerelease', () => {
  it('returns true for prerelease', () => {
    expect(isPrerelease({ major: 1, minor: 0, patch: 0, prerelease: 'alpha' })).toBe(true)
  })

  it('returns false for release', () => {
    expect(isPrerelease({ major: 1, minor: 0, patch: 0 })).toBe(false)
  })

  it('returns false for empty prerelease', () => {
    expect(isPrerelease({ major: 1, minor: 0, patch: 0, prerelease: '' })).toBe(false)
  })
})

// ─── stabilityOrder ───

describe('stabilityOrder', () => {
  it('returns correct order for internal', () => {
    expect(stabilityOrder('internal')).toBe(0)
  })

  it('returns correct order for experimental', () => {
    expect(stabilityOrder('experimental')).toBe(1)
  })

  it('returns correct order for stable', () => {
    expect(stabilityOrder('stable')).toBe(2)
  })

  it('returns correct order for deprecated', () => {
    expect(stabilityOrder('deprecated')).toBe(3)
  })
})

// ─── compareStability ───

describe('compareStability', () => {
  it('returns negative when a < b', () => {
    expect(compareStability('internal', 'stable')).toBeLessThan(0)
  })

  it('returns positive when a > b', () => {
    expect(compareStability('deprecated', 'stable')).toBeGreaterThan(0)
  })

  it('returns 0 when equal', () => {
    expect(compareStability('stable', 'stable')).toBe(0)
  })
})

// ─── STABILITY_ORDER ───

describe('STABILITY_ORDER', () => {
  it('has 4 levels', () => {
    expect(STABILITY_ORDER.length).toBe(4)
  })

  it('is in ascending order', () => {
    for (let i = 1; i < STABILITY_ORDER.length; i++) {
      expect(stabilityOrder(STABILITY_ORDER[i]!)).toBeGreaterThan(stabilityOrder(STABILITY_ORDER[i - 1]!))
    }
  })
})
