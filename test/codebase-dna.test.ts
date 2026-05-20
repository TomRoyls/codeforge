import { describe, expect, it } from 'vitest'

import {
  buildDnaResult,
  buildStrand,
  computeGCContent,
  computeGeneticDiversity,
  computeHealthScore,
  computeMutationRate,
  computeSimilarity,
  detectMutations,
  extractBasePairs,
  extractCodons,
  extractTokens,
  findGeneticMarkers,
  generateRecommendations,
  identifyDominantSequence,
  type Codon,
  type DnaStrand,
  type DnaStats,
  type GeneticMarker,
} from '../src/commands/codebase-dna-helpers.js'

import {
  formatDnaJSON,
  formatDnaTable,
  formatSequenceVisualization,
  formatBasePairFrequency,
  formatCodonTable,
  formatGeneticMarkers,
  formatDnaStats,
  formatDnaRecommendations,
} from '../src/commands/codebase-dna-format-helpers.js'

// ─── extractTokens ──────────────────────────────────────────────────────────────

describe('extractTokens', () => {
  it('extracts keywords from code', () => {
    const tokens = extractTokens('import { foo } from "bar"')
    expect(tokens).toContain('import')
    expect(tokens).toContain('from')
  })

  it('extracts structural tokens', () => {
    const tokens = extractTokens('if (x) { return 1 }')
    expect(tokens).toContain('if')
    expect(tokens).toContain('return')
  })

  it('extracts async tokens', () => {
    const tokens = extractTokens('async function run() { await doWork() }')
    expect(tokens).toContain('async')
    expect(tokens).toContain('await')
  })

  it('extracts type tokens', () => {
    const tokens = extractTokens('const x: string = "hi"')
    expect(tokens).toContain('string')
  })

  it('returns empty for empty content', () => {
    expect(extractTokens('')).toEqual([])
  })
})

// ─── extractBasePairs ───────────────────────────────────────────────────────────

describe('extractBasePairs', () => {
  it('detects import base pairs', () => {
    const bps = extractBasePairs('import { foo } from "bar"')
    const importBp = bps.find((bp) => bp.type === 'import')
    expect(importBp).toBeTruthy()
  })

  it('detects export base pairs', () => {
    const bps = extractBasePairs('export const x = 1')
    const exportBp = bps.find((bp) => bp.type === 'export')
    expect(exportBp).toBeTruthy()
  })

  it('detects control base pairs', () => {
    const bps = extractBasePairs('try { work() } catch (e) { throw e }')
    const controlBp = bps.find((bp) => bp.type === 'control')
    expect(controlBp).toBeTruthy()
  })

  it('detects async base pairs', () => {
    const bps = extractBasePairs('async function run() { await work() }')
    const asyncBp = bps.find((bp) => bp.type === 'async')
    expect(asyncBp).toBeTruthy()
  })

  it('detects error base pairs', () => {
    const bps = extractBasePairs('try { work() } catch (e) { throw new Error("x") }')
    const errorBp = bps.find((bp) => bp.type === 'error')
    expect(errorBp).toBeTruthy()
  })

  it('detects type base pairs', () => {
    const bps = extractBasePairs('interface Foo { x: string }')
    const typeBp = bps.find((bp) => bp.type === 'type')
    expect(typeBp).toBeTruthy()
  })

  it('returns empty for plain text', () => {
    expect(extractBasePairs('hello world')).toHaveLength(0)
  })

  it('counts frequency', () => {
    const content = 'import { a } from "x"\nimport { b } from "y"'
    const bps = extractBasePairs(content)
    const importBp = bps.find((bp) => bp.left === 'import' && bp.right === '{')
    expect(importBp?.frequency).toBeGreaterThanOrEqual(2)
  })
})

// ─── extractCodons ──────────────────────────────────────────────────────────────

describe('extractCodons', () => {
  it('returns empty for short content', () => {
    expect(extractCodons('a b')).toHaveLength(0)
  })

  it('extracts codons from code', () => {
    const codons = extractCodons('import { foo } from "bar"; export const x = 1; function baz() {}')
    expect(codons.length).toBeGreaterThan(0)
  })

  it('identifies dominant codons', () => {
    const content = 'import export import export import export'
    const codons = extractCodons(content)
    const dominant = codons.filter((c) => c.isDominant)
    expect(dominant.length).toBeGreaterThan(0)
  })

  it('identifies mutations in diverse content', () => {
    const content = 'import export const function return if else try catch async await class interface type'
    const codons = extractCodons(content)
    expect(codons.length).toBeGreaterThan(0)
  })
})

// ─── computeGCContent ───────────────────────────────────────────────────────────

describe('computeGCContent', () => {
  it('returns 0 for empty content', () => {
    expect(computeGCContent('')).toBe(0)
  })

  it('increases with complex patterns', () => {
    const simple = 'const x = 1'
    const complex = 'if (x) { for (let i = 0; i < 10; i++) { try { await work() } catch (e) { throw e } } }'
    expect(computeGCContent(complex)).toBeGreaterThan(computeGCContent(simple))
  })

  it('caps at 100', () => {
    expect(computeGCContent('import export if for while switch try catch async await class interface type')).toBeLessThanOrEqual(100)
  })
})

// ─── identifyDominantSequence ───────────────────────────────────────────────────

describe('identifyDominantSequence', () => {
  it('returns none for empty codons', () => {
    expect(identifyDominantSequence([])).toBe('none')
  })

  it('returns most frequent codon', () => {
    const codons: Codon[] = [
      { bases: ['a', 'b', 'c'], description: 'a|b|c', frequency: 5, isDominant: true, isMutation: false },
      { bases: ['x', 'y', 'z'], description: 'x|y|z', frequency: 2, isDominant: false, isMutation: true },
    ]
    expect(identifyDominantSequence(codons)).toContain('a')
  })
})

// ─── detectMutations ────────────────────────────────────────────────────────────

describe('detectMutations', () => {
  it('filters mutation codons', () => {
    const codons: Codon[] = [
      { bases: ['a', 'b', 'c'], description: 'abc', frequency: 5, isDominant: true, isMutation: false },
      { bases: ['x', 'y', 'z'], description: 'xyz', frequency: 1, isDominant: false, isMutation: true },
    ]
    const mutations = detectMutations(codons)
    expect(mutations).toHaveLength(1)
    expect(mutations[0].bases).toEqual(['x', 'y', 'z'])
  })
})

// ─── computeSimilarity ──────────────────────────────────────────────────────────

describe('computeSimilarity', () => {
  it('returns 100 for identical strands', () => {
    const codons: Codon[] = [
      { bases: ['a', 'b', 'c'], description: 'abc', frequency: 1, isDominant: false, isMutation: false },
    ]
    const strand: DnaStrand = { file: 'a.ts', length: 1, sequence: codons, gcContent: 50, mutations: 0, similarity: 0 }
    expect(computeSimilarity(strand, strand)).toBe(100)
  })

  it('returns 0 for completely different strands', () => {
    const strand1: DnaStrand = {
      file: 'a.ts', length: 1, gcContent: 50, mutations: 0, similarity: 0,
      sequence: [{ bases: ['a', 'b', 'c'], description: 'abc', frequency: 1, isDominant: false, isMutation: false }],
    }
    const strand2: DnaStrand = {
      file: 'b.ts', length: 1, gcContent: 50, mutations: 0, similarity: 0,
      sequence: [{ bases: ['x', 'y', 'z'], description: 'xyz', frequency: 1, isDominant: false, isMutation: false }],
    }
    expect(computeSimilarity(strand1, strand2)).toBe(0)
  })

  it('returns 100 for both empty strands', () => {
    const strand: DnaStrand = { file: 'a.ts', length: 0, sequence: [], gcContent: 0, mutations: 0, similarity: 0 }
    expect(computeSimilarity(strand, strand)).toBe(100)
  })
})

// ─── findGeneticMarkers ─────────────────────────────────────────────────────────

describe('findGeneticMarkers', () => {
  it('finds markers present in many files', () => {
    const fileCodons = new Map<string, Codon[]>()
    const codon: Codon = { bases: ['import', 'from', "'"], description: "import|from|'", frequency: 1, isDominant: false, isMutation: false }
    fileCodons.set('a.ts', [codon])
    fileCodons.set('b.ts', [codon])
    fileCodons.set('c.ts', [codon])
    const markers = findGeneticMarkers(fileCodons, ['a.ts', 'b.ts', 'c.ts'])
    expect(markers.length).toBeGreaterThan(0)
    expect(markers[0].files.length).toBe(3)
  })

  it('ignores patterns in too few files', () => {
    const fileCodons = new Map<string, Codon[]>()
    const codon: Codon = { bases: ['a', 'b', 'c'], description: 'abc', frequency: 1, isDominant: false, isMutation: false }
    fileCodons.set('a.ts', [codon])
    fileCodons.set('b.ts', [])
    fileCodons.set('c.ts', [])
    const markers = findGeneticMarkers(fileCodons, ['a.ts', 'b.ts', 'c.ts'])
    expect(markers).toHaveLength(0)
  })
})

// ─── computeMutationRate ────────────────────────────────────────────────────────

describe('computeMutationRate', () => {
  it('returns 0 for empty strands', () => {
    expect(computeMutationRate([])).toBe(0)
  })

  it('computes mutation percentage', () => {
    const strands: DnaStrand[] = [
      { file: 'a.ts', length: 10, sequence: [], gcContent: 50, mutations: 3, similarity: 80 },
    ]
    expect(computeMutationRate(strands)).toBe(30)
  })
})

// ─── computeGeneticDiversity ────────────────────────────────────────────────────

describe('computeGeneticDiversity', () => {
  it('returns 0 for empty codons', () => {
    expect(computeGeneticDiversity([])).toBe(0)
  })

  it('returns 100 for perfectly diverse codons', () => {
    const codons: Codon[] = [
      { bases: ['a', 'b', 'c'], description: 'abc', frequency: 1, isDominant: false, isMutation: false },
      { bases: ['x', 'y', 'z'], description: 'xyz', frequency: 1, isDominant: false, isMutation: false },
    ]
    expect(computeGeneticDiversity(codons)).toBe(100)
  })

  it('returns lower for skewed distributions', () => {
    const codons: Codon[] = [
      { bases: ['a', 'b', 'c'], description: 'abc', frequency: 99, isDominant: true, isMutation: false },
      { bases: ['x', 'y', 'z'], description: 'xyz', frequency: 1, isDominant: false, isMutation: true },
    ]
    expect(computeGeneticDiversity(codons)).toBeLessThan(50)
  })
})

// ─── computeHealthScore ─────────────────────────────────────────────────────────

describe('computeHealthScore', () => {
  it('returns high for low mutations and high similarity', () => {
    expect(computeHealthScore(5, 90)).toBeGreaterThan(70)
  })

  it('returns low for high mutations and low similarity', () => {
    expect(computeHealthScore(60, 20)).toBeLessThan(50)
  })

  it('clamps to 0-100', () => {
    expect(computeHealthScore(0, 100)).toBeLessThanOrEqual(100)
    expect(computeHealthScore(100, 0)).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: DnaStats = {
    totalStrands: 5, totalBasePairs: 50, totalCodons: 100, dominantSequence: 'import \u2192 export',
    mutationRate: 10, avgSimilarity: 70, gcContent: 40, markerCount: 3,
    uniqueMarkers: 1, geneticDiversity: 50, healthScore: 75,
  }

  it('recommends for high mutation rate', () => {
    const stats = { ...baseStats, mutationRate: 50 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('Mutation'))).toBe(true)
  })

  it('recommends for low similarity', () => {
    const stats = { ...baseStats, avgSimilarity: 30 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('similarity'))).toBe(true)
  })

  it('recommends for low GC content', () => {
    const stats = { ...baseStats, gcContent: 15 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('GC'))).toBe(true)
  })

  it('recommends for no markers with many strands', () => {
    const strands: DnaStrand[] = Array.from({ length: 5 }, (_, i) => ({
      file: `file${i}.ts`, length: 5, sequence: [], gcContent: 40, mutations: 1, similarity: 70,
    }))
    const stats = { ...baseStats, markerCount: 0 }
    const recs = generateRecommendations(strands, [], stats)
    expect(recs.some((r) => r.includes('convention') || r.includes('marker') || r.includes('identity'))).toBe(true)
  })

  it('recommends for low diversity', () => {
    const stats = { ...baseStats, geneticDiversity: 20 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('diversity'))).toBe(true)
  })

  it('recommends for high-mutation strands', () => {
    const strands: DnaStrand[] = [
      { file: 'weird.ts', length: 20, sequence: [], gcContent: 30, mutations: 8, similarity: 40 },
    ]
    const recs = generateRecommendations(strands, [], baseStats)
    expect(recs.some((r) => r.includes('weird.ts'))).toBe(true)
  })

  it('praises high health score', () => {
    const stats = { ...baseStats, healthScore: 85 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('health'))).toBe(true)
  })

  it('returns default when all is good', () => {
    const recs = generateRecommendations([], [], baseStats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildDnaResult ─────────────────────────────────────────────────────────────

describe('buildDnaResult', () => {
  it('handles empty files', () => {
    const result = buildDnaResult([], [], {})
    expect(result.strands).toHaveLength(0)
    expect(result.stats.totalStrands).toBe(0)
  })

  it('creates strands from files', () => {
    const result = buildDnaResult(['a.ts', 'b.ts'], ['import { x } from "y"', 'export const z = 1'], {})
    expect(result.strands).toHaveLength(2)
  })

  it('extracts base pairs', () => {
    const result = buildDnaResult(['a.ts'], ['import { x } from "y"; export const z = 1'], {})
    expect(result.basePairs.length).toBeGreaterThan(0)
  })

  it('computes stats', () => {
    const result = buildDnaResult(['a.ts'], ['import { x } from "y"'], {})
    expect(result.stats.totalStrands).toBe(1)
    expect(result.stats.healthScore).toBeGreaterThanOrEqual(0)
  })

  it('finds dominant sequence', () => {
    const result = buildDnaResult(['a.ts'], ['import export const function return'], {})
    expect(result.stats.dominantSequence).toBeTruthy()
  })

  it('computes similarity between strands', () => {
    const result = buildDnaResult(
      ['a.ts', 'b.ts'],
      ['import export const function return', 'import export const function return'],
      {},
    )
    expect(result.stats.avgSimilarity).toBeGreaterThan(0)
  })

  it('computes GC content', () => {
    const result = buildDnaResult(['a.ts'], ['if (x) { for (let i = 0; i < 10; i++) {} }'], {})
    expect(result.stats.gcContent).toBeGreaterThan(0)
  })

  it('generates recommendations', () => {
    const result = buildDnaResult(['a.ts'], ['import { x } from "y"'], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────────

describe('formatSequenceVisualization', () => {
  it('formats empty strands', () => {
    expect(formatSequenceVisualization([])).toContain('No strands')
  })

  it('formats strand details', () => {
    const strands: DnaStrand[] = [
      { file: 'mod.ts', length: 5, sequence: [], gcContent: 40, mutations: 1, similarity: 80 },
    ]
    const output = formatSequenceVisualization(strands)
    expect(output).toContain('mod.ts')
    expect(output).toContain('5 codons')
  })
})

describe('formatBasePairFrequency', () => {
  it('formats empty base pairs', () => {
    expect(formatBasePairFrequency([])).toContain('No base pairs')
  })
})

describe('formatCodonTable', () => {
  it('formats empty result', () => {
    const result = buildDnaResult(['a.ts'], ['x'], {})
    const output = formatCodonTable(result)
    expect(output).toBeTruthy()
  })
})

describe('formatGeneticMarkers', () => {
  it('formats empty markers', () => {
    expect(formatGeneticMarkers([])).toContain('No genetic markers')
  })

  it('formats marker details', () => {
    const markers: GeneticMarker[] = [
      { pattern: 'import \u2192 export', description: 'Found in 3/3 files', files: ['a.ts', 'b.ts', 'c.ts'], uniqueness: 100 },
    ]
    const output = formatGeneticMarkers(markers)
    expect(output).toContain('import')
  })
})

describe('formatDnaStats', () => {
  it('formats stats', () => {
    const stats: DnaStats = {
      totalStrands: 5, totalBasePairs: 50, totalCodons: 100, dominantSequence: 'import \u2192 from',
      mutationRate: 10, avgSimilarity: 70, gcContent: 40, markerCount: 3,
      uniqueMarkers: 1, geneticDiversity: 50, healthScore: 75,
    }
    const output = formatDnaStats(stats)
    expect(output).toContain('5')
    expect(output).toContain('75%')
  })
})

describe('formatDnaRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatDnaRecommendations([])).toContain('No recommendations')
  })

  it('formats numbered recommendations', () => {
    const output = formatDnaRecommendations(['Fix mutations', 'Add markers'])
    expect(output).toContain('1.')
    expect(output).toContain('2.')
  })
})

describe('formatDnaTable', () => {
  it('formats full result', () => {
    const result = buildDnaResult(['a.ts', 'b.ts'], ['import { x } from "y"', 'export const z = 1'], {})
    const output = formatDnaTable(result)
    expect(output).toContain('DNA Sequencing')
    expect(output).toContain('DNA Strands')
  })
})

describe('formatDnaJSON', () => {
  it('formats as valid JSON', () => {
    const result = buildDnaResult(['a.ts'], ['import { x } from "y"'], {})
    const output = formatDnaJSON(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.totalStrands).toBe(1)
  })
})
