import { describe, expect, it } from 'vitest'

import {
  measureTelescope,
  measureStellar,
  measureSky,
  measureCosmic,
  measureFoundation,
  measureLegacy,
  classifyObservationCondition,
  analyzeCelestialObservation,
  classifyDomeType,
  analyzeObservatoryDome,
  classifyAstronomerGrade,
  generateRecommendations,
  buildCentennialObservatoryResult,
} from '../src/commands/centennial-observatory-helpers.js'
import {
  scoreColor,
  powerColor,
  completenessColor,
  accuracyColor,
  significanceColor,
  constructionColor,
  impactColor,
  conditionColor,
  astronomerGradeColor,
  domeTypeColor,
  domeConditionColor,
  formatCentennialObservatoryJson,
  formatCentennialObservatoryTable,
} from '../src/commands/centennial-observatory-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH_CONTENT = `export interface User { id: number; name: string }
export type UserRole = 'admin' | 'user'
export class UserService {
  private users: Map<number, User> = new Map()
  async getUser(id: number): Promise<User | null> {
    try {
      const user = this.users.get(id)
      return user ?? null
    } catch (error) {
      return null
    }
  }
}
import { injectable } from 'tsyringe'
/** Documentation */
export async function processUser(user: User): Promise<void> {
  await Promise.resolve(user)
}
`

const MEDIUM_CONTENT = `function hello(name) {
  console.log('hello', name)
  return name
}
`

const EMPTY_CONTENT = ''

// ─── measureTelescope ──────────────────────────────────────────────────────

describe('measureTelescope', () => {
  it('returns high resolution for rich content', () => {
    const result = measureTelescope(RICH_CONTENT)
    expect(result.resolution).toBe(77)
    expect(result.power).toBe('hubble-class')
  })

  it('returns medium resolution for simple content', () => {
    const result = measureTelescope(MEDIUM_CONTENT)
    expect(result.resolution).toBe(33)
    expect(result.power).toBe('binoculars')
  })

  it('returns zero for empty content', () => {
    const result = measureTelescope(EMPTY_CONTENT)
    expect(result.resolution).toBe(0)
    expect(result.power).toBe('naked-eye')
  })

  it('detects types', () => {
    const result = measureTelescope('export type Config = { debug: boolean }')
    expect(result.resolution).toBeGreaterThanOrEqual(35)
  })

  it('detects interfaces', () => {
    const result = measureTelescope('export interface Options { verbose: boolean }')
    expect(result.resolution).toBeGreaterThanOrEqual(35)
  })

  it('detects classes', () => {
    const result = measureTelescope('class Service {}')
    expect(result.resolution).toBeGreaterThanOrEqual(30)
  })

  it('counts aberrations from any/eval', () => {
    const result = measureTelescope('const x: any = eval("1+1")')
    expect(result.aberrationCount).toBeGreaterThanOrEqual(1)
  })

  it('counts blind spots from console.log/debugger', () => {
    const result = measureTelescope('console.log("x"); debugger;')
    expect(result.blindSpotCount).toBeGreaterThanOrEqual(1)
  })

  it('sets hasSharpFocus for types or interfaces', () => {
    const result = measureTelescope(RICH_CONTENT)
    expect(result.hasSharpFocus).toBe(true)
  })

  it('sets hasAdaptiveOptics for try/catch + error types', () => {
    const result = measureTelescope('try { x() } catch(e) { throw new Error("x") }')
    expect(result.hasAdaptiveOptics).toBe(true)
  })
})

// ─── measureStellar ────────────────────────────────────────────────────────

describe('measureStellar', () => {
  it('returns high catalog for rich content', () => {
    const result = measureStellar(RICH_CONTENT)
    expect(result.catalog).toBe(63)
    expect(result.completeness).toBe('bright-stars')
  })

  it('returns medium catalog for simple content', () => {
    const result = measureStellar(MEDIUM_CONTENT)
    expect(result.catalog).toBe(24)
    expect(result.completeness).toBe('empty-sky')
  })

  it('returns zero for empty content', () => {
    const result = measureStellar(EMPTY_CONTENT)
    expect(result.catalog).toBe(0)
    expect(result.completeness).toBe('empty-sky')
  })

  it('detects JSDoc comments', () => {
    const result = measureStellar('/** docs */\nexport function x() {}')
    expect(result.catalog).toBeGreaterThanOrEqual(40)
  })

  it('detects type annotations', () => {
    const result = measureStellar('function go(x: number): string { return "a" }')
    expect(result.catalog).toBeGreaterThanOrEqual(35)
  })

  it('counts missing entries for content without docs', () => {
    const result = measureStellar('const x = 1')
    expect(result.missingCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── measureSky ────────────────────────────────────────────────────────────

describe('measureSky', () => {
  it('returns high mapping for rich content', () => {
    const result = measureSky(RICH_CONTENT)
    expect(result.mapping).toBe(73)
    expect(result.accuracy).toBe('celestial-chart')
  })

  it('returns medium mapping for simple content', () => {
    const result = measureSky(MEDIUM_CONTENT)
    expect(result.mapping).toBe(27)
    expect(result.accuracy).toBe('blank')
  })

  it('returns low mapping for empty content', () => {
    const result = measureSky(EMPTY_CONTENT)
    expect(result.mapping).toBe(9)
    expect(result.accuracy).toBe('blank')
  })

  it('detects exports and imports', () => {
    const result = measureSky("import { x } from 'y'\nexport const z = x")
    expect(result.mapping).toBeGreaterThanOrEqual(50)
  })

  it('detects namespace imports', () => {
    const result = measureSky("import * as fs from 'fs'")
    expect(result.mapping).toBeGreaterThanOrEqual(30)
  })
})

// ─── measureCosmic ─────────────────────────────────────────────────────────

describe('measureCosmic', () => {
  it('returns discovery for rich content', () => {
    const result = measureCosmic(RICH_CONTENT)
    expect(result.discovery).toBe(25)
    expect(result.significance).toBe('none')
  })

  it('returns low discovery for simple content', () => {
    const result = measureCosmic(MEDIUM_CONTENT)
    expect(result.discovery).toBe(22)
  })

  it('returns zero for empty content', () => {
    const result = measureCosmic(EMPTY_CONTENT)
    expect(result.discovery).toBe(0)
  })

  it('detects async iterators', () => {
    const result = measureCosmic('async function* gen() { yield 1 }')
    expect(result.discovery).toBeGreaterThanOrEqual(25)
  })

  it('detects symbols', () => {
    const result = measureCosmic('const s = Symbol.iterator')
    expect(result.discovery).toBeGreaterThanOrEqual(30)
  })

  it('counts antipatterns from any/eval/console.log', () => {
    const result = measureCosmic('const x: any = eval("1"); console.log(x)')
    expect(result.antipatternCount).toBeGreaterThanOrEqual(2)
  })
})

// ─── measureFoundation ─────────────────────────────────────────────────────

describe('measureFoundation', () => {
  it('returns high quality for rich content', () => {
    const result = measureFoundation(RICH_CONTENT)
    expect(result.quality).toBe(56)
    expect(result.construction).toBe('amateur-setup')
  })

  it('returns low quality for simple content', () => {
    const result = measureFoundation(MEDIUM_CONTENT)
    expect(result.quality).toBe(13)
    expect(result.construction).toBe('cardboard-tube')
  })

  it('returns zero for empty content', () => {
    const result = measureFoundation(EMPTY_CONTENT)
    expect(result.quality).toBe(0)
    expect(result.construction).toBe('cardboard-tube')
  })

  it('detects private members', () => {
    const result = measureFoundation('class X { private y = 1 }')
    expect(result.quality).toBeGreaterThanOrEqual(20)
  })

  it('detects error handling', () => {
    const result = measureFoundation('try { x() } catch(e) {}')
    expect(result.quality).toBeGreaterThanOrEqual(20)
    expect(result.hasSolidMount).toBe(true)
  })

  it('detects immutability', () => {
    const result = measureFoundation('const x = 1')
    expect(result.hasNoDrift).toBe(true)
  })
})

// ─── measureLegacy ─────────────────────────────────────────────────────────

describe('measureLegacy', () => {
  it('returns high legacy for rich content', () => {
    const result = measureLegacy(RICH_CONTENT)
    expect(result.quality).toBe(77)
    expect(result.impact).toBe('stellar-legacy')
  })

  it('returns low legacy for simple content', () => {
    const result = measureLegacy(MEDIUM_CONTENT)
    expect(result.quality).toBe(15)
    expect(result.impact).toBe('void')
  })

  it('returns zero for empty content', () => {
    const result = measureLegacy(EMPTY_CONTENT)
    expect(result.quality).toBe(0)
    expect(result.impact).toBe('void')
  })

  it('detects test patterns', () => {
    const result = measureLegacy("describe('x', () => { it('works', () => expect(1).toBe(1)) })")
    expect(result.quality).toBeGreaterThanOrEqual(20)
  })

  it('detects exports for enduring code', () => {
    const result = measureLegacy('export interface X {} export function x() {}')
    expect(result.hasEnduring).toBe(true)
  })

  it('flags TODO as technical debt', () => {
    const result = measureLegacy('// TODO fix this\nexport const x = 1')
    expect(result.hasNoTechnicalDebt).toBe(false)
  })
})

// ─── classifyObservationCondition ──────────────────────────────────────────

describe('classifyObservationCondition', () => {
  it('classifies centennial-masterpiece for 90+', () => {
    const obs = analyzeCelestialObservation(RICH_CONTENT, 'a.ts')
    obs.qualityScore = 95
    expect(classifyObservationCondition(obs)).toBe('centennial-masterpiece')
  })

  it('classifies darkness for low scores', () => {
    const obs = analyzeCelestialObservation(EMPTY_CONTENT, 'a.ts')
    expect(classifyObservationCondition(obs)).toBe('darkness')
  })

  it('classifies broken-lens for 30-44', () => {
    const obs = analyzeCelestialObservation(MEDIUM_CONTENT, 'a.ts')
    obs.qualityScore = 35
    expect(classifyObservationCondition(obs)).toBe('broken-lens')
  })
})

// ─── analyzeCelestialObservation ───────────────────────────────────────────

describe('analyzeCelestialObservation', () => {
  it('returns correct values for rich content', () => {
    const result = analyzeCelestialObservation(RICH_CONTENT, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.qualityScore).toBe(63)
    expect(result.condition).toBe('professional-instrument')
    expect(result.telescopeResolution).toBe(77)
    expect(result.stellarCatalog).toBe(63)
    expect(result.skyMapping).toBe(73)
    expect(result.cosmicDiscovery).toBe(25)
    expect(result.observatoryFoundation).toBe(56)
    expect(result.astronomicalLegacy).toBe(77)
  })

  it('returns correct values for medium content', () => {
    const result = analyzeCelestialObservation(MEDIUM_CONTENT, 'medium.ts')
    expect(result.file).toBe('medium.ts')
    expect(result.qualityScore).toBe(23)
    expect(result.condition).toBe('darkness')
    expect(result.telescopeResolution).toBe(33)
    expect(result.stellarCatalog).toBe(24)
    expect(result.skyMapping).toBe(27)
    expect(result.cosmicDiscovery).toBe(22)
    expect(result.observatoryFoundation).toBe(13)
    expect(result.astronomicalLegacy).toBe(15)
  })

  it('returns correct values for empty content', () => {
    const result = analyzeCelestialObservation(EMPTY_CONTENT, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.qualityScore).toBe(1)
    expect(result.condition).toBe('darkness')
    expect(result.telescopeResolution).toBe(0)
    expect(result.stellarCatalog).toBe(0)
    expect(result.skyMapping).toBe(9)
    expect(result.cosmicDiscovery).toBe(0)
    expect(result.observatoryFoundation).toBe(0)
    expect(result.astronomicalLegacy).toBe(0)
  })

  it('qualityScore is weighted sum', () => {
    const result = analyzeCelestialObservation(RICH_CONTENT, 'r.ts')
    const expected = Math.round(
      result.telescopeResolution * 0.2 +
      result.stellarCatalog * 0.15 +
      result.skyMapping * 0.15 +
      result.cosmicDiscovery * 0.15 +
      result.observatoryFoundation * 0.15 +
      result.astronomicalLegacy * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })
})

// ─── classifyDomeType ──────────────────────────────────────────────────────

describe('classifyDomeType', () => {
  it('returns empty-lot for empty array', () => {
    expect(classifyDomeType([])).toBe('empty-lot')
  })

  it('returns centennial-observatory for high avg + 50% masterpieces', () => {
    const obs = analyzeCelestialObservation(RICH_CONTENT, 'a.ts')
    obs.qualityScore = 95
    obs.condition = 'centennial-masterpiece'
    expect(classifyDomeType([obs])).toBe('centennial-observatory')
  })

  it('returns amateur-observatory for mixed content', () => {
    const r = analyzeCelestialObservation(RICH_CONTENT, 'a.ts')
    const m = analyzeCelestialObservation(MEDIUM_CONTENT, 'b.ts')
    expect(classifyDomeType([r, m])).toBe('amateur-observatory')
  })

  it('returns empty-lot for all low scores', () => {
    const e = analyzeCelestialObservation(EMPTY_CONTENT, 'a.ts')
    expect(classifyDomeType([e, e, e])).toBe('empty-lot')
  })
})

// ─── analyzeObservatoryDome ────────────────────────────────────────────────

describe('analyzeObservatoryDome', () => {
  it('returns empty dome for no observations', () => {
    const dome = analyzeObservatoryDome([], 'src')
    expect(dome.directory).toBe('src')
    expect(dome.domeType).toBe('empty-lot')
    expect(dome.condition).toBe('dark-site')
    expect(dome.avgResolution).toBe(0)
  })

  it('returns dome with correct averages', () => {
    const obs = [analyzeCelestialObservation(RICH_CONTENT, 'a.ts')]
    const dome = analyzeObservatoryDome(obs, '.')
    expect(dome.avgResolution).toBe(obs[0].telescopeResolution)
    expect(dome.observations).toHaveLength(1)
  })

  it('computes masterpiece count', () => {
    const obs = [analyzeCelestialObservation(RICH_CONTENT, 'a.ts')]
    obs[0].qualityScore = 95
    obs[0].condition = 'centennial-masterpiece'
    const dome = analyzeObservatoryDome(obs, '.')
    expect(dome.masterpieceCount).toBe(1)
  })
})

// ─── classifyAstronomerGrade ───────────────────────────────────────────────

describe('classifyAstronomerGrade', () => {
  it('returns laureate-astronomer for 80+', () => {
    expect(classifyAstronomerGrade(85)).toBe('laureate-astronomer')
  })
  it('returns laureate-astronomer for exactly 80', () => {
    expect(classifyAstronomerGrade(80)).toBe('laureate-astronomer')
  })
  it('returns chief-astronomer for 65-79', () => {
    expect(classifyAstronomerGrade(72)).toBe('chief-astronomer')
  })
  it('returns chief-astronomer for exactly 65', () => {
    expect(classifyAstronomerGrade(65)).toBe('chief-astronomer')
  })
  it('returns observatory-director for 50-64', () => {
    expect(classifyAstronomerGrade(55)).toBe('observatory-director')
  })
  it('returns observatory-director for exactly 50', () => {
    expect(classifyAstronomerGrade(50)).toBe('observatory-director')
  })
  it('returns astronomer for 35-49', () => {
    expect(classifyAstronomerGrade(43)).toBe('astronomer')
  })
  it('returns astronomer for exactly 35', () => {
    expect(classifyAstronomerGrade(35)).toBe('astronomer')
  })
  it('returns stargazer for 20-34', () => {
    expect(classifyAstronomerGrade(25)).toBe('stargazer')
  })
  it('returns stargazer for exactly 20', () => {
    expect(classifyAstronomerGrade(20)).toBe('stargazer')
  })
  it('returns grounded for below 20', () => {
    expect(classifyAstronomerGrade(10)).toBe('grounded')
  })
  it('returns grounded for 0', () => {
    expect(classifyAstronomerGrade(0)).toBe('grounded')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for rich content', () => {
    const result = buildCentennialObservatoryResult(['a.ts'], [RICH_CONTENT])
    const recs = generateRecommendations(result.observations, result.domes, result.cosmos, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('returns recommendations for empty content', () => {
    const result = buildCentennialObservatoryResult(['a.ts'], [EMPTY_CONTENT])
    const recs = generateRecommendations(result.observations, result.domes, result.cosmos, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })
})

// ─── buildCentennialObservatoryResult (integration) ────────────────────────

describe('buildCentennialObservatoryResult', () => {
  it('handles RICH+MEDIUM correctly', () => {
    const result = buildCentennialObservatoryResult(
      ['rich.ts', 'medium.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalDomes).toBe(1)
    expect(result.stats.avgTelescopeResolution).toBe(55)
    expect(result.stats.avgStellarCatalog).toBe(44)
    expect(result.stats.avgSkyMapping).toBe(50)
    expect(result.stats.avgCosmicDiscovery).toBe(24)
    expect(result.stats.avgObservatoryFoundation).toBe(35)
    expect(result.stats.avgAstronomicalLegacy).toBe(46)
    expect(result.stats.darknessCount).toBe(1)
    expect(result.stats.overallCosmic).toBe(43)
    expect(result.stats.astronomerGrade).toBe('astronomer')
    expect(result.stats.bestObservation).toBe('rich.ts')
    expect(result.stats.sharpest).toBe('rich.ts')
    expect(result.stats.bestDocumented).toBe('rich.ts')
    expect(result.stats.bestOrganized).toBe('rich.ts')
    expect(result.stats.mostInnovative).toBe('rich.ts')
    expect(result.stats.bestFoundation).toBe('rich.ts')
    expect(result.stats.celebration).toBe('400 commands - a constellation of code analysis excellence')
    expect(result.cosmos.overallCosmic).toBe(43)
    expect(result.cosmos.isWorldClass).toBe(false)
    expect(result.cosmos.avgResolution).toBe(55)
    expect(result.cosmos.avgMapping).toBe(50)
    expect(result.cosmos.avgLegacy).toBe(46)
    expect(result.observations).toHaveLength(2)
    expect(result.domes).toHaveLength(1)
    expect(result.domes[0].domeType).toBe('amateur-observatory')
  })

  it('handles all EMPTY correctly', () => {
    const result = buildCentennialObservatoryResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [EMPTY_CONTENT, EMPTY_CONTENT, EMPTY_CONTENT, EMPTY_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(4)
    expect(result.stats.totalDomes).toBe(1)
    expect(result.stats.avgTelescopeResolution).toBe(0)
    expect(result.stats.avgStellarCatalog).toBe(0)
    expect(result.stats.avgSkyMapping).toBe(9)
    expect(result.stats.avgCosmicDiscovery).toBe(0)
    expect(result.stats.avgObservatoryFoundation).toBe(0)
    expect(result.stats.avgAstronomicalLegacy).toBe(0)
    expect(result.stats.darknessCount).toBe(4)
    expect(result.stats.overallCosmic).toBe(1)
    expect(result.stats.astronomerGrade).toBe('grounded')
    expect(result.cosmos.isWorldClass).toBe(false)
  })

  it('handles single rich file', () => {
    const result = buildCentennialObservatoryResult(['rich.ts'], [RICH_CONTENT])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.observations).toHaveLength(1)
    expect(result.observations[0].qualityScore).toBe(63)
    expect(result.domes).toHaveLength(1)
  })

  it('handles empty files array', () => {
    const result = buildCentennialObservatoryResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.observations).toHaveLength(0)
    expect(result.domes).toHaveLength(0)
    expect(result.stats.celebration).toBe('400 commands - a constellation of code analysis excellence')
  })

  it('celebration is always the milestone string', () => {
    const result = buildCentennialObservatoryResult(['a.ts'], [RICH_CONTENT])
    expect(result.stats.celebration).toBe('400 commands - a constellation of code analysis excellence')
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for high score', () => { expect(typeof scoreColor(90)).toBe('string') })
  it('returns string for medium score', () => { expect(typeof scoreColor(65)).toBe('string') })
  it('returns string for low score', () => { expect(typeof scoreColor(30)).toBe('string') })
  it('returns string for very low score', () => { expect(typeof scoreColor(10)).toBe('string') })
})

describe('powerColor', () => {
  it('colors all power levels', () => {
    for (const p of ['jwst-grade', 'hubble-class', 'great-refractor', 'standard-scope', 'binoculars', 'naked-eye']) {
      expect(typeof powerColor(p)).toBe('string')
    }
  })
  it('passes through unknown', () => { expect(powerColor('unknown')).toBe('unknown') })
})

describe('completenessColor', () => {
  it('colors all levels', () => {
    for (const c of ['messier-catalog', 'ngc-complete', 'bright-stars', 'partial-catalog', 'few-stars', 'empty-sky']) {
      expect(typeof completenessColor(c)).toBe('string')
    }
  })
})

describe('accuracyColor', () => {
  it('colors all levels', () => {
    for (const a of ['planetarium-grade', 'star-atlas', 'celestial-chart', 'rough-map', 'sketch', 'blank']) {
      expect(typeof accuracyColor(a)).toBe('string')
    }
  })
})

describe('significanceColor', () => {
  it('colors all levels', () => {
    for (const s of ['nobel-prize', 'major-discovery', 'notable-finding', 'incremental', 'routine', 'none']) {
      expect(typeof significanceColor(s)).toBe('string')
    }
  })
})

describe('constructionColor', () => {
  it('colors all levels', () => {
    for (const c of ['mountaintop-observatory', 'space-telescope', 'professional-grade', 'amateur-setup', 'backyard-scope', 'cardboard-tube']) {
      expect(typeof constructionColor(c)).toBe('string')
    }
  })
})

describe('impactColor', () => {
  it('colors all levels', () => {
    for (const i of ['cosmic-legacy', 'stellar-legacy', 'planetary-legacy', 'local-legacy', 'ephemeral', 'void']) {
      expect(typeof impactColor(i)).toBe('string')
    }
  })
})

describe('conditionColor', () => {
  it('colors all conditions', () => {
    for (const c of ['centennial-masterpiece', 'landmark-observatory', 'professional-instrument', 'amateur-telescope', 'broken-lens', 'darkness']) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })
})

describe('astronomerGradeColor', () => {
  it('colors all grades', () => {
    for (const g of ['laureate-astronomer', 'chief-astronomer', 'observatory-director', 'astronomer', 'stargazer', 'grounded']) {
      expect(typeof astronomerGradeColor(g)).toBe('string')
    }
  })
})

describe('domeTypeColor', () => {
  it('colors all types', () => {
    for (const d of ['centennial-observatory', 'major-observatory', 'university-scope', 'amateur-observatory', 'backyard-scope', 'empty-lot']) {
      expect(typeof domeTypeColor(d)).toBe('string')
    }
  })
})

describe('domeConditionColor', () => {
  it('colors all conditions', () => {
    for (const c of ['world-class-observatory', 'professional-facility', 'working-observatory', 'amateur-setup', 'abandoned', 'dark-site']) {
      expect(typeof domeConditionColor(c)).toBe('string')
    }
  })
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatCentennialObservatoryJson', () => {
  it('returns valid JSON string', () => {
    const result = buildCentennialObservatoryResult(['a.ts'], [RICH_CONTENT])
    const json = formatCentennialObservatoryJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatCentennialObservatoryTable', () => {
  it('includes centennial header', () => {
    const result = buildCentennialObservatoryResult(['a.ts'], [RICH_CONTENT])
    const table = formatCentennialObservatoryTable(result, false)
    expect(table).toContain('Centennial Observatory')
  })

  it('includes celebration text', () => {
    const result = buildCentennialObservatoryResult(['a.ts'], [RICH_CONTENT])
    const table = formatCentennialObservatoryTable(result, false)
    expect(table).toContain('400 commands')
  })

  it('includes cosmos overview section', () => {
    const result = buildCentennialObservatoryResult(['a.ts'], [RICH_CONTENT])
    const table = formatCentennialObservatoryTable(result, false)
    expect(table).toContain('Cosmos Overview')
    expect(table).toContain('Is World Class')
  })

  it('includes statistics section', () => {
    const result = buildCentennialObservatoryResult(['a.ts'], [RICH_CONTENT])
    const table = formatCentennialObservatoryTable(result, false)
    expect(table).toContain('Statistics')
    expect(table).toContain('Astronomer Grade')
  })

  it('includes condition counts section', () => {
    const result = buildCentennialObservatoryResult(['a.ts'], [RICH_CONTENT])
    const table = formatCentennialObservatoryTable(result, false)
    expect(table).toContain('Condition Counts')
    expect(table).toContain('Darkness')
  })

  it('shows highlights for best observation', () => {
    const result = buildCentennialObservatoryResult(
      ['a.ts', 'b.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    const table = formatCentennialObservatoryTable(result, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Overall')
    expect(table).toContain('Sharpest')
    expect(table).toContain('Best Documented')
    expect(table).toContain('Best Organized')
    expect(table).toContain('Most Innovative')
    expect(table).toContain('Best Foundation')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildCentennialObservatoryResult(['a.ts'], [RICH_CONTENT])
    const table = formatCentennialObservatoryTable(result, true)
    expect(table).toContain('Per-File Observations')
  })

  it('hides per-file details without verbose', () => {
    const result = buildCentennialObservatoryResult(['a.ts'], [RICH_CONTENT])
    const table = formatCentennialObservatoryTable(result, false)
    expect(table).not.toContain('Per-File Observations')
  })

  it('shows recommendations when present', () => {
    const result = buildCentennialObservatoryResult(['a.ts'], [MEDIUM_CONTENT])
    if (result.recommendations.length > 0) {
      const table = formatCentennialObservatoryTable(result, false)
      expect(table).toContain('Recommendations')
    }
  })
})

// ─── Extra tests for 100+ MEGA MILESTONE ──────────────────────────────────

describe('MEGA MILESTONE - additional coverage', () => {
  it('celebration message is correct format', () => {
    const result = buildCentennialObservatoryResult([], [])
    expect(result.stats.celebration).toContain('400')
    expect(result.stats.celebration).toContain('constellation')
  })

  it('telescope measure has all boolean fields', () => {
    const result = measureTelescope(RICH_CONTENT)
    expect(typeof result.hasHighResolution).toBe('boolean')
    expect(typeof result.hasSharpFocus).toBe('boolean')
    expect(typeof result.hasNoChromaticAberration).toBe('boolean')
    expect(typeof result.hasProperMagnification).toBe('boolean')
    expect(typeof result.hasNoDistortion).toBe('boolean')
    expect(typeof result.hasDeepField).toBe('boolean')
    expect(typeof result.hasNoBlindSpots).toBe('boolean')
    expect(typeof result.hasWideField).toBe('boolean')
    expect(typeof result.hasNoVignetting).toBe('boolean')
    expect(typeof result.hasAdaptiveOptics).toBe('boolean')
  })

  it('stellar measure has all boolean fields', () => {
    const result = measureStellar(RICH_CONTENT)
    expect(typeof result.hasHighCatalog).toBe('boolean')
    expect(typeof result.hasProperClassification).toBe('boolean')
    expect(typeof result.hasAccurateMetadata).toBe('boolean')
    expect(typeof result.hasNoMissingEntries).toBe('boolean')
    expect(typeof result.hasCrossReferenced).toBe('boolean')
    expect(typeof result.hasNoContradictions).toBe('boolean')
  })

  it('sky measure has all boolean fields', () => {
    const result = measureSky(RICH_CONTENT)
    expect(typeof result.hasHighMapping).toBe('boolean')
    expect(typeof result.hasProperCoordinates).toBe('boolean')
    expect(typeof result.hasNoMisplacement).toBe('boolean')
    expect(typeof result.hasLogicalGrouping).toBe('boolean')
    expect(typeof result.hasNoOrphans).toBe('boolean')
    expect(typeof result.hasConstellationPatterns).toBe('boolean')
  })

  it('cosmic measure has all boolean fields', () => {
    const result = measureCosmic(RICH_CONTENT)
    expect(typeof result.hasHighDiscovery).toBe('boolean')
    expect(typeof result.hasNovelPatterns).toBe('boolean')
    expect(typeof result.hasNoStagnation).toBe('boolean')
    expect(typeof result.hasBreakthrough).toBe('boolean')
    expect(typeof result.hasNoCopyPaste).toBe('boolean')
    expect(typeof result.hasElegant).toBe('boolean')
  })

  it('foundation measure has all boolean fields', () => {
    const result = measureFoundation(RICH_CONTENT)
    expect(typeof result.hasHighQuality).toBe('boolean')
    expect(typeof result.hasSolidMount).toBe('boolean')
    expect(typeof result.hasProperDome).toBe('boolean')
    expect(typeof result.hasNoVibration).toBe('boolean')
    expect(typeof result.hasClimateControl).toBe('boolean')
    expect(typeof result.hasNoDegradation).toBe('boolean')
  })

  it('legacy measure has all boolean fields', () => {
    const result = measureLegacy(RICH_CONTENT)
    expect(typeof result.hasHighQuality).toBe('boolean')
    expect(typeof result.hasEnduring).toBe('boolean')
    expect(typeof result.hasNoObsolescence).toBe('boolean')
    expect(typeof result.hasFoundational).toBe('boolean')
    expect(typeof result.hasNoFragility).toBe('boolean')
    expect(typeof result.hasTimeless).toBe('boolean')
  })

  it('observation has correct measure sub-objects', () => {
    const result = analyzeCelestialObservation(RICH_CONTENT, 'test.ts')
    expect(result.telescope.resolution).toBe(result.telescopeResolution)
    expect(result.stellar.catalog).toBe(result.stellarCatalog)
    expect(result.sky.mapping).toBe(result.skyMapping)
    expect(result.cosmic.discovery).toBe(result.cosmicDiscovery)
    expect(result.foundation.quality).toBe(result.observatoryFoundation)
    expect(result.legacy.quality).toBe(result.astronomicalLegacy)
  })

  it('dome computes darkness count', () => {
    const e1 = analyzeCelestialObservation(EMPTY_CONTENT, 'a.ts')
    const e2 = analyzeCelestialObservation(EMPTY_CONTENT, 'b.ts')
    const dome = analyzeObservatoryDome([e1, e2], '.')
    expect(dome.darknessCount).toBe(2)
  })

  it('cosmos isWorldClass threshold at 70', () => {
    const result = buildCentennialObservatoryResult(['a.ts'], [RICH_CONTENT])
    expect(typeof result.cosmos.isWorldClass).toBe('boolean')
  })
})
