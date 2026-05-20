// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Stratum {
  layer: number
  hash: string
  date: string
  message: string
  filesChanged: number
  insertions: number
  deletions: number
  era: string
  type: 'settlement' | 'expansion' | 'renovation' | 'destruction' | 'migration'
}

export interface Artifact {
  file: string
  type: 'relic' | 'fossil' | 'treasure' | 'potsherd'
  age: number
  description: string
  significance: 'low' | 'medium' | 'high'
  era: string
}

export interface FaultLine {
  commitHash: string
  date: string
  description: string
  severity: 'minor' | 'major' | 'catastrophic'
  filesAffected: number
  linesChanged: number
  type: 'refactor' | 'rewrite' | 'migration' | 'deletion'
}

export interface Era {
  name: string
  startHash: string
  endHash: string
  startDate: string
  endDate: string
  commits: number
  characteristics: string[]
  dominantType: string
}

export interface ArchaeologistStats {
  totalLayers: number
  totalArtifacts: number
  faultLineCount: number
  eraCount: number
  oldestLayer: string
  deepestDig: number
  artifactDensity: number
  averageLayerThickness: number
  seismicActivity: number
}

export interface ArchaeologistResult {
  strata: Stratum[]
  artifacts: Artifact[]
  faultLines: FaultLine[]
  eras: Era[]
  stats: ArchaeologistStats
  recommendations: string[]
}

// ─── Stratum Classification ───────────────────────────────────────────────────

/**
 * Classify a stratum type from commit message and changes.
 *
 * @example
 * classifyStratumType('feat: add new command', 5, 10)
 */
export function classifyStratumType(message: string, insertions: number, deletions: number): Stratum['type'] {
  const lower = message.toLowerCase()
  if (/remove|delete|breaking|drop/i.test(lower)) return 'destruction'
  if (/migrate|move|rename|transfer/i.test(lower)) return 'migration'
  if (/refactor|cleanup|clean up|restructure|reorg|simplif/i.test(lower)) return 'renovation'
  if (/expand|enhance|improve|extend|optimi|update|bump|upgrad/i.test(lower)) return 'expansion'
  if (/feat|add|new|create|init|implement|introduc/i.test(lower)) return 'settlement'
  if (deletions > insertions * 2) return 'destruction'
  if (insertions > deletions * 2) return 'settlement'
  return 'expansion'
}

// ─── Artifact Discovery ────────────────────────────────────────────────────────

/**
 * Count effective lines of code.
 *
 * @example
 * countEffectiveLines('const x = 1\n// comment\n')
 */
export function countEffectiveLines(content: string): number {
  let count = 0
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*')) {
      count++
    }
  }
  return count
}

/**
 * Compute cyclomatic complexity.
 *
 * @example
 * computeComplexity('if (x) { for (let i = 0; i < 10; i++) {} }')
 */
export function computeComplexity(content: string): number {
  const patterns = [/\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcatch\b/g, /&&/g, /\|\|/g]
  let total = 1
  for (const pat of patterns) {
    const m = content.match(pat)
    if (m) total += m.length
  }
  return total
}

/**
 * Count exports.
 *
 * @example
 * countExports('export function foo() {}')
 */
export function countExports(content: string): number {
  const m = content.match(/^export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+/gm)
  return m ? m.length : 0
}

/**
 * Count imports.
 *
 * @example
 * countImports("import { x } from 'y'")
 */
export function countImports(content: string): number {
  const m = content.match(/^import\s+/gm)
  return m ? m.length : 0
}

/**
 * Check if code has tests.
 *
 * @example
 * hasTestPatterns("describe('x', () => { it('works', () => {}) })")
 */
export function hasTestPatterns(content: string): boolean {
  return /\bit\s*\(|\btest\s*\(/g.test(content)
}

/**
 * Check for TODO/FIXME markers.
 *
 * @example
 * countTodoMarkers('// TODO: fix this')
 */
export function countTodoMarkers(content: string): number {
  const m = content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)[\s:]/gi)
  return m ? m.length : 0
}

/**
 * Detect commented-out code blocks.
 *
 * @example
 * hasCommentedOutCode('// const x = foo()\n// console.log(x)')
 */
export function hasCommentedOutCode(content: string): boolean {
  const lines = content.split('\n')
  let consecutive = 0
  for (const line of lines) {
    if (/^\s*\/\/\s*(const|let|var|function|class|import|export|return|if|for|while)/.test(line)) {
      consecutive++
      if (consecutive >= 3) return true
    } else {
      consecutive = 0
    }
  }
  return false
}

/**
 * Check for dead exports (exports never imported elsewhere).
 *
 * @example
 * findDeadExports('export function foo() {}', [])
 */
export function findDeadExports(content: string, allOtherContents: string[]): string[] {
  const exports: string[] = []
  const m = content.match(/^export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/gm)
  if (!m) return []
  for (const exp of m) {
    const nameMatch = exp.match(/(\w+)$/)
    if (nameMatch) exports.push(nameMatch[1]!)
  }

  const dead: string[] = []
  for (const name of exports) {
    let found = false
    for (const other of allOtherContents) {
      if (other.includes(name)) {
        found = true
        break
      }
    }
    if (!found) dead.push(name)
  }
  return dead
}

/**
 * Discover artifacts from file content.
 *
 * @example
 * discoverArtifacts('app.ts', content, [], 100)
 */
export function discoverArtifacts(file: string, content: string, allOtherContents: string[], ageInDays: number): Artifact[] {
  const artifacts: Artifact[] = []
  const lines = countEffectiveLines(content)
  const complexity = computeComplexity(content)
  const exports = countExports(content)
  const todoCount = countTodoMarkers(content)
  const commentedOut = hasCommentedOutCode(content)

  if (commentedOut) {
    artifacts.push({
      file, type: 'potsherd', age: ageInDays,
      description: 'Commented-out code blocks found — remnants of abandoned patterns',
      significance: 'medium', era: 'unknown',
    })
  }

  if (todoCount > 3) {
    artifacts.push({
      file, type: 'potsherd', age: ageInDays,
      description: `${todoCount} TODO/FIXME markers — unfinished intentions`,
      significance: 'low', era: 'unknown',
    })
  }

  const deadExports = findDeadExports(content, allOtherContents)
  if (deadExports.length > 0) {
    artifacts.push({
      file, type: 'fossil', age: ageInDays,
      description: `Dead exports: ${deadExports.join(', ')} — no consumers found`,
      significance: deadExports.length > 2 ? 'high' : 'medium', era: 'unknown',
    })
  }

  if (lines > 20 && complexity < 5 && exports > 0 && todoCount === 0 && !commentedOut) {
    const hasJSDoc = /\/\*\*[\s\S]*?\*\//g.test(content)
    if (hasJSDoc) {
      artifacts.push({
        file, type: 'treasure', age: ageInDays,
        description: `Well-crafted code: low complexity (${complexity}), documented, ${exports} clean exports`,
        significance: 'high', era: 'unknown',
      })
    }
  }

  if (ageInDays > 180 && lines > 10 && todoCount === 0 && !commentedOut) {
    artifacts.push({
      file, type: 'relic', age: ageInDays,
      description: `Stable code unchanged for ${ageInDays} days — proven reliability`,
      significance: ageInDays > 365 ? 'high' : 'medium', era: 'unknown',
    })
  }

  if (artifacts.length === 0 && lines > 50 && complexity > 20) {
    artifacts.push({
      file, type: 'potsherd', age: ageInDays,
      description: `High complexity (${complexity}) with ${lines} lines — may need excavation`,
      significance: 'low', era: 'unknown',
    })
  }

  return artifacts
}

// ─── Fault Line Detection ─────────────────────────────────────────────────────

/**
 * Detect fault lines from strata.
 *
 * @example
 * detectFaultLines(strata)
 */
export function detectFaultLines(strata: Stratum[]): FaultLine[] {
  const faults: FaultLine[] = []

  for (const s of strata) {
    const totalLines = s.insertions + s.deletions
    const lower = s.message.toLowerCase()

    if (s.type === 'destruction' && s.filesChanged > 5) {
      faults.push({
        commitHash: s.hash, date: s.date,
        description: s.message, severity: 'catastrophic',
        filesAffected: s.filesChanged, linesChanged: totalLines,
        type: 'deletion',
      })
      continue
    }

    if (/rewrite/i.test(lower) && totalLines > 100) {
      faults.push({
        commitHash: s.hash, date: s.date,
        description: s.message, severity: totalLines > 500 ? 'catastrophic' : 'major',
        filesAffected: s.filesChanged, linesChanged: totalLines,
        type: 'rewrite',
      })
      continue
    }

    if (/refactor/i.test(lower) && totalLines > 200) {
      faults.push({
        commitHash: s.hash, date: s.date,
        description: s.message,
        severity: totalLines > 500 ? 'major' : 'minor',
        filesAffected: s.filesChanged, linesChanged: totalLines,
        type: 'refactor',
      })
      continue
    }

    if (/migrate|migration/i.test(lower) && totalLines > 100) {
      faults.push({
        commitHash: s.hash, date: s.date,
        description: s.message, severity: 'major',
        filesAffected: s.filesChanged, linesChanged: totalLines,
        type: 'migration',
      })
      continue
    }

    if (totalLines > 300) {
      faults.push({
        commitHash: s.hash, date: s.date,
        description: s.message, severity: totalLines > 600 ? 'major' : 'minor',
        filesAffected: s.filesChanged, linesChanged: totalLines,
        type: 'refactor',
      })
    }
  }

  return faults
}

// ─── Era Identification ────────────────────────────────────────────────────────

/**
 * Generate an era name from characteristics.
 *
 * @example
 * generateEraName('settlement', 0, 10)
 */
export function generateEraName(dominantType: Stratum['type'], startIndex: number, count: number): string {
  const names: Record<Stratum['type'], string[]> = {
    settlement: ['Initial Settlement', 'Founding Era', 'Pioneer Phase', 'New Beginnings'],
    expansion: ['Great Expansion', 'Growth Period', 'Age of Enhancement', 'Building Boom'],
    renovation: ['Age of Refactoring', 'Restoration Period', 'Renovation Era', 'Cleanup Phase'],
    destruction: ['Great Purge', 'Destruction Layer', 'Demolition Period', 'Decline Phase'],
    migration: ['Great Migration', 'Exodus Period', 'Relocation Era', 'Diaspora Phase'],
  }
  const pool = names[dominantType]
  const idx = (startIndex + count) % pool.length
  return pool[idx] ?? dominantType
}

/**
 * Identify eras from strata by grouping consecutive same-type strata.
 *
 * @example
 * identifyEras(strata)
 */
export function identifyEras(strata: Stratum[]): Era[] {
  if (strata.length === 0) return []

  const eras: Era[] = []
  let currentType = strata[0]!.type
  let startIdx = 0

  for (let i = 1; i <= strata.length; i++) {
    const s = strata[i]
    const isNewEra = i === strata.length || s!.type !== currentType

    if (isNewEra) {
      const group = strata.slice(startIdx, i)
      const types = group.map((g) => g.type)
      const typeCounts: Record<string, number> = {}
      for (const t of types) {
        typeCounts[t] = (typeCounts[t] ?? 0) + 1
      }
      const sortedTypes = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)
      const dominant = sortedTypes[0]![0]

      const characteristics = [...new Set(group.map((g) => {
        const lower = g.message.toLowerCase()
        if (/feat|add|new/.test(lower)) return 'new features'
        if (/fix|bug/.test(lower)) return 'bug fixes'
        if (/refactor|clean/.test(lower)) return 'refactoring'
        if (/test/.test(lower)) return 'testing'
        if (/doc/.test(lower)) return 'documentation'
        if (/perf|optim/.test(lower)) return 'optimization'
        return 'maintenance'
      }))]

      eras.push({
        name: generateEraName(dominant as Stratum['type'], startIdx, group.length),
        startHash: group[0]!.hash,
        endHash: group[group.length - 1]!.hash,
        startDate: group[0]!.date,
        endDate: group[group.length - 1]!.date,
        commits: group.length,
        characteristics,
        dominantType: dominant,
      })

      if (i < strata.length) {
        currentType = strata[i]!.type
        startIdx = i
      }
    }
  }

  return eras
}

// ─── Statistics ────────────────────────────────────────────────────────────────

/**
 * Compute artifact density.
 *
 * @example
 * computeArtifactDensity(10, 5)
 */
export function computeArtifactDensity(artifactCount: number, layerCount: number): number {
  if (layerCount === 0) return 0
  return Math.round((artifactCount / layerCount) * 100) / 100
}

/**
 * Compute seismic activity (fault lines per 100 commits).
 *
 * @example
 * computeSeismicActivity(5, 200)
 */
export function computeSeismicActivity(faultLineCount: number, totalCommits: number): number {
  if (totalCommits === 0) return 0
  return Math.round((faultLineCount / totalCommits) * 10000) / 100
}

/**
 * Compute average layer thickness.
 *
 * @example
 * computeAverageThickness(strata)
 */
export function computeAverageThickness(strata: Stratum[]): number {
  if (strata.length === 0) return 0
  const total = strata.reduce((s, st) => s + st.insertions + st.deletions, 0)
  return Math.round((total / strata.length) * 100) / 100
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate archaeological recommendations.
 *
 * @example
 * generateArchaeologistRecommendations(artifacts, faultLines, eras, stats)
 */
export function generateArchaeologistRecommendations(artifacts: Artifact[], faultLines: FaultLine[], eras: Era[], stats: ArchaeologistStats): string[] {
  const recs: string[] = []

  const relics = artifacts.filter((a) => a.type === 'relic')
  if (relics.length > 0) {
    recs.push(`Document ${relics.length} relic(s) — stable code that should have its longevity explained`)
  }

  const fossils = artifacts.filter((a) => a.type === 'fossil')
  if (fossils.length > 0) {
    recs.push(`Clean up ${fossils.length} fossil(s) — dead code that should be excavated and removed`)
  }

  const treasures = artifacts.filter((a) => a.type === 'treasure')
  if (treasures.length > 0) {
    recs.push(`Study ${treasures.length} treasure(s) — use as exemplars for new code`)
  }

  const potsherds = artifacts.filter((a) => a.type === 'potsherd')
  if (potsherds.length > 2) {
    recs.push(`Investigate ${potsherds.length} potsherd(s) — abandoned patterns may indicate tech debt`)
  }

  const catastrophics = faultLines.filter((f) => f.severity === 'catastrophic')
  if (catastrophics.length > 0) {
    recs.push(`Document lessons from ${catastrophics.length} catastrophic fault line(s)`)
  }

  if (stats.seismicActivity > 10) {
    recs.push(`High seismic activity (${stats.seismicActivity}/100) — codebase has frequent major disruptions`)
  }

  if (eras.length > 5) {
    recs.push(`${eras.length} eras detected — document architecture decisions at era boundaries`)
  }

  if (recs.length === 0) {
    recs.push('Codebase appears geologically stable — no significant archaeological findings')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete archaeologist result from files and contents.
 *
 * @example
 * buildArchaeologistResult(['a.ts'], [content], { maxDepth: 10 })
 */
export function buildArchaeologistResult(
  files: string[],
  contents: string[],
  options: { maxDepth: number },
): ArchaeologistResult {
  const strata: Stratum[] = []

  const artifacts: Artifact[] = files.flatMap((f, i) => {
    const otherContents = contents.filter((_, j) => j !== i)
    return discoverArtifacts(f, contents[i] ?? '', otherContents, 0)
  })

  const faultLines = detectFaultLines(strata)
  const eras = identifyEras(strata)

  const stats: ArchaeologistStats = {
    totalLayers: strata.length,
    totalArtifacts: artifacts.length,
    faultLineCount: faultLines.length,
    eraCount: eras.length,
    oldestLayer: strata.length > 0 ? strata[strata.length - 1]!.date : 'none',
    deepestDig: options.maxDepth,
    artifactDensity: computeArtifactDensity(artifacts.length, Math.max(strata.length, 1)),
    averageLayerThickness: computeAverageThickness(strata),
    seismicActivity: computeSeismicActivity(faultLines.length, strata.length),
  }

  const recommendations = generateArchaeologistRecommendations(artifacts, faultLines, eras, stats)

  return { strata, artifacts, faultLines, eras, stats, recommendations }
}
