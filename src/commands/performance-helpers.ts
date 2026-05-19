// ─── Interfaces ──────────────────────────────────────────

export interface PerfRule {
  id: string
  title: string
  severity: 'high' | 'medium' | 'low'
  category: 'async' | 'bundle' | 'cpu' | 'io' | 'memory' | 'network'
  pattern: RegExp
  suggestion: string
}

export interface PerfFinding {
  rule: string
  title: string
  severity: 'high' | 'medium' | 'low'
  category: string
  file: string
  line: number
  match: string
  context: string
  suggestion: string
}

export interface PerfStats {
  total: number
  high: number
  medium: number
  low: number
  byCategory: Record<string, number>
  byFile: Record<string, number>
}

export interface PerfResult {
  findings: PerfFinding[]
  stats: PerfStats
  files: string[]
}

export interface PerfScanOptions {
  severity?: 'high' | 'low' | 'medium'
}

// ─── Rules ──────────────────────────────────────────────

/**
 * Returns all performance detection rules.
 *
 * @example
 * ```ts
 * const rules = getPerfRules()
 * console.log(rules.length) // number of rules
 * ```
 */
export function getPerfRules(): PerfRule[] {
  return [
    {
      category: 'io',
      id: 'PERF001',
      pattern:
        /(readFileSync|readdirSync|statSync|existsSync|writeFileSync|appendFileSync|unlinkSync|mkdirSync|rmdirSync|accessSync|chmodSync|chownSync|copyFileSync|linkSync|renameSync|readlinkSync|realpathSync|opendirSync)/,
      severity: 'high',
      suggestion: "Use async fs.promises or fs/promises instead",
      title: 'Synchronous file read',
    },
    {
      category: 'cpu',
      id: 'PERF002',
      pattern: /(?:for|while)\s*\(.*\{[^}]*require\s*\(/s,
      severity: 'high',
      suggestion: 'Move require() outside the loop',
      title: 'Sync require in loop',
    },
    {
      category: 'cpu',
      id: 'PERF003',
      pattern: /\.push\(\.\.\./,
      severity: 'medium',
      suggestion: 'Use Array.concat or push individual items',
      title: 'Array.push in tight loop with spread',
    },
    {
      category: 'cpu',
      id: 'PERF004',
      pattern: /(?:for|while|\.forEach|\.map)\s*[\({].*JSON\.parse/s,
      severity: 'high',
      suggestion: 'Parse JSON once outside the loop',
      title: 'JSON.parse in loop',
    },
    {
      category: 'bundle',
      id: 'PERF005',
      pattern:
        /import\s+\*\s+as\s+\w+\s+from\s+['"]lodash['"]|import\s+\*\s+as\s+\w+\s+from\s+['"]moment['"]|import\s+\*\s+as\s+\w+\s+from\s+['"]rxjs['"]/,
      severity: 'medium',
      suggestion: "Use specific imports (e.g., import { debounce } from 'lodash-es')",
      title: 'Large library import',
    },
    {
      category: 'memory',
      id: 'PERF006',
      pattern: /setInterval\s*\([^)]*\)(?!.*clearInterval)/,
      severity: 'high',
      suggestion: 'Store interval ID and call clearInterval on cleanup',
      title: 'setInterval without clearInterval',
    },
    {
      category: 'memory',
      id: 'PERF007',
      pattern: /addEventListener\s*\([^)]*\)(?!.*removeEventListener)/,
      severity: 'medium',
      suggestion: 'Store listener reference and call removeEventListener on cleanup',
      title: 'addEventListener without removeEventListener',
    },
    {
      category: 'cpu',
      id: 'PERF008',
      pattern: /for\s*\(.*\{[^}]*(?:for|while|\.forEach|\.map)\s*[\({]/s,
      severity: 'medium',
      suggestion: 'Consider using a Map/Set for O(1) lookups instead of nested iteration',
      title: 'Nested loops (O(n²))',
    },
    {
      category: 'cpu',
      id: 'PERF009',
      pattern: /(?:for|while|\.forEach)\s*[\({].*\w+\s*\+=\s*['"`]/s,
      severity: 'low',
      suggestion: 'Use Array.join() or template literals',
      title: 'String concatenation in loop',
    },
    {
      category: 'cpu',
      id: 'PERF010',
      pattern: /new RegExp\s*\(\s*['"]([^'"]*\([^+][^)]*\+[^)]*\))+[^'"]*['"]\)/,
      severity: 'medium',
      suggestion: 'Review regex for potential catastrophic backtracking',
      title: 'Blocking regex (catastrophic backtracking)',
    },
    {
      category: 'async',
      id: 'PERF011',
      pattern: /await\s+.*\n.*await\s+/,
      severity: 'medium',
      suggestion: 'Use Promise.all() for independent async operations',
      title: 'Multiple await in sequence',
    },
    {
      category: 'io',
      id: 'PERF014',
      pattern: /console\.(log|debug|info|warn|error)\s*\(/,
      severity: 'low',
      suggestion: 'Use a proper logging library with log levels',
      title: 'console.log in production code',
    },
  ]
}

// ─── File scanning ──────────────────────────────────────

/**
 * Scans a single file's content against the given rules.
 *
 * @example
 * ```ts
 * const findings = scanFile('const x = readFileSync("f")', 'test.ts', rules)
 * ```
 */
export function scanFile(content: string, filePath: string, rules: PerfRule[]): PerfFinding[] {
  const findings: PerfFinding[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lineNum = i + 1

    for (const rule of rules) {
      if (rule.pattern.test(line)) {
        const startLine = Math.max(0, i - 1)
        const endLine = Math.min(lines.length - 1, i + 1)
        const contextLines = lines.slice(startLine, endLine + 1)

        findings.push({
          category: rule.category,
          context: contextLines.join('\n'),
          file: filePath,
          line: lineNum,
          match: line.trim(),
          rule: rule.id,
          severity: rule.severity,
          suggestion: rule.suggestion,
          title: rule.title,
        })
      }
    }
  }

  return findings
}

// ─── Stats computation ──────────────────────────────────

/**
 * Computes aggregate statistics from an array of findings.
 *
 * @example
 * ```ts
 * const stats = computePerfStats(findings)
 * console.log(stats.total, stats.high)
 * ```
 */
export function computePerfStats(findings: PerfFinding[]): PerfStats {
  const stats: PerfStats = {
    byCategory: {},
    byFile: {},
    high: 0,
    low: 0,
    medium: 0,
    total: findings.length,
  }

  for (const finding of findings) {
    stats.byCategory[finding.category] = (stats.byCategory[finding.category] ?? 0) + 1
    stats.byFile[finding.file] = (stats.byFile[finding.file] ?? 0) + 1

    if (finding.severity === 'high') stats.high++
    else if (finding.severity === 'medium') stats.medium++
    else stats.low++
  }

  return stats
}

// ─── Result building ────────────────────────────────────

/**
 * Orchestrates scanning of multiple files and returns the full result.
 *
 * @example
 * ```ts
 * const result = await buildPerfResult(['a.ts'], reader, {})
 * ```
 */
export async function buildPerfResult(
  files: string[],
  contentReader: (filePath: string) => Promise<string>,
  options: PerfScanOptions = {},
): Promise<PerfResult> {
  const rules = getPerfRules()

  let allFindings: PerfFinding[] = []

  for (const file of files) {
    try {
      const content = await contentReader(file)
      const fileFindings = scanFile(content, file, rules)
      allFindings.push(...fileFindings)
    } catch {
      // Skip unreadable files
    }
  }

  if (options.severity) {
    allFindings = allFindings.filter((f) => f.severity === options.severity)
  }

  const stats = computePerfStats(allFindings)

  return {
    files,
    findings: allFindings,
    stats,
  }
}
