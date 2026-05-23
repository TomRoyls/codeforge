import { describe, it, expect } from 'vitest'
import {
  measureBrilliant,
  measureGateway,
  measureRoad,
  measureWizardry,
  measureSplendor,
  measureHomecoming,
  analyzeEmeraldTower,
  classifyCondition,
  classifyDistrictType,
  classifyDistrictCondition,
  classifyWizardGrade,
  buildEmeraldCityResult,
} from '../src/commands/emerald-city-helpers.js'
import {
  scoreColor,
  radianceColor,
  entranceColor,
  pathColor,
  magicColor,
  beautyColor,
  welcomeColor,
  conditionColor,
  wizardGradeColor,
  formatEmeraldCityJson,
  formatEmeraldCityTable,
} from '../src/commands/emerald-city-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `import { readFileSync } from 'node:fs'

/**
 * Documentation
 */
export interface Data {
  value: number
  name: string
}

export class Processor {
  private data: Data[] = []

  async process(input?: string): Promise<Data[]> {
    try {
      const result = input ?? 'default'
      return this.data
    } catch (e) {
      throw e
    }
  }
}

export type Result = Data | null
`

const EMPTY = ''
const POOR = 'var x = 1\nany\nvar y = 2'

// ─── measureBrilliant ──────────────────────────────────────────────────────

describe('measureBrilliant', () => {
  it('returns excellence 77 for RICH', () => {
    expect(measureBrilliant(RICH).excellence).toBe(77)
  })
  it('returns shining-bright for RICH', () => {
    expect(measureBrilliant(RICH).radiance).toBe('shining-bright')
  })
  it('has hasHighExcellence true for RICH', () => {
    expect(measureBrilliant(RICH).hasHighExcellence).toBe(true)
  })
  it('has hasOutstanding true for RICH', () => {
    expect(measureBrilliant(RICH).hasOutstanding).toBe(true)
  })
  it('has hasExceptional true for RICH', () => {
    expect(measureBrilliant(RICH).hasExceptional).toBe(true)
  })
  it('has hasSuperb true for RICH', () => {
    expect(measureBrilliant(RICH).hasSuperb).toBe(true)
  })
  it('has hasStellar false for RICH', () => {
    expect(measureBrilliant(RICH).hasStellar).toBe(false)
  })
  it('returns 0 for EMPTY', () => {
    expect(measureBrilliant(EMPTY).excellence).toBe(0)
  })
  it('returns dark for EMPTY', () => {
    expect(measureBrilliant(EMPTY).radiance).toBe('dark')
  })
  it('detects mediocrityCount 2 for POOR', () => {
    expect(measureBrilliant(POOR).mediocrityCount).toBe(2)
  })
  it('detects subparCount 1 for POOR', () => {
    expect(measureBrilliant(POOR).subparCount).toBe(1)
  })
  it('hasNoMediocrity false for POOR', () => {
    expect(measureBrilliant(POOR).hasNoMediocrity).toBe(false)
  })
})

// ─── measureGateway ────────────────────────────────────────────────────────

describe('measureGateway', () => {
  it('returns quality 100 for RICH', () => {
    expect(measureGateway(RICH).quality).toBe(100)
  })
  it('returns golden-gates for RICH', () => {
    expect(measureGateway(RICH).entrance).toBe('golden-gates')
  })
  it('has hasHighQuality true for RICH', () => {
    expect(measureGateway(RICH).hasHighQuality).toBe(true)
  })
  it('has hasCleanAPI true for RICH', () => {
    expect(measureGateway(RICH).hasCleanAPI).toBe(true)
  })
  it('has hasDocumented true for RICH', () => {
    expect(measureGateway(RICH).hasDocumented).toBe(true)
  })
  it('has hasConsistent false for RICH (no generics)', () => {
    expect(measureGateway(RICH).hasConsistent).toBe(false)
  })
  it('returns 0 for EMPTY', () => {
    expect(measureGateway(EMPTY).quality).toBe(0)
  })
  it('returns walled-off for EMPTY', () => {
    expect(measureGateway(EMPTY).entrance).toBe('walled-off')
  })
  it('detects complexityCount 2 for POOR', () => {
    expect(measureGateway(POOR).complexityCount).toBe(2)
  })
  it('detects barrierCount 1 for POOR', () => {
    expect(measureGateway(POOR).barrierCount).toBe(1)
  })
})

// ─── measureRoad ────────────────────────────────────────────────────────────

describe('measureRoad', () => {
  it('returns clarity 73 for RICH', () => {
    expect(measureRoad(RICH).clarity).toBe(73)
  })
  it('returns clear-road for RICH', () => {
    expect(measureRoad(RICH).path).toBe('clear-road')
  })
  it('has hasHighClarity true for RICH', () => {
    expect(measureRoad(RICH).hasHighClarity).toBe(true)
  })
  it('has hasClearPath true for RICH', () => {
    expect(measureRoad(RICH).hasClearPath).toBe(true)
  })
  it('has hasWellMarked true for RICH', () => {
    expect(measureRoad(RICH).hasWellMarked).toBe(true)
  })
  it('returns 0 for EMPTY', () => {
    expect(measureRoad(EMPTY).clarity).toBe(0)
  })
  it('returns maze for EMPTY', () => {
    expect(measureRoad(EMPTY).path).toBe('maze')
  })
  it('detects obfuscationCount 2 for POOR', () => {
    expect(measureRoad(POOR).obfuscationCount).toBe(2)
  })
  it('detects deadEndCount 1 for POOR', () => {
    expect(measureRoad(POOR).deadEndCount).toBe(1)
  })
})

// ─── measureWizardry ────────────────────────────────────────────────────────

describe('measureWizardry', () => {
  it('returns cleverness 62 for RICH', () => {
    expect(measureWizardry(RICH).cleverness).toBe(62)
  })
  it('returns skilled-mage for RICH', () => {
    expect(measureWizardry(RICH).magic).toBe('skilled-mage')
  })
  it('has hasHighCleverness false for RICH', () => {
    expect(measureWizardry(RICH).hasHighCleverness).toBe(false)
  })
  it('has hasElegant true for RICH', () => {
    expect(measureWizardry(RICH).hasElegant).toBe(true)
  })
  it('has hasResourceful true for RICH', () => {
    expect(measureWizardry(RICH).hasResourceful).toBe(true)
  })
  it('has hasNoDarkMagic true for RICH', () => {
    expect(measureWizardry(RICH).hasNoDarkMagic).toBe(true)
  })
  it('returns 0 for EMPTY', () => {
    expect(measureWizardry(EMPTY).cleverness).toBe(0)
  })
  it('returns muggle for EMPTY', () => {
    expect(measureWizardry(EMPTY).magic).toBe('muggle')
  })
  it('detects dullCount 2 for POOR', () => {
    expect(measureWizardry(POOR).dullCount).toBe(2)
  })
  it('detects overCleverCount 1 for POOR', () => {
    expect(measureWizardry(POOR).overCleverCount).toBe(1)
  })
})

// ─── measureSplendor ────────────────────────────────────────────────────────

describe('measureSplendor', () => {
  it('returns visual 87 for RICH', () => {
    expect(measureSplendor(RICH).visual).toBe(87)
  })
  it('returns emerald-splendor for RICH', () => {
    expect(measureSplendor(RICH).beauty).toBe('emerald-splendor')
  })
  it('has hasHighVisual true for RICH', () => {
    expect(measureSplendor(RICH).hasHighVisual).toBe(true)
  })
  it('has hasOrganized true for RICH', () => {
    expect(measureSplendor(RICH).hasOrganized).toBe(true)
  })
  it('has hasFormatted true for RICH', () => {
    expect(measureSplendor(RICH).hasFormatted).toBe(true)
  })
  it('has hasNoMessiness true for RICH', () => {
    expect(measureSplendor(RICH).hasNoMessiness).toBe(true)
  })
  it('returns 0 for EMPTY', () => {
    expect(measureSplendor(EMPTY).visual).toBe(0)
  })
  it('returns ugly for EMPTY', () => {
    expect(measureSplendor(EMPTY).beauty).toBe('ugly')
  })
  it('detects messinessCount 2 for POOR', () => {
    expect(measureSplendor(POOR).messinessCount).toBe(2)
  })
  it('detects clutterCount 1 for POOR', () => {
    expect(measureSplendor(POOR).clutterCount).toBe(1)
  })
})

// ─── measureHomecoming ──────────────────────────────────────────────────────

describe('measureHomecoming', () => {
  it('returns maintainability 100 for RICH', () => {
    expect(measureHomecoming(RICH).maintainability).toBe(100)
  })
  it('returns theres-no-place-like-home for RICH', () => {
    expect(measureHomecoming(RICH).welcome).toBe('theres-no-place-like-home')
  })
  it('has hasHighMaintainability true for RICH', () => {
    expect(measureHomecoming(RICH).hasHighMaintainability).toBe(true)
  })
  it('has hasMaintainable true for RICH', () => {
    expect(measureHomecoming(RICH).hasMaintainable).toBe(true)
  })
  it('has hasTestable true for RICH', () => {
    expect(measureHomecoming(RICH).hasTestable).toBe(true)
  })
  it('has hasNoSpaghetti true for RICH', () => {
    expect(measureHomecoming(RICH).hasNoSpaghetti).toBe(true)
  })
  it('returns 0 for EMPTY', () => {
    expect(measureHomecoming(EMPTY).maintainability).toBe(0)
  })
  it('returns no-way-back for EMPTY', () => {
    expect(measureHomecoming(EMPTY).welcome).toBe('no-way-back')
  })
  it('detects spaghettiCount 2 for POOR', () => {
    expect(measureHomecoming(POOR).spaghettiCount).toBe(2)
  })
  it('detects couplingCount 1 for POOR', () => {
    expect(measureHomecoming(POOR).couplingCount).toBe(1)
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns emerald-palace for 90', () => expect(classifyCondition(90)).toBe('emerald-palace'))
  it('returns crystal-tower for 75', () => expect(classifyCondition(75)).toBe('crystal-tower'))
  it('returns jade-pavilion for 60', () => expect(classifyCondition(60)).toBe('jade-pavilion'))
  it('returns stone-building for 45', () => expect(classifyCondition(45)).toBe('stone-building'))
  it('returns wooden-shack for 30', () => expect(classifyCondition(30)).toBe('wooden-shack'))
  it('returns ruins for 10', () => expect(classifyCondition(10)).toBe('ruins'))
})

// ─── classifyWizardGrade ────────────────────────────────────────────────────

describe('classifyWizardGrade', () => {
  it('returns wizard-of-oz for 85', () => expect(classifyWizardGrade(85)).toBe('wizard-of-oz'))
  it('returns good-witch for 70', () => expect(classifyWizardGrade(70)).toBe('good-witch'))
  it('returns munchkin-elder for 55', () => expect(classifyWizardGrade(55)).toBe('munchkin-elder'))
  it('returns traveler for 40', () => expect(classifyWizardGrade(40)).toBe('traveler'))
  it('returns lost-soul for 25', () => expect(classifyWizardGrade(25)).toBe('lost-soul'))
  it('returns wicked-witch for 10', () => expect(classifyWizardGrade(10)).toBe('wicked-witch'))
})

// ─── classifyDistrictCondition ──────────────────────────────────────────────

describe('classifyDistrictCondition', () => {
  it('returns magnificent-city for 80', () => expect(classifyDistrictCondition(80)).toBe('magnificent-city'))
  it('returns beautiful-district for 65', () => expect(classifyDistrictCondition(65)).toBe('beautiful-district'))
  it('returns pleasant-quarter for 50', () => expect(classifyDistrictCondition(50)).toBe('pleasant-quarter'))
  it('returns fading-glory for 35', () => expect(classifyDistrictCondition(35)).toBe('fading-glory'))
  it('returns crumbling for 20', () => expect(classifyDistrictCondition(20)).toBe('crumbling'))
  it('returns ruined for 10', () => expect(classifyDistrictCondition(10)).toBe('ruined'))
})

// ─── analyzeEmeraldTower ────────────────────────────────────────────────────

describe('analyzeEmeraldTower', () => {
  it('returns qualityScore 84 for RICH', () => {
    expect(analyzeEmeraldTower(RICH, 'rich.ts').qualityScore).toBe(84)
  })
  it('returns crystal-tower condition for RICH', () => {
    expect(analyzeEmeraldTower(RICH, 'rich.ts').condition).toBe('crystal-tower')
  })
  it('stores file path', () => {
    expect(analyzeEmeraldTower(RICH, 'a.ts').file).toBe('a.ts')
  })
  it('returns brilliance 77 for RICH', () => {
    expect(analyzeEmeraldTower(RICH, 'r.ts').brilliance).toBe(77)
  })
  it('returns gatewayQuality 100 for RICH', () => {
    expect(analyzeEmeraldTower(RICH, 'r.ts').gatewayQuality).toBe(100)
  })
  it('returns yellowBrickRoad 73 for RICH', () => {
    expect(analyzeEmeraldTower(RICH, 'r.ts').yellowBrickRoad).toBe(73)
  })
  it('returns ozWizardry 62 for RICH', () => {
    expect(analyzeEmeraldTower(RICH, 'r.ts').ozWizardry).toBe(62)
  })
  it('returns emeraldSplendor 87 for RICH', () => {
    expect(analyzeEmeraldTower(RICH, 'r.ts').emeraldSplendor).toBe(87)
  })
  it('returns homecomingQuality 100 for RICH', () => {
    expect(analyzeEmeraldTower(RICH, 'r.ts').homecomingQuality).toBe(100)
  })
  it('returns ruins for POOR', () => {
    expect(analyzeEmeraldTower(POOR, 'p.ts').condition).toBe('ruins')
  })
})

// ─── classifyDistrictType ───────────────────────────────────────────────────

describe('classifyDistrictType', () => {
  it('returns wasteland for empty towers', () => {
    expect(classifyDistrictType([])).toBe('wasteland')
  })
  it('returns noble-quarter for RICH tower', () => {
    const tower = analyzeEmeraldTower(RICH, 'a.ts')
    expect(classifyDistrictType([tower])).toBe('noble-quarter')
  })
})

// ─── buildEmeraldCityResult ─────────────────────────────────────────────────

describe('buildEmeraldCityResult', () => {
  it('returns totalFiles 2 for two files', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.totalFiles).toBe(2)
  })
  it('computes avgBrilliance 39', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgBrilliance).toBe(39)
  })
  it('computes avgGatewayQuality 54', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgGatewayQuality).toBe(54)
  })
  it('computes avgYellowBrickRoad 37', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgYellowBrickRoad).toBe(37)
  })
  it('computes avgOzWizardry 31', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgOzWizardry).toBe(31)
  })
  it('computes avgEmeraldSplendor 44', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgEmeraldSplendor).toBe(44)
  })
  it('computes avgHomecomingQuality 50', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgHomecomingQuality).toBe(50)
  })
  it('computes overallSplendor 42', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.overallSplendor).toBe(42)
  })
  it('returns traveler grade for overallSplendor 42', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.wizardGrade).toBe('traveler')
  })
  it('returns bestTower as rich.ts', () => {
    expect(buildEmeraldCityResult(['rich.ts', 'poor.ts'], [RICH, POOR]).stats.bestTower).toBe('rich.ts')
  })
  it('counts crystalTowerCount correctly', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.crystalTowerCount).toBe(1)
  })
  it('counts ruinsCount correctly', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.ruinsCount).toBe(1)
  })
  it('counts hasHighExcellenceCount correctly', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighExcellenceCount).toBe(1)
  })
  it('counts hasHighQualityCount correctly', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighQualityCount).toBe(1)
  })
  it('counts hasHighClarityCount correctly', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighClarityCount).toBe(1)
  })
  it('counts hasHighVisualCount correctly', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighVisualCount).toBe(1)
  })
  it('counts hasHighMaintainabilityCount correctly', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighMaintainabilityCount).toBe(1)
  })
  it('sets kingdom.isMagnificent false', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).kingdom.isMagnificent).toBe(false)
  })
  it('generates recommendations', () => {
    const recs = buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).recommendations
    expect(recs.length).toBeGreaterThan(0)
  })
  it('handles empty input', () => {
    const r = buildEmeraldCityResult([], [])
    expect(r.stats.totalFiles).toBe(0)
    expect(r.kingdom.overallSplendor).toBe(0)
    expect(r.stats.wizardGrade).toBe('wicked-witch')
  })
  it('creates districts by directory', () => {
    const r = buildEmeraldCityResult(['a/rich.ts', 'b/poor.ts'], [RICH, POOR])
    expect(r.districts.length).toBe(2)
  })
  it('sets kingdom.avgBrilliance correctly', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).kingdom.avgBrilliance).toBe(39)
  })
  it('sets kingdom.avgRoadClarity correctly', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).kingdom.avgRoadClarity).toBe(37)
  })
  it('sets kingdom.avgHomecoming correctly', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).kingdom.avgHomecoming).toBe(50)
  })
  it('sets kingdom.overallSplendor correctly', () => {
    expect(buildEmeraldCityResult(['a.ts', 'b.ts'], [RICH, POOR]).kingdom.overallSplendor).toBe(42)
  })
  it('returns celebration string', () => {
    const r = buildEmeraldCityResult(['a.ts'], [RICH])
    expect(r.stats.celebration).toBe('420 commands - an emerald city of code analysis excellence')
  })
  it('returns mostBrilliant correctly', () => {
    expect(buildEmeraldCityResult(['rich.ts', 'poor.ts'], [RICH, POOR]).stats.mostBrilliant).toBe('rich.ts')
  })
  it('returns bestGateway correctly', () => {
    expect(buildEmeraldCityResult(['rich.ts', 'poor.ts'], [RICH, POOR]).stats.bestGateway).toBe('rich.ts')
  })
  it('returns clearestPath correctly', () => {
    expect(buildEmeraldCityResult(['rich.ts', 'poor.ts'], [RICH, POOR]).stats.clearestPath).toBe('rich.ts')
  })
  it('returns mostClever correctly', () => {
    expect(buildEmeraldCityResult(['rich.ts', 'poor.ts'], [RICH, POOR]).stats.mostClever).toBe('rich.ts')
  })
  it('returns mostSplendid correctly', () => {
    expect(buildEmeraldCityResult(['rich.ts', 'poor.ts'], [RICH, POOR]).stats.mostSplendid).toBe('rich.ts')
  })
  it('celebration is always set even for empty', () => {
    const r = buildEmeraldCityResult([], [])
    expect(r.stats.celebration).toBe('420 commands - an emerald city of code analysis excellence')
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string for high score', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })
  it('scoreColor returns string for low score', () => {
    expect(typeof scoreColor(20)).toBe('string')
  })
  it('radianceColor returns string for blinding-brilliance', () => {
    expect(typeof radianceColor('blinding-brilliance')).toBe('string')
  })
  it('entranceColor returns string for golden-gates', () => {
    expect(typeof entranceColor('golden-gates')).toBe('string')
  })
  it('pathColor returns string for golden-path', () => {
    expect(typeof pathColor('golden-path')).toBe('string')
  })
  it('magicColor returns string for grand-wizard', () => {
    expect(typeof magicColor('grand-wizard')).toBe('string')
  })
  it('beautyColor returns string for emerald-splendor', () => {
    expect(typeof beautyColor('emerald-splendor')).toBe('string')
  })
  it('welcomeColor returns string for theres-no-place-like-home', () => {
    expect(typeof welcomeColor('theres-no-place-like-home')).toBe('string')
  })
  it('conditionColor returns string for emerald-palace', () => {
    expect(typeof conditionColor('emerald-palace')).toBe('string')
  })
  it('wizardGradeColor returns string for wizard-of-oz', () => {
    expect(typeof wizardGradeColor('wizard-of-oz')).toBe('string')
  })
  it('formatEmeraldCityJson returns valid JSON', () => {
    const r = buildEmeraldCityResult(['a.ts'], [RICH])
    const json = formatEmeraldCityJson(r)
    expect(() => JSON.parse(json)).not.toThrow()
  })
  it('formatEmeraldCityTable returns string with header', () => {
    const r = buildEmeraldCityResult(['a.ts'], [RICH])
    const table = formatEmeraldCityTable(r, false)
    expect(table).toContain('Emerald City Analysis')
  })
  it('formatEmeraldCityTable verbose shows per-file towers', () => {
    const r = buildEmeraldCityResult(['a.ts'], [RICH])
    const table = formatEmeraldCityTable(r, true)
    expect(table).toContain('Per-File Towers')
  })
  it('formatEmeraldCityTable shows celebration', () => {
    const r = buildEmeraldCityResult(['a.ts'], [RICH])
    const table = formatEmeraldCityTable(r, false)
    expect(table).toContain('420 commands')
  })
  it('color helpers pass through unknown values', () => {
    expect(radianceColor('unknown')).toBe('unknown')
    expect(entranceColor('unknown')).toBe('unknown')
    expect(pathColor('unknown')).toBe('unknown')
    expect(magicColor('unknown')).toBe('unknown')
    expect(beautyColor('unknown')).toBe('unknown')
    expect(welcomeColor('unknown')).toBe('unknown')
    expect(conditionColor('unknown')).toBe('unknown')
    expect(wizardGradeColor('unknown')).toBe('unknown')
  })
})
