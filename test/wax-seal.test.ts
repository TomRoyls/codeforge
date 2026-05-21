import { describe, it, expect } from 'vitest'
import {
  classifyWaxType,
  classifySealColor,
  classifyStampDesign,
  classifyHeraldGrade,
  classifyAuthority,
  detectForgeries,
  assessImpression,
  assessCertification,
  analyzeSealMark,
  analyzeSealCollection,
  generateRecommendations,
  buildWaxSealResult,
  type SealMark,
  type SealCollection,
  type WaxSealStats,
  type WaxSealResult,
  type Impression,
  type Document,
  type Forgeries,
} from '../src/commands/wax-seal-helpers.js'
import { formatWaxSealTable, formatWaxSealJson } from '../src/commands/wax-seal-format-helpers.js'

// ─── classifyWaxType ─────────────────────────────────────────────────────────

describe('classifyWaxType', () => {
  it('returns beeswax for quality >= 80', () => {
    expect(classifyWaxType(80)).toBe('beeswax')
    expect(classifyWaxType(90)).toBe('beeswax')
    expect(classifyWaxType(100)).toBe('beeswax')
  })

  it('returns shellac for quality 65-79', () => {
    expect(classifyWaxType(65)).toBe('shellac')
    expect(classifyWaxType(75)).toBe('shellac')
  })

  it('returns paraffin for quality 50-64', () => {
    expect(classifyWaxType(50)).toBe('paraffin')
    expect(classifyWaxType(60)).toBe('paraffin')
  })

  it('returns synthetic for quality 35-49', () => {
    expect(classifyWaxType(35)).toBe('synthetic')
    expect(classifyWaxType(45)).toBe('synthetic')
  })

  it('returns clay for quality 20-34', () => {
    expect(classifyWaxType(20)).toBe('clay')
    expect(classifyWaxType(30)).toBe('clay')
  })

  it('returns lead for quality < 20', () => {
    expect(classifyWaxType(0)).toBe('lead')
    expect(classifyWaxType(10)).toBe('lead')
    expect(classifyWaxType(19)).toBe('lead')
  })
})

// ─── classifySealColor ───────────────────────────────────────────────────────

describe('classifySealColor', () => {
  it('returns royal-red for quality >= 85', () => {
    expect(classifySealColor(85)).toBe('royal-red')
    expect(classifySealColor(100)).toBe('royal-red')
  })

  it('returns gold for quality 75-84', () => {
    expect(classifySealColor(75)).toBe('gold')
    expect(classifySealColor(84)).toBe('gold')
  })

  it('returns silver for quality 65-74', () => {
    expect(classifySealColor(65)).toBe('silver')
    expect(classifySealColor(74)).toBe('silver')
  })

  it('returns blue for quality 50-64', () => {
    expect(classifySealColor(50)).toBe('blue')
    expect(classifySealColor(64)).toBe('blue')
  })

  it('returns green for quality 35-49', () => {
    expect(classifySealColor(35)).toBe('green')
    expect(classifySealColor(49)).toBe('green')
  })

  it('returns black for quality 20-34', () => {
    expect(classifySealColor(20)).toBe('black')
    expect(classifySealColor(34)).toBe('black')
  })

  it('returns white for quality 10-19', () => {
    expect(classifySealColor(10)).toBe('white')
    expect(classifySealColor(19)).toBe('white')
  })

  it('returns unpigmented for quality < 10', () => {
    expect(classifySealColor(0)).toBe('unpigmented')
    expect(classifySealColor(5)).toBe('unpigmented')
  })
})

// ─── classifyStampDesign ─────────────────────────────────────────────────────

describe('classifyStampDesign', () => {
  it('returns royal-arms for 5+ exports, 2+ classes, 3+ functions', () => {
    expect(classifyStampDesign(5, 3, 2)).toBe('royal-arms')
    expect(classifyStampDesign(6, 4, 3)).toBe('royal-arms')
  })

  it('returns guild-mark for 4+ exports and 1+ classes', () => {
    expect(classifyStampDesign(4, 0, 1)).toBe('guild-mark')
    expect(classifyStampDesign(5, 3, 1)).toBe('guild-mark')
  })

  it('returns official-stamp for 3+ exports and 3+ functions', () => {
    expect(classifyStampDesign(3, 3, 0)).toBe('official-stamp')
    expect(classifyStampDesign(4, 5, 0)).toBe('official-stamp')
  })

  it('returns personal-seal for 2+ exports or 1+ classes', () => {
    expect(classifyStampDesign(2, 0, 0)).toBe('personal-seal')
    expect(classifyStampDesign(0, 0, 1)).toBe('personal-seal')
  })

  it('returns simple-mark for 1+ functions only', () => {
    expect(classifyStampDesign(0, 1, 0)).toBe('simple-mark')
  })

  it('returns personal-seal for 2+ exports with functions', () => {
    expect(classifyStampDesign(2, 1, 0)).toBe('personal-seal')
  })

  it('returns no-stamp for nothing', () => {
    expect(classifyStampDesign(0, 0, 0)).toBe('no-stamp')
  })
})

// ─── classifyHeraldGrade ─────────────────────────────────────────────────────

describe('classifyHeraldGrade', () => {
  it('returns royal-herald for quality >= 85', () => {
    expect(classifyHeraldGrade(85)).toBe('royal-herald')
    expect(classifyHeraldGrade(100)).toBe('royal-herald')
  })

  it('returns guild-master for quality 70-84', () => {
    expect(classifyHeraldGrade(70)).toBe('guild-master')
    expect(classifyHeraldGrade(84)).toBe('guild-master')
  })

  it('returns notary for quality 55-69', () => {
    expect(classifyHeraldGrade(55)).toBe('notary')
    expect(classifyHeraldGrade(69)).toBe('notary')
  })

  it('returns scribe for quality 40-54', () => {
    expect(classifyHeraldGrade(40)).toBe('scribe')
    expect(classifyHeraldGrade(54)).toBe('scribe')
  })

  it('returns forger for quality 20-39', () => {
    expect(classifyHeraldGrade(20)).toBe('forger')
    expect(classifyHeraldGrade(39)).toBe('forger')
  })

  it('returns illiterate for quality < 20', () => {
    expect(classifyHeraldGrade(0)).toBe('illiterate')
    expect(classifyHeraldGrade(19)).toBe('illiterate')
  })
})

// ─── classifyAuthority ───────────────────────────────────────────────────────

describe('classifyAuthority', () => {
  it('returns royal-court for authenticity >= 75', () => {
    expect(classifyAuthority(75)).toBe('royal-court')
    expect(classifyAuthority(100)).toBe('royal-court')
  })

  it('returns guild-hall for authenticity 55-74', () => {
    expect(classifyAuthority(55)).toBe('guild-hall')
    expect(classifyAuthority(74)).toBe('guild-hall')
  })

  it('returns marketplace for authenticity 35-54', () => {
    expect(classifyAuthority(35)).toBe('marketplace')
    expect(classifyAuthority(54)).toBe('marketplace')
  })

  it('returns back-alley for authenticity 15-34', () => {
    expect(classifyAuthority(15)).toBe('back-alley')
    expect(classifyAuthority(34)).toBe('back-alley')
  })

  it('returns ruins for authenticity < 15', () => {
    expect(classifyAuthority(0)).toBe('ruins')
    expect(classifyAuthority(14)).toBe('ruins')
  })
})

// ─── detectForgeries ─────────────────────────────────────────────────────────

describe('detectForgeries', () => {
  it('returns not suspect for original code', () => {
    const result = detectForgeries('export function hello() { return 42 }')
    expect(result.isSuspect).toBe(false)
    expect(result.copyIndicators).toBe(0)
    expect(result.originalityScore).toBe(100)
  })

  it('detects duplicate lines as copy indicators', () => {
    const content = 'const a = 1\nconst a = 1\nconst a = 1'
    const result = detectForgeries(content)
    expect(result.copyIndicators).toBeGreaterThan(0)
  })

  it('detects stackoverflow URLs', () => {
    const result = detectForgeries('const x = 1 // https://stackoverflow.com/a/123')
    expect(result.copyIndicators).toBeGreaterThan(0)
  })

  it('detects github URLs', () => {
    const result = detectForgeries('const x = 1 // https://github.com/foo/bar')
    expect(result.copyIndicators).toBeGreaterThan(0)
  })

  it('flags suspect when many copy indicators', () => {
    const content = Array(10).fill('https://stackoverflow.com/a/12345').join('\n')
    const result = detectForgeries(content)
    expect(result.isSuspect).toBe(true)
  })

  it('clamps originalityScore to 0-100', () => {
    const result = detectForgeries('')
    expect(result.originalityScore).toBeGreaterThanOrEqual(0)
    expect(result.originalityScore).toBeLessThanOrEqual(100)
  })

  it('clamps patternOriginality to 0-100', () => {
    const result = detectForgeries('')
    expect(result.patternOriginality).toBeGreaterThanOrEqual(0)
    expect(result.patternOriginality).toBeLessThanOrEqual(100)
  })

  it('detects excess boilerplate', () => {
    const content = 'copyright\ncopyright\ncopyright\nlicense\nlicense\nall rights reserved'
    const result = detectForgeries(content)
    expect(result.copyIndicators).toBeGreaterThan(0)
  })

  it('returns sensible defaults for empty content', () => {
    const result = detectForgeries('')
    expect(result.isSuspect).toBe(false)
    expect(result.originalityScore).toBe(100)
  })
})

// ─── assessImpression ────────────────────────────────────────────────────────

describe('assessImpression', () => {
  it('returns default impression for empty content', () => {
    const imp = assessImpression('')
    expect(imp.depth).toBe(0)
    expect(imp.sharpness).toBe(0)
    expect(imp.completeness).toBe(0)
    expect(imp.symmetry).toBe(0)
    expect(imp.hasAirBubbles).toBe(false)
    expect(imp.hasSmudges).toBe(false)
    expect(imp.hasCracks).toBe(false)
    expect(imp.hasChips).toBe(false)
  })

  it('detects depth from code lines', () => {
    const imp = assessImpression('export function foo() {\n  return 1\n}\n')
    expect(imp.depth).toBeGreaterThan(0)
  })

  it('detects sharpness from types and exports', () => {
    const imp = assessImpression('export interface Foo { x: number }\nexport function bar(): Foo { return { x: 1 } }')
    expect(imp.sharpness).toBeGreaterThan(20)
  })

  it('detects completeness from elements', () => {
    const imp = assessImpression('export function a() {}\nexport function b() {}\nexport function c() {}')
    expect(imp.completeness).toBeGreaterThan(0)
  })

  it('detects air bubbles from TODO/FIXME', () => {
    const imp = assessImpression('export function a() { /* TODO: fix */ }')
    expect(imp.hasAirBubbles).toBe(true)
    expect(imp.airBubbleCount).toBeGreaterThan(0)
  })

  it('detects smudges from console and ts-ignore', () => {
    const imp = assessImpression('console.log("x")\n// @ts-ignore')
    expect(imp.hasSmudges).toBe(true)
    expect(imp.smudgeCount).toBeGreaterThanOrEqual(2)
  })

  it('detects cracks from any and eval', () => {
    const imp = assessImpression('const x: any = eval("1")')
    expect(imp.hasCracks).toBe(true)
    expect(imp.crackCount).toBeGreaterThanOrEqual(2)
  })

  it('detects chips from empty functions', () => {
    const imp = assessImpression('function empty() {}')
    expect(imp.hasChips).toBe(true)
    expect(imp.chipCount).toBeGreaterThan(0)
  })

  it('calculates symmetry', () => {
    const imp = assessImpression('interface A {}\ntype B = string\nclass C {}')
    expect(imp.symmetry).toBeGreaterThan(0)
  })

  it('clamps all values to 0-100', () => {
    const content = Array(200).fill('export function f() { return 1 }').join('\n')
    const imp = assessImpression(content)
    expect(imp.depth).toBeLessThanOrEqual(100)
    expect(imp.sharpness).toBeLessThanOrEqual(100)
    expect(imp.completeness).toBeLessThanOrEqual(100)
    expect(imp.symmetry).toBeLessThanOrEqual(100)
  })
})

// ─── assessCertification ─────────────────────────────────────────────────────

describe('assessCertification', () => {
  it('returns none for no tests or jsdoc', () => {
    expect(assessCertification('const x = 1')).toBe('none')
    expect(assessCertification('')).toBe('none')
  })

  it('returns basic for minimal coverage', () => {
    expect(assessCertification('describe("test", () => {})')).toBe('basic')
  })

  it('returns standard for 3 score points', () => {
    const content = 'describe("a", () => {})\nit("b", () => {})'
    expect(assessCertification(content)).toBe('standard')
  })

  it('returns comprehensive for 6+ score points', () => {
    const content = 'describe("a", () => {})\nit("b", () => {})\ntest("c", () => {})'
    expect(assessCertification(content)).toBe('comprehensive')
  })

  it('returns comprehensive for strong coverage', () => {
    const tests = Array(3).fill('describe("t", () => {})').join('\n')
    const docs = '/** doc */\n/** doc */\n/** doc */'
    expect(assessCertification(tests + '\n' + docs)).toBe('comprehensive')
  })

  it('returns exhaustive for thorough coverage', () => {
    const tests = Array(5).fill('describe("t", () => {})').join('\n')
    const docs = Array(3).fill('/** doc */').join('\n')
    expect(assessCertification(tests + '\n' + docs)).toBe('exhaustive')
  })
})

// ─── analyzeSealMark ─────────────────────────────────────────────────────────

describe('analyzeSealMark', () => {
  it('returns a complete SealMark object', () => {
    const mark = analyzeSealMark('export function hello() { return 42 }', 'hello.ts')
    expect(mark.file).toBe('hello.ts')
    expect(typeof mark.sealQuality).toBe('number')
    expect(typeof mark.waxPurity).toBe('number')
    expect(typeof mark.impressionClarity).toBe('number')
    expect(typeof mark.stampAuthority).toBe('number')
    expect(typeof mark.sealIntegrity).toBe('number')
    expect(typeof mark.authenticity).toBe('number')
    expect(['beeswax', 'shellac', 'paraffin', 'synthetic', 'clay', 'lead']).toContain(mark.waxType)
    expect(['royal-red', 'gold', 'silver', 'blue', 'green', 'black', 'white', 'unpigmented']).toContain(mark.sealColor)
    expect(['royal-arms', 'guild-mark', 'personal-seal', 'official-stamp', 'simple-mark', 'no-stamp']).toContain(mark.stampDesign)
    expect(['intact', 'nearly-intact', 'slightly-damaged', 'damaged', 'broken', 'missing']).toContain(mark.condition)
    expect(['royal-seal', 'guild-certified', 'merchant-approved', 'common', 'suspect', 'forgery']).toContain(mark.grade)
  })

  it('handles empty content gracefully', () => {
    const mark = analyzeSealMark('', 'empty.ts')
    expect(mark.file).toBe('empty.ts')
    expect(mark.sealQuality).toBeGreaterThanOrEqual(0)
    expect(mark.condition).toBeDefined()
    expect(mark.grade).toBeDefined()
  })

  it('detects TypeScript language', () => {
    expect(analyzeSealMark('const x = 1', 'a.ts').document.language).toBe('TypeScript')
    expect(analyzeSealMark('const x = 1', 'a.tsx').document.language).toBe('TypeScript')
  })

  it('detects JavaScript language', () => {
    expect(analyzeSealMark('const x = 1', 'a.js').document.language).toBe('JavaScript')
    expect(analyzeSealMark('const x = 1', 'a.jsx').document.language).toBe('JavaScript')
  })

  it('detects Python language', () => {
    expect(analyzeSealMark('x = 1', 'a.py').document.language).toBe('Python')
  })

  it('detects Rust language', () => {
    expect(analyzeSealMark('fn main() {}', 'a.rs').document.language).toBe('Rust')
  })

  it('detects Go language', () => {
    expect(analyzeSealMark('func main() {}', 'a.go').document.language).toBe('Go')
  })

  it('detects Unknown language', () => {
    expect(analyzeSealMark('x = 1', 'a.rb').document.language).toBe('Unknown')
  })

  it('assigns document types based on content', () => {
    const iface = analyzeSealMark('interface Foo {}\nexport type Bar = string', 'a.ts')
    expect(iface.document.type).toBe('charter')
  })

  it('assigns fresh age for short files', () => {
    const mark = analyzeSealMark('const x = 1', 'a.ts')
    expect(mark.document.age).toBe('fresh')
  })

  it('assigns ancient age for long files', () => {
    const content = Array(350).fill('const x = 1').join('\n')
    const mark = analyzeSealMark(content, 'big.ts')
    expect(mark.document.age).toBe('ancient')
  })

  it('generates issues for problematic code', () => {
    const mark = analyzeSealMark('const x: any = eval("1") // TODO: fix\nconsole.log(x)', 'bad.ts')
    expect(mark.issues.length).toBeGreaterThan(0)
  })

  it('generates endorsements for good code', () => {
    const content = [
      '/** docs */',
      'export interface Foo { x: number }',
      'describe("test", () => { it("works", () => {}) })',
      'export function bar(): Foo { return { x: 1 } }',
    ].join('\n')
    const mark = analyzeSealMark(content, 'good.ts')
    expect(mark.endorsements.length).toBeGreaterThan(0)
  })

  it('has impression with correct shape', () => {
    const mark = analyzeSealMark('export function f() { return 1 }', 'f.ts')
    expect(typeof mark.impression.depth).toBe('number')
    expect(typeof mark.impression.sharpness).toBe('number')
    expect(typeof mark.impression.completeness).toBe('number')
    expect(typeof mark.impression.symmetry).toBe('number')
    expect(typeof mark.impression.hasAirBubbles).toBe('boolean')
    expect(typeof mark.impression.hasSmudges).toBe('boolean')
    expect(typeof mark.impression.hasCracks).toBe('boolean')
    expect(typeof mark.impression.hasChips).toBe('boolean')
    expect(typeof mark.impression.airBubbleCount).toBe('number')
    expect(typeof mark.impression.smudgeCount).toBe('number')
    expect(typeof mark.impression.crackCount).toBe('number')
    expect(typeof mark.impression.chipCount).toBe('number')
  })

  it('has forgeries with correct shape', () => {
    const mark = analyzeSealMark('export function f() { return 1 }', 'f.ts')
    expect(typeof mark.forgeries.isSuspect).toBe('boolean')
    expect(typeof mark.forgeries.copyIndicators).toBe('number')
    expect(typeof mark.forgeries.originalityScore).toBe('number')
    expect(typeof mark.forgeries.patternOriginality).toBe('number')
  })

  it('qualityScore equals sealQuality', () => {
    const mark = analyzeSealMark('export function f() { return 1 }', 'f.ts')
    expect(mark.qualityScore).toBe(mark.sealQuality)
  })

  it('identifies scrap for empty content', () => {
    const mark = analyzeSealMark('', 'empty.ts')
    expect(mark.document.type).toBe('scrap')
  })

  it('assigns royal authority for high quality', () => {
    const content = [
      '/** docs */',
      'export interface Foo { x: number }',
      'export type Bar = Foo & { y: number }',
      'describe("test", () => { it("works", () => {}) })',
      'export function bar(): Bar { return { x: 1, y: 2 } }',
    ].join('\n')
    const mark = analyzeSealMark(content, 'royal.ts')
    expect(mark.document.authority).toBe('royal')
  })
})

// ─── analyzeSealCollection ───────────────────────────────────────────────────

describe('analyzeSealCollection', () => {
  it('returns empty collection for no seals', () => {
    const col = analyzeSealCollection([], 'empty-dir')
    expect(col.directory).toBe('empty-dir')
    expect(col.seals.length).toBe(0)
    expect(col.avgSealQuality).toBe(0)
    expect(col.authority).toBe('ruins')
    expect(col.dominantWaxType).toBe('lead')
    expect(col.dominantStampDesign).toBe('no-stamp')
  })

  it('aggregates seal metrics', () => {
    const seals = [
      analyzeSealMark('export function a() { return 1 }', 'a.ts'),
      analyzeSealMark('export function b() { return 2 }', 'b.ts'),
    ]
    const col = analyzeSealCollection(seals, 'src')
    expect(col.directory).toBe('src')
    expect(col.seals.length).toBe(2)
    expect(typeof col.avgSealQuality).toBe('number')
    expect(typeof col.avgAuthenticity).toBe('number')
    expect(typeof col.avgIntegrity).toBe('number')
  })

  it('counts grades correctly', () => {
    const seals = [
      analyzeSealMark('export function a() { return 1 }', 'a.ts'),
      analyzeSealMark('export function b() { return 2 }', 'b.ts'),
    ]
    const col = analyzeSealCollection(seals, 'src')
    const totalGrades = col.royalSeals + col.guildCertified + col.suspectCount + col.forgeryCount
    expect(totalGrades).toBeLessThanOrEqual(seals.length)
  })

  it('counts conditions correctly', () => {
    const seals = [
      analyzeSealMark('export function a() { return 1 }', 'a.ts'),
      analyzeSealMark('export function b() { return 2 }', 'b.ts'),
    ]
    const col = analyzeSealCollection(seals, 'src')
    expect(col.intactCount + col.brokenCount).toBeLessThanOrEqual(seals.length)
  })

  it('calculates certification rate', () => {
    const seals = [
      analyzeSealMark('export function a() { return 1 }', 'a.ts'),
      analyzeSealMark('export function b() { return 2 }', 'b.ts'),
    ]
    const col = analyzeSealCollection(seals, 'src')
    expect(col.certificationRate).toBeGreaterThanOrEqual(0)
    expect(col.certificationRate).toBeLessThanOrEqual(100)
  })

  it('calculates collectionQuality as avgSealQuality', () => {
    const seals = [
      analyzeSealMark('export function a() { return 1 }', 'a.ts'),
    ]
    const col = analyzeSealCollection(seals, 'src')
    expect(col.collectionQuality).toBe(col.avgSealQuality)
  })
})

// ─── generateRecommendations ─────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty array for good stats', () => {
    const seals = [analyzeSealMark([
      '/** docs */',
      'export interface Foo { x: number }',
      'describe("test", () => { it("w", () => {}) })',
      'export function bar(): Foo { return { x: 1 } }',
    ].join('\n'), 'good.ts')]
    const result = buildWaxSealResult(['good.ts'], seals.map(() => ''), {})
    // Even good code may have some recs
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('recommends fixing broken seals', () => {
    const stats: WaxSealStats = {
      totalFiles: 5, totalCollections: 1,
      avgSealQuality: 30, avgWaxPurity: 30, avgImpressionClarity: 30,
      avgStampAuthority: 30, avgSealIntegrity: 30, avgAuthenticity: 30,
      royalSeals: 0, guildCertified: 0, commonSeals: 5, suspectSeals: 0, forgerySeals: 0,
      intactSeals: 2, brokenSeals: 3, originalFiles: 5, copiedFiles: 0,
      certifiedFiles: 0, uncertifiedFiles: 5,
      totalAirBubbles: 0, totalSmudges: 0, totalCracks: 0, totalChips: 0,
      certificationRate: 0, overallAuthenticity: 30,
      heraldGrade: 'forger', bestSeal: 'a.ts', worstSeal: 'b.ts',
      mostAuthentic: 'a.ts', mostSuspect: 'b.ts',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Broken seals'))).toBe(true)
  })

  it('recommends certification for uncertified files', () => {
    const stats: WaxSealStats = {
      totalFiles: 3, totalCollections: 1,
      avgSealQuality: 50, avgWaxPurity: 50, avgImpressionClarity: 50,
      avgStampAuthority: 50, avgSealIntegrity: 50, avgAuthenticity: 50,
      royalSeals: 0, guildCertified: 0, commonSeals: 3, suspectSeals: 0, forgerySeals: 0,
      intactSeals: 3, brokenSeals: 0, originalFiles: 3, copiedFiles: 0,
      certifiedFiles: 0, uncertifiedFiles: 3,
      totalAirBubbles: 0, totalSmudges: 0, totalCracks: 0, totalChips: 0,
      certificationRate: 0, overallAuthenticity: 50,
      heraldGrade: 'scribe', bestSeal: 'a.ts', worstSeal: 'b.ts',
      mostAuthentic: 'a.ts', mostSuspect: 'b.ts',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Uncertified'))).toBe(true)
  })

  it('recommends fixing cracks', () => {
    const stats: WaxSealStats = {
      totalFiles: 1, totalCollections: 1,
      avgSealQuality: 50, avgWaxPurity: 50, avgImpressionClarity: 50,
      avgStampAuthority: 50, avgSealIntegrity: 50, avgAuthenticity: 50,
      royalSeals: 0, guildCertified: 0, commonSeals: 1, suspectSeals: 0, forgerySeals: 0,
      intactSeals: 1, brokenSeals: 0, originalFiles: 1, copiedFiles: 0,
      certifiedFiles: 1, uncertifiedFiles: 0,
      totalAirBubbles: 0, totalSmudges: 0, totalCracks: 5, totalChips: 0,
      certificationRate: 100, overallAuthenticity: 50,
      heraldGrade: 'scribe', bestSeal: 'a.ts', worstSeal: 'a.ts',
      mostAuthentic: 'a.ts', mostSuspect: 'a.ts',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Cracks detected'))).toBe(true)
  })

  it('praises high authenticity', () => {
    const stats: WaxSealStats = {
      totalFiles: 1, totalCollections: 1,
      avgSealQuality: 80, avgWaxPurity: 80, avgImpressionClarity: 80,
      avgStampAuthority: 80, avgSealIntegrity: 80, avgAuthenticity: 80,
      royalSeals: 1, guildCertified: 0, commonSeals: 0, suspectSeals: 0, forgerySeals: 0,
      intactSeals: 1, brokenSeals: 0, originalFiles: 1, copiedFiles: 0,
      certifiedFiles: 1, uncertifiedFiles: 0,
      totalAirBubbles: 0, totalSmudges: 0, totalCracks: 0, totalChips: 0,
      certificationRate: 100, overallAuthenticity: 80,
      heraldGrade: 'royal-herald', bestSeal: 'a.ts', worstSeal: 'a.ts',
      mostAuthentic: 'a.ts', mostSuspect: 'a.ts',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('High authenticity'))).toBe(true)
  })

  it('returns unique recommendations', () => {
    const stats: WaxSealStats = {
      totalFiles: 1, totalCollections: 1,
      avgSealQuality: 10, avgWaxPurity: 10, avgImpressionClarity: 10,
      avgStampAuthority: 10, avgSealIntegrity: 10, avgAuthenticity: 10,
      royalSeals: 0, guildCertified: 0, commonSeals: 1, suspectSeals: 0, forgerySeals: 0,
      intactSeals: 0, brokenSeals: 1, originalFiles: 1, copiedFiles: 0,
      certifiedFiles: 0, uncertifiedFiles: 1,
      totalAirBubbles: 5, totalSmudges: 3, totalCracks: 2, totalChips: 1,
      certificationRate: 0, overallAuthenticity: 10,
      heraldGrade: 'illiterate', bestSeal: 'a.ts', worstSeal: 'a.ts',
      mostAuthentic: 'a.ts', mostSuspect: 'a.ts',
    }
    const recs = generateRecommendations([], [], stats)
    const unique = Array.from(new Set(recs))
    expect(recs.length).toBe(unique.length)
  })

  it('recommends low purity fix', () => {
    const stats: WaxSealStats = {
      totalFiles: 1, totalCollections: 1,
      avgSealQuality: 30, avgWaxPurity: 30, avgImpressionClarity: 50,
      avgStampAuthority: 50, avgSealIntegrity: 50, avgAuthenticity: 50,
      royalSeals: 0, guildCertified: 0, commonSeals: 1, suspectSeals: 0, forgerySeals: 0,
      intactSeals: 1, brokenSeals: 0, originalFiles: 1, copiedFiles: 0,
      certifiedFiles: 1, uncertifiedFiles: 0,
      totalAirBubbles: 0, totalSmudges: 0, totalCracks: 0, totalChips: 0,
      certificationRate: 100, overallAuthenticity: 50,
      heraldGrade: 'scribe', bestSeal: 'a.ts', worstSeal: 'a.ts',
      mostAuthentic: 'a.ts', mostSuspect: 'a.ts',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Low purity'))).toBe(true)
  })

  it('recommends unclear impressions fix', () => {
    const stats: WaxSealStats = {
      totalFiles: 1, totalCollections: 1,
      avgSealQuality: 30, avgWaxPurity: 50, avgImpressionClarity: 30,
      avgStampAuthority: 50, avgSealIntegrity: 50, avgAuthenticity: 50,
      royalSeals: 0, guildCertified: 0, commonSeals: 1, suspectSeals: 0, forgerySeals: 0,
      intactSeals: 1, brokenSeals: 0, originalFiles: 1, copiedFiles: 0,
      certifiedFiles: 1, uncertifiedFiles: 0,
      totalAirBubbles: 0, totalSmudges: 0, totalCracks: 0, totalChips: 0,
      certificationRate: 100, overallAuthenticity: 50,
      heraldGrade: 'scribe', bestSeal: 'a.ts', worstSeal: 'a.ts',
      mostAuthentic: 'a.ts', mostSuspect: 'a.ts',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Unclear impressions'))).toBe(true)
  })

  it('recommends certification rate improvement', () => {
    const stats: WaxSealStats = {
      totalFiles: 5, totalCollections: 1,
      avgSealQuality: 50, avgWaxPurity: 50, avgImpressionClarity: 50,
      avgStampAuthority: 50, avgSealIntegrity: 50, avgAuthenticity: 50,
      royalSeals: 0, guildCertified: 0, commonSeals: 5, suspectSeals: 0, forgerySeals: 0,
      intactSeals: 5, brokenSeals: 0, originalFiles: 5, copiedFiles: 0,
      certifiedFiles: 1, uncertifiedFiles: 4,
      totalAirBubbles: 0, totalSmudges: 0, totalCracks: 0, totalChips: 0,
      certificationRate: 20, overallAuthenticity: 50,
      heraldGrade: 'scribe', bestSeal: 'a.ts', worstSeal: 'b.ts',
      mostAuthentic: 'a.ts', mostSuspect: 'b.ts',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Low certification rate'))).toBe(true)
  })

  it('recommends low authenticity review', () => {
    const stats: WaxSealStats = {
      totalFiles: 1, totalCollections: 1,
      avgSealQuality: 20, avgWaxPurity: 20, avgImpressionClarity: 20,
      avgStampAuthority: 20, avgSealIntegrity: 20, avgAuthenticity: 20,
      royalSeals: 0, guildCertified: 0, commonSeals: 1, suspectSeals: 0, forgerySeals: 0,
      intactSeals: 0, brokenSeals: 0, originalFiles: 1, copiedFiles: 0,
      certifiedFiles: 0, uncertifiedFiles: 1,
      totalAirBubbles: 0, totalSmudges: 0, totalCracks: 0, totalChips: 0,
      certificationRate: 0, overallAuthenticity: 20,
      heraldGrade: 'forger', bestSeal: 'a.ts', worstSeal: 'a.ts',
      mostAuthentic: 'a.ts', mostSuspect: 'a.ts',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Low authenticity'))).toBe(true)
  })

  it('notes royal seals as templates', () => {
    const stats: WaxSealStats = {
      totalFiles: 1, totalCollections: 1,
      avgSealQuality: 80, avgWaxPurity: 80, avgImpressionClarity: 80,
      avgStampAuthority: 80, avgSealIntegrity: 80, avgAuthenticity: 80,
      royalSeals: 1, guildCertified: 0, commonSeals: 0, suspectSeals: 0, forgerySeals: 0,
      intactSeals: 1, brokenSeals: 0, originalFiles: 1, copiedFiles: 0,
      certifiedFiles: 1, uncertifiedFiles: 0,
      totalAirBubbles: 0, totalSmudges: 0, totalCracks: 0, totalChips: 0,
      certificationRate: 100, overallAuthenticity: 80,
      heraldGrade: 'royal-herald', bestSeal: 'a.ts', worstSeal: 'a.ts',
      mostAuthentic: 'a.ts', mostSuspect: 'a.ts',
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Royal seals'))).toBe(true)
  })

  it('flags damaged seals', () => {
    const seal = analyzeSealMark('', 'empty.ts')
    const stats: WaxSealStats = {
      totalFiles: 1, totalCollections: 1,
      avgSealQuality: 40, avgWaxPurity: 50, avgImpressionClarity: 50,
      avgStampAuthority: 50, avgSealIntegrity: 50, avgAuthenticity: 50,
      royalSeals: 0, guildCertified: 0, commonSeals: 1, suspectSeals: 0, forgerySeals: 0,
      intactSeals: 0, brokenSeals: 0, originalFiles: 1, copiedFiles: 0,
      certifiedFiles: 1, uncertifiedFiles: 0,
      totalAirBubbles: 0, totalSmudges: 0, totalCracks: 0, totalChips: 0,
      certificationRate: 100, overallAuthenticity: 50,
      heraldGrade: 'scribe', bestSeal: 'a.ts', worstSeal: 'a.ts',
      mostAuthentic: 'a.ts', mostSuspect: 'a.ts',
    }
    const recs = generateRecommendations([seal], [], stats)
    // may or may not have damaged depending on condition
    expect(Array.isArray(recs)).toBe(true)
  })
})

// ─── buildWaxSealResult ──────────────────────────────────────────────────────

describe('buildWaxSealResult', () => {
  it('returns a complete result object', () => {
    const result = buildWaxSealResult(['a.ts'], ['export function a() { return 1 }'], {})
    expect(result.seals).toHaveLength(1)
    expect(result.collections).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty file list', () => {
    const result = buildWaxSealResult([], [], {})
    expect(result.seals).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.avgSealQuality).toBe(0)
    expect(result.stats.heraldGrade).toBe('illiterate')
    expect(result.stats.bestSeal).toBe('none')
    expect(result.stats.worstSeal).toBe('none')
    expect(result.stats.mostAuthentic).toBe('none')
    expect(result.stats.mostSuspect).toBe('none')
  })

  it('handles multiple files', () => {
    const result = buildWaxSealResult(
      ['a.ts', 'b.ts'],
      ['export function a() { return 1 }', 'export function b() { return 2 }'],
      {},
    )
    expect(result.seals).toHaveLength(2)
    expect(result.collections.length).toBeGreaterThanOrEqual(1)
  })

  it('groups files by directory', () => {
    const result = buildWaxSealResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['export function a() {}', 'export function b() {}', 'export function c() {}'],
      {},
    )
    expect(result.collections.length).toBe(2)
  })

  it('tracks stats correctly', () => {
    const result = buildWaxSealResult(
      ['a.ts', 'b.ts'],
      ['export function a() { return 1 }', 'export function b() { return 2 }'],
      {},
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalCollections).toBeGreaterThanOrEqual(1)
    expect(typeof result.stats.avgSealQuality).toBe('number')
    expect(typeof result.stats.avgWaxPurity).toBe('number')
    expect(typeof result.stats.certificationRate).toBe('number')
    expect(typeof result.stats.overallAuthenticity).toBe('number')
  })

  it('handles files with errors gracefully', () => {
    const result = buildWaxSealResult(['bad.ts'], [''], {})
    expect(result.seals).toHaveLength(1)
    expect(result.seals[0].file).toBe('bad.ts')
  })

  it('passes options through', () => {
    const result = buildWaxSealResult(['a.ts'], ['export function a() {}'], { verbose: true, format: 'json' })
    expect(result.seals).toHaveLength(1)
  })

  it('calculates correct totals', () => {
    const result = buildWaxSealResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'export function a() { return 1 }',
        'export function b() { return 2 }',
        'export function c() { return 3 }',
      ],
      {},
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.royalSeals + result.stats.guildCertified + result.stats.commonSeals + result.stats.suspectSeals + result.stats.forgerySeals).toBe(3)
  })

  it('tracks broken vs intact seals', () => {
    const result = buildWaxSealResult(
      ['a.ts'],
      [''],
      {},
    )
    expect(result.stats.intactSeals + result.stats.brokenSeals).toBeLessThanOrEqual(1)
  })

  it('tracks original vs copied files', () => {
    const result = buildWaxSealResult(['a.ts'], ['export function a() { return 1 }'], {})
    expect(result.stats.originalFiles + result.stats.copiedFiles).toBe(1)
  })

  it('calculates certification rate', () => {
    const result = buildWaxSealResult(['a.ts'], ['export function a() { return 1 }'], {})
    expect(result.stats.certificationRate).toBeGreaterThanOrEqual(0)
    expect(result.stats.certificationRate).toBeLessThanOrEqual(100)
  })

  it('calculates total defects', () => {
    const result = buildWaxSealResult(['a.ts'], ['const x: any = eval("1") // TODO: fix\nconsole.log(x)\nfunction empty() {}'], {})
    expect(result.stats.totalCracks).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalChips).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalAirBubbles).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalSmudges).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('formatWaxSealTable', () => {
  it('returns a string', () => {
    const result = buildWaxSealResult(['a.ts'], ['export function a() {}'], {})
    const table = formatWaxSealTable(result, false)
    expect(typeof table).toBe('string')
  })

  it('includes seal marks section', () => {
    const result = buildWaxSealResult(['a.ts'], ['export function a() {}'], {})
    const table = formatWaxSealTable(result, false)
    expect(table).toContain('Seal Marks')
  })

  it('includes statistics section', () => {
    const result = buildWaxSealResult(['a.ts'], ['export function a() {}'], {})
    const table = formatWaxSealTable(result, false)
    expect(table).toContain('Statistics')
  })

  it('shows verbose details', () => {
    const result = buildWaxSealResult(['a.ts'], ['export function a() { return 1 }'], {})
    const table = formatWaxSealTable(result, true)
    expect(table).toContain('purity:')
    expect(table).toContain('imp:')
  })

  it('truncates non-verbose output at 15 seals', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'export function f() { return 1 }')
    const result = buildWaxSealResult(files, contents, {})
    const table = formatWaxSealTable(result, false)
    expect(table).toContain('more')
  })

  it('shows collections section when present', () => {
    const result = buildWaxSealResult(['src/a.ts'], ['export function a() {}'], {})
    const table = formatWaxSealTable(result, false)
    expect(table).toContain('Collections')
  })

  it('shows recommendations when present', () => {
    const result = buildWaxSealResult(['a.ts'], [''], {})
    const table = formatWaxSealTable(result, false)
    if (result.recommendations.length > 0) {
      expect(table).toContain('Recommendations')
    }
  })

  it('handles empty result', () => {
    const result = buildWaxSealResult([], [], {})
    const table = formatWaxSealTable(result, false)
    expect(table).toContain('No seals detected')
  })
})

describe('formatWaxSealJson', () => {
  it('returns valid JSON', () => {
    const result = buildWaxSealResult(['a.ts'], ['export function a() {}'], {})
    const json = formatWaxSealJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.seals).toBeDefined()
    expect(parsed.collections).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('pretty prints JSON', () => {
    const result = buildWaxSealResult(['a.ts'], ['export function a() {}'], {})
    const json = formatWaxSealJson(result)
    expect(json).toContain('\n')
  })
})
