// ─── Types ─────────────────────────────────────────────────────────────────────

export type ThreadType = 'warp' | 'weft' | 'decorative' | 'loose' | 'broken'
export type SectionType = 'foundation' | 'border' | 'motif' | 'filler' | 'patch'

export interface Thread {
  from: string
  to: string
  type: ThreadType
  strength: number
  color: string
  thickness: number
}

export interface TapestrySection {
  name: string
  threads: Thread[]
  density: number
  pattern: string
  integrity: number
  type: SectionType
}

export interface WeavingPattern {
  name: string
  sections: string[]
  description: string
  quality: number
}

export interface TapestryStats {
  totalThreads: number
  warpCount: number
  weftCount: number
  looseCount: number
  brokenCount: number
  sectionCount: number
  avgDensity: number
  avgIntegrity: number
  dominantPattern: string
  overallIntegrity: number
  tapestryCompleteness: number
  loosestSection: string
  tightestSection: string
}

export interface TapestryResult {
  threads: Thread[]
  sections: TapestrySection[]
  patterns: WeavingPattern[]
  stats: TapestryStats
  recommendations: string[]
}

// ─── Thread Extraction ─────────────────────────────────────────────────────────

/**
 * Extract all import threads from files and contents.
 *
 * @example
 * extractThreads(['a.ts'], ["import { x } from './b.js'"])
 */
export function extractThreads(files: string[], contents: string[]): Thread[] {
  const threads: Thread[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] ?? ''

    const importMatches = content.matchAll(/^import\s+(?:(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))\s+from\s+['"](\.\.?\/[^'"]+)['"]/gm)
    for (const m of importMatches) {
      const importPath = m[1]
      const resolvedTo = resolveModule(importPath ?? '', files)
      const type = classifyThreadType(file ?? '', resolvedTo, files, content)
      const thickness = computeThreadThickness(content, importPath ?? '')
      const strength = computeThreadStrength(type, thickness)

      threads.push({
        from: file ?? '',
        to: resolvedTo ?? importPath ?? '',
        type,
        strength,
        color: threadColor(type),
        thickness,
      })
    }

    const reExports = content.matchAll(/^export\s+\{[^}]*\}\s+from\s+['"](\.\.?\/[^'"]+)['"]/gm)
    for (const m of reExports) {
      const importPath = m[1]
      const resolvedTo = resolveModule(importPath ?? '', files)
      const type = resolvedTo ? 'weft' : 'broken'
      const thickness = computeThreadThickness(content, importPath ?? '')

      threads.push({
        from: file ?? '',
        to: resolvedTo ?? importPath ?? '',
        type,
        strength: computeThreadStrength(type, thickness),
        color: threadColor(type),
        thickness,
      })
    }
  }

  return threads
}

function resolveModule(importPath: string, allFiles: string[]): string | null {
  const clean = importPath.replace(/\.(ts|tsx|js|jsx)$/, '')
  for (const f of allFiles) {
    const fClean = f.replace(/\.(ts|tsx|js|jsx)$/, '')
    if (fClean === clean || fClean.endsWith('/' + clean) || fClean === clean.replace(/^\.\//, '') ||
        fClean.endsWith(clean.replace(/^\.\.\//, '')) || fClean.endsWith(clean.replace(/^\.\//, '').split('/').pop() ?? '')) {
      return f
    }
  }
  return null
}

function threadColor(type: ThreadType): string {
  const colors: Record<ThreadType, string> = {
    warp: '#E74C3C',
    weft: '#3498DB',
    decorative: '#27AE60',
    loose: '#F39C12',
    broken: '#95A5A6',
  }
  return colors[type]
}

// ─── Thread Classification ─────────────────────────────────────────────────────

/**
 * Classify thread type based on source, target, and context.
 *
 * @example
 * classifyThreadType('src/commands/a.ts', 'src/core/b.ts', files, content)
 */
export function classifyThreadType(from: string, to: string | null, allFiles: string[], _content: string): ThreadType {
  if (to === null || !allFiles.includes(to)) return 'broken'

  const toInCore = to.includes('/core/') || to.includes('/lib/')
  const fromIsCommand = from.includes('/commands/')

  if (toInCore) return 'warp'

  const toIsUtil = to.includes('/utils') || to.includes('/helpers') || to.includes('/shared/')
  if (toIsUtil && !fromIsCommand) return 'weft'

  const toInSameDir = getDirectory(from) === getDirectory(to)
  if (toInSameDir) return 'weft'

  return 'decorative'
}

function getDirectory(file: string): string {
  const idx = file.lastIndexOf('/')
  return idx >= 0 ? file.substring(0, idx) : '.'
}

// ─── Thread Strength ───────────────────────────────────────────────────────────

/**
 * Compute thread strength 0-100.
 *
 * @example
 * computeThreadStrength('warp', 5)
 */
export function computeThreadStrength(type: ThreadType, thickness: number): number {
  const baseStrength: Record<ThreadType, number> = {
    warp: 80,
    weft: 60,
    decorative: 40,
    loose: 20,
    broken: 0,
  }

  const bonus = Math.min(20, thickness * 5)
  return Math.max(0, Math.min(100, baseStrength[type] + bonus))
}

// ─── Thread Thickness ──────────────────────────────────────────────────────────

/**
 * Compute thread thickness (number of items imported).
 *
 * @example
 * computeThreadThickness("import { a, b, c } from './mod'", './mod')
 */
export function computeThreadThickness(content: string, importPath: string): number {
  const escaped = importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = content.match(new RegExp(`import\\s+\\{([^}]+)\\}\\s+from\\s+['"]${escaped}['"]`))
  if (match) {
    return (match?.[1]?.split(',').filter((s) => s.trim().length > 0).length ?? 0)
  }

  const defaultMatch = content.match(new RegExp(`import\\s+(\\w+)\\s*,?\\s*(?:\\{([^}]*)\\})?\\s+from\\s+['"]${escaped}['"]`))
  if (defaultMatch) {
    let count = defaultMatch[1] ? 1 : 0
    if (defaultMatch[2]) count += defaultMatch[2].split(',').filter((s) => s.trim().length > 0).length
    return count
  }

  const starMatch = content.match(new RegExp(`import\\s+\\*\\s+as\\s+\\w+\\s+from\\s+['"]${escaped}['"]`))
  if (starMatch) return 10

  return 1
}

// ─── Section Grouping ──────────────────────────────────────────────────────────

/**
 * Group files into tapestry sections by directory.
 *
 * @example
 * groupIntoSections(['src/a.ts', 'src/b.ts', 'test/a.ts'])
 */
export function groupIntoSections(files: string[]): TapestrySection[] {
  const dirMap = new Map<string, string[]>()

  for (const file of files) {
    const dir = getDirectory(file)
    if (!dirMap.has(dir)) dirMap.set(dir, [])
    dirMap.get(dir)!.push(file)
  }

  const sections: TapestrySection[] = []
  for (const [name, sectionFiles] of dirMap) {
    sections.push({
      name,
      threads: [],
      density: 0,
      pattern: 'unknown',
      integrity: 50,
      type: classifySectionType(name, sectionFiles),
    })
  }

  return sections
}

// ─── Section Type ──────────────────────────────────────────────────────────────

/**
 * Classify section type from its path and files.
 *
 * @example
 * classifySectionType('src/core', ['file-discovery.ts'])
 */
export function classifySectionType(dir: string, files: string[]): SectionType {
  if (dir.includes('/core') || dir.includes('/lib') || dir === 'core' || dir === 'lib') return 'foundation'
  if (dir.includes('/commands') || dir.includes('/cli') || dir === 'commands' || dir === 'cli') return 'border'
  if (dir.includes('/test') || dir.includes('/tests') || dir.includes('__tests__') || dir === 'test' || dir === 'tests') return 'patch'
  if (dir.includes('/utils') || dir.includes('/helpers') || dir.includes('/shared') || dir === 'utils' || dir === 'helpers') return 'filler'
  if (files.length > 3) return 'motif'
  return 'filler'
}

// ─── Section Density ───────────────────────────────────────────────────────────

/**
 * Compute section density (connections per file).
 *
 * @example
 * computeSectionDensity(section, threads, files)
 */
export function computeSectionDensity(section: TapestrySection, threads: Thread[], files: string[]): number {
  const sectionFiles = new Set(files.filter((f) => getDirectory(f) === section.name))
  if (sectionFiles.size === 0) return 0

  const relevantThreads = threads.filter((t) => sectionFiles.has(t.from) || sectionFiles.has(t.to))
  return Math.round((relevantThreads.length / sectionFiles.size) * 10) / 10
}

// ─── Section Integrity ─────────────────────────────────────────────────────────

/**
 * Compute section integrity (how well-woven).
 *
 * @example
 * computeSectionIntegrity(threads, sectionFiles)
 */
export function computeSectionIntegrity(threads: Thread[], sectionFiles: string[]): number {
  if (sectionFiles.length === 0) return 0

  const relevantThreads = threads.filter((t) =>
    sectionFiles.includes(t.from) || sectionFiles.includes(t.to),
  )

  if (relevantThreads.length === 0) return 50

  const broken = relevantThreads.filter((t) => t.type === 'broken').length
  const loose = relevantThreads.filter((t) => t.type === 'loose').length
  const warp = relevantThreads.filter((t) => t.type === 'warp').length
  const weft = relevantThreads.filter((t) => t.type === 'weft').length

  const strongRatio = (warp + weft) / relevantThreads.length
  const weakPenalty = (broken * 20 + loose * 5) / relevantThreads.length

  return Math.max(0, Math.min(100, Math.round(strongRatio * 100 - weakPenalty)))
}

// ─── Weaving Patterns ──────────────────────────────────────────────────────────

/**
 * Detect weaving patterns (architectural motifs) in the tapestry.
 *
 * @example
 * detectWeavingPatterns(sections, threads)
 */
export function detectWeavingPatterns(sections: TapestrySection[], threads: Thread[]): WeavingPattern[] {
  const patterns: WeavingPattern[] = []

  const incomingCount = new Map<string, number>()
  const outgoingCount = new Map<string, number>()
  for (const t of threads) {
    incomingCount.set(t.to, (incomingCount.get(t.to) || 0) + 1)
    outgoingCount.set(t.from, (outgoingCount.get(t.from) || 0) + 1)
  }

  const maxIncoming = Math.max(...incomingCount.values(), 0)
  const hubFile = [...incomingCount.entries()].find(([, c]) => c === maxIncoming)?.[0]

  if (hubFile && maxIncoming > threads.length * 0.3 && maxIncoming >= 3) {
    patterns.push({
      name: 'hub-and-spoke',
      sections: [hubFile],
      description: `Central hub (${hubFile}) with ${maxIncoming} incoming connections`,
      quality: Math.min(100, 60 + maxIncoming * 3),
    })
  }

  const foundationSections = sections.filter((s) => s.type === 'foundation')
  const borderSections = sections.filter((s) => s.type === 'border')
  if (foundationSections.length > 0 && borderSections.length > 0) {
    const foundationThreads = threads.filter((t) =>
      foundationSections.some((s) => s.threads.includes(t)) ||
      foundationSections.some((s) => t.to.includes(s.name)),
    )
    if (foundationThreads.length > 0) {
      patterns.push({
        name: 'layered',
        sections: [...foundationSections.map((s) => s.name), ...borderSections.map((s) => s.name)],
        description: 'Clear layered architecture from border to foundation',
        quality: 75,
      })
    }
  }

  const sectionPairConnections = new Map<string, number>()
  for (const t of threads) {
    if (t.type !== 'broken') {
      const fromDir = getDirectory(t.from)
      const toDir = getDirectory(t.to)
      if (fromDir !== toDir) {
        const key = [fromDir, toDir].sort().join('<->')
        sectionPairConnections.set(key, (sectionPairConnections.get(key) || 0) + 1)
      }
    }
  }

  const crossSectionThreads = [...sectionPairConnections.values()].filter((v) => v > 2).length
  if (crossSectionThreads >= 3) {
    patterns.push({
      name: 'mesh',
      sections: [],
      description: `${crossSectionThreads} cross-section connections form a dense mesh`,
      quality: 50,
    })
  }

  const totalUniqueTargets = new Set(threads.map((t) => t.to)).size
  if (totalUniqueTargets <= sections.length * 0.5 && threads.length > 5) {
    patterns.push({
      name: 'star',
      sections: [],
      description: `Concentrated imports to ${totalUniqueTargets} targets`,
      quality: 65,
    })
  }

  if (patterns.length === 0) {
    patterns.push({
      name: 'simple',
      sections: sections.map((s) => s.name),
      description: 'Simple pattern with few interconnections',
      quality: 70,
    })
  }

  return patterns
}

// ─── Completeness ──────────────────────────────────────────────────────────────

/**
 * Compute tapestry completeness (how complete the picture).
 *
 * @example
 * computeTapestryCompleteness(sections, threads)
 */
export function computeTapestryCompleteness(sections: TapestrySection[], threads: Thread[]): number {
  if (sections.length === 0) return 0

  const brokenRatio = threads.length > 0
    ? threads.filter((t) => t.type === 'broken').length / threads.length
    : 0

  const connectedSections = new Set(threads.map((t) => getDirectory(t.from))).size
  const sectionCoverage = connectedSections / sections.length

  const avgIntegrity = sections.length > 0
    ? sections.reduce((s, sec) => s + sec.integrity, 0) / sections.length
    : 0

  return Math.max(0, Math.min(100, Math.round(
    sectionCoverage * 40 + avgIntegrity * 0.4 + (1 - brokenRatio) * 20,
  )))
}

// ─── Overall Integrity ─────────────────────────────────────────────────────────

/**
 * Compute overall integrity across all sections.
 *
 * @example
 * computeOverallIntegrity(sections)
 */
export function computeOverallIntegrity(sections: TapestrySection[]): number {
  if (sections.length === 0) return 0
  return Math.round(sections.reduce((s, sec) => s + sec.integrity, 0) / sections.length)
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate tapestry recommendations.
 *
 * @example
 * generateRecommendations(threads, sections, patterns, stats)
 */
export function generateRecommendations(threads: Thread[], sections: TapestrySection[], _patterns: WeavingPattern[], stats: TapestryStats): string[] {
  const recs: string[] = []

  const broken = threads.filter((t) => t.type === 'broken')
  if (broken.length > 0) {
    recs.push(`${broken.length} broken thread(s) — fix or remove: ${broken.slice(0, 3).map((t) => `${t.from} → ${t.to}`).join(', ')}`)
  }

  if (stats.looseCount > 3) {
    recs.push(`${stats.looseCount} loose thread(s) detected — clean up unused imports`)
  }

  const lowIntegrity = sections.filter((s) => s.integrity < 40)
  if (lowIntegrity.length > 0) {
    recs.push(`${lowIntegrity.length} section(s) with low integrity — strengthen: ${lowIntegrity.map((s) => s.name).join(', ')}`)
  }

  if (stats.overallIntegrity > 75) {
    recs.push('The tapestry is well-woven with strong interconnections')
  } else if (stats.overallIntegrity < 40) {
    recs.push('Overall integrity is low — focus on fixing broken threads and reducing loose connections')
  }

  if (stats.tapestryCompleteness < 50) {
    recs.push('Tapestry completeness is low — many sections lack proper connections')
  }

  if (recs.length === 0) {
    recs.push('The tapestry shows a well-connected codebase with good structural integrity')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete tapestry result.
 *
 * @example
 * buildTapestryResult(['a.ts'], ['code'], {})
 */
export function buildTapestryResult(files: string[], contents: string[], _options: Record<string, unknown>): TapestryResult {
  if (files.length === 0) {
    const emptyStats: TapestryStats = {
      totalThreads: 0, warpCount: 0, weftCount: 0, looseCount: 0, brokenCount: 0,
      sectionCount: 0, avgDensity: 0, avgIntegrity: 0, dominantPattern: 'none',
      overallIntegrity: 0, tapestryCompleteness: 0, loosestSection: 'none', tightestSection: 'none',
    }
    return { threads: [], sections: [], patterns: [], stats: emptyStats, recommendations: ['No files to analyze'] }
  }

  const threads = extractThreads(files, contents)
  const rawSections = groupIntoSections(files)

  const sectionFileMap = new Map<string, string[]>()
  for (const file of files) {
    const dir = getDirectory(file)
    if (!sectionFileMap.has(dir)) sectionFileMap.set(dir, [])
    sectionFileMap.get(dir)!.push(file)
  }

  const sections: TapestrySection[] = rawSections.map((sec) => {
    const secFiles = sectionFileMap.get(sec.name) ?? []
    const density = computeSectionDensity(sec, threads, files)
    const integrity = computeSectionIntegrity(threads, secFiles)

    const sectionThreads = threads.filter((t) =>
      secFiles.includes(t.from) || secFiles.includes(t.to),
    )

    return {
      ...sec,
      threads: sectionThreads,
      density,
      integrity,
      pattern: sec.type === 'foundation' ? 'structural' : sec.type === 'border' ? 'entry' : 'interconnected',
    }
  })

  const patterns = detectWeavingPatterns(sections, threads)

  const warpCount = threads.filter((t) => t.type === 'warp').length
  const weftCount = threads.filter((t) => t.type === 'weft').length
  const looseCount = threads.filter((t) => t.type === 'loose').length
  const brokenCount = threads.filter((t) => t.type === 'broken').length

  const avgDensity = sections.length > 0
    ? Math.round(sections.reduce((s, sec) => s + sec.density, 0) / sections.length * 10) / 10
    : 0

  const overallIntegrity = computeOverallIntegrity(sections)
  const tapestryCompleteness = computeTapestryCompleteness(sections, threads)

  const sortedByIntegrity = [...sections].sort((a, b) => a.integrity - b.integrity)
  const loosestSection = sortedByIntegrity[0]?.name ?? 'none'
  const tightestSection = sortedByIntegrity[sortedByIntegrity.length - 1]?.name ?? 'none'

  const dominantPattern = patterns.length > 0
    ? patterns.sort((a, b) => b.quality - a.quality)[0]?.name
    : 'none'

  const stats: TapestryStats = {
    totalThreads: threads.length,
    warpCount,
    weftCount,
    looseCount,
    brokenCount,
    sectionCount: sections.length,
    avgDensity,
    avgIntegrity: overallIntegrity,
    dominantPattern: dominantPattern ?? '',
    overallIntegrity,
    tapestryCompleteness,
    loosestSection,
    tightestSection,
  }

  const recommendations = generateRecommendations(threads, sections, patterns, stats)

  return { threads, sections, patterns, stats, recommendations }
}
