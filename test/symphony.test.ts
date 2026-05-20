import { describe, expect, it } from 'vitest'

import {
  classifyRole,
  classifySectionType,
  computeOrchestraBalance,
  computeOverallHarmony,
  computeRange,
  computeSectionHarmony,
  computeSectionTuning,
  computeSectionVolume,
  computeSkill,
  computeTuning,
  detectDissonance,
  generateRecommendations,
  measureHarmony,
  buildSymphonyResult,
  type Instrument,
  type OrchestraSection,
  type Harmony,
  type Dissonance,
  type SymphonyStats,
} from '../src/commands/symphony-helpers.js'

import {
  formatSymphonyJSON,
  formatSymphonyTable,
  formatOrchestraLayout,
  formatInstrumentDetails,
  formatHarmonyMap,
  formatDissonanceWarnings,
  formatSymphonyStats,
  formatSymphonyRecommendations,
} from '../src/commands/symphony-format-helpers.js'

// ─── classifySectionType ────────────────────────────────────────────────────────

describe('classifySectionType', () => {
  it('classifies test directory as percussion', () => {
    expect(classifySectionType(['a.test.ts'], 'test')).toBe('percussion')
  })

  it('classifies __tests__ directory as percussion', () => {
    expect(classifySectionType(['a.ts'], '__tests__')).toBe('percussion')
  })

  it('classifies spec directory as percussion', () => {
    expect(classifySectionType(['a.ts'], 'spec')).toBe('percussion')
  })

  it('classifies core directory as strings', () => {
    expect(classifySectionType(['parser.ts'], '/core/')).toBe('strings')
  })

  it('classifies lib directory as strings', () => {
    expect(classifySectionType(['util.ts'], '/lib/')).toBe('strings')
  })

  it('classifies commands directory as brass', () => {
    expect(classifySectionType(['run.ts'], '/commands/')).toBe('brass')
  })

  it('classifies cli directory as brass', () => {
    expect(classifySectionType(['run.ts'], '/cli/')).toBe('brass')
  })

  it('classifies config files as keyboard', () => {
    expect(classifySectionType(['config.json'], '.')).toBe('keyboard')
  })

  it('classifies type-heavy directory as keyboard', () => {
    expect(classifySectionType(['types.ts', 'interfaces.ts', 'helpers.ts'], '.')).toBe('keyboard')
  })

  it('classifies regular utility files as woodwinds', () => {
    expect(classifySectionType(['helper.ts', 'utils.ts'], 'src/utils')).toBe('woodwinds')
  })

  it('classifies all-test-files directory as percussion', () => {
    expect(classifySectionType(['a.test.ts', 'b.test.ts'], 'src')).toBe('percussion')
  })
})

// ─── classifyRole ───────────────────────────────────────────────────────────────

describe('classifyRole', () => {
  it('classifies index with many exports as lead', () => {
    expect(classifyRole('index.ts', '', 0, 5)).toBe('lead')
  })

  it('classifies high-import high-export as lead', () => {
    expect(classifyRole('mod.ts', '', 6, 3)).toBe('lead')
  })

  it('classifies async/await content as solo', () => {
    expect(classifyRole('mod.ts', 'async function run() { await doWork() }', 1, 1)).toBe('solo')
  })

  it('classifies low-import low-export as solo', () => {
    expect(classifyRole('mod.ts', 'const x = 1', 0, 0)).toBe('solo')
  })

  it('classifies many constants as rhythm', () => {
    const content = 'export const A = 1\nexport const B = 2\nexport const C = 3\nexport const D = 4\nexport const E = 5'
    expect(classifyRole('mod.ts', content, 2, 1)).toBe('rhythm')
  })

  it('classifies moderate imports as harmony', () => {
    expect(classifyRole('mod.ts', '', 3, 1)).toBe('harmony')
  })

  it('classifies moderate exports as harmony', () => {
    expect(classifyRole('mod.ts', '', 0, 2)).toBe('harmony')
  })
})

// ─── computeSkill ───────────────────────────────────────────────────────────────

describe('computeSkill', () => {
  it('returns base score for empty content', () => {
    expect(computeSkill('')).toBe(20)
  })

  it('increases with JSDoc comments', () => {
    const noDocs = 'const x = 1\n'
    const withDocs = '/** doc */\nconst x = 1\n/** doc2 */\nconst y = 2\n'
    expect(computeSkill(withDocs)).toBeGreaterThan(computeSkill(noDocs))
  })

  it('increases with type annotations', () => {
    const noTypes = 'const x = 1\n'
    const withTypes = 'const x: number = 1\nconst y: string = "hi"\n'
    expect(computeSkill(withTypes)).toBeGreaterThan(computeSkill(noTypes))
  })

  it('decreases with any usage', () => {
    const clean = 'const x: number = 1\n'
    const withAny = 'const x: any = 1\n'
    expect(computeSkill(withAny)).toBeLessThan(computeSkill(clean))
  })

  it('clamps to 0-100', () => {
    expect(computeSkill('')).toBeGreaterThanOrEqual(0)
    expect(computeSkill('')).toBeLessThanOrEqual(100)
  })
})

// ─── computeRange ───────────────────────────────────────────────────────────────

describe('computeRange', () => {
  it('returns [1,1] for content with no functions', () => {
    expect(computeRange('const x = 1')).toEqual([1, 1])
  })

  it('computes range across functions', () => {
    const content = 'function simple() { return 1 }\nfunction complex() { if (x) { for (let i = 0; i < 10; i++) { while (y) {} } } }'
    const [min, max] = computeRange(content)
    expect(max).toBeGreaterThan(min)
  })

  it('detects && and || as complexity', () => {
    const content = 'function f() { x && y || z }'
    const [min, max] = computeRange(content)
    expect(max).toBeGreaterThanOrEqual(3)
  })
})

// ─── computeTuning ──────────────────────────────────────────────────────────────

describe('computeTuning', () => {
  it('returns 50 for empty content', () => {
    expect(computeTuning('')).toBe(50)
  })

  it('penalizes mixed function styles', () => {
    const consistent = 'const add = (a: number) => a + 1\nconst sub = (b: number) => b - 1\n'
    const mixed = 'function add(a: number) { return a + 1 }\nconst sub = (b: number) => b - 1\n'
    expect(computeTuning(consistent)).toBeGreaterThanOrEqual(computeTuning(mixed))
  })

  it('rewards single naming style', () => {
    const consistent = 'function processData() {}\nfunction handleEvent() {}\nfunction runTask() {}\n'
    expect(computeTuning(consistent)).toBeGreaterThan(60)
  })

  it('clamps to 0-100', () => {
    expect(computeTuning('const x = 1')).toBeGreaterThanOrEqual(0)
    expect(computeTuning('const x = 1')).toBeLessThanOrEqual(100)
  })
})

// ─── computeSectionHarmony ──────────────────────────────────────────────────────

describe('computeSectionHarmony', () => {
  it('returns 50 for empty section', () => {
    const section: OrchestraSection = {
      name: 'test', instruments: [], sectionType: 'woodwinds', harmony: 0, volume: 0, tuning: 0,
    }
    expect(computeSectionHarmony(section)).toBe(50)
  })

  it('is higher for consistent instruments', () => {
    const good: OrchestraSection = {
      name: 'good', sectionType: 'strings', harmony: 0, volume: 0, tuning: 0,
      instruments: [
        { file: 'a.ts', section: '.', role: 'lead', skill: 80, range: [1, 3], tuning: 80 },
        { file: 'b.ts', section: '.', role: 'lead', skill: 80, range: [1, 3], tuning: 80 },
      ],
    }
    const bad: OrchestraSection = {
      name: 'bad', sectionType: 'strings', harmony: 0, volume: 0, tuning: 0,
      instruments: [
        { file: 'a.ts', section: '.', role: 'lead', skill: 20, range: [1, 3], tuning: 20 },
        { file: 'b.ts', section: '.', role: 'lead', skill: 90, range: [1, 3], tuning: 90 },
      ],
    }
    expect(computeSectionHarmony(good)).toBeGreaterThan(computeSectionHarmony(bad))
  })
})

// ─── computeSectionVolume ───────────────────────────────────────────────────────

describe('computeSectionVolume', () => {
  it('computes volume from range averages', () => {
    const section: OrchestraSection = {
      name: 'test', sectionType: 'brass', harmony: 0, volume: 0, tuning: 0,
      instruments: [
        { file: 'a.ts', section: '.', role: 'lead', skill: 50, range: [2, 6], tuning: 70 },
      ],
    }
    expect(computeSectionVolume(section)).toBe(8)
  })

  it('returns 0 for empty section', () => {
    const section: OrchestraSection = {
      name: 'test', sectionType: 'woodwinds', harmony: 0, volume: 0, tuning: 0, instruments: [],
    }
    expect(computeSectionVolume(section)).toBe(0)
  })
})

// ─── computeSectionTuning ───────────────────────────────────────────────────────

describe('computeSectionTuning', () => {
  it('returns 50 for empty section', () => {
    const section: OrchestraSection = {
      name: 'test', sectionType: 'woodwinds', harmony: 0, volume: 0, tuning: 0, instruments: [],
    }
    expect(computeSectionTuning(section)).toBe(50)
  })

  it('averages tuning of instruments', () => {
    const section: OrchestraSection = {
      name: 'test', sectionType: 'brass', harmony: 0, volume: 0, tuning: 0,
      instruments: [
        { file: 'a.ts', section: '.', role: 'lead', skill: 50, range: [1, 1], tuning: 60 },
        { file: 'b.ts', section: '.', role: 'lead', skill: 50, range: [1, 1], tuning: 80 },
      ],
    }
    expect(computeSectionTuning(section)).toBe(70)
  })
})

// ─── measureHarmony ─────────────────────────────────────────────────────────────

describe('measureHarmony', () => {
  it('returns perfect for similar sections', () => {
    const a: OrchestraSection = {
      name: 'a', sectionType: 'strings', harmony: 80, volume: 5, tuning: 80,
      instruments: [],
    }
    const b: OrchestraSection = {
      name: 'b', sectionType: 'woodwinds', harmony: 80, volume: 5, tuning: 80,
      instruments: [],
    }
    const h = measureHarmony(a, b)
    expect(h.type).toBe('perfect')
    expect(h.consonance).toBeGreaterThanOrEqual(85)
  })

  it('returns cacophonous for very different sections', () => {
    const a: OrchestraSection = {
      name: 'a', sectionType: 'strings', harmony: 100, volume: 5, tuning: 100,
      instruments: [],
    }
    const b: OrchestraSection = {
      name: 'b', sectionType: 'brass', harmony: 0, volume: 5, tuning: 0,
      instruments: [],
    }
    const h = measureHarmony(a, b)
    expect(h.consonance).toBeLessThanOrEqual(50)
    expect(h.type).toMatch(/dissonant|cacophonous|minor/)
  })

  it('populates between with section names', () => {
    const a: OrchestraSection = { name: 'core', sectionType: 'strings', harmony: 50, volume: 3, tuning: 50, instruments: [] }
    const b: OrchestraSection = { name: 'utils', sectionType: 'woodwinds', harmony: 50, volume: 3, tuning: 50, instruments: [] }
    const h = measureHarmony(a, b)
    expect(h.between).toEqual(['core', 'utils'])
  })

  it('includes a description', () => {
    const a: OrchestraSection = { name: 'a', sectionType: 'strings', harmony: 50, volume: 3, tuning: 50, instruments: [] }
    const b: OrchestraSection = { name: 'b', sectionType: 'woodwinds', harmony: 50, volume: 3, tuning: 50, instruments: [] }
    const h = measureHarmony(a, b)
    expect(h.description).toBeTruthy()
  })
})

// ─── detectDissonance ───────────────────────────────────────────────────────────

describe('detectDissonance', () => {
  it('detects mixed async/callback patterns', () => {
    const content = 'async function run() { await work(); callback(); }'
    const dissonances = detectDissonance(['mod.ts'], [content], [])
    expect(dissonances.some((d) => d.type === 'timing')).toBe(true)
  })

  it('detects mixed naming conventions', () => {
    const content = 'const myVar = 1\nconst my_other_var = 2\nconst yetAnother = 3\nconst and_more = 4'
    const dissonances = detectDissonance(['mod.ts'], [content], [])
    expect(dissonances.some((d) => d.type === 'key')).toBe(true)
  })

  it('detects oversized files', () => {
    const lines = Array(600).fill('const x = 1;')
    const content = lines.join('\n')
    const dissonances = detectDissonance(['big.ts'], [content], [])
    expect(dissonances.some((d) => d.type === 'volume')).toBe(true)
  })

  it('detects missing test section', () => {
    const sections: OrchestraSection[] = [
      { name: 'core', sectionType: 'strings', harmony: 50, volume: 3, tuning: 50, instruments: [] },
    ]
    const dissonances = detectDissonance(['a.ts'], ['code'], sections)
    expect(dissonances.some((d) => d.type === 'missing')).toBe(true)
  })

  it('returns empty for clean code', () => {
    const content = 'const myVar: number = 1\nfunction processData() { return myVar + 1 }'
    const sections: OrchestraSection[] = [
      { name: 'tests', sectionType: 'percussion', harmony: 50, volume: 3, tuning: 50, instruments: [] },
    ]
    const dissonances = detectDissonance(['clean.ts'], [content], sections)
    expect(dissonances).toHaveLength(0)
  })

  it('assigns major severity for files over 1000 lines', () => {
    const lines = Array(1100).fill('const x = 1;')
    const content = lines.join('\n')
    const dissonances = detectDissonance(['huge.ts'], [content], [])
    const volumeD = dissonances.find((d) => d.type === 'volume')
    expect(volumeD?.severity).toBe('major')
  })
})

// ─── computeOverallHarmony ──────────────────────────────────────────────────────

describe('computeOverallHarmony', () => {
  it('returns 50 for empty harmonies', () => {
    expect(computeOverallHarmony([])).toBe(50)
  })

  it('averages consonance values', () => {
    const harmonies: Harmony[] = [
      { between: ['a', 'b'], consonance: 60, type: 'minor', description: '' },
      { between: ['b', 'c'], consonance: 80, type: 'major', description: '' },
    ]
    expect(computeOverallHarmony(harmonies)).toBe(70)
  })
})

// ─── computeOrchestraBalance ────────────────────────────────────────────────────

describe('computeOrchestraBalance', () => {
  it('returns 50 for single section', () => {
    const sections: OrchestraSection[] = [
      { name: 'a', sectionType: 'strings', harmony: 50, volume: 3, tuning: 50, instruments: [{ file: 'a.ts', section: '.', role: 'lead', skill: 50, range: [1, 1], tuning: 50 }] },
    ]
    expect(computeOrchestraBalance(sections)).toBe(50)
  })

  it('returns 100 for perfectly balanced sections', () => {
    const sections: OrchestraSection[] = [
      { name: 'a', sectionType: 'strings', harmony: 50, volume: 3, tuning: 50, instruments: Array(5).fill(null).map(() => ({ file: 'a.ts', section: '.', role: 'lead' as const, skill: 50, range: [1, 1] as [number, number], tuning: 50 })) },
      { name: 'b', sectionType: 'woodwinds', harmony: 50, volume: 3, tuning: 50, instruments: Array(5).fill(null).map(() => ({ file: 'b.ts', section: '.', role: 'lead' as const, skill: 50, range: [1, 1] as [number, number], tuning: 50 })) },
    ]
    expect(computeOrchestraBalance(sections)).toBe(100)
  })

  it('returns lower for imbalanced sections', () => {
    const sections: OrchestraSection[] = [
      { name: 'a', sectionType: 'strings', harmony: 50, volume: 3, tuning: 50, instruments: Array(10).fill(null).map(() => ({ file: 'a.ts', section: '.', role: 'lead' as const, skill: 50, range: [1, 1] as [number, number], tuning: 50 })) },
      { name: 'b', sectionType: 'woodwinds', harmony: 50, volume: 3, tuning: 50, instruments: [{ file: 'b.ts', section: '.', role: 'lead', skill: 50, range: [1, 1], tuning: 50 }] },
    ]
    expect(computeOrchestraBalance(sections)).toBeLessThan(100)
  })

  it('returns 50 for empty array', () => {
    expect(computeOrchestraBalance([])).toBe(50)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: SymphonyStats = {
    totalInstruments: 10, sectionCount: 3, perfectHarmonies: 2, dissonantCount: 1,
    overallHarmony: 80, orchestraBalance: 70, tuningScore: 75,
    leadInstrument: 'a.ts', loudestSection: 'core', quietestSection: 'utils',
  }

  it('recommends for major dissonances', () => {
    const dissonances: Dissonance[] = [
      { file: 'a.ts', type: 'timing', severity: 'major', description: 'bad', resolution: 'fix it' },
    ]
    const recs = generateRecommendations([], [], [], dissonances, baseStats)
    expect(recs.some((r) => r.includes('major dissonance'))).toBe(true)
  })

  it('recommends for low balance', () => {
    const stats = { ...baseStats, orchestraBalance: 30 }
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some((r) => r.includes('unbalanced'))).toBe(true)
  })

  it('recommends for poor tuning', () => {
    const sections: OrchestraSection[] = [
      { name: 'bad', sectionType: 'strings', harmony: 50, volume: 3, tuning: 30, instruments: [] },
    ]
    const recs = generateRecommendations([], sections, [], [], baseStats)
    expect(recs.some((r) => r.includes('tuning'))).toBe(true)
  })

  it('praises high harmony', () => {
    const stats = { ...baseStats, overallHarmony: 90 }
    const recs = generateRecommendations([], [], [], [], stats)
    expect(recs.some((r) => r.includes('beautifully'))).toBe(true)
  })

  it('returns default when all is good', () => {
    const recs = generateRecommendations([], [], [], [], baseStats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildSymphonyResult ────────────────────────────────────────────────────────

describe('buildSymphonyResult', () => {
  it('handles empty files', () => {
    const result = buildSymphonyResult([], [], {})
    expect(result.instruments).toHaveLength(0)
    expect(result.sections).toHaveLength(0)
    expect(result.stats.totalInstruments).toBe(0)
  })

  it('creates instruments from files', () => {
    const result = buildSymphonyResult(
      ['src/core/a.ts', 'src/core/b.ts'],
      ['const x = 1', 'const y = 2'],
      {},
    )
    expect(result.instruments).toHaveLength(2)
  })

  it('groups files into sections by directory', () => {
    const result = buildSymphonyResult(
      ['src/core/a.ts', 'src/utils/b.ts'],
      ['const x = 1', 'const y = 2'],
      {},
    )
    expect(result.sections).toHaveLength(2)
  })

  it('generates harmonies between sections', () => {
    const result = buildSymphonyResult(
      ['src/core/a.ts', 'src/utils/b.ts', 'src/commands/c.ts'],
      ['const x = 1', 'const y = 2', 'const z = 3'],
      {},
    )
    expect(result.harmonies).toHaveLength(3)
  })

  it('identifies lead instrument as highest skill', () => {
    const goodCode = '/** Great docs */\nconst x: number = 1\nconst y: string = "hello"\nconst z: boolean = true'
    const badCode = 'var x'
    const result = buildSymphonyResult(
      ['src/good.ts', 'src/bad.ts'],
      [goodCode, badCode],
      {},
    )
    expect(result.stats.leadInstrument).toBe('src/good.ts')
  })

  it('identifies loudest and quietest sections', () => {
    const result = buildSymphonyResult(
      ['src/core/a.ts', 'src/core/b.ts'],
      ['if (x) { for (let i = 0; i < 10; i++) { while (y) {} } }', 'const x = 1'],
      {},
    )
    expect(result.stats.loudestSection).toBeTruthy()
    expect(result.stats.quietestSection).toBeTruthy()
  })

  it('computes all stats', () => {
    const result = buildSymphonyResult(
      ['src/a.ts', 'src/b.ts'],
      ['const x = 1', 'const y = 2'],
      {},
    )
    expect(result.stats.totalInstruments).toBe(2)
    expect(result.stats.sectionCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.overallHarmony).toBeGreaterThanOrEqual(0)
    expect(result.stats.orchestraBalance).toBeGreaterThanOrEqual(0)
    expect(result.stats.tuningScore).toBeGreaterThanOrEqual(0)
  })

  it('generates recommendations', () => {
    const result = buildSymphonyResult(
      ['src/a.ts'],
      ['const x = 1'],
      {},
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('detects dissonances in content', () => {
    const badContent = 'async function run() { await work(); callback(); }'
    const result = buildSymphonyResult(
      ['src/a.ts'],
      [badContent],
      {},
    )
    expect(result.dissonances.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────────

describe('formatOrchestraLayout', () => {
  it('formats empty sections', () => {
    expect(formatOrchestraLayout([])).toContain('No sections')
  })

  it('formats sections with icons', () => {
    const sections: OrchestraSection[] = [
      { name: 'core', sectionType: 'strings', harmony: 80, volume: 5, tuning: 70, instruments: [] },
    ]
    const output = formatOrchestraLayout(sections)
    expect(output).toContain('core')
    expect(output).toContain('strings')
  })
})

describe('formatInstrumentDetails', () => {
  it('formats empty instruments', () => {
    expect(formatInstrumentDetails([])).toContain('No instruments')
  })

  it('formats instrument details', () => {
    const instruments: Instrument[] = [
      { file: 'mod.ts', section: '.', role: 'lead', skill: 85, range: [1, 5], tuning: 90 },
    ]
    const output = formatInstrumentDetails(instruments)
    expect(output).toContain('mod.ts')
    expect(output).toContain('lead')
  })
})

describe('formatHarmonyMap', () => {
  it('formats empty harmonies', () => {
    expect(formatHarmonyMap([])).toContain('No harmonies')
  })

  it('formats harmony relationships', () => {
    const harmonies: Harmony[] = [
      { between: ['core', 'utils'], consonance: 85, type: 'perfect', description: 'good' },
    ]
    const output = formatHarmonyMap(harmonies)
    expect(output).toContain('core')
    expect(output).toContain('utils')
    expect(output).toContain('perfect')
  })
})

describe('formatDissonanceWarnings', () => {
  it('formats empty dissonances', () => {
    expect(formatDissonanceWarnings([])).toContain('No dissonances')
  })

  it('formats dissonance warnings', () => {
    const dissonances: Dissonance[] = [
      { file: 'mod.ts', type: 'timing', severity: 'moderate', description: 'mixed patterns', resolution: 'fix it' },
    ]
    const output = formatDissonanceWarnings(dissonances)
    expect(output).toContain('mod.ts')
    expect(output).toContain('mixed patterns')
  })
})

describe('formatSymphonyStats', () => {
  it('formats stats', () => {
    const stats: SymphonyStats = {
      totalInstruments: 10, sectionCount: 3, perfectHarmonies: 2, dissonantCount: 1,
      overallHarmony: 80, orchestraBalance: 70, tuningScore: 75,
      leadInstrument: 'a.ts', loudestSection: 'core', quietestSection: 'utils',
    }
    const output = formatSymphonyStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('3')
  })
})

describe('formatSymphonyRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatSymphonyRecommendations([])).toContain('No recommendations')
  })

  it('formats numbered recommendations', () => {
    const output = formatSymphonyRecommendations(['Fix timing issues', 'Improve naming'])
    expect(output).toContain('1.')
    expect(output).toContain('2.')
  })
})

describe('formatSymphonyTable', () => {
  it('formats full result', () => {
    const result = buildSymphonyResult(
      ['src/core/a.ts', 'src/utils/b.ts'],
      ['const x = 1', 'const y = 2'],
      {},
    )
    const output = formatSymphonyTable(result)
    expect(output).toContain('Symphony Analysis')
    expect(output).toContain('Orchestra Layout')
  })
})

describe('formatSymphonyJSON', () => {
  it('formats as valid JSON', () => {
    const result = buildSymphonyResult(
      ['src/a.ts'],
      ['const x = 1'],
      {},
    )
    const output = formatSymphonyJSON(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.totalInstruments).toBe(1)
  })
})
