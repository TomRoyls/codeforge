// ─── Types ────────────────────────────────────────────────────────────────────

export interface Concern {
  name: string
  evidence: string[]
  relatedImports: string[]
  functionCount: number
  lineRange: [number, number]
}

export interface TangleMetrics {
  file: string
  tanglingScore: number
  concernCount: number
  importDiversity: number
  functionDiversity: number
  reasonToChange: number
  concerns: Concern[]
  classification: 'clean' | 'minor-tangle' | 'tangled' | 'spaghetti'
}

export interface TangleCluster {
  files: string[]
  sharedConcerns: string[]
  tanglingScore: number
  description: string
}

export interface TangleStats {
  totalFiles: number
  averageTanglingScore: number
  cleanFiles: number
  tangledFiles: number
  spaghettiFiles: number
  mostTangledFile: string
  cleanestFile: string
  averageConcernsPerFile: number
  averageReasonsToChange: number
}

export interface TangleResult {
  files: TangleMetrics[]
  clusters: TangleCluster[]
  stats: TangleStats
  recommendations: string[]
}

export interface TangleOptions {
  verbose?: boolean
}

// ─── Concern Rules ────────────────────────────────────────────────────────────

interface ConcernRule {
  name: string
  patterns: RegExp[]
  importPatterns: RegExp[]
}

const CONCERN_RULES: ConcernRule[] = [
  {
    name: 'IO',
    patterns: [/\breadFile\b/, /\bwriteFile\b/, /\bfs\./, /\bconsole\./, /\bprocess\.stdout\b/, /\bprocess\.stdin\b/, /\bcreateReadStream\b/, /\bcreateWriteStream\b/],
    importPatterns: [/\bfs\b/, /\bfs\/promises\b/, /\bpath\b/],
  },
  {
    name: 'Network',
    patterns: [/\bfetch\b/, /\bhttp\./, /\bhttps\./, /\brequest\b/, /\baxios\b/, /\bsocket\b/, /\bWebSocket\b/, /\bget\b\(.*url/, /\bpost\b\(.*url/],
    importPatterns: [/\bhttp\b/, /\bhttps\b/, /\baxios\b/, /\bnode-fetch\b/, /\bsupertest\b/],
  },
  {
    name: 'Validation',
    patterns: [/\bvalidate\b/, /\bcheck\b/, /\bassert\b/, /\bis[A-Z]\w+/, /\bhas[A-Z]\w+/, /\bverify\b/, /\bensure\b/, /\bisValid\b/],
    importPatterns: [/\bjoi\b/, /\bzod\b/, /\byup\b/, /\bvalidator\b/],
  },
  {
    name: 'Data',
    patterns: [/\bparse\b/, /\bserialize\b/, /\btransform\b/, /\bconvert\b/, /\bmap\b/, /\bfilter\b/, /\breduce\b/, /\bmerge\b/, /\bclone\b/],
    importPatterns: [/\blodash\b/, /\bunderscore\b/, /\bramda\b/],
  },
  {
    name: 'UI',
    patterns: [/\brender\b/, /\bdisplay\b/, /\bformat\b/, /\bstyle\b/, /\blayout\b/, /\bcomponent\b/, /\btemplate\b/, /\bview\b/],
    importPatterns: [/\breact\b/, /\bvue\b/, /\bsvelte\b/, /\bangular\b/],
  },
  {
    name: 'Config',
    patterns: [/\bconfig\b/, /\bsettings\b/, /\boptions\b/, /\bdefaults\b/, /\benv\b/, /\bENV\b/, /\bgetenv\b/],
    importPatterns: [/\bdotenv\b/, /\bconfig\b/, /\bnconf\b/],
  },
  {
    name: 'ErrorHandling',
    patterns: [/\btry\s*{/, /\bcatch\b/, /\bthrow\b/, /\bnew Error\b/, /\breject\b/, /\bfinally\b/, /\bError\b/],
    importPatterns: [],
  },
  {
    name: 'Logging',
    patterns: [/\blog\b/, /\bdebug\b/, /\btrace\b/, /\binfo\b/, /\bwarn\b/, /\blogger\b/, /\berrorLogger\b/],
    importPatterns: [/\bwinston\b/, /\bpino\b/, /\bbunyan\b/, /\blog4js\b/],
  },
  {
    name: 'StateManagement',
    patterns: [/\bstate\b/, /\bstore\b/, /\bdispatch\b/, /\bmutate\b/, /\bcommit\b/, /\bsetState\b/, /\bgetState\b/, /\bsubscribe\b/],
    importPatterns: [/\bredux\b/, /\bvuex\b/, /\bmobx\b/, /\bxstate\b/],
  },
  {
    name: 'Testing',
    patterns: [/\bdescribe\b/, /\bit\b\s*\(/, /\bexpect\b/, /\bmock\b/, /\bstub\b/, /\bspy\b/, /\bbeforeEach\b/, /\bafterEach\b/],
    importPatterns: [/\bvitest\b/, /\bjest\b/, /\bmocha\b/, /\bchai\b/, /\bsinon\b/],
  },
]

// ─── inferConcerns ────────────────────────────────────────────────────────────

/**
 * Detect concerns in file content using keyword/pattern heuristics.
 *
 * @example
 * inferConcerns('import fs from "fs"; fs.readFile()', 'a.ts') // [{ name: 'IO', ... }]
 */
export function inferConcerns(content: string, filePath: string): Concern[] {
  const lines = content.split('\n')
  const concerns: Concern[] = []

  const importLines = lines.filter((l) => l.trim().startsWith('import '))
  const allImports: string[] = []
  for (const impLine of importLines) {
    const match = impLine.match(/from\s+['"]([^'"]+)['"]/)
    if (match) allImports.push(match[1]!)
  }

  for (const rule of CONCERN_RULES) {
    const evidence: string[] = []
    const relatedImports: string[] = []
    let funcCount = 0
    let firstLine = -1
    let lastLine = -1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!

      for (const pattern of rule.patterns) {
        if (pattern.test(line)) {
          evidence.push(`L${i + 1}: ${line.trim()}`)
          if (firstLine === -1) firstLine = i + 1
          lastLine = i + 1

          if (/function\s|=>\s|^\s*(async\s+)?\w+\s*\(/.test(line)) {
            funcCount++
          }
          break
        }
      }
    }

    for (const impSrc of allImports) {
      for (const impPattern of rule.importPatterns) {
        if (impPattern.test(impSrc) && !relatedImports.includes(impSrc)) {
          relatedImports.push(impSrc)
          if (firstLine === -1) firstLine = 1
          if (lastLine === 0) lastLine = 1
        }
      }
    }

    if (evidence.length > 0 || relatedImports.length > 0) {
      concerns.push({
        name: rule.name,
        evidence,
        relatedImports,
        functionCount: funcCount,
        lineRange: firstLine === -1 ? [0, 0] : [firstLine, lastLine],
      })
    }
  }

  return concerns
}

// ─── computeImportDiversity ────────────────────────────────────────────────────

/**
 * Count distinct import sources.
 *
 * @example
 * computeImportDiversity('import fs from "fs"\nimport path from "path"') // 2
 */
export function computeImportDiversity(content: string): number {
  const sources = new Set<string>()
  const lines = content.split('\n')
  for (const line of lines) {
    const match = line.match(/from\s+['"]([^'"]+)['"]/)
    if (match) sources.add(match[1]!)
    const requireMatch = line.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/)
    if (requireMatch) sources.add(requireMatch[1]!)
  }
  return sources.size
}

// ─── computeFunctionDiversity ─────────────────────────────────────────────────

/**
 * Count distinct operation types (unique verb patterns in function names).
 *
 * @example
 * computeFunctionDiversity('function parseData() {} function sendData() {}') // 2
 */
export function computeFunctionDiversity(content: string): number {
  const verbs = new Set<string>()
  const verbPattern = /\b(get|set|add|remove|create|delete|update|find|search|parse|format|validate|check|handle|process|transform|convert|render|display|send|receive|fetch|post|put|patch|load|save|read|write|open|close|start|stop|init|reset|clear|flush|commit|rollback|push|pop|shift|unshift|sort|filter|map|reduce|merge|split|join|build|compile|execute|run)\w*/gi
  let match: RegExpExecArray | null
  while ((match = verbPattern.exec(content)) !== null) {
    verbs.add(match[1]!.toLowerCase())
  }
  return verbs.size
}

// ─── computeReasonsToChange ───────────────────────────────────────────────────

/**
 * Each distinct concern is a reason to change.
 *
 * @example
 * computeReasonsToChange([{ name: 'IO' }, { name: 'Network' }]) // 2
 */
export function computeReasonsToChange(concerns: Concern[]): number {
  return concerns.length
}

// ─── computeTanglingScore ─────────────────────────────────────────────────────

/**
 * Weighted score: concernCount*15 + importDiversity*5 + functionDiversity*5 + reasonsToChange*10 (capped 100).
 *
 * @example
 * computeTanglingScore({ concernCount: 2, importDiversity: 3, functionDiversity: 4, reasonToChange: 2 }) // 85
 */
export function computeTanglingScore(metrics: { concernCount: number; importDiversity: number; functionDiversity: number; reasonToChange: number }): number {
  const raw = metrics.concernCount * 15 + metrics.importDiversity * 5 + metrics.functionDiversity * 5 + metrics.reasonToChange * 10
  return Math.min(100, raw)
}

// ─── classifyTangling ─────────────────────────────────────────────────────────

/**
 * Classify tangling: clean (0-20), minor-tangle (20-40), tangled (40-65), spaghetti (65+).
 *
 * @example
 * classifyTangling(15) // 'clean'
 * classifyTangling(70) // 'spaghetti'
 */
export function classifyTangling(score: number): 'clean' | 'minor-tangle' | 'tangled' | 'spaghetti' {
  if (score < 20) return 'clean'
  if (score < 40) return 'minor-tangle'
  if (score < 65) return 'tangled'
  return 'spaghetti'
}

// ─── analyzeFile ──────────────────────────────────────────────────────────────

/**
 * Analyze a single file's tangling metrics.
 *
 * @example
 * analyzeFile('a.ts', 'import fs from "fs"; fs.readFile()') // TangleMetrics
 */
export function analyzeFile(filePath: string, content: string): TangleMetrics {
  const concerns = inferConcerns(content, filePath)
  const importDiversity = computeImportDiversity(content)
  const functionDiversity = computeFunctionDiversity(content)
  const reasonToChange = computeReasonsToChange(concerns)
  const tanglingScore = computeTanglingScore({
    concernCount: concerns.length,
    importDiversity,
    functionDiversity,
    reasonToChange,
  })
  const classification = classifyTangling(tanglingScore)

  return {
    file: filePath,
    tanglingScore,
    concernCount: concerns.length,
    importDiversity,
    functionDiversity,
    reasonToChange,
    concerns,
    classification,
  }
}

// ─── findTangleClusters ───────────────────────────────────────────────────────

/**
 * Group files that share 3+ concerns.
 *
 * @example
 * findTangleClusters([metrics1, metrics2]) // [TangleCluster, ...]
 */
export function findTangleClusters(fileMetrics: TangleMetrics[]): TangleCluster[] {
  if (fileMetrics.length < 2) return []

  const clusters: TangleCluster[] = []
  const used = new Set<number>()

  for (let i = 0; i < fileMetrics.length; i++) {
    if (used.has(i)) continue
    const a = fileMetrics[i]!
    const aConcerns = new Set(a.concerns.map((c) => c.name))

    const clusterFiles: string[] = [a.file]
    const sharedConcerns: string[] = []

    for (let j = i + 1; j < fileMetrics.length; j++) {
      if (used.has(j)) continue
      const b = fileMetrics[j]!
      const bConcerns = new Set(b.concerns.map((c) => c.name))
      const overlap = [...aConcerns].filter((c) => bConcerns.has(c))

      if (overlap.length >= 3) {
        clusterFiles.push(b.file)
        for (const c of overlap) {
          if (!sharedConcerns.includes(c)) sharedConcerns.push(c)
        }
        used.add(j)
      }
    }

    if (clusterFiles.length >= 2) {
      used.add(i)
      const avgScore = Math.round(clusterFiles.reduce((sum, f) => {
        const m = fileMetrics.find((fm) => fm.file === f)
        return sum + (m?.tanglingScore ?? 0)
      }, 0) / clusterFiles.length)

      clusters.push({
        files: clusterFiles,
        sharedConcerns,
        tanglingScore: avgScore,
        description: `${clusterFiles.length} files share ${sharedConcerns.length} concerns: ${sharedConcerns.join(', ')}`,
      })
    }
  }

  return clusters
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate actionable recommendations.
 *
 * @example
 * generateRecommendations(files, stats) // ['Split X by concern']
 */
export function generateRecommendations(files: TangleMetrics[], stats: TangleStats): string[] {
  const recs: string[] = []

  const spaghetti = files.filter((f) => f.classification === 'spaghetti')
  if (spaghetti.length > 0) {
    const names = spaghetti.slice(0, 3).map((f) => f.file).join(', ')
    recs.push(`${spaghetti.length} spaghetti file(s) should be split by concern: ${names}`)
  }

  const highRTC = files.filter((f) => f.reasonToChange >= 4)
  if (highRTC.length > 0) {
    const names = highRTC.slice(0, 3).map((f) => f.file).join(', ')
    recs.push(`${highRTC.length} file(s) with high reasons-to-change (4+) — refactor: ${names}`)
  }

  if (stats.averageTanglingScore > 40) {
    recs.push(`Average tangling score is ${stats.averageTanglingScore.toFixed(1)} — consider modularizing shared concerns`)
  }

  const tangled = files.filter((f) => f.classification === 'tangled')
  if (tangled.length > 0) {
    recs.push(`${tangled.length} tangled file(s) — extract distinct concerns into separate modules`)
  }

  if (stats.spaghettiFiles > stats.totalFiles * 0.3) {
    recs.push('Over 30% of files are spaghetti — consider a major restructuring')
  }

  if (recs.length === 0) {
    recs.push('Codebase has good separation of concerns — low tangling detected.')
  }

  return recs
}

// ─── buildTangleResult ────────────────────────────────────────────────────────

/**
 * Orchestrate full tangle analysis.
 *
 * @example
 * buildTangleResult(['a.ts'], ['code...']) // TangleResult
 */
export function buildTangleResult(files: string[], contents: string[], _options?: TangleOptions): TangleResult {
  const fileMetrics: TangleMetrics[] = []

  for (let i = 0; i < files.length; i++) {
    const metrics = analyzeFile(files[i]!, contents[i] ?? '')
    fileMetrics.push(metrics)
  }

  const clusters = findTangleClusters(fileMetrics)

  const totalFiles = fileMetrics.length
  const avgScore = totalFiles > 0
    ? Math.round(fileMetrics.reduce((s, f) => s + f.tanglingScore, 0) / totalFiles * 10) / 10
    : 0
  const cleanFiles = fileMetrics.filter((f) => f.classification === 'clean').length
  const tangledFiles = fileMetrics.filter((f) => f.classification === 'tangled').length
  const spaghettiFiles = fileMetrics.filter((f) => f.classification === 'spaghetti').length

  const sorted = [...fileMetrics].sort((a, b) => b.tanglingScore - a.tanglingScore)
  const mostTangled = sorted[0]?.file ?? ''
  const cleanest = sorted[sorted.length - 1]?.file ?? ''

  const avgConcerns = totalFiles > 0
    ? Math.round(fileMetrics.reduce((s, f) => s + f.concernCount, 0) / totalFiles * 10) / 10
    : 0
  const avgRTC = totalFiles > 0
    ? Math.round(fileMetrics.reduce((s, f) => s + f.reasonToChange, 0) / totalFiles * 10) / 10
    : 0

  const stats: TangleStats = {
    totalFiles,
    averageTanglingScore: avgScore,
    cleanFiles,
    tangledFiles,
    spaghettiFiles,
    mostTangledFile: mostTangled,
    cleanestFile: cleanest,
    averageConcernsPerFile: avgConcerns,
    averageReasonsToChange: avgRTC,
  }

  const recommendations = generateRecommendations(fileMetrics, stats)

  return { files: fileMetrics, clusters, stats, recommendations }
}
