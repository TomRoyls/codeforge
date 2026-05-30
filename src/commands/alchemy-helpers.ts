// ─── Types ────────────────────────────────────────────────────────────────────

export type Metal = 'lead' | 'iron' | 'copper' | 'bronze' | 'silver' | 'gold'

export interface Transformation {
  type: 'simplification' | 'abstraction' | 'encapsulation' | 'generalization' | 'optimization' | 'modernization' | 'fortification' | 'clarification'
  from: string
  to: string
  difficulty: 'elementary' | 'intermediate' | 'advanced' | 'masterwork'
  reagent: string
  yield: number
  risk: 'safe' | 'caution' | 'volatile' | 'explosive'
}

export interface TransmutationTarget {
  file: string
  currentMetal: Metal
  potentialMetal: string
  transmutability: number
  transformations: Transformation[]
  readiness: 'raw' | 'prepared' | 'reactive' | 'stable'
  essence: number
}

export interface Catalyst {
  name: string
  type: 'tooling' | 'pattern' | 'convention' | 'practice' | 'dependency'
  effectiveness: number
  applicableTo: string[]
  isAvailable: boolean
  description: string
}

export interface Element {
  name: string
  count: number
  purity: number
  reactivity: number
  stability: number
  isNoble: boolean
}

export interface AlchemyStats {
  totalTargets: number
  leadFiles: number
  goldFiles: number
  avgTransmutability: number
  avgEssence: number
  totalTransformations: number
  elementaryTransformations: number
  masterworkTransformations: number
  safeTransformations: number
  explosiveTransformations: number
  availableCatalysts: number
  missingCatalysts: number
  totalElements: number
  nobleElements: number
  overallTransmutationPotential: number
  philosopherStoneScore: number
  dominantMetal: string
  alchemyGrade: 'grand-master' | 'master' | 'adept' | 'apprentice' | 'novice'
}

export interface AlchemyResult {
  targets: TransmutationTarget[]
  catalysts: Catalyst[]
  elements: Element[]
  stats: AlchemyStats
  recommendations: string[]
}

// ─── Metal Classification ─────────────────────────────────────────────────────

/**
 * Score code quality indicators
 * @example
 * scoreQuality('const x: number = 1') // { types: true, docs: false, ... }
 */
export function scoreQualityIndicators(content: string): {
  hasTypes: boolean
  hasDocs: boolean
  hasErrorHandling: boolean
  hasExports: boolean
  hasConstants: boolean
  hasModernSyntax: boolean
} {
  return {
    hasTypes: /:\s*(string|number|boolean|void|any|unknown|never|object)\b/.test(content),
    hasDocs: /\/\*\*[\s\S]*?\*\//g.test(content) || /\/\/.*$/m.test(content),
    hasErrorHandling: /\b(try|catch|throw|Error)\b/.test(content),
    hasExports: /\bexport\b/.test(content),
    hasConstants: /\bconst\s+\w+/.test(content),
    hasModernSyntax: /\b(const|let|=>|\.\.\.|`\$\{)/.test(content),
  }
}

/**
 * Count quality indicators present
 * @example
 * countQualityFlags({ hasTypes: true, hasDocs: false, ... }) // 1
 */
export function countQualityFlags(indicators: ReturnType<typeof scoreQualityIndicators>): number {
  return Object.values(indicators).filter(Boolean).length
}

/**
 * Classify the metal (quality tier) of a file
 * @example
 * classifyMetal('const x: number = 1') // 'copper'
 */
export function classifyMetal(content: string, _filePath: string): Metal {
  const ind = scoreQualityIndicators(content)
  const score = countQualityFlags(ind)
  const hasAny = /\bany\b/.test(content)
  const adjusted = hasAny ? score - 1 : score

  if (adjusted >= 6) return 'gold'
  if (adjusted >= 5) return 'silver'
  if (adjusted >= 4) return 'bronze'
  if (adjusted >= 3) return 'copper'
  if (adjusted >= 2) return 'iron'
  return 'lead'
}

/**
 * Get the next metal up from current
 * @example
 * nextMetalUp('lead') // 'iron'
 */
export function nextMetalUp(metal: Metal): string {
  const order: Metal[] = ['lead', 'iron', 'copper', 'bronze', 'silver', 'gold']
  const idx = order.indexOf(metal)
  return idx < order.length - 1 ? order[idx + 1] ?? 'gold' : 'gold'
}

// ─── Transformations ──────────────────────────────────────────────────────────

/**
 * Identify possible transformations for a file
 * @example
 * identifyTransformations('var x = 1', 'a.ts', 'lead')
 */
export function identifyTransformations(content: string, _filePath: string, metal: Metal): Transformation[] {
  const transforms: Transformation[] = []

  if (/\bvar\b/.test(content)) {
    transforms.push({
      type: 'modernization', from: 'var declarations', to: 'const/let declarations',
      difficulty: 'elementary', reagent: 'ES6 syntax migration', yield: 80, risk: 'safe',
    })
  }

  if (/\bfunction\s+\w+\s*\([^)]*\)\s*\{/.test(content) && !/=>/.test(content)) {
    transforms.push({
      type: 'modernization', from: 'function expressions', to: 'arrow functions',
      difficulty: 'elementary', reagent: 'ES6 arrow syntax', yield: 60, risk: 'safe',
    })
  }

  if ((content.match(/\bany\b/g) || []).length >= 2) {
    transforms.push({
      type: 'fortification', from: 'any type usage', to: 'specific types',
      difficulty: 'intermediate', reagent: 'TypeScript strict types', yield: 90, risk: 'caution',
    })
  }

  if (/\beval\s*\(/.test(content)) {
    transforms.push({
      type: 'fortification', from: 'eval() usage', to: 'safe alternatives',
      difficulty: 'advanced', reagent: 'Function constructor or safe parser', yield: 95, risk: 'volatile',
    })
  }

  if (!/\/\*\*[\s\S]*?\*\//g.test(content) && content.length > 100) {
    transforms.push({
      type: 'clarification', from: 'undocumented code', to: 'JSDoc documented code',
      difficulty: 'elementary', reagent: 'JSDoc annotations', yield: 70, risk: 'safe',
    })
  }

  const functions = content.match(/function\s+\w+/g) || []
  if (functions.length >= 3) {
    transforms.push({
      type: 'abstraction', from: 'many loose functions', to: 'organized modules/classes',
      difficulty: 'intermediate', reagent: 'Module pattern or class extraction', yield: 75, risk: 'caution',
    })
  }

  if (/\bfor\s*\(/.test(content) && !/\.forEach|\.map|\.filter|\.reduce/.test(content)) {
    transforms.push({
      type: 'modernization', from: 'for loops', to: 'array methods',
      difficulty: 'elementary', reagent: 'Array.prototype methods', yield: 65, risk: 'safe',
    })
  }

  if (/\bconsole\.log\b/.test(content)) {
    transforms.push({
      type: 'clarification', from: 'console.log debugging', to: 'proper logging',
      difficulty: 'elementary', reagent: 'Logging library', yield: 50, risk: 'safe',
    })
  }

  if (metal === 'lead' || metal === 'iron') {
    transforms.push({
      type: 'fortification', from: 'no type safety', to: 'TypeScript types',
      difficulty: 'intermediate', reagent: 'TypeScript compiler', yield: 85, risk: 'caution',
    })
  }

  if (/try\s*\{/.test(content) && !/finally\s*\{/.test(content)) {
    transforms.push({
      type: 'fortification', from: 'incomplete error handling', to: 'try-catch-finally',
      difficulty: 'elementary', reagent: 'Complete error handling pattern', yield: 60, risk: 'safe',
    })
  }

  return transforms
}

// ─── Catalysts ────────────────────────────────────────────────────────────────

/**
 * Find catalysts (tools/patterns) available or missing
 * @example
 * findCatalysts(['a.ts'], ['import chalk from "chalk"'])
 */
export function findCatalysts(files: string[], contents: string[]): Catalyst[] {
  const allContent = contents.join('\n')
  const catalysts: Catalyst[] = [
    {
      name: 'typescript-strict', type: 'tooling', effectiveness: 90,
      applicableTo: ['fortification', 'modernization'],
      isAvailable: /strict/.test(allContent) || files.some(f => f.endsWith('.ts')),
      description: 'TypeScript strict mode enables type safety',
    },
    {
      name: 'eslint-rules', type: 'tooling', effectiveness: 75,
      applicableTo: ['clarification', 'modernization', 'simplification'],
      isAvailable: /eslint|\.eslintrc/.test(allContent),
      description: 'Linting rules enforce code quality standards',
    },
    {
      name: 'test-framework', type: 'tooling', effectiveness: 80,
      applicableTo: ['fortification', 'encapsulation'],
      isAvailable: /vitest|jest|mocha/.test(allContent),
      description: 'Test framework enables safe refactoring',
    },
    {
      name: 'type-annotations', type: 'pattern', effectiveness: 85,
      applicableTo: ['fortification', 'clarification'],
      isAvailable: /:\s*(string|number|boolean|void)/.test(allContent),
      description: 'Type annotations improve code safety',
    },
    {
      name: 'error-boundaries', type: 'pattern', effectiveness: 70,
      applicableTo: ['fortification'],
      isAvailable: /\b(try|catch|throw|Error)\b/.test(allContent),
      description: 'Error handling patterns prevent crashes',
    },
    {
      name: 'module-organization', type: 'convention', effectiveness: 65,
      applicableTo: ['abstraction', 'encapsulation', 'generalization'],
      isAvailable: /\bexport\b/.test(allContent),
      description: 'Module pattern organizes code into reusable units',
    },
    {
      name: 'utility-library', type: 'dependency', effectiveness: 60,
      applicableTo: ['simplification', 'optimization'],
      isAvailable: /import.*from\s+['"]lodash|import.*from\s+['"]ramda/.test(allContent),
      description: 'Utility libraries simplify common operations',
    },
    {
      name: 'immutable-patterns', type: 'practice', effectiveness: 75,
      applicableTo: ['fortification', 'simplification'],
      isAvailable: /\bconst\b/.test(allContent) && !/\bvar\b/.test(allContent),
      description: 'Immutable patterns reduce side effects',
    },
  ]
  return catalysts
}

// ─── Elements ─────────────────────────────────────────────────────────────────

/**
 * Analyze fundamental code elements in a file
 * @example
 * analyzeElements('function foo() {} export const x = 1', 'a.ts')
 */
export function analyzeElements(content: string, _filePath: string): Element[] {
  const elements: Element[] = []

  const funcMatches = content.match(/(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\(|=>)/g) || []
  if (funcMatches.length > 0) {
    const hasTyped = /:\s*\w+\s*[=)]/.test(content)
    elements.push({
      name: 'functions', count: funcMatches.length,
      purity: hasTyped ? 70 : 40,
      reactivity: 60,
      stability: hasTyped ? 80 : 50,
      isNoble: hasTyped && funcMatches.length <= 5,
    })
  }

  const classMatches = content.match(/\bclass\s+\w+/g) || []
  if (classMatches.length > 0) {
    const hasPrivate = /private|#/.test(content)
    elements.push({
      name: 'classes', count: classMatches.length,
      purity: hasPrivate ? 80 : 50,
      reactivity: 70,
      stability: 75,
      isNoble: hasPrivate,
    })
  }

  const typeMatches = content.match(/(?:interface|type)\s+\w+/g) || []
  if (typeMatches.length > 0) {
    elements.push({
      name: 'types', count: typeMatches.length,
      purity: 90, reactivity: 30, stability: 95,
      isNoble: true,
    })
  }

  const importMatches = content.match(/import\s+.*?from/g) || []
  if (importMatches.length > 0) {
    const hasLocal = /\.\//.test(content)
    elements.push({
      name: 'imports', count: importMatches.length,
      purity: 70, reactivity: 80, stability: 40,
      isNoble: !hasLocal && importMatches.length <= 5,
    })
  }

  const constMatches = content.match(/\bconst\s+\w+/g) || []
  if (constMatches.length > 0) {
    const hasTypedConst = /const\s+\w+\s*:/.test(content)
    elements.push({
      name: 'constants', count: constMatches.length,
      purity: hasTypedConst ? 85 : 60,
      reactivity: 20, stability: 90,
      isNoble: hasTypedConst,
    })
  }

  return elements
}

// ─── Computed Properties ──────────────────────────────────────────────────────

/**
 * Compute transmutability score based on metal and transformations
 * @example
 * computeTransmutability('lead', 3) // 85
 */
export function computeTransmutability(metal: Metal, transformCount: number): number {
  const metalBonus: Record<Metal, number> = {
    lead: 90, iron: 75, copper: 60, bronze: 45, silver: 30, gold: 10,
  }
  return Math.min(100, metalBonus[metal] + Math.min(10, transformCount * 2))
}

/**
 * Compute essence score — core value regardless of quality
 * @example
 * computeEssence('export function core() {}') // 60
 */
export function computeEssence(content: string): number {
  let score = 0
  if (/\bexport\b/.test(content)) score += 20
  if (/\bfunction\s+\w+/.test(content)) score += 15
  if (/\bclass\s+\w+/.test(content)) score += 15
  if (/:\s*\w+/.test(content)) score += 15
  if (/\breturn\b/.test(content)) score += 10
  if (/\/\*\*[\s\S]*?\*\//g.test(content)) score += 15
  if (content.length > 50) score += 10
  return Math.min(100, score)
}

/**
 * Determine readiness level based on metal and transformation count
 * @example
 * classifyReadiness('lead', 5) // 'reactive'
 */
export function classifyReadiness(metal: Metal, transformCount: number): TransmutationTarget['readiness'] {
  if (metal === 'gold' || metal === 'silver') return 'stable'
  if (transformCount >= 4) return 'reactive'
  if (transformCount >= 2) return 'prepared'
  return 'raw'
}

/**
 * Compute philosopher stone score — how close to perfect code
 * @example
 * computePhilosopherStoneScore(targets, elements) // 75
 */
export function computePhilosopherStoneScore(
  targets: TransmutationTarget[],
  elements: Element[],
): number {
  if (targets.length === 0) return 100
  const metalScores: Record<Metal, number> = {
    lead: 0, iron: 20, copper: 40, bronze: 60, silver: 80, gold: 100,
  }
  const avgMetal = targets.reduce((s, t) => s + metalScores[t.currentMetal], 0) / targets.length
  const avgEssence = targets.reduce((s, t) => s + t.essence, 0) / targets.length
  const elementBonus = elements.length > 0
    ? elements.reduce((s, e) => s + e.purity, 0) / elements.length
    : 50
  return Math.round((avgMetal * 0.5 + avgEssence * 0.3 + elementBonus * 0.2))
}

/**
 * Classify the alchemy grade
 * @example
 * classifyAlchemyGrade(90, 85) // 'grand-master'
 */
export function classifyAlchemyGrade(
  philosopherStone: number,
  transmutationPotential: number,
): AlchemyStats['alchemyGrade'] {
  const combined = (philosopherStone + transmutationPotential) / 2
  if (combined >= 80) return 'grand-master'
  if (combined >= 65) return 'master'
  if (combined >= 50) return 'adept'
  if (combined >= 30) return 'apprentice'
  return 'novice'
}

/**
 * Compute overall transmutation potential
 * @example
 * computeTransmutationPotential(targets) // 60
 */
export function computeTransmutationPotential(targets: TransmutationTarget[]): number {
  if (targets.length === 0) return 100
  return Math.round(targets.reduce((s, t) => s + t.transmutability, 0) / targets.length)
}

/**
 * Find the dominant metal across targets
 * @example
 * findDominantMetal(targets) // 'copper'
 */
export function findDominantMetal(targets: TransmutationTarget[]): string {
  if (targets.length === 0) return 'unknown'
  const counts = new Map<Metal, number>()
  for (const t of targets) {
    counts.set(t.currentMetal, (counts.get(t.currentMetal) || 0) + 1)
  }
  let dominant: Metal = 'lead'
  let max = 0
  for (const [metal, count] of counts) {
    if (count > max) { max = count; dominant = metal }
  }
  return dominant
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate recommendations for transmutation
 * @example
 * generateRecommendations(targets, catalysts, elements, stats)
 */
export function generateRecommendations(
  targets: TransmutationTarget[],
  catalysts: Catalyst[],
  _elements: Element[],
  stats: AlchemyStats,
): string[] {
  const recs: string[] = []

  if (stats.leadFiles > 0) {
    recs.push(`Transmute ${stats.leadFiles} lead file(s) — highest priority for quality improvement`)
  }

  const missing = catalysts.filter(c => !c.isAvailable)
  if (missing.length > 0) {
    recs.push(`Adopt ${missing.length} missing catalyst(s): ${missing.map(c => c.name).join(', ')}`)
  }

  if (stats.explosiveTransformations > 0) {
    recs.push(`Exercise caution with ${stats.explosiveTransformations} explosive transformation(s) — high risk`)
  }

  const highEssence = targets.filter(t => t.essence >= 50 && (t.currentMetal === 'lead' || t.currentMetal === 'iron'))
  if (highEssence.length > 0) {
    recs.push(`High ROI: ${highEssence.length} file(s) with high essence but low metal — prime transmutation candidates`)
  }

  if (stats.avgTransmutability >= 70) {
    recs.push('High transmutation potential — the codebase is receptive to improvement')
  }

  const elementRec = _elements.filter(e => !e.isNoble && e.count >= 3)
  if (elementRec.length > 0) {
    recs.push(`Stabilize ${elementRec.map(e => e.name).join(', ')} elements for better code structure`)
  }

  if (stats.alchemyGrade === 'novice' || stats.alchemyGrade === 'apprentice') {
    recs.push('Focus on elementary transformations first to build momentum')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete alchemy analysis result
 * @example
 * const result = buildAlchemyResult(['src/a.ts'], ['export function a() {}'], {})
 */
export function buildAlchemyResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): AlchemyResult {
  const targets: TransmutationTarget[] = files.map((file, i) => {
    const content = contents[i]
    const metal = classifyMetal(content ?? '', file)
    const transformations = identifyTransformations(content ?? '', file, metal)
    const transmutability = computeTransmutability(metal, transformations.length)
    const essence = computeEssence(content ?? '')
    const readiness = classifyReadiness(metal, transformations.length)
    return {
      file,
      currentMetal: metal,
      potentialMetal: nextMetalUp(metal),
      transmutability,
      transformations,
      readiness,
      essence,
    }
  })

  const catalysts = findCatalysts(files, contents)

  const elements: Element[] = contents.flatMap((c, i) => analyzeElements(c, files[i] ?? ''))

  const allTransformations = targets.flatMap(t => t.transformations)
  const transmutationPotential = computeTransmutationPotential(targets)
  const philosopherStone = computePhilosopherStoneScore(targets, elements)

  const stats: AlchemyStats = {
    totalTargets: targets.length,
    leadFiles: targets.filter(t => t.currentMetal === 'lead').length,
    goldFiles: targets.filter(t => t.currentMetal === 'gold').length,
    avgTransmutability: targets.length > 0
      ? Math.round(targets.reduce((s, t) => s + t.transmutability, 0) / targets.length * 10) / 10
      : 0,
    avgEssence: targets.length > 0
      ? Math.round(targets.reduce((s, t) => s + t.essence, 0) / targets.length * 10) / 10
      : 0,
    totalTransformations: allTransformations.length,
    elementaryTransformations: allTransformations.filter(t => t.difficulty === 'elementary').length,
    masterworkTransformations: allTransformations.filter(t => t.difficulty === 'masterwork').length,
    safeTransformations: allTransformations.filter(t => t.risk === 'safe').length,
    explosiveTransformations: allTransformations.filter(t => t.risk === 'explosive').length,
    availableCatalysts: catalysts.filter(c => c.isAvailable).length,
    missingCatalysts: catalysts.filter(c => !c.isAvailable).length,
    totalElements: elements.length,
    nobleElements: elements.filter(e => e.isNoble).length,
    overallTransmutationPotential: transmutationPotential,
    philosopherStoneScore: philosopherStone,
    dominantMetal: findDominantMetal(targets),
    alchemyGrade: classifyAlchemyGrade(philosopherStone, transmutationPotential),
  }

  const recommendations = generateRecommendations(targets, catalysts, elements, stats)

  return { targets, catalysts, elements, stats, recommendations }
}
