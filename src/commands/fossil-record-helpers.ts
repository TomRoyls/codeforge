// ─── Types ────────────────────────────────────────────────────────────────────

export interface FossilLayer {
  depth: number
  commitHash: string
  date: string
  message: string
  filesChanged: number
  insertions: number
  deletions: number
  era: string
}

export interface ExtinctPattern {
  pattern: string
  lastSeen: string
  replacement: string
  files: string[]
  category: 'import' | 'pattern' | 'dependency' | 'convention' | 'api'
}

export interface LivingFossil {
  file: string
  age: number
  lastTouched: string
  stability: number
  category: 'ancient' | 'dormant' | 'petrified' | 'relic'
  risk: 'none' | 'low' | 'medium' | 'high'
}

export interface EvolutionaryStage {
  name: string
  startCommit: string
  endCommit: string | null
  startDate: string
  endDate: string | null
  characteristics: string[]
  fileCount: number
  totalChanges: number
}

export interface FossilRecordStats {
  totalLayers: number
  extinctCount: number
  livingFossilCount: number
  stageCount: number
  oldestActiveFile: string
  averageFileAge: number
  changeVelocity: number
  stabilityIndex: number
}

export interface FossilRecordResult {
  layers: FossilLayer[]
  extinctPatterns: ExtinctPattern[]
  livingFossils: LivingFossil[]
  evolutionaryStages: EvolutionaryStage[]
  stats: FossilRecordStats
  recommendations: string[]
}

export interface FossilRecordOptions {
  verbose?: boolean
  maxDepth?: number
}

// ─── Layer Extraction ─────────────────────────────────────────────────────────

/**
 * Parse git log output into fossil layers.
 *
 * @example
 * parseGitLog(gitOutput)
 */
export function parseGitLog(raw: string): FossilLayer[] {
  if (!raw.trim()) return []

  const lines = raw.trim().split('\n')
  const layers: FossilLayer[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim()
    if (!line) continue

    const parts = line.split('|')
    if (parts.length < 6) continue

    const hash = parts[0]!.trim()
    const date = parts[1]!.trim()
    const message = parts[2]!.trim()
    const filesChanged = parseInt(parts[3]!.trim(), 10) || 0
    const insertions = parseInt(parts[4]!.trim(), 10) || 0
    const deletions = parseInt(parts[5]!.trim(), 10) || 0

    layers.push({
      depth: i + 1,
      commitHash: hash,
      date,
      message,
      filesChanged,
      insertions,
      deletions,
      era: generateEraName(message, i),
    })
  }

  return layers
}

/**
 * Generate an era name from a commit message and depth.
 *
 * @example
 * generateEraName('feat: add auth', 0)
 */
export function generateEraName(message: string, depth: number): string {
  const lower = message.toLowerCase()

  if (lower.startsWith('init') || lower.includes('scaffold') || lower.includes('bootstrap')) return 'Scaffold Era'
  if (lower.includes('security') || lower.includes('vuln')) return 'Security Era'
  if (lower.includes('migrate') || lower.includes('refactor')) return 'Migration Era'
  if (lower.includes('test') || lower.includes('spec')) return 'Test Expansion Era'
  if (lower.includes('clean') || lower.includes('remove') || lower.includes('delete')) return 'Cleanup Era'
  if (lower.includes('perf') || lower.includes('optim')) return 'Performance Era'
  if (lower.includes('deps') || lower.includes('depend') || lower.includes('upgrade')) return 'Dependency Era'
  if (lower.includes('docs') || lower.includes('readme')) return 'Documentation Era'
  if (lower.includes('ci') || lower.includes('build') || lower.includes('deploy')) return 'Infrastructure Era'
  if (lower.includes('feat') || lower.includes('feature') || lower.includes('add')) return 'Feature Growth Era'
  if (lower.includes('fix') || lower.includes('bug') || lower.includes('patch')) return 'Bug Fix Era'

  const eraNames = ['Ancient', 'Archaic', 'Classical', 'Medieval', 'Renaissance', 'Modern', 'Contemporary']
  const idx = Math.min(depth, eraNames.length - 1)
  return `${eraNames[idx]!} Era`
}

// ─── Extinct Pattern Detection ────────────────────────────────────────────────

/**
 * Detect extinct patterns from file contents.
 *
 * @example
 * detectExtinctPatterns(files, contents)
 */
export function detectExtinctPatterns(
  files: string[],
  contents: string[],
): ExtinctPattern[] {
  const patterns: ExtinctPattern[] = []

  const deprecatedImports = findDeprecatedImports(files, contents)
  patterns.push(...deprecatedImports)

  const commentedOutCode = findCommentedCode(files, contents)
  patterns.push(...commentedOutCode)

  const todoFixme = findTodoFixme(files, contents)
  patterns.push(...todoFixme)

  const oldConventions = findOldConventions(files, contents)
  patterns.push(...oldConventions)

  return patterns
}

/**
 * Find deprecated import patterns.
 *
 * @example
 * findDeprecatedImports(files, contents)
 */
export function findDeprecatedImports(
  files: string[],
  contents: string[],
): ExtinctPattern[] {
  const patterns: ExtinctPattern[] = []
  const deprecatedPatterns = [
    { import: 'var', replacement: 'const/let', pattern: /\bvar\s+\w+/g },
    { import: 'require()', replacement: 'import', pattern: /require\s*\(\s*['"][^'"]+['"]\s*\)/g },
    { import: 'node-fetch', replacement: 'built-in fetch', pattern: /from\s+['"]node-fetch['"]/g },
    { import: 'request', replacement: 'fetch/axios', pattern: /from\s+['"]request['"]/g },
    { import: 'moment', replacement: 'date-fns/dayjs', pattern: /from\s+['"]moment['"]/g },
  ]

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''

    for (const dep of deprecatedPatterns) {
      const matches = content.match(dep.pattern)
      if (matches && matches.length > 0) {
        const existing = patterns.find((p) => p.pattern === dep.import)
        if (existing) {
          if (!existing.files.includes(file)) existing.files.push(file)
        } else {
          patterns.push({
            pattern: dep.import,
            lastSeen: file,
            replacement: dep.replacement,
            files: [file],
            category: 'import',
          })
        }
      }
    }
  }

  return patterns
}

/**
 * Find commented-out code patterns.
 *
 * @example
 * findCommentedCode(files, contents)
 */
export function findCommentedCode(
  files: string[],
  contents: string[],
): ExtinctPattern[] {
  const patterns: ExtinctPattern[] = []
  const codePattern = /^\s*\/\/\s*(?:const|let|var|function|class|import|export|if|for|while|return)\s/gm

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const matches = content.match(codePattern)
    if (matches && matches.length >= 3) {
      patterns.push({
        pattern: 'commented-out code',
        lastSeen: file,
        replacement: 'remove dead code',
        files: [file],
        category: 'pattern',
      })
    }
  }

  return patterns
}

/**
 * Find TODO/FIXME markers indicating deprecated code.
 *
 * @example
 * findTodoFixme(files, contents)
 */
export function findTodoFixme(
  files: string[],
  contents: string[],
): ExtinctPattern[] {
  const patterns: ExtinctPattern[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const deprecated = content.match(/\/\/\s*DEPRECATED:/gi)
    if (deprecated && deprecated.length > 0) {
      patterns.push({
        pattern: 'DEPRECATED markers',
        lastSeen: file,
        replacement: 'remove or migrate deprecated code',
        files: [file],
        category: 'api',
      })
    }
  }

  return patterns
}

/**
 * Find old naming conventions.
 *
 * @example
 * findOldConventions(files, contents)
 */
export function findOldConventions(
  files: string[],
  contents: string[],
): ExtinctPattern[] {
  const patterns: ExtinctPattern[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const callbackPattern = content.match(/function\s+\w+\s*\([^)]*\b(?:callback|cb|next)\b/g)
    if (callbackPattern && callbackPattern.length >= 2) {
      const existing = patterns.find((p) => p.pattern === 'callback-style')
      if (existing) {
        if (!existing.files.includes(file)) existing.files.push(file)
      } else {
        patterns.push({
          pattern: 'callback-style',
          lastSeen: file,
          replacement: 'Promise/async-await',
          files: [file],
          category: 'convention',
        })
      }
    }
  }

  return patterns
}

// ─── Living Fossil Detection ──────────────────────────────────────────────────

/**
 * Find living fossils — old unchanged files.
 *
 * @example
 * findLivingFossils(files, ages, contents)
 */
export function findLivingFossils(
  files: string[],
  ages: number[],
  contents: string[],
): LivingFossil[] {
  const fossils: LivingFossil[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const age = ages[i] ?? 0
    const content = contents[i] ?? ''

    if (age < 90) continue

    const category = classifyLivingFossil(age, content)
    const stability = computeStability(age)
    const risk = assessRisk(age, content)

    fossils.push({
      file,
      age,
      lastTouched: age === 0 ? 'today' : `${age}d ago`,
      stability,
      category,
      risk,
    })
  }

  return fossils
}

/**
 * Classify a living fossil by age and content.
 *
 * @example
 * classifyLivingFossil(400, content)
 */
export function classifyLivingFossil(age: number, content: string): LivingFossil['category'] {
  if (age > 365) return 'ancient'
  if (age > 180) return 'dormant'
  if (content.includes('DEPRECATED') || content.includes('@deprecated')) return 'relic'
  return 'petrified'
}

/**
 * Compute stability score from age.
 *
 * @example
 * computeStability(200)
 */
export function computeStability(age: number): number {
  return Math.min(100, Math.round(age / 3.65))
}

/**
 * Assess risk level of a living fossil.
 *
 * @example
 * assessRisk(500, content)
 */
export function assessRisk(age: number, content: string): LivingFossil['risk'] {
  if (age > 365 && (content.includes('DEPRECATED') || content.includes('TODO'))) return 'high'
  if (age > 365) return 'medium'
  if (age > 180) return 'low'
  return 'none'
}

// ─── Evolutionary Stages ──────────────────────────────────────────────────────

/**
 * Detect evolutionary stages from fossil layers.
 *
 * @example
 * detectEvolutionaryStages(layers)
 */
export function detectEvolutionaryStages(layers: FossilLayer[]): EvolutionaryStage[] {
  if (layers.length === 0) return []

  const stages: EvolutionaryStage[] = []
  let currentEra = layers[0]!.era
  let stageStart = 0

  for (let i = 1; i <= layers.length; i++) {
    const layer = layers[i]
    const eraChanged = layer && layer.era !== currentEra
    const isLast = i === layers.length

    if (eraChanged || isLast) {
      const endIdx = isLast ? i - 1 : i - 1
      const stageLayers = layers.slice(stageStart, endIdx + 1)
      const characteristics = [...new Set(stageLayers.map((l) => l.message.split(' ').slice(0, 3).join(' ')))]

      stages.push({
        name: currentEra,
        startCommit: layers[stageStart]!.commitHash,
        endCommit: layers[endIdx]!.commitHash,
        startDate: layers[stageStart]!.date,
        endDate: layers[endIdx]!.date,
        characteristics: characteristics.slice(0, 5),
        fileCount: stageLayers.reduce((s, l) => s + l.filesChanged, 0),
        totalChanges: stageLayers.reduce((s, l) => s + l.insertions + l.deletions, 0),
      })

      if (eraChanged) {
        currentEra = layer!.era
        stageStart = i
      }
    }
  }

  return stages
}

// ─── Velocity & Stability ─────────────────────────────────────────────────────

/**
 * Compute change velocity (commits per week).
 *
 * @example
 * computeChangeVelocity(layers)
 */
export function computeChangeVelocity(layers: FossilLayer[]): number {
  if (layers.length < 2) return layers.length

  const firstDate = new Date(layers[layers.length - 1]!.date).getTime()
  const lastDate = new Date(layers[0]!.date).getTime()

  if (isNaN(firstDate) || isNaN(lastDate) || firstDate === lastDate) return layers.length

  const weeks = (lastDate - firstDate) / (7 * 24 * 60 * 60 * 1000)
  if (weeks === 0) return layers.length

  return Math.round((layers.length / weeks) * 10) / 10
}

/**
 * Compute overall stability index (0-100).
 *
 * @example
 * computeOverallStabilityIndex(livingFossils, totalFiles)
 */
export function computeOverallStabilityIndex(
  livingFossils: LivingFossil[],
  totalFiles: number,
): number {
  if (totalFiles === 0) return 100

  const stableFiles = totalFiles - livingFossils.length
  const ratio = stableFiles / totalFiles
  return Math.round(ratio * 100)
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Compute fossil record statistics.
 *
 * @example
 * computeFossilRecordStats(layers, extinct, living, stages, files, ages)
 */
export function computeFossilRecordStats(
  layers: FossilLayer[],
  extinctPatterns: ExtinctPattern[],
  livingFossils: LivingFossil[],
  stages: EvolutionaryStage[],
  files: string[],
  ages: number[],
): FossilRecordStats {
  const oldestIdx = ages.indexOf(Math.max(...ages))
  const oldestActiveFile = oldestIdx >= 0 && files[oldestIdx] ? files[oldestIdx]! : ''
  const averageFileAge = ages.length > 0
    ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length)
    : 0

  return {
    totalLayers: layers.length,
    extinctCount: extinctPatterns.length,
    livingFossilCount: livingFossils.length,
    stageCount: stages.length,
    oldestActiveFile,
    averageFileAge,
    changeVelocity: computeChangeVelocity(layers),
    stabilityIndex: computeOverallStabilityIndex(livingFossils, files.length),
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate fossil record recommendations.
 *
 * @example
 * generateFossilRecordRecommendations(living, extinct, stats)
 */
export function generateFossilRecordRecommendations(
  livingFossils: LivingFossil[],
  extinctPatterns: ExtinctPattern[],
  stats: FossilRecordStats,
): string[] {
  const recs: string[] = []

  const highRisk = livingFossils.filter((f) => f.risk === 'high')
  if (highRisk.length > 0) {
    recs.push(`${highRisk.length} high-risk living fossil(s) — review for removal or update`)
  }

  const ancient = livingFossils.filter((f) => f.category === 'ancient')
  if (ancient.length > 0) {
    recs.push(`${ancient.length} ancient file(s) (>365 days unchanged) — verify they are still needed`)
  }

  if (extinctPatterns.length > 0) {
    recs.push(`${extinctPatterns.length} extinct pattern(s) detected — clean up deprecated code and imports`)
  }

  const callbackPatterns = extinctPatterns.filter((p) => p.pattern === 'callback-style')
  if (callbackPatterns.length > 0) {
    recs.push('Callback-style patterns found — migrate to async/await')
  }

  if (stats.changeVelocity > 20) {
    recs.push(`High change velocity (${stats.changeVelocity} commits/week) — ensure adequate test coverage`)
  }

  if (stats.stabilityIndex < 50) {
    recs.push(`Low stability index (${stats.stabilityIndex}%) — many files are stale`)
  }

  if (recs.length === 0) {
    recs.push('Fossil record looks healthy — codebase is actively maintained')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete fossil record result.
 *
 * @example
 * buildFossilRecordResult(files, contents, ages, gitLog)
 */
export function buildFossilRecordResult(
  files: string[],
  contents: string[],
  ages: number[],
  gitLog: string,
  _options?: FossilRecordOptions,
): FossilRecordResult {
  const layers = parseGitLog(gitLog)
  const extinctPatterns = detectExtinctPatterns(files, contents)
  const livingFossils = findLivingFossils(files, ages, contents)
  const evolutionaryStages = detectEvolutionaryStages(layers)
  const stats = computeFossilRecordStats(layers, extinctPatterns, livingFossils, evolutionaryStages, files, ages)
  const recommendations = generateFossilRecordRecommendations(livingFossils, extinctPatterns, stats)

  return {
    layers,
    extinctPatterns,
    livingFossils,
    evolutionaryStages,
    stats,
    recommendations,
  }
}
