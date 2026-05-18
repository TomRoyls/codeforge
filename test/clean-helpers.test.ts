import { describe, it, expect } from 'vitest'

import {
  displayCleanResult,
  formatCleanHeader,
  formatCleanSummary,
  formatTargetStatus,
  getCleanTargets,
} from '../src/commands/clean-helpers.js'

// ─── getCleanTargets ───────────────────────────────────
describe('getCleanTargets', () => {
  it('returns cache-only targets when cache flag is set', () => {
    const targets = getCleanTargets({ cache: true }, '/project')
    expect(targets).toHaveLength(2)
    expect(targets[0].name).toBe('Cache directory')
    expect(targets[1].name).toBe('CodeForge cache')
    expect(targets[0].path).toContain('.cache')
    expect(targets[1].path).toContain('.codeforge')
  })

  it('returns dist-only targets when dist flag is set', () => {
    const targets = getCleanTargets({ dist: true }, '/project')
    expect(targets).toHaveLength(1)
    expect(targets[0].name).toBe('Dist directory')
    expect(targets[0].path).toContain('dist')
  })

  it('returns all targets when no flags are set', () => {
    const targets = getCleanTargets({}, '/project')
    expect(targets).toHaveLength(4)
    const names = targets.map((t) => t.name)
    expect(names).toContain('Dist directory')
    expect(names).toContain('Cache directory')
    expect(names).toContain('CodeForge cache')
    expect(names).toContain('Coverage directory')
  })

  it('joins paths with cwd', () => {
    const targets = getCleanTargets({ dist: true }, '/my/project')
    expect(targets[0].path).toBe('/my/project/dist')
  })

  it('uses provided cwd for all paths', () => {
    const targets = getCleanTargets({ cache: true }, '/custom')
    for (const t of targets) {
      expect(t.path).toMatch(/^\/custom\//)
    }
  })
})

// ─── formatTargetStatus ────────────────────────────────
describe('formatTargetStatus', () => {
  const target = { name: 'Test directory', path: '/tmp/test' }

  it('returns gray "not found" when target does not exist', () => {
    const result = formatTargetStatus(target, false, false)
    expect(result).toContain('Test directory')
    expect(result).toContain('not found')
  })

  it('returns cyan bullet for dry run', () => {
    const result = formatTargetStatus(target, true, false, undefined, true)
    expect(result).toContain('Test directory')
    expect(result).toContain('•')
  })

  it('returns green checkmark for successful clean', () => {
    const result = formatTargetStatus(target, true, true)
    expect(result).toContain('Test directory')
    expect(result).toContain('✓')
  })

  it('returns red cross with error message on failure', () => {
    const result = formatTargetStatus(target, true, false, 'Permission denied')
    expect(result).toContain('Test directory')
    expect(result).toContain('Permission denied')
    expect(result).toContain('✗')
  })

  it('returns "Unknown error" when no error message provided', () => {
    const result = formatTargetStatus(target, true, false)
    expect(result).toContain('Unknown error')
  })

  it('prioritizes "not found" over other states', () => {
    const result = formatTargetStatus(target, false, true)
    expect(result).toContain('not found')
    expect(result).not.toContain('✓')
  })

  it('prioritizes dry run over success', () => {
    const result = formatTargetStatus(target, true, true, undefined, true)
    expect(result).toContain('•')
    expect(result).not.toContain('✓')
  })
})

// ─── formatCleanSummary ────────────────────────────────
describe('formatCleanSummary', () => {
  it('returns green message for cleaned directories', () => {
    const result = formatCleanSummary(3, false)
    expect(result).toContain('Cleaned 3 directories')
  })

  it('uses singular "directory" for count of 1', () => {
    const result = formatCleanSummary(1, false)
    expect(result).toContain('1 directory')
    expect(result).not.toContain('1 directories')
  })

  it('uses plural "directories" for count > 1', () => {
    const result = formatCleanSummary(5, false)
    expect(result).toContain('5 directories')
  })

  it('returns cyan "Would clean" for dry run', () => {
    const result = formatCleanSummary(2, true)
    expect(result).toContain('Would clean 2 directories')
  })

  it('returns yellow "Nothing to clean" for zero count', () => {
    const result = formatCleanSummary(0, false)
    expect(result).toContain('Nothing to clean')
  })

  it('returns "Nothing to clean" for zero count dry run too', () => {
    const result = formatCleanSummary(0, true)
    expect(result).toContain('Nothing to clean')
  })
})

// ─── formatCleanHeader ─────────────────────────────────
describe('formatCleanHeader', () => {
  it('returns dry run header', () => {
    const result = formatCleanHeader(true)
    expect(result).toContain('Would clean the following')
  })

  it('returns normal header', () => {
    const result = formatCleanHeader(false)
    expect(result).toContain('Cleaning generated files')
  })

  it('ends with newline', () => {
    expect(formatCleanHeader(false)).toMatch(/\n$/)
    expect(formatCleanHeader(true)).toMatch(/\n$/)
  })
})

// ─── displayCleanResult ────────────────────────────────
describe('displayCleanResult', () => {
  it('calls logFn with blank line and summary', () => {
    const logs: string[] = []
    displayCleanResult(2, false, (msg) => logs.push(msg))
    expect(logs).toHaveLength(2)
    expect(logs[0]).toBe('')
    expect(logs[1]).toContain('Cleaned 2 directories')
  })

  it('handles dry run mode', () => {
    const logs: string[] = []
    displayCleanResult(1, true, (msg) => logs.push(msg))
    expect(logs[1]).toContain('Would clean')
  })

  it('handles nothing to clean', () => {
    const logs: string[] = []
    displayCleanResult(0, false, (msg) => logs.push(msg))
    expect(logs[1]).toContain('Nothing to clean')
  })
})
