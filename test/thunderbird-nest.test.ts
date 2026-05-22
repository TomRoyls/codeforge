import { describe, it, expect } from 'vitest'

import {
  measureStorm,
  measureLightning,
  measureThunder,
  measureSacred,
  measureNest,
  measureMythical,
  classifyCondition,
  analyzeThunderFeather,
  analyzeAerieLevel,
  classifyLevelType,
  classifyShamanGrade,
  generateRecommendations,
  buildThunderbirdNestResult,
} from '../src/commands/thunderbird-nest-helpers.js'

import {
  scoreColor,
  conditionColor,
  gradeColor,
  intensityColor,
  velocityColor,
  volumeColor,
  wardColor,
  nestQualityColor,
  rankColor,
  levelTypeColor,
  levelConditionColor,
  formatThunderbirdNestJson,
  formatThunderbirdNestTable,
} from '../src/commands/thunderbird-nest-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────

const RICH = `
export interface Foo { x: number }
export type Bar = Foo | null
export class Baz implements Foo {
  private x: number = 0
  constructor(x: number) { this.x = x }
  /** Docs */
  async getValue(): Promise<number> {
    try { return this.x } catch { return 0 }
  }
}
export function add<T>(a: T, b: T): T { return a }
export const mul = (a: number, b: number) => a * b
export enum Color { Red, Green, Blue }
export { Foo } from './foo'
// TODO: fix later
`

const EMPTY = ''

const MEDIUM = 'const x = 1\n'

// ─── measureStorm ─────────────────────────────────────────────

describe('measureStorm', () => {
  it('measures rich content', () => {
    const result = measureStorm(RICH)
    expect(result.power).toBe(88)
    expect(result.intensity).toBe('thunderstorm')
    expect(result.hasHighPower).toBe(true)
    expect(result.hasElectricCharge).toBe(true)
    expect(result.hasProperDischarge).toBe(true)
    expect(result.hasNoOverload).toBe(false)
    expect(result.hasVoltage).toBe(true)
    expect(result.hasNoBrownout).toBe(true)
    expect(result.hasProperGrounding).toBe(true)
    expect(result.hasNoSurge).toBe(true)
    expect(result.hasSustained).toBe(true)
    expect(result.hasNoOutage).toBe(true)
    expect(result.overloadCount).toBe(1)
    expect(result.surgeCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureStorm(EMPTY)
    expect(result.power).toBe(42)
    expect(result.intensity).toBe('breeze')
    expect(result.hasHighPower).toBe(false)
    expect(result.hasElectricCharge).toBe(false)
    expect(result.hasNoOverload).toBe(true)
    expect(result.hasSustained).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureStorm(MEDIUM)
    expect(result.power).toBe(47)
    expect(result.intensity).toBe('breeze')
  })
})

// ─── measureLightning ──────────────────────────────────────────

describe('measureLightning', () => {
  it('measures rich content', () => {
    const result = measureLightning(RICH)
    expect(result.speed).toBe(67)
    expect(result.velocity).toBe('distant-rumble')
    expect(result.hasHighSpeed).toBe(false)
    expect(result.hasInstantStrike).toBe(false)
    expect(result.hasProperArc).toBe(false)
    expect(result.hasNoResistance).toBe(true)
    expect(result.hasEfficient).toBe(true)
    expect(result.hasNoBottleneck).toBe(true)
    expect(result.hasCleanPath).toBe(true)
    expect(result.hasNoDelay).toBe(true)
    expect(result.hasOptimal).toBe(false)
    expect(result.hasNoWaste).toBe(true)
    expect(result.resistanceCount).toBe(0)
    expect(result.bottleneckCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureLightning(EMPTY)
    expect(result.speed).toBe(52)
    expect(result.velocity).toBe('distant-rumble')
    expect(result.hasHighSpeed).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureLightning(MEDIUM)
    expect(result.speed).toBe(57)
    expect(result.velocity).toBe('distant-rumble')
  })
})

// ─── measureThunder ────────────────────────────────────────────

describe('measureThunder', () => {
  it('measures rich content', () => {
    const result = measureThunder(RICH)
    expect(result.impact).toBe(88)
    expect(result.volume).toBe('deafening')
    expect(result.hasHighImpact).toBe(true)
    expect(result.hasReverberation).toBe(false)
    expect(result.hasWideReach).toBe(true)
    expect(result.hasNoDistortion).toBe(true)
    expect(result.hasEcho).toBe(true)
    expect(result.hasNoNoise).toBe(true)
    expect(result.hasProperProjection).toBe(true)
    expect(result.hasNoInterference).toBe(true)
    expect(result.hasResonance).toBe(true)
    expect(result.hasNoMuffling).toBe(true)
    expect(result.distortionCount).toBe(0)
    expect(result.interferenceCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureThunder(EMPTY)
    expect(result.impact).toBe(40)
    expect(result.volume).toBe('whisper')
    expect(result.hasHighImpact).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureThunder(MEDIUM)
    expect(result.impact).toBe(45)
    expect(result.volume).toBe('whisper')
  })
})

// ─── measureSacred ─────────────────────────────────────────────

describe('measureSacred', () => {
  it('measures rich content', () => {
    const result = measureSacred(RICH)
    expect(result.protection).toBe(89)
    expect(result.ward).toBe('impervious')
    expect(result.hasHighProtection).toBe(true)
    expect(result.hasSpiritShield).toBe(true)
    expect(result.hasProperWard).toBe(true)
    expect(result.hasNoCurse).toBe(true)
    expect(result.hasBlessing).toBe(true)
    expect(result.hasNoHex).toBe(true)
    expect(result.hasTotemGuard).toBe(true)
    expect(result.hasNoVulnerability).toBe(true)
    expect(result.hasRitualPurity).toBe(false)
    expect(result.hasNoDefilement).toBe(true)
    expect(result.curseCount).toBe(0)
    expect(result.hexCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureSacred(EMPTY)
    expect(result.protection).toBe(53)
    expect(result.ward).toBe('vulnerable')
    expect(result.hasHighProtection).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureSacred(MEDIUM)
    expect(result.protection).toBe(58)
    expect(result.ward).toBe('vulnerable')
  })
})

// ─── measureNest ───────────────────────────────────────────────

describe('measureNest', () => {
  it('measures rich content', () => {
    const result = measureNest(RICH)
    expect(result.construction).toBe(78)
    expect(result.quality).toBe('sturdy')
    expect(result.hasHighConstruction).toBe(true)
    expect(result.hasSolidFoundation).toBe(true)
    expect(result.hasProperWeaving).toBe(false)
    expect(result.hasNoLooseThreads).toBe(false)
    expect(result.hasReinforced).toBe(true)
    expect(result.hasNoGaps).toBe(true)
    expect(result.hasProperInsulation).toBe(true)
    expect(result.hasNoWeakPoints).toBe(true)
    expect(result.hasSpacious).toBe(true)
    expect(result.hasNoCrowding).toBe(true)
    expect(result.looseThreadCount).toBe(1)
    expect(result.weakPointCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureNest(EMPTY)
    expect(result.construction).toBe(51)
    expect(result.quality).toBe('flimsy')
    expect(result.hasHighConstruction).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureNest(MEDIUM)
    expect(result.construction).toBe(56)
    expect(result.quality).toBe('flimsy')
  })
})

// ─── measureMythical ───────────────────────────────────────────

describe('measureMythical', () => {
  it('measures rich content', () => {
    const result = measureMythical(RICH)
    expect(result.quality).toBe(78)
    expect(result.rank).toBe('epic')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasTranscendent).toBe(true)
    expect(result.hasNoWeakness).toBe(true)
    expect(result.hasDivine).toBe(false)
    expect(result.hasNoCorruption).toBe(true)
    expect(result.hasEternal).toBe(false)
    expect(result.hasNoDegradation).toBe(true)
    expect(result.hasCosmic).toBe(true)
    expect(result.hasNoMediocrity).toBe(true)
    expect(result.hasSupreme).toBe(true)
    expect(result.weaknessCount).toBe(0)
    expect(result.degradationCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureMythical(EMPTY)
    expect(result.quality).toBe(40)
    expect(result.rank).toBe('common')
    expect(result.hasHighQuality).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureMythical(MEDIUM)
    expect(result.quality).toBe(45)
    expect(result.rank).toBe('common')
  })
})

// ─── analyzeThunderFeather ─────────────────────────────────────

describe('analyzeThunderFeather', () => {
  it('analyzes rich content', () => {
    const result = analyzeThunderFeather(RICH, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.stormPower).toBe(88)
    expect(result.lightningSpeed).toBe(67)
    expect(result.thunderImpact).toBe(88)
    expect(result.sacredProtection).toBe(89)
    expect(result.nestConstruction).toBe(78)
    expect(result.mythicalQuality).toBe(78)
    expect(result.qualityScore).toBe(82)
    expect(result.condition).toBe('mythical-artifact')
  })

  it('analyzes empty content', () => {
    const result = analyzeThunderFeather(EMPTY, 'empty.ts')
    expect(result.stormPower).toBe(42)
    expect(result.lightningSpeed).toBe(52)
    expect(result.thunderImpact).toBe(40)
    expect(result.sacredProtection).toBe(53)
    expect(result.nestConstruction).toBe(51)
    expect(result.mythicalQuality).toBe(40)
    expect(result.qualityScore).toBe(46)
    expect(result.condition).toBe('mundane-object')
  })

  it('analyzes medium content', () => {
    const result = analyzeThunderFeather(MEDIUM, 'medium.ts')
    expect(result.stormPower).toBe(47)
    expect(result.lightningSpeed).toBe(57)
    expect(result.thunderImpact).toBe(45)
    expect(result.sacredProtection).toBe(58)
    expect(result.nestConstruction).toBe(56)
    expect(result.mythicalQuality).toBe(45)
    expect(result.qualityScore).toBe(51)
    expect(result.condition).toBe('powerful-totem')
  })

  it('returns consistent results on repeated calls', () => {
    const a = analyzeThunderFeather(RICH, 'a.ts')
    const b = analyzeThunderFeather(RICH, 'a.ts')
    expect(a.qualityScore).toBe(b.qualityScore)
    expect(a.stormPower).toBe(b.stormPower)
    expect(a.condition).toBe(b.condition)
  })
})

// ─── classifyCondition ─────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies mythical-artifact', () => {
    const f = analyzeThunderFeather(RICH, 'rich.ts')
    expect(classifyCondition(f)).toBe('mythical-artifact')
  })

  it('classifies mundane-object', () => {
    const f = analyzeThunderFeather(EMPTY, 'empty.ts')
    expect(classifyCondition(f)).toBe('mundane-object')
  })

  it('classifies powerful-totem', () => {
    const f = analyzeThunderFeather(MEDIUM, 'medium.ts')
    expect(classifyCondition(f)).toBe('powerful-totem')
  })
})

// ─── classifyLevelType ─────────────────────────────────────────

describe('classifyLevelType', () => {
  it('classifies rich feathers as mythical-aerie', () => {
    const f = analyzeThunderFeather(RICH, 'rich.ts')
    expect(classifyLevelType([f])).toBe('mythical-aerie')
  })

  it('classifies empty feathers as mountain-nest', () => {
    const f = analyzeThunderFeather(EMPTY, 'empty.ts')
    expect(classifyLevelType([f])).toBe('mountain-nest')
  })

  it('classifies mixed feathers as mountain-nest', () => {
    const r = analyzeThunderFeather(RICH, 'rich.ts')
    const e = analyzeThunderFeather(EMPTY, 'empty.ts')
    const m = analyzeThunderFeather(MEDIUM, 'medium.ts')
    expect(classifyLevelType([r, e, m])).toBe('mountain-nest')
  })
})

// ─── classifyShamanGrade ───────────────────────────────────────

describe('classifyShamanGrade', () => {
  it('returns mythical-shaman for 80+', () => {
    expect(classifyShamanGrade(90)).toBe('mythical-shaman')
  })
  it('returns storm-caller for 65+', () => {
    expect(classifyShamanGrade(75)).toBe('storm-caller')
  })
  it('returns sky-watcher for 50+', () => {
    expect(classifyShamanGrade(55)).toBe('sky-watcher')
  })
  it('returns apprentice for 35+', () => {
    expect(classifyShamanGrade(35)).toBe('apprentice')
  })
  it('returns novice for 20+', () => {
    expect(classifyShamanGrade(20)).toBe('novice')
  })
  it('returns grounded for below 20', () => {
    expect(classifyShamanGrade(10)).toBe('grounded')
  })
})

// ─── analyzeAerieLevel ─────────────────────────────────────────

describe('analyzeAerieLevel', () => {
  it('analyzes a level with multiple feathers', () => {
    const r = analyzeThunderFeather(RICH, 'rich.ts')
    const m = analyzeThunderFeather(MEDIUM, 'medium.ts')
    const level = analyzeAerieLevel([r, m], 'src')
    expect(level.directory).toBe('src')
    expect(level.feathers).toHaveLength(2)
    expect(level.avgPower).toBe(68)
    expect(level.avgSpeed).toBe(62)
    expect(level.avgMythical).toBe(62)
    expect(level.legendaryCount).toBe(0)
    expect(level.dustCount).toBe(0)
    expect(level.powerfulCount).toBe(1)
    expect(level.fastCount).toBe(0)
    expect(level.levelType).toBe('storm-perch')
    expect(level.condition).toBe('storm-fortress')
  })
})

// ─── generateRecommendations ───────────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty array for rich content', () => {
    const f = analyzeThunderFeather(RICH, 'rich.ts')
    const recs = generateRecommendations(
      [f],
      [{ directory: 'src', feathers: [f], avgPower: f.stormPower, avgSpeed: f.lightningSpeed, avgMythical: f.mythicalQuality, legendaryCount: 0, dustCount: 0, powerfulCount: 1, fastCount: 0, levelType: 'mythical-aerie', condition: 'divine-sanctuary' }],
      { avgPower: f.stormPower, avgSpeed: f.lightningSpeed, avgMythical: f.mythicalQuality, isMythical: true, overallPower: f.qualityScore },
      { totalFiles: 1, totalLevels: 1, avgStormPower: f.stormPower, avgLightningSpeed: f.lightningSpeed, avgThunderImpact: f.thunderImpact, avgSacredProtection: f.sacredProtection, avgNestConstruction: f.nestConstruction, avgMythicalQuality: f.mythicalQuality, mythicalArtifactCount: 1, sacredRelicCount: 0, powerfulTotemCount: 0, mundaneObjectCount: 0, brokenShardCount: 0, dustCount: 0, hasHighPowerCount: 1, hasHighSpeedCount: 0, hasHighImpactCount: 1, hasHighProtectionCount: 1, hasHighConstructionCount: 1, hasHighQualityCount: 1, overallPower: f.qualityScore, shamanGrade: 'mythical-shaman', bestFeather: 'rich.ts', mostPowerful: 'rich.ts', fastest: 'rich.ts', mostImpactful: 'rich.ts', mostProtected: 'rich.ts', bestArchitected: 'rich.ts' },
    )
    expect(recs).toEqual([])
  })
})

// ─── buildThunderbirdNestResult ────────────────────────────────

describe('buildThunderbirdNestResult', () => {
  it('builds result for rich content', () => {
    const result = buildThunderbirdNestResult(['rich.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalLevels).toBe(1)
    expect(result.stats.avgStormPower).toBe(88)
    expect(result.stats.avgLightningSpeed).toBe(67)
    expect(result.stats.avgThunderImpact).toBe(88)
    expect(result.stats.avgSacredProtection).toBe(89)
    expect(result.stats.avgNestConstruction).toBe(78)
    expect(result.stats.avgMythicalQuality).toBe(78)
    expect(result.stats.overallPower).toBe(82)
    expect(result.stats.shamanGrade).toBe('mythical-shaman')
    expect(result.stats.mythicalArtifactCount).toBe(1)
    expect(result.stats.hasHighPowerCount).toBe(1)
    expect(result.stats.bestFeather).toBe('rich.ts')
    expect(result.sky.isMythical).toBe(true)
  })

  it('builds result for empty content', () => {
    const result = buildThunderbirdNestResult(['empty.ts'], [EMPTY])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgStormPower).toBe(42)
    expect(result.stats.avgLightningSpeed).toBe(52)
    expect(result.stats.avgThunderImpact).toBe(40)
    expect(result.stats.avgSacredProtection).toBe(53)
    expect(result.stats.avgNestConstruction).toBe(51)
    expect(result.stats.avgMythicalQuality).toBe(40)
    expect(result.stats.overallPower).toBe(46)
    expect(result.stats.shamanGrade).toBe('apprentice')
    expect(result.stats.mundaneObjectCount).toBe(1)
    expect(result.stats.hasHighPowerCount).toBe(0)
    expect(result.sky.isMythical).toBe(false)
  })

  it('builds result for mixed content', () => {
    const result = buildThunderbirdNestResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalLevels).toBe(1)
    expect(result.stats.avgStormPower).toBe(68)
    expect(result.stats.avgLightningSpeed).toBe(62)
    expect(result.stats.avgThunderImpact).toBe(67)
    expect(result.stats.avgSacredProtection).toBe(74)
    expect(result.stats.avgNestConstruction).toBe(67)
    expect(result.stats.avgMythicalQuality).toBe(62)
    expect(result.stats.overallPower).toBe(67)
    expect(result.stats.shamanGrade).toBe('storm-caller')
    expect(result.stats.mythicalArtifactCount).toBe(1)
    expect(result.stats.powerfulTotemCount).toBe(1)
    expect(result.stats.bestFeather).toBe('rich.ts')
    expect(result.sky.overallPower).toBe(67)
  })

  it('returns feathers and levels arrays', () => {
    const result = buildThunderbirdNestResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.feathers).toHaveLength(2)
    expect(result.levels).toHaveLength(1)
    expect(result.feathers[0].file).toBe('rich.ts')
    expect(result.feathers[1].file).toBe('medium.ts')
  })
})

// ─── scoreColor ────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for high scores', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })
  it('returns string for medium scores', () => {
    expect(typeof scoreColor(70)).toBe('string')
  })
  it('returns string for low scores', () => {
    expect(typeof scoreColor(30)).toBe('string')
  })
})

// ─── conditionColor ────────────────────────────────────────────

describe('conditionColor', () => {
  it('returns string for mythical-artifact', () => {
    expect(typeof conditionColor('mythical-artifact')).toBe('string')
  })
  it('returns string for sacred-relic', () => {
    expect(typeof conditionColor('sacred-relic')).toBe('string')
  })
  it('returns string for powerful-totem', () => {
    expect(typeof conditionColor('powerful-totem')).toBe('string')
  })
  it('returns string for mundane-object', () => {
    expect(typeof conditionColor('mundane-object')).toBe('string')
  })
  it('returns string for broken-shard', () => {
    expect(typeof conditionColor('broken-shard')).toBe('string')
  })
  it('returns string for dust', () => {
    expect(typeof conditionColor('dust')).toBe('string')
  })
  it('returns string for unknown', () => {
    expect(typeof conditionColor('unknown')).toBe('string')
  })
})

// ─── gradeColor ────────────────────────────────────────────────

describe('gradeColor', () => {
  it('returns string for mythical-shaman', () => {
    expect(typeof gradeColor('mythical-shaman')).toBe('string')
  })
  it('returns string for storm-caller', () => {
    expect(typeof gradeColor('storm-caller')).toBe('string')
  })
  it('returns string for grounded', () => {
    expect(typeof gradeColor('grounded')).toBe('string')
  })
})

// ─── intensityColor ────────────────────────────────────────────

describe('intensityColor', () => {
  it('returns string for category-5', () => {
    expect(typeof intensityColor('category-5')).toBe('string')
  })
  it('returns string for calm', () => {
    expect(typeof intensityColor('calm')).toBe('string')
  })
})

// ─── velocityColor ─────────────────────────────────────────────

describe('velocityColor', () => {
  it('returns string for lightning-bolt', () => {
    expect(typeof velocityColor('lightning-bolt')).toBe('string')
  })
  it('returns string for no-flash', () => {
    expect(typeof velocityColor('no-flash')).toBe('string')
  })
})

// ─── volumeColor ───────────────────────────────────────────────

describe('volumeColor', () => {
  it('returns string for deafening', () => {
    expect(typeof volumeColor('deafening')).toBe('string')
  })
  it('returns string for silent', () => {
    expect(typeof volumeColor('silent')).toBe('string')
  })
})

// ─── wardColor ─────────────────────────────────────────────────

describe('wardColor', () => {
  it('returns string for impervious', () => {
    expect(typeof wardColor('impervious')).toBe('string')
  })
  it('returns string for exposed', () => {
    expect(typeof wardColor('exposed')).toBe('string')
  })
})

// ─── nestQualityColor ──────────────────────────────────────────

describe('nestQualityColor', () => {
  it('returns string for eagle-nest', () => {
    expect(typeof nestQualityColor('eagle-nest')).toBe('string')
  })
  it('returns string for scattered', () => {
    expect(typeof nestQualityColor('scattered')).toBe('string')
  })
})

// ─── rankColor ─────────────────────────────────────────────────

describe('rankColor', () => {
  it('returns string for legendary', () => {
    expect(typeof rankColor('legendary')).toBe('string')
  })
  it('returns string for mundane', () => {
    expect(typeof rankColor('mundane')).toBe('string')
  })
})

// ─── levelTypeColor ────────────────────────────────────────────

describe('levelTypeColor', () => {
  it('returns string for mythical-aerie', () => {
    expect(typeof levelTypeColor('mythical-aerie')).toBe('string')
  })
  it('returns string for underground', () => {
    expect(typeof levelTypeColor('underground')).toBe('string')
  })
})

// ─── levelConditionColor ───────────────────────────────────────

describe('levelConditionColor', () => {
  it('returns string for divine-sanctuary', () => {
    expect(typeof levelConditionColor('divine-sanctuary')).toBe('string')
  })
  it('returns string for ruined', () => {
    expect(typeof levelConditionColor('ruined')).toBe('string')
  })
})

// ─── formatThunderbirdNestJson ─────────────────────────────────

describe('formatThunderbirdNestJson', () => {
  it('returns valid JSON string', () => {
    const result = buildThunderbirdNestResult(['rich.ts'], [RICH])
    const json = formatThunderbirdNestJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.overallPower).toBe(82)
    expect(parsed.feathers).toHaveLength(1)
  })
})

// ─── formatThunderbirdNestTable ────────────────────────────────

describe('formatThunderbirdNestTable', () => {
  it('returns a non-empty string', () => {
    const result = buildThunderbirdNestResult(['rich.ts'], [RICH])
    const table = formatThunderbirdNestTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('returns verbose table with more content', () => {
    const result = buildThunderbirdNestResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    const brief = formatThunderbirdNestTable(result, false)
    const verbose = formatThunderbirdNestTable(result, true)
    expect(verbose.length).toBeGreaterThan(brief.length)
  })
})
