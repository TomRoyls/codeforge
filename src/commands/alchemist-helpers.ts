// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Element {
  symbol: string
  name: string
  property: string
  value: number
  weight: number
}

export interface TransmutationStep {
  description: string
  element: string
  impact: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface Transmutation {
  file: string
  currentGrade: string
  currentPurity: number
  elements: Element[]
  nextGrade: string
  requiredPurity: number
  steps: TransmutationStep[]
  estimatedEffort: 'minor' | 'moderate' | 'significant'
}

export interface AlchemistStats {
  totalFiles: number
  gradeDistribution: Record<string, number>
  avgPurity: number
  highestPurity: string
  lowestPurity: string
  goldCount: number
  leadCount: number
  transmutationPotential: number
  philosopherStoneScore: number
}

export interface AlchemistResult {
  transmutations: Transmutation[]
  elements: Element[]
  stats: AlchemistStats
  recommendations: string[]
}

// ─── Grade System ─────────────────────────────────────────────────────────────

const GRADES: { name: string; min: number; max: number }[] = [
  { name: 'Lead', min: 0, max: 20 },
  { name: 'Copper', min: 21, max: 40 },
  { name: 'Bronze', min: 41, max: 60 },
  { name: 'Silver', min: 61, max: 75 },
  { name: 'Gold', min: 76, max: 90 },
  { name: 'Platinum', min: 91, max: 100 },
]

/**
 * Determine grade from purity score.
 *
 * @example
 * determineGrade(85)
 */
export function determineGrade(purity: number): string {
  for (const g of GRADES) {
    if (purity >= g.min && purity <= g.max) return g.name
  }
  return 'Lead'
}

/**
 * Compute the next grade up.
 *
 * @example
 * computeNextGrade('Silver')
 */
export function computeNextGrade(currentGrade: string): { name: string; requiredPurity: number } {
  const idx = GRADES.findIndex((g) => g.name === currentGrade)
  if (idx < 0 || idx >= GRADES.length - 1) {
    const last = GRADES[GRADES.length - 1]!
    return { name: last.name, requiredPurity: last.min }
  }
  const next = GRADES[idx + 1]!
  return { name: next.name, requiredPurity: next.min }
}

// ─── Element Measurement Functions ────────────────────────────────────────────

/**
 * Measure documentation: JSDoc coverage on exports.
 *
 * @example
 * measureDocumentation('export function foo() {}')
 */
export function measureDocumentation(content: string): Element {
  const exports = content.match(/^export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+/gm)
  const exportCount = exports ? exports.length : 0

  const jsdocBlocks = content.match(/\/\*\*[\s\S]*?\*\//g)
  const jsdocCount = jsdocBlocks ? jsdocBlocks.length : 0

  let value = 0
  if (exportCount === 0) {
    value = content.includes('/**') ? 80 : 50
  } else {
    value = Math.min(100, Math.round((jsdocCount / exportCount) * 100))
  }

  return { symbol: 'Au', name: 'Aurum', property: 'Documentation', value, weight: 1.2 }
}

/**
 * Measure clarity: naming quality and function length.
 *
 * @example
 * measureClarity('function myFunc() { return 1 }')
 */
export function measureClarity(content: string): Element {
  const functions = content.match(/\bfunction\s+(\w+)/g) ?? []
  const arrows = content.match(/const\s+(\w+)\s*=\s*(?:\([^)]*\)|\w+)\s*=>/g) ?? []
  const allFns = [...functions, ...arrows]

  if (allFns.length === 0) return { symbol: 'Ag', name: 'Argentum', property: 'Clarity', value: 70, weight: 1.0 }

  let goodNames = 0
  for (const fn of allFns) {
    const nameMatch = fn.match(/(\w+)\s*(?:\(|=)/)
    if (nameMatch) {
      const name = nameMatch[1] ?? ''
      if (name.length > 2 && /^[a-z]/.test(name) && name !== 'function') goodNames++
    }
  }

  const namingScore = Math.round((goodNames / allFns.length) * 70)

  const lines = content.split('\n').length
  const avgFnLength = allFns.length > 0 ? lines / allFns.length : lines
  const lengthScore = avgFnLength <= 20 ? 30 : avgFnLength <= 40 ? 20 : avgFnLength <= 60 ? 10 : 0

  const value = Math.min(100, namingScore + lengthScore)

  return { symbol: 'Ag', name: 'Argentum', property: 'Clarity', value, weight: 1.0 }
}

/**
 * Measure structure: file organization and nesting depth.
 *
 * @example
 * measureStructure('function foo() { if (x) { if (y) {} } }')
 */
export function measureStructure(content: string): Element {
  const lines = content.split('\n')
  let maxDepth = 0
  let currentDepth = 0

  for (const line of lines) {
    for (const ch of line) {
      if (ch === '{' || ch === '(' || ch === '[') {
        currentDepth++
        if (currentDepth > maxDepth) maxDepth = currentDepth
      }
      if (ch === '}' || ch === ')' || ch === ']') {
        currentDepth = Math.max(0, currentDepth - 1)
      }
    }
  }

  let depthScore = 100
  if (maxDepth > 8) depthScore = 30
  else if (maxDepth > 6) depthScore = 50
  else if (maxDepth > 4) depthScore = 70
  else if (maxDepth > 3) depthScore = 85

  const effectiveLines = lines.filter((l) => l.trim().length > 0).length
  let lengthScore = 100
  if (effectiveLines > 300) lengthScore = 40
  else if (effectiveLines > 200) lengthScore = 60
  else if (effectiveLines > 100) lengthScore = 80

  const value = Math.round((depthScore + lengthScore) / 2)

  return { symbol: 'Fe', name: 'Ferrum', property: 'Structure', value, weight: 0.8 }
}

/**
 * Measure type safety: type annotations, no any.
 *
 * @example
 * measureTypeSafety('const x: number = 1')
 */
export function measureTypeSafety(content: string): Element {
  let score = 80

  const anyCount = (content.match(/:\s*any\b/g) ?? []).length
  score -= anyCount * 10

  const ignoreCount = (content.match(/\/\/\s*@ts-ignore|\/\/\s*@ts-expect-error/g) ?? []).length
  score -= ignoreCount * 15

  const asAnyCount = (content.match(/\bas\s+any\b/g) ?? []).length
  score -= asAnyCount * 10

  const typeAnnotations = (content.match(/:\s*(?:string|number|boolean|void|object|unknown|never|undefined|null)\b/g) ?? []).length
  if (typeAnnotations > 0) score += Math.min(20, typeAnnotations * 2)

  const value = Math.max(0, Math.min(100, score))

  return { symbol: 'Cu', name: 'Cuprum', property: 'Type Safety', value, weight: 1.0 }
}

/**
 * Measure error handling: catch blocks and error types.
 *
 * @example
 * measureErrorHandling('try {} catch(e) {}')
 */
export function measureErrorHandling(content: string): Element {
  const functions = content.match(/\bfunction\b|=>\s*[{(]|\basync\s+\w+\s*\(/g)
  const fnCount = functions ? functions.length : 0

  const catches = content.match(/\bcatch\s*\(/g)
  const catchCount = catches ? catches.length : 0

  const throws = content.match(/\bthrow\s+/g)
  const throwCount = throws ? throws.length : 0

  let value = 50
  if (fnCount === 0) {
    value = 70
  } else {
    const ratio = (catchCount + throwCount) / fnCount
    if (ratio >= 0.5) value = 90
    else if (ratio >= 0.3) value = 75
    else if (ratio >= 0.1) value = 60
    else value = 40
  }

  return { symbol: 'Sn', name: 'Stannum', property: 'Error Handling', value, weight: 0.9 }
}

/**
 * Measure testing: test file detection and test patterns.
 *
 * @example
 * measureTesting('test.ts', 'it("works", () => {})')
 */
export function measureTesting(file: string, content: string): Element {
  const isTest = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(file)

  if (isTest) return { symbol: 'Pt', name: 'Platinum', property: 'Testing', value: 95, weight: 1.1 }

  const hasDescribe = /\bdescribe\s*\(/.test(content)
  const hasIt = /\bit\s*\(/.test(content)
  const hasTest = /\btest\s*\(/.test(content)

  if (hasDescribe || hasIt || hasTest) {
    return { symbol: 'Pt', name: 'Platinum', property: 'Testing', value: 80, weight: 1.1 }
  }

  return { symbol: 'Pt', name: 'Platinum', property: 'Testing', value: 30, weight: 1.1 }
}

/**
 * Measure complexity: inverse cyclomatic complexity.
 *
 * @example
 * measureComplexity('if (x) { for (let i = 0; i < 10; i++) {} }')
 */
export function measureComplexity(content: string): Element {
  const patterns = [/\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcatch\b/g, /&&/g, /\|\|/g]
  let total = 1
  for (const pat of patterns) {
    const m = content.match(pat)
    if (m) total += m.length
  }

  let value = 100
  if (total > 20) value = 20
  else if (total > 15) value = 40
  else if (total > 10) value = 60
  else if (total > 5) value = 80
  else value = 95

  return { symbol: 'Hg', name: 'Mercury', property: 'Complexity', value, weight: 1.0 }
}

// ─── Purity Computation ───────────────────────────────────────────────────────

/**
 * Compute weighted purity from elements.
 *
 * @example
 * computePurity(elements)
 */
export function computePurity(elements: Element[]): number {
  let totalWeight = 0
  let weightedSum = 0
  for (const e of elements) {
    weightedSum += e.value * e.weight
    totalWeight += e.weight
  }
  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0
}

// ─── Transmutation Steps ──────────────────────────────────────────────────────

/**
 * Generate transmutation steps to improve a file.
 *
 * @example
 * generateTransmutationSteps('a.ts', elements, content)
 */
export function generateTransmutationSteps(
  _file: string,
  elements: Element[],
  _content: string,
): TransmutationStep[] {
  const steps: TransmutationStep[] = []

  const sorted = [...elements].sort((a, b) => a.value - b.value)
  const weakest = sorted[0]
  if (weakest && weakest.value < 60) {
    const impact = Math.min(30, Math.round((60 - weakest.value) * 0.5))
    steps.push({
      description: `Improve ${weakest.property} (${weakest.symbol}: ${weakest.value}/100)`,
      element: weakest.symbol,
      impact,
      difficulty: weakest.value < 30 ? 'hard' : weakest.value < 50 ? 'medium' : 'easy',
    })
  }

  const secondWeakest = sorted[1]
  if (secondWeakest && secondWeakest.value < 70) {
    steps.push({
      description: `Boost ${secondWeakest.property} (${secondWeakest.symbol}: ${secondWeakest.value}/100)`,
      element: secondWeakest.symbol,
      impact: Math.min(20, Math.round((70 - secondWeakest.value) * 0.3)),
      difficulty: secondWeakest.value < 40 ? 'hard' : 'medium',
    })
  }

  for (const e of elements) {
    if (e.value < 40) {
      steps.push({
        description: `Critical: ${e.property} score is ${e.value} — major transmutation needed`,
        element: e.symbol,
        impact: Math.min(25, 40 - e.value),
        difficulty: 'hard',
      })
    }
  }

  return steps
}

/**
 * Determine estimated effort for transmutation.
 *
 * @example
 * determineEffort(steps)
 */
export function determineEffort(steps: TransmutationStep[]): 'minor' | 'moderate' | 'significant' {
  const hardCount = steps.filter((s) => s.difficulty === 'hard').length
  if (hardCount >= 2) return 'significant'
  if (steps.length > 3 || hardCount >= 1) return 'moderate'
  return 'minor'
}

// ─── Philosopher's Stone Score ────────────────────────────────────────────────

/**
 * Compute how close the codebase is to all-gold.
 *
 * @example
 * computePhilosopherStoneScore(transmutations)
 */
export function computePhilosopherStoneScore(transmutations: Transmutation[]): number {
  if (transmutations.length === 0) return 100
  const goldOrBetter = transmutations.filter((t) => t.currentGrade === 'Gold' || t.currentGrade === 'Platinum').length
  return Math.round((goldOrBetter / transmutations.length) * 100)
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate alchemical recommendations.
 *
 * @example
 * generateRecommendations(transmutations, stats)
 */
export function generateRecommendations(
  transmutations: Transmutation[],
  stats: AlchemistStats,
): string[] {
  const recs: string[] = []

  const leads = transmutations.filter((t) => t.currentGrade === 'Lead')
  if (leads.length > 0) {
    recs.push(`Priority transmutation: ${leads.length} Lead file(s) need immediate refinement`)
    for (const l of leads.slice(0, 3)) {
      recs.push(`  - ${l.file}: purity ${l.currentPurity} — ${l.steps[0]?.description ?? 'needs analysis'}`)
    }
  }

  const nearGold = transmutations.filter((t) => t.currentGrade === 'Silver')
  if (nearGold.length > 0) {
    recs.push(`Near-gold: ${nearGold.length} Silver file(s) are close to transmutation — final polish recommended`)
  }

  const allElements = transmutations.flatMap((t) => t.elements)
  const elementAvgs: Record<string, number> = {}
  for (const e of allElements) {
    elementAvgs[e.symbol] = (elementAvgs[e.symbol] ?? 0) + e.value
  }
  const symbols = [...new Set(allElements.map((e) => e.symbol))]
  for (const sym of symbols) {
    const count = transmutations.length
    const avg = count > 0 ? Math.round(elementAvgs[sym]! / count) : 0
    if (avg < 50) {
      const elem = allElements.find((e) => e.symbol === sym)
      recs.push(`Element ${sym} (${elem?.property ?? 'Unknown'}) averages ${avg} — project-wide improvement needed`)
    }
  }

  if (stats.philosopherStoneScore >= 80) {
    recs.push(`Philosopher's Stone progress: ${stats.philosopherStoneScore}% — approaching codebase enlightenment`)
  } else if (stats.philosopherStoneScore < 30) {
    recs.push(`Philosopher's Stone progress: ${stats.philosopherStoneScore}% — significant transmutation work remains`)
  }

  if (recs.length === 0) {
    recs.push('All files have achieved Gold or Platinum status — the transmutation is complete')
  }

  return recs
}

// ─── Master Elements ──────────────────────────────────────────────────────────

/**
 * Get the master element template.
 *
 * @example
 * getMasterElements()
 */
export function getMasterElements(): { symbol: string; name: string; property: string; weight: number }[] {
  return [
    { symbol: 'Au', name: 'Aurum', property: 'Documentation', weight: 1.2 },
    { symbol: 'Ag', name: 'Argentum', property: 'Clarity', weight: 1.0 },
    { symbol: 'Fe', name: 'Ferrum', property: 'Structure', weight: 0.8 },
    { symbol: 'Cu', name: 'Cuprum', property: 'Type Safety', weight: 1.0 },
    { symbol: 'Sn', name: 'Stannum', property: 'Error Handling', weight: 0.9 },
    { symbol: 'Pt', name: 'Platinum', property: 'Testing', weight: 1.1 },
    { symbol: 'Hg', name: 'Mercury', property: 'Complexity', weight: 1.0 },
  ]
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build complete alchemist result from files and contents.
 *
 * @example
 * buildAlchemistResult(['a.ts'], ['const x = 1'], { maxDepth: 50 })
 */
export function buildAlchemistResult(
  files: string[],
  contents: string[],
  _options: { maxDepth: number },
): AlchemistResult {
  const transmutations: Transmutation[] = files.map((file, i) => {
    const content = contents[i] ?? ''

    const elements: Element[] = [
      measureDocumentation(content),
      measureClarity(content),
      measureStructure(content),
      measureTypeSafety(content),
      measureErrorHandling(content),
      measureTesting(file, content),
      measureComplexity(content),
    ]

    const purity = computePurity(elements)
    const grade = determineGrade(purity)
    const next = computeNextGrade(grade)
    const steps = generateTransmutationSteps(file, elements, content)

    return {
      file,
      currentGrade: grade,
      currentPurity: purity,
      elements,
      nextGrade: next.name,
      requiredPurity: next.requiredPurity,
      steps,
      estimatedEffort: determineEffort(steps),
    }
  })

  const gradeDistribution: Record<string, number> = {}
  for (const t of transmutations) {
    gradeDistribution[t.currentGrade] = (gradeDistribution[t.currentGrade] ?? 0) + 1
  }

  const purities = transmutations.map((t) => t.currentPurity)
  const avgPurity = purities.length > 0 ? Math.round((purities.reduce((a, b) => a + b, 0) / purities.length) * 100) / 100 : 0

  const sorted = [...transmutations].sort((a, b) => b.currentPurity - a.currentPurity)
  const highestPurity = sorted[0]?.file ?? 'none'
  const lowestPurity = sorted[sorted.length - 1]?.file ?? 'none'

  const goldCount = transmutations.filter((t) => t.currentGrade === 'Gold' || t.currentGrade === 'Platinum').length
  const leadCount = transmutations.filter((t) => t.currentGrade === 'Lead').length

  const potential = transmutations.reduce((sum, t) => {
    const gap = 100 - t.currentPurity
    return sum + Math.min(gap, 30)
  }, 0)
  const transmutationPotential = transmutations.length > 0 ? Math.round((potential / transmutations.length) * 100) / 100 : 0

  const philosopherStoneScore = computePhilosopherStoneScore(transmutations)

  const stats: AlchemistStats = {
    totalFiles: files.length,
    gradeDistribution,
    avgPurity,
    highestPurity,
    lowestPurity,
    goldCount,
    leadCount,
    transmutationPotential,
    philosopherStoneScore,
  }

  const recommendations = generateRecommendations(transmutations, stats)

  const masterElements = getMasterElements().map((e) => ({
    ...e,
    value: transmutations.length > 0
      ? Math.round(transmutations.reduce((s, t) => {
          const el = t.elements.find((te) => te.symbol === e.symbol)
          return s + (el?.value ?? 0)
        }, 0) / transmutations.length)
      : 0,
  }))

  return { transmutations, elements: masterElements, stats, recommendations }
}
