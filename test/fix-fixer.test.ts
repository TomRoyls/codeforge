import { Project } from 'ts-morph'

import type { RuleWithFix } from '../src/fix/fixer.js'
import type { RuleViolation } from '../src/ast/visitor.js'
import type { FixResult } from '../src/fix/types.js'

import { applyFixesToFile, applyFixesToFiles } from '../src/fix/fixer.js'

// ─── Helpers ──────────────────────────────────────────────

function makeProject(): Project {
  return new Project({ useInMemoryFileSystem: true })
}

function makeViolation(ruleId: string, startLine: number, startCol: number, endLine: number, endCol: number): RuleViolation {
  return {
    filePath: '/test.ts',
    message: `${ruleId} violation`,
    range: {
      start: { line: startLine, column: startCol },
      end: { line: endLine, column: endCol },
    },
    ruleId,
    severity: 'warning',
  }
}

function makeRule(id: string, fixFn: (ctx: Parameters<RuleWithFix['fix']>[0]) => FixResult | null, priority = 1): RuleWithFix {
  return { fix: fixFn, id, priority }
}

function makeRulesMap(rules: RuleWithFix[]): Map<string, RuleWithFix> {
  const map = new Map<string, RuleWithFix>()
  for (const rule of rules) {
    map.set(rule.id, rule)
  }
  return map
}

// ─── applyFixesToFile — no violations ─────────────────────

describe('applyFixesToFile', () => {
  // ─── No violations ───────────────────────────────────

  describe('no violations', () => {
    it('returns empty report with 0 fixes when violations array is empty', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'const x = 1')
      const rules = makeRulesMap([])

      const report = applyFixesToFile(sourceFile, [], rules, false)

      expect(report.fixesApplied).toBe(0)
      expect(report.fixesSkipped).toBe(0)
      expect(report.changes).toEqual([])
      expect(report.conflicts).toEqual([])
      expect(report.filePath).toBe('/test.ts')
    })
  })

  // ─── Single fixable violation ────────────────────────

  describe('single fixable violation', () => {
    it('applies a single fix and populates changes (dry run)', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1')

      const violation = makeViolation('prefer-const', 1, 1, 1, 4)
      const rules = makeRulesMap([
        makeRule('prefer-const', () => ({
          applied: true,
          changes: [{
            newText: 'const',
            oldText: 'let',
            start: 0,
            end: 3,
          }],
        })),
      ])

      const report = applyFixesToFile(sourceFile, [violation], rules, true)

      expect(report.fixesApplied).toBe(1)
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]!.newText).toBe('const')
      expect(report.changes[0]!.oldText).toBe('let')
    })

    it('modifies the source file when not in dry-run mode', () => {
      const project = makeProject()
      // Use a full-line replacement that aligns with the VariableStatement node
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1;')

      // Range covers the full variable statement (line 1, col 1 to end)
      const violation = makeViolation('prefer-const', 1, 1, 1, 11)
      const rules = makeRulesMap([
        makeRule('prefer-const', () => ({
          applied: true,
          changes: [{
            newText: 'const x = 1;',
            oldText: 'let x = 1;',
            // "let x = 1;" is 11 chars, positions 0..10
            start: 0,
            end: 10,
          }],
        })),
      ])

      applyFixesToFile(sourceFile, [violation], rules, false)

      expect(sourceFile.getFullText()).toBe('const x = 1;')
    })
  })

  // ─── Multiple non-overlapping fixes ──────────────────

  describe('multiple non-overlapping fixes', () => {
    it('applies all fixes when ranges do not overlap', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1\nlet y = 2')

      const violationX = makeViolation('prefer-const', 1, 1, 1, 4)
      const violationY = makeViolation('prefer-const', 2, 1, 2, 4)

      const rules = makeRulesMap([
        makeRule('prefer-const', (ctx) => {
          const v = ctx.violation
          const startOffset = v.range.start.line === 1 ? 0 : 11
          return {
            applied: true,
            changes: [{
              newText: 'const',
              oldText: 'let',
              start: startOffset,
              end: startOffset + 3,
            }],
          }
        }),
      ])

      const report = applyFixesToFile(sourceFile, [violationX, violationY], rules, true)

      expect(report.fixesApplied).toBe(2)
      expect(report.changes).toHaveLength(2)
      expect(report.conflicts).toHaveLength(0)
    })
  })

  // ─── Overlapping/conflicting fixes ───────────────────

  describe('overlapping/conflicting fixes', () => {
    it('skips the second fix when ranges overlap', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1')

      const violation1 = makeViolation('rule-a', 1, 1, 1, 6)
      const violation2 = makeViolation('rule-b', 1, 1, 1, 4)

      const rules = makeRulesMap([
        makeRule('rule-a', () => ({
          applied: true,
          changes: [{
            newText: 'CONST',
            oldText: 'let x',
            start: 0,
            end: 5,
          }],
        }), 1),
        makeRule('rule-b', () => ({
          applied: true,
          changes: [{
            newText: 'const',
            oldText: 'let',
            start: 0,
            end: 3,
          }],
        }), 2),
      ])

      const report = applyFixesToFile(sourceFile, [violation1, violation2], rules, true)

      expect(report.fixesApplied).toBe(1)
      expect(report.fixesSkipped).toBe(1)
      expect(report.conflicts).toHaveLength(1)
      expect(report.conflicts[0]!.reason).toBe('Overlapping fix range')
    })

    it('records the conflicting rule ID in the conflict entry', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1')

      const violation1 = makeViolation('rule-a', 1, 1, 1, 6)
      const violation2 = makeViolation('rule-b', 1, 1, 1, 4)

      const rules = makeRulesMap([
        makeRule('rule-a', () => ({
          applied: true,
          changes: [{
            newText: 'CONST',
            oldText: 'let x',
            start: 0,
            end: 5,
          }],
        }), 1),
        makeRule('rule-b', () => ({
          applied: true,
          changes: [{
            newText: 'const',
            oldText: 'let',
            start: 0,
            end: 3,
          }],
        }), 2),
      ])

      const report = applyFixesToFile(sourceFile, [violation1, violation2], rules, true)

      expect(report.conflicts[0]!.ruleId).toBe('rule-b')
      expect(report.conflicts[0]!.conflictingRule).toBe('rule-a')
    })
  })

  // ─── Dry run mode ────────────────────────────────────

  describe('dry run mode', () => {
    it('computes changes but does not modify the source file', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1')
      const originalText = sourceFile.getFullText()

      const violation = makeViolation('prefer-const', 1, 1, 1, 4)
      const rules = makeRulesMap([
        makeRule('prefer-const', () => ({
          applied: true,
          changes: [{
            newText: 'const',
            oldText: 'let',
            start: 0,
            end: 3,
          }],
        })),
      ])

      const report = applyFixesToFile(sourceFile, [violation], rules, true)

      expect(report.fixesApplied).toBe(1)
      expect(report.changes).toHaveLength(1)
      expect(sourceFile.getFullText()).toBe(originalText)
    })
  })

  // ─── Violations with no matching rule ────────────────

  describe('violations with no matching rule', () => {
    it('ignores violations that have no matching rule in the map', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1')

      const violation = makeViolation('no-such-rule', 1, 1, 1, 4)
      const rules = makeRulesMap([])

      const report = applyFixesToFile(sourceFile, [violation], rules, false)

      expect(report.fixesApplied).toBe(0)
      expect(report.fixesSkipped).toBe(0)
      expect(report.conflicts).toHaveLength(0)
    })
  })

  // ─── Fix function returning null ─────────────────────

  describe('fix function returning null', () => {
    it('does not apply a fix when the fix function returns null', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1')

      const violation = makeViolation('prefer-const', 1, 1, 1, 4)
      const rules = makeRulesMap([
        makeRule('prefer-const', () => null),
      ])

      const report = applyFixesToFile(sourceFile, [violation], rules, false)

      expect(report.fixesApplied).toBe(0)
      expect(report.fixesSkipped).toBe(0)
      expect(report.changes).toHaveLength(0)
    })

    it('does not modify source file when fix returns null', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1')

      const violation = makeViolation('prefer-const', 1, 1, 1, 4)
      const rules = makeRulesMap([
        makeRule('prefer-const', () => null),
      ])

      applyFixesToFile(sourceFile, [violation], rules, false)

      expect(sourceFile.getFullText()).toBe('let x = 1')
    })
  })

  // ─── Fix function returning applied: false ───────────

  describe('fix function returning applied: false', () => {
    it('does not apply a fix when result has applied: false', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1')

      const violation = makeViolation('prefer-const', 1, 1, 1, 4)
      const rules = makeRulesMap([
        makeRule('prefer-const', () => ({
          applied: false,
          changes: [],
        })),
      ])

      const report = applyFixesToFile(sourceFile, [violation], rules, false)

      expect(report.fixesApplied).toBe(0)
      expect(report.fixesSkipped).toBe(0)
      expect(report.changes).toHaveLength(0)
    })
  })

  // ─── Fix function returning conflict ─────────────────

  describe('fix function returning conflict', () => {
    it('records conflict and skips fix when result has conflict field', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1')

      const violation = makeViolation('rule-a', 1, 1, 1, 4)
      const rules = makeRulesMap([
        makeRule('rule-a', () => ({
          applied: false,
          changes: [],
          conflict: {
            conflictingRule: 'other-rule',
            reason: 'Cannot fix due to dependency',
          },
        })),
      ])

      const report = applyFixesToFile(sourceFile, [violation], rules, false)

      expect(report.fixesApplied).toBe(0)
      expect(report.fixesSkipped).toBe(1)
      expect(report.conflicts).toHaveLength(1)
      expect(report.conflicts[0]!.ruleId).toBe('rule-a')
      expect(report.conflicts[0]!.conflictingRule).toBe('other-rule')
      expect(report.conflicts[0]!.reason).toBe('Cannot fix due to dependency')
    })
  })

  // ─── Priority ordering ───────────────────────────────

  describe('priority ordering', () => {
    it('processes lower priority numbers first', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1\nlet y = 2')

      const violationX = makeViolation('low-priority', 1, 1, 1, 4)
      const violationY = makeViolation('high-priority', 2, 1, 2, 4)

      const callOrder: string[] = []

      const rules = makeRulesMap([
        makeRule('high-priority', () => {
          callOrder.push('high')
          return {
            applied: true,
            changes: [{
              newText: 'const',
              oldText: 'let',
              start: 11,
              end: 14,
            }],
          }
        }, 1),
        makeRule('low-priority', () => {
          callOrder.push('low')
          return {
            applied: true,
            changes: [{
              newText: 'const',
              oldText: 'let',
              start: 0,
              end: 3,
            }],
          }
        }, 5),
      ])

      // Pass violations in reverse order — should still process high-priority first
      applyFixesToFile(sourceFile, [violationX, violationY], rules, true)

      expect(callOrder).toEqual(['high', 'low'])
    })
  })

  // ─── filePath in report ──────────────────────────────

  describe('filePath in report', () => {
    it('returns the correct filePath from the source file', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('my-module.ts', 'const a = 1')

      const report = applyFixesToFile(sourceFile, [], makeRulesMap([]), false)

      expect(report.filePath).toBe('/my-module.ts')
    })
  })

  // ─── Multiple changes from single fix ────────────────

  describe('multiple changes from single fix', () => {
    it('accumulates all changes from a fix that returns multiple TextChanges', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1')

      const violation = makeViolation('multi-fix', 1, 1, 1, 10)
      const rules = makeRulesMap([
        makeRule('multi-fix', () => ({
          applied: true,
          changes: [
            { newText: 'const', oldText: 'let', start: 0, end: 3 },
            { newText: '2', oldText: '1', start: 8, end: 9 },
          ],
        })),
      ])

      const report = applyFixesToFile(sourceFile, [violation], rules, true)

      expect(report.fixesApplied).toBe(1)
      expect(report.changes).toHaveLength(2)
      expect(report.changes[0]!.newText).toBe('const')
      expect(report.changes[1]!.newText).toBe('2')
    })
  })

  // ─── Enclosing range conflict detection ──────────────

  describe('enclosing range conflict detection', () => {
    it('detects conflict when a new fix is fully enclosed by an applied fix', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let foo = bar')

      // First fix covers range "let foo = bar" (positions 0-12)
      const violationOuter = makeViolation('rule-outer', 1, 1, 1, 14)
      // Second fix covers "foo" (positions 4-7) — inside the first
      const violationInner = makeViolation('rule-inner', 1, 5, 1, 8)

      const rules = makeRulesMap([
        makeRule('rule-outer', () => ({
          applied: true,
          changes: [{ newText: 'baz', oldText: 'let foo = bar', start: 0, end: 13 }],
        }), 1),
        makeRule('rule-inner', () => ({
          applied: true,
          changes: [{ newText: 'qux', oldText: 'foo', start: 4, end: 7 }],
        }), 2),
      ])

      const report = applyFixesToFile(sourceFile, [violationOuter, violationInner], rules, true)

      expect(report.fixesApplied).toBe(1)
      expect(report.fixesSkipped).toBe(1)
      expect(report.conflicts).toHaveLength(1)
    })
  })
})

// ─── applyFixesToFiles ────────────────────────────────────

describe('applyFixesToFiles', () => {
  // ─── Empty array ─────────────────────────────────────

  describe('empty array', () => {
    it('returns report with 0 files processed', () => {
      const rules = makeRulesMap([])
      const report = applyFixesToFiles([], rules, false)

      expect(report.filesProcessed).toBe(0)
      expect(report.totalFixesApplied).toBe(0)
      expect(report.totalFixesSkipped).toBe(0)
      expect(report.fileReports).toEqual([])
    })
  })

  // ─── Multiple files ──────────────────────────────────

  describe('multiple files', () => {
    it('returns aggregated report with correct totals', () => {
      const project = makeProject()
      const sourceFile1 = project.createSourceFile('a.ts', 'let x = 1')
      const sourceFile2 = project.createSourceFile('b.ts', 'let y = 2\nlet z = 3')

      const violation1 = makeViolation('prefer-const', 1, 1, 1, 4)
      const violation2 = makeViolation('prefer-const', 1, 1, 1, 4)
      const violation3 = makeViolation('prefer-const', 2, 1, 2, 4)

      const rules = makeRulesMap([
        makeRule('prefer-const', (ctx) => {
          const line = ctx.violation.range.start.line
          // Line 1 offset = 0, line 2 offset depends on first line length
          const firstLineLen = ctx.sourceFile.getFullText().split('\n')[0]!.length
          const startOffset = line === 1 ? 0 : firstLineLen + 1
          return {
            applied: true,
            changes: [{
              newText: 'const',
              oldText: 'let',
              start: startOffset,
              end: startOffset + 3,
            }],
          }
        }),
      ])

      const report = applyFixesToFiles(
        [
          { sourceFile: sourceFile1, violations: [violation1] },
          { sourceFile: sourceFile2, violations: [violation2, violation3] },
        ],
        rules,
        true,
      )

      expect(report.filesProcessed).toBe(2)
      expect(report.totalFixesApplied).toBe(3)
      expect(report.totalFixesSkipped).toBe(0)
      expect(report.fileReports).toHaveLength(2)
    })

    it('includes correct filePath in each file report', () => {
      const project = makeProject()
      const sourceFile1 = project.createSourceFile('alpha.ts', 'const a = 1')
      const sourceFile2 = project.createSourceFile('beta.ts', 'const b = 2')

      const report = applyFixesToFiles(
        [
          { sourceFile: sourceFile1, violations: [] },
          { sourceFile: sourceFile2, violations: [] },
        ],
        makeRulesMap([]),
        false,
      )

      expect(report.fileReports[0]!.filePath).toBe('/alpha.ts')
      expect(report.fileReports[1]!.filePath).toBe('/beta.ts')
    })
  })

  // ─── Single file delegation ──────────────────────────

  describe('single file delegation', () => {
    it('delegates to applyFixesToFile and returns correct results (dry run)', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('single.ts', 'let x = 1')

      const violation = makeViolation('prefer-const', 1, 1, 1, 4)
      const rules = makeRulesMap([
        makeRule('prefer-const', () => ({
          applied: true,
          changes: [{
            newText: 'const',
            oldText: 'let',
            start: 0,
            end: 3,
          }],
        })),
      ])

      const report = applyFixesToFiles(
        [{ sourceFile, violations: [violation] }],
        rules,
        true,
      )

      expect(report.filesProcessed).toBe(1)
      expect(report.totalFixesApplied).toBe(1)
      expect(report.fileReports).toHaveLength(1)
      expect(report.fileReports[0]!.fixesApplied).toBe(1)
    })
  })

  // ─── Aggregated skipped fixes ────────────────────────

  describe('aggregated skipped fixes', () => {
    it('sums skipped fixes across files', () => {
      const project = makeProject()
      const sourceFile1 = project.createSourceFile('a.ts', 'let x = 1')
      const sourceFile2 = project.createSourceFile('b.ts', 'let y = 2')

      const rules = makeRulesMap([
        makeRule('prefer-const', () => null),
      ])

      const report = applyFixesToFiles(
        [
          { sourceFile: sourceFile1, violations: [makeViolation('prefer-const', 1, 1, 1, 4)] },
          { sourceFile: sourceFile2, violations: [makeViolation('prefer-const', 1, 1, 1, 4)] },
        ],
        rules,
        false,
      )

      // Fix returns null → not applied, not skipped (no conflict either)
      expect(report.totalFixesApplied).toBe(0)
      expect(report.totalFixesSkipped).toBe(0)
    })

    it('sums conflicts across files into totalFixesSkipped', () => {
      const project = makeProject()
      const sourceFile1 = project.createSourceFile('a.ts', 'let x = 1')
      const sourceFile2 = project.createSourceFile('b.ts', 'let y = 2')

      const ruleAConflict = makeRule('rule-a', () => ({
        applied: false,
        changes: [],
        conflict: { conflictingRule: 'rule-b', reason: 'Test conflict' },
      }))

      const rules = makeRulesMap([ruleAConflict])

      const report = applyFixesToFiles(
        [
          { sourceFile: sourceFile1, violations: [makeViolation('rule-a', 1, 1, 1, 4)] },
          { sourceFile: sourceFile2, violations: [makeViolation('rule-a', 1, 1, 1, 4)] },
        ],
        rules,
        false,
      )

      expect(report.totalFixesApplied).toBe(0)
      expect(report.totalFixesSkipped).toBe(2)
      expect(report.fileReports[0]!.conflicts).toHaveLength(1)
      expect(report.fileReports[1]!.conflicts).toHaveLength(1)
    })
  })

  // ─── Dry run mode propagation ────────────────────────

  describe('dry run mode propagation', () => {
    it('does not modify any file when dryRun is true', () => {
      const project = makeProject()
      const sourceFile = project.createSourceFile('test.ts', 'let x = 1')
      const originalText = sourceFile.getFullText()

      const violation = makeViolation('prefer-const', 1, 1, 1, 4)
      const rules = makeRulesMap([
        makeRule('prefer-const', () => ({
          applied: true,
          changes: [{ newText: 'const', oldText: 'let', start: 0, end: 3 }],
        })),
      ])

      applyFixesToFiles(
        [{ sourceFile, violations: [violation] }],
        rules,
        true,
      )

      expect(sourceFile.getFullText()).toBe(originalText)
    })
  })
})
