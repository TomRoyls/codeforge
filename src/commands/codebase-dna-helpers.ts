// ─── Types ─────────────────────────────────────────────────────────────────────

export type BasePairType = 'structural' | 'control' | 'async' | 'error' | 'import' | 'export' | 'type'

export interface BasePair {
  left: string
  right: string
  type: BasePairType
  frequency: number
}

export interface Codon {
  bases: string[]
  description: string
  frequency: number
  isDominant: boolean
  isMutation: boolean
}

export interface DnaStrand {
  file: string
  length: number
  sequence: Codon[]
  gcContent: number
  mutations: number
  similarity: number
}

export interface GeneticMarker {
  pattern: string
  description: string
  files: string[]
  uniqueness: number
}

export interface DnaStats {
  totalStrands: number
  totalBasePairs: number
  totalCodons: number
  dominantSequence: string
  mutationRate: number
  avgSimilarity: number
  gcContent: number
  markerCount: number
  uniqueMarkers: number
  geneticDiversity: number
  healthScore: number
}

export interface DnaResult {
  strands: DnaStrand[]
  basePairs: BasePair[]
  markers: GeneticMarker[]
  stats: DnaStats
  recommendations: string[]
}

// ─── Code Pattern Definitions ──────────────────────────────────────────────────

const basePairPatterns: Array<{ left: string; right: string; type: BasePairType }> = [
  { left: '(', right: '{', type: 'structural' },
  { left: '}', right: '{', type: 'structural' },
  { left: '}', right: ';', type: 'structural' },
  { left: '=>', right: '{', type: 'structural' },
  { left: '=', right: '{', type: 'structural' },
  { left: '=', right: '[', type: 'structural' },
  { left: 'if', right: '{', type: 'control' },
  { left: '}', right: 'else', type: 'control' },
  { left: '}', right: 'catch', type: 'control' },
  { left: 'try', right: '{', type: 'control' },
  { left: 'switch', right: '(', type: 'control' },
  { left: 'async', right: '(', type: 'async' },
  { left: 'await', right: ' ', type: 'async' },
  { left: 'Promise', right: '.', type: 'async' },
  { left: '.', right: 'then(', type: 'async' },
  { left: 'throw', right: ' ', type: 'error' },
  { left: 'catch', right: '(', type: 'error' },
  { left: 'Error', right: '(', type: 'error' },
  { left: 'import', right: '{', type: 'import' },
  { left: 'from', right: "'", type: 'import' },
  { left: 'import', right: '*', type: 'import' },
  { left: 'import', right: 'type', type: 'import' },
  { left: 'export', right: '{', type: 'export' },
  { left: 'export', right: ' ', type: 'export' },
  { left: 'export', right: 'default', type: 'export' },
  { left: 'export', right: 'type', type: 'export' },
  { left: ':', right: 'string', type: 'type' },
  { left: ':', right: 'number', type: 'type' },
  { left: 'interface', right: ' ', type: 'type' },
  { left: 'type', right: ' ', type: 'type' },
]

// ─── Extract Tokens ────────────────────────────────────────────────────────────

/**
 * Extract significant code tokens from content.
 *
 * @example
 * extractTokens('import { foo } from "bar"')
 */
export function extractTokens(content: string): string[] {
  const tokens: string[] = []
  const tokenPattern = /\b(import|export|from|default|type|interface|async|await|Promise|try|catch|throw|Error|if|else|switch|for|while|return|const|let|function|class)\b|[{}()\[\];=]=>|:|\b(string|number|boolean|void)\b/g
  let match: RegExpExecArray | null
  while ((match = tokenPattern.exec(content)) !== null) {
    tokens.push(match[0].trim())
  }
  return tokens.filter((t) => t.length > 0)
}

// ─── Extract Base Pairs ────────────────────────────────────────────────────────

/**
 * Extract base pairs from code content.
 *
 * @example
 * extractBasePairs('import { foo } from "bar"')
 */
export function extractBasePairs(content: string): BasePair[] {
  const found = new Map<string, BasePair>()
  const lines = content.split('\n')

  for (const line of lines) {
    for (const bp of basePairPatterns) {
      const pattern = new RegExp(`\\b${escapeRegex(bp.left)}\\b.*?\\b${escapeRegex(bp.right)}\\b|${escapeRegex(bp.left)}\\s*${escapeRegex(bp.right)}`)
      if (pattern.test(line)) {
        const key = `${bp.left}|${bp.right}|${bp.type}`
        const existing = found.get(key)
        if (existing) {
          existing.frequency++
        } else {
          found.set(key, { left: bp.left, right: bp.right, type: bp.type, frequency: 1 })
        }
      }
    }
  }

  return Array.from(found.values())
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─── Extract Codons ────────────────────────────────────────────────────────────

/**
 * Extract codons (3-element sequences) from code content.
 *
 * @example
 * extractCodons('import { foo }; export const bar = 1; function baz() {}')
 */
export function extractCodons(content: string): Codon[] {
  const tokens = extractTokens(content)
  if (tokens.length < 3) return []

  const codonMap = new Map<string, { bases: string[]; count: number }>()
  for (let i = 0; i <= tokens.length - 3; i++) {
    const trio = [tokens[i], tokens[i + 1], tokens[i + 2]].filter((s): s is string => typeof s === 'string')
    const key = trio.join('|')
    const existing = codonMap.get(key)
    if (existing) {
      existing.count++
    } else {
      codonMap.set(key, { bases: [...trio], count: 1 })
    }
  }

  const totalCodons = Array.from(codonMap.values()).reduce((s, c) => s + c.count, 0)
  const dominantThreshold = totalCodons > 0 ? totalCodons * 0.05 : 1

  return Array.from(codonMap.entries()).map(([key, val]) => {
    const isDominant = val.count >= dominantThreshold
    const isMutation = val.count === 1 && totalCodons > 5
    return {
      bases: val.bases,
      description: key,
      frequency: val.count,
      isDominant,
      isMutation,
    }
  })
}

// ─── Build Strand ──────────────────────────────────────────────────────────────

/**
 * Build a DNA strand for a file.
 *
 * @example
 * buildStrand('mod.ts', 'import { x } from "y"', codons)
 */
export function buildStrand(file: string, content: string, codons: Codon[]): DnaStrand {
  const length = codons.length
  const gc = computeGCContent(content)
  const mutationCount = codons.filter((c) => c.isMutation).length

  return {
    file,
    length,
    sequence: codons,
    gcContent: gc,
    mutations: mutationCount,
    similarity: 0,
  }
}

// ─── GC Content ────────────────────────────────────────────────────────────────

/**
 * Compute GC content (complexity ratio).
 *
 * @example
 * computeGCContent('if (x) { try { await foo() } catch (e) {} }')
 */
export function computeGCContent(content: string): number {
  if (content.length === 0) return 0

  const complexPatterns = [
    /\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g,
    /\btry\b/g, /\bcatch\b/g, /\basync\b/g, /\bawait\b/g,
    /\bclass\b/g, /\binterface\b/g, /\btype\b/g,
    /\bexport\b/g, /\bimport\b/g,
  ]

  let complexCount = 0
  const totalTokens = (content.match(/\b\w+\b/g) || []).length
  if (totalTokens === 0) return 0

  for (const pat of complexPatterns) {
    const m = content.match(pat)
    if (m) complexCount += m.length
  }

  return Math.min(100, Math.round((complexCount / totalTokens) * 100))
}

// ─── Identify Dominant Sequence ────────────────────────────────────────────────

/**
 * Identify the most common codon sequence across all files.
 *
 * @example
 * identifyDominantSequence(allCodons)
 */
export function identifyDominantSequence(allCodons: Codon[]): string {
  if (allCodons.length === 0) return 'none'

  const sorted = [...allCodons].sort((a, b) => b.frequency - a.frequency)
  return sorted[0]?.bases.join(' \u2192 ') ?? 'none'
}

// ─── Detect Mutations ──────────────────────────────────────────────────────────

/**
 * Count mutation codons across all strands.
 *
 * @example
 * detectMutations(allCodons)
 */
export function detectMutations(allCodons: Codon[]): Codon[] {
  return allCodons.filter((c) => c.isMutation)
}

// ─── Compute Similarity ────────────────────────────────────────────────────────

/**
 * Compute similarity between a strand and the dominant strand.
 *
 * @example
 * computeSimilarity(strand, dominantStrand)
 */
export function computeSimilarity(strand: DnaStrand, dominantStrand: DnaStrand): number {
  if (strand.sequence.length === 0 && dominantStrand.sequence.length === 0) return 100
  if (strand.sequence.length === 0 || dominantStrand.sequence.length === 0) return 0

  const strandKeys = new Set(strand.sequence.map((c) => c.description))
  const dominantKeys = new Set(dominantStrand.sequence.map((c) => c.description))

  let overlap = 0
  for (const key of strandKeys) {
    if (dominantKeys.has(key)) overlap++
  }

  const union = new Set([...strandKeys, ...dominantKeys]).size
  return union > 0 ? Math.round((overlap / union) * 100) : 0
}

// ─── Find Genetic Markers ──────────────────────────────────────────────────────

/**
 * Find genetic markers — codons appearing in many files.
 *
 * @example
 * findGeneticMarkers(fileCodons, files)
 */
export function findGeneticMarkers(fileCodons: Map<string, Codon[]>, files: string[]): GeneticMarker[] {
  const markers: GeneticMarker[] = []
  const codonFileMap = new Map<string, Set<string>>()

  for (const [file, codons] of fileCodons) {
    for (const codon of codons) {
      if (!codonFileMap.has(codon.description)) {
        codonFileMap.set(codon.description, new Set())
      }
      codonFileMap.get(codon.description)!.add(file)
    }
  }

  for (const [pattern, fileSet] of codonFileMap) {
    const ratio = fileSet.size / Math.max(1, files.length)
    if (ratio >= 0.5 && files.length >= 2) {
      const codonBase = pattern.split('|')
      markers.push({
        pattern: codonBase.join(' \u2192 '),
        description: `Found in ${fileSet.size}/${files.length} files`,
        files: Array.from(fileSet),
        uniqueness: Math.round(ratio * 100),
      })
    }
  }

  return markers.sort((a, b) => b.files.length - a.files.length)
}

// ─── Compute Mutation Rate ─────────────────────────────────────────────────────

/**
 * Compute mutation rate (% of unusual codons).
 *
 * @example
 * computeMutationRate(strands)
 */
export function computeMutationRate(strands: DnaStrand[]): number {
  if (strands.length === 0) return 0
  const totalCodons = strands.reduce((s, st) => s + st.length, 0)
  const totalMutations = strands.reduce((s, st) => s + st.mutations, 0)
  if (totalCodons === 0) return 0
  return Math.round((totalMutations / totalCodons) * 100)
}

// ─── Compute Genetic Diversity ─────────────────────────────────────────────────

/**
 * Compute genetic diversity (Shannon diversity of sequences).
 *
 * @example
 * computeGeneticDiversity(allCodons)
 */
export function computeGeneticDiversity(allCodons: Codon[]): number {
  if (allCodons.length === 0) return 0

  const total = allCodons.reduce((s, c) => s + c.frequency, 0)
  if (total === 0) return 0

  let entropy = 0
  for (const codon of allCodons) {
    const p = codon.frequency / total
    if (p > 0) entropy -= p * Math.log2(p)
  }

  const maxEntropy = Math.log2(allCodons.length)
  return maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 100) : 0
}

// ─── Compute Health Score ──────────────────────────────────────────────────────

/**
 * Compute health score (0-100).
 *
 * @example
 * computeHealthScore(10, 80)
 */
export function computeHealthScore(mutationRate: number, avgSimilarity: number): number {
  const mutationPenalty = mutationRate * 0.5
  const similarityBonus = avgSimilarity * 0.5
  return Math.max(0, Math.min(100, Math.round(100 - mutationPenalty + similarityBonus - 50)))
}

// ─── Generate Recommendations ──────────────────────────────────────────────────

/**
 * Generate DNA analysis recommendations.
 *
 * @example
 * generateRecommendations(strands, markers, stats)
 */
export function generateRecommendations(
  strands: DnaStrand[],
  markers: GeneticMarker[],
  stats: DnaStats,
): string[] {
  const recs: string[] = []

  if (stats.mutationRate > 30) {
    recs.push(`Mutation rate is ${stats.mutationRate}% — standardize code patterns to reduce unusual sequences`)
  }

  if (stats.avgSimilarity < 40) {
    recs.push('Low cross-file similarity — increase consistency in code structure')
  }

  if (stats.gcContent < 20) {
    recs.push('Low GC content (complexity ratio) — code may be too simple or lacking type patterns')
  }

  if (markers.length === 0 && strands.length > 3) {
    recs.push('No genetic markers found — establish codebase-wide conventions for a stronger identity')
  }

  if (stats.geneticDiversity < 30) {
    recs.push('Low genetic diversity — introduce more varied (but consistent) patterns')
  }

  const mutantStrands = strands.filter((s) => s.mutations > 5)
  if (mutantStrands.length > 0) {
    recs.push(`${mutantStrands.length} strand(s) with high mutations: ${mutantStrands.slice(0, 3).map((s) => s.file).join(', ')}`)
  }

  if (stats.healthScore > 70) {
    recs.push(`DNA health score is ${stats.healthScore}% — strong genetic consistency across the codebase`)
  }

  if (recs.length === 0) {
    recs.push('The codebase DNA shows healthy genetic structure with consistent patterns')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete DNA result.
 *
 * @example
 * buildDnaResult(['a.ts'], ['code'], {})
 */
export function buildDnaResult(files: string[], contents: string[], _options: Record<string, unknown>): DnaResult {
  if (files.length === 0) {
    const emptyStats: DnaStats = {
      totalStrands: 0, totalBasePairs: 0, totalCodons: 0, dominantSequence: 'none',
      mutationRate: 0, avgSimilarity: 0, gcContent: 0, markerCount: 0,
      uniqueMarkers: 0, geneticDiversity: 0, healthScore: 0,
    }
    return { strands: [], basePairs: [], markers: [], stats: emptyStats, recommendations: ['No files to sequence'] }
  }

  const allBasePairs: BasePair[] = []
  const allCodons: Codon[] = []
  const fileCodons = new Map<string, Codon[]>()
  const strands: DnaStrand[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''

    const bp = extractBasePairs(content)
    allBasePairs.push(...bp)

    const codons = extractCodons(content)
    fileCodons.set(files[i] ?? '', codons)
    allCodons.push(...codons)

    const strand = buildStrand(files[i] ?? '', content, codons)
    strands.push(strand)
  }

  const dominantSeq = identifyDominantSequence(allCodons)

  const dominantStrand = strands.reduce((a, b) => a.length >= b.length ? a : b, strands[0] as typeof strands[number])
  for (const strand of strands) {
    strand.similarity = computeSimilarity(strand, dominantStrand)
  }

  const markers = findGeneticMarkers(fileCodons, files)

  const totalBP = allBasePairs.reduce((s, bp) => s + bp.frequency, 0)
  const totalCodonCount = allCodons.reduce((s, c) => s + c.frequency, 0)
  const mutationRate = computeMutationRate(strands)
  const avgSimilarity = strands.length > 0
    ? Math.round(strands.reduce((s, st) => s + st.similarity, 0) / strands.length)
    : 0
  const gcContent = strands.length > 0
    ? Math.round(strands.reduce((s, st) => s + st.gcContent, 0) / strands.length)
    : 0

  const uniqueCodons = new Map<string, Codon>()
  for (const c of allCodons) {
    const existing = uniqueCodons.get(c.description)
    if (existing) {
      existing.frequency += c.frequency
    } else {
      uniqueCodons.set(c.description, { ...c })
    }
  }
  const geneticDiversity = computeGeneticDiversity(Array.from(uniqueCodons.values()))
  const healthScore = computeHealthScore(mutationRate, avgSimilarity)

  const stats: DnaStats = {
    totalStrands: strands.length,
    totalBasePairs: totalBP,
    totalCodons: totalCodonCount,
    dominantSequence: dominantSeq,
    mutationRate,
    avgSimilarity,
    gcContent,
    markerCount: markers.length,
    uniqueMarkers: markers.filter((m) => m.uniqueness >= 80).length,
    geneticDiversity,
    healthScore,
  }

  const recommendations = generateRecommendations(strands, markers, stats)

  return { strands, basePairs: allBasePairs, markers, stats, recommendations }
}
