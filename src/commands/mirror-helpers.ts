// ─── Types ─────────────────────────────────────────────────────────────────────

export type DistortionType = 'overengineered' | 'underdocumented' | 'misnamed' | 'overpromised' | 'hidden-complexity'

export type DistortionSeverity = 'low' | 'medium' | 'high'

export type DistortionLevel = 'none' | 'minor' | 'moderate' | 'severe' | 'extreme'

export interface Intention {
  file: string
  stated: string[]
  actual: string[]
  alignment: number
}

export interface Reflection {
  file: string
  selfImage: string
  reality: string
  gap: string
  distortionLevel: DistortionLevel
}

export interface Distortion {
  file: string
  type: DistortionType
  severity: DistortionSeverity
  description: string
  evidence: string
  correction: string
}

export interface MirrorStats {
  totalReflections: number
  alignedCount: number
  distortedCount: number
  avgAlignment: number
  mostAlignedFile: string
  mostDistortedFile: string
  overengineeredCount: number
  underdocumentedCount: number
  misnamedCount: number
  overpromisedCount: number
  hiddenComplexityCount: number
  overallClarity: number
}

export interface MirrorResult {
  reflections: Reflection[]
  intentions: Intention[]
  distortions: Distortion[]
  stats: MirrorStats
  recommendations: string[]
}

// ─── Stated Intention Extraction ───────────────────────────────────────────────

/**
 * Extract stated intentions from comments and JSDoc.
 *
 * @example
 * extractStatedIntentions('/** Adds two numbers *\/')
 */
export function extractStatedIntentions(content: string): string[] {
  const intentions: string[] = []

  const jsdocBlocks = content.match(/\/\*\*[\s\S]*?\*\//g) || []
  for (const block of jsdocBlocks) {
    const lines = block
      .replace(/\/\*\*|\*\//g, '')
      .split('\n')
      .map((l) => l.replace(/^\s*\*\s?/, '').trim())
      .filter((l) => l.length > 0 && !l.startsWith('@'))
    intentions.push(...lines)
  }

  const lineComments = content.match(/\/\/\s*.+/g) || []
  for (const comment of lineComments) {
    const text = comment.replace(/^\/\/\s*/, '').trim()
    if (text.length > 5 && !text.startsWith('───') && !text.startsWith('import')) {
      intentions.push(text)
    }
  }

  return intentions
}

// ─── Actual Behavior Extraction ────────────────────────────────────────────────

/**
 * Extract actual behavior from code.
 *
 * @example
 * extractActualBehavior('function add(a, b) { return a + b }')
 */
export function extractActualBehavior(content: string): string[] {
  const behaviors: string[] = []

  const funcMatches = content.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g) || []
  for (const m of funcMatches) {
    const name = m.replace(/(?:export\s+)?(?:async\s+)?function\s+/, '')
    behaviors.push(`function:${name}`)
  }

  const constFuncMatches = content.match(/(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>/g) || []
  for (const m of constFuncMatches) {
    const nameMatch = m.match(/const\s+(\w+)/)
    if (nameMatch) behaviors.push(`arrow:${nameMatch[1]}`)
  }

  const classMatches = content.match(/(?:export\s+)?(?:default\s+)?class\s+(\w+)/g) || []
  for (const m of classMatches) {
    const name = m.replace(/(?:export\s+)?(?:default\s+)?class\s+/, '')
    behaviors.push(`class:${name}`)
  }

  const exportMatches = content.match(/export\s+(?:const|let|var|type|interface|enum)\s+(\w+)/g) || []
  for (const m of exportMatches) {
    const nameMatch = m.match(/export\s+(?:const|let|var|type|interface|enum)\s+(\w+)/)
    if (nameMatch) behaviors.push(`export:${nameMatch[1]}`)
  }

  return behaviors
}

// ─── Alignment Computation ─────────────────────────────────────────────────────

/**
 * Compute alignment between stated intentions and actual behavior.
 *
 * @example
 * computeAlignment(['Adds numbers'], ['function:add'])
 */
export function computeAlignment(stated: string[], actual: string[]): number {
  if (stated.length === 0 && actual.length === 0) return 100
  if (stated.length === 0) return 20
  if (actual.length === 0) return 10

  const statedWords = new Set(
    stated
      .join(' ')
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2),
  )

  let matchCount = 0
  for (const act of actual) {
    const actParts = act.toLowerCase().split(/[:\-_]/)
    for (const word of statedWords) {
      const found = actParts.some((part) => part.startsWith(word.slice(0, -1)) || word.startsWith(part) || part === word)
      if (found || act.toLowerCase().includes(word)) {
        matchCount++
        break
      }
    }
  }

  const coverage = matchCount / actual.length
  const docRatio = Math.min(1, stated.length / Math.max(1, actual.length))

  return Math.round(coverage * 60 + docRatio * 40)
}

// ─── Self-Image & Reality ──────────────────────────────────────────────────────

/**
 * Generate self-image description from code.
 *
 * @example
 * generateSelfImage('content', ['fn'], ['docs'])
 */
export function generateSelfImage(
  content: string,
  exports: string[],
  documentation: string[],
): string {
  const parts: string[] = []

  if (documentation.length > 0) {
    parts.push(`Well-documented (${documentation.length} doc comments)`)
  } else {
    parts.push('Undocumented')
  }

  if (exports.length > 10) {
    parts.push(`Rich API (${exports.length} exports)`)
  } else if (exports.length > 3) {
    parts.push(`Moderate API (${exports.length} exports)`)
  } else if (exports.length > 0) {
    parts.push(`Minimal API (${exports.length} exports)`)
  }

  const asyncCount = (content.match(/async\s+/g) || []).length
  if (asyncCount > 3) {
    parts.push('Async-heavy')
  }

  return parts.join(', ') || 'Empty file'
}

/**
 * Generate reality description from code.
 *
 * @example
 * generateReality('code', 50, 3)
 */
export function generateReality(
  content: string,
  complexity: number,
  dependencies: number,
): string {
  const parts: string[] = []

  const lines = content.split('\n').length
  parts.push(`${lines} lines`)

  if (complexity > 50) {
    parts.push('high complexity')
  } else if (complexity > 25) {
    parts.push('moderate complexity')
  } else {
    parts.push('low complexity')
  }

  if (dependencies > 10) {
    parts.push('heavily connected')
  } else if (dependencies > 3) {
    parts.push('moderately connected')
  }

  const todoCount = (content.match(/TODO|FIXME|HACK|XXX/g) || []).length
  if (todoCount > 0) {
    parts.push(`${todoCount} unresolved TODOs`)
  }

  return parts.join(', ')
}

/**
 * Compute the gap between self-image and reality.
 *
 * @example
 * computeGap('Simple', 'Complex with TODOs')
 */
export function computeGap(selfImage: string, reality: string): string {
  if (selfImage === reality) return 'No gap — self-image matches reality'

  const selfLower = selfImage.toLowerCase()
  const realityLower = reality.toLowerCase()

  if (selfLower.includes('well-documented') && realityLower.includes('todo')) {
    return 'Claims documentation but has unresolved issues'
  }

  if (selfLower.includes('minimal') && realityLower.includes('high complexity')) {
    return 'Presents as simple but is actually complex'
  }

  if (selfLower.includes('undocumented') && realityLower.includes('high complexity')) {
    return 'Complex code with no documentation — needs docs urgently'
  }

  if (selfLower.includes('rich') && realityLower.includes('low complexity')) {
    return 'Large API surface with simple internals'
  }

  return 'Minor discrepancies between stated and actual behavior'
}

// ─── Distortion Level ──────────────────────────────────────────────────────────

/**
 * Classify distortion level from alignment score.
 *
 * @example
 * classifyDistortionLevel(90)
 */
export function classifyDistortionLevel(alignment: number): DistortionLevel {
  if (alignment >= 90) return 'none'
  if (alignment >= 70) return 'minor'
  if (alignment >= 50) return 'moderate'
  if (alignment >= 30) return 'severe'
  return 'extreme'
}

// ─── Complexity Helper ─────────────────────────────────────────────────────────

/**
 * Compute cyclomatic complexity from content.
 *
 * @example
 * computeComplexity('if (x) { for (let i = 0; i < n; i++) {} }')
 */
export function computeComplexity(content: string): number {
  const branches = (content.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcase\b|\bcatch\b|\?\s*[^:]*:/g) || []).length
  const lines = content.split('\n').filter((l) => l.trim().length > 0).length
  if (lines === 0) return 0
  return Math.min(100, Math.round((branches / lines) * 100))
}

// ─── Distortion Detection ──────────────────────────────────────────────────────

/**
 * Detect overengineered code.
 *
 * @example
 * detectOverengineered('code', ['simple task'])
 */
export function detectOverengineered(content: string, statedIntentions: string[]): Distortion | null {
  const complexity = computeComplexity(content)
  const hasSimpleIntent = statedIntentions.some(
    (i) =>
      i.toLowerCase().includes('simple') ||
      i.toLowerCase().includes('basic') ||
      i.toLowerCase().includes('utility') ||
      i.toLowerCase().includes('helper'),
  )

  if (complexity > 50 && (hasSimpleIntent || statedIntentions.length <= 1)) {
    return {
      file: '',
      type: 'overengineered',
      severity: complexity > 75 ? 'high' : complexity >= 55 ? 'medium' : 'low',
      description: 'Code is more complex than its stated purpose suggests',
      evidence: `Complexity ${complexity}% with ${statedIntentions.length} stated intentions`,
      correction: 'Simplify the implementation or better document the complexity',
    }
  }

  return null
}

/**
 * Detect underdocumented code.
 *
 * @example
 * detectUnderdocumented('code', ['fn1', 'fn2'])
 */
export function detectUnderdocumented(content: string, exports: string[]): Distortion | null {
  if (exports.length === 0) return null

  const jsdocBlocks = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  const docRatio = jsdocBlocks / exports.length

  if (docRatio < 0.5) {
    return {
      file: '',
      type: 'underdocumented',
      severity: docRatio === 0 ? 'high' : docRatio < 0.25 ? 'medium' : 'low',
      description: `${exports.length} exports with only ${jsdocBlocks} documented`,
      evidence: `Documentation ratio: ${Math.round(docRatio * 100)}%`,
      correction: 'Add JSDoc comments to all exported functions and classes',
    }
  }

  return null
}

/**
 * Detect misnamed code.
 *
 * @example
 * detectMisnamed('function getData() { return postData }')
 */
export function detectMisnamed(content: string): Distortion | null {
  const funcMatches = content.matchAll(/(?:function\s+(\w+)|(?:const|let)\s+(\w+)\s*=)/g)
  for (const match of funcMatches) {
    const name = match[1] || match[2]
    if (!name) continue

    const lowerName = name.toLowerCase()

    const getterNames = ['get', 'fetch', 'read', 'load', 'find']
    const isGetter = getterNames.some((g) => lowerName.startsWith(g))

    if (isGetter) {
      const funcBody = content.slice(match.index ?? 0)
      const bodySnippet = funcBody.slice(0, 300)
      const writeWords = ['post', 'write', 'create', 'delete', 'update', 'remove', 'insert', 'push', 'mutate', 'destroy', 'erase']
      const afterParen = bodySnippet.indexOf('{')
      if (afterParen >= 0) {
        const body = bodySnippet.slice(afterParen)
        const hasWrite = writeWords.some((w) => new RegExp('\\b' + w + '\\w*\\s*\\(').test(body))
        if (hasWrite) {
          return {
            file: '',
            type: 'misnamed',
            severity: 'high',
            description: `"${name}" suggests read-only but modifies data`,
            evidence: `Name "${name}" but contains write operations`,
            correction: `Rename "${name}" to reflect its actual behavior`,
          }
        }
      }
    }

    const setterNames = ['set', 'write', 'create', 'update', 'post']
    const isSetter = setterNames.some((s) => lowerName.startsWith(s))

    if (isSetter) {
      const funcBody = content.slice(match.index ?? 0)
      const bodySnippet = funcBody.slice(0, 200)
      if (bodySnippet.includes('return ') && !bodySnippet.includes('return await')) {
        const returnMatches = bodySnippet.match(/return\s/g) || []
        if (returnMatches.length > 0 && !bodySnippet.includes('post(') && !bodySnippet.includes('write(')) {
          // Setter that primarily returns — could be misnamed
        }
      }
    }
  }

  return null
}

/**
 * Detect overpromised code (TODOs/FIXMEs).
 *
 * @example
 * detectOverpromised('TODO: implement this')
 */
export function detectOverpromised(content: string): Distortion | null {
  const todos = content.match(/(?:TODO|FIXME|HACK|XXX)\s*[:)]?\s*(.+)/g) || []
  if (todos.length === 0) return null

  return {
    file: '',
    type: 'overpromised',
    severity: todos.length > 5 ? 'high' : todos.length > 2 ? 'medium' : 'low',
    description: `${todos.length} unfinished promise(s) found`,
    evidence: todos.slice(0, 3).map((t) => t.trim()).join('; '),
    correction: 'Complete or remove the unfinished promises',
  }
}

/**
 * Detect hidden complexity.
 *
 * @example
 * detectHiddenComplexity('function check(x) { if (a) { if (b) { if (c) {} } } }')
 */
export function detectHiddenComplexity(content: string): Distortion | null {
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\(/.test(line ?? '')) {
      const funcStart = i
      let depth = 0
      let funcLines = 0
      let branches = 0
      let j = funcStart
      for (; j < lines.length && j < funcStart + 20; j++) {
        const l = lines[j]
        funcLines++
        depth += (l?.match(/\{/g) || []).length
        depth -= (l?.match(/\}/g) || []).length
        branches += (l?.match(/\bif\b|\belse\b|\bswitch\b|\bcase\b|\?\s*[^:]*:/g) || []).length
        if (depth <= 0 && funcLines > 1) break
      }

      if (funcLines <= 10 && branches >= 4) {
        return {
          file: '',
          type: 'hidden-complexity',
          severity: branches > 6 ? 'high' : 'medium',
          description: 'Short function with many hidden branches',
          evidence: `${funcLines}-line function with ${branches} branches`,
          correction: 'Document the edge cases or refactor into smaller functions',
        }
      }
    }
  }

  return null
}

// ─── Overall Clarity ───────────────────────────────────────────────────────────

/**
 * Compute overall clarity score.
 *
 * @example
 * computeOverallClarity(intentions)
 */
export function computeOverallClarity(intentions: Intention[]): number {
  if (intentions.length === 0) return 0
  const total = intentions.reduce((sum, i) => sum + i.alignment, 0)
  return Math.round(total / intentions.length)
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate mirror recommendations.
 *
 * @example
 * generateMirrorRecommendations(reflections, distortions, stats)
 */
export function generateMirrorRecommendations(
  reflections: Reflection[],
  _distortions: Distortion[],
  stats: MirrorStats,
): string[] {
  const recs: string[] = []

  if (stats.overengineeredCount > 0) {
    recs.push(`${stats.overengineeredCount} overengineered file(s) — simplify or better document the complexity`)
  }

  if (stats.underdocumentedCount > 0) {
    recs.push(`${stats.underdocumentedCount} underdocumented file(s) — add JSDoc to exported functions`)
  }

  if (stats.misnamedCount > 0) {
    recs.push(`${stats.misnamedCount} misnamed file(s) — rename to match actual behavior`)
  }

  if (stats.overpromisedCount > 0) {
    recs.push(`${stats.overpromisedCount} overpromised file(s) — complete or remove TODO/FIXME items`)
  }

  if (stats.hiddenComplexityCount > 0) {
    recs.push(`${stats.hiddenComplexityCount} file(s) with hidden complexity — document edge cases`)
  }

  const extremeReflections = reflections.filter((r) => r.distortionLevel === 'extreme')
  if (extremeReflections.length > 0) {
    recs.push(`${extremeReflections.length} file(s) with extreme distortion need immediate attention: ${extremeReflections.slice(0, 3).map((r) => r.file).join(', ')}`)
  }

  if (stats.mostDistortedFile !== 'none' && stats.avgAlignment < 90) {
    recs.push(`Most distorted: ${stats.mostDistortedFile} — review alignment between docs and code`)
  }

  if (stats.overallClarity >= 80) {
    recs.push(`Overall clarity is ${stats.overallClarity}% — codebase reflects its intentions well`)
  }

  if (recs.length === 0) {
    recs.push('The codebase presents an accurate reflection — intentions match reality')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete mirror result.
 *
 * @example
 * buildMirrorResult(['a.ts'], ['code'], {})
 */
export function buildMirrorResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): MirrorResult {
  if (files.length === 0) {
    const emptyStats: MirrorStats = {
      totalReflections: 0, alignedCount: 0, distortedCount: 0, avgAlignment: 0,
      mostAlignedFile: 'none', mostDistortedFile: 'none',
      overengineeredCount: 0, underdocumentedCount: 0, misnamedCount: 0,
      overpromisedCount: 0, hiddenComplexityCount: 0, overallClarity: 0,
    }
    return { reflections: [], intentions: [], distortions: [], stats: emptyStats, recommendations: ['No files to analyze'] }
  }

  const intentions: Intention[] = []
  const reflections: Reflection[] = []
  const allDistortions: Distortion[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''

    const stated = extractStatedIntentions(content)
    const actual = extractActualBehavior(content)
    const alignment = computeAlignment(stated, actual)

    intentions.push({ file, stated, actual, alignment })

    const exports = actual.filter((a) => a.startsWith('export:') || a.startsWith('function:') || a.startsWith('class:'))
    const docs = (content.match(/\/\*\*[\s\S]*?\*\//g) || [])
    const imports = (content.match(/import\s+.*?\s+from/g) || []).length
    const complexity = computeComplexity(content)

    const selfImage = generateSelfImage(content, exports, docs)
    const reality = generateReality(content, complexity, imports)
    const gap = computeGap(selfImage, reality)
    const distortionLevel = classifyDistortionLevel(alignment)

    reflections.push({ file, selfImage, reality, gap, distortionLevel })

    const distortions: Distortion[] = []

    const overengineered = detectOverengineered(content, stated)
    if (overengineered) { overengineered.file = file; distortions.push(overengineered) }

    const underdocumented = detectUnderdocumented(content, exports)
    if (underdocumented) { underdocumented.file = file; distortions.push(underdocumented) }

    const misnamed = detectMisnamed(content)
    if (misnamed) { misnamed.file = file; distortions.push(misnamed) }

    const overpromised = detectOverpromised(content)
    if (overpromised) { overpromised.file = file; distortions.push(overpromised) }

    const hiddenComplexity = detectHiddenComplexity(content)
    if (hiddenComplexity) { hiddenComplexity.file = file; distortions.push(hiddenComplexity) }

    allDistortions.push(...distortions)
  }

  const alignedCount = reflections.filter((r) => r.distortionLevel === 'none' || r.distortionLevel === 'minor').length
  const distortedCount = reflections.filter((r) => r.distortionLevel === 'severe' || r.distortionLevel === 'extreme').length
  const avgAlignment = Math.round(intentions.reduce((s, i) => s + i.alignment, 0) / intentions.length)

  const sortedByAlignment = [...intentions].sort((a, b) => b.alignment - a.alignment)
  const mostAlignedFile = sortedByAlignment[0]?.file ?? 'none'
  const mostDistortedFile = sortedByAlignment[sortedByAlignment.length - 1]?.file ?? 'none'

  const overengineeredCount = allDistortions.filter((d) => d.type === 'overengineered').length
  const underdocumentedCount = allDistortions.filter((d) => d.type === 'underdocumented').length
  const misnamedCount = allDistortions.filter((d) => d.type === 'misnamed').length
  const overpromisedCount = allDistortions.filter((d) => d.type === 'overpromised').length
  const hiddenComplexityCount = allDistortions.filter((d) => d.type === 'hidden-complexity').length

  const overallClarity = computeOverallClarity(intentions)

  const stats: MirrorStats = {
    totalReflections: reflections.length,
    alignedCount,
    distortedCount,
    avgAlignment,
    mostAlignedFile,
    mostDistortedFile,
    overengineeredCount,
    underdocumentedCount,
    misnamedCount,
    overpromisedCount,
    hiddenComplexityCount,
    overallClarity,
  }

  const recommendations = generateMirrorRecommendations(reflections, allDistortions, stats)

  return { reflections, intentions, distortions: allDistortions, stats, recommendations }
}
