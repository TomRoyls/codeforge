import { describe, expect, it } from 'vitest'
import {
  measureResonant,
  measureClear,
  measureRinging,
  measurePure,
  measureSustaining,
  measureBalanced,
  classifyCondition,
  classifyChoirType,
  classifyChoirCondition,
  classifyBellmasterGrade,
  analyzeBellTone,
  analyzeBellChoir,
  buildSilverBellResult,
} from '../src/commands/silver-bell-helpers.js'
import {
  scoreColor,
  ringColor,
  toneColor,
  strikeColor,
  purityColor,
  durationColor,
  harmonyColor,
  conditionColor,
  gradeColor,
  formatSilverBellJson,
  formatSilverBellTable,
} from '../src/commands/silver-bell-format-helpers.js'

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

// ─── measureResonant ───────────────────────────────────────────────────────

describe('measureResonant', () => {
  it('returns correct impact for RICH content', () => {
    const result = measureResonant(RICH)
    expect(result.impact).toBe(94)
  })

  it('returns correct ring for RICH content', () => {
    const result = measureResonant(RICH)
    expect(result.ring).toBe('thunderous-peal')
  })

  it('detects high impact', () => {
    const result = measureResonant(RICH)
    expect(result.hasHighImpact).toBe(true)
  })

  it('detects far reaching code', () => {
    const result = measureResonant(RICH)
    expect(result.hasFarReaching).toBe(true)
  })

  it('detects influential code', () => {
    const result = measureResonant(RICH)
    expect(result.hasInfluential).toBe(true)
  })

  it('detects amplifying code', () => {
    const result = measureResonant(RICH)
    expect(result.hasAmplifying).toBe(true)
  })

  it('detects echoing code', () => {
    const result = measureResonant(RICH)
    expect(result.hasEchoing).toBe(true)
  })

  it('detects carrying code', () => {
    const result = measureResonant(RICH)
    expect(result.hasCarrying).toBe(true)
  })

  it('detects no isolation', () => {
    const result = measureResonant(RICH)
    expect(result.hasNoIsolation).toBe(true)
    expect(result.isolationCount).toBe(0)
  })

  it('detects no deadening', () => {
    const result = measureResonant(RICH)
    expect(result.hasNoDeadening).toBe(true)
    expect(result.deadeningCount).toBe(0)
  })

  it('returns zero for empty content', () => {
    const result = measureResonant(EMPTY)
    expect(result.impact).toBe(0)
    expect(result.ring).toBe('silent')
  })

  it('detects isolation with console', () => {
    const result = measureResonant("console.log('x')")
    expect(result.hasNoIsolation).toBe(false)
    expect(result.isolationCount).toBe(1)
  })
})

// ─── measureClear ──────────────────────────────────────────────────────────

describe('measureClear', () => {
  it('returns correct readability for RICH content', () => {
    const result = measureClear(RICH)
    expect(result.readability).toBe(95)
  })

  it('returns correct tone for RICH content', () => {
    const result = measureClear(RICH)
    expect(result.tone).toBe('crystal-clear')
  })

  it('detects high readability', () => {
    const result = measureClear(RICH)
    expect(result.hasHighReadability).toBe(true)
  })

  it('detects readable code', () => {
    const result = measureClear(RICH)
    expect(result.hasReadable).toBe(true)
  })

  it('detects obvious code', () => {
    const result = measureClear(RICH)
    expect(result.hasObvious).toBe(true)
  })

  it('detects transparent code', () => {
    const result = measureClear(RICH)
    expect(result.hasTransparent).toBe(true)
  })

  it('detects self-explanatory code', () => {
    const result = measureClear(RICH)
    expect(result.hasSelfExplanatory).toBe(true)
  })

  it('detects luminous code', () => {
    const result = measureClear(RICH)
    expect(result.hasLuminous).toBe(true)
  })

  it('returns zero for empty content', () => {
    const result = measureClear(EMPTY)
    expect(result.readability).toBe(0)
    expect(result.tone).toBe('opaque')
  })

  it('detects obfuscation with any', () => {
    const result = measureClear('const x: any = 1')
    expect(result.hasNoObfuscation).toBe(false)
    expect(result.obfuscationCount).toBe(1)
  })
})

// ─── measureRinging ────────────────────────────────────────────────────────

describe('measureRinging', () => {
  it('returns correct quality for RICH content', () => {
    const result = measureRinging(RICH)
    expect(result.quality).toBe(55)
  })

  it('returns correct strike for RICH content', () => {
    const result = measureRinging(RICH)
    expect(result.strike).toBe('proper-tone')
  })

  it('detects precise code', () => {
    const result = measureRinging(RICH)
    expect(result.hasPrecise).toBe(true)
  })

  it('detects clean code', () => {
    const result = measureRinging(RICH)
    expect(result.hasClean).toBe(true)
  })

  it('detects polished code', () => {
    const result = measureRinging(RICH)
    expect(result.hasPolished).toBe(true)
  })

  it('detects no waste', () => {
    const result = measureRinging(RICH)
    expect(result.hasNoWaste).toBe(true)
    expect(result.wasteCount).toBe(0)
  })

  it('detects no sloppiness', () => {
    const result = measureRinging(RICH)
    expect(result.hasNoSloppiness).toBe(true)
    expect(result.sloppinessCount).toBe(0)
  })

  it('returns zero for empty content', () => {
    const result = measureRinging(EMPTY)
    expect(result.quality).toBe(0)
    expect(result.strike).toBe('cacophony')
  })

  it('detects waste with console.log', () => {
    const result = measureRinging("console.log('x')")
    expect(result.hasNoWaste).toBe(false)
    expect(result.wasteCount).toBe(1)
  })
})

// ─── measurePure ───────────────────────────────────────────────────────────

describe('measurePure', () => {
  it('returns correct correctness for RICH content', () => {
    const result = measurePure(RICH)
    expect(result.correctness).toBe(81)
  })

  it('returns correct tone for RICH content', () => {
    const result = measurePure(RICH)
    expect(result.tone).toBe('harmonic')
  })

  it('detects type safe code', () => {
    const result = measurePure(RICH)
    expect(result.hasTypeSafe).toBe(true)
  })

  it('detects proper code', () => {
    const result = measurePure(RICH)
    expect(result.hasProper).toBe(true)
  })

  it('detects correct code', () => {
    const result = measurePure(RICH)
    expect(result.hasCorrect).toBe(true)
  })

  it('detects valid code', () => {
    const result = measurePure(RICH)
    expect(result.hasValid).toBe(true)
  })

  it('detects no hacks', () => {
    const result = measurePure(RICH)
    expect(result.hasNoHacks).toBe(true)
    expect(result.hackCount).toBe(0)
  })

  it('detects no workarounds', () => {
    const result = measurePure(RICH)
    expect(result.hasNoWorkarounds).toBe(true)
    expect(result.workaroundCount).toBe(0)
  })

  it('returns zero for empty content', () => {
    const result = measurePure(EMPTY)
    expect(result.correctness).toBe(0)
    expect(result.tone).toBe('atonal')
  })

  it('detects hacks with any', () => {
    const result = measurePure('const x: any = 1')
    expect(result.hasNoHacks).toBe(false)
    expect(result.hackCount).toBe(1)
  })
})

// ─── measureSustaining ─────────────────────────────────────────────────────

describe('measureSustaining', () => {
  it('returns correct lastingValue for RICH content', () => {
    const result = measureSustaining(RICH)
    expect(result.lastingValue).toBe(78)
  })

  it('returns correct duration for RICH content', () => {
    const result = measureSustaining(RICH)
    expect(result.duration).toBe('long-sustain')
  })

  it('detects timeless code', () => {
    const result = measureSustaining(RICH)
    expect(result.hasTimeless).toBe(true)
  })

  it('detects reusable code', () => {
    const result = measureSustaining(RICH)
    expect(result.hasReusable).toBe(true)
  })

  it('detects enduring code', () => {
    const result = measureSustaining(RICH)
    expect(result.hasEnduring).toBe(true)
  })

  it('detects stable code', () => {
    const result = measureSustaining(RICH)
    expect(result.hasStable).toBe(true)
  })

  it('detects no disposable code', () => {
    const result = measureSustaining(RICH)
    expect(result.hasNoDisposable).toBe(true)
    expect(result.disposableCount).toBe(0)
  })

  it('detects no fragile code', () => {
    const result = measureSustaining(RICH)
    expect(result.hasNoFragile).toBe(true)
    expect(result.fragileCount).toBe(0)
  })

  it('returns zero for empty content', () => {
    const result = measureSustaining(EMPTY)
    expect(result.lastingValue).toBe(0)
    expect(result.duration).toBe('immediate-silence')
  })
})

// ─── measureBalanced ───────────────────────────────────────────────────────

describe('measureBalanced', () => {
  it('returns correct proportion for RICH content', () => {
    const result = measureBalanced(RICH)
    expect(result.proportion).toBe(89)
  })

  it('returns correct harmony for RICH content', () => {
    const result = measureBalanced(RICH)
    expect(result.harmony).toBe('perfect-harmony')
  })

  it('detects proportioned code', () => {
    const result = measureBalanced(RICH)
    expect(result.hasProportioned).toBe(true)
  })

  it('detects balanced code', () => {
    const result = measureBalanced(RICH)
    expect(result.hasBalanced).toBe(true)
  })

  it('detects even code', () => {
    const result = measureBalanced(RICH)
    expect(result.hasEven).toBe(true)
  })

  it('detects right sized code', () => {
    const result = measureBalanced(RICH)
    expect(result.hasRightSized).toBe(true)
  })

  it('detects measured code', () => {
    const result = measureBalanced(RICH)
    expect(result.hasMeasured).toBe(true)
  })

  it('returns zero for empty content', () => {
    const result = measureBalanced(EMPTY)
    expect(result.proportion).toBe(0)
    expect(result.harmony).toBe('chaotic')
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies silver-chime at 85+', () => {
    expect(classifyCondition(85)).toBe('silver-chime')
  })
  it('classifies clear-bell at 70-84', () => {
    expect(classifyCondition(70)).toBe('clear-bell')
  })
  it('classifies pleasant-tone at 55-69', () => {
    expect(classifyCondition(55)).toBe('pleasant-tone')
  })
  it('classifies dull-ring at 40-54', () => {
    expect(classifyCondition(40)).toBe('dull-ring')
  })
  it('classifies rattle at 25-39', () => {
    expect(classifyCondition(25)).toBe('rattle')
  })
  it('classifies cracked-bell below 25', () => {
    expect(classifyCondition(0)).toBe('cracked-bell')
  })
})

// ─── classifyChoirType ─────────────────────────────────────────────────────

describe('classifyChoirType', () => {
  it('returns silence for empty tones', () => {
    expect(classifyChoirType([])).toBe('silence')
  })

  it('returns correct type for mixed tones', () => {
    const rich = analyzeBellTone(RICH, 'rich.ts')
    const medium = analyzeBellTone(MEDIUM, 'medium.ts')
    expect(classifyChoirType([rich, medium])).toBe('handbell-choir')
  })
})

// ─── classifyChoirCondition ────────────────────────────────────────────────

describe('classifyChoirCondition', () => {
  it('classifies magnificent-peal at 75+', () => {
    expect(classifyChoirCondition(75)).toBe('magnificent-peal')
  })
  it('classifies harmonious-ringing at 60-74', () => {
    expect(classifyChoirCondition(60)).toBe('harmonious-ringing')
  })
  it('classifies pleasant-chiming at 45-59', () => {
    expect(classifyChoirCondition(45)).toBe('pleasant-chiming')
  })
  it('classifies discordant-ringing at 30-44', () => {
    expect(classifyChoirCondition(30)).toBe('discordant-ringing')
  })
  it('classifies clanking at 15-29', () => {
    expect(classifyChoirCondition(15)).toBe('clanking')
  })
  it('classifies silent below 15', () => {
    expect(classifyChoirCondition(0)).toBe('silent')
  })
})

// ─── classifyBellmasterGrade ───────────────────────────────────────────────

describe('classifyBellmasterGrade', () => {
  it('classifies master-bellmaker at 80+', () => {
    expect(classifyBellmasterGrade(80)).toBe('master-bellmaker')
  })
  it('classifies expert-ringer at 65-79', () => {
    expect(classifyBellmasterGrade(65)).toBe('expert-ringer')
  })
  it('classifies skilled-campanologist at 50-64', () => {
    expect(classifyBellmasterGrade(50)).toBe('skilled-campanologist')
  })
  it('classifies bell-ringer at 35-49', () => {
    expect(classifyBellmasterGrade(35)).toBe('bell-ringer')
  })
  it('classifies novice-chimer at 20-34', () => {
    expect(classifyBellmasterGrade(20)).toBe('novice-chimer')
  })
  it('classifies tone-deaf below 20', () => {
    expect(classifyBellmasterGrade(0)).toBe('tone-deaf')
  })
})

// ─── analyzeBellTone ───────────────────────────────────────────────────────

describe('analyzeBellTone', () => {
  it('returns correct values for RICH content', () => {
    const result = analyzeBellTone(RICH, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.resonance).toBe(94)
    expect(result.clarity).toBe(95)
    expect(result.ringQuality).toBe(55)
    expect(result.tonePurity).toBe(81)
    expect(result.sustain).toBe(78)
    expect(result.volumeBalance).toBe(89)
    expect(result.qualityScore).toBe(83)
    expect(result.condition).toBe('clear-bell')
  })

  it('returns correct values for MEDIUM content', () => {
    const result = analyzeBellTone(MEDIUM, 'medium.ts')
    expect(result.resonance).toBe(0)
    expect(result.clarity).toBe(0)
    expect(result.ringQuality).toBe(7)
    expect(result.tonePurity).toBe(0)
    expect(result.sustain).toBe(0)
    expect(result.volumeBalance).toBe(23)
    expect(result.qualityScore).toBe(5)
    expect(result.condition).toBe('cracked-bell')
  })

  it('returns correct values for EMPTY content', () => {
    const result = analyzeBellTone(EMPTY, 'empty.ts')
    expect(result.resonance).toBe(0)
    expect(result.qualityScore).toBe(0)
    expect(result.condition).toBe('cracked-bell')
  })

  it('includes all measure objects', () => {
    const result = analyzeBellTone(RICH, 'rich.ts')
    expect(result.resonant).toBeDefined()
    expect(result.clear).toBeDefined()
    expect(result.ringing).toBeDefined()
    expect(result.pure).toBeDefined()
    expect(result.sustaining).toBeDefined()
    expect(result.balanced).toBeDefined()
  })
})

// ─── analyzeBellChoir ──────────────────────────────────────────────────────

describe('analyzeBellChoir', () => {
  it('returns empty choir for no tones', () => {
    const result = analyzeBellChoir([], '.')
    expect(result.directory).toBe('.')
    expect(result.tones).toEqual([])
    expect(result.choirType).toBe('silence')
    expect(result.condition).toBe('silent')
  })

  it('returns correct choir for RICH+MEDIUM', () => {
    const rich = analyzeBellTone(RICH, 'rich.ts')
    const medium = analyzeBellTone(MEDIUM, 'medium.ts')
    const result = analyzeBellChoir([rich, medium], '.')
    expect(result.avgResonance).toBe(47)
    expect(result.avgClarity).toBe(48)
    expect(result.avgQuality).toBe(44)
    expect(result.silverChimeCount).toBe(0)
    expect(result.crackedBellCount).toBe(1)
    expect(result.clearBellCount).toBe(1)
    expect(result.pleasantToneCount).toBe(0)
    expect(result.choirType).toBe('handbell-choir')
    expect(result.condition).toBe('discordant-ringing')
  })
})

// ─── buildSilverBellResult ─────────────────────────────────────────────────

describe('buildSilverBellResult', () => {
  it('returns correct stats for RICH+MEDIUM', () => {
    const result = buildSilverBellResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalChoirs).toBe(1)
    expect(result.stats.avgResonance).toBe(47)
    expect(result.stats.avgClarity).toBe(48)
    expect(result.stats.avgRingQuality).toBe(31)
    expect(result.stats.avgTonePurity).toBe(41)
    expect(result.stats.avgSustain).toBe(39)
    expect(result.stats.avgVolumeBalance).toBe(56)
    expect(result.stats.overallResonance).toBe(44)
    expect(result.stats.bellmasterGrade).toBe('bell-ringer')
  })

  it('returns correct condition counts', () => {
    const result = buildSilverBellResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.silverChimeCount).toBe(0)
    expect(result.stats.clearBellCount).toBe(1)
    expect(result.stats.pleasantToneCount).toBe(0)
    expect(result.stats.dullRingCount).toBe(0)
    expect(result.stats.rattleCount).toBe(0)
    expect(result.stats.crackedBellCount).toBe(1)
  })

  it('returns correct high-counts', () => {
    const result = buildSilverBellResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.hasHighImpactCount).toBe(1)
    expect(result.stats.hasHighReadabilityCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(0)
    expect(result.stats.hasHighCorrectnessCount).toBe(1)
    expect(result.stats.hasHighLastingValueCount).toBe(1)
    expect(result.stats.hasHighProportionCount).toBe(1)
  })

  it('returns correct best files', () => {
    const result = buildSilverBellResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.bestTone).toBe('rich.ts')
    expect(result.stats.mostResonant).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.bestQuality).toBe('rich.ts')
    expect(result.stats.purest).toBe('rich.ts')
    expect(result.stats.mostLasting).toBe('rich.ts')
  })

  it('returns correct cathedral data', () => {
    const result = buildSilverBellResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.cathedral.avgResonance).toBe(47)
    expect(result.cathedral.avgClarity).toBe(48)
    expect(result.cathedral.avgQuality).toBe(44)
    expect(result.cathedral.isResonant).toBe(false)
    expect(result.cathedral.overallResonance).toBe(44)
  })

  it('returns recommendations', () => {
    const result = buildSilverBellResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildSilverBellResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.tones).toEqual([])
    expect(result.cathedral.overallResonance).toBe(0)
    expect(result.stats.bellmasterGrade).toBe('tone-deaf')
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string for all ranges', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(60)).toBe('string')
    expect(typeof scoreColor(40)).toBe('string')
    expect(typeof scoreColor(10)).toBe('string')
  })

  it('ringColor handles all rings', () => {
    expect(typeof ringColor('thunderous-peal')).toBe('string')
    expect(typeof ringColor('clear-chime')).toBe('string')
    expect(typeof ringColor('pleasant-ring')).toBe('string')
    expect(typeof ringColor('dull-thud')).toBe('string')
    expect(typeof ringColor('muffled-clank')).toBe('string')
    expect(typeof ringColor('silent')).toBe('string')
  })

  it('toneColor handles all tones', () => {
    expect(typeof toneColor('crystal-clear')).toBe('string')
    expect(typeof toneColor('bright-tone')).toBe('string')
    expect(typeof toneColor('clear-note')).toBe('string')
    expect(typeof toneColor('slightly-cloudy')).toBe('string')
    expect(typeof toneColor('muddy')).toBe('string')
    expect(typeof toneColor('opaque')).toBe('string')
  })

  it('strikeColor handles all strikes', () => {
    expect(typeof strikeColor('perfect-strike')).toBe('string')
    expect(typeof strikeColor('clean-ring')).toBe('string')
    expect(typeof strikeColor('proper-tone')).toBe('string')
    expect(typeof strikeColor('off-key')).toBe('string')
    expect(typeof strikeColor('dissonant')).toBe('string')
    expect(typeof strikeColor('cacophony')).toBe('string')
  })

  it('purityColor handles all purities', () => {
    expect(typeof purityColor('pure-tone')).toBe('string')
    expect(typeof purityColor('harmonic')).toBe('string')
    expect(typeof purityColor('clean-note')).toBe('string')
    expect(typeof purityColor('slightly-off')).toBe('string')
    expect(typeof purityColor('dissonant')).toBe('string')
    expect(typeof purityColor('atonal')).toBe('string')
  })

  it('durationColor handles all durations', () => {
    expect(typeof durationColor('eternal-ring')).toBe('string')
    expect(typeof durationColor('long-sustain')).toBe('string')
    expect(typeof durationColor('proper-decay')).toBe('string')
    expect(typeof durationColor('short-ring')).toBe('string')
    expect(typeof durationColor('quick-fade')).toBe('string')
    expect(typeof durationColor('immediate-silence')).toBe('string')
  })

  it('harmonyColor handles all harmonies', () => {
    expect(typeof harmonyColor('perfect-harmony')).toBe('string')
    expect(typeof harmonyColor('well-balanced')).toBe('string')
    expect(typeof harmonyColor('proper-mix')).toBe('string')
    expect(typeof harmonyColor('uneven')).toBe('string')
    expect(typeof harmonyColor('unbalanced')).toBe('string')
    expect(typeof harmonyColor('chaotic')).toBe('string')
  })

  it('conditionColor handles all conditions', () => {
    expect(typeof conditionColor('silver-chime')).toBe('string')
    expect(typeof conditionColor('clear-bell')).toBe('string')
    expect(typeof conditionColor('pleasant-tone')).toBe('string')
    expect(typeof conditionColor('dull-ring')).toBe('string')
    expect(typeof conditionColor('rattle')).toBe('string')
    expect(typeof conditionColor('cracked-bell')).toBe('string')
  })

  it('gradeColor handles all grades', () => {
    expect(typeof gradeColor('master-bellmaker')).toBe('string')
    expect(typeof gradeColor('expert-ringer')).toBe('string')
    expect(typeof gradeColor('skilled-campanologist')).toBe('string')
    expect(typeof gradeColor('bell-ringer')).toBe('string')
    expect(typeof gradeColor('novice-chimer')).toBe('string')
    expect(typeof gradeColor('tone-deaf')).toBe('string')
  })

  it('color helpers return input for unknown values', () => {
    expect(ringColor('unknown')).toBe('unknown')
    expect(toneColor('unknown')).toBe('unknown')
    expect(strikeColor('unknown')).toBe('unknown')
    expect(purityColor('unknown')).toBe('unknown')
    expect(durationColor('unknown')).toBe('unknown')
    expect(harmonyColor('unknown')).toBe('unknown')
    expect(conditionColor('unknown')).toBe('unknown')
    expect(gradeColor('unknown')).toBe('unknown')
  })

  it('formatSilverBellJson returns valid JSON', () => {
    const result = buildSilverBellResult(['rich.ts'], [RICH])
    const json = formatSilverBellJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formatSilverBellTable returns string with header', () => {
    const result = buildSilverBellResult(['rich.ts'], [RICH])
    const table = formatSilverBellTable(result, false)
    expect(table).toContain('Silver Bell Analysis')
    expect(table).toContain('Cathedral')
    expect(table).toContain('Statistics')
  })

  it('formatSilverBellTable includes per-file details when verbose', () => {
    const result = buildSilverBellResult(['rich.ts'], [RICH])
    const table = formatSilverBellTable(result, true)
    expect(table).toContain('Per-File Tones')
    expect(table).toContain('rich.ts')
  })

  it('formatSilverBellTable includes recommendations', () => {
    const result = buildSilverBellResult(['medium.ts'], [MEDIUM])
    const table = formatSilverBellTable(result, false)
    expect(table).toContain('Recommendations')
  })
})
