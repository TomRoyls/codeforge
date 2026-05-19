import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { tmpdir } from 'node:os'

import {
  scoreToGrade,
  assessComplexity,
  assessTesting,
  assessDocumentation,
  assessTodos,
  assessCoupling,
  assessStaleCode,
  assessDependencies,
  computeDebtScore,
  generateRepaymentPlan,
  buildDebtScore,
  type DebtCategory,
  type DebtItem,
  type DebtScore,
  type FileContent,
} from '../src/commands/techdebt-helpers.js'

import {
  formatDebtMeter,
  formatGrade,
  formatCategoryScore,
  formatDebtTable,
  formatDebtJson,
} from '../src/commands/techdebt-format-helpers.js'

import TechDebt from '../src/commands/techdebt.js'

// ─── Test helpers ─────────────────────────────────────────

function makeFile(filePath: string, content: string): FileContent {
  return { content, filePath, lines: content.split('\n').length }
}

function makeCategory(
  name: string,
  score: number,
  weight: number,
  items: DebtItem[] = [],
): DebtCategory {
  return {
    description: `${name} category`,
    items,
    name,
    score,
    weight,
  }
}

function makeDebtItem(overrides: Partial<DebtItem> = {}): DebtItem {
  return {
    description: 'test item',
    effort: 1,
    file: 'test.ts',
    line: 1,
    priority: 'medium',
    type: 'test-type',
    ...overrides,
  }
}

const CODE_WITH_TODOS = `
// TODO: fix this later
function foo() {
  // FIXME: broken logic
  return 1
}
// HACK: temporary workaround
// XXX: known issue
`

const CLEAN_CODE = `/**
 * A well-documented function.
 */
export function cleanFunction(): number {
  return 42
}
`

const COMPLEX_CODE = `
function deepNesting() {
  if (true) {
    if (true) {
      if (true) {
        if (true) {
          if (true) {
            console.log('too deep')
          }
        }
      }
    }
  }
}
`

const CODE_WITH_MANY_IMPORTS = `
import { a } from 'mod1'
import { b } from 'mod2'
import { c } from 'mod3'
import { d } from 'mod4'
import { e } from 'mod5'
import { f } from 'mod6'
import { g } from 'mod7'
import { h } from 'mod8'
import { i } from 'mod9'
import { j } from 'mod10'
import { k } from 'mod11'
`

const COMMENTED_OUT_CODE = `
// const old = true
// function legacy() {
//   return old
// }
`

// ─── scoreToGrade ─────────────────────────────────────────

describe('scoreToGrade', () => {
  it('should return A for score 0', () => {
    expect(scoreToGrade(0)).toBe('A')
  })

  it('should return A for score 20', () => {
    expect(scoreToGrade(20)).toBe('A')
  })

  it('should return B for score 21', () => {
    expect(scoreToGrade(21)).toBe('B')
  })

  it('should return B for score 35', () => {
    expect(scoreToGrade(35)).toBe('B')
  })

  it('should return C for score 36', () => {
    expect(scoreToGrade(36)).toBe('C')
  })

  it('should return C for score 55', () => {
    expect(scoreToGrade(55)).toBe('C')
  })

  it('should return D for score 56', () => {
    expect(scoreToGrade(56)).toBe('D')
  })

  it('should return D for score 75', () => {
    expect(scoreToGrade(75)).toBe('D')
  })

  it('should return F for score 76', () => {
    expect(scoreToGrade(76)).toBe('F')
  })

  it('should return F for score 100', () => {
    expect(scoreToGrade(100)).toBe('F')
  })

  it('should handle mid-range values', () => {
    expect(scoreToGrade(10)).toBe('A')
    expect(scoreToGrade(28)).toBe('B')
    expect(scoreToGrade(45)).toBe('C')
    expect(scoreToGrade(65)).toBe('D')
    expect(scoreToGrade(90)).toBe('F')
  })
})

// ─── assessComplexity ─────────────────────────────────────

describe('assessComplexity', () => {
  it('should return score 0 for clean code', () => {
    const cat = assessComplexity([makeFile('clean.ts', CLEAN_CODE)])
    expect(cat.name).toBe('complexity')
    expect(cat.weight).toBe(0.20)
  })

  it('should detect deep nesting', () => {
    const cat = assessComplexity([makeFile('complex.ts', COMPLEX_CODE)])
    const nestingItems = cat.items.filter((i) => i.type === 'deep-nesting')
    expect(nestingItems.length).toBeGreaterThan(0)
  })

  it('should score 0 for empty file list', () => {
    const cat = assessComplexity([])
    expect(cat.score).toBe(0)
    expect(cat.items).toHaveLength(0)
  })

  it('should have correct weight', () => {
    const cat = assessComplexity([])
    expect(cat.weight).toBe(0.20)
  })

  it('should detect high cyclomatic complexity', () => {
    const complexFile = `
if (a) {}
else if (b) {}
else if (c) {}
else if (d) {}
else if (e) {}
else if (f) {}
else if (g) {}
else if (h) {}
else if (i) {}
else if (j) {}
else if (k) {}
`
    const cat = assessComplexity([makeFile('branched.ts', complexFile)])
    const complexityItems = cat.items.filter((i) => i.type === 'complexity')
    expect(complexityItems.length).toBeGreaterThan(0)
  })
})

// ─── assessTesting ────────────────────────────────────────

describe('assessTesting', () => {
  it('should return score 0 for empty file list', () => {
    const cat = assessTesting([])
    expect(cat.score).toBe(0)
    expect(cat.items).toHaveLength(0)
  })

  it('should return weight 0.20', () => {
    const cat = assessTesting([])
    expect(cat.weight).toBe(0.20)
  })

  it('should flag missing test files for source files', () => {
    const cat = assessTesting([makeFile('src/utils.ts', 'export const x = 1')])
    expect(cat.items.length).toBeGreaterThan(0)
    expect(cat.items[0].type).toBe('missing-test')
  })

  it('should reduce score when test files exist', () => {
    const onlyTests = assessTesting([makeFile('a.test.ts', 'test')])
    const noTests = assessTesting([makeFile('a.ts', 'code')])
    expect(onlyTests.score).toBeLessThan(noTests.score)
  })

  it('should recognize spec files as tests', () => {
    const cat = assessTesting([
      makeFile('a.ts', 'code'),
      makeFile('a.spec.ts', 'test'),
    ])
    expect(cat.items).toHaveLength(0)
  })

  it('should recognize files in __tests__ as tests', () => {
    const cat = assessTesting([makeFile('__tests__/unit.ts', 'test')])
    const sourceOnly = assessTesting([makeFile('src/a.ts', 'code')])
    expect(cat.score).toBeLessThan(sourceOnly.score)
  })
})

// ─── assessDocumentation ──────────────────────────────────

describe('assessDocumentation', () => {
  it('should return weight 0.15', () => {
    const cat = assessDocumentation([])
    expect(cat.weight).toBe(0.15)
  })

  it('should detect missing JSDoc on exports', () => {
    const code = 'export function foo() { return 1 }\n'
    const cat = assessDocumentation([makeFile('a.ts', code)])
    const jsdocItems = cat.items.filter((i) => i.type === 'missing-jsdoc')
    expect(jsdocItems.length).toBeGreaterThan(0)
  })

  it('should not flag documented exports', () => {
    const cat = assessDocumentation([makeFile('a.ts', CLEAN_CODE)])
    const jsdocItems = cat.items.filter((i) => i.type === 'missing-jsdoc')
    expect(jsdocItems).toHaveLength(0)
  })

  it('should detect missing module-level comment', () => {
    const code = 'const x = 1\n'
    const cat = assessDocumentation([makeFile('a.ts', code)])
    const moduleItems = cat.items.filter((i) => i.type === 'missing-module-doc')
    expect(moduleItems.length).toBeGreaterThan(0)
  })

  it('should skip JSON and MD files', () => {
    const cat = assessDocumentation([
      makeFile('a.json', '{}'),
      makeFile('a.md', '# hello'),
    ])
    expect(cat.items).toHaveLength(0)
  })

  it('should have score 0 for empty input', () => {
    const cat = assessDocumentation([])
    expect(cat.score).toBe(0)
  })
})

// ─── assessTodos ──────────────────────────────────────────

describe('assessTodos', () => {
  it('should detect TODO comments', () => {
    const cat = assessTodos([makeFile('a.ts', CODE_WITH_TODOS)])
    const todos = cat.items.filter((i) => i.type === 'todo')
    expect(todos.length).toBeGreaterThan(0)
  })

  it('should detect FIXME comments with high priority', () => {
    const cat = assessTodos([makeFile('a.ts', CODE_WITH_TODOS)])
    const fixmes = cat.items.filter((i) => i.type === 'fixme')
    expect(fixmes.length).toBeGreaterThan(0)
    expect(fixmes[0].priority).toBe('high')
  })

  it('should detect HACK comments with high priority', () => {
    const cat = assessTodos([makeFile('a.ts', CODE_WITH_TODOS)])
    const hacks = cat.items.filter((i) => i.type === 'hack')
    expect(hacks.length).toBeGreaterThan(0)
    expect(hacks[0].priority).toBe('high')
  })

  it('should detect XXX comments with high priority', () => {
    const cat = assessTodos([makeFile('a.ts', CODE_WITH_TODOS)])
    const xxxs = cat.items.filter((i) => i.type === 'xxx')
    expect(xxxs.length).toBeGreaterThan(0)
    expect(xxxs[0].priority).toBe('high')
  })

  it('should return score 0 for clean code', () => {
    const cat = assessTodos([makeFile('a.ts', CLEAN_CODE)])
    expect(cat.score).toBe(0)
    expect(cat.items).toHaveLength(0)
  })

  it('should have weight 0.15', () => {
    const cat = assessTodos([])
    expect(cat.weight).toBe(0.15)
  })

  it('should report correct line numbers', () => {
    const cat = assessTodos([makeFile('a.ts', '// TODO: line 1\n\n// FIXME: line 3\n')])
    expect(cat.items[0].line).toBe(1)
    expect(cat.items[1].line).toBe(3)
  })
})

// ─── assessCoupling ───────────────────────────────────────

describe('assessCoupling', () => {
  it('should flag files with >10 imports', () => {
    const cat = assessCoupling([makeFile('coupled.ts', CODE_WITH_MANY_IMPORTS)])
    expect(cat.items.length).toBeGreaterThan(0)
    expect(cat.items[0].type).toBe('high-imports')
  })

  it('should not flag files with few imports', () => {
    const code = "import { a } from 'mod1'\nconst x = 1\n"
    const cat = assessCoupling([makeFile('a.ts', code)])
    expect(cat.items).toHaveLength(0)
  })

  it('should have weight 0.10', () => {
    const cat = assessCoupling([])
    expect(cat.weight).toBe(0.10)
  })

  it('should skip JSON and MD files', () => {
    const cat = assessCoupling([
      makeFile('a.json', '{}'),
      makeFile('a.md', '# hello'),
    ])
    expect(cat.items).toHaveLength(0)
  })

  it('should return score 0 for empty input', () => {
    const cat = assessCoupling([])
    expect(cat.score).toBe(0)
  })
})

// ─── assessStaleCode ──────────────────────────────────────

describe('assessStaleCode', () => {
  it('should detect commented-out code blocks', () => {
    const cat = assessStaleCode([makeFile('a.ts', COMMENTED_OUT_CODE)])
    const commentedItems = cat.items.filter((i) => i.type === 'commented-code')
    expect(commentedItems.length).toBeGreaterThan(0)
  })

  it('should not flag clean code', () => {
    const cat = assessStaleCode([makeFile('a.ts', CLEAN_CODE)])
    const staleItems = cat.items.filter((i) => i.type === 'commented-code')
    expect(staleItems).toHaveLength(0)
  })

  it('should have weight 0.10', () => {
    const cat = assessStaleCode([])
    expect(cat.weight).toBe(0.10)
  })

  it('should detect files with many exports', () => {
    const manyExports = Array.from({ length: 16 }, (_, i) => `export const val${i} = ${i}`).join('\n')
    const cat = assessStaleCode([makeFile('a.ts', manyExports)])
    const exportItems = cat.items.filter((i) => i.type === 'unused-exports')
    expect(exportItems.length).toBeGreaterThan(0)
  })

  it('should skip JSON and MD files', () => {
    const cat = assessStaleCode([
      makeFile('a.json', '{}'),
      makeFile('a.md', '# hello'),
    ])
    expect(cat.items).toHaveLength(0)
  })
})

// ─── assessDependencies ───────────────────────────────────

describe('assessDependencies', () => {
  it('should return score 0 when no package.json', async () => {
    const cat = await assessDependencies('/nonexistent/path')
    expect(cat.score).toBe(0)
    expect(cat.items).toHaveLength(0)
  })

  it('should have weight 0.10', async () => {
    const cat = await assessDependencies('/nonexistent/path')
    expect(cat.weight).toBe(0.10)
  })

  it('should detect deprecated packages', async () => {
    const tmpDir = await fs.mkdtemp(path.join(tmpdir(), 'techdebt-test-'))
    try {
      await fs.writeFile(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({
          dependencies: { 'old-pkg': '1.0.0-deprecated' },
        }),
      )
      const cat = await assessDependencies(tmpDir)
      const deprecatedItems = cat.items.filter((i) => i.type === 'deprecated-dep')
      expect(deprecatedItems.length).toBeGreaterThan(0)
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true })
    }
  })

  it('should flag large dependency trees', async () => {
    const tmpDir = await fs.mkdtemp(path.join(tmpdir(), 'techdebt-test-'))
    try {
      const deps: Record<string, string> = {}
      for (let i = 0; i < 55; i++) {
        deps[`pkg${i}`] = `^${i}.0.0`
      }
      await fs.writeFile(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({ dependencies: deps }),
      )
      const cat = await assessDependencies(tmpDir)
      const manyDepsItems = cat.items.filter((i) => i.type === 'many-deps')
      expect(manyDepsItems.length).toBeGreaterThan(0)
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true })
    }
  })

  it('should return score 0 for healthy package.json', async () => {
    const tmpDir = await fs.mkdtemp(path.join(tmpdir(), 'techdebt-test-'))
    try {
      await fs.writeFile(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({ dependencies: { 'fresh-pkg': '^2.0.0' } }),
      )
      const cat = await assessDependencies(tmpDir)
      expect(cat.score).toBe(0)
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true })
    }
  })
})

// ─── computeDebtScore ─────────────────────────────────────

describe('computeDebtScore', () => {
  it('should return A grade for all-zero categories', () => {
    const categories = [
      makeCategory('complexity', 0, 0.20),
      makeCategory('testing', 0, 0.20),
      makeCategory('documentation', 0, 0.15),
      makeCategory('todos', 0, 0.15),
      makeCategory('coupling', 0, 0.10),
      makeCategory('stale-code', 0, 0.10),
      makeCategory('dependencies', 0, 0.10),
    ]
    const score = computeDebtScore(categories)
    expect(score.total).toBe(0)
    expect(score.grade).toBe('A')
  })

  it('should compute weighted total', () => {
    const categories = [
      makeCategory('complexity', 50, 0.20),
      makeCategory('testing', 50, 0.20),
      makeCategory('documentation', 50, 0.15),
      makeCategory('todos', 50, 0.15),
      makeCategory('coupling', 50, 0.10),
      makeCategory('stale-code', 50, 0.10),
      makeCategory('dependencies', 50, 0.10),
    ]
    const score = computeDebtScore(categories)
    expect(score.total).toBe(50)
  })

  it('should cap at 100', () => {
    const categories = [
      makeCategory('complexity', 100, 0.20),
      makeCategory('testing', 100, 0.20),
      makeCategory('documentation', 100, 0.15),
      makeCategory('todos', 100, 0.15),
      makeCategory('coupling', 100, 0.10),
      makeCategory('stale-code', 100, 0.10),
      makeCategory('dependencies', 100, 0.10),
    ]
    const score = computeDebtScore(categories)
    expect(score.total).toBe(100)
    expect(score.grade).toBe('F')
  })

  it('should count total items', () => {
    const categories = [
      makeCategory('a', 0, 0.5, [makeDebtItem(), makeDebtItem()]),
      makeCategory('b', 0, 0.5, [makeDebtItem()]),
    ]
    const score = computeDebtScore(categories)
    expect(score.totalItems).toBe(3)
  })

  it('should sum estimated effort', () => {
    const categories = [
      makeCategory('a', 0, 0.5, [makeDebtItem({ effort: 2.5 }), makeDebtItem({ effort: 1.5 })]),
    ]
    const score = computeDebtScore(categories)
    expect(score.estimatedEffort).toBe(4)
  })

  it('should include repayment plan', () => {
    const categories = [
      makeCategory('a', 10, 0.5, [makeDebtItem({ priority: 'high' })]),
    ]
    const score = computeDebtScore(categories)
    expect(score.repaymentPlan.length).toBeGreaterThan(0)
  })

  it('should produce grade D for moderate debt', () => {
    const categories = [
      makeCategory('complexity', 70, 0.20),
      makeCategory('testing', 60, 0.20),
      makeCategory('documentation', 50, 0.15),
      makeCategory('todos', 80, 0.15),
      makeCategory('coupling', 40, 0.10),
      makeCategory('stale-code', 60, 0.10),
      makeCategory('dependencies', 30, 0.10),
    ]
    const score = computeDebtScore(categories)
    expect(score.grade).toBe('D')
  })
})

// ─── generateRepaymentPlan ────────────────────────────────

describe('generateRepaymentPlan', () => {
  it('should return empty plan for no items', () => {
    const plan = generateRepaymentPlan([makeCategory('a', 0, 0.5)])
    expect(plan).toHaveLength(0)
  })

  it('should sort by priority (high first)', () => {
    const categories = [
      makeCategory('a', 10, 0.5, [
        makeDebtItem({ priority: 'low' }),
        makeDebtItem({ priority: 'high' }),
        makeDebtItem({ priority: 'medium' }),
      ]),
    ]
    const plan = generateRepaymentPlan(categories)
    expect(plan[0].priority).toBe('high')
  })

  it('should limit to 10 actions', () => {
    const categories = Array.from({ length: 15 }, (_, i) =>
      makeCategory(`cat${i}`, 10, 0.01, [makeDebtItem({ priority: 'high' })]),
    )
    const plan = generateRepaymentPlan(categories)
    expect(plan.length).toBeLessThanOrEqual(10)
  })

  it('should include effort in actions', () => {
    const categories = [
      makeCategory('a', 10, 0.5, [
        makeDebtItem({ priority: 'high', effort: 3 }),
      ]),
    ]
    const plan = generateRepaymentPlan(categories)
    expect(plan[0].effort).toBe(3)
  })

  it('should group by priority within category', () => {
    const categories = [
      makeCategory('a', 10, 0.5, [
        makeDebtItem({ priority: 'high' }),
        makeDebtItem({ priority: 'high' }),
        makeDebtItem({ priority: 'medium' }),
      ]),
    ]
    const plan = generateRepaymentPlan(categories)
    expect(plan).toHaveLength(2)
    expect(plan[0].action).toContain('2 high-priority')
    expect(plan[1].action).toContain('1 medium-priority')
  })
})

// ─── formatDebtMeter ──────────────────────────────────────

describe('formatDebtMeter', () => {
  it('should contain the score', () => {
    const result = formatDebtMeter(42)
    expect(result).toContain('42')
  })

  it('should contain bar characters', () => {
    const result = formatDebtMeter(50)
    expect(result).toContain('█')
    expect(result).toContain('░')
  })

  it('should show /100', () => {
    const result = formatDebtMeter(75)
    expect(result).toContain('/100')
  })

  it('should have full bar at 100', () => {
    const result = formatDebtMeter(100)
    const filledCount = (result.match(/█/g) ?? []).length
    expect(filledCount).toBe(30)
  })

  it('should have empty bar at 0', () => {
    const result = formatDebtMeter(0)
    const emptyCount = (result.match(/░/g) ?? []).length
    expect(emptyCount).toBe(30)
  })
})

// ─── formatGrade ──────────────────────────────────────────

describe('formatGrade', () => {
  it('should contain the grade letter', () => {
    expect(formatGrade('A')).toContain('A')
    expect(formatGrade('B')).toContain('B')
    expect(formatGrade('C')).toContain('C')
    expect(formatGrade('D')).toContain('D')
    expect(formatGrade('F')).toContain('F')
  })
})

// ─── formatCategoryScore ──────────────────────────────────

describe('formatCategoryScore', () => {
  it('should contain the category name', () => {
    const result = formatCategoryScore('complexity', 50)
    expect(result).toContain('complexity')
  })

  it('should contain the score', () => {
    const result = formatCategoryScore('testing', 75)
    expect(result).toContain('75')
  })

  it('should contain bar characters', () => {
    const result = formatCategoryScore('todos', 30)
    expect(result).toContain('█')
    expect(result).toContain('░')
  })
})

// ─── formatDebtTable ──────────────────────────────────────

describe('formatDebtTable', () => {
  function makeTestScore(overrides: Partial<DebtScore> = {}): DebtScore {
    return {
      categories: [],
      estimatedEffort: 0,
      grade: 'A',
      repaymentPlan: [],
      total: 0,
      totalItems: 0,
      ...overrides,
    }
  }

  it('should contain overall score', () => {
    const result = formatDebtTable(makeTestScore({ total: 42 }), false)
    expect(result).toContain('42')
  })

  it('should contain grade', () => {
    const result = formatDebtTable(makeTestScore({ grade: 'C' }), false)
    expect(result).toContain('C')
  })

  it('should show category breakdown', () => {
    const cat = makeCategory('complexity', 30, 0.20)
    const result = formatDebtTable(makeTestScore({ categories: [cat] }), false)
    expect(result).toContain('complexity')
  })

  it('should show repayment plan', () => {
    const plan = [
      {
        action: 'Fix complexity issues',
        category: 'complexity',
        effort: 5,
        impact: 'high',
        priority: 'high' as const,
      },
    ]
    const result = formatDebtTable(makeTestScore({ repaymentPlan: plan }), false)
    expect(result).toContain('Fix complexity issues')
  })

  it('should show verbose items', () => {
    const cat = makeCategory('todos', 30, 0.15, [
      makeDebtItem({ file: 'app.ts', line: 42, description: 'TODO: refactor' }),
    ])
    const result = formatDebtTable(makeTestScore({ categories: [cat] }), true)
    expect(result).toContain('app.ts')
    expect(result).toContain('TODO: refactor')
  })

  it('should not show verbose items when verbose is false', () => {
    const cat = makeCategory('todos', 30, 0.15, [
      makeDebtItem({ file: 'secret.ts', description: 'hidden' }),
    ])
    const result = formatDebtTable(makeTestScore({ categories: [cat] }), false)
    expect(result).not.toContain('secret.ts')
  })

  it('should show total items and effort', () => {
    const result = formatDebtTable(
      makeTestScore({ totalItems: 15, estimatedEffort: 24.5 }),
      false,
    )
    expect(result).toContain('15')
    expect(result).toContain('24.5')
  })
})

// ─── formatDebtJson ───────────────────────────────────────

describe('formatDebtJson', () => {
  it('should produce valid JSON', () => {
    const score: DebtScore = {
      categories: [],
      estimatedEffort: 0,
      grade: 'A',
      repaymentPlan: [],
      total: 0,
      totalItems: 0,
    }
    const result = formatDebtJson(score)
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('should contain total score', () => {
    const score: DebtScore = {
      categories: [],
      estimatedEffort: 0,
      grade: 'C',
      repaymentPlan: [],
      total: 55,
      totalItems: 10,
    }
    const result = formatDebtJson(score)
    const parsed = JSON.parse(result)
    expect(parsed.total).toBe(55)
    expect(parsed.grade).toBe('C')
  })

  it('should serialize categories', () => {
    const cat = makeCategory('todos', 40, 0.15, [
      makeDebtItem({ description: 'a todo' }),
    ])
    const score: DebtScore = {
      categories: [cat],
      estimatedEffort: 1,
      grade: 'B',
      repaymentPlan: [],
      total: 6,
      totalItems: 1,
    }
    const result = formatDebtJson(score)
    const parsed = JSON.parse(result)
    expect(parsed.categories).toHaveLength(1)
    expect(parsed.categories[0].name).toBe('todos')
  })

  it('should serialize repayment plan', () => {
    const action = {
      action: 'Fix stuff',
      category: 'complexity',
      effort: 5,
      impact: 'high',
      priority: 'high' as const,
    }
    const score: DebtScore = {
      categories: [],
      estimatedEffort: 5,
      grade: 'B',
      repaymentPlan: [action],
      total: 25,
      totalItems: 1,
    }
    const result = formatDebtJson(score)
    const parsed = JSON.parse(result)
    expect(parsed.repaymentPlan).toHaveLength(1)
    expect(parsed.repaymentPlan[0].action).toBe('Fix stuff')
  })
})

// ─── Command metadata ─────────────────────────────────────

describe('TechDebt command', () => {
  it('should have correct description', () => {
    expect(TechDebt.description).toContain('technical debt')
  })

  it('should have path arg with default', () => {
    expect(TechDebt.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(TechDebt.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(TechDebt.flags.output).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(TechDebt.flags.ignore).toBeDefined()
  })

  it('should have ext flag', () => {
    expect(TechDebt.flags.ext).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(TechDebt.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(TechDebt.examples.length).toBeGreaterThan(0)
  })
})

// ─── buildDebtScore (integration) ─────────────────────────

describe('buildDebtScore', () => {
  it('should return a valid DebtScore', async () => {
    const contents = new Map<string, string>()
    contents.set('clean.ts', CLEAN_CODE)

    const score = await buildDebtScore('/nonexistent', ['clean.ts'], contents, {
      extensions: null,
      ignorePatterns: [],
    })

    expect(score.total).toBeGreaterThanOrEqual(0)
    expect(score.total).toBeLessThanOrEqual(100)
    expect(['A', 'B', 'C', 'D', 'F']).toContain(score.grade)
    expect(score.categories).toHaveLength(7)
  })

  it('should detect todos in files', async () => {
    const contents = new Map<string, string>()
    contents.set('todos.ts', CODE_WITH_TODOS)

    const score = await buildDebtScore('/nonexistent', ['todos.ts'], contents, {
      extensions: null,
      ignorePatterns: [],
    })

    const todoCat = score.categories.find((c) => c.name === 'todos')
    expect(todoCat).toBeDefined()
    expect(todoCat!.items.length).toBeGreaterThan(0)
  })

  it('should compute estimated effort', async () => {
    const contents = new Map<string, string>()
    contents.set('todos.ts', CODE_WITH_TODOS)

    const score = await buildDebtScore('/nonexistent', ['todos.ts'], contents, {
      extensions: null,
      ignorePatterns: [],
    })

    expect(score.estimatedEffort).toBeGreaterThan(0)
  })

  it('should handle empty file list', async () => {
    const score = await buildDebtScore('/nonexistent', [], new Map(), {
      extensions: null,
      ignorePatterns: [],
    })

    expect(score.total).toBe(0)
    expect(score.grade).toBe('A')
    expect(score.totalItems).toBe(0)
  })

  it('should include repayment plan', async () => {
    const contents = new Map<string, string>()
    contents.set('todos.ts', CODE_WITH_TODOS)

    const score = await buildDebtScore('/nonexistent', ['todos.ts'], contents, {
      extensions: null,
      ignorePatterns: [],
    })

    expect(score.repaymentPlan).toBeDefined()
    expect(Array.isArray(score.repaymentPlan)).toBe(true)
  })
})
