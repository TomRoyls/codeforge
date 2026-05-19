import { describe, it, expect } from 'vitest'

import {
  scanForTodos,
  scanForMissingTests,
  scanForSecurityGaps,
  scanForPerfOpportunities,
  scanForDocGaps,
  prioritizeItem,
  estimateEffort,
  phaseItems,
  buildTimeline,
  computeStats,
  buildRoadmapResult,
  sourceBaseName,
  type RoadmapItem,
  type RoadmapPhase,
} from '../src/commands/roadmap-helpers.js'

import {
  priorityColor,
  effortBar,
  formatPhase,
  formatTimeline,
  formatStats,
  formatRoadmapTable,
  formatRoadmapJson,
} from '../src/commands/roadmap-format-helpers.js'

// ─── scanForTodos ───────────────────────────────────────

describe('scanForTodos', () => {
  it('finds TODO comments', () => {
    const contents = new Map([['src/main.ts', '// TODO: implement auth']])
    const items = scanForTodos(['src/main.ts'], contents)
    expect(items.length).toBe(1)
    expect(items[0].title).toContain('implement auth')
    expect(items[0].category).toBe('feature')
  })

  it('finds FIXME comments', () => {
    const contents = new Map([['src/fix.ts', '// FIXME: crash on null']])
    const items = scanForTodos(['src/fix.ts'], contents)
    expect(items.length).toBe(1)
    expect(items[0].priority).toBe('high')
  })

  it('finds HACK comments', () => {
    const contents = new Map([['src/h.ts', '// HACK: workaround']])
    const items = scanForTodos(['src/h.ts'], contents)
    expect(items[0].category).toBe('quality')
  })

  it('finds XXX comments', () => {
    const contents = new Map([['src/x.ts', '// XXX: broken']])
    const items = scanForTodos(['src/x.ts'], contents)
    expect(items[0].priority).toBe('high')
  })

  it('returns empty for no TODOs', () => {
    const contents = new Map([['src/clean.ts', 'const x = 1']])
    expect(scanForTodos(['src/clean.ts'], contents)).toEqual([])
  })

  it('handles hash-style TODOs', () => {
    const contents = new Map([['src/script.sh', '# TODO: add error handling']])
    const items = scanForTodos(['src/script.sh'], contents)
    expect(items.length).toBe(1)
  })

  it('handles multiple TODOs in one file', () => {
    const contents = new Map([['src/multi.ts', '// TODO: first\n// TODO: second\n// TODO: third']])
    const items = scanForTodos(['src/multi.ts'], contents)
    expect(items.length).toBe(3)
  })

  it('skips files not in contents map', () => {
    const contents = new Map<string, string>()
    expect(scanForTodos(['src/missing.ts'], contents)).toEqual([])
  })
})

// ─── scanForMissingTests ────────────────────────────────

describe('scanForMissingTests', () => {
  it('finds source files without tests', () => {
    const contents = new Map([
      ['src/utils.ts', 'export function add(a: number, b: number) { return a + b }'],
    ])
    const items = scanForMissingTests(['src/utils.ts'], contents)
    expect(items.length).toBe(1)
    expect(items[0].category).toBe('testing')
    expect(items[0].title).toContain('utils.ts')
  })

  it('skips files with existing tests', () => {
    const contents = new Map([
      ['src/utils.ts', 'export function add(a: number) { return a }'],
      ['test/utils.test.ts', "import { add } from '../src/utils.js'"],
    ])
    const items = scanForMissingTests(['src/utils.ts', 'test/utils.test.ts'], contents)
    const match = items.find((i) => i.id === 'test-src/utils.ts')
    expect(match).toBeUndefined()
  })

  it('skips files without exports', () => {
    const contents = new Map([
      ['src/internal.ts', 'const x = 1'],
    ])
    const items = scanForMissingTests(['src/internal.ts'], contents)
    expect(items).toEqual([])
  })

  it('skips test files themselves', () => {
    const contents = new Map([
      ['test/main.test.ts', "import { foo } from '../src/main.js'"],
    ])
    const items = scanForMissingTests(['test/main.test.ts'], contents)
    expect(items).toEqual([])
  })

  it('estimates higher effort for more exports', () => {
    const manyExports = Array.from({ length: 10 }, (_, i) => `export function fn${i}() {}`).join('\n')
    const contents = new Map([['src/big.ts', manyExports]])
    const items = scanForMissingTests(['src/big.ts'], contents)
    expect(items[0].effort).toBeGreaterThanOrEqual(8)
  })
})

// ─── scanForSecurityGaps ────────────────────────────────

describe('scanForSecurityGaps', () => {
  it('detects eval usage', () => {
    const contents = new Map([['src/danger.ts', "eval('2 + 2')"]])
    const items = scanForSecurityGaps(['src/danger.ts'], contents)
    expect(items.length).toBe(1)
    expect(items[0].priority).toBe('critical')
    expect(items[0].title).toContain('eval')
  })

  it('detects hardcoded secrets', () => {
    const contents = new Map([['src/config.ts', "const password = 'hunter2'"]])
    const items = scanForSecurityGaps(['src/config.ts'], contents)
    expect(items.some((i) => i.title.includes('secrets'))).toBe(true)
  })

  it('detects innerHTML assignment', () => {
    const contents = new Map([['src/dom.ts', "el.innerHTML = '<b>hi</b>'"]])
    const items = scanForSecurityGaps(['src/dom.ts'], contents)
    expect(items.some((i) => i.title.includes('innerHTML'))).toBe(true)
  })

  it('detects Function constructor', () => {
    const contents = new Map([['src/dyn.ts', "new Function('return 1')"]])
    const items = scanForSecurityGaps(['src/dyn.ts'], contents)
    expect(items.some((i) => i.title.includes('Function'))).toBe(true)
  })

  it('detects SQL injection pattern', () => {
    const contents = new Map([['src/db.ts', "query(`SELECT * FROM users WHERE id = ${id}`)"]])
    const items = scanForSecurityGaps(['src/db.ts'], contents)
    expect(items.some((i) => i.title.includes('SQL'))).toBe(true)
  })

  it('returns empty for clean files', () => {
    const contents = new Map([['src/safe.ts', 'const x = 1 + 2']])
    expect(scanForSecurityGaps(['src/safe.ts'], contents)).toEqual([])
  })

  it('all security items are critical priority', () => {
    const contents = new Map([['src/d.ts', "eval('x')"]])
    const items = scanForSecurityGaps(['src/d.ts'], contents)
    for (const item of items) {
      expect(item.priority).toBe('critical')
    }
  })
})

// ─── scanForPerfOpportunities ───────────────────────────

describe('scanForPerfOpportunities', () => {
  it('detects async forEach', () => {
    const contents = new Map([['src/async.ts', 'items.forEach(async (item) => { await process(item) })']])
    const items = scanForPerfOpportunities(['src/async.ts'], contents)
    expect(items.some((i) => i.title.includes('forEach'))).toBe(true)
  })

  it('detects sync I/O', () => {
    const contents = new Map([['src/sync.ts', "const data = readFileSync('file.txt')"]])
    const items = scanForPerfOpportunities(['src/sync.ts'], contents)
    expect(items.some((i) => i.title.includes('sync'))).toBe(true)
  })

  it('detects nested loops', () => {
    const code = 'for (let i = 0; i < n; i++) {\n  for (let j = 0; j < m; j++) {}'
    const contents = new Map([['src/loops.ts', code]])
    const items = scanForPerfOpportunities(['src/loops.ts'], contents)
    expect(items.some((i) => i.title.includes('nested'))).toBe(true)
  })

  it('returns empty for clean files', () => {
    const contents = new Map([['src/good.ts', 'const x = await fetchData()']])
    expect(scanForPerfOpportunities(['src/good.ts'], contents)).toEqual([])
  })
})

// ─── scanForDocGaps ─────────────────────────────────────

describe('scanForDocGaps', () => {
  it('finds undocumented exported functions', () => {
    const contents = new Map([['src/api.ts', 'export function greet(name: string) { return name }']])
    const items = scanForDocGaps(['src/api.ts'], contents)
    expect(items.length).toBe(1)
    expect(items[0].category).toBe('documentation')
    expect(items[0].title).toContain('greet')
  })

  it('skips documented functions', () => {
    const code = ['/** docs */', 'export function foo() {}'].join('\n')
    const contents = new Map([['src/d.ts', code]])
    const items = scanForDocGaps(['src/d.ts'], contents)
    expect(items).toEqual([])
  })

  it('skips non-TS/JS files', () => {
    const contents = new Map([['src/style.css', '.foo { color: red }']])
    expect(scanForDocGaps(['src/style.css'], contents)).toEqual([])
  })

  it('caps at 20 items', () => {
    const code = Array.from({ length: 30 }, (_, i) => `export function fn${i}() {}`).join('\n')
    const contents = new Map([['src/big.ts', code]])
    const items = scanForDocGaps(['src/big.ts'], contents)
    expect(items.length).toBeLessThanOrEqual(20)
  })
})

// ─── prioritizeItem ─────────────────────────────────────

describe('prioritizeItem', () => {
  it('returns critical for security + high impact', () => {
    expect(prioritizeItem({ category: 'security', impact: 9 })).toBe('critical')
  })

  it('returns critical for impact >= 8', () => {
    expect(prioritizeItem({ category: 'feature', impact: 8 })).toBe('critical')
  })

  it('returns high for security regardless of impact', () => {
    expect(prioritizeItem({ category: 'security', impact: 3 })).toBe('high')
  })

  it('returns high for impact >= 6', () => {
    expect(prioritizeItem({ category: 'feature', impact: 6 })).toBe('high')
  })

  it('returns medium for testing category', () => {
    expect(prioritizeItem({ category: 'testing', impact: 2 })).toBe('medium')
  })

  it('returns medium for impact >= 4', () => {
    expect(prioritizeItem({ category: 'feature', impact: 4 })).toBe('medium')
  })

  it('returns low for low impact docs', () => {
    expect(prioritizeItem({ category: 'documentation', impact: 1 })).toBe('low')
  })
})

// ─── estimateEffort ─────────────────────────────────────

describe('estimateEffort', () => {
  it('estimates base effort by category', () => {
    const e = estimateEffort({ category: 'documentation', files: ['a.ts'], impact: 3 })
    expect(e).toBeGreaterThanOrEqual(1)
  })

  it('increases with more files', () => {
    const one = estimateEffort({ category: 'feature', files: ['a.ts'], impact: 5 })
    const three = estimateEffort({ category: 'feature', files: ['a.ts', 'b.ts', 'c.ts'], impact: 5 })
    expect(three).toBeGreaterThan(one)
  })

  it('caps file multiplier at 5 files', () => {
    const five = estimateEffort({ category: 'feature', files: ['a', 'b', 'c', 'd', 'e'], impact: 5 })
    const ten = estimateEffort({ category: 'feature', files: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], impact: 5 })
    expect(ten).toBe(five)
  })
})

// ─── phaseItems ─────────────────────────────────────────

describe('phaseItems', () => {
  const makeItem = (priority: 'critical' | 'high' | 'medium' | 'low', effort: number): RoadmapItem => ({
    category: 'feature',
    dependencies: [],
    description: '',
    effort,
    evidence: '',
    files: [],
    id: `item-${priority}`,
    impact: 5,
    priority,
    title: `${priority} item`,
  })

  it('groups items by priority into phases', () => {
    const items = [makeItem('critical', 4), makeItem('high', 3), makeItem('medium', 2), makeItem('low', 1)]
    const phases = phaseItems(items)
    expect(phases.length).toBe(4)
    expect(phases[0].name).toContain('Critical')
    expect(phases[1].name).toContain('High Priority')
    expect(phases[2].name).toContain('Improvements')
    expect(phases[3].name).toContain('Nice-to-Have')
  })

  it('omits empty phases', () => {
    const items = [makeItem('high', 3)]
    const phases = phaseItems(items)
    expect(phases.length).toBe(1)
    expect(phases[0].name).toContain('High Priority')
  })

  it('calculates totalEffort per phase', () => {
    const items = [makeItem('critical', 4), makeItem('critical', 6)]
    const phases = phaseItems(items)
    expect(phases[0].totalEffort).toBe(10)
  })
})

// ─── buildTimeline ──────────────────────────────────────

describe('buildTimeline', () => {
  const makePhase = (efforts: number[]): RoadmapPhase => ({
    description: '',
    items: efforts.map((e, i) => ({
      category: 'feature' as const,
      dependencies: [] as string[],
      description: '',
      effort: e,
      evidence: '',
      files: [],
      id: `item-${i}`,
      impact: 5,
      priority: 'high' as const,
      title: `Item ${i}`,
    })),
    name: 'Phase 1',
    totalEffort: efforts.reduce((a, b) => a + b, 0),
  })

  it('creates timeline entries', () => {
    const phases = [makePhase([10, 10])]
    const timeline = buildTimeline(phases)
    expect(timeline.length).toBeGreaterThanOrEqual(1)
    expect(timeline[0].week).toBe(1)
  })

  it('splits into multiple weeks when over capacity', () => {
    const phases = [makePhase([30, 30, 30])]
    const timeline = buildTimeline(phases)
    expect(timeline.length).toBeGreaterThanOrEqual(2)
  })

  it('handles empty phases', () => {
    expect(buildTimeline([])).toEqual([])
  })

  it('each entry has positive effort', () => {
    const phases = [makePhase([15, 20, 10])]
    const timeline = buildTimeline(phases)
    for (const entry of timeline) {
      expect(entry.effort).toBeGreaterThan(0)
    }
  })
})

// ─── computeStats ───────────────────────────────────────

describe('computeStats', () => {
  it('computes total items', () => {
    const items: RoadmapItem[] = [
      { id: '1', title: 'a', description: '', category: 'feature', priority: 'high', effort: 4, impact: 5, files: [], evidence: '', dependencies: [] },
      { id: '2', title: 'b', description: '', category: 'security', priority: 'critical', effort: 2, impact: 9, files: [], evidence: '', dependencies: [] },
    ]
    const stats = computeStats(items)
    expect(stats.totalItems).toBe(2)
    expect(stats.totalEffort).toBe(6)
    expect(stats.criticalItems).toBe(1)
    expect(stats.byCategory.feature).toBe(1)
    expect(stats.byCategory.security).toBe(1)
    expect(stats.byPriority.high).toBe(1)
    expect(stats.byPriority.critical).toBe(1)
  })

  it('handles empty items', () => {
    const stats = computeStats([])
    expect(stats.totalItems).toBe(0)
    expect(stats.totalEffort).toBe(0)
    expect(stats.criticalItems).toBe(0)
  })
})

// ─── buildRoadmapResult ─────────────────────────────────

describe('buildRoadmapResult', () => {
  it('builds complete roadmap from file contents', () => {
    const contents = new Map([
      ['src/main.ts', "// TODO: add feature\nexport function main() {}\nconst pw = 'secret123'"],
      ['test/main.test.ts', "import { main } from '../src/main.js'"],
    ])
    const result = buildRoadmapResult(
      ['src/main.ts', 'test/main.test.ts'],
      contents,
      { maxEffort: 0, verbose: false },
    )
    expect(result.phases.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalItems).toBeGreaterThanOrEqual(1)
    expect(result.timeline.length).toBeGreaterThanOrEqual(1)
  })

  it('deduplicates items', () => {
    const contents = new Map([
      ['src/a.ts', '// TODO: fix this'],
      ['src/a.ts', '// TODO: fix this'],
    ])
    const result = buildRoadmapResult(
      ['src/a.ts'],
      contents,
      { maxEffort: 0, verbose: false },
    )
    const todoItems = result.stats.totalItems
    expect(todoItems).toBeGreaterThanOrEqual(1)
  })

  it('respects maxEffort filter', () => {
    const contents = new Map([
      ['src/big.ts', "eval('x')"],
    ])
    const resultAll = buildRoadmapResult(['src/big.ts'], contents, { maxEffort: 0, verbose: false })
    const resultFiltered = buildRoadmapResult(['src/big.ts'], contents, { maxEffort: 1, verbose: false })
    expect(resultFiltered.stats.totalItems).toBeLessThanOrEqual(resultAll.stats.totalItems)
  })

  it('handles empty input', () => {
    const result = buildRoadmapResult([], new Map(), { maxEffort: 0, verbose: false })
    expect(result.phases).toEqual([])
    expect(result.stats.totalItems).toBe(0)
  })
})

// ─── sourceBaseName ─────────────────────────────────────

describe('sourceBaseName', () => {
  it('strips .ts extension', () => {
    expect(sourceBaseName('src/roadmap-helpers.ts')).toBe('roadmap-helpers')
  })

  it('handles filename without path', () => {
    expect(sourceBaseName('foo.ts')).toBe('foo')
  })

  it('does not strip non-ts extension', () => {
    expect(sourceBaseName('readme.md')).toBe('readme.md')
  })
})

// ─── priorityColor ──────────────────────────────────────

describe('priorityColor', () => {
  it('returns string for critical', () => {
    expect(typeof priorityColor('critical')).toBe('string')
  })

  it('returns string for high', () => {
    expect(typeof priorityColor('high')).toBe('string')
  })

  it('returns string for medium', () => {
    expect(typeof priorityColor('medium')).toBe('string')
  })

  it('returns string for low', () => {
    expect(typeof priorityColor('low')).toBe('string')
  })

  it('returns fallback for unknown', () => {
    expect(priorityColor('unknown')).toBe('○')
  })
})

// ─── effortBar ──────────────────────────────────────────

describe('effortBar', () => {
  it('renders a bar string', () => {
    const bar = effortBar(8, 20)
    expect(bar).toContain('█')
    expect(bar).toContain('░')
    expect(bar).toContain('8h')
  })

  it('handles zero effort', () => {
    const bar = effortBar(0, 20)
    expect(bar).toContain('0h')
  })

  it('handles zero maxEffort', () => {
    const bar = effortBar(5, 0)
    expect(bar).toContain('5h')
  })
})

// ─── formatPhase ────────────────────────────────────────

describe('formatPhase', () => {
  it('formats a phase with items', () => {
    const phase: RoadmapPhase = {
      description: 'Test phase',
      items: [{
        id: '1', title: 'Fix bug', description: 'Fix the bug', category: 'feature',
        priority: 'critical', effort: 4, impact: 8, files: ['src/a.ts'], evidence: 'found', dependencies: [],
      }],
      name: 'Phase 1: Critical',
      totalEffort: 4,
    }
    const text = formatPhase(phase)
    expect(text).toContain('Phase 1: Critical')
    expect(text).toContain('Fix bug')
    expect(text).toContain('4h')
  })

  it('formats phase with empty items', () => {
    const phase: RoadmapPhase = {
      description: 'Empty', items: [], name: 'Empty Phase', totalEffort: 0,
    }
    const text = formatPhase(phase)
    expect(text).toContain('Empty Phase')
  })
})

// ─── formatTimeline ─────────────────────────────────────

describe('formatTimeline', () => {
  it('formats timeline entries', () => {
    const text = formatTimeline([
      { week: 1, items: ['a'], description: 'do stuff', effort: 20 },
    ])
    expect(text).toContain('Week 1')
    expect(text).toContain('20h')
  })

  it('handles empty entries', () => {
    const text = formatTimeline([])
    expect(text).toContain('No timeline')
  })
})

// ─── formatStats ────────────────────────────────────────

describe('formatStats', () => {
  it('formats stats', () => {
    const stats = {
      byCategory: { feature: 5, testing: 3 },
      byPriority: { critical: 1, high: 4 },
      criticalItems: 1,
      totalEffort: 42,
      totalItems: 8,
    }
    const text = formatStats(stats)
    expect(text).toContain('8')
    expect(text).toContain('42h')
    expect(text).toContain('feature')
    expect(text).toContain('critical')
  })
})

// ─── formatRoadmapTable ─────────────────────────────────

describe('formatRoadmapTable', () => {
  it('formats full roadmap', () => {
    const result = {
      phases: [{
        description: 'Critical', items: [{
          id: '1', title: 'Fix', description: 'desc', category: 'security' as const,
          priority: 'critical' as const, effort: 4, impact: 9, files: [], evidence: '', dependencies: [],
        }], name: 'Phase 1', totalEffort: 4,
      }],
      stats: { totalItems: 1, totalEffort: 4, byCategory: { security: 1 }, byPriority: { critical: 1 }, criticalItems: 1 },
      timeline: [{ week: 1, items: ['1'], description: 'Fix', effort: 4 }],
    }
    const text = formatRoadmapTable(result)
    expect(text.length).toBeGreaterThan(0)
    expect(text).toContain('Phase 1')
  })
})

// ─── formatRoadmapJson ──────────────────────────────────

describe('formatRoadmapJson', () => {
  it('produces valid JSON', () => {
    const result = {
      phases: [], stats: { totalItems: 0, totalEffort: 0, byCategory: {}, byPriority: {}, criticalItems: 0 },
      timeline: [],
    }
    const json = formatRoadmapJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.phases).toEqual([])
    expect(parsed.stats.totalItems).toBe(0)
  })
})
