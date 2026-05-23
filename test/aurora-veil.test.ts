import { describe, expect, it } from 'vitest'
import {
  measureEthereal,
  measureMagnetic,
  measureSpectral,
  measurePolar,
  measureAtmospheric,
  measureLuminous,
  analyzeAuroraRibbon,
  analyzeAuroraDisplay,
  classifyCondition,
  classifyDisplayType,
  classifyDisplayCondition,
  classifyAstronomerGrade,
  buildAuroraVeilResult,
  generateRecommendations,
} from '../src/commands/aurora-veil-helpers.js'
import {
  scoreColor,
  beautyColor,
  fieldColor,
  spectrumColor,
  focusColor,
  pressureColor,
  radianceColor,
  conditionColor,
  astronomerColor,
  formatAuroraVeilJson,
  formatAuroraVeilTable,
} from '../src/commands/aurora-veil-format-helpers.js'

const RICH = `export interface User {
  readonly id: number
  name: string
  email?: string
}

export class UserService {
  private users: Map<number, User> = new Map()

  async getUser(id: number): Promise<User | null> {
    try {
      const user = this.users.get(id)
      if (user === undefined) {
        return null
      }
      return user
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(\`Failed to get user: \${error.message}\`)
      }
      throw new Error('Unknown error')
    } finally {
      console.log('done')
    }
  }
}

export type UserResponse = {
  user: User
  status: 'active' | 'inactive'
}

/**
 * Documentation
 */
export function processUser(user: User): UserResponse {
  return { user, status: 'active' }
}`

const EMPTY = ''
const MINIMAL = 'const x = 1'
const WITH_VAR = 'var y = 2; var z = 3;'
const WITH_ANY = 'const a: any = null; const b: any = undefined;'

describe('aurora-veil-helpers', () => {
  describe('measureEthereal', () => {
    it('measures rich content correctly', () => {
      const result = measureEthereal(RICH)
      expect(result.elegance).toBe(75)
      expect(result.beauty).toBe('breathtaking')
      expect(result.hasHighElegance).toBe(true)
      expect(result.hasGraceful).toBe(false)
      expect(result.hasElegant).toBe(false)
      expect(result.hasNoHarshness).toBe(true)
      expect(result.hasRefined).toBe(true)
      expect(result.hasNoCrudeness).toBe(true)
      expect(result.hasBeautiful).toBe(true)
      expect(result.hasNoUgliness).toBe(true)
      expect(result.hasPoetic).toBe(true)
      expect(result.hasNoBrutalism).toBe(true)
      expect(result.harshnessCount).toBe(0)
      expect(result.crudenessCount).toBe(0)
    })

    it('returns uninspiring for empty content', () => {
      const result = measureEthereal(EMPTY)
      expect(result.elegance).toBe(0)
      expect(result.beauty).toBe('uninspiring')
      expect(result.hasHighElegance).toBe(false)
    })

    it('detects harshness from var usage', () => {
      const result = measureEthereal(WITH_VAR)
      expect(result.hasNoHarshness).toBe(false)
      expect(result.harshnessCount).toBe(2)
      expect(result.hasNoBrutalism).toBe(false)
      expect(result.hasNoUgliness).toBe(false)
    })

    it('detects crudeness from any usage', () => {
      const result = measureEthereal(WITH_ANY)
      expect(result.hasNoCrudeness).toBe(false)
      expect(result.crudenessCount).toBe(2)
      expect(result.hasNoUgliness).toBe(false)
    })

    it('hasGraceful requires optional chaining AND readonly', () => {
      expect(measureEthereal(RICH).hasGraceful).toBe(false)
      const code = 'interface X { readonly a: number }; const x = { a: 1 }; x?.a'
      expect(measureEthereal(code).hasGraceful).toBe(true)
    })

    it('hasElegant requires interface AND generics', () => {
      expect(measureEthereal(RICH).hasElegant).toBe(false)
      const code = 'interface X<T> { value: T }'
      expect(measureEthereal(code).hasElegant).toBe(true)
    })
  })

  describe('measureMagnetic', () => {
    it('measures rich content correctly', () => {
      const result = measureMagnetic(RICH)
      expect(result.alignment).toBe(87)
      expect(result.field).toBe('perfect-alignment')
      expect(result.hasHighAlignment).toBe(true)
      expect(result.hasConsistent).toBe(true)
      expect(result.hasNoDeviation).toBe(true)
      expect(result.hasUniform).toBe(true)
      expect(result.hasNoContradiction).toBe(true)
      expect(result.hasNoConflict).toBe(true)
      expect(result.hasCoherent).toBe(true)
      expect(result.hasNoInconsistency).toBe(true)
      expect(result.deviationCount).toBe(0)
      expect(result.conflictCount).toBe(0)
    })

    it('returns chaotic for empty content', () => {
      const result = measureMagnetic(EMPTY)
      expect(result.alignment).toBe(0)
      expect(result.field).toBe('chaotic')
      expect(result.hasHighAlignment).toBe(false)
    })

    it('hasAligned requires both export and import', () => {
      expect(measureMagnetic(RICH).hasAligned).toBe(false)
      const code = 'export const x = 1; import { y } from "z"'
      expect(measureMagnetic(code).hasAligned).toBe(true)
    })

    it('hasHarmonious requires interface AND generics', () => {
      expect(measureMagnetic(RICH).hasHarmonious).toBe(false)
    })
  })

  describe('measureSpectral', () => {
    it('measures rich content correctly', () => {
      const result = measureSpectral(RICH)
      expect(result.richness).toBe(75)
      expect(result.spectrum).toBe('rich-palette')
      expect(result.hasHighRichness).toBe(true)
      expect(result.hasVaried).toBe(true)
      expect(result.hasNoMonotony).toBe(true)
      expect(result.hasRich).toBe(true)
      expect(result.hasNoRepetition).toBe(true)
      expect(result.hasMultiFaceted).toBe(true)
      expect(result.hasNoSingle).toBe(true)
      expect(result.hasNoBland).toBe(true)
    })

    it('returns colorless for empty content', () => {
      const result = measureSpectral(EMPTY)
      expect(result.richness).toBe(0)
      expect(result.spectrum).toBe('colorless')
    })

    it('hasDiverse requires interface, generics, and enum', () => {
      expect(measureSpectral(RICH).hasDiverse).toBe(false)
    })

    it('hasColorful requires enum AND optional chaining', () => {
      expect(measureSpectral(RICH).hasColorful).toBe(false)
    })
  })

  describe('measurePolar', () => {
    it('measures rich content correctly', () => {
      const result = measurePolar(RICH)
      expect(result.clarity).toBe(92)
      expect(result.focus).toBe('laser-focused')
      expect(result.hasHighClarity).toBe(true)
      expect(result.hasFocused).toBe(true)
      expect(result.hasPurposeful).toBe(true)
      expect(result.hasNoDistraction).toBe(true)
      expect(result.hasConcentrated).toBe(true)
      expect(result.hasNoScatter).toBe(true)
      expect(result.hasClearIntent).toBe(true)
      expect(result.hasNoWandering).toBe(true)
      expect(result.distractionCount).toBe(0)
      expect(result.tangentCount).toBe(0)
    })

    it('returns scattered for empty content', () => {
      const result = measurePolar(EMPTY)
      expect(result.clarity).toBe(0)
      expect(result.focus).toBe('scattered')
    })
  })

  describe('measureAtmospheric', () => {
    it('measures rich content correctly', () => {
      const result = measureAtmospheric(RICH)
      expect(result.depth).toBe(71)
      expect(result.pressure).toBe('rich-context')
      expect(result.hasHighDepth).toBe(true)
      expect(result.hasWellScoped).toBe(true)
      expect(result.hasNoIsolation).toBe(true)
      expect(result.hasNoDisconnection).toBe(true)
      expect(result.hasLayered).toBe(true)
      expect(result.hasNoFlatness).toBe(true)
      expect(result.hasNoShallow).toBe(true)
    })

    it('returns vacuum for empty content', () => {
      const result = measureAtmospheric(EMPTY)
      expect(result.depth).toBe(0)
      expect(result.pressure).toBe('vacuum')
    })
  })

  describe('measureLuminous', () => {
    it('measures rich content correctly', () => {
      const result = measureLuminous(RICH)
      expect(result.flow).toBe(77)
      expect(result.radiance).toBe('bright-stream')
      expect(result.hasHighFlow).toBe(true)
      expect(result.hasReadable).toBe(true)
      expect(result.hasNoBlockage).toBe(true)
      expect(result.hasClear).toBe(true)
      expect(result.hasNoObfuscation).toBe(true)
      expect(result.hasTransparent).toBe(true)
      expect(result.hasNoMuddying).toBe(true)
      expect(result.hasNoDarkness).toBe(true)
    })

    it('returns opaque for empty content', () => {
      const result = measureLuminous(EMPTY)
      expect(result.flow).toBe(0)
      expect(result.radiance).toBe('opaque')
    })
  })

  describe('classifyCondition', () => {
    it('classifies all thresholds', () => {
      expect(classifyCondition(90)).toBe('ethereal-veil')
      expect(classifyCondition(85)).toBe('ethereal-veil')
      expect(classifyCondition(75)).toBe('dancing-lights')
      expect(classifyCondition(70)).toBe('dancing-lights')
      expect(classifyCondition(60)).toBe('steady-glow')
      expect(classifyCondition(55)).toBe('steady-glow')
      expect(classifyCondition(48)).toBe('fading-aurora')
      expect(classifyCondition(40)).toBe('fading-aurora')
      expect(classifyCondition(30)).toBe('dim-light')
      expect(classifyCondition(25)).toBe('dim-light')
      expect(classifyCondition(20)).toBe('dark-sky')
      expect(classifyCondition(0)).toBe('dark-sky')
    })
  })

  describe('classifyDisplayType', () => {
    it('returns clear-night for empty ribbons', () => {
      expect(classifyDisplayType([])).toBe('clear-night')
    })

    it('classifies mixed ribbons correctly', () => {
      const r = analyzeAuroraRibbon(RICH, 'rich.ts')
      const e = analyzeAuroraRibbon(EMPTY, 'empty.ts')
      const m = analyzeAuroraRibbon(MINIMAL, 'minimal.ts')
      expect(classifyDisplayType([r, e, m])).toBe('cloud-cover')
    })
  })

  describe('classifyDisplayCondition', () => {
    it('classifies all thresholds', () => {
      expect(classifyDisplayCondition(80)).toBe('magnificent-aurora')
      expect(classifyDisplayCondition(75)).toBe('magnificent-aurora')
      expect(classifyDisplayCondition(65)).toBe('beautiful-display')
      expect(classifyDisplayCondition(60)).toBe('beautiful-display')
      expect(classifyDisplayCondition(50)).toBe('pleasant-lights')
      expect(classifyDisplayCondition(45)).toBe('pleasant-lights')
      expect(classifyDisplayCondition(35)).toBe('fading-glow')
      expect(classifyDisplayCondition(30)).toBe('fading-glow')
      expect(classifyDisplayCondition(20)).toBe('barely-visible')
      expect(classifyDisplayCondition(15)).toBe('barely-visible')
      expect(classifyDisplayCondition(10)).toBe('invisible')
    })
  })

  describe('classifyAstronomerGrade', () => {
    it('classifies all thresholds', () => {
      expect(classifyAstronomerGrade(85)).toBe('aurora-master')
      expect(classifyAstronomerGrade(80)).toBe('aurora-master')
      expect(classifyAstronomerGrade(70)).toBe('expert-observer')
      expect(classifyAstronomerGrade(65)).toBe('expert-observer')
      expect(classifyAstronomerGrade(55)).toBe('skilled-watcher')
      expect(classifyAstronomerGrade(50)).toBe('skilled-watcher')
      expect(classifyAstronomerGrade(40)).toBe('amateur-stargazer')
      expect(classifyAstronomerGrade(35)).toBe('amateur-stargazer')
      expect(classifyAstronomerGrade(25)).toBe('casual-viewer')
      expect(classifyAstronomerGrade(20)).toBe('casual-viewer')
      expect(classifyAstronomerGrade(10)).toBe('cloudy-night')
    })
  })

  describe('analyzeAuroraRibbon', () => {
    it('produces correct values for rich content', () => {
      const r = analyzeAuroraRibbon(RICH, 'rich.ts')
      expect(r.qualityScore).toBe(79)
      expect(r.etherealBeauty).toBe(75)
      expect(r.magneticAlignment).toBe(87)
      expect(r.spectralRichness).toBe(75)
      expect(r.polarClarity).toBe(92)
      expect(r.atmosphericDepth).toBe(71)
      expect(r.luminousFlow).toBe(77)
      expect(r.condition).toBe('dancing-lights')
      expect(r.file).toBe('rich.ts')
    })

    it('produces correct values for empty content', () => {
      const r = analyzeAuroraRibbon(EMPTY, 'empty.ts')
      expect(r.qualityScore).toBe(0)
      expect(r.condition).toBe('dark-sky')
    })

    it('produces correct values for minimal content', () => {
      const r = analyzeAuroraRibbon(MINIMAL, 'minimal.ts')
      expect(r.qualityScore).toBe(5)
      expect(r.etherealBeauty).toBe(0)
      expect(r.magneticAlignment).toBe(10)
      expect(r.spectralRichness).toBe(0)
      expect(r.polarClarity).toBe(8)
      expect(r.atmosphericDepth).toBe(0)
      expect(r.luminousFlow).toBe(10)
      expect(r.condition).toBe('dark-sky')
    })

    it('contains all six measure objects', () => {
      const r = analyzeAuroraRibbon(RICH, 'rich.ts')
      expect(r.ethereal).toBeDefined()
      expect(r.magnetic).toBeDefined()
      expect(r.spectral).toBeDefined()
      expect(r.polar).toBeDefined()
      expect(r.atmospheric).toBeDefined()
      expect(r.luminous).toBeDefined()
    })

    it('computes qualityScore with correct formula', () => {
      const r = analyzeAuroraRibbon(RICH, 'rich.ts')
      const expected = Math.round(
        r.etherealBeauty * 0.2 +
        r.magneticAlignment * 0.15 +
        r.spectralRichness * 0.15 +
        r.polarClarity * 0.15 +
        r.atmosphericDepth * 0.15 +
        r.luminousFlow * 0.2,
      )
      expect(r.qualityScore).toBe(expected)
    })
  })

  describe('analyzeAuroraDisplay', () => {
    it('returns empty display for empty ribbons', () => {
      const d = analyzeAuroraDisplay([], 'empty-dir')
      expect(d.directory).toBe('empty-dir')
      expect(d.ribbons).toHaveLength(0)
      expect(d.avgBeauty).toBe(0)
      expect(d.avgClarity).toBe(0)
      expect(d.avgFlow).toBe(0)
      expect(d.etherealVeilCount).toBe(0)
      expect(d.darkSkyCount).toBe(0)
      expect(d.dancingLightsCount).toBe(0)
      expect(d.steadyGlowCount).toBe(0)
      expect(d.displayType).toBe('clear-night')
      expect(d.condition).toBe('invisible')
    })

    it('computes correct display averages', () => {
      const r = analyzeAuroraRibbon(RICH, 'rich.ts')
      const e = analyzeAuroraRibbon(EMPTY, 'empty.ts')
      const m = analyzeAuroraRibbon(MINIMAL, 'minimal.ts')
      const d = analyzeAuroraDisplay([r, e, m], 'src')
      expect(d.avgBeauty).toBe(25)
      expect(d.avgClarity).toBe(33)
      expect(d.avgFlow).toBe(29)
      expect(d.etherealVeilCount).toBe(0)
      expect(d.darkSkyCount).toBe(2)
      expect(d.dancingLightsCount).toBe(1)
      expect(d.steadyGlowCount).toBe(0)
      expect(d.displayType).toBe('cloud-cover')
      expect(d.condition).toBe('barely-visible')
    })
  })

  describe('buildAuroraVeilResult', () => {
    it('returns correct result for mixed files', () => {
      const result = buildAuroraVeilResult(
        ['rich.ts', 'empty.ts', 'minimal.ts'],
        [RICH, EMPTY, MINIMAL],
      )

      expect(result.ribbons).toHaveLength(3)
      expect(result.displays).toHaveLength(1)
      expect(result.displays[0].directory).toBe('.')

      expect(result.sky.avgBeauty).toBe(25)
      expect(result.sky.avgClarity).toBe(33)
      expect(result.sky.avgFlow).toBe(29)
      expect(result.sky.isEthereal).toBe(false)
      expect(result.sky.overallLuminosity).toBe(29)

      expect(result.stats.totalFiles).toBe(3)
      expect(result.stats.totalDisplays).toBe(1)
      expect(result.stats.avgEtherealBeauty).toBe(25)
      expect(result.stats.avgMagneticAlignment).toBe(32)
      expect(result.stats.avgSpectralRichness).toBe(25)
      expect(result.stats.avgPolarClarity).toBe(33)
      expect(result.stats.avgAtmosphericDepth).toBe(24)
      expect(result.stats.avgLuminousFlow).toBe(29)
      expect(result.stats.etherealVeilCount).toBe(0)
      expect(result.stats.dancingLightsCount).toBe(1)
      expect(result.stats.steadyGlowCount).toBe(0)
      expect(result.stats.fadingAuroraCount).toBe(0)
      expect(result.stats.dimLightCount).toBe(0)
      expect(result.stats.darkSkyCount).toBe(2)
      expect(result.stats.hasHighEleganceCount).toBe(1)
      expect(result.stats.hasHighAlignmentCount).toBe(1)
      expect(result.stats.hasHighRichnessCount).toBe(1)
      expect(result.stats.hasHighClarityCount).toBe(1)
      expect(result.stats.hasHighDepthCount).toBe(1)
      expect(result.stats.hasHighFlowCount).toBe(1)
      expect(result.stats.overallLuminosity).toBe(29)
      expect(result.stats.astronomerGrade).toBe('casual-viewer')
      expect(result.stats.bestRibbon).toBe('rich.ts')
      expect(result.stats.mostBeautiful).toBe('rich.ts')
      expect(result.stats.bestAligned).toBe('rich.ts')
      expect(result.stats.mostDiverse).toBe('rich.ts')
      expect(result.stats.mostFocused).toBe('rich.ts')
      expect(result.stats.deepest).toBe('rich.ts')
    })

    it('returns empty result for empty input', () => {
      const result = buildAuroraVeilResult([], [])
      expect(result.ribbons).toHaveLength(0)
      expect(result.displays).toHaveLength(0)
      expect(result.sky.overallLuminosity).toBe(0)
      expect(result.sky.isEthereal).toBe(false)
      expect(result.stats.totalFiles).toBe(0)
      expect(result.stats.bestRibbon).toBe('')
    })

    it('separates files into directories correctly', () => {
      const result = buildAuroraVeilResult(
        ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
        [RICH, EMPTY, MINIMAL],
      )
      expect(result.displays).toHaveLength(2)
      const dirs = result.displays.map((d) => d.directory).sort()
      expect(dirs).toContain('lib')
      expect(dirs).toContain('src')
    })

    it('sets isEthereal when avgBeauty >= 60', () => {
      const result = buildAuroraVeilResult(
        ['a.ts', 'b.ts'],
        [RICH, RICH],
      )
      expect(result.sky.isEthereal).toBe(true)
      expect(result.sky.avgBeauty).toBe(75)
    })

    it('sets correct astronomer grade for high luminosity', () => {
      const result = buildAuroraVeilResult(
        ['a.ts', 'b.ts'],
        [RICH, RICH],
      )
      expect(result.stats.astronomerGrade).toBe('aurora-master')
    })
  })

  describe('generateRecommendations', () => {
    it('generates recommendations for low scores', () => {
      const result = buildAuroraVeilResult(['empty.ts'], [EMPTY])
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('generates positive recommendation for good scores', () => {
      const result = buildAuroraVeilResult(['a.ts', 'b.ts'], [RICH, RICH])
      expect(result.recommendations).toContain('Your code has an ethereal veil! Luminous quality is exceptional')
    })

    it('recommends illuminating dark files', () => {
      const result = buildAuroraVeilResult(
        ['a.ts', 'b.ts', 'empty.ts'],
        [RICH, RICH, EMPTY],
      )
      expect(result.recommendations).toContain('Illuminate these dark files: empty.ts')
    })

    it('recommends improving ethereal beauty when low', () => {
      const result = buildAuroraVeilResult(['empty.ts'], [EMPTY])
      expect(result.recommendations).toContain('Improve ethereal beauty with interfaces, generics, and expressive patterns')
    })

    it('recommends improving luminous flow when low', () => {
      const result = buildAuroraVeilResult(['empty.ts'], [EMPTY])
      expect(result.recommendations).toContain('Improve luminous flow with readable patterns, optional chaining, and clear naming')
    })

    it('recommends overall luminosity when low', () => {
      const result = buildAuroraVeilResult(['empty.ts'], [EMPTY])
      expect(result.recommendations).toContain('Overall luminosity is low — prioritize code elegance and readability')
    })

    it('does not recommend illuminating when 4+ dark files', () => {
      const result = buildAuroraVeilResult(
        ['good.ts', 'e1.ts', 'e2.ts', 'e3.ts', 'e4.ts'],
        [RICH, EMPTY, EMPTY, EMPTY, EMPTY],
      )
      const rec = result.recommendations.find((r) => r.startsWith('Illuminate these'))
      expect(rec).toBeUndefined()
    })

    it('mentions dark sky count', () => {
      const result = buildAuroraVeilResult(['empty.ts'], [EMPTY])
      expect(result.recommendations).toContain('1 file(s) are in dark sky — consider significant improvement')
    })
  })
})

describe('aurora-veil-format-helpers', () => {
  describe('scoreColor', () => {
    it('returns string for score >= 80', () => {
      expect(typeof scoreColor(90)).toBe('string')
    })
    it('returns string for score >= 60', () => {
      expect(typeof scoreColor(70)).toBe('string')
    })
    it('returns string for score >= 40', () => {
      expect(typeof scoreColor(50)).toBe('string')
    })
    it('returns string for low score', () => {
      expect(typeof scoreColor(30)).toBe('string')
    })
  })

  describe('beautyColor', () => {
    it('returns string for all beauty levels', () => {
      expect(typeof beautyColor('transcendent')).toBe('string')
      expect(typeof beautyColor('breathtaking')).toBe('string')
      expect(typeof beautyColor('beautiful')).toBe('string')
      expect(typeof beautyColor('pleasant')).toBe('string')
      expect(typeof beautyColor('ordinary')).toBe('string')
      expect(typeof beautyColor('uninspiring')).toBe('string')
    })
  })

  describe('fieldColor', () => {
    it('returns string for all field levels', () => {
      expect(typeof fieldColor('perfect-alignment')).toBe('string')
      expect(typeof fieldColor('strong-field')).toBe('string')
      expect(typeof fieldColor('proper-alignment')).toBe('string')
      expect(typeof fieldColor('drifting')).toBe('string')
      expect(typeof fieldColor('misaligned')).toBe('string')
      expect(typeof fieldColor('chaotic')).toBe('string')
    })
  })

  describe('spectrumColor', () => {
    it('returns string for all spectrum levels', () => {
      expect(typeof spectrumColor('full-spectrum')).toBe('string')
      expect(typeof spectrumColor('rich-palette')).toBe('string')
      expect(typeof spectrumColor('colorful')).toBe('string')
      expect(typeof spectrumColor('adequate-colors')).toBe('string')
      expect(typeof spectrumColor('monochrome')).toBe('string')
      expect(typeof spectrumColor('colorless')).toBe('string')
    })
  })

  describe('focusColor', () => {
    it('returns string for all focus levels', () => {
      expect(typeof focusColor('laser-focused')).toBe('string')
      expect(typeof focusColor('sharp-focus')).toBe('string')
      expect(typeof focusColor('clear-purpose')).toBe('string')
      expect(typeof focusColor('somewhat-scattered')).toBe('string')
      expect(typeof focusColor('diffuse')).toBe('string')
      expect(typeof focusColor('scattered')).toBe('string')
    })
  })

  describe('pressureColor', () => {
    it('returns string for all pressure levels', () => {
      expect(typeof pressureColor('deep-atmosphere')).toBe('string')
      expect(typeof pressureColor('rich-context')).toBe('string')
      expect(typeof pressureColor('proper-layering')).toBe('string')
      expect(typeof pressureColor('surface-level')).toBe('string')
      expect(typeof pressureColor('thin-air')).toBe('string')
      expect(typeof pressureColor('vacuum')).toBe('string')
    })
  })

  describe('radianceColor', () => {
    it('returns string for all radiance levels', () => {
      expect(typeof radianceColor('brilliant-flow')).toBe('string')
      expect(typeof radianceColor('bright-stream')).toBe('string')
      expect(typeof radianceColor('clear-current')).toBe('string')
      expect(typeof radianceColor('murky-flow')).toBe('string')
      expect(typeof radianceColor('turbulent')).toBe('string')
      expect(typeof radianceColor('opaque')).toBe('string')
    })
  })

  describe('conditionColor', () => {
    it('returns string for all conditions', () => {
      expect(typeof conditionColor('ethereal-veil')).toBe('string')
      expect(typeof conditionColor('dancing-lights')).toBe('string')
      expect(typeof conditionColor('steady-glow')).toBe('string')
      expect(typeof conditionColor('fading-aurora')).toBe('string')
      expect(typeof conditionColor('dim-light')).toBe('string')
      expect(typeof conditionColor('dark-sky')).toBe('string')
    })
  })

  describe('astronomerColor', () => {
    it('returns string for all grades', () => {
      expect(typeof astronomerColor('aurora-master')).toBe('string')
      expect(typeof astronomerColor('expert-observer')).toBe('string')
      expect(typeof astronomerColor('skilled-watcher')).toBe('string')
      expect(typeof astronomerColor('amateur-stargazer')).toBe('string')
      expect(typeof astronomerColor('casual-viewer')).toBe('string')
      expect(typeof astronomerColor('cloudy-night')).toBe('string')
    })
  })

  describe('formatAuroraVeilJson', () => {
    it('produces valid JSON', () => {
      const result = buildAuroraVeilResult(['a.ts'], [RICH])
      const json = formatAuroraVeilJson(result)
      const parsed = JSON.parse(json)
      expect(parsed.ribbons).toHaveLength(1)
      expect(parsed.sky.overallLuminosity).toBe(result.sky.overallLuminosity)
    })

    it('includes recommendations in JSON output', () => {
      const result = buildAuroraVeilResult(['empty.ts'], [EMPTY])
      const json = formatAuroraVeilJson(result)
      const parsed = JSON.parse(json)
      expect(parsed.recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('formatAuroraVeilTable', () => {
    it('produces non-empty string for non-verbose', () => {
      const result = buildAuroraVeilResult(['a.ts'], [RICH])
      const table = formatAuroraVeilTable(result, false)
      expect(table.length).toBeGreaterThan(0)
      expect(table).toContain('Aurora Veil Analysis')
      expect(table).toContain('Sky:')
      expect(table).toContain('Statistics:')
    })

    it('includes per-file details in verbose mode', () => {
      const result = buildAuroraVeilResult(['a.ts'], [RICH])
      const table = formatAuroraVeilTable(result, true)
      expect(table).toContain('Per-File Ribbons:')
      expect(table).toContain('a.ts')
    })

    it('includes recommendations when present', () => {
      const result = buildAuroraVeilResult(['empty.ts'], [EMPTY])
      const table = formatAuroraVeilTable(result, false)
      expect(table).toContain('Recommendations:')
    })

    it('includes highlights section when files exist', () => {
      const result = buildAuroraVeilResult(['a.ts'], [RICH])
      const table = formatAuroraVeilTable(result, false)
      expect(table).toContain('Highlights:')
      expect(table).toContain('Best Ribbon:')
      expect(table).toContain('Most Beautiful:')
    })

    it('includes Condition Counts section', () => {
      const result = buildAuroraVeilResult(['a.ts'], [RICH])
      const table = formatAuroraVeilTable(result, false)
      expect(table).toContain('Condition Counts:')
      expect(table).toContain('Ethereal Veil:')
      expect(table).toContain('Dark Sky:')
    })

    it('does not crash on empty result', () => {
      const result = buildAuroraVeilResult([], [])
      const table = formatAuroraVeilTable(result, false)
      expect(typeof table).toBe('string')
    })

    it('shows correct verbose per-file details', () => {
      const result = buildAuroraVeilResult(['a.ts', 'b.ts'], [RICH, EMPTY])
      const table = formatAuroraVeilTable(result, true)
      expect(table).toContain('Score:')
      expect(table).toContain('Condition:')
      expect(table).toContain('Ethereal:')
      expect(table).toContain('Luminous:')
    })
  })
})
