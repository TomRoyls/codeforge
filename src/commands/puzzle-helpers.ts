// ─── Types ────────────────────────────────────────────────────────────────────

export type Difficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'expert' | 'nightmare'

export interface PuzzleBreakdown {
  nestingScore: number
  complexityScore: number
  obscurityScore: number
  controlFlowScore: number
  tokenDiversityScore: number
}

export interface FunctionPuzzle {
  name: string
  lineStart: number
  lineEnd: number
  difficulty: Difficulty
  score: number
  nestingDepth: number
  complexity: number
  branchCount: number
  loopCount: number
}

export interface PuzzleScore {
  file: string
  difficulty: Difficulty
  score: number
  breakdown: PuzzleBreakdown
  functions: FunctionPuzzle[]
  estimatedReadTime: string
  hints: string[]
}

export interface PuzzleStats {
  totalFiles: number
  averageScore: number
  hardestFile: string
  easiestFile: string
  totalEstimatedReadTime: string
  nightmareCount: number
}

export interface PuzzleResult {
  files: PuzzleScore[]
  distribution: Record<string, number>
  stats: PuzzleStats
  leaderboard: PuzzleScore[]
  recommendations: string[]
}

export interface PuzzleOptions {
  verbose?: boolean
}

// ─── classifyDifficulty ───────────────────────────────────────────────────────

/**
 * Map a 0-100 score to a difficulty label.
 *
 * @example
 * classifyDifficulty(42) // 'medium'
 */
export function classifyDifficulty(score: number): Difficulty {
  if (score >= 85) return 'nightmare'
  if (score >= 70) return 'expert'
  if (score >= 50) return 'hard'
  if (score >= 30) return 'medium'
  if (score >= 15) return 'easy'
  return 'trivial'
}

// ─── computeNestingScore ──────────────────────────────────────────────────────

/**
 * Score based on maximum nesting depth.
 *
 * @example
 * computeNestingScore('if (a) { if (b) { } }') // score for depth 2
 */
export function computeNestingScore(content: string): number {
  let maxDepth = 0
  let currentDepth = 0
  for (const ch of content) {
    if (ch === '{' || ch === '(' || ch === '[') currentDepth++
    if (ch === '}' || ch === ')' || ch === ']') currentDepth--
    if (currentDepth > maxDepth) maxDepth = currentDepth
  }

  if (maxDepth <= 1) return 0
  if (maxDepth === 2) return 10
  if (maxDepth === 3) return 25
  if (maxDepth === 4) return 50
  if (maxDepth <= 6) return 75
  return 100
}

// ─── computeComplexityScore ───────────────────────────────────────────────────

/**
 * Score based on cyclomatic complexity (branch points).
 *
 * @example
 * computeComplexityScore('if (a) {} else if (b) {}') // score based on branches
 */
export function computeComplexityScore(content: string): number {
  const branches = content.match(/\b(if|else|for|while|case|catch|&&|\|\||\.|\?)\b/g)
  const count = branches?.length ?? 0

  if (count === 0) return 0
  if (count <= 3) return 10
  if (count <= 8) return 25
  if (count <= 15) return 40
  if (count <= 25) return 60
  if (count <= 40) return 80
  return 100
}

// ─── computeObscurityScore ────────────────────────────────────────────────────

const ABBREVIATIONS = new Set(['cfg', 'msg', 'usr', 'fn', 'cb', 'ctx', 'req', 'res', 'err', 'val', 'ref', 'ptr', 'idx', 'len', 'num', 'str', 'arr', 'obj', 'doc', 'dir', 'tmp', 'ret', 'arg', 'param', 'init', 'util', 'mgr', 'svc', 'dto', 'vo', 'dao'])

const GENERIC_NAMES = new Set(['data', 'result', 'info', 'temp', 'value', 'item', 'obj', 'handler', 'callback', 'processor', 'manager', 'helper', 'util', 'utils', 'stuff', 'things', 'output', 'input', 'buffer', 'payload', 'content'])

const LOOP_VARS = new Set(['i', 'j', 'k', 'x', 'y', 'z', 'n', 'm', 'e', '_', 'el'])

/**
 * Score based on cryptic/obscure identifier names.
 *
 * @example
 * computeObscurityScore('const x = fn(cb)') // higher obscurity
 */
export function computeObscurityScore(content: string): number {
  const lines = content.split('\n')
  let obscureCount = 0
  let totalIdentifiers = 0

  for (const line of lines) {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
    const identifiers = line.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g) ?? []
    for (const id of identifiers) {
      if (['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'new', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'typeof', 'instanceof', 'switch', 'case', 'break', 'continue', 'default', 'true', 'false', 'null', 'undefined', 'this', 'type', 'interface', 'extends', 'implements'].includes(id)) continue
      totalIdentifiers++
      if (id.length <= 1 && !LOOP_VARS.has(id)) obscureCount++
      else if (id.length === 2 && !LOOP_VARS.has(id)) obscureCount++
      else if (ABBREVIATIONS.has(id.toLowerCase())) obscureCount++
      else if (GENERIC_NAMES.has(id.toLowerCase())) obscureCount += 0.5
    }
  }

  if (totalIdentifiers === 0) return 0
  const ratio = obscureCount / totalIdentifiers
  return Math.min(100, Math.round(ratio * 200))
}

// ─── computeControlFlowScore ──────────────────────────────────────────────────

const CONTROL_TYPES = ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'yield', 'return', 'break', 'continue']

/**
 * Score based on variety of control flow structures.
 *
 * @example
 * computeControlFlowScore('if (a) { for (let i=0;i<10;i++) {} }') // uses 2 types
 */
export function computeControlFlowScore(content: string): number {
  const found = new Set<string>()
  for (const kw of CONTROL_TYPES) {
    const regex = new RegExp(`\\b${kw}\\b`)
    if (regex.test(content)) found.add(kw)
  }

  const variety = found.size
  if (variety <= 2) return 0
  if (variety <= 4) return 15
  if (variety <= 6) return 30
  if (variety <= 8) return 50
  if (variety <= 10) return 70
  return 100
}

// ─── computeTokenDiversity ────────────────────────────────────────────────────

/**
 * Score based on ratio of unique tokens to total tokens.
 *
 * @example
 * computeTokenDiversity('const x = 1 + 1') // score based on unique/total
 */
export function computeTokenDiversity(content: string): number {
  const tokens = content.match(/\b\w+\b/g) ?? []
  if (tokens.length === 0) return 0

  const unique = new Set(tokens).size
  const ratio = unique / tokens.length

  // high ratio = many unique tokens = harder to track
  return Math.min(100, Math.round(ratio * 150))
}

// ─── estimateReadTime ─────────────────────────────────────────────────────────

/**
 * Estimate how long to understand a file based on lines and score.
 *
 * @example
 * estimateReadTime(100, 50) // '~5 minutes'
 */
export function estimateReadTime(lines: number, score: number): string {
  // base: 50 lines per minute for simple code
  const baseMinutes = lines / 50
  // difficulty multiplier: score 0 = 1x, score 100 = 5x
  const multiplier = 1 + (score / 100) * 4
  const minutes = baseMinutes * multiplier

  if (minutes < 0.5) return '< 1 minute'
  if (minutes < 1.5) return '~1 minute'
  if (minutes < 60) return `~${Math.round(minutes)} minutes`
  const hours = Math.round(minutes / 60 * 10) / 10
  if (hours < 8) return `~${hours} hours`
  return `~${Math.round(hours / 8)} days`
}

// ─── generateHints ────────────────────────────────────────────────────────────

/**
 * Generate reading hints based on what makes the code hard.
 *
 * @example
 * generateHints(breakdown) // ['Deep nesting detected...', ...]
 */
export function generateHints(breakdown: PuzzleBreakdown): string[] {
  const hints: string[] = []

  if (breakdown.nestingScore > 50) {
    hints.push('Deep nesting detected — read inside-out: start from the innermost block')
  }
  if (breakdown.complexityScore > 50) {
    hints.push('Many branches — trace one path at a time through the logic')
  }
  if (breakdown.obscurityScore > 50) {
    hints.push('Cryptic names — rename identifiers mentally as you read')
  }
  if (breakdown.controlFlowScore > 50) {
    hints.push('Complex control flow — draw a flowchart or decision tree')
  }
  if (breakdown.tokenDiversityScore > 50) {
    hints.push('High token diversity — many unique concepts in play, read slowly')
  }

  if (hints.length === 0) {
    hints.push('This code is straightforward — enjoy the read!')
  }

  return hints
}

// ─── analyzeFunctions ─────────────────────────────────────────────────────────

/**
 * Extract and score individual functions within a file.
 *
 * @example
 * analyzeFunctions(content, 'a.ts') // [FunctionPuzzle, ...]
 */
export function analyzeFunctions(content: string, _filePath: string): FunctionPuzzle[] {
  const results: FunctionPuzzle[] = []
  const lines = content.split('\n')

  let funcName = ''
  let funcStart = -1
  let funcDepth = 0
  let braceDepth = 0
  let inFunc = false
  let branchCount = 0
  let loopCount = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    const funcMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/)
      ?? line.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\(/)

    if (funcMatch && !inFunc) {
      funcName = funcMatch[1] ?? ''
      funcStart = i
      inFunc = true
      braceDepth = 0
    }

    if (inFunc) {
      for (const ch of line) {
        if (ch === '{') braceDepth++
        if (ch === '}') braceDepth--
      }
      if (braceDepth > funcDepth) funcDepth = braceDepth

      if (/\bif\b/.test(line) || /\belse\b/.test(line) || /\bcase\b/.test(line)) branchCount++
      if (/\bfor\b/.test(line) || /\bwhile\b/.test(line) || /\bdo\b/.test(line)) loopCount++

      if (braceDepth <= 0 && line.includes('}')) {
        const score = Math.min(100, Math.round((funcDepth * 8 + (branchCount + loopCount + 1) * 3 + branchCount * 2) / 2))
        results.push({
          name: funcName,
          lineStart: funcStart + 1,
          lineEnd: i + 1,
          difficulty: classifyDifficulty(score),
          score,
          nestingDepth: funcDepth,
          complexity: branchCount + loopCount + 1,
          branchCount,
          loopCount,
        })
        inFunc = false
      }
    }
  }

  return results
}

// ─── scoreFile ────────────────────────────────────────────────────────────────

/**
 * Score a single file's puzzle difficulty.
 *
 * @example
 * scoreFile('a.ts', 'complex code...') // PuzzleScore
 */
export function scoreFile(filePath: string, content: string): PuzzleScore {
  const nestingScore = computeNestingScore(content)
  const complexityScore = computeComplexityScore(content)
  const obscurityScore = computeObscurityScore(content)
  const controlFlowScore = computeControlFlowScore(content)
  const tokenDiversityScore = computeTokenDiversity(content)

  const breakdown: PuzzleBreakdown = {
    nestingScore,
    complexityScore,
    obscurityScore,
    controlFlowScore,
    tokenDiversityScore,
  }

  const score = Math.round(
    (nestingScore * 0.25 + complexityScore * 0.25 + obscurityScore * 0.2 + controlFlowScore * 0.15 + tokenDiversityScore * 0.15),
  )

  const difficulty = classifyDifficulty(score)
  const lineCount = content.split('\n').length
  const estimatedReadTime = estimateReadTime(lineCount, score)
  const hints = generateHints(breakdown)
  const functions = analyzeFunctions(content, filePath)

  return {
    file: filePath,
    difficulty,
    score: Math.min(100, Math.max(0, score)),
    breakdown,
    functions,
    estimatedReadTime,
    hints,
  }
}

// ─── buildDistribution ────────────────────────────────────────────────────────

/**
 * Count files per difficulty level.
 *
 * @example
 * buildDistribution(scores) // { trivial: 2, easy: 3, ... }
 */
export function buildDistribution(scores: PuzzleScore[]): Record<string, number> {
  const dist: Record<string, number> = {
    trivial: 0, easy: 0, medium: 0, hard: 0, expert: 0, nightmare: 0,
  }
  for (const s of scores) {
    dist[s.difficulty] = (dist[s.difficulty] ?? 0) + 1
  }
  return dist
}

// ─── buildPuzzleResult ────────────────────────────────────────────────────────

/**
 * Orchestrate full puzzle analysis.
 *
 * @example
 * buildPuzzleResult(['a.ts'], ['code...']) // PuzzleResult
 */
export function buildPuzzleResult(
  files: string[],
  contents: string[],
  _options?: PuzzleOptions,
): PuzzleResult {
  const scores: PuzzleScore[] = []

  for (let i = 0; i < files.length; i++) {
    scores.push(scoreFile(files[i]!, contents[i] ?? ''))
  }

  const leaderboard = [...scores].sort((a, b) => b.score - a.score)
  const distribution = buildDistribution(scores)

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((s, f) => s + f.score, 0) / scores.length * 10) / 10
    : 0

  const hardestFile = leaderboard[0]?.file ?? 'none'
  const easiestFile = leaderboard[leaderboard.length - 1]?.file ?? 'none'
  const nightmareCount = scores.filter((s) => s.difficulty === 'nightmare').length

  const recs: string[] = []
  if (nightmareCount > 0) {
    recs.push(`${nightmareCount} nightmare file(s) found — these are extremely hard to understand`)
  }
  const hardFiles = scores.filter((s) => s.difficulty === 'hard' || s.difficulty === 'expert')
  if (hardFiles.length > 0) {
    recs.push(`${hardFiles.length} file(s) rated hard/expert — consider refactoring for readability`)
  }
  if (avgScore > 50) {
    recs.push('Average puzzle score is high — codebase may benefit from simplification')
  }
  const highObscurity = scores.filter((s) => s.breakdown.obscurityScore > 60)
  if (highObscurity.length > 0) {
    recs.push(`${highObscurity.length} file(s) have high obscurity — improve naming conventions`)
  }
  if (recs.length === 0) {
    recs.push('Codebase puzzle scores look healthy — code is readable!')
  }

  const stats: PuzzleStats = {
    totalFiles: files.length,
    averageScore: avgScore,
    hardestFile,
    easiestFile,
    totalEstimatedReadTime: estimateReadTime(
      contents.reduce((s, c) => s + c.split('\n').length, 0),
      avgScore,
    ),
    nightmareCount,
  }

  return {
    files: scores,
    distribution,
    stats,
    leaderboard,
    recommendations: recs,
  }
}
