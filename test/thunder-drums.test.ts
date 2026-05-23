import { describe, it, expect } from 'vitest'
import {
  measureSonic,
  measureImpact,
  measureReverberating,
  measureRhythm,
  measureResonance,
  measureDrumming,
  analyzeDrumBeat,
  classifyBeatCondition,
  classifyCircleType,
  analyzeDrumCircle,
  classifyDrummerGrade,
  buildThunderDrumsResult,
} from '../src/commands/thunder-drums-helpers.js'
import {
  scoreColor,
  volumeColor,
  strikeColor,
  echoColor,
  beatColor,
  toneColor,
  skillColor,
  conditionColor,
  drummerGradeColor,
  circleTypeColor,
  circleConditionColor,
  formatThunderDrumsJson,
  formatThunderDrumsTable,
} from '../src/commands/thunder-drums-format-helpers.js'

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

// ─── measureSonic ──────────────────────────────────────────────────────────

describe('measureSonic', () => {
  it('returns powerful volume for rich code', () => {
    const r = measureSonic(RICH)
    expect(r.volume).toBe('powerful')
    expect(r.presence).toBeGreaterThan(50)
  })

  it('returns lower volume for medium code', () => {
    const r = measureSonic(MEDIUM)
    expect(['audible', 'resonant', 'faint']).toContain(r.volume)
  })

  it('returns silent for empty content', () => {
    const r = measureSonic(EMPTY)
    expect(r.volume).toBe('silent')
    expect(r.presence).toBe(0)
  })

  it('detects export giving presence > 0', () => {
    const r = measureSonic('export function foo() {}')
    expect(r.presence).toBeGreaterThan(0)
  })

  it('detects async giving hasResonant or hasClearTone', () => {
    const r = measureSonic('async function go() { await fetch("/") }')
    expect(r.hasResonant || r.hasClearTone).toBe(true)
  })

  it('has hasHighPresence boolean flag', () => {
    const r = measureSonic(RICH)
    expect(typeof r.hasHighPresence).toBe('boolean')
    expect(typeof r.hasResonant).toBe('boolean')
    expect(typeof r.hasClearTone).toBe('boolean')
  })
})

// ─── measureImpact ─────────────────────────────────────────────────────────

describe('measureImpact', () => {
  it('returns moderate-tap for rich code', () => {
    const r = measureImpact(RICH)
    expect(r.strike).toBe('moderate-tap')
    expect(r.force).toBeGreaterThan(0)
  })

  it('returns miss for empty content', () => {
    const r = measureImpact(EMPTY)
    expect(r.strike).toBe('miss')
    expect(r.force).toBe(0)
  })

  it('detects try/catch giving hasPowerful', () => {
    const r = measureImpact('try { x() } catch(e) {}')
    expect(r.hasPowerful).toBe(true)
  })

  it('detects class giving positive force', () => {
    const r = measureImpact('class Foo {}')
    expect(r.force).toBeGreaterThan(0)
  })

  it('has boolean flags', () => {
    const r = measureImpact(RICH)
    expect(typeof r.hasHighForce).toBe('boolean')
    expect(typeof r.hasDirect).toBe('boolean')
    expect(typeof r.hasAuthoritative).toBe('boolean')
  })
})

// ─── measureReverberating ──────────────────────────────────────────────────

describe('measureReverberating', () => {
  it('returns hall-reverb for rich code', () => {
    const r = measureReverberating(RICH)
    expect(r.echo).toBe('hall-reverb')
    expect(r.influence).toBeGreaterThan(0)
  })

  it('returns dead-room for empty content', () => {
    const r = measureReverberating(EMPTY)
    expect(r.echo).toBe('dead-room')
    expect(r.influence).toBe(0)
  })

  it('detects interface giving positive influence', () => {
    const r = measureReverberating('interface Foo { x: number }')
    expect(r.influence).toBeGreaterThan(0)
  })

  it('detects type giving positive influence', () => {
    const r = measureReverberating("type X = 'a' | 'b'")
    expect(r.influence).toBeGreaterThan(0)
  })

  it('has boolean flags', () => {
    const r = measureReverberating(RICH)
    expect(typeof r.hasHighInfluence).toBe('boolean')
    expect(typeof r.hasFarReaching).toBe('boolean')
    expect(typeof r.hasAmplifying).toBe('boolean')
  })
})

// ─── measureRhythm ─────────────────────────────────────────────────────────

describe('measureRhythm', () => {
  it('returns syncopated-master for rich code', () => {
    const r = measureRhythm(RICH)
    expect(r.beat).toBe('syncopated-master')
    expect(r.power).toBeGreaterThan(0)
  })

  it('returns arrhythmic for empty content', () => {
    const r = measureRhythm(EMPTY)
    expect(r.beat).toBe('arrhythmic')
  })

  it('detects function giving hasSteady', () => {
    const r = measureRhythm('function foo() {}')
    expect(r.hasSteady).toBe(true)
  })

  it('detects return giving hasProperTempo', () => {
    const r = measureRhythm('function foo() { return 1 }')
    expect(r.hasProperTempo).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureRhythm(RICH)
    expect(typeof r.hasHighPower).toBe('boolean')
    expect(typeof r.hasSyncopated).toBe('boolean')
    expect(typeof r.hasGroove).toBe('boolean')
  })
})

// ─── measureResonance ──────────────────────────────────────────────────────

describe('measureResonance', () => {
  it('returns rich-baritone for rich code', () => {
    const r = measureResonance(RICH)
    expect(r.tone).toBe('rich-baritone')
    expect(r.depth).toBeGreaterThan(0)
  })

  it('returns tinny for empty content', () => {
    const r = measureResonance(EMPTY)
    expect(r.tone).toBe('tinny')
    expect(r.depth).toBeLessThan(10)
  })

  it('detects generics giving positive depth', () => {
    const r = measureResonance('function foo<T>(x: T): T { return x }')
    expect(r.depth).toBeGreaterThan(0)
  })

  it('detects Map giving positive depth', () => {
    const r = measureResonance('const m = new Map<string, number>()')
    expect(r.depth).toBeGreaterThan(0)
  })

  it('has boolean flags', () => {
    const r = measureResonance(RICH)
    expect(typeof r.hasHighDepth).toBe('boolean')
    expect(typeof r.hasDeep).toBe('boolean')
    expect(typeof r.hasResonantBody).toBe('boolean')
  })
})

// ─── measureDrumming ───────────────────────────────────────────────────────

describe('measureDrumming', () => {
  it('returns virtuoso for rich code', () => {
    const r = measureDrumming(RICH)
    expect(r.skill).toBe('virtuoso')
    expect(r.quality).toBeGreaterThan(0)
  })

  it('returns tone-deaf for empty content', () => {
    const r = measureDrumming(EMPTY)
    expect(r.skill).toBe('tone-deaf')
    expect(r.quality).toBeLessThan(10)
  })

  it('detects doc comments giving positive quality', () => {
    const r = measureDrumming('/** docs */\nfunction foo() {}')
    expect(r.quality).toBeGreaterThan(0)
    expect(r.hasExpressive).toBe(true)
  })

  it('detects semicolons giving hasControlled', () => {
    const r = measureDrumming('const x = 1; const y = 2;')
    expect(r.hasControlled).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureDrumming(RICH)
    expect(typeof r.hasHighQuality).toBe('boolean')
    expect(typeof r.hasDynamic).toBe('boolean')
    expect(typeof r.hasPolished).toBe('boolean')
  })
})

// ─── analyzeDrumBeat (RICH fixture) ────────────────────────────────────────

describe('analyzeDrumBeat - RICH fixture', () => {
  const beat = analyzeDrumBeat(RICH, 'rich.ts')

  it('has correct sonic presence', () => expect(beat.sonicPresence).toBe(75))
  it('has correct impact force', () => expect(beat.impactForce).toBe(49))
  it('has correct reverberation', () => expect(beat.reverberation).toBe(70))
  it('has correct rhythm power', () => expect(beat.rhythmPower).toBe(76))
  it('has correct resonance depth', () => expect(beat.resonanceDepth).toBe(88))
  it('has correct drum quality', () => expect(beat.drumQuality).toBe(83))
  it('has correct quality score', () => expect(beat.qualityScore).toBe(74))
  it('has correct condition', () => expect(beat.condition).toBe('steady-drum'))
  it('has correct file', () => expect(beat.file).toBe('rich.ts'))
  it('has sonic volume powerful', () => expect(beat.sonic.volume).toBe('powerful'))
  it('has impact strike moderate-tap', () => expect(beat.impact.strike).toBe('moderate-tap'))
  it('has reverberating echo hall-reverb', () => expect(beat.reverberating.echo).toBe('hall-reverb'))
  it('has rhythm beat syncopated-master', () => expect(beat.rhythm.beat).toBe('syncopated-master'))
  it('has resonance tone rich-baritone', () => expect(beat.resonance.tone).toBe('rich-baritone'))
  it('has drumming skill virtuoso', () => expect(beat.drumming.skill).toBe('virtuoso'))
})

// ─── analyzeDrumBeat (MEDIUM fixture) ──────────────────────────────────────

describe('analyzeDrumBeat - MEDIUM fixture', () => {
  const beat = analyzeDrumBeat(MEDIUM, 'medium.ts')

  it('has correct sonic presence', () => expect(beat.sonicPresence).toBe(33))
  it('has correct impact force', () => expect(beat.impactForce).toBe(19))
  it('has correct reverberation', () => expect(beat.reverberation).toBe(13))
  it('has correct rhythm power', () => expect(beat.rhythmPower).toBe(45))
  it('has correct resonance depth', () => expect(beat.resonanceDepth).toBe(27))
  it('has correct drum quality', () => expect(beat.drumQuality).toBe(20))
  it('has correct quality score', () => expect(beat.qualityScore).toBe(26))
  it('has correct condition', () => expect(beat.condition).toBe('silence'))
})

// ─── analyzeDrumBeat (EMPTY fixture) ───────────────────────────────────────

describe('analyzeDrumBeat - EMPTY fixture', () => {
  const beat = analyzeDrumBeat(EMPTY, 'empty.ts')

  it('has zero sonic presence', () => expect(beat.sonicPresence).toBe(0))
  it('has zero impact force', () => expect(beat.impactForce).toBe(0))
  it('has zero reverberation', () => expect(beat.reverberation).toBe(0))
  it('has baseline rhythm power', () => expect(beat.rhythmPower).toBe(24))
  it('has minimal resonance depth', () => expect(beat.resonanceDepth).toBe(3))
  it('has minimal drum quality', () => expect(beat.drumQuality).toBe(5))
  it('has quality score of 5', () => expect(beat.qualityScore).toBe(5))
  it('has silence condition', () => expect(beat.condition).toBe('silence'))
})

// ─── classifyBeatCondition ─────────────────────────────────────────────────

describe('classifyBeatCondition', () => {
  it('classifies high score as thunder-roll', () => {
    expect(classifyBeatCondition(90)).toBe('thunder-roll')
  })

  it('classifies 75 as powerful-beat', () => {
    expect(classifyBeatCondition(75)).toBe('powerful-beat')
  })

  it('classifies 60 as steady-drum', () => {
    expect(classifyBeatCondition(60)).toBe('steady-drum')
  })

  it('classifies 45 as fading-rhythm', () => {
    expect(classifyBeatCondition(45)).toBe('fading-rhythm')
  })

  it('classifies 30 as muffled-beat', () => {
    expect(classifyBeatCondition(30)).toBe('muffled-beat')
  })

  it('classifies 5 as silence', () => {
    expect(classifyBeatCondition(5)).toBe('silence')
  })

  it('classifies 40 as muffled-beat', () => {
    expect(classifyBeatCondition(40)).toBe('muffled-beat')
  })

  it('classifies 20 as silence', () => {
    expect(classifyBeatCondition(20)).toBe('silence')
  })
})

// ─── classifyCircleType ────────────────────────────────────────────────────

describe('classifyCircleType', () => {
  it('returns empty-hall for empty beats', () => {
    expect(classifyCircleType([])).toBe('empty-hall')
  })

  it('classifies rich beats', () => {
    const beats = [analyzeDrumBeat(RICH, 'r.ts')]
    const result = classifyCircleType(beats)
    expect(['tribal-gathering', 'drum-circle', 'rehearsal']).toContain(result)
  })

  it('classifies medium beats', () => {
    const beats = [analyzeDrumBeat(MEDIUM, 'm.ts')]
    const result = classifyCircleType(beats)
    expect(['practice-session', 'empty-hall', 'rehearsal']).toContain(result)
  })

  it('classifies empty beats as empty-hall', () => {
    const beats = [analyzeDrumBeat(EMPTY, 'e.ts')]
    expect(classifyCircleType(beats)).toBe('empty-hall')
  })

  it('classifies multiple mixed beats', () => {
    const beats = [analyzeDrumBeat(RICH, 'r.ts'), analyzeDrumBeat(MEDIUM, 'm.ts')]
    const result = classifyCircleType(beats)
    expect(typeof result).toBe('string')
  })

  it('returns a valid type for any beats', () => {
    const beats = [analyzeDrumBeat(RICH, 'a.ts'), analyzeDrumBeat(RICH, 'b.ts'), analyzeDrumBeat(RICH, 'c.ts')]
    const validTypes = ['grand-ceremony', 'tribal-gathering', 'drum-circle', 'rehearsal', 'practice-session', 'empty-hall']
    expect(validTypes).toContain(classifyCircleType(beats))
  })
})

// ─── classifyDrummerGrade ──────────────────────────────────────────────────

describe('classifyDrummerGrade', () => {
  it('classifies high score as thunder-god', () => {
    expect(classifyDrummerGrade(90)).toBe('thunder-god')
  })

  it('classifies mid-high as master-percussionist', () => {
    expect(classifyDrummerGrade(75)).toBe('master-percussionist')
  })

  it('classifies mid as skilled-drummer', () => {
    expect(classifyDrummerGrade(50)).toBe('skilled-drummer')
  })

  it('classifies mid-low as competent-player', () => {
    expect(classifyDrummerGrade(35)).toBe('competent-player')
  })

  it('classifies low as beginner', () => {
    expect(classifyDrummerGrade(20)).toBe('beginner')
  })

  it('classifies very low as tone-deaf', () => {
    expect(classifyDrummerGrade(5)).toBe('tone-deaf')
  })
})

// ─── analyzeDrumCircle ─────────────────────────────────────────────────────

describe('analyzeDrumCircle', () => {
  it('analyzes single beat circle', () => {
    const beat = analyzeDrumBeat(RICH, 'a.ts')
    const circle = analyzeDrumCircle([beat], '.')
    expect(circle.directory).toBe('.')
    expect(circle.beats).toHaveLength(1)
    expect(circle.circleType).toBe('tribal-gathering')
  })

  it('computes avgQuality from beats', () => {
    const b1 = analyzeDrumBeat(RICH, 'a.ts')
    const b2 = analyzeDrumBeat(MEDIUM, 'b.ts')
    const circle = analyzeDrumCircle([b1, b2], 'src')
    expect(circle.avgQuality).toBe(Math.round((83 + 20) / 2))
    expect(circle.directory).toBe('src')
  })

  it('returns empty-hall for no beats', () => {
    const circle = analyzeDrumCircle([], 'empty')
    expect(circle.circleType).toBe('empty-hall')
    expect(circle.condition).toBe('silence')
    expect(circle.avgSonic).toBe(0)
  })
})

// ─── buildThunderDrumsResult (RICH + MEDIUM) ───────────────────────────────

describe('buildThunderDrumsResult - RICH + MEDIUM', () => {
  const result = buildThunderDrumsResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])

  it('has 2 total files', () => expect(result.stats.totalFiles).toBe(2))
  it('has 1 total circle', () => expect(result.stats.totalCircles).toBe(1))
  it('has correct avg sonic presence', () => expect(result.stats.avgSonicPresence).toBe(54))
  it('has correct avg impact force', () => expect(result.stats.avgImpactForce).toBe(34))
  it('has correct avg reverberation', () => expect(result.stats.avgReverberation).toBe(42))
  it('has correct avg rhythm power', () => expect(result.stats.avgRhythmPower).toBe(61))
  it('has correct avg resonance depth', () => expect(result.stats.avgResonanceDepth).toBe(58))
  it('has correct avg drum quality', () => expect(result.stats.avgDrumQuality).toBe(52))
  it('has overall thunder of 50', () => expect(result.stats.overallThunder).toBe(50))
  it('has drummer grade skilled-drummer', () => expect(result.stats.drummerGrade).toBe('skilled-drummer'))
  it('has 1 steady-drum', () => expect(result.stats.steadyDrumCount).toBe(1))
  it('has 1 silence', () => expect(result.stats.silenceCount).toBe(1))
  it('has 0 thunder-roll', () => expect(result.stats.thunderRollCount).toBe(0))
  it('orchestra avgSonic is 54', () => expect(result.orchestra.avgSonic).toBe(54))
  it('orchestra avgRhythm is 61', () => expect(result.orchestra.avgRhythm).toBe(61))
  it('orchestra avgQuality is 52', () => expect(result.orchestra.avgQuality).toBe(52))
  it('orchestra overallThunder is 50', () => expect(result.orchestra.overallThunder).toBe(50))
  it('orchestra isPowerful is false', () => expect(result.orchestra.isPowerful).toBe(false))
  it('has bestBeat rich.ts', () => expect(result.stats.bestBeat).toBe('rich.ts'))
  it('has mostPresent rich.ts', () => expect(result.stats.mostPresent).toBe('rich.ts'))
  it('has mostPowerful rich.ts', () => expect(result.stats.mostPowerful).toBe('rich.ts'))
  it('has mostInfluential rich.ts', () => expect(result.stats.mostInfluential).toBe('rich.ts'))
  it('has bestTimed rich.ts', () => expect(result.stats.bestTimed).toBe('rich.ts'))
  it('has deepest rich.ts', () => expect(result.stats.deepest).toBe('rich.ts'))
  it('has 1 circle', () => expect(result.circles).toHaveLength(1))
  it('circle has directory .', () => expect(result.circles[0].directory).toBe('.'))
  it('circle has type rehearsal', () => expect(result.circles[0].circleType).toBe('rehearsal'))
  it('circle has condition rhythmic-ensemble', () => expect(result.circles[0].condition).toBe('rhythmic-ensemble'))
  it('has 2 beats', () => expect(result.beats).toHaveLength(2))
  it('has recommendations', () => expect(Array.isArray(result.recommendations)).toBe(true))
})

// ─── buildThunderDrumsResult (4x EMPTY) ────────────────────────────────────

describe('buildThunderDrumsResult - 4x EMPTY', () => {
  const result = buildThunderDrumsResult(
    ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
    [EMPTY, EMPTY, EMPTY, EMPTY],
  )

  it('has 4 total files', () => expect(result.stats.totalFiles).toBe(4))
  it('has 1 total circle', () => expect(result.stats.totalCircles).toBe(1))
  it('has zero avg sonic presence', () => expect(result.stats.avgSonicPresence).toBe(0))
  it('has zero avg impact force', () => expect(result.stats.avgImpactForce).toBe(0))
  it('has zero avg reverberation', () => expect(result.stats.avgReverberation).toBe(0))
  it('has baseline avg rhythm power', () => expect(result.stats.avgRhythmPower).toBe(24))
  it('has minimal avg resonance depth', () => expect(result.stats.avgResonanceDepth).toBe(3))
  it('has minimal avg drum quality', () => expect(result.stats.avgDrumQuality).toBe(5))
  it('has overall thunder of 5', () => expect(result.stats.overallThunder).toBe(5))
  it('has drummer grade tone-deaf', () => expect(result.stats.drummerGrade).toBe('tone-deaf'))
  it('orchestra avgSonic is 0', () => expect(result.orchestra.avgSonic).toBe(0))
  it('orchestra avgRhythm is 24', () => expect(result.orchestra.avgRhythm).toBe(24))
  it('orchestra isPowerful is false', () => expect(result.orchestra.isPowerful).toBe(false))
  it('has 4 silence beats', () => expect(result.stats.silenceCount).toBe(4))
  it('has 4 beats', () => expect(result.beats).toHaveLength(4))
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns a string', () => {
    expect(typeof scoreColor(50)).toBe('string')
  })
})

describe('volumeColor', () => {
  it('colors thunderous', () => expect(typeof volumeColor('thunderous')).toBe('string'))
  it('colors silent', () => expect(typeof volumeColor('silent')).toBe('string'))
  it('handles unknown', () => expect(volumeColor('unknown')).toBe('unknown'))
})

describe('strikeColor', () => {
  it('colors hammer-strike', () => expect(typeof strikeColor('hammer-strike')).toBe('string'))
  it('handles unknown', () => expect(strikeColor('unknown')).toBe('unknown'))
})

describe('echoColor', () => {
  it('colors cathedral-echo', () => expect(typeof echoColor('cathedral-echo')).toBe('string'))
  it('handles unknown', () => expect(echoColor('unknown')).toBe('unknown'))
})

describe('beatColor', () => {
  it('colors perfect-timing', () => expect(typeof beatColor('perfect-timing')).toBe('string'))
  it('handles unknown', () => expect(beatColor('unknown')).toBe('unknown'))
})

describe('toneColor', () => {
  it('colors deep-bass', () => expect(typeof toneColor('deep-bass')).toBe('string'))
  it('handles unknown', () => expect(toneColor('unknown')).toBe('unknown'))
})

describe('skillColor', () => {
  it('colors master-drummer', () => expect(typeof skillColor('master-drummer')).toBe('string'))
  it('handles unknown', () => expect(skillColor('unknown')).toBe('unknown'))
})

describe('conditionColor', () => {
  it('colors thunder-roll', () => expect(typeof conditionColor('thunder-roll')).toBe('string'))
  it('handles unknown', () => expect(conditionColor('unknown')).toBe('unknown'))
})

describe('drummerGradeColor', () => {
  it('colors thunder-god', () => expect(typeof drummerGradeColor('thunder-god')).toBe('string'))
  it('handles unknown', () => expect(drummerGradeColor('unknown')).toBe('unknown'))
})

describe('circleTypeColor', () => {
  it('colors grand-ceremony', () => expect(typeof circleTypeColor('grand-ceremony')).toBe('string'))
  it('handles unknown', () => expect(circleTypeColor('unknown')).toBe('unknown'))
})

describe('circleConditionColor', () => {
  it('colors earth-shaking', () => expect(typeof circleConditionColor('earth-shaking')).toBe('string'))
  it('handles unknown', () => expect(circleConditionColor('unknown')).toBe('unknown'))
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatThunderDrumsJson', () => {
  it('returns valid JSON', () => {
    const result = buildThunderDrumsResult(['a.ts'], [RICH])
    const json = formatThunderDrumsJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.beats).toHaveLength(1)
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatThunderDrumsTable', () => {
  it('returns string with Thunder Drums header', () => {
    const result = buildThunderDrumsResult(['a.ts'], [RICH])
    const table = formatThunderDrumsTable(result, false)
    expect(table).toContain('Thunder Drums')
    expect(table).toContain('Orchestra Overview')
    expect(table).toContain('Statistics')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildThunderDrumsResult(['a.ts'], [RICH])
    const table = formatThunderDrumsTable(result, true)
    expect(table).toContain('Per-File Beats')
    expect(table).toContain('a.ts')
  })

  it('hides per-file details in non-verbose mode', () => {
    const result = buildThunderDrumsResult(['a.ts'], [RICH])
    const table = formatThunderDrumsTable(result, false)
    expect(table).not.toContain('Per-File Beats')
  })
})
