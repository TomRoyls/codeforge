import { describe, expect, it } from 'vitest'
import {
  measureReflective,
  measureGhost,
  measureShadow,
  measureEcho,
  measurePhantom,
  measureFidelity,
  classifyCondition,
  classifyGalleryType,
  classifyMediumGrade,
  classifyGalleryCondition,
  analyzePhantomReflection,
  analyzeMirrorGallery,
  buildPhantomMirrorResult,
} from '../src/commands/phantom-mirror-helpers.js'
import {
  scoreColor,
  clarityColor,
  visibilityColor,
  accuracyColor,
  resonanceColor,
  phantomVisibilityColor,
  truthColor,
  conditionColor,
  gradeColor,
  formatPhantomMirrorJson,
  formatPhantomMirrorTable,
} from '../src/commands/phantom-mirror-format-helpers.js'

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

// ─── measureReflective ─────────────────────────────────────────────────────

describe('measureReflective', () => {
  it('returns correct awareness for RICH content', () => {
    const result = measureReflective(RICH)
    expect(result.awareness).toBe(86)
  })

  it('returns correct clarity for RICH content', () => {
    const result = measureReflective(RICH)
    expect(result.clarity).toBe('perfect-reflection')
  })

  it('detects high awareness', () => {
    const result = measureReflective(RICH)
    expect(result.hasHighAwareness).toBe(true)
  })

  it('detects self-describing code', () => {
    const result = measureReflective(RICH)
    expect(result.hasSelfDescribing).toBe(true)
  })

  it('detects introspective code', () => {
    const result = measureReflective(RICH)
    expect(result.hasIntrospective).toBe(true)
  })

  it('detects documented code', () => {
    const result = measureReflective(RICH)
    expect(result.hasDocumented).toBe(true)
  })

  it('detects transparent code', () => {
    const result = measureReflective(RICH)
    expect(result.hasTransparent).toBe(true)
  })

  it('returns zero for empty content', () => {
    const result = measureReflective(EMPTY)
    expect(result.awareness).toBe(0)
    expect(result.clarity).toBe('blank-surface')
  })

  it('detects mystery patterns with any', () => {
    const result = measureReflective('const x: any = 1')
    expect(result.hasNoMystery).toBe(false)
    expect(result.mysteryCount).toBe(1)
  })
})

// ─── measureGhost ──────────────────────────────────────────────────────────

describe('measureGhost', () => {
  it('returns correct trace for RICH content', () => {
    const result = measureGhost(RICH)
    expect(result.trace).toBe(76)
  })

  it('returns correct visibility for RICH content', () => {
    const result = measureGhost(RICH)
    expect(result.visibility).toBe('visible-footprints')
  })

  it('detects high trace visibility', () => {
    const result = measureGhost(RICH)
    expect(result.hasHighTrace).toBe(true)
  })

  it('detects observable code', () => {
    const result = measureGhost(RICH)
    expect(result.hasObservable).toBe(true)
  })

  it('detects debuggable code', () => {
    const result = measureGhost(RICH)
    expect(result.hasDebuggable).toBe(true)
  })

  it('detects visible flow', () => {
    const result = measureGhost('function foo() { if (x) { return 1 } }')
    expect(result.hasVisibleFlow).toBe(true)
  })

  it('detects ghost code in MEDIUM content', () => {
    const result = measureGhost(MEDIUM)
    expect(result.hasNoGhostCode).toBe(false)
    expect(result.ghostCodeCount).toBe(1)
  })

  it('returns zero for empty content', () => {
    const result = measureGhost(EMPTY)
    expect(result.trace).toBe(0)
    expect(result.visibility).toBe('invisible')
  })
})

// ─── measureShadow ─────────────────────────────────────────────────────────

describe('measureShadow', () => {
  it('returns correct quality for RICH content', () => {
    const result = measureShadow(RICH)
    expect(result.quality).toBe(77)
  })

  it('returns correct accuracy for RICH content', () => {
    const result = measureShadow(RICH)
    expect(result.accuracy).toBe('clear-silhouette')
  })

  it('detects high quality', () => {
    const result = measureShadow(RICH)
    expect(result.hasHighQuality).toBe(true)
  })

  it('detects predictable code', () => {
    const result = measureShadow(RICH)
    expect(result.hasPredictable).toBe(true)
  })

  it('detects deterministic code', () => {
    const result = measureShadow('const x = 1; export class Foo { readonly bar = 1 }')
    expect(result.hasDeterministic).toBe(true)
  })

  it('detects no surprise', () => {
    const result = measureShadow(RICH)
    expect(result.hasNoSurprise).toBe(true)
    expect(result.surpriseCount).toBe(0)
  })

  it('detects no chaos', () => {
    const result = measureShadow(RICH)
    expect(result.hasNoChaos).toBe(true)
    expect(result.ambiguityCount).toBe(0)
  })

  it('returns zero for empty content', () => {
    const result = measureShadow(EMPTY)
    expect(result.quality).toBe(0)
    expect(result.accuracy).toBe('no-shadow')
  })
})

// ─── measureEcho ───────────────────────────────────────────────────────────

describe('measureEcho', () => {
  it('returns correct clarity for RICH content', () => {
    const result = measureEcho(RICH)
    expect(result.clarity).toBe(74)
  })

  it('returns correct resonance for RICH content', () => {
    const result = measureEcho(RICH)
    expect(result.resonance).toBe('clear-reverberation')
  })

  it('detects high clarity', () => {
    const result = measureEcho(RICH)
    expect(result.hasHighClarity).toBe(true)
  })

  it('detects error messages', () => {
    const result = measureEcho(RICH)
    expect(result.hasErrorMessages).toBe(false)
  })

  it('detects diagnostic code', () => {
    const result = measureEcho(RICH)
    expect(result.hasDiagnostic).toBe(true)
  })

  it('detects verbose code', () => {
    const result = measureEcho(RICH)
    expect(result.hasVerbose).toBe(true)
  })

  it('detects no silent failure in RICH', () => {
    const result = measureEcho(RICH)
    expect(result.hasNoSilentFailure).toBe(true)
  })

  it('returns zero for empty content', () => {
    const result = measureEcho(EMPTY)
    expect(result.clarity).toBe(0)
    expect(result.resonance).toBe('silence')
  })
})

// ─── measurePhantom ────────────────────────────────────────────────────────

describe('measurePhantom', () => {
  it('returns correct depth for RICH content', () => {
    const result = measurePhantom(RICH)
    expect(result.depth).toBe(91)
  })

  it('returns correct visibility for RICH content', () => {
    const result = measurePhantom(RICH)
    expect(result.visibility).toBe('fully-visible')
  })

  it('detects high depth', () => {
    const result = measurePhantom(RICH)
    expect(result.hasHighDepth).toBe(true)
  })

  it('detects visible abstractions', () => {
    const result = measurePhantom(RICH)
    expect(result.hasVisible).toBe(true)
  })

  it('detects transparent layers', () => {
    const result = measurePhantom(RICH)
    expect(result.hasTransparent).toBe(true)
  })

  it('detects no hidden complexity', () => {
    const result = measurePhantom(RICH)
    expect(result.hasNoHiddenComplexity).toBe(true)
    expect(result.hiddenComplexityCount).toBe(0)
  })

  it('detects no magic', () => {
    const result = measurePhantom(RICH)
    expect(result.hasNoMagic).toBe(true)
    expect(result.magicCount).toBe(0)
  })

  it('returns zero for empty content', () => {
    const result = measurePhantom(EMPTY)
    expect(result.depth).toBe(0)
    expect(result.visibility).toBe('invisible')
  })
})

// ─── measureFidelity ───────────────────────────────────────────────────────

describe('measureFidelity', () => {
  it('returns correct accuracy for RICH content', () => {
    const result = measureFidelity(RICH)
    expect(result.accuracy).toBe(72)
  })

  it('returns correct truth for RICH content', () => {
    const result = measureFidelity(RICH)
    expect(result.truth).toBe('high-accuracy')
  })

  it('detects high accuracy', () => {
    const result = measureFidelity(RICH)
    expect(result.hasHighAccuracy).toBe(true)
  })

  it('detects truthful documentation', () => {
    const result = measureFidelity(RICH)
    expect(result.hasTruthful).toBe(true)
  })

  it('detects no lying', () => {
    const result = measureFidelity(RICH)
    expect(result.hasNoLying).toBe(true)
    expect(result.lyingCount).toBe(0)
  })

  it('detects accurate documentation', () => {
    const result = measureFidelity(RICH)
    expect(result.hasAccurate).toBe(true)
  })

  it('returns zero for empty content', () => {
    const result = measureFidelity(EMPTY)
    expect(result.accuracy).toBe(0)
    expect(result.truth).toBe('fiction')
  })

  it('detects stale patterns with console.log', () => {
    const result = measureFidelity('console.log("x"); export function foo(): void {}')
    expect(result.hasNoStale).toBe(false)
    expect(result.staleCount).toBe(1)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies lucid-mirror at 90+', () => {
    expect(classifyCondition(90)).toBe('lucid-mirror')
  })
  it('classifies clear-reflection at 75-89', () => {
    expect(classifyCondition(75)).toBe('clear-reflection')
  })
  it('classifies ghostly-image at 60-74', () => {
    expect(classifyCondition(60)).toBe('ghostly-image')
  })
  it('classifies distorted-phantom at 45-59', () => {
    expect(classifyCondition(45)).toBe('distorted-phantom')
  })
  it('classifies shadowy-trace at 30-44', () => {
    expect(classifyCondition(30)).toBe('shadowy-trace')
  })
  it('classifies void below 30', () => {
    expect(classifyCondition(0)).toBe('void')
  })
})

// ─── classifyGalleryType ───────────────────────────────────────────────────

describe('classifyGalleryType', () => {
  it('returns darkness for empty reflections', () => {
    expect(classifyGalleryType([])).toBe('darkness')
  })

  it('returns correct type for mixed levels', () => {
    const rich = analyzePhantomReflection(RICH, 'rich.ts')
    const medium = analyzePhantomReflection(MEDIUM, 'medium.ts')
    const result = classifyGalleryType([rich, medium])
    expect(result).toBe('clouded-mirrors')
  })
})

// ─── classifyMediumGrade ───────────────────────────────────────────────────

describe('classifyMediumGrade', () => {
  it('classifies spirit-medium at 80+', () => {
    expect(classifyMediumGrade(80)).toBe('spirit-medium')
  })
  it('classifies mirror-master at 65-79', () => {
    expect(classifyMediumGrade(65)).toBe('mirror-master')
  })
  it('classifies ghost-whisperer at 50-64', () => {
    expect(classifyMediumGrade(50)).toBe('ghost-whisperer')
  })
  it('classifies apprentice-seer at 35-49', () => {
    expect(classifyMediumGrade(35)).toBe('apprentice-seer')
  })
  it('classifies blind-fortune-teller at 20-34', () => {
    expect(classifyMediumGrade(20)).toBe('blind-fortune-teller')
  })
  it('classifies skeptical-muggle below 20', () => {
    expect(classifyMediumGrade(0)).toBe('skeptical-muggle')
  })
})

// ─── classifyGalleryCondition ──────────────────────────────────────────────

describe('classifyGalleryCondition', () => {
  it('classifies perfect-reflections at 80+', () => {
    expect(classifyGalleryCondition(80)).toBe('perfect-reflections')
  })
  it('classifies clear-gallery at 65-79', () => {
    expect(classifyGalleryCondition(65)).toBe('clear-gallery')
  })
  it('classifies haunted-hall at 50-64', () => {
    expect(classifyGalleryCondition(50)).toBe('haunted-hall')
  })
  it('classifies foggy-corridor at 35-49', () => {
    expect(classifyGalleryCondition(35)).toBe('foggy-corridor')
  })
  it('classifies shattered-hall at 20-34', () => {
    expect(classifyGalleryCondition(20)).toBe('shattered-hall')
  })
  it('classifies abyss below 20', () => {
    expect(classifyGalleryCondition(0)).toBe('abyss')
  })
})

// ─── analyzePhantomReflection ──────────────────────────────────────────────

describe('analyzePhantomReflection', () => {
  it('returns correct values for RICH content', () => {
    const result = analyzePhantomReflection(RICH, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.reflection).toBe(86)
    expect(result.ghostTrace).toBe(76)
    expect(result.shadowQuality).toBe(77)
    expect(result.echoClarity).toBe(74)
    expect(result.phantomDepth).toBe(91)
    expect(result.mirrorFidelity).toBe(72)
    expect(result.qualityScore).toBe(79)
    expect(result.condition).toBe('clear-reflection')
  })

  it('returns correct values for MEDIUM content', () => {
    const result = analyzePhantomReflection(MEDIUM, 'medium.ts')
    expect(result.reflection).toBe(0)
    expect(result.ghostTrace).toBe(15)
    expect(result.shadowQuality).toBe(0)
    expect(result.echoClarity).toBe(0)
    expect(result.phantomDepth).toBe(7)
    expect(result.mirrorFidelity).toBe(6)
    expect(result.qualityScore).toBe(4)
    expect(result.condition).toBe('void')
  })

  it('returns correct values for EMPTY content', () => {
    const result = analyzePhantomReflection(EMPTY, 'empty.ts')
    expect(result.reflection).toBe(0)
    expect(result.qualityScore).toBe(0)
    expect(result.condition).toBe('void')
  })

  it('includes all measure objects', () => {
    const result = analyzePhantomReflection(RICH, 'rich.ts')
    expect(result.reflective).toBeDefined()
    expect(result.ghost).toBeDefined()
    expect(result.shadow).toBeDefined()
    expect(result.echo).toBeDefined()
    expect(result.phantom).toBeDefined()
    expect(result.fidelity).toBeDefined()
  })
})

// ─── analyzeMirrorGallery ──────────────────────────────────────────────────

describe('analyzeMirrorGallery', () => {
  it('returns empty gallery for no reflections', () => {
    const result = analyzeMirrorGallery([], '.')
    expect(result.directory).toBe('.')
    expect(result.reflections).toEqual([])
    expect(result.galleryType).toBe('darkness')
    expect(result.condition).toBe('abyss')
  })

  it('returns correct gallery for RICH+MEDIUM', () => {
    const rich = analyzePhantomReflection(RICH, 'rich.ts')
    const medium = analyzePhantomReflection(MEDIUM, 'medium.ts')
    const result = analyzeMirrorGallery([rich, medium], '.')
    expect(result.avgReflection).toBe(43)
    expect(result.avgEchoClarity).toBe(37)
    expect(result.avgFidelity).toBe(39)
    expect(result.clearCount).toBe(1)
    expect(result.voidCount).toBe(1)
    expect(result.galleryType).toBe('clouded-mirrors')
    expect(result.condition).toBe('foggy-corridor')
  })
})

// ─── buildPhantomMirrorResult ──────────────────────────────────────────────

describe('buildPhantomMirrorResult', () => {
  it('returns correct stats for RICH+MEDIUM', () => {
    const result = buildPhantomMirrorResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalGalleries).toBe(1)
    expect(result.stats.avgReflection).toBe(43)
    expect(result.stats.avgGhostTrace).toBe(46)
    expect(result.stats.avgShadowQuality).toBe(39)
    expect(result.stats.avgEchoClarity).toBe(37)
    expect(result.stats.avgPhantomDepth).toBe(49)
    expect(result.stats.avgMirrorFidelity).toBe(39)
    expect(result.stats.clearReflectionCount).toBe(1)
    expect(result.stats.voidCount).toBe(1)
    expect(result.stats.overallClarity).toBe(42)
    expect(result.stats.mediumGrade).toBe('apprentice-seer')
  })

  it('returns correct best files', () => {
    const result = buildPhantomMirrorResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.bestReflection).toBe('rich.ts')
    expect(result.stats.mostSelfAware).toBe('rich.ts')
    expect(result.stats.mostTraceable).toBe('rich.ts')
    expect(result.stats.mostPredictable).toBe('rich.ts')
    expect(result.stats.mostDebuggable).toBe('rich.ts')
    expect(result.stats.mostTransparent).toBe('rich.ts')
  })

  it('returns correct high-counts', () => {
    const result = buildPhantomMirrorResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.hasHighAwarenessCount).toBe(1)
    expect(result.stats.hasHighTraceCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighDepthCount).toBe(1)
    expect(result.stats.hasHighAccuracyCount).toBe(1)
  })

  it('returns correct mansion data', () => {
    const result = buildPhantomMirrorResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.mansion.avgReflection).toBe(43)
    expect(result.mansion.avgEchoClarity).toBe(37)
    expect(result.mansion.avgFidelity).toBe(39)
    expect(result.mansion.isClear).toBe(false)
    expect(result.mansion.overallClarity).toBe(42)
  })

  it('returns recommendations', () => {
    const result = buildPhantomMirrorResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildPhantomMirrorResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.reflections).toEqual([])
    expect(result.mansion.overallClarity).toBe(0)
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

  it('clarityColor handles all clarities', () => {
    expect(typeof clarityColor('perfect-reflection')).toBe('string')
    expect(typeof clarityColor('clear-mirror')).toBe('string')
    expect(typeof clarityColor('slightly-blurred')).toBe('string')
    expect(typeof clarityColor('distorted')).toBe('string')
    expect(typeof clarityColor('foggy')).toBe('string')
    expect(typeof clarityColor('blank-surface')).toBe('string')
  })

  it('visibilityColor handles all visibilities', () => {
    expect(typeof visibilityColor('luminous-trail')).toBe('string')
    expect(typeof visibilityColor('visible-footprints')).toBe('string')
    expect(typeof visibilityColor('fading-traces')).toBe('string')
    expect(typeof visibilityColor('dim-signals')).toBe('string')
    expect(typeof visibilityColor('barely-visible')).toBe('string')
    expect(typeof visibilityColor('invisible')).toBe('string')
  })

  it('accuracyColor handles all accuracies', () => {
    expect(typeof accuracyColor('sharp-shadow')).toBe('string')
    expect(typeof accuracyColor('clear-silhouette')).toBe('string')
    expect(typeof accuracyColor('recognizable')).toBe('string')
    expect(typeof accuracyColor('blurred-outline')).toBe('string')
    expect(typeof accuracyColor('faint-shadow')).toBe('string')
    expect(typeof accuracyColor('no-shadow')).toBe('string')
  })

  it('resonanceColor handles all resonances', () => {
    expect(typeof resonanceColor('crystal-echo')).toBe('string')
    expect(typeof resonanceColor('clear-reverberation')).toBe('string')
    expect(typeof resonanceColor('audible-feedback')).toBe('string')
    expect(typeof resonanceColor('muffled-echo')).toBe('string')
    expect(typeof resonanceColor('faint-whisper')).toBe('string')
    expect(typeof resonanceColor('silence')).toBe('string')
  })

  it('phantomVisibilityColor handles all visibilities', () => {
    expect(typeof phantomVisibilityColor('fully-visible')).toBe('string')
    expect(typeof phantomVisibilityColor('clearly-seen')).toBe('string')
    expect(typeof phantomVisibilityColor('partially-visible')).toBe('string')
    expect(typeof phantomVisibilityColor('translucent')).toBe('string')
    expect(typeof phantomVisibilityColor('barely-there')).toBe('string')
    expect(typeof phantomVisibilityColor('invisible')).toBe('string')
  })

  it('truthColor handles all truths', () => {
    expect(typeof truthColor('perfect-fidelity')).toBe('string')
    expect(typeof truthColor('high-accuracy')).toBe('string')
    expect(typeof truthColor('mostly-accurate')).toBe('string')
    expect(typeof truthColor('slightly-off')).toBe('string')
    expect(typeof truthColor('misleading')).toBe('string')
    expect(typeof truthColor('fiction')).toBe('string')
  })

  it('conditionColor handles all conditions', () => {
    expect(typeof conditionColor('lucid-mirror')).toBe('string')
    expect(typeof conditionColor('clear-reflection')).toBe('string')
    expect(typeof conditionColor('ghostly-image')).toBe('string')
    expect(typeof conditionColor('distorted-phantom')).toBe('string')
    expect(typeof conditionColor('shadowy-trace')).toBe('string')
    expect(typeof conditionColor('void')).toBe('string')
  })

  it('gradeColor handles all grades', () => {
    expect(typeof gradeColor('spirit-medium')).toBe('string')
    expect(typeof gradeColor('mirror-master')).toBe('string')
    expect(typeof gradeColor('ghost-whisperer')).toBe('string')
    expect(typeof gradeColor('apprentice-seer')).toBe('string')
    expect(typeof gradeColor('blind-fortune-teller')).toBe('string')
    expect(typeof gradeColor('skeptical-muggle')).toBe('string')
  })

  it('color helpers return input for unknown values', () => {
    expect(clarityColor('unknown')).toBe('unknown')
    expect(visibilityColor('unknown')).toBe('unknown')
    expect(accuracyColor('unknown')).toBe('unknown')
    expect(resonanceColor('unknown')).toBe('unknown')
    expect(phantomVisibilityColor('unknown')).toBe('unknown')
    expect(truthColor('unknown')).toBe('unknown')
    expect(conditionColor('unknown')).toBe('unknown')
    expect(gradeColor('unknown')).toBe('unknown')
  })

  it('formatPhantomMirrorJson returns valid JSON', () => {
    const result = buildPhantomMirrorResult(['rich.ts'], [RICH])
    const json = formatPhantomMirrorJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formatPhantomMirrorTable returns string with header', () => {
    const result = buildPhantomMirrorResult(['rich.ts'], [RICH])
    const table = formatPhantomMirrorTable(result, false)
    expect(table).toContain('Phantom Mirror Analysis')
    expect(table).toContain('Mansion Overview')
    expect(table).toContain('Statistics')
  })

  it('formatPhantomMirrorTable includes per-file details when verbose', () => {
    const result = buildPhantomMirrorResult(['rich.ts'], [RICH])
    const table = formatPhantomMirrorTable(result, true)
    expect(table).toContain('Per-File Reflections')
    expect(table).toContain('rich.ts')
  })

  it('formatPhantomMirrorTable includes recommendations', () => {
    const result = buildPhantomMirrorResult(['medium.ts'], [MEDIUM])
    const table = formatPhantomMirrorTable(result, false)
    expect(table).toContain('Recommendations')
  })
})
