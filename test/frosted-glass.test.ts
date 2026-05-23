import { describe, it, expect } from 'vitest'
import {
  measureTransparent,
  measureFrost,
  measureRefractive,
  measureLight,
  measureSurface,
  measureInsulating,
  analyzeGlassPane,
  classifyPaneCondition,
  classifyInstallationType,
  classifyInstallationCondition,
  classifyGlazierGrade,
  analyzeGlassInstallation,
  buildFrostedGlassResult,
} from '../src/commands/frosted-glass-helpers.js'
import {
  scoreColor,
  clarityColor,
  coverageColor,
  bendingColor,
  brightnessColor,
  finishColor,
  protectionColor,
  conditionColor,
  gradeColor,
  installTypeColor,
  installConditionColor,
  formatFrostedGlassJson,
  formatFrostedGlassTable,
} from '../src/commands/frosted-glass-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface User { id: number; name: string }
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

const MEDIUM = `function hello(name) {
  console.log('hello', name)
  return name
}
`

const EMPTY = ''

// ─── measureTransparent ────────────────────────────────────────────────────

describe('measureTransparent', () => {
  it('returns crystal-clear for rich code', () => {
    const r = measureTransparent(RICH)
    expect(r.clarity).toBe('crystal-clear')
    expect(r.visibility).toBeGreaterThan(50)
  })

  it('returns lower clarity for medium code', () => {
    const r = measureTransparent(MEDIUM)
    expect(typeof r.clarity).toBe('string')
    expect(r.visibility).toBeGreaterThan(0)
  })

  it('returns solid-wall for empty content', () => {
    const r = measureTransparent(EMPTY)
    expect(r.clarity).toBe('solid-wall')
    expect(r.visibility).toBe(0)
  })

  it('detects exports giving hasSeeThrough', () => {
    const r = measureTransparent('export function foo() {}')
    expect(r.hasSeeThrough).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureTransparent(RICH)
    expect(typeof r.hasHighVisibility).toBe('boolean')
    expect(typeof r.hasNoObfuscation).toBe('boolean')
    expect(typeof r.hasClearIntent).toBe('boolean')
  })

  it('counts obfuscation patterns', () => {
    const r = measureTransparent('eval("x")')
    expect(r.obfuscationCount).toBeGreaterThan(0)
    expect(r.hasNoObfuscation).toBe(false)
  })
})

// ─── measureFrost ──────────────────────────────────────────────────────────

describe('measureFrost', () => {
  it('returns a coverage level for rich code', () => {
    const r = measureFrost(RICH)
    expect(r.level).toBeGreaterThan(0)
    expect(typeof r.coverage).toBe('string')
  })

  it('returns painted-over for empty content', () => {
    const r = measureFrost(EMPTY)
    expect(r.coverage).toBe('painted-over')
    expect(r.level).toBe(0)
  })

  it('detects interfaces giving hasProperAbstraction', () => {
    const r = measureFrost('interface Foo { x: number }')
    expect(r.hasProperAbstraction).toBe(true)
  })

  it('detects private giving hasEncapsulation', () => {
    const r = measureFrost('class X { private y: number }')
    expect(r.hasEncapsulation).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureFrost(RICH)
    expect(typeof r.hasHighLevel).toBe('boolean')
    expect(typeof r.hasBalanced).toBe('boolean')
    expect(typeof r.hasProtective).toBe('boolean')
  })

  it('counts leaking patterns', () => {
    const r = measureFrost('console.log("debug")')
    expect(r.leakingCount).toBeGreaterThan(0)
    expect(r.hasNoLeaking).toBe(false)
  })
})

// ─── measureRefractive ────────────────────────────────────────────────────

describe('measureRefractive', () => {
  it('returns bending level for rich code', () => {
    const r = measureRefractive(RICH)
    expect(r.indirection).toBeGreaterThan(0)
    expect(typeof r.bending).toBe('string')
  })

  it('returns prism-split for empty content', () => {
    const r = measureRefractive(EMPTY)
    expect(r.bending).toBe('prism-split')
    expect(r.indirection).toBe(0)
  })

  it('detects Promise giving hasDirect', () => {
    const r = measureRefractive('const x = Promise.resolve(1)')
    expect(r.hasDirect).toBe(true)
  })

  it('detects class giving hasProperLayering', () => {
    const r = measureRefractive('class Foo {}')
    expect(r.hasProperLayering).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureRefractive(RICH)
    expect(typeof r.hasHighIndirection).toBe('boolean')
    expect(typeof r.hasNoMaze).toBe('boolean')
    expect(typeof r.hasIntentional).toBe('boolean')
  })
})

// ─── measureLight ──────────────────────────────────────────────────────────

describe('measureLight', () => {
  it('returns brightness for rich code', () => {
    const r = measureLight(RICH)
    expect(r.transmission).toBeGreaterThan(0)
    expect(typeof r.brightness).toBe('string')
  })

  it('returns light-blocking for empty content', () => {
    const r = measureLight(EMPTY)
    expect(r.brightness).toBe('light-blocking')
    expect(r.transmission).toBe(0)
  })

  it('detects JSDoc giving hasIlluminating', () => {
    const r = measureLight('/** docs */\nfunction foo() {}')
    expect(r.hasIlluminating).toBe(true)
  })

  it('detects @param giving hasProperLighting with @returns', () => {
    const r = measureLight('/** @param x - desc\n * @returns number */\nfunction f(x) { return 1 }')
    expect(r.hasProperLighting).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureLight(RICH)
    expect(typeof r.hasHighTransmission).toBe('boolean')
    expect(typeof r.hasExamples).toBe('boolean')
    expect(typeof r.hasNoDarkSpots).toBe('boolean')
  })

  it('counts dark spots', () => {
    const r = measureLight('TODO: fix this')
    expect(r.darkSpotCount).toBeGreaterThan(0)
  })
})

// ─── measureSurface ───────────────────────────────────────────────────────

describe('measureSurface', () => {
  it('returns polished-surface for rich code', () => {
    const r = measureSurface(RICH)
    expect(r.finish).toBe('polished-surface')
    expect(r.quality).toBeGreaterThan(0)
  })

  it('returns broken for empty content', () => {
    const r = measureSurface(EMPTY)
    expect(r.finish).toBe('broken')
    expect(r.quality).toBe(0)
  })

  it('detects interface giving hasCleanAPI', () => {
    const r = measureSurface('export interface Foo { x: number }')
    expect(r.hasCleanAPI).toBe(true)
  })

  it('detects typed params giving hasProperTyping', () => {
    const r = measureSurface('function foo(x: number): string { return String(x) }')
    expect(r.hasProperTyping).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureSurface(RICH)
    expect(typeof r.hasHighQuality).toBe('boolean')
    expect(typeof r.hasSmooth).toBe('boolean')
    expect(typeof r.hasConsistent).toBe('boolean')
  })
})

// ─── measureInsulating ────────────────────────────────────────────────────

describe('measureInsulating', () => {
  it('returns a protection level for rich code', () => {
    const r = measureInsulating(RICH)
    expect(r.encapsulation).toBeGreaterThan(0)
    expect(typeof r.protection).toBe('string')
  })

  it('returns shattered for empty content', () => {
    const r = measureInsulating(EMPTY)
    expect(r.protection).toBe('shattered')
    expect(r.encapsulation).toBe(0)
  })

  it('detects private giving hasProperBoundaries', () => {
    const r = measureInsulating('class X { private y = 1 }')
    expect(r.hasProperBoundaries).toBe(true)
  })

  it('detects import giving hasSoundProof with closure', () => {
    const r = measureInsulating('import { x } from "y"\nconst f = () => {}')
    expect(r.hasSoundProof).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureInsulating(RICH)
    expect(typeof r.hasHighEncapsulation).toBe('boolean')
    expect(typeof r.hasNoLeaking).toBe('boolean')
    expect(typeof r.hasSealed).toBe('boolean')
  })

  it('counts leaking patterns', () => {
    const r = measureInsulating('console.log("test")')
    expect(r.leakingCount).toBeGreaterThan(0)
  })
})

// ─── analyzeGlassPane (RICH fixture) ───────────────────────────────────────

describe('analyzeGlassPane - RICH fixture', () => {
  const pane = analyzeGlassPane(RICH, 'rich.ts')

  it('has correct transparency', () => expect(pane.transparency).toBe(90))
  it('has correct frost level', () => expect(pane.frostLevel).toBe(45))
  it('has correct refraction', () => expect(pane.refraction).toBe(17))
  it('has correct light transmission', () => expect(pane.lightTransmission).toBe(42))
  it('has correct surface quality', () => expect(pane.surfaceQuality).toBe(76))
  it('has correct insulation', () => expect(pane.insulation).toBe(32))
  it('has correct quality score', () => expect(pane.qualityScore).toBe(51))
  it('has correct condition', () => expect(pane.condition).toBe('clouded-glass'))
  it('has correct file', () => expect(pane.file).toBe('rich.ts'))
  it('has crystal-clear clarity', () => expect(pane.transparent.clarity).toBe('crystal-clear'))
  it('has heavy-frost coverage', () => expect(pane.frost.coverage).toBe('heavy-frost'))
  it('has prism-split bending', () => expect(pane.refractive.bending).toBe('prism-split'))
  it('has dim-transmission brightness', () => expect(pane.light.brightness).toBe('dim-transmission'))
  it('has polished-surface finish', () => expect(pane.surface.finish).toBe('polished-surface'))
  it('has bare-glass protection', () => expect(pane.insulating.protection).toBe('bare-glass'))
})

// ─── analyzeGlassPane (MEDIUM fixture) ─────────────────────────────────────

describe('analyzeGlassPane - MEDIUM fixture', () => {
  const pane = analyzeGlassPane(MEDIUM, 'medium.ts')

  it('has correct transparency', () => expect(pane.transparency).toBe(17))
  it('has correct frost level', () => expect(pane.frostLevel).toBe(0))
  it('has correct refraction', () => expect(pane.refraction).toBe(0))
  it('has correct light transmission', () => expect(pane.lightTransmission).toBe(0))
  it('has correct surface quality', () => expect(pane.surfaceQuality).toBe(0))
  it('has correct insulation', () => expect(pane.insulation).toBe(0))
  it('has correct quality score', () => expect(pane.qualityScore).toBe(3))
  it('has shattered condition', () => expect(pane.condition).toBe('shattered'))
})

// ─── analyzeGlassPane (EMPTY fixture) ──────────────────────────────────────

describe('analyzeGlassPane - EMPTY fixture', () => {
  const pane = analyzeGlassPane(EMPTY, 'empty.ts')

  it('has zero transparency', () => expect(pane.transparency).toBe(0))
  it('has zero frost level', () => expect(pane.frostLevel).toBe(0))
  it('has zero refraction', () => expect(pane.refraction).toBe(0))
  it('has zero light transmission', () => expect(pane.lightTransmission).toBe(0))
  it('has zero surface quality', () => expect(pane.surfaceQuality).toBe(0))
  it('has zero insulation', () => expect(pane.insulation).toBe(0))
  it('has zero quality score', () => expect(pane.qualityScore).toBe(0))
  it('has shattered condition', () => expect(pane.condition).toBe('shattered'))
})

// ─── classifyPaneCondition ─────────────────────────────────────────────────

describe('classifyPaneCondition', () => {
  it('classifies 90 as stained-glass-art', () => expect(classifyPaneCondition(90)).toBe('stained-glass-art'))
  it('classifies 75 as clear-pane', () => expect(classifyPaneCondition(75)).toBe('clear-pane'))
  it('classifies 60 as frosted-window', () => expect(classifyPaneCondition(60)).toBe('frosted-window'))
  it('classifies 45 as clouded-glass', () => expect(classifyPaneCondition(45)).toBe('clouded-glass'))
  it('classifies 30 as cracked-pane', () => expect(classifyPaneCondition(30)).toBe('cracked-pane'))
  it('classifies 10 as shattered', () => expect(classifyPaneCondition(10)).toBe('shattered'))
})

// ─── classifyGlazierGrade ──────────────────────────────────────────────────

describe('classifyGlazierGrade', () => {
  it('classifies 90 as master-glazier', () => expect(classifyGlazierGrade(90)).toBe('master-glazier'))
  it('classifies 75 as expert-craftsman', () => expect(classifyGlazierGrade(75)).toBe('expert-craftsman'))
  it('classifies 50 as skilled-worker', () => expect(classifyGlazierGrade(50)).toBe('skilled-worker'))
  it('classifies 35 as competent-installer', () => expect(classifyGlazierGrade(35)).toBe('competent-installer'))
  it('classifies 20 as apprentice', () => expect(classifyGlazierGrade(20)).toBe('apprentice'))
  it('classifies 5 as vandal', () => expect(classifyGlazierGrade(5)).toBe('vandal'))
})

// ─── classifyInstallationType ──────────────────────────────────────────────

describe('classifyInstallationType', () => {
  it('returns hole-in-wall for empty panes', () => {
    expect(classifyInstallationType([])).toBe('hole-in-wall')
  })

  it('classifies rich panes', () => {
    const panes = [analyzeGlassPane(RICH, 'r.ts')]
    const result = classifyInstallationType(panes)
    expect(typeof result).toBe('string')
  })

  it('classifies empty panes as hole-in-wall', () => {
    const panes = [analyzeGlassPane(EMPTY, 'e.ts')]
    expect(classifyInstallationType(panes)).toBe('hole-in-wall')
  })

  it('returns a valid type', () => {
    const panes = [analyzeGlassPane(RICH, 'a.ts'), analyzeGlassPane(MEDIUM, 'b.ts')]
    const valid = ['cathedral-window', 'modern-facade', 'office-partition', 'bathroom-window', 'boarded-up', 'hole-in-wall']
    expect(valid).toContain(classifyInstallationType(panes))
  })
})

// ─── analyzeGlassInstallation ──────────────────────────────────────────────

describe('analyzeGlassInstallation', () => {
  it('analyzes single pane', () => {
    const pane = analyzeGlassPane(RICH, 'a.ts')
    const inst = analyzeGlassInstallation([pane], '.')
    expect(inst.directory).toBe('.')
    expect(inst.panes).toHaveLength(1)
    expect(typeof inst.installationType).toBe('string')
  })

  it('computes avgTransparency from panes', () => {
    const p1 = analyzeGlassPane(RICH, 'a.ts')
    const p2 = analyzeGlassPane(MEDIUM, 'b.ts')
    const inst = analyzeGlassInstallation([p1, p2], 'src')
    expect(inst.avgTransparency).toBe(Math.round((90 + 17) / 2))
    expect(inst.directory).toBe('src')
  })

  it('returns hole-in-wall for no panes', () => {
    const inst = analyzeGlassInstallation([], 'empty')
    expect(inst.installationType).toBe('hole-in-wall')
    expect(inst.condition).toBe('broken-glass')
    expect(inst.avgTransparency).toBe(0)
  })
})

// ─── buildFrostedGlassResult (RICH + MEDIUM) ───────────────────────────────

describe('buildFrostedGlassResult - RICH + MEDIUM', () => {
  const result = buildFrostedGlassResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])

  it('has 2 total files', () => expect(result.stats.totalFiles).toBe(2))
  it('has 1 total installation', () => expect(result.stats.totalInstallations).toBe(1))
  it('has correct avg transparency', () => expect(result.stats.avgTransparency).toBe(54))
  it('has correct avg frost level', () => expect(result.stats.avgFrostLevel).toBe(23))
  it('has correct avg refraction', () => expect(result.stats.avgRefraction).toBe(9))
  it('has correct avg light transmission', () => expect(result.stats.avgLightTransmission).toBe(21))
  it('has correct avg surface quality', () => expect(result.stats.avgSurfaceQuality).toBe(38))
  it('has correct avg insulation', () => expect(result.stats.avgInsulation).toBe(16))
  it('has overall clarity of 27', () => expect(result.stats.overallClarity).toBe(27))
  it('has glazier grade apprentice', () => expect(result.stats.glazierGrade).toBe('apprentice'))
  it('has 0 stained glass art', () => expect(result.stats.stainedGlassArtCount).toBe(0))
  it('has 1 clouded glass', () => expect(result.stats.cloudedGlassCount).toBe(1))
  it('has 1 shattered', () => expect(result.stats.shatteredCount).toBe(1))
  it('building avgTransparency is 54', () => expect(result.building.avgTransparency).toBe(54))
  it('building overallClarity is 27', () => expect(result.building.overallClarity).toBe(27))
  it('building isTransparent is false', () => expect(result.building.isTransparent).toBe(false))
  it('has bestPane rich.ts', () => expect(result.stats.bestPane).toBe('rich.ts'))
  it('has mostTransparent rich.ts', () => expect(result.stats.mostTransparent).toBe('rich.ts'))
  it('has bestInterface rich.ts', () => expect(result.stats.bestInterface).toBe('rich.ts'))
  it('has 1 installation', () => expect(result.installations).toHaveLength(1))
  it('installation has directory .', () => expect(result.installations[0].directory).toBe('.'))
  it('installation has type boarded-up', () => expect(result.installations[0].installationType).toBe('boarded-up'))
  it('installation has condition failing-seals', () => expect(result.installations[0].condition).toBe('failing-seals'))
  it('has 2 panes', () => expect(result.panes).toHaveLength(2))
  it('has recommendations', () => expect(Array.isArray(result.recommendations)).toBe(true))
})

// ─── buildFrostedGlassResult (4x EMPTY) ────────────────────────────────────

describe('buildFrostedGlassResult - 4x EMPTY', () => {
  const result = buildFrostedGlassResult(
    ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
    [EMPTY, EMPTY, EMPTY, EMPTY],
  )

  it('has 4 total files', () => expect(result.stats.totalFiles).toBe(4))
  it('has 1 total installation', () => expect(result.stats.totalInstallations).toBe(1))
  it('has zero avg transparency', () => expect(result.stats.avgTransparency).toBe(0))
  it('has zero avg frost level', () => expect(result.stats.avgFrostLevel).toBe(0))
  it('has zero overall clarity', () => expect(result.stats.overallClarity).toBe(0))
  it('has glazier grade vandal', () => expect(result.stats.glazierGrade).toBe('vandal'))
  it('building avgTransparency is 0', () => expect(result.building.avgTransparency).toBe(0))
  it('building isTransparent is false', () => expect(result.building.isTransparent).toBe(false))
  it('has 4 shattered panes', () => expect(result.stats.shatteredCount).toBe(4))
  it('has 4 panes', () => expect(result.panes).toHaveLength(4))
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns a string', () => expect(typeof scoreColor(50)).toBe('string'))
})

describe('clarityColor', () => {
  it('colors crystal-clear', () => expect(typeof clarityColor('crystal-clear')).toBe('string'))
  it('handles unknown', () => expect(clarityColor('unknown')).toBe('unknown'))
})

describe('coverageColor', () => {
  it('colors pure-crystal', () => expect(typeof coverageColor('pure-crystal')).toBe('string'))
  it('handles unknown', () => expect(coverageColor('unknown')).toBe('unknown'))
})

describe('bendingColor', () => {
  it('colors no-refraction', () => expect(typeof bendingColor('no-refraction')).toBe('string'))
  it('handles unknown', () => expect(bendingColor('unknown')).toBe('unknown'))
})

describe('brightnessColor', () => {
  it('colors full-spectrum', () => expect(typeof brightnessColor('full-spectrum')).toBe('string'))
  it('handles unknown', () => expect(brightnessColor('unknown')).toBe('unknown'))
})

describe('finishColor', () => {
  it('colors mirror-finish', () => expect(typeof finishColor('mirror-finish')).toBe('string'))
  it('handles unknown', () => expect(finishColor('unknown')).toBe('unknown'))
})

describe('protectionColor', () => {
  it('colors vault-grade', () => expect(typeof protectionColor('vault-grade')).toBe('string'))
  it('handles unknown', () => expect(protectionColor('unknown')).toBe('unknown'))
})

describe('conditionColor', () => {
  it('colors stained-glass-art', () => expect(typeof conditionColor('stained-glass-art')).toBe('string'))
  it('handles unknown', () => expect(conditionColor('unknown')).toBe('unknown'))
})

describe('gradeColor', () => {
  it('colors master-glazier', () => expect(typeof gradeColor('master-glazier')).toBe('string'))
  it('handles unknown', () => expect(gradeColor('unknown')).toBe('unknown'))
})

describe('installTypeColor', () => {
  it('colors cathedral-window', () => expect(typeof installTypeColor('cathedral-window')).toBe('string'))
  it('handles unknown', () => expect(installTypeColor('unknown')).toBe('unknown'))
})

describe('installConditionColor', () => {
  it('colors architectural-marvel', () => expect(typeof installConditionColor('architectural-marvel')).toBe('string'))
  it('handles unknown', () => expect(installConditionColor('unknown')).toBe('unknown'))
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatFrostedGlassJson', () => {
  it('returns valid JSON', () => {
    const result = buildFrostedGlassResult(['a.ts'], [RICH])
    const json = formatFrostedGlassJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.panes).toHaveLength(1)
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatFrostedGlassTable', () => {
  it('returns string with Frosted Glass header', () => {
    const result = buildFrostedGlassResult(['a.ts'], [RICH])
    const table = formatFrostedGlassTable(result, false)
    expect(table).toContain('Frosted Glass')
    expect(table).toContain('Building Overview')
    expect(table).toContain('Statistics')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildFrostedGlassResult(['a.ts'], [RICH])
    const table = formatFrostedGlassTable(result, true)
    expect(table).toContain('Per-File Panes')
    expect(table).toContain('a.ts')
  })

  it('hides per-file details in non-verbose mode', () => {
    const result = buildFrostedGlassResult(['a.ts'], [RICH])
    const table = formatFrostedGlassTable(result, false)
    expect(table).not.toContain('Per-File Panes')
  })
})
