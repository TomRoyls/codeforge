import { describe, expect, it } from 'vitest'

import {
  displayCleanResult,
  formatCleanHeader,
  formatCleanSummary,
  formatTargetStatus,
  getCleanTargets,
  type CleanTarget,
} from '../../src/commands/clean-helpers.js'

// ─── getCleanTargets ───

describe('getCleanTargets', () => {
  it('returns only cache targets when cache flag is set', () => {
    const targets = getCleanTargets({ cache: true }, '/project')
    expect(targets).toHaveLength(2)
    expect(targets.every((t) => t.name.toLowerCase().includes('cache'))).toBe(true)
  })

  it('returns only dist target when dist flag is set', () => {
    const targets = getCleanTargets({ dist: true }, '/project')
    expect(targets).toHaveLength(1)
    expect(targets[0].name).toBe('Dist directory')
  })

  it('returns all targets when no flags set', () => {
    const targets = getCleanTargets({}, '/project')
    expect(targets.length).toBeGreaterThanOrEqual(3)
    const names = targets.map((t) => t.name)
    expect(names).toContain('Dist directory')
    expect(names).toContain('Cache directory')
    expect(names).toContain('CodeForge cache')
  })

  it('includes cwd in paths', () => {
    const targets = getCleanTargets({ dist: true }, '/my/project')
    expect(targets[0].path).toContain('/my/project')
  })

  it('cache flag takes priority over default', () => {
    const cacheTargets = getCleanTargets({ cache: true }, '/project')
    const allTargets = getCleanTargets({}, '/project')
    expect(cacheTargets.length).toBeLessThan(allTargets.length)
  })
})

// ─── formatTargetStatus ───

describe('formatTargetStatus', () => {
  const target: CleanTarget = { name: 'Test dir', path: '/tmp/test' }

  it('returns gray "not found" when target does not exist', () => {
    const result = formatTargetStatus(target, false, true)
    expect(result).toContain('not found')
  })

  it('returns cyan bullet for dry run when target exists', () => {
    const result = formatTargetStatus(target, true, true, undefined, true)
    expect(result).toContain('Test dir')
  })

  it('returns green checkmark when target exists and was cleaned', () => {
    const result = formatTargetStatus(target, true, true)
    expect(result).toContain('Test dir')
  })

  it('returns red X when target exists but cleaning failed', () => {
    const result = formatTargetStatus(target, true, false, 'permission denied')
    expect(result).toContain('permission denied')
  })

  it('uses "Unknown error" when no error message provided', () => {
    const result = formatTargetStatus(target, true, false)
    expect(result).toContain('Unknown error')
  })
})

// ─── formatCleanSummary ───

describe('formatCleanSummary', () => {
  it('shows cleaned count for non-dry-run', () => {
    const result = formatCleanSummary(3, false)
    expect(result).toContain('3')
    expect(result).toContain('directories')
  })

  it('uses singular "directory" for count of 1', () => {
    const result = formatCleanSummary(1, false)
    expect(result).toContain('1 directory')
    expect(result).not.toContain('directories')
  })

  it('shows "Would clean" for dry run', () => {
    const result = formatCleanSummary(2, true)
    expect(result).toContain('Would clean')
  })

  it('shows "Nothing to clean" when count is 0', () => {
    const result = formatCleanSummary(0, false)
    expect(result).toContain('Nothing to clean')
  })
})

// ─── formatCleanHeader ───

describe('formatCleanHeader', () => {
  it('shows dry-run header when dryRun is true', () => {
    expect(formatCleanHeader(true)).toContain('Would clean')
  })

  it('shows normal header when dryRun is false', () => {
    expect(formatCleanHeader(false)).toContain('Cleaning')
  })
})

// ─── displayCleanResult ───

describe('displayCleanResult', () => {
  it('calls logFn with summary', () => {
    const messages: string[] = []
    displayCleanResult(2, false, (msg) => messages.push(msg))
    expect(messages.length).toBeGreaterThan(0)
    expect(messages.some((m) => m.includes('2'))).toBe(true)
  })
})
