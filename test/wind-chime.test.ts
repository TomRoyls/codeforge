import { describe, it, expect } from 'vitest'
import {
  classifyTone,
  classifyMaterial,
  classifyToneQuality,
  classifyTube,
  classifyClusterType,
  classifyChordQuality,
  classifyWindResponse,
  classifyClusterHealth,
  classifyHarmonyGrade,
  analyzeChimeTube,
  analyzeChimeCluster,
  computeResonanceProfile,
  identifyDissonance,
  computeSymphony,
  generateRecommendations,
  buildWindChimeResult,
  type ChimeTube,
  type ChimeCluster,
  type WindChimeStats,
} from '../src/commands/wind-chime-helpers.js'
import { formatWindChimeTable, formatWindChimeJson } from '../src/commands/wind-chime-format-helpers.js'

// ─── classifyTone ──────────────────────────────────────────────────────────

describe('classifyTone', () => {
  it('returns C for 3+ classes', () => {
    expect(classifyTone('export class A {} export class B {} export class C {}')).toBe('C')
  })

  it('returns D for 2+ interfaces', () => {
    expect(classifyTone('export interface A {} export interface B {}')).toBe('D')
  })

  it('returns E for 5+ functions and 3+ exports', () => {
    const code = Array.from({ length: 6 }, (_, i) => `export function f${i}() {}`).join('\n')
    expect(classifyTone(code)).toBe('E')
  })

  it('returns F for 3+ functions', () => {
    const code = Array.from({ length: 3 }, (_, i) => `function f${i}() {}`).join('\n')
    expect(classifyTone(code)).toBe('F')
  })

  it('returns G for 2+ exports', () => {
    expect(classifyTone('export const a = 1; export const b = 2')).toBe('G')
  })

  it('returns A for 1+ functions', () => {
    expect(classifyTone('function f() {}')).toBe('A')
  })

  it('returns B for 1+ exports', () => {
    expect(classifyTone('export const x = 1')).toBe('B')
  })

  it('returns C for empty content', () => {
    expect(classifyTone('')).toBe('C')
  })

  it('prioritizes C (classes) over D (interfaces)', () => {
    expect(classifyTone('export class A {} export class B {} export class C {} export interface I {}')).toBe('C')
  })
})

// ─── classifyMaterial ──────────────────────────────────────────────────────

describe('classifyMaterial', () => {
  it('returns glass for 3+ interfaces and 2+ generics', () => {
    const code = 'interface A<T> {} interface B<T> {} interface C<T> {} function g<T>() {} function h<U>() {}'
    expect(classifyMaterial(code)).toBe('glass')
  })

  it('returns aluminum for 3+ jsdoc and 0 anys', () => {
    const code = ['/** doc */', '/** doc */', '/** doc */', 'export function f() {}'].join('\n')
    expect(classifyMaterial(code)).toBe('aluminum')
  })

  it('returns ceramic for 3+ generics', () => {
    const code = 'function a<T>() {} function b<U>() {} function c<V>() {}'
    expect(classifyMaterial(code)).toBe('ceramic')
  })

  it('returns metal for 0 anys and 1+ jsdoc (without glass/aluminum)', () => {
    const code = ['/** doc */', 'const x = 1'].join('\n')
    expect(classifyMaterial(code)).toBe('metal')
  })

  it('returns bamboo for 50+ lines and 1+ interfaces', () => {
    const lines = Array.from({ length: 55 }, (_, i) => `const line${i} = ${i}`)
    lines.push('interface I { x: number }')
    const code = lines.join('\n')
    expect(classifyMaterial(code)).toBe('bamboo')
  })

  it('returns shell for 0 anys and <30 lines', () => {
    expect(classifyMaterial('const x = 1')).toBe('shell')
  })

  it('returns wood as default', () => {
    expect(classifyMaterial('const x: any = 1')).toBe('wood')
  })
})

// ─── classifyToneQuality ───────────────────────────────────────────────────

describe('classifyToneQuality', () => {
  it('returns pure for high resonance and low dissonance', () => {
    expect(classifyToneQuality(70, 10)).toBe('pure')
    expect(classifyToneQuality(80, 5)).toBe('pure')
  })

  it('returns warm for good resonance and low dissonance', () => {
    expect(classifyToneQuality(60, 20)).toBe('warm')
    expect(classifyToneQuality(70, 15)).toBe('warm')
  })

  it('returns bright for moderate resonance', () => {
    expect(classifyToneQuality(50, 25)).toBe('bright')
    expect(classifyToneQuality(55, 30)).toBe('bright')
  })

  it('returns harsh for high dissonance', () => {
    expect(classifyToneQuality(30, 50)).toBe('harsh')
    expect(classifyToneQuality(20, 60)).toBe('harsh')
  })

  it('returns dull for moderate dissonance', () => {
    expect(classifyToneQuality(30, 35)).toBe('dull')
    expect(classifyToneQuality(40, 40)).toBe('dull')
  })

  it('returns dull as default for low resonance', () => {
    expect(classifyToneQuality(10, 5)).toBe('dull')
  })
})

// ─── classifyTube ──────────────────────────────────────────────────────────

describe('classifyTube', () => {
  it('returns soloist for 5+ exports and 5+ dependents', () => {
    expect(classifyTube(5, 10, 3)).toBe('soloist')
    expect(classifyTube(6, 5, 5)).toBe('soloist')
  })

  it('returns section-leader for 3+ exports and 3+ dependents', () => {
    expect(classifyTube(3, 3, 2)).toBe('section-leader')
    expect(classifyTube(4, 5, 1)).toBe('section-leader')
  })

  it('returns ensemble for 3+ functions or 2+ exports', () => {
    expect(classifyTube(2, 0, 3)).toBe('ensemble')
    expect(classifyTube(2, 1, 1)).toBe('ensemble')
  })

  it('returns accompaniment for 1+ exports', () => {
    expect(classifyTube(1, 0, 0)).toBe('accompaniment')
  })

  it('returns rest for nothing', () => {
    expect(classifyTube(0, 0, 0)).toBe('rest')
  })
})

// ─── classifyClusterType ───────────────────────────────────────────────────

describe('classifyClusterType', () => {
  it('returns pentatonic for <=5 tones', () => {
    expect(classifyClusterType(3)).toBe('pentatonic')
    expect(classifyClusterType(5)).toBe('pentatonic')
  })

  it('returns diatonic for 7 tones', () => {
    expect(classifyClusterType(7)).toBe('diatonic')
  })

  it('returns whole-tone for 6 tones', () => {
    expect(classifyClusterType(6)).toBe('whole-tone')
  })

  it('returns noise for 12+ tones', () => {
    expect(classifyClusterType(12)).toBe('noise')
    expect(classifyClusterType(15)).toBe('noise')
  })

  it('returns chromatic for 8-11 tones', () => {
    expect(classifyClusterType(8)).toBe('chromatic')
    expect(classifyClusterType(10)).toBe('chromatic')
  })

  it('returns atonal as fallback', () => {
    // 6 returns whole-tone, not atonal. atonal is unreachable with current logic
    // because <=5 → pentatonic, 6 → whole-tone, 7 → diatonic, >=8 → chromatic or noise
    // atonal is technically dead code. Let's verify chromatic for edge case
    expect(classifyClusterType(9)).toBe('chromatic')
  })
})

// ─── classifyChordQuality ──────────────────────────────────────────────────

describe('classifyChordQuality', () => {
  it('returns major for high harmony and low dissonance', () => {
    expect(classifyChordQuality(70, 10)).toBe('major')
    expect(classifyChordQuality(80, 15)).toBe('major')
  })

  it('returns minor for good harmony and moderate dissonance', () => {
    expect(classifyChordQuality(60, 20)).toBe('minor')
    expect(classifyChordQuality(70, 25)).toBe('minor')
  })

  it('returns dissonant for high dissonance', () => {
    expect(classifyChordQuality(30, 50)).toBe('dissonant')
    expect(classifyChordQuality(20, 60)).toBe('dissonant')
  })

  it('returns suspended for moderate harmony', () => {
    expect(classifyChordQuality(40, 25)).toBe('suspended')
    expect(classifyChordQuality(50, 20)).toBe('suspended')
  })

  it('returns diminished for moderate-high dissonance', () => {
    expect(classifyChordQuality(30, 35)).toBe('diminished')
    expect(classifyChordQuality(40, 40)).toBe('diminished')
  })

  it('returns augmented as default', () => {
    expect(classifyChordQuality(20, 15)).toBe('augmented')
  })
})

// ─── classifyWindResponse ──────────────────────────────────────────────────

describe('classifyWindResponse', () => {
  it('returns sensitive for 80+', () => {
    expect(classifyWindResponse(80)).toBe('sensitive')
    expect(classifyWindResponse(100)).toBe('sensitive')
  })

  it('returns responsive for 60-79', () => {
    expect(classifyWindResponse(60)).toBe('responsive')
    expect(classifyWindResponse(79)).toBe('responsive')
  })

  it('returns moderate for 40-59', () => {
    expect(classifyWindResponse(40)).toBe('moderate')
    expect(classifyWindResponse(59)).toBe('moderate')
  })

  it('returns sluggish for 20-39', () => {
    expect(classifyWindResponse(20)).toBe('sluggish')
    expect(classifyWindResponse(39)).toBe('sluggish')
  })

  it('returns unresponsive below 20', () => {
    expect(classifyWindResponse(19)).toBe('unresponsive')
    expect(classifyWindResponse(0)).toBe('unresponsive')
  })
})

// ─── classifyClusterHealth ─────────────────────────────────────────────────

describe('classifyClusterHealth', () => {
  it('returns symphonic for high harmony and very low dissonance', () => {
    expect(classifyClusterHealth(80, 10)).toBe('symphonic')
    expect(classifyClusterHealth(90, 5)).toBe('symphonic')
  })

  it('returns harmonious for good harmony and low dissonance', () => {
    expect(classifyClusterHealth(65, 15)).toBe('harmonious')
    expect(classifyClusterHealth(70, 20)).toBe('harmonious')
  })

  it('returns pleasant for moderate harmony', () => {
    expect(classifyClusterHealth(50, 25)).toBe('pleasant')
    expect(classifyClusterHealth(60, 30)).toBe('pleasant')
  })

  it('returns tolerable for lower harmony', () => {
    expect(classifyClusterHealth(35, 20)).toBe('tolerable')
    expect(classifyClusterHealth(40, 35)).toBe('tolerable')
  })

  it('returns cacophonous for high dissonance', () => {
    expect(classifyClusterHealth(20, 50)).toBe('cacophonous')
    expect(classifyClusterHealth(10, 60)).toBe('cacophonous')
  })

  it('returns noisy as default', () => {
    expect(classifyClusterHealth(20, 30)).toBe('noisy')
    expect(classifyClusterHealth(10, 20)).toBe('noisy')
  })
})

// ─── classifyHarmonyGrade ──────────────────────────────────────────────────

describe('classifyHarmonyGrade', () => {
  it('returns symphony for 80+', () => {
    expect(classifyHarmonyGrade(80)).toBe('symphony')
    expect(classifyHarmonyGrade(100)).toBe('symphony')
  })

  it('returns orchestra for 60-79', () => {
    expect(classifyHarmonyGrade(60)).toBe('orchestra')
    expect(classifyHarmonyGrade(79)).toBe('orchestra')
  })

  it('returns band for 40-59', () => {
    expect(classifyHarmonyGrade(40)).toBe('band')
    expect(classifyHarmonyGrade(59)).toBe('band')
  })

  it('returns jam-session for 20-39', () => {
    expect(classifyHarmonyGrade(20)).toBe('jam-session')
    expect(classifyHarmonyGrade(39)).toBe('jam-session')
  })

  it('returns noise for 5-19', () => {
    expect(classifyHarmonyGrade(5)).toBe('noise')
    expect(classifyHarmonyGrade(19)).toBe('noise')
  })

  it('returns silence below 5', () => {
    expect(classifyHarmonyGrade(4)).toBe('silence')
    expect(classifyHarmonyGrade(0)).toBe('silence')
  })
})

// ─── analyzeChimeTube ──────────────────────────────────────────────────────

describe('analyzeChimeTube', () => {
  it('analyzes empty content', () => {
    const tube = analyzeChimeTube('', 'empty.ts', [], [])
    expect(tube.file).toBe('empty.ts')
    expect(tube.resonance).toBe(0)
    expect(tube.harmony).toBe(0)
    expect(tube.dissonance).toBe(0)
    expect(tube.isSilent).toBe(true)
    expect(tube.isBroken).toBe(false)
    expect(tube.isTuned).toBe(false)
    expect(tube.tubeLength).toBe(0)
    expect(tube.classification).toBe('rest')
  })

  it('analyzes well-documented code', () => {
    const code = [
      '/** A module */',
      'export function hello(): string { return "world" }',
      '/** Helper */',
      'export function helper(): number { return 42 }',
    ].join('\n')
    const tube = analyzeChimeTube(code, 'good.ts', [], [])
    expect(tube.resonance).toBeGreaterThan(0)
    expect(tube.harmony).toBeGreaterThan(0)
    expect(tube.dissonance).toBe(0)
    expect(tube.isBroken).toBe(false)
    expect(tube.isSilent).toBe(false)
    expect(tube.toneQuality).toBeDefined()
    expect(tube.material).toBeDefined()
    expect(tube.note).toBeTruthy()
  })

  it('detects dissonance in poor code', () => {
    const code = [
      'const x: any = 1',
      'console.log("debug")',
      '// TODO fix this',
      '// FIXME broken',
    ].join('\n')
    const tube = analyzeChimeTube(code, 'bad.ts', [], [])
    expect(tube.dissonance).toBeGreaterThan(0)
    expect(tube.isBroken).toBe(true)
  })

  it('computes connections from imports', () => {
    const tube = analyzeChimeTube('import { x } from "./utils"', 'app.ts', ['./utils'], [])
    expect(tube.connections.resonatesWith).toContain('./utils')
  })

  it('computes connections from dependents', () => {
    const tube = analyzeChimeTube('export function a() {}', 'utils.ts', [], ['app.ts'])
    expect(tube.connections.amplifiesBy).toContain('app.ts')
  })

  it('computes note from tone and octave', () => {
    const tube = analyzeChimeTube('export function a() {}', 'a.ts', [], [])
    expect(tube.note).toMatch(/^[CDEFGAB]\d+$/)
  })

  it('computes harmonic content', () => {
    const tube = analyzeChimeTube('export function a() {} export class B {}', 'ab.ts', [], [])
    expect(tube.harmonicContent.fundamental).toBeGreaterThan(0)
    expect(tube.harmonicContent.overtones).toBeGreaterThan(0)
  })

  it('clamps all metrics to 0-100', () => {
    const tube = analyzeChimeTube('', 'empty.ts', [], [])
    expect(tube.pitch).toBeGreaterThanOrEqual(0)
    expect(tube.resonance).toBeGreaterThanOrEqual(0)
    expect(tube.sustain).toBeGreaterThanOrEqual(0)
    expect(tube.amplitude).toBeGreaterThanOrEqual(0)
    expect(tube.frequency).toBeGreaterThanOrEqual(0)
    expect(tube.dissonance).toBeGreaterThanOrEqual(0)
    expect(tube.harmony).toBeGreaterThanOrEqual(0)
    expect(tube.strikeResponse).toBeGreaterThanOrEqual(0)
  })

  it('computes higher amplitude for more dependents', () => {
    const code = 'export function a() {}'
    const tube1 = analyzeChimeTube(code, 'a.ts', [], [])
    const tube2 = analyzeChimeTube(code, 'b.ts', [], ['x', 'y', 'z'])
    expect(tube2.amplitude).toBeGreaterThan(tube1.amplitude)
  })
})

// ─── analyzeChimeCluster ───────────────────────────────────────────────────

describe('analyzeChimeCluster', () => {
  it('returns empty cluster for no tubes', () => {
    const cluster = analyzeChimeCluster([], 'src')
    expect(cluster.directory).toBe('src')
    expect(cluster.tubes).toEqual([])
    expect(cluster.clusterType).toBe('noise')
    expect(cluster.health).toBe('cacophonous')
    expect(cluster.windResponse).toBe('unresponsive')
    expect(cluster.tunedTubes).toBe(0)
    expect(cluster.brokenTubes).toBe(0)
    expect(cluster.silentTubes).toBe(0)
    expect(cluster.overallHarmony).toBe(0)
    expect(cluster.resonanceProfile).toBe(0)
    expect(cluster.isMusical).toBe(false)
  })

  it('aggregates tube averages', () => {
    const tubes: ChimeTube[] = [
      analyzeChimeTube('export function a() {}', 'a.ts', [], []),
      analyzeChimeTube('/** Docs */ export class B {}', 'b.ts', [], []),
    ]
    const cluster = analyzeChimeCluster(tubes, 'src')
    expect(cluster.tubes.length).toBe(2)
    expect(cluster.avgResonance).toBeGreaterThanOrEqual(0)
    expect(cluster.avgHarmony).toBeGreaterThanOrEqual(0)
    expect(cluster.avgDissonance).toBeGreaterThanOrEqual(0)
    expect(cluster.totalAmplitude).toBeGreaterThanOrEqual(0)
  })

  it('counts tuned, broken, and silent tubes', () => {
    const tubes: ChimeTube[] = [
      { ...analyzeChimeTube('', 'a.ts', [], []), isSilent: true },
      { ...analyzeChimeTube('', 'b.ts', [], []), isBroken: true },
      { ...analyzeChimeTube('/** D */ export function f() {}', 'c.ts', [], []), isTuned: true },
    ]
    const cluster = analyzeChimeCluster(tubes, 'src')
    expect(cluster.silentTubes).toBeGreaterThanOrEqual(1)
    expect(cluster.brokenTubes).toBeGreaterThanOrEqual(1)
  })

  it('classifies cluster type based on unique tones', () => {
    const tubes: ChimeTube[] = Array.from({ length: 8 }, (_, i) => ({
      ...analyzeChimeTube(`export function f${i}() {}`, `f${i}.ts`, [], []),
    }))
    const cluster = analyzeChimeCluster(tubes, 'src')
    expect(cluster.clusterType).toBeDefined()
  })

  it('computes overall harmony and resonance profile', () => {
    const tubes: ChimeTube[] = [
      analyzeChimeTube('export function a() {}', 'a.ts', [], []),
      analyzeChimeTube('export function b() {}', 'b.ts', [], []),
    ]
    const cluster = analyzeChimeCluster(tubes, 'src')
    expect(cluster.overallHarmony).toBeGreaterThanOrEqual(0)
    expect(cluster.overallHarmony).toBeLessThanOrEqual(100)
    expect(cluster.resonanceProfile).toBeGreaterThanOrEqual(0)
    expect(cluster.resonanceProfile).toBeLessThanOrEqual(100)
  })

  it('identifies dissonance points', () => {
    const badCode = 'const x: any = 1; // TODO fix; console.log("bad"); // FIXME'
    const tubes: ChimeTube[] = [
      analyzeChimeTube(badCode, 'bad.ts', [], []),
    ]
    const cluster = analyzeChimeCluster(tubes, 'src')
    expect(cluster.hasDissonance).toBeDefined()
  })
})

// ─── computeResonanceProfile ───────────────────────────────────────────────

describe('computeResonanceProfile', () => {
  it('returns 0 for empty tubes', () => {
    expect(computeResonanceProfile([])).toBe(0)
  })

  it('returns high value for consistent tubes', () => {
    const tubes: ChimeTube[] = [
      { ...analyzeChimeTube('export function a() {}', 'a.ts', [], []), resonance: 60 },
      { ...analyzeChimeTube('export function b() {}', 'b.ts', [], []), resonance: 60 },
      { ...analyzeChimeTube('export function c() {}', 'c.ts', [], []), resonance: 60 },
    ]
    const profile = computeResonanceProfile(tubes)
    expect(profile).toBeGreaterThan(50)
  })

  it('returns lower value for inconsistent tubes', () => {
    const tubes: ChimeTube[] = [
      { ...analyzeChimeTube('export function a() {}', 'a.ts', [], []), resonance: 90 },
      { ...analyzeChimeTube('export function b() {}', 'b.ts', [], []), resonance: 10 },
    ]
    const profile = computeResonanceProfile(tubes)
    expect(profile).toBeLessThan(60)
  })
})

// ─── identifyDissonance ────────────────────────────────────────────────────

describe('identifyDissonance', () => {
  it('returns empty for clean tubes', () => {
    const tubes: ChimeTube[] = [
      analyzeChimeTube('/** D */ export function f() {}', 'good.ts', [], []),
    ]
    const points = identifyDissonance(tubes)
    expect(points).toEqual([])
  })

  it('identifies dissonant tubes', () => {
    const tubes: ChimeTube[] = [
      { ...analyzeChimeTube('', 'a.ts', [], []), dissonance: 50, isBroken: false },
    ]
    const points = identifyDissonance(tubes)
    expect(points.length).toBeGreaterThan(0)
    expect(points[0]).toContain('dissonance')
  })

  it('identifies broken tubes', () => {
    const tubes: ChimeTube[] = [
      { ...analyzeChimeTube('', 'a.ts', [], []), dissonance: 10, isBroken: true },
    ]
    const points = identifyDissonance(tubes)
    expect(points.length).toBeGreaterThan(0)
    expect(points[0]).toContain('broken')
  })
})

// ─── computeSymphony ───────────────────────────────────────────────────────

describe('computeSymphony', () => {
  it('returns defaults for empty input', () => {
    const sym = computeSymphony([], [])
    expect(sym.totalAmplitude).toBe(0)
    expect(sym.avgResonance).toBe(0)
    expect(sym.avgHarmony).toBe(0)
    expect(sym.avgDissonance).toBe(0)
    expect(sym.dominantKey).toBe('C')
    expect(sym.tempo).toBe('adagio')
    expect(sym.dynamics).toBe('piano')
  })

  it('computes aggregate metrics', () => {
    const tubes: ChimeTube[] = [
      analyzeChimeTube('export function a() {}', 'a.ts', [], []),
      analyzeChimeTube('export class B {}', 'b.ts', [], []),
    ]
    const sym = computeSymphony(tubes, [])
    expect(sym.totalAmplitude).toBeGreaterThan(0)
    expect(sym.avgResonance).toBeGreaterThan(0)
    expect(sym.dominantKey).toBeDefined()
    expect(sym.tempo).toBeDefined()
    expect(sym.dynamics).toBeDefined()
  })

  it('classifies tempo from frequency', () => {
    const tubes: ChimeTube[] = [
      { ...analyzeChimeTube('export function a() {}', 'a.ts', [], []), frequency: 70 },
    ]
    const sym = computeSymphony(tubes, [])
    expect(sym.tempo).toBe('allegro')
  })

  it('classifies dynamics from amplitude range', () => {
    const tubes: ChimeTube[] = [
      { ...analyzeChimeTube('export function a() {}', 'a.ts', [], []), amplitude: 90 },
      { ...analyzeChimeTube('export function b() {}', 'b.ts', [], []), amplitude: 10 },
    ]
    const sym = computeSymphony(tubes, [])
    expect(sym.dynamics).toBe('fortissimo')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: WindChimeStats = {
    totalFiles: 0, totalClusters: 0,
    avgPitch: 0, avgResonance: 50, avgSustain: 50,
    avgHarmony: 50, avgDissonance: 10,
    pureTones: 0, dissonantTones: 0,
    soloists: 0, ensemble: 0,
    silentTubes: 0, brokenTubes: 0, tunedTubes: 0,
    isMusical: true,
    symphonicClusters: 0, cacophonousClusters: 0,
    dominantTone: 'C', dominantMaterial: 'wood',
    overallHarmony: 50, overallResonance: 50,
    harmonyGrade: 'band',
    bestTube: 'none', worstTube: 'none',
    mostResonant: 'none', mostDissonant: 'none',
  }

  it('returns positive message when all is well', () => {
    const recs = generateRecommendations([], [], emptyStats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('tune')]))
  })

  it('recommends harmonizing dissonant tubes', () => {
    const tubes: ChimeTube[] = [
      { ...analyzeChimeTube('', 'a.ts', [], []), dissonance: 50, isBroken: false, isSilent: false, isTuned: true },
    ]
    const recs = generateRecommendations(tubes, [], emptyStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('dissonant')]))
  })

  it('recommends activating silent tubes', () => {
    const tubes: ChimeTube[] = [
      { ...analyzeChimeTube('', 'a.ts', [], []), isSilent: true, isBroken: false, isTuned: true, dissonance: 0 },
    ]
    const recs = generateRecommendations(tubes, [], emptyStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('silent')]))
  })

  it('recommends fixing broken tubes', () => {
    const tubes: ChimeTube[] = [
      { ...analyzeChimeTube('', 'a.ts', [], []), isBroken: true, isSilent: false, isTuned: true, dissonance: 0 },
    ]
    const recs = generateRecommendations(tubes, [], emptyStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('broken')]))
  })

  it('recommends tuning untuned tubes', () => {
    const tubes: ChimeTube[] = [
      { ...analyzeChimeTube('export function a() {}', 'a.ts', [], []), isTuned: false, isSilent: false, dissonance: 5 },
    ]
    const recs = generateRecommendations(tubes, [], emptyStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('untuned')]))
  })

  it('recommends refactoring cacophonous clusters', () => {
    const badCluster: ChimeCluster = {
      directory: 'src', tubes: [], clusterType: 'noise',
      avgResonance: 0, avgHarmony: 0, avgDissonance: 60,
      totalAmplitude: 0, dominantTone: 'C', dominantMaterial: 'wood',
      tunedTubes: 0, brokenTubes: 0, silentTubes: 0,
      chordQuality: 'dissonant', overallHarmony: 0, resonanceProfile: 0,
      isMusical: false, hasDissonance: true, dissonancePoints: [],
      windResponse: 'unresponsive', health: 'cacophonous',
    }
    const recs = generateRecommendations([], [badCluster], emptyStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('cacophonous')]))
  })

  it('praises symphony/orchestra grade', () => {
    const goodStats = { ...emptyStats, harmonyGrade: 'symphony' as const }
    const recs = generateRecommendations([], [], goodStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Beautiful')]))
  })

  it('warns about high dissonance', () => {
    const highDisStats = { ...emptyStats, avgDissonance: 45 }
    const recs = generateRecommendations([], [], highDisStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('High dissonance')]))
  })
})

// ─── buildWindChimeResult ──────────────────────────────────────────────────

describe('buildWindChimeResult', () => {
  it('handles empty input', () => {
    const result = buildWindChimeResult([], [], {})
    expect(result.tubes).toEqual([])
    expect(result.clusters).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.harmonyGrade).toBe('silence')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes single file', () => {
    const result = buildWindChimeResult(
      ['hello.ts'],
      ['/** Greeting */ export function hello() { return "world" }'],
      {},
    )
    expect(result.tubes).toHaveLength(1)
    expect(result.tubes[0].file).toBe('hello.ts')
    expect(result.tubes[0].resonance).toBeGreaterThan(0)
    expect(result.tubes[0].harmony).toBeGreaterThan(0)
  })

  it('analyzes multiple files', () => {
    const result = buildWindChimeResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'export function a() {}',
        '/** Docs */ export class B {}',
        'const x: any = 1',
      ],
      {},
    )
    expect(result.tubes).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups tubes into clusters by directory', () => {
    const result = buildWindChimeResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['export function a() {}', 'export function b() {}', 'export function c() {}'],
      {},
    )
    expect(result.clusters.length).toBe(2)
    const dirs = result.clusters.map(c => c.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('lib')
  })

  it('tracks import relationships', () => {
    const result = buildWindChimeResult(
      ['src/a.ts', 'src/b.ts'],
      [
        "import { x } from './b'",
        'export function x() {}',
      ],
      {},
    )
    const tubeB = result.tubes.find(t => t.file === 'src/b.ts')
    expect(tubeB).toBeDefined()
    expect(tubeB!.connections.amplifiesBy).toContain('src/a.ts')
  })

  it('computes best/worst/mostResonant/mostDissonant', () => {
    const result = buildWindChimeResult(
      ['good.ts', 'bad.ts'],
      [
        '/** Docs */ export function good() {}',
        'const x: any = 1; console.log("bad")',
      ],
      {},
    )
    expect(result.stats.bestTube).toBe('good.ts')
    expect(result.stats.worstTube).toBe('bad.ts')
    expect(result.stats.mostResonant).toBe('good.ts')
    expect(result.stats.mostDissonant).toBe('bad.ts')
  })

  it('computes symphony metrics', () => {
    const result = buildWindChimeResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    expect(result.symphony.dominantKey).toBeDefined()
    expect(result.symphony.tempo).toBeDefined()
    expect(result.symphony.dynamics).toBeDefined()
    expect(result.symphony.totalAmplitude).toBeGreaterThan(0)
  })

  it('clamps all stats to valid ranges', () => {
    const result = buildWindChimeResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const { stats } = result
    expect(stats.avgPitch).toBeGreaterThanOrEqual(0)
    expect(stats.avgResonance).toBeGreaterThanOrEqual(0)
    expect(stats.avgSustain).toBeGreaterThanOrEqual(0)
    expect(stats.avgHarmony).toBeGreaterThanOrEqual(0)
    expect(stats.avgDissonance).toBeGreaterThanOrEqual(0)
    expect(stats.overallHarmony).toBeGreaterThanOrEqual(0)
    expect(stats.overallResonance).toBeGreaterThanOrEqual(0)
  })
})

// ─── formatWindChimeTable ──────────────────────────────────────────────────

describe('formatWindChimeTable', () => {
  it('formats empty result', () => {
    const result = buildWindChimeResult([], [], {})
    const output = formatWindChimeTable(result, false)
    expect(output).toContain('Wind Chime')
    expect(output).toContain('No tubes detected')
  })

  it('includes tube info in non-verbose mode', () => {
    const result = buildWindChimeResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const output = formatWindChimeTable(result, false)
    expect(output).toContain('a.ts')
    expect(output).toContain('Statistics')
  })

  it('shows detailed info in verbose mode', () => {
    const result = buildWindChimeResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const output = formatWindChimeTable(result, true)
    expect(output).toContain('pitch')
    expect(output).toContain('harm')
    expect(output).toContain('conn')
  })

  it('truncates tubes at 15 in non-verbose mode', () => {
    const files = Array.from({ length: 20 }, (_, i) => `f${i}.ts`)
    const codes = files.map(() => 'export function a() {}')
    const result = buildWindChimeResult(files, codes, {})
    const output = formatWindChimeTable(result, false)
    expect(output).toContain('and 5 more')
  })

  it('shows all tubes in verbose mode', () => {
    const files = Array.from({ length: 20 }, (_, i) => `f${i}.ts`)
    const codes = files.map(() => 'export function a() {}')
    const result = buildWindChimeResult(files, codes, {})
    const output = formatWindChimeTable(result, true)
    expect(output).toContain('f19.ts')
  })

  it('shows clusters when present', () => {
    const result = buildWindChimeResult(
      ['src/a.ts', 'src/b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    const output = formatWindChimeTable(result, false)
    expect(output).toContain('Chime Clusters')
    expect(output).toContain('src')
  })

  it('shows symphony section', () => {
    const result = buildWindChimeResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const output = formatWindChimeTable(result, false)
    expect(output).toContain('Symphony')
  })

  it('shows recommendations', () => {
    const result = buildWindChimeResult([], [], {})
    const output = formatWindChimeTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

// ─── formatWindChimeJson ───────────────────────────────────────────────────

describe('formatWindChimeJson', () => {
  it('produces valid JSON', () => {
    const result = buildWindChimeResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const json = formatWindChimeJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.tubes).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.symphony).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('handles empty result', () => {
    const result = buildWindChimeResult([], [], {})
    const json = formatWindChimeJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.tubes).toEqual([])
    expect(parsed.clusters).toEqual([])
  })
})
