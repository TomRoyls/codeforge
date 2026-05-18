import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  compareWithBaseline,
  loadBaseline,
  saveBaseline,
} from '../../src/core/baseline.js'
import type { BaselineViolation } from '../../src/core/baseline.js'

import type { RuleViolation } from '../../src/ast/visitor.js'

// ─── Helpers ───

const TEMP_DIR = join(tmpdir(), `baseline-test-${Date.now()}`)

function makeViolation(overrides: Partial<RuleViolation>): RuleViolation {
  return {
    filePath: 'test.ts',
    message: 'Test violation',
    range: { end: { column: 10, line: 5 }, start: { column: 0, line: 5 } },
    ruleId: 'test-rule',
    severity: 'error',
    ...overrides,
  }
}

function makeBaselineViolation(overrides: Partial<BaselineViolation>): BaselineViolation {
  return {
    filePath: 'test.ts',
    message: 'Baseline violation',
    range: { end: { column: 10, line: 5 }, start: { column: 0, line: 5 } },
    ruleId: 'test-rule',
    severity: 'error',
    ...overrides,
  }
}

// ─── compareWithBaseline ───

describe('compareWithBaseline', () => {
  it('returns empty regressions and improvements for identical sets', () => {
    const violations = [makeViolation({ ruleId: 'r1', filePath: 'a.ts' })]
    const baseline = [makeBaselineViolation({ ruleId: 'r1', filePath: 'a.ts' })]
    const result = compareWithBaseline(violations, baseline)
    expect(result.regressions).toEqual([])
    expect(result.improvements).toEqual([])
    expect(result.unchanged).toBe(1)
  })

  it('detects new violations as regressions', () => {
    const current = [
      makeViolation({ ruleId: 'r1', filePath: 'a.ts' }),
      makeViolation({ ruleId: 'r2', filePath: 'b.ts', range: { end: { column: 5, line: 10 }, start: { column: 0, line: 10 } } }),
    ]
    const baseline = [makeBaselineViolation({ ruleId: 'r1', filePath: 'a.ts' })]
    const result = compareWithBaseline(current, baseline)
    expect(result.regressions.length).toBe(1)
    expect(result.regressions[0].ruleId).toBe('r2')
    expect(result.unchanged).toBe(1)
  })

  it('detects fixed violations as improvements', () => {
    const current = [makeViolation({ ruleId: 'r1', filePath: 'a.ts' })]
    const baseline = [
      makeBaselineViolation({ ruleId: 'r1', filePath: 'a.ts' }),
      makeBaselineViolation({ ruleId: 'r2', filePath: 'b.ts', range: { end: { column: 5, line: 10 }, start: { column: 0, line: 10 } } }),
    ]
    const result = compareWithBaseline(current, baseline)
    expect(result.improvements.length).toBe(1)
    expect(result.improvements[0].ruleId).toBe('r2')
  })

  it('handles empty current violations', () => {
    const baseline = [makeBaselineViolation({ ruleId: 'r1' })]
    const result = compareWithBaseline([], baseline)
    expect(result.regressions).toEqual([])
    expect(result.improvements.length).toBe(1)
    expect(result.unchanged).toBe(0)
  })

  it('handles empty baseline', () => {
    const current = [makeViolation({ ruleId: 'r1' })]
    const result = compareWithBaseline(current, [])
    expect(result.regressions.length).toBe(1)
    expect(result.improvements).toEqual([])
    expect(result.unchanged).toBe(0)
  })

  it('handles both empty', () => {
    const result = compareWithBaseline([], [])
    expect(result.regressions).toEqual([])
    expect(result.improvements).toEqual([])
    expect(result.unchanged).toBe(0)
  })

  it('uses ruleId:filePath:line as key', () => {
    const current = [makeViolation({ ruleId: 'r1', filePath: 'a.ts', range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } } })]
    const baseline = [makeBaselineViolation({ ruleId: 'r1', filePath: 'a.ts', range: { end: { column: 5, line: 2 }, start: { column: 0, line: 2 } } })]
    const result = compareWithBaseline(current, baseline)
    expect(result.regressions.length).toBe(1)
    expect(result.improvements.length).toBe(1)
  })

  it('same rule same file different line = different violation', () => {
    const current = [makeViolation({ ruleId: 'r1', filePath: 'a.ts', range: { end: { column: 5, line: 10 }, start: { column: 0, line: 10 } } })]
    const baseline = [makeBaselineViolation({ ruleId: 'r1', filePath: 'a.ts', range: { end: { column: 5, line: 20 }, start: { column: 0, line: 20 } } })]
    const result = compareWithBaseline(current, baseline)
    expect(result.regressions.length).toBe(1)
    expect(result.improvements.length).toBe(1)
  })

  it('computes unchanged correctly with mixed changes', () => {
    const current = [
      makeViolation({ ruleId: 'r1', filePath: 'a.ts' }),
      makeViolation({ ruleId: 'r3', filePath: 'c.ts', range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } } }),
    ]
    const baseline = [
      makeBaselineViolation({ ruleId: 'r1', filePath: 'a.ts' }),
      makeBaselineViolation({ ruleId: 'r2', filePath: 'b.ts', range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } } }),
    ]
    const result = compareWithBaseline(current, baseline)
    expect(result.unchanged).toBe(1)
    expect(result.regressions.length).toBe(1)
    expect(result.improvements.length).toBe(1)
  })
})

// ─── saveBaseline / loadBaseline ───

describe('saveBaseline and loadBaseline', () => {
  beforeEach(() => {
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('saves and loads baseline round-trip', async () => {
    const violations = [
      makeViolation({ ruleId: 'r1', severity: 'error' }),
      makeViolation({ ruleId: 'r2', severity: 'warning', filePath: 'other.ts' }),
    ]
    const path = join(TEMP_DIR, 'baseline.json')
    await saveBaseline(violations, path)
    const loaded = await loadBaseline(path)
    expect(loaded).not.toBeNull()
    expect(loaded!.violations.length).toBe(2)
    expect(loaded!.summary.total).toBe(2)
    expect(loaded!.summary.errors).toBe(1)
    expect(loaded!.summary.warnings).toBe(1)
  })

  it('returns null when loading non-existent baseline', async () => {
    const loaded = await loadBaseline(join(TEMP_DIR, 'nope.json'))
    expect(loaded).toBeNull()
  })

  it('computes correct severity counts', async () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]
    const path = join(TEMP_DIR, 'sev.json')
    await saveBaseline(violations, path)
    const loaded = await loadBaseline(path)
    expect(loaded!.summary.errors).toBe(2)
    expect(loaded!.summary.warnings).toBe(1)
    expect(loaded!.summary.info).toBe(1)
    expect(loaded!.summary.total).toBe(4)
  })

  it('saves timestamp', async () => {
    const path = join(TEMP_DIR, 'ts.json')
    await saveBaseline([makeViolation({})], path)
    const loaded = await loadBaseline(path)
    expect(loaded!.timestamp).toBeTruthy()
    expect(new Date(loaded!.timestamp).getTime()).not.toBeNaN()
  })

  it('handles empty violations', async () => {
    const path = join(TEMP_DIR, 'empty.json')
    await saveBaseline([], path)
    const loaded = await loadBaseline(path)
    expect(loaded!.violations).toEqual([])
    expect(loaded!.summary.total).toBe(0)
  })
})
