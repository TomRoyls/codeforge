import { describe, it, expect } from 'vitest'
import {
  GROUP_ORDER,
  categorizeImport,
  detectInternalPatterns,
  buildOrganizeOptions,
  shouldWriteChanges,
  displayOrganizeResult,
} from '../src/commands/organize-imports-helpers.js'

import type { OrganizeResult } from '../src/commands/organize-imports-helpers.js'

// ─── GROUP_ORDER ───────────────────────────────────────
describe('GROUP_ORDER', () => {
  it('has correct order', () => {
    expect(GROUP_ORDER).toEqual(['external', 'internal', 'relative', 'sideEffects'])
  })

  it('has 4 groups', () => {
    expect(GROUP_ORDER).toHaveLength(4)
  })
})

// ─── categorizeImport ──────────────────────────────────
describe('categorizeImport', () => {
  function makeMockImport(moduleSpecifier: string) {
    return {
      getModuleSpecifierValue: () => moduleSpecifier,
    } as never
  }

  it('categorizes relative imports starting with .', () => {
    expect(categorizeImport(makeMockImport('./utils'), [])).toBe('relative')
  })

  it('categorizes relative imports starting with ..', () => {
    expect(categorizeImport(makeMockImport('../parent'), [])).toBe('relative')
  })

  it('categorizes absolute path imports as relative', () => {
    expect(categorizeImport(makeMockImport('/absolute/path'), [])).toBe('relative')
  })

  it('categorizes npm packages as external', () => {
    expect(categorizeImport(makeMockImport('react'), [])).toBe('external')
  })

  it('categorizes scoped npm packages as external', () => {
    expect(categorizeImport(makeMockImport('@babel/core'), [])).toBe('external')
  })

  it('categorizes internal pattern matches as internal', () => {
    expect(categorizeImport(makeMockImport('@/components/Button'), ['@/'])).toBe('internal')
  })

  it('categorizes as external when no internal pattern matches', () => {
    expect(categorizeImport(makeMockImport('lodash'), ['@/'])).toBe('external')
  })

  it('categorizes multiple internal patterns', () => {
    expect(categorizeImport(makeMockImport('~/src/utils'), ['@/', '~/src/'])).toBe('internal')
    expect(categorizeImport(makeMockImport('@/utils'), ['@/', '~/src/'])).toBe('internal')
  })

  it('prioritizes internal over external', () => {
    expect(categorizeImport(makeMockImport('@/store'), ['@/'])).toBe('internal')
  })
})

// ─── detectInternalPatterns ────────────────────────────
describe('detectInternalPatterns', () => {
  it('returns default patterns', () => {
    const patterns = detectInternalPatterns({} as never)
    expect(patterns).toContain('@/')
    expect(patterns).toContain('~/src/')
    expect(patterns).toContain('@/src/')
  })

  it('always returns same patterns regardless of source file', () => {
    const p1 = detectInternalPatterns({} as never)
    const p2 = detectInternalPatterns({} as never)
    expect(p1).toEqual(p2)
  })
})

// ─── buildOrganizeOptions ──────────────────────────────
describe('buildOrganizeOptions', () => {
  it('uses default sort=true when not specified', () => {
    const opts = buildOrganizeOptions({})
    expect(opts.sort).toBe(true)
  })

  it('uses default group=false when not specified', () => {
    const opts = buildOrganizeOptions({})
    expect(opts.group).toBe(false)
  })

  it('uses default dryRun=false when not specified', () => {
    const opts = buildOrganizeOptions({})
    expect(opts.dryRun).toBe(false)
  })

  it('respects explicit flags', () => {
    const opts = buildOrganizeOptions({ 'dry-run': true, group: true, sort: false })
    expect(opts).toEqual({ dryRun: true, group: true, sort: false })
  })

  it('handles partial flags', () => {
    const opts = buildOrganizeOptions({ group: true })
    expect(opts.group).toBe(true)
    expect(opts.sort).toBe(true)
    expect(opts.dryRun).toBe(false)
  })
})

// ─── shouldWriteChanges ────────────────────────────────
describe('shouldWriteChanges', () => {
  it('returns true when write flag is set', () => {
    expect(shouldWriteChanges({ write: true })).toBe(true)
  })

  it('returns true when dry-run is not set', () => {
    expect(shouldWriteChanges({ 'dry-run': false })).toBe(true)
  })

  it('returns false when dry-run is set and write is not', () => {
    expect(shouldWriteChanges({ 'dry-run': true })).toBe(false)
  })

  it('write overrides dry-run', () => {
    expect(shouldWriteChanges({ write: true, 'dry-run': true })).toBe(true)
  })

  it('defaults to true when neither flag is set', () => {
    expect(shouldWriteChanges({})).toBe(true)
  })
})

// ─── displayOrganizeResult ─────────────────────────────
describe('displayOrganizeResult', () => {
  it('shows import organization header', () => {
    const messages: string[] = []
    const result: OrganizeResult = { filesModified: 3, importsOrganized: 10, skipped: 1 }
    displayOrganizeResult(result, 5, false, (m) => messages.push(m))
    expect(messages.some((m) => m.includes('Import Organization Complete'))).toBe(true)
  })

  it('shows files processed count', () => {
    const messages: string[] = []
    displayOrganizeResult(
      { filesModified: 3, importsOrganized: 10, skipped: 1 },
      5,
      false,
      (m) => messages.push(m),
    )
    expect(messages.some((m) => m.includes('5'))).toBe(true)
  })

  it('shows imports organized count', () => {
    const messages: string[] = []
    displayOrganizeResult(
      { filesModified: 2, importsOrganized: 15, skipped: 0 },
      3,
      false,
      (m) => messages.push(m),
    )
    expect(messages.some((m) => m.includes('15'))).toBe(true)
  })

  it('shows skipped count', () => {
    const messages: string[] = []
    displayOrganizeResult(
      { filesModified: 2, importsOrganized: 5, skipped: 3 },
      5,
      false,
      (m) => messages.push(m),
    )
    expect(messages.some((m) => m.includes('3'))).toBe(true)
  })

  it('shows dry-run notice when enabled', () => {
    const messages: string[] = []
    displayOrganizeResult(
      { filesModified: 1, importsOrganized: 2, skipped: 0 },
      1,
      true,
      (m) => messages.push(m),
    )
    expect(messages.some((m) => m.includes('dry-run'))).toBe(true)
  })

  it('does not show dry-run notice when disabled', () => {
    const messages: string[] = []
    displayOrganizeResult(
      { filesModified: 1, importsOrganized: 2, skipped: 0 },
      1,
      false,
      (m) => messages.push(m),
    )
    expect(messages.every((m) => !m.includes('dry-run'))).toBe(true)
  })
})
