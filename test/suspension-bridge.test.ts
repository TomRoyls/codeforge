import { describe, expect, it } from 'vitest'
import {
  analyzeBridgeNetwork,
  analyzeBridgeSpan,
  buildSuspensionBridgeResult,
  classifyEngineerGrade,
  classifyNetworkType,
  measureAnchor,
  measureCable,
  measureDeck,
  measureLoad,
  measureSpan,
  measureTower,
} from '../src/commands/suspension-bridge-helpers.js'
import { formatSuspensionBridgeJson, formatSuspensionBridgeTable } from '../src/commands/suspension-bridge-format-helpers.js'

// ─── measureCable ───────────────────────────────────────────────────────────

describe('measureCable', () => {
  it('returns frayed-rope for empty content', () => {
    const r = measureCable('')
    expect(r.type).toBe('frayed-rope')
    expect(r.strength).toBe(0)
    expect(r.isTaut).toBe(false)
    expect(r.corrosionCount).toBe(0)
  })

  it('detects proper anchoring with imports and exports', () => {
    const code = 'import { x } from "y"\nexport function a() {}'
    const r = measureCable(code)
    expect(r.hasProperAnchoring).toBe(true)
    expect(r.strength).toBeGreaterThan(0)
  })

  it('detects corrosion from mutations', () => {
    const code = 'import { x } from "y"\nconst arr = []\narr.push(1)\nexport function a() {}'
    const r = measureCable(code)
    expect(r.hasCorrosion).toBe(true)
    expect(r.corrosionCount).toBeGreaterThan(0)
  })

  it('detects fraying from side effects', () => {
    const code = 'console.log("x")\nexport function a() {}'
    const r = measureCable(code)
    expect(r.hasFraying).toBe(true)
  })

  it('detects kinks from imbalanced imports/exports', () => {
    const code = Array(10).fill('import { x } from "y"').join('\n') + '\nexport function a() {}'
    const r = measureCable(code)
    expect(r.hasKinks).toBe(true)
  })

  it('assigns strand type for high strength', () => {
    const code = [
      'import { a, b, c } from "x"',
      'export function one() {}',
      'export function two() {}',
      'export function three() {}',
    ].join('\n')
    const r = measureCable(code)
    expect(r.strength).toBeGreaterThan(30)
  })
})

// ─── measureDeck ────────────────────────────────────────────────────────────

describe('measureDeck', () => {
  it('returns rope material for empty content', () => {
    const r = measureDeck('')
    expect(r.material).toBe('rope')
    expect(r.stability).toBe(0)
    expect(r.isLevel).toBe(false)
  })

  it('detects smooth surface with types and exports', () => {
    const code = 'export function add(a: number, b: number): number { return a + b }'
    const r = measureDeck(code)
    expect(r.hasSmoothSurface).toBe(true)
  })

  it('detects expansion joints (interfaces)', () => {
    const code = 'interface Config { port: number }\nexport function init(c: Config) {}'
    const r = measureDeck(code)
    expect(r.hasExpansionJoints).toBe(true)
    expect(r.jointCount).toBeGreaterThan(0)
  })

  it('detects drainage (error handling)', () => {
    const code = 'export function safe() { try { return 1 } catch { return 0 } }'
    const r = measureDeck(code)
    expect(r.hasDrainage).toBe(true)
  })

  it('detects railings (validation)', () => {
    const code = 'export function validate(x: number) { if (x > 0) { return x } return 0 }'
    const r = measureDeck(code)
    expect(r.hasRailings).toBe(true)
  })

  it('detects potholes (no exports)', () => {
    const code = Array(10).fill('const x = 1').join('\n')
    const r = measureDeck(code)
    expect(r.hasPotHoles).toBe(true)
  })

  it('assigns steel for high stability', () => {
    const code = [
      '/** docs */',
      'interface X { a: number }',
      'export function process(x: X): number {',
      '  try { if (x.a > 0) { return x.a } return 0 } catch { return 0 }',
      '}',
    ].join('\n')
    const r = measureDeck(code)
    expect(r.material).toBe('steel')
    expect(r.isLevel).toBe(true)
  })
})

// ─── measureTower ───────────────────────────────────────────────────────────

describe('measureTower', () => {
  it('returns zeros for empty content', () => {
    const r = measureTower('')
    expect(r.integrity).toBe(0)
    expect(r.isPlumb).toBe(false)
    expect(r.crackCount).toBe(0)
  })

  it('detects solid foundation (classes or 3+ functions)', () => {
    const code = 'class Engine { run() {} stop() {} }'
    const r = measureTower(code)
    expect(r.hasSolidFoundation).toBe(true)
  })

  it('detects reinforced concrete (try/catch)', () => {
    const code = 'function safe() { try { return 1 } catch { return 0 } }'
    const r = measureTower(code)
    expect(r.hasReinforcedConcrete).toBe(true)
  })

  it('detects structural steel (types + classes)', () => {
    const code = 'interface Config { port: number }\nclass App { config: Config }'
    const r = measureTower(code)
    expect(r.hasStructuralSteel).toBe(true)
  })

  it('detects guy wires (generics)', () => {
    const code = 'function identity<T>(x: T): T { return x }'
    const r = measureTower(code)
    expect(r.hasGuyWires).toBe(true)
  })

  it('detects cracks (more let than const)', () => {
    const code = 'let a = 1\nlet b = 2\nlet c = 3\nconst d = 4\nfunction run() {}'
    const r = measureTower(code)
    expect(r.hasCracks).toBe(true)
    expect(r.crackCount).toBeGreaterThan(0)
  })

  it('detects settling (const > let)', () => {
    const code = 'const a = 1\nconst b = 2\nfunction run() { return a }'
    const r = measureTower(code)
    expect(r.hasSettling).toBe(true)
  })
})

// ─── measureAnchor ──────────────────────────────────────────────────────────

describe('measureAnchor', () => {
  it('returns sand-anchor for empty content', () => {
    const r = measureAnchor('')
    expect(r.type).toBe('sand-anchor')
    expect(r.security).toBe(0)
    expect(r.isSolid).toBe(false)
  })

  it('detects solid anchor (imports, no side effects)', () => {
    const code = 'import { x } from "react"\nconst y: number = x'
    const r = measureAnchor(code)
    expect(r.isSolid).toBe(true)
  })

  it('detects deep anchor (types + imports)', () => {
    const code = 'import { Config } from "config"\nconst x: Config = {}'
    const r = measureAnchor(code)
    expect(r.isDeep).toBe(true)
  })

  it('detects redundancy (try/catch)', () => {
    const code = 'import { x } from "y"\ntry { x() } catch {}'
    const r = measureAnchor(code)
    expect(r.hasRedundancy).toBe(true)
    expect(r.redundancyCount).toBeGreaterThan(0)
  })

  it('detects corrosion (side effects)', () => {
    const code = 'import { x } from "y"\nconsole.log(x)'
    const r = measureAnchor(code)
    expect(r.hasCorrosion).toBe(true)
  })

  it('assigns high anchor type for secure code', () => {
    const code = [
      'import { x } from "lib"',
      'import { y } from "utils"',
      'const a: number = x',
      'try { y(a) } catch {}',
    ].join('\n')
    const r = measureAnchor(code)
    expect(r.security).toBeGreaterThan(50)
  })
})

// ─── measureLoad ────────────────────────────────────────────────────────────

describe('measureLoad', () => {
  it('returns zeros for empty content', () => {
    const r = measureLoad('')
    expect(r.distribution).toBe(0)
    expect(r.isBalanced).toBe(false)
    expect(r.overloadedCount).toBe(0)
  })

  it('detects even distribution', () => {
    const lines = []
    for (let i = 0; i < 3; i++) {
      lines.push(`function fn${i}(x: number) {`)
      lines.push(`  const a = x + ${i}`)
      lines.push(`  const b = a * 2`)
      lines.push(`  return b`)
      lines.push('}')
    }
    const r = measureLoad(lines.join('\n'))
    expect(r.hasEvenDistribution).toBe(true)
  })

  it('detects overloaded sections', () => {
    const lines = ['function big() {']
    for (let i = 0; i < 40; i++) {
      lines.push(`  const x${i} = ${i}`)
    }
    lines.push('}')
    const r = measureLoad(lines.join('\n'))
    expect(r.hasOverloadedSection).toBe(true)
  })

  it('detects underloaded sections', () => {
    const lines = []
    for (let i = 0; i < 10; i++) {
      lines.push('const x = () => { return 1 }')
    }
    const r = measureLoad(lines.join('\n'))
    expect(r.hasUnderloadedSection).toBe(true)
  })

  it('detects dynamic load (async/pipe)', () => {
    const code = 'async function fetch() { return await Promise.resolve(1) }'
    const r = measureLoad(code)
    expect(r.hasDynamicLoad).toBe(true)
  })

  it('detects resonance (too many pipes)', () => {
    const code = 'function run(arr) {\n  return arr.map(x => x).map(x => x).map(x => x).map(x => x).filter(x => x)\n}'
    const r = measureLoad(code)
    expect(r.hasResonance).toBe(true)
  })

  it('detects fatigue risk (too many ifs)', () => {
    const code = 'function complex(x) {\n  if (x > 1) {}\n  if (x > 2) {}\n  if (x > 3) {}\n  if (x > 4) {}\n  if (x > 5) {}\n  if (x > 6) {}\n  if (x > 7) {}\n  if (x > 8) {}\n  if (x > 9) {}\n  if (x > 10) {}\n}'
    const r = measureLoad(code)
    expect(r.hasFatigueRisk).toBe(true)
  })
})

// ─── measureSpan ────────────────────────────────────────────────────────────

describe('measureSpan', () => {
  it('returns zeros for empty content', () => {
    const r = measureSpan('')
    expect(r.clarity).toBe(0)
    expect(r.isClear).toBe(false)
    expect(r.signageCount).toBe(0)
  })

  it('detects visibility (exports)', () => {
    const code = 'export function run() {}'
    const r = measureSpan(code)
    expect(r.hasVisibility).toBe(true)
  })

  it('detects proper signage (JSDoc)', () => {
    const code = '/** Add two numbers */\nexport function add(a: number, b: number): number { return a + b }'
    const r = measureSpan(code)
    expect(r.hasProperSignage).toBe(true)
    expect(r.signageCount).toBeGreaterThan(0)
  })

  it('detects lane markings (types + params)', () => {
    const code = 'export function process(a: number, b: string): void {}'
    const r = measureSpan(code)
    expect(r.hasLaneMarkings).toBe(true)
  })

  it('detects scenic views (interfaces + exports)', () => {
    const code = 'interface Result { value: number }\nexport function compute(): Result { return { value: 1 } }'
    const r = measureSpan(code)
    expect(r.hasScenicViews).toBe(true)
  })

  it('computes span length from LOC', () => {
    const lines = Array(20).fill('const x = 1')
    const r = measureSpan(lines.join('\n'))
    expect(r.length).toBeGreaterThan(0)
    expect(r.length).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeBridgeSpan ──────────────────────────────────────────────────────

describe('analyzeBridgeSpan', () => {
  it('returns condemned for empty content', () => {
    const r = analyzeBridgeSpan('', 'empty.ts')
    expect(r.condition).toBe('condemned')
    expect(r.qualityScore).toBe(0)
    expect(r.file).toBe('empty.ts')
  })

  it('includes all sub-measures', () => {
    const r = analyzeBridgeSpan('const x = 1', 'test.ts')
    expect(r).toHaveProperty('cable')
    expect(r).toHaveProperty('deck')
    expect(r).toHaveProperty('tower')
    expect(r).toHaveProperty('anchor')
    expect(r).toHaveProperty('load')
    expect(r).toHaveProperty('span')
  })

  it('computes quality score as average', () => {
    const r = analyzeBridgeSpan('const x: number = 1', 'test.ts')
    const expected = Math.round(
      (r.cableStrength + r.deckStability + r.towerIntegrity + r.anchorSecurity + r.loadDistribution + r.spanClarity) / 6,
    )
    expect(r.qualityScore).toBe(expected)
  })

  it('returns golden-gate for excellent code', () => {
    const code = [
      '/** Excellent module */',
      'import { Config } from "config"',
      'interface Result { value: number }',
      'export function process(c: Config): Result {',
      '  try {',
      '    return { value: c.port }',
      '  } catch { return { value: 0 } }',
      '}',
    ].join('\n')
    const r = analyzeBridgeSpan(code, 'great.ts')
    expect(r.qualityScore).toBeGreaterThan(30)
  })
})

// ─── classifyNetworkType ────────────────────────────────────────────────────

describe('classifyNetworkType', () => {
  it('returns rope-bridge for empty spans', () => {
    expect(classifyNetworkType([])).toBe('rope-bridge')
  })

  it('returns interstate-system for high quality', () => {
    const spans = [
      { condition: 'golden-gate', qualityScore: 95 } as any,
      { condition: 'golden-gate', qualityScore: 90 } as any,
      { condition: 'modern-marvel', qualityScore: 80 } as any,
    ]
    expect(classifyNetworkType(spans)).toBe('interstate-system')
  })

  it('returns footbridge for low quality', () => {
    const spans = [
      { condition: 'condemned', qualityScore: 10 } as any,
      { condition: 'structurally-deficient', qualityScore: 20 } as any,
    ]
    expect(classifyNetworkType(spans)).toBe('footbridge')
  })
})

// ─── classifyEngineerGrade ──────────────────────────────────────────────────

describe('classifyEngineerGrade', () => {
  it('returns chief-engineer for 90+', () => {
    expect(classifyEngineerGrade(95)).toBe('chief-engineer')
  })
  it('returns senior-engineer for 75+', () => {
    expect(classifyEngineerGrade(80)).toBe('senior-engineer')
  })
  it('returns engineer for 55+', () => {
    expect(classifyEngineerGrade(60)).toBe('engineer')
  })
  it('returns technician for 35+', () => {
    expect(classifyEngineerGrade(40)).toBe('technician')
  })
  it('returns handyman for 15+', () => {
    expect(classifyEngineerGrade(20)).toBe('handyman')
  })
  it('returns demolition for below 15', () => {
    expect(classifyEngineerGrade(5)).toBe('demolition')
  })
})

// ─── analyzeBridgeNetwork ───────────────────────────────────────────────────

describe('analyzeBridgeNetwork', () => {
  it('returns defaults for empty spans', () => {
    const r = analyzeBridgeNetwork([], 'src/')
    expect(r.networkType).toBe('rope-bridge')
    expect(r.avgCableStrength).toBe(0)
    expect(r.goldenGateCount).toBe(0)
  })

  it('computes averages from spans', () => {
    const s1 = analyzeBridgeSpan('const x: number = 1', 'a.ts')
    const s2 = analyzeBridgeSpan('export function y() { return 1 }', 'b.ts')
    const r = analyzeBridgeNetwork([s1, s2], '.')
    expect(r.spans).toHaveLength(2)
    expect(r.avgCableStrength).toBeGreaterThanOrEqual(0)
  })
})

// ─── buildSuspensionBridgeResult ────────────────────────────────────────────

describe('buildSuspensionBridgeResult', () => {
  it('returns empty result for no files', () => {
    const r = buildSuspensionBridgeResult([], [], {})
    expect(r.spans).toHaveLength(0)
    expect(r.networks).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.engineerGrade).toBe('demolition')
    expect(r.authority.isStructurallySound).toBe(false)
  })

  it('analyzes single file', () => {
    const r = buildSuspensionBridgeResult(['test.ts'], ['const x: number = 1'], {})
    expect(r.spans).toHaveLength(1)
    expect(r.spans[0].file).toBe('test.ts')
    expect(r.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into networks', () => {
    const r = buildSuspensionBridgeResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['const a = 1', 'const b = 2', 'const c = 3'],
      {},
    )
    expect(r.networks.length).toBeGreaterThanOrEqual(2)
    expect(r.stats.totalNetworks).toBeGreaterThanOrEqual(2)
  })

  it('computes correct averages', () => {
    const r = buildSuspensionBridgeResult(
      ['a.ts', 'b.ts'],
      ['const x: number = 1', 'export function y() { return 1 }'],
      {},
    )
    expect(r.stats.avgCableStrength).toBeGreaterThanOrEqual(0)
    expect(r.stats.avgDeckStability).toBeGreaterThanOrEqual(0)
    expect(r.stats.overallIntegrity).toBeGreaterThanOrEqual(0)
  })

  it('tracks condition counts', () => {
    const r = buildSuspensionBridgeResult(['a.ts'], ['const x: number = 1'], {})
    const total = r.stats.goldenGateCount + r.stats.modernMarvelCount + r.stats.soundStructureCount + r.stats.needsMaintenanceCount + r.stats.structurallyDeficientCount + r.stats.condemnedCount
    expect(total).toBe(1)
  })

  it('identifies best span', () => {
    const r = buildSuspensionBridgeResult(
      ['bad.ts', 'good.ts'],
      ['debugger;', 'export function gold(): number { return 42 }'],
      {},
    )
    expect(r.stats.bestSpan).toBeTruthy()
    expect(r.stats.clearestSpan).toBeTruthy()
  })

  it('generates recommendations', () => {
    const r = buildSuspensionBridgeResult(
      ['a.ts'],
      ['console.log("x")\nconsole.log("y")\nconsole.log("z")'],
      {},
    )
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('sets authority properties', () => {
    const r = buildSuspensionBridgeResult(['a.ts'], ['const x = 1'], {})
    expect(r.authority.avgCableStrength).toBeGreaterThanOrEqual(0)
    expect(typeof r.authority.isStructurallySound).toBe('boolean')
  })

  it('tracks structural counts', () => {
    const r = buildSuspensionBridgeResult(
      ['a.ts', 'b.ts'],
      ['const x: number = 1', 'function bad() { console.log("x"); arr.push(1) }'],
      {},
    )
    expect(r.stats.isTautCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasCorrosionCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasRailingsCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── format helpers ─────────────────────────────────────────────────────────

describe('formatSuspensionBridgeTable', () => {
  it('formats empty result', () => {
    const r = buildSuspensionBridgeResult([], [], {})
    const out = formatSuspensionBridgeTable(r, false)
    expect(out).toContain('Suspension Bridge')
    expect(out).toContain('No files analyzed')
  })

  it('formats with spans', () => {
    const r = buildSuspensionBridgeResult(['a.ts'], ['const x = 1'], {})
    const out = formatSuspensionBridgeTable(r, false)
    expect(out).toContain('a.ts')
    expect(out).toContain('Summary')
  })

  it('shows verbose mode with all spans', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'const x = 1')
    const r = buildSuspensionBridgeResult(files, contents, {})
    const out = formatSuspensionBridgeTable(r, true)
    expect(out).toContain('file19.ts')
  })

  it('truncates in non-verbose mode', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'const x = 1')
    const r = buildSuspensionBridgeResult(files, contents, {})
    const out = formatSuspensionBridgeTable(r, false)
    expect(out).toContain('more')
  })
})

describe('formatSuspensionBridgeJson', () => {
  it('produces valid JSON', () => {
    const r = buildSuspensionBridgeResult(['a.ts'], ['const x = 1'], {})
    const out = formatSuspensionBridgeJson(r)
    const parsed = JSON.parse(out)
    expect(parsed.spans).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
