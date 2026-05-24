import { describe, it, expect } from 'vitest'
import {
  measureIlluminating, measureFlowing, measureDisciplining, measureSignaling, measureRouting,
  analyzeHighwayNeon, analyzeHighwaySystem, buildNeonHighwayResult,
  classifyNeonCondition, classifySystemType, classifyEngineerGrade, classifySystemCondition,
  generateRecommendations, gatherFiles,
  type HighwayNeon, type NeonHighwayResult,
} from '../src/commands/neon-highway-helpers.js'
import {
  colorScore, colorGrade, formatNeonTable, formatNeonsTable,
  formatSystemTable, formatSystemsTable, formatStatsTable,
  formatRecommendations, formatResultTable, formatResultJson,
} from '../src/commands/neon-highway-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const EMPTY = ''
const MINIMAL = 'const x = 1'
const RICH = `import path from 'node:path'
import type { Command } from '@oclif/core'

/**
 * Example command
 */
export interface AnalysisResult {
  /** The score */
  score: number
  name: string
}

export type AnalysisType = 'full' | 'partial'

export class Analyzer<T> {
  private data: T
  readonly id: string

  constructor(data: T) {
    this.data = data
    this.id = 'test'
  }

  async analyze(): Promise<number> {
    try {
      const result = this.data
      return result ? 1 : 0
    } catch {
      return -1
    }
  }
}

export const createAnalyzer = (input: unknown): number => {
  if (input === null) return 0
  const val = input ?? 'default'
  const safe = input?.toString()
  return val === safe ? 1 : 0
}
`
const BAD = 'var x: any = eval("test")\ndebugger\nvar y: any'

// ─── Illuminating Measure ──────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns 0 for empty content', () => {
    const m = measureIlluminating(EMPTY)
    expect(m.luminosity).toBe(0)
  })

  it('returns dark-road for empty content', () => {
    expect(measureIlluminating(EMPTY).grade).toBe('dark-road')
  })

  it('detects const alone', () => {
    expect(measureIlluminating(MINIMAL).luminosity).toBe(8)
  })

  it('returns 100 for rich content', () => {
    expect(measureIlluminating(RICH).luminosity).toBe(100)
  })

  it('returns blinding-neon for rich content', () => {
    expect(measureIlluminating(RICH).grade).toBe('blinding-neon')
  })

  it('detects hasHighLuminosity for rich', () => {
    expect(measureIlluminating(RICH).hasHighLuminosity).toBe(true)
  })

  it('detects hasVisible for rich (export+import)', () => {
    expect(measureIlluminating(RICH).hasVisible).toBe(true)
  })

  it('detects hasClear for rich (interface+class)', () => {
    expect(measureIlluminating(RICH).hasClear).toBe(true)
  })

  it('detects hasBright for rich (generics+type alias)', () => {
    expect(measureIlluminating(RICH).hasBright).toBe(true)
  })

  it('detects hasNoObscured for clean content', () => {
    expect(measureIlluminating(RICH).hasNoObscured).toBe(true)
  })

  it('detects obscuredCount for bad content', () => {
    expect(measureIlluminating(BAD).obscuredCount).toBe(2)
  })

  it('detects hasNoObscured false for bad content', () => {
    expect(measureIlluminating(BAD).hasNoObscured).toBe(false)
  })

  it('detects darkCount for bad content', () => {
    expect(measureIlluminating(BAD).darkCount).toBe(2)
  })

  it('detects hasNoHidden false for eval content', () => {
    expect(measureIlluminating(BAD).hasNoHidden).toBe(false)
  })

  it('detects hasNoMurky false for debugger', () => {
    expect(measureIlluminating(BAD).hasNoMurky).toBe(false)
  })
})

// ─── Flowing Measure ───────────────────────────────────────────────

describe('measureFlowing', () => {
  it('returns 0 for empty content', () => {
    expect(measureFlowing(EMPTY).quality).toBe(0)
  })

  it('returns gridlock for empty content', () => {
    expect(measureFlowing(EMPTY).flow).toBe('gridlock')
  })

  it('returns 100 for rich content', () => {
    expect(measureFlowing(RICH).quality).toBe(100)
  })

  it('returns autobahn for rich content', () => {
    expect(measureFlowing(RICH).flow).toBe('autobahn')
  })

  it('detects hasHighQuality for rich', () => {
    expect(measureFlowing(RICH).hasHighQuality).toBe(true)
  })

  it('detects hasSmooth for rich (try+async)', () => {
    expect(measureFlowing(RICH).hasSmooth).toBe(true)
  })

  it('detects hasFluid for rich (optional chaining+nullish coalescing)', () => {
    expect(measureFlowing(RICH).hasFluid).toBe(true)
  })

  it('detects hasNoJammed for clean content', () => {
    expect(measureFlowing(RICH).hasNoJammed).toBe(true)
  })

  it('detects hasNoBlocked for clean content', () => {
    expect(measureFlowing(RICH).hasNoBlocked).toBe(true)
  })

  it('detects hasNoStalled false for eval', () => {
    expect(measureFlowing(BAD).hasNoStalled).toBe(false)
  })

  it('detects jammedCount for bad content', () => {
    expect(measureFlowing(BAD).jammedCount).toBe(2)
  })

  it('detects blockedCount for bad content', () => {
    expect(measureFlowing(BAD).blockedCount).toBe(2)
  })
})

// ─── Disciplining Measure ──────────────────────────────────────────

describe('measureDisciplining', () => {
  it('returns 0 for empty content', () => {
    expect(measureDisciplining(EMPTY).discipline).toBe(0)
  })

  it('returns wrong-way for empty content', () => {
    expect(measureDisciplining(EMPTY).lane).toBe('wrong-way')
  })

  it('returns 100 for rich content', () => {
    expect(measureDisciplining(RICH).discipline).toBe(100)
  })

  it('returns perfect-lane for rich content', () => {
    expect(measureDisciplining(RICH).lane).toBe('perfect-lane')
  })

  it('detects hasHighDiscipline for rich', () => {
    expect(measureDisciplining(RICH).hasHighDiscipline).toBe(true)
  })

  it('detects hasOrganized for rich (interface+generics)', () => {
    expect(measureDisciplining(RICH).hasOrganized).toBe(true)
  })

  it('detects hasStructured for rich (class+private)', () => {
    expect(measureDisciplining(RICH).hasStructured).toBe(true)
  })

  it('detects chaoticCount for bad content', () => {
    expect(measureDisciplining(BAD).chaoticCount).toBe(2)
  })

  it('detects messyCount for bad content', () => {
    expect(measureDisciplining(BAD).messyCount).toBe(2)
  })

  it('detects hasNoChaotic false for bad content', () => {
    expect(measureDisciplining(BAD).hasNoChaotic).toBe(false)
  })
})

// ─── Signaling Measure ─────────────────────────────────────────────

describe('measureSignaling', () => {
  it('returns 0 for empty content', () => {
    expect(measureSignaling(EMPTY).quality).toBe(0)
  })

  it('returns no-signals for empty content', () => {
    expect(measureSignaling(EMPTY).signal).toBe('no-signals')
  })

  it('returns 100 for rich content', () => {
    expect(measureSignaling(RICH).quality).toBe(100)
  })

  it('returns green-wave for rich content', () => {
    expect(measureSignaling(RICH).signal).toBe('green-wave')
  })

  it('detects hasClear for rich (doc comments+return type)', () => {
    expect(measureSignaling(RICH).hasClear).toBe(true)
  })

  it('detects hasCommunicative for rich (export+doc comments)', () => {
    expect(measureSignaling(RICH).hasCommunicative).toBe(true)
  })

  it('detects hasExplicit for rich (interface+generics)', () => {
    expect(measureSignaling(RICH).hasExplicit).toBe(true)
  })

  it('detects ambiguousCount for bad content', () => {
    expect(measureSignaling(BAD).ambiguousCount).toBe(2)
  })

  it('detects hasNoCryptic false for eval', () => {
    expect(measureSignaling(BAD).hasNoCryptic).toBe(false)
  })
})

// ─── Routing Measure ───────────────────────────────────────────────

describe('measureRouting', () => {
  it('returns 0 for empty content', () => {
    expect(measureRouting(EMPTY).efficiency).toBe(0)
  })

  it('returns dead-end for empty content', () => {
    expect(measureRouting(EMPTY).route).toBe('dead-end')
  })

  it('returns 100 for rich content', () => {
    expect(measureRouting(RICH).efficiency).toBe(100)
  })

  it('returns optimal-path for rich content', () => {
    expect(measureRouting(RICH).route).toBe('optimal-path')
  })

  it('detects hasDirect for rich (export+import)', () => {
    expect(measureRouting(RICH).hasDirect).toBe(true)
  })

  it('detects hasEfficient for rich (interface+class)', () => {
    expect(measureRouting(RICH).hasEfficient).toBe(true)
  })

  it('detects hasHighEfficiency for rich', () => {
    expect(measureRouting(RICH).hasHighEfficiency).toBe(true)
  })

  it('detects circuitousCount for bad content', () => {
    expect(measureRouting(BAD).circuitousCount).toBe(2)
  })

  it('detects roundaboutCount for bad content', () => {
    expect(measureRouting(BAD).roundaboutCount).toBe(2)
  })
})

// ─── Classification Functions ──────────────────────────────────────

describe('classifyNeonCondition', () => {
  it('returns neon-boulevard for 90', () => {
    expect(classifyNeonCondition(90)).toBe('neon-boulevard')
  })
  it('returns bright-highway for 75', () => {
    expect(classifyNeonCondition(75)).toBe('bright-highway')
  })
  it('returns lit-road for 60', () => {
    expect(classifyNeonCondition(60)).toBe('lit-road')
  })
  it('returns dim-street for 45', () => {
    expect(classifyNeonCondition(45)).toBe('dim-street')
  })
  it('returns dark-alley for 30', () => {
    expect(classifyNeonCondition(30)).toBe('dark-alley')
  })
  it('returns abandoned-road for 10', () => {
    expect(classifyNeonCondition(10)).toBe('abandoned-road')
  })
})

describe('classifyEngineerGrade', () => {
  it('returns highway-engineer for 85', () => {
    expect(classifyEngineerGrade(85)).toBe('highway-engineer')
  })
  it('returns traffic-engineer for 70', () => {
    expect(classifyEngineerGrade(70)).toBe('traffic-engineer')
  })
  it('returns road-designer for 55', () => {
    expect(classifyEngineerGrade(55)).toBe('road-designer')
  })
  it('returns surveyor for 40', () => {
    expect(classifyEngineerGrade(40)).toBe('surveyor')
  })
  it('returns apprentice for 25', () => {
    expect(classifyEngineerGrade(25)).toBe('apprentice')
  })
  it('returns pothole for 10', () => {
    expect(classifyEngineerGrade(10)).toBe('pothole')
  })
})

describe('classifySystemCondition', () => {
  it('returns autobahn for 80', () => {
    expect(classifySystemCondition(80)).toBe('autobahn')
  })
  it('returns expressway for 65', () => {
    expect(classifySystemCondition(65)).toBe('expressway')
  })
  it('returns highway for 50', () => {
    expect(classifySystemCondition(50)).toBe('highway')
  })
  it('returns local-road for 35', () => {
    expect(classifySystemCondition(35)).toBe('local-road')
  })
  it('returns goat-path for 20', () => {
    expect(classifySystemCondition(20)).toBe('goat-path')
  })
  it('returns impassable for 5', () => {
    expect(classifySystemCondition(5)).toBe('impassable')
  })
})

describe('classifySystemType', () => {
  it('returns no-road for empty array', () => {
    expect(classifySystemType([])).toBe('no-road')
  })

  it('returns interstate for high-score neons with neon-boulevard majority', () => {
    const neons: HighwayNeon[] = [
      { ...analyzeHighwayNeon(RICH, 'a.ts') },
      { ...analyzeHighwayNeon(RICH, 'b.ts') },
    ]
    expect(classifySystemType(neons)).toBe('interstate')
  })
})

// ─── Analyze Highway Neon ──────────────────────────────────────────

describe('analyzeHighwayNeon', () => {
  it('returns abandoned-road for empty content', () => {
    const n = analyzeHighwayNeon(EMPTY, 'empty.ts')
    expect(n.condition).toBe('abandoned-road')
  })

  it('returns neon-boulevard for rich content', () => {
    const n = analyzeHighwayNeon(RICH, 'rich.ts')
    expect(n.condition).toBe('neon-boulevard')
  })

  it('computes qualityScore as average of all 5 measures', () => {
    const n = analyzeHighwayNeon(RICH, 'rich.ts')
    expect(n.qualityScore).toBe(100)
  })

  it('preserves file name', () => {
    expect(analyzeHighwayNeon(RICH, 'myfile.ts').file).toBe('myfile.ts')
  })

  it('maps all measure scores to top-level fields', () => {
    const n = analyzeHighwayNeon(RICH, 'rich.ts')
    expect(n.luminosity).toBe(100)
    expect(n.trafficFlow).toBe(100)
    expect(n.laneDiscipline).toBe(100)
    expect(n.signalQuality).toBe(100)
    expect(n.routeEfficiency).toBe(100)
  })

  it('computes qualityScore for bad content', () => {
    const n = analyzeHighwayNeon(BAD, 'bad.ts')
    expect(n.qualityScore).toBe(0)
  })
})

// ─── Analyze Highway System ────────────────────────────────────────

describe('analyzeHighwaySystem', () => {
  it('returns empty system for empty neons', () => {
    const s = analyzeHighwaySystem([], 'src')
    expect(s.systemType).toBe('no-road')
    expect(s.condition).toBe('impassable')
    expect(s.neons).toHaveLength(0)
  })

  it('computes averages for single neon', () => {
    const neon = analyzeHighwayNeon(RICH, 'rich.ts')
    const s = analyzeHighwaySystem([neon], '.')
    expect(s.avgLuminosity).toBe(100)
    expect(s.avgFlow).toBe(100)
    expect(s.avgEfficiency).toBe(100)
  })

  it('computes averages for multi neons', () => {
    const a = analyzeHighwayNeon(RICH, 'a.ts')
    const b = analyzeHighwayNeon(MINIMAL, 'b.ts')
    const s = analyzeHighwaySystem([a, b], '.')
    expect(s.avgLuminosity).toBe(54)
    expect(s.avgFlow).toBe(54)
    expect(s.avgEfficiency).toBe(54)
  })

  it('counts neon-boulevard and abandoned-road', () => {
    const a = analyzeHighwayNeon(RICH, 'a.ts')
    const b = analyzeHighwayNeon(MINIMAL, 'b.ts')
    const s = analyzeHighwaySystem([a, b], '.')
    expect(s.neonBoulevardCount).toBe(1)
    expect(s.abandonedRoadCount).toBe(1)
  })
})

// ─── Build Neon Highway Result ─────────────────────────────────────

describe('buildNeonHighwayResult', () => {
  it('returns empty result for no files', async () => {
    const r = await buildNeonHighwayResult([], [])
    expect(r.neons).toHaveLength(0)
    expect(r.systems).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.totalSystems).toBe(0)
    expect(r.network.overallPerformance).toBe(0)
    expect(r.network.isFlowing).toBe(false)
    expect(r.stats.engineerGrade).toBe('pothole')
  })

  it('returns single-file result for rich content', async () => {
    const r = await buildNeonHighwayResult(['rich.ts'], [RICH])
    expect(r.neons).toHaveLength(1)
    expect(r.systems).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.overallPerformance).toBe(100)
    expect(r.stats.engineerGrade).toBe('highway-engineer')
    expect(r.network.isFlowing).toBe(true)
  })

  it('computes multi-file averages', async () => {
    const r = await buildNeonHighwayResult(['a.ts', 'b.ts'], [RICH, MINIMAL])
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.avgLuminosity).toBe(54)
    expect(r.stats.avgTrafficFlow).toBe(54)
    expect(r.stats.avgLaneDiscipline).toBe(54)
    expect(r.stats.avgSignalQuality).toBe(54)
    expect(r.stats.avgRouteEfficiency).toBe(54)
    expect(r.stats.overallPerformance).toBe(54)
    expect(r.stats.engineerGrade).toBe('road-designer')
  })

  it('tracks best/smoothest/etc files', async () => {
    const r = await buildNeonHighwayResult(['a.ts', 'b.ts'], [RICH, MINIMAL])
    expect(r.stats.bestNeon).toBe('a.ts')
    expect(r.stats.brightest).toBe('a.ts')
    expect(r.stats.smoothest).toBe('a.ts')
    expect(r.stats.mostDisciplined).toBe('a.ts')
    expect(r.stats.clearest).toBe('a.ts')
  })

  it('groups files by directory', async () => {
    const r = await buildNeonHighwayResult(['src/a.ts', 'src/b.ts', 'test/c.ts'], [RICH, RICH, MINIMAL])
    expect(r.systems).toHaveLength(2)
  })

  it('computes condition counts', async () => {
    const r = await buildNeonHighwayResult(['a.ts', 'b.ts'], [RICH, MINIMAL])
    expect(r.stats.neonBoulevardCount).toBe(1)
    expect(r.stats.abandonedRoadCount).toBe(1)
  })

  it('computes high-count fields', async () => {
    const r = await buildNeonHighwayResult(['a.ts', 'b.ts'], [RICH, MINIMAL])
    expect(r.stats.hasHighLuminosityCount).toBe(1)
    expect(r.stats.hasHighQualityCount).toBe(1)
    expect(r.stats.hasHighDisciplineCount).toBe(1)
    expect(r.stats.hasHighSignalCount).toBe(1)
    expect(r.stats.hasHighEfficiencyCount).toBe(1)
  })

  it('returns empty file names for empty result', async () => {
    const r = await buildNeonHighwayResult([], [])
    expect(r.stats.bestNeon).toBe('')
    expect(r.stats.brightest).toBe('')
    expect(r.stats.smoothest).toBe('')
    expect(r.stats.mostDisciplined).toBe('')
    expect(r.stats.clearest).toBe('')
  })
})

// ─── Recommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns default recommendation for good code', async () => {
    const r = await buildNeonHighwayResult(['rich.ts'], [RICH])
    expect(r.recommendations).toHaveLength(1)
    expect(r.recommendations[0]).toContain('masterpiece')
  })

  it('returns many recommendations for empty code', async () => {
    const r = await buildNeonHighwayResult([], [])
    expect(r.recommendations.length).toBeGreaterThanOrEqual(5)
  })

  it('includes abandoned-road recommendation', async () => {
    const r = await buildNeonHighwayResult(['a.ts', 'b.ts'], [RICH, MINIMAL])
    const found = r.recommendations.some(rec => rec.includes('abandoned roads'))
    expect(found).toBe(true)
  })

  it('includes illuminate dark roads recommendation for few dead files', async () => {
    const r = await buildNeonHighwayResult(['a.ts', 'b.ts'], [RICH, MINIMAL])
    const found = r.recommendations.some(rec => rec.includes('Illuminate these dark roads'))
    expect(found).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grades', () => {
    expect(typeof colorGrade('neon-boulevard')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatNeonTable', () => {
  it('formats a single neon with labels', () => {
    const neon = analyzeHighwayNeon(RICH, 'test.ts')
    const result = formatNeonTable(neon)
    expect(result).toContain('File:')
    expect(result).toContain('Luminosity:')
    expect(result).toContain('Score:')
  })
})

describe('formatNeonsTable', () => {
  it('returns no neons message for empty array', () => {
    expect(formatNeonsTable([])).toContain('No highway neons found')
  })

  it('returns header and data for neons', () => {
    const neon = analyzeHighwayNeon(RICH, 'test.ts')
    const result = formatNeonsTable([neon])
    expect(result).toContain('Neon Highway Analysis')
  })
})

describe('formatSystemTable', () => {
  it('formats a system with labels', () => {
    const neon = analyzeHighwayNeon(RICH, 'test.ts')
    const system = analyzeHighwaySystem([neon], 'src')
    const result = formatSystemTable(system)
    expect(result).toContain('System:')
    expect(result).toContain('Type:')
    expect(result).toContain('Condition:')
  })
})

describe('formatSystemsTable', () => {
  it('returns no systems message for empty array', () => {
    expect(formatSystemsTable([])).toContain('No highway systems found')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all labels', async () => {
    const r = await buildNeonHighwayResult(['rich.ts'], [RICH])
    const result = formatStatsTable(r.stats)
    expect(result).toContain('Network Statistics')
    expect(result).toContain('Total Files:')
    expect(result).toContain('Engineer Grade:')
    expect(result).toContain('Best Neon:')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations message for empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations with bullets', () => {
    const result = formatRecommendations(['Fix X', 'Improve Y'])
    expect(result).toContain('Recommendations')
    expect(result).toContain('Fix X')
    expect(result).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const r = await buildNeonHighwayResult(['rich.ts'], [RICH])
    const result = formatResultTable(r)
    expect(result).toContain('Neon Highway Analysis')
    expect(result).toContain('Network Statistics')
    expect(result).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const r = await buildNeonHighwayResult(['rich.ts'], [RICH])
    const json = formatResultJson(r)
    const parsed = JSON.parse(json) as NeonHighwayResult
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── Gather Files ──────────────────────────────────────────────────

describe('gatherFiles', () => {
  it('returns sorted array', async () => {
    const files = await gatherFiles('.', ['.ts'], ['**/node_modules/**', '**/dist/**'])
    expect(Array.isArray(files)).toBe(true)
  })
})
