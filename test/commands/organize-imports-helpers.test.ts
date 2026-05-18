import { describe, expect, it } from 'vitest'

import {
  buildOrganizeOptions,
  GROUP_ORDER,
  shouldWriteChanges,
  type ImportGroup,
} from '../../src/commands/organize-imports-helpers.js'

// ─── GROUP_ORDER ───

describe('GROUP_ORDER', () => {
  it('contains expected group names', () => {
    expect(GROUP_ORDER).toContain('external')
    expect(GROUP_ORDER).toContain('internal')
    expect(GROUP_ORDER).toContain('relative')
    expect(GROUP_ORDER).toContain('sideEffects')
  })

  it('has external first and relative last', () => {
    expect(GROUP_ORDER[0]).toBe('external')
  })
})

// ─── buildOrganizeOptions ───

describe('buildOrganizeOptions', () => {
  it('returns defaults for empty flags', () => {
    const opts = buildOrganizeOptions({})
    expect(opts.dryRun).toBe(false)
    expect(opts.group).toBe(false)
    expect(opts.sort).toBe(true)
  })

  it('uses dry-run flag', () => {
    expect(buildOrganizeOptions({ 'dry-run': true }).dryRun).toBe(true)
  })

  it('uses group flag', () => {
    expect(buildOrganizeOptions({ group: true }).group).toBe(true)
  })

  it('uses sort flag', () => {
    expect(buildOrganizeOptions({ sort: false }).sort).toBe(false)
  })

  it('sort defaults to true', () => {
    expect(buildOrganizeOptions({}).sort).toBe(true)
  })
})

// ─── shouldWriteChanges ───

describe('shouldWriteChanges', () => {
  it('returns true when write flag is set', () => {
    expect(shouldWriteChanges({ write: true })).toBe(true)
  })

  it('returns true when no dry-run', () => {
    expect(shouldWriteChanges({})).toBe(true)
  })

  it('returns false when dry-run is true and write is false', () => {
    expect(shouldWriteChanges({ 'dry-run': true })).toBe(false)
  })

  it('write overrides dry-run', () => {
    expect(shouldWriteChanges({ 'dry-run': true, write: true })).toBe(true)
  })
})
