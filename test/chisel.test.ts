import { describe, it, expect } from 'vitest'
import {
  classifyMaterial,
  classifyChiselType,
  classifySculptorGrade,
  classifyStudioGrade,
  detectOvercuts,
  detectUndercuts,
  detectChatterMarks,
  detectRaspMarks,
  evaluateToolUsage,
  analyzeChiselMark,
  analyzeChiselBlock,
  generateRecommendations,
  buildChiselResult,
  type ChiselMark,
  type ChiselStats,
} from '../src/commands/chisel-helpers.js'
import { formatChiselTable, formatChiselJson } from '../src/commands/chisel-format-helpers.js'

// ─── classifyMaterial ───────────────────────────────────────────────────────

describe('classifyMaterial', () => {
  it('returns marble for high quality low complexity', () => {
    expect(classifyMaterial(80, 10)).toBe('marble')
    expect(classifyMaterial(90, 40)).toBe('marble')
  })

  it('returns granite for high quality high complexity', () => {
    expect(classifyMaterial(70, 50)).toBe('granite')
    expect(classifyMaterial(80, 60)).toBe('granite')
  })

  it('returns alabaster for moderate quality', () => {
    expect(classifyMaterial(55, 20)).toBe('alabaster')
    expect(classifyMaterial(65, 10)).toBe('alabaster')
  })

  it('returns limestone for moderate quality low complexity', () => {
    expect(classifyMaterial(40, 20)).toBe('limestone')
  })

  it('returns sandstone for moderate quality higher complexity', () => {
    expect(classifyMaterial(40, 40)).toBe('sandstone')
  })

  it('returns soapstone for lower quality', () => {
    expect(classifyMaterial(25, 10)).toBe('soapstone')
    expect(classifyMaterial(35, 5)).toBe('soapstone')
  })

  it('returns wood for low quality', () => {
    expect(classifyMaterial(10, 5)).toBe('wood')
    expect(classifyMaterial(20, 10)).toBe('wood')
  })

  it('returns clay for very low quality', () => {
    expect(classifyMaterial(5, 0)).toBe('clay')
    expect(classifyMaterial(0, 0)).toBe('clay')
  })
})

// ─── classifyChiselType ─────────────────────────────────────────────────────

describe('classifyChiselType', () => {
  it('returns diamond for 3+ generics', () => {
    expect(classifyChiselType(0, 0, 3)).toBe('diamond')
  })

  it('returns point for 3+ classes and 3+ exports', () => {
    expect(classifyChiselType(3, 3, 0)).toBe('point')
  })

  it('returns round for 2+ classes', () => {
    expect(classifyChiselType(0, 2, 0)).toBe('round')
  })

  it('returns toothed for 4+ exports', () => {
    expect(classifyChiselType(4, 0, 0)).toBe('toothed')
  })

  it('returns flat for 2+ exports or 1+ class', () => {
    expect(classifyChiselType(2, 0, 0)).toBe('flat')
    expect(classifyChiselType(0, 1, 0)).toBe('flat')
  })

  it('returns bullnose as default', () => {
    expect(classifyChiselType(0, 0, 0)).toBe('bullnose')
    expect(classifyChiselType(1, 0, 0)).toBe('bullnose')
  })
})

// ─── classifySculptorGrade ──────────────────────────────────────────────────

describe('classifySculptorGrade', () => {
  it('returns master for 85+', () => { expect(classifySculptorGrade(85)).toBe('master') })
  it('returns artisan for 70-84', () => { expect(classifySculptorGrade(70)).toBe('artisan') })
  it('returns journeyman for 55-69', () => { expect(classifySculptorGrade(55)).toBe('journeyman') })
  it('returns apprentice for 40-54', () => { expect(classifySculptorGrade(40)).toBe('apprentice') })
  it('returns novice for 20-39', () => { expect(classifySculptorGrade(20)).toBe('novice') })
  it('returns hacker below 20', () => { expect(classifySculptorGrade(19)).toBe('hacker') })
})

// ─── classifyStudioGrade ────────────────────────────────────────────────────

describe('classifyStudioGrade', () => {
  it('returns master-studio for 80+', () => { expect(classifyStudioGrade(80)).toBe('master-studio') })
  it('returns workshop for 60-79', () => { expect(classifyStudioGrade(60)).toBe('workshop') })
  it('returns garage for 40-59', () => { expect(classifyStudioGrade(40)).toBe('garage') })
  it('returns shed for 20-39', () => { expect(classifyStudioGrade(20)).toBe('shed') })
  it('returns salvage-yard below 20', () => { expect(classifyStudioGrade(19)).toBe('salvage-yard') })
})

// ─── detectOvercuts ─────────────────────────────────────────────────────────

describe('detectOvercuts', () => {
  it('returns 0 for clean code', () => {
    expect(detectOvercuts('export function a() { return 1 }')).toBe(0)
  })

  it('detects long parameter lists', () => {
    const params = Array.from({ length: 20 }, (_, i) => `p${i}: string`).join(', ')
    expect(detectOvercuts(`function f(${params}) {}`)).toBeGreaterThan(0)
  })

  it('detects long lines', () => {
    expect(detectOvercuts('a'.repeat(200))).toBeGreaterThan(0)
  })
})

// ─── detectUndercuts ────────────────────────────────────────────────────────

describe('detectUndercuts', () => {
  it('returns 0 for complete code', () => {
    expect(detectUndercuts('export function hello(name: string): string { return name }')).toBe(0)
  })

  it('detects empty functions', () => {
    expect(detectUndercuts('function f() {}')).toBeGreaterThan(0)
  })

  it('detects TODO markers', () => {
    expect(detectUndercuts('// TODO implement')).toBeGreaterThan(0)
  })
})

// ─── detectChatterMarks ─────────────────────────────────────────────────────

describe('detectChatterMarks', () => {
  it('returns 0 for consistent code', () => {
    expect(detectChatterMarks('const x = 1\nconst y = 2')).toBe(0)
  })

  it('detects mixed let/const patterns', () => {
    const code = 'let a = 1\nlet b = 2\nlet c = 3\nconst d = 4\nlet e = 5\nlet f = 6\nlet g = 7'
    expect(detectChatterMarks(code)).toBeGreaterThan(0)
  })
})

// ─── detectRaspMarks ────────────────────────────────────────────────────────

describe('detectRaspMarks', () => {
  it('returns 0 for clean code', () => {
    expect(detectRaspMarks('export function a() { return 1 }')).toBe(0)
  })

  it('detects hack comments', () => {
    expect(detectRaspMarks('// HACK workaround')).toBeGreaterThan(0)
    expect(detectRaspMarks('// WORKAROUND fix')).toBeGreaterThan(0)
  })

  it('detects type assertions', () => {
    expect(detectRaspMarks('const x = data as string')).toBeGreaterThan(0)
  })
})

// ─── evaluateToolUsage ──────────────────────────────────────────────────────

describe('evaluateToolUsage', () => {
  it('detects appropriate tools', () => {
    const result = evaluateToolUsage('/** Docs */\nexport interface I { x: string }\nexport function f(): void {}')
    expect(result.appropriateTools).toBeGreaterThan(0)
  })

  it('detects inappropriate tools', () => {
    const result = evaluateToolUsage('const x: any = 1\nconsole.log(x)')
    expect(result.inappropriateTools).toBeGreaterThan(0)
  })

  it('detects missing tools', () => {
    const result = evaluateToolUsage('function f() { return 1 }')
    expect(result.missingTools).toBeGreaterThan(0)
  })
})

// ─── analyzeChiselMark ──────────────────────────────────────────────────────

describe('analyzeChiselMark', () => {
  it('analyzes empty content', () => {
    const mark = analyzeChiselMark('', 'empty.ts')
    expect(mark.file).toBe('empty.ts')
    expect(mark.precision).toBeGreaterThanOrEqual(0)
    expect(mark.qualityScore).toBeGreaterThanOrEqual(0)
    expect(mark.material).toBeDefined()
    expect(mark.chiselType).toBe('bullnose')
    expect(mark.condition).toBe('unworked')
  })

  it('analyzes well-crafted code', () => {
    const code = [
      '/** Module */',
      'export interface Config { name: string }',
      'export type Result = string | number',
      '/** Creates */',
      'export function create(cfg: Config): Result { return cfg.name }',
    ].join('\n')
    const mark = analyzeChiselMark(code, 'good.ts')
    expect(mark.precision).toBeGreaterThan(20)
    expect(mark.toolSelection).toBeGreaterThan(20)
    expect(mark.finishingQuality).toBeGreaterThan(20)
    expect(mark.material).toBeDefined()
    expect(mark.highlights.length).toBeGreaterThan(0)
  })

  it('detects issues in poor code', () => {
    const code = 'const x: any = 1\nconsole.log("debug")\neval("code")'
    const mark = analyzeChiselMark(code, 'bad.ts')
    expect(mark.issues.length).toBeGreaterThan(0)
    expect(mark.markQuality.roughCuts).toBeGreaterThan(0)
  })

  it('computes all metric ranges', () => {
    const mark = analyzeChiselMark('export function a() {}', 'a.ts')
    for (const val of [mark.precision, mark.toolSelection, mark.forceControl, mark.grainRespect, mark.finishingQuality, mark.qualityScore]) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(100)
    }
  })

  it('computes dimensions', () => {
    const mark = analyzeChiselMark('export function a() {}', 'a.ts')
    expect(mark.dimensions.depth).toBeGreaterThanOrEqual(0)
    expect(mark.dimensions.detail).toBeGreaterThanOrEqual(0)
    expect(mark.dimensions.definition).toBeGreaterThanOrEqual(0)
    expect(mark.dimensions.delicacy).toBeGreaterThanOrEqual(0)
  })

  it('computes sculpting stages', () => {
    const mark = analyzeChiselMark('export function a() {}', 'a.ts')
    expect(mark.sculpting.totalStages).toBeGreaterThanOrEqual(0)
    expect(mark.sculpting.totalStages).toBeLessThanOrEqual(4)
  })

  it('computes tool marks', () => {
    const mark = analyzeChiselMark('export function a() {}', 'a.ts')
    expect(mark.toolMarks.appropriateTools).toBeGreaterThanOrEqual(0)
    expect(mark.toolMarks.inappropriateTools).toBeGreaterThanOrEqual(0)
  })
})

// ─── analyzeChiselBlock ─────────────────────────────────────────────────────

describe('analyzeChiselBlock', () => {
  it('returns empty block for no marks', () => {
    const block = analyzeChiselBlock([], 'src')
    expect(block.directory).toBe('src')
    expect(block.marks).toEqual([])
    expect(block.blockQuality).toBe(0)
    expect(block.studioGrade).toBe('salvage-yard')
  })

  it('aggregates mark averages', () => {
    const marks: ChiselMark[] = [
      analyzeChiselMark('export function a() {}', 'a.ts'),
      analyzeChiselMark('/** D */ export class B {}', 'b.ts'),
    ]
    const block = analyzeChiselBlock(marks, 'src')
    expect(block.marks.length).toBe(2)
    expect(block.avgPrecision).toBeGreaterThanOrEqual(0)
    expect(block.blockQuality).toBeGreaterThanOrEqual(0)
  })

  it('counts master and novice', () => {
    const marks: ChiselMark[] = [
      analyzeChiselMark('', 'empty.ts'),
      analyzeChiselMark('/** D */ export function f() {} interface I {}', 'good.ts'),
    ]
    const block = analyzeChiselBlock(marks, 'src')
    expect(block.masterCount).toBeGreaterThanOrEqual(0)
    expect(block.noviceCount).toBeGreaterThanOrEqual(0)
  })

  it('computes studio grade', () => {
    const marks: ChiselMark[] = [analyzeChiselMark('export function a() {}', 'a.ts')]
    const block = analyzeChiselBlock(marks, 'src')
    expect(['master-studio', 'workshop', 'garage', 'shed', 'salvage-yard']).toContain(block.studioGrade)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: ChiselStats = {
    totalFiles: 1, totalBlocks: 1,
    avgPrecision: 50, avgToolSelection: 50, avgForceControl: 50, avgGrainRespect: 50,
    avgFinishing: 50, avgGrainAlignment: 50,
    marbleFiles: 0, graniteFiles: 0, woodFiles: 0, clayFiles: 0,
    masterSculptor: 0, noviceSculptor: 0, hackerSculptor: 0,
    masterpieceCount: 0, butcheredCount: 0,
    totalCleanCuts: 0, totalRoughCuts: 0, totalOvercuts: 0, totalUndercuts: 0,
    totalChatterMarks: 0, totalRaspMarks: 0,
    appropriateToolUsage: 0, inappropriateToolUsage: 0,
    overallPrecision: 50, sculptorGrade: 'journeyman',
    bestMark: 'none', worstMark: 'none', mostDetailed: 'none', cleanestWork: 'none',
  }

  it('praises high precision', () => {
    const recs = generateRecommendations([], [], { ...baseStats, overallPrecision: 80 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Excellent')]))
  })

  it('recommends fixing rough cuts', () => {
    const recs = generateRecommendations([], [], { ...baseStats, totalRoughCuts: 3 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Rough')]))
  })

  it('recommends fixing overcuts', () => {
    const recs = generateRecommendations([], [], { ...baseStats, totalOvercuts: 2 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Overcuts')]))
  })

  it('recommends fixing undercuts', () => {
    const recs = generateRecommendations([], [], { ...baseStats, totalUndercuts: 2 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Undercuts')]))
  })

  it('recommends fixing chatter', () => {
    const recs = generateRecommendations([], [], { ...baseStats, totalChatterMarks: 2 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Chatter')]))
  })
})

// ─── buildChiselResult ──────────────────────────────────────────────────────

describe('buildChiselResult', () => {
  it('handles empty input', () => {
    const result = buildChiselResult([], [], {})
    expect(result.marks).toEqual([])
    expect(result.blocks).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes single file', () => {
    const result = buildChiselResult(['a.ts'], ['export function a() {}'], {})
    expect(result.marks).toHaveLength(1)
    expect(result.marks[0].file).toBe('a.ts')
    expect(result.marks[0].qualityScore).toBeGreaterThan(0)
  })

  it('analyzes multiple files', () => {
    const result = buildChiselResult(
      ['a.ts', 'b.ts', 'c.ts'],
      ['export function a() {}', '/** D */ export class B {}', 'const x: any = 1'],
      {},
    )
    expect(result.marks).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups into blocks by directory', () => {
    const result = buildChiselResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['export function a() {}', 'export function b() {}', 'export function c() {}'],
      {},
    )
    expect(result.blocks.length).toBe(2)
    const dirs = result.blocks.map(b => b.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('lib')
  })

  it('computes best/worst/mostDetailed/cleanestWork', () => {
    const result = buildChiselResult(
      ['good.ts', 'bad.ts'],
      ['/** Docs */ export function good() {} interface I {} type T = string', 'const x: any = 1'],
      {},
    )
    expect(result.stats.bestMark).toBe('good.ts')
    expect(result.stats.worstMark).toBe('bad.ts')
  })

  it('computes sculptor grade', () => {
    const result = buildChiselResult(['a.ts'], ['export function a() {}'], {})
    expect(['master', 'artisan', 'journeyman', 'apprentice', 'novice', 'hacker']).toContain(result.stats.sculptorGrade)
  })

  it('clamps overall precision to valid range', () => {
    const result = buildChiselResult(['a.ts'], ['export function a() {}'], {})
    expect(result.stats.overallPrecision).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallPrecision).toBeLessThanOrEqual(100)
  })

  it('counts material types', () => {
    const result = buildChiselResult(['a.ts'], ['export function a() {}'], {})
    expect(result.stats.marbleFiles + result.stats.graniteFiles + result.stats.woodFiles + result.stats.clayFiles).toBeLessThanOrEqual(result.stats.totalFiles)
  })
})

// ─── formatChiselTable ──────────────────────────────────────────────────────

describe('formatChiselTable', () => {
  it('formats empty result', () => {
    const result = buildChiselResult([], [], {})
    const output = formatChiselTable(result, false)
    expect(output).toContain('Chisel')
    expect(output).toContain('No marks detected')
  })

  it('includes mark info', () => {
    const result = buildChiselResult(['a.ts'], ['export function a() {}'], {})
    const output = formatChiselTable(result, false)
    expect(output).toContain('a.ts')
    expect(output).toContain('Statistics')
  })

  it('shows verbose details', () => {
    const result = buildChiselResult(['a.ts'], ['export function a() {}'], {})
    const output = formatChiselTable(result, true)
    expect(output).toContain('marks:')
    expect(output).toContain('sculpt:')
    expect(output).toContain('dim:')
  })

  it('truncates at 15 in non-verbose', () => {
    const files = Array.from({ length: 20 }, (_, i) => `f${i}.ts`)
    const codes = files.map(() => 'export function a() {}')
    const result = buildChiselResult(files, codes, {})
    const output = formatChiselTable(result, false)
    expect(output).toContain('and 5 more')
  })

  it('shows blocks', () => {
    const result = buildChiselResult(
      ['src/a.ts', 'src/b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    const output = formatChiselTable(result, false)
    expect(output).toContain('Chisel Blocks')
    expect(output).toContain('src')
  })

  it('shows recommendations', () => {
    const result = buildChiselResult([], [], {})
    const output = formatChiselTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

// ─── formatChiselJson ───────────────────────────────────────────────────────

describe('formatChiselJson', () => {
  it('produces valid JSON', () => {
    const result = buildChiselResult(['a.ts'], ['export function a() {}'], {})
    const json = formatChiselJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.marks).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('handles empty result', () => {
    const result = buildChiselResult([], [], {})
    const json = formatChiselJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.marks).toEqual([])
    expect(parsed.blocks).toEqual([])
  })
})
