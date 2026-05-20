// ─── Types ────────────────────────────────────────────────────────────────────

export interface LabyrinthPath {
  file: string
  startLine: number
  endLine: number
  type: 'corridor' | 'branch' | 'loop' | 'dead-end' | 'shortcut' | 'trap' | 'spiral'
  length: number
  branches: number
  depth: number
  complexity: number
  navigability: number
  isWellLit: boolean
}

export interface MinotaurPoint {
  file: string
  line: number
  type: 'decision-fork' | 'switch-maze' | 'callback-vortex' | 'inheritance-depth' | 'call-chain'
  complexity: number
  incomingPaths: number
  outgoingPaths: number
  description: string
  dangerLevel: 'tame' | 'caution' | 'dangerous' | 'deadly'
  threadRequired: boolean
}

export interface DeadEnd {
  file: string
  line: number
  type: 'unreachable' | 'unused-return' | 'infinite-loop-risk' | 'abandoned-code' | 'phantom-branch'
  description: string
  severity: 'minor' | 'moderate' | 'major'
}

export interface LabyrinthFile {
  file: string
  paths: LabyrinthPath[]
  minotaurs: MinotaurPoint[]
  deadEnds: DeadEnd[]
  totalCorridors: number
  totalBranches: number
  maxDepth: number
  navigability: number
  threadScore: number
  complexity: number
  lighting: number
  classification: 'well-lit-corridor' | 'structured-maze' | 'twisting-passage' | 'dark-labyrinth' | 'inescapable-maze'
}

export interface LabyrinthStats {
  totalPaths: number
  corridors: number
  branches: number
  deadEnds: number
  spirals: number
  shortcuts: number
  traps: number
  totalMinotaurs: number
  deadlyMinotaurs: number
  totalDeadEnds: number
  avgNavigability: number
  avgThreadScore: number
  avgComplexity: number
  avgLighting: number
  wellLitFiles: number
  darkLabyrinthFiles: number
  inescapableMazeFiles: number
  overallNavigability: number
  labyrinthScore: number
  threadReliability: number
  classification: 'crystal-palace' | 'garden-maze' | 'medieval-castle' | 'minotaur-labyrinth' | 'eldritch-horror'
}

export interface LabyrinthResult {
  files: LabyrinthFile[]
  stats: LabyrinthStats
  recommendations: string[]
}

// ─── Path Mapping ──────────────────────────────────────────────────────────────

/**
 * Map all code paths in a file
 * @example
 * mapPaths('if (x) { foo() }', 'a.ts') // LabyrinthPath[]
 */
export function mapPaths(content: string, filePath: string): LabyrinthPath[] {
  const paths: LabyrinthPath[] = []
  const lines = content.split('\n')
  const lighting = computeLighting(content)

  const ifMatches = Array.from(content.matchAll(/\bif\s*\(/g))
  for (const m of ifMatches) {
    const line = content.slice(0, m.index).split('\n').length
    const complexity = computeBranchComplexity(content, m.index ?? 0)
    const navigability = Math.max(0, 100 - complexity)
    const isDocumented = isLineDocumented(lines, line - 1)
    paths.push({
      file: filePath,
      startLine: line,
      endLine: line,
      type: 'branch',
      length: 1,
      branches: countBranchesNearby(content, m.index ?? 0),
      depth: computeNestingDepth(content, m.index ?? 0),
      complexity,
      navigability,
      isWellLit: isDocumented,
    })
  }

  const switchMatches = Array.from(content.matchAll(/\bswitch\s*\(/g))
  for (const m of switchMatches) {
    const line = content.slice(0, m.index).split('\n').length
    const cases = (content.slice(m.index).match(/\bcase\b|\bdefault\b/g) || []).length
    paths.push({
      file: filePath,
      startLine: line,
      endLine: line,
      type: 'branch',
      length: cases,
      branches: cases,
      depth: computeNestingDepth(content, m.index ?? 0),
      complexity: Math.min(100, cases * 15),
      navigability: Math.max(0, 100 - cases * 12),
      isWellLit: isLineDocumented(lines, line - 1),
    })
  }

  const loopMatches = Array.from(content.matchAll(/\b(for|while)\s*[\(\{]/g))
  for (const m of loopMatches) {
    const line = content.slice(0, m.index).split('\n').length
    const isSpiral = isPotentiallyInfinite(content, m.index ?? 0)
    paths.push({
      file: filePath,
      startLine: line,
      endLine: line,
      type: isSpiral ? 'spiral' : 'loop',
      length: 1,
      branches: 0,
      depth: computeNestingDepth(content, m.index ?? 0),
      complexity: isSpiral ? 60 : 25,
      navigability: isSpiral ? 20 : 70,
      isWellLit: isLineDocumented(lines, line - 1),
    })
  }

  const earlyReturns = Array.from(content.matchAll(/\breturn\b/g))
  for (const m of earlyReturns) {
    const line = content.slice(0, m.index).split('\n').length
    const isEarlyReturn = isGuardClause(lines, line - 1)
    if (isEarlyReturn) {
      paths.push({
        file: filePath,
        startLine: line,
        endLine: line,
        type: 'shortcut',
        length: 1,
        branches: 0,
        depth: computeNestingDepth(content, m.index ?? 0),
        complexity: 5,
        navigability: 95,
        isWellLit: isLineDocumented(lines, line - 1),
      })
    }
  }

  const corridors = findCorridors(lines, filePath, lighting)
  paths.push(...corridors)

  const traps = findTraps(content, filePath, lines)
  paths.push(...traps)

  return paths
}

/**
 * Compute branch complexity from position
 * @example
 * computeBranchComplexity('if (a && b || c)', 0) // 40
 */
export function computeBranchComplexity(content: string, pos: number): number {
  const end = Math.min(content.length, pos + 200)
  const condition = content.slice(pos, end).match(/\(([^)]*)\)/)?.[1] || ''
  const operators = (condition.match(/&&|\|\||\?/g) || []).length
  return Math.min(100, 10 + operators * 15)
}

/**
 * Count branches nearby a position
 * @example
 * countBranchesNearby('if (x) {} if (y) {}', 0) // 2
 */
export function countBranchesNearby(content: string, pos: number): number {
  const start = Math.max(0, pos - 200)
  const end = Math.min(content.length, pos + 200)
  const region = content.slice(start, end)
  return (region.match(/\b(if|else|switch|case|for|while)\b/g) || []).length
}

/**
 * Compute nesting depth at position
 * @example
 * computeNestingDepth('{ { if (x) {} } }', 6) // 2
 */
export function computeNestingDepth(content: string, pos: number): number {
  let depth = 0
  for (let i = 0; i < pos && i < content.length; i++) {
    if (content[i] === '{') depth++
    if (content[i] === '}') depth = Math.max(0, depth - 1)
  }
  return depth
}

/**
 * Check if a loop might be infinite
 * @example
 * isPotentiallyInfinite('while (true) {}', 0) // true
 */
export function isPotentiallyInfinite(content: string, pos: number): boolean {
  const end = Math.min(content.length, pos + 300)
  const block = content.slice(pos, end)
  if (/\bwhile\s*\(\s*true\s*\)/.test(block)) return true
  if (/\bwhile\s*\(\s*1\s*\)/.test(block)) return true
  if (/for\s*\(\s*;\s*;\s*\)/.test(block)) return true
  if (/\bwhile\s*\([^)]*\)/.test(block) && !/\bbreak\b/.test(block)) return true
  return false
}

/**
 * Check if a return is a guard clause (early return)
 * @example
 * isGuardClause(['if (!x) return'], 0) // true
 */
export function isGuardClause(lines: string[], lineIdx: number): boolean {
  if (lineIdx < 0 || lineIdx >= lines.length) return false
  const line = lines[lineIdx]
  return /^\s*(if\s*\(.+\)\s*\{?\s*return|if\s*\(.+\)\s*return)/.test(line) ||
    /^\s*return\s+/.test(line) && lineIdx < lines.length / 2
}

/**
 * Check if a line is documented
 * @example
 * isLineDocumented(['// comment', 'if (x) {}'], 1) // true
 */
export function isLineDocumented(lines: string[], lineIdx: number): boolean {
  if (lineIdx <= 0) return false
  const prev = lines[lineIdx - 1]?.trim() || ''
  return prev.startsWith('//') || prev.startsWith('*') || prev.endsWith('*/')
}

/**
 * Find sequential corridors in code
 * @example
 * findCorridors(lines, 'a.ts', 50) // LabyrinthPath[]
 */
export function findCorridors(lines: string[], filePath: string, lighting: number): LabyrinthPath[] {
  const corridors: LabyrinthPath[] = []
  let start = -1

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const isControlFlow = /^\s*(if|else|for|while|switch|try|catch|function|class|return|throw|break|continue)\b/.test(trimmed)
    const isBlank = trimmed.length === 0

    if (!isControlFlow && !isBlank && start === -1) {
      start = i
    } else if ((isControlFlow || isBlank) && start !== -1) {
      if (i - start >= 2) {
        corridors.push({
          file: filePath,
          startLine: start + 1,
          endLine: i,
          type: 'corridor',
          length: i - start,
          branches: 0,
          depth: 0,
          complexity: 5,
          navigability: 90,
          isWellLit: lighting > 50,
        })
      }
      start = -1
    }
  }

  if (start !== -1 && lines.length - start >= 2) {
    corridors.push({
      file: filePath,
      startLine: start + 1,
      endLine: lines.length,
      type: 'corridor',
      length: lines.length - start,
      branches: 0,
      depth: 0,
      complexity: 5,
      navigability: 90,
      isWellLit: lighting > 50,
    })
  }

  return corridors
}

/**
 * Find trap patterns — misleading or tricky code
 * @example
 * findTraps('if (x = 5) {}', 'a.ts', lines) // [{ type: 'trap' }]
 */
export function findTraps(content: string, filePath: string, lines: string[]): LabyrinthPath[] {
  const traps: LabyrinthPath[] = []

  const assignmentInCondition = Array.from(content.matchAll(/\bif\s*\([^)]*[^=!<>]=[^=][^)]*\)/g))
  for (const m of assignmentInCondition) {
    const line = content.slice(0, m.index).split('\n').length
    traps.push({
      file: filePath,
      startLine: line,
      endLine: line,
      type: 'trap',
      length: 1,
      branches: 0,
      depth: computeNestingDepth(content, m.index ?? 0),
      complexity: 40,
      navigability: 20,
      isWellLit: isLineDocumented(lines, line - 1),
    })
  }

  const doubleNegation = Array.from(content.matchAll(/!!/g))
  for (const m of doubleNegation) {
    const line = content.slice(0, m.index).split('\n').length
    traps.push({
      file: filePath,
      startLine: line,
      endLine: line,
      type: 'trap',
      length: 1,
      branches: 0,
      depth: computeNestingDepth(content, m.index ?? 0),
      complexity: 30,
      navigability: 30,
      isWellLit: isLineDocumented(lines, line - 1),
    })
  }

  return traps
}

// ─── Minotaur Point Detection ─────────────────────────────────────────────────

/**
 * Find minotaur points (complex intersections)
 * @example
 * findMinotaurPoints('if (a) { if (b) { if (c) {} } }', 'a.ts') // MinotaurPoint[]
 */
export function findMinotaurPoints(content: string, filePath: string): MinotaurPoint[] {
  const minotaurs: MinotaurPoint[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const depth = computeNestingDepth(content, content.split('\n').slice(0, i).join('\n').length)

    if (depth >= 4 && /\b(if|for|while|switch)\b/.test(line)) {
      const forks = (line.match(/&&|\|\|/g) || []).length + 1
      minotaurs.push({
        file: filePath,
        line: i + 1,
        type: 'decision-fork',
        complexity: Math.min(100, depth * 15 + forks * 5),
        incomingPaths: forks,
        outgoingPaths: 2,
        description: `Decision fork at depth ${depth} with ${forks} condition(s)`,
        dangerLevel: depth >= 6 ? 'deadly' : depth >= 5 ? 'dangerous' : 'caution',
        threadRequired: depth >= 5,
      })
    }
  }

  const switchMatches = Array.from(content.matchAll(/\bswitch\s*\(/g))
  for (const m of switchMatches) {
    const line = content.slice(0, m.index).split('\n').length
    const block = content.slice(m.index)
    const cases = (block.match(/\bcase\b/g) || []).length
    if (cases >= 5) {
      minotaurs.push({
        file: filePath,
        line,
        type: 'switch-maze',
        complexity: Math.min(100, cases * 10),
        incomingPaths: 1,
        outgoingPaths: cases,
        description: `Switch with ${cases} cases`,
        dangerLevel: cases >= 10 ? 'deadly' : cases >= 7 ? 'dangerous' : 'caution',
        threadRequired: cases >= 8,
      })
    }
  }

  const callbackDepth = measureCallbackDepth(content)
  if (callbackDepth >= 3) {
    minotaurs.push({
      file: filePath,
      line: 1,
      type: 'callback-vortex',
      complexity: Math.min(100, callbackDepth * 20),
      incomingPaths: callbackDepth,
      outgoingPaths: callbackDepth,
      description: `Callback vortex of depth ${callbackDepth}`,
      dangerLevel: callbackDepth >= 5 ? 'deadly' : callbackDepth >= 4 ? 'dangerous' : 'caution',
      threadRequired: callbackDepth >= 4,
    })
  }

  const extendsMatches = Array.from(content.matchAll(/\bextends\s+/g))
  const chainLength = extendsMatches.length
  if (chainLength >= 3) {
    minotaurs.push({
      file: filePath,
      line: extendsMatches[0] ? content.slice(0, extendsMatches[0].index).split('\n').length : 1,
      type: 'inheritance-depth',
      complexity: Math.min(100, chainLength * 20),
      incomingPaths: chainLength,
      outgoingPaths: chainLength,
      description: `Inheritance chain of depth ${chainLength}`,
      dangerLevel: chainLength >= 5 ? 'deadly' : chainLength >= 4 ? 'dangerous' : 'caution',
      threadRequired: chainLength >= 4,
    })
  }

  const callChainMatches = Array.from(content.matchAll(/\.\w+\(\s*\)\s*\.\w+\(/g))
  for (const m of callChainMatches) {
    const line = content.slice(0, m.index).split('\n').length
    const chain = content.slice(m.index, Math.min(content.length, m.index + 100))
    const links = (chain.match(/\.\w+\(/g) || []).length
    if (links >= 4) {
      minotaurs.push({
        file: filePath,
        line,
        type: 'call-chain',
        complexity: Math.min(100, links * 12),
        incomingPaths: 1,
        outgoingPaths: links,
        description: `Method chain of length ${links}`,
        dangerLevel: links >= 7 ? 'deadly' : links >= 5 ? 'dangerous' : 'caution',
        threadRequired: links >= 6,
      })
    }
  }

  return minotaurs
}

/**
 * Measure callback nesting depth
 * @example
 * measureCallbackDepth('a(() => { b(() => { }) })') // 2
 */
export function measureCallbackDepth(content: string): number {
  let maxDepth = 0
  let depth = 0
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') {
      depth++
      if (depth > maxDepth) maxDepth = depth
    }
    if (content[i] === '}') {
      depth = Math.max(0, depth - 1)
    }
  }
  const callbacks = (content.match(/\(.*?\)\s*=>\s*\{|function\s*\(.*?\)\s*\{/g) || []).length
  return maxDepth > 4 && callbacks >= 3 ? Math.min(callbacks, maxDepth) : 0
}

// ─── Dead End Detection ───────────────────────────────────────────────────────

/**
 * Find dead ends in code
 * @example
 * findDeadEnds('return x\nfoo()', 'a.ts') // [{ type: 'unreachable' }]
 */
export function findDeadEnds(content: string, filePath: string): DeadEnd[] {
  const deadEnds: DeadEnd[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length - 1; i++) {
    const trimmed = lines[i].trim()
    if (/^\s*(return|throw)\b/.test(trimmed) && !trimmed.includes('}')) {
      const nextTrimmed = lines[i + 1]?.trim() || ''
      if (nextTrimmed.length > 0 && !/^\s*[}\])]/.test(nextTrimmed) && !/^\s*(catch|finally|else)\b/.test(nextTrimmed)) {
        deadEnds.push({
          file: filePath,
          line: i + 2,
          type: 'unreachable',
          description: `Code after ${trimmed.split(' ')[0]} at line ${i + 1} is unreachable`,
          severity: 'major',
        })
      }
    }
  }

  const whileTrue = Array.from(content.matchAll(/\bwhile\s*\(\s*true\s*\)/g))
  for (const m of whileTrue) {
    const line = content.slice(0, m.index).split('\n').length
    const block = content.slice(m.index ?? 0, Math.min(content.length, (m.index ?? 0) + 500))
    if (!/\bbreak\b/.test(block)) {
      deadEnds.push({
        file: filePath,
        line,
        type: 'infinite-loop-risk',
        description: 'while(true) without break may cause infinite loop',
        severity: 'major',
      })
    }
  }

  const todoFixme = Array.from(content.matchAll(/\/\/\s*(TODO|FIXME|HACK|XXX)\b/gi))
  for (const m of todoFixme) {
    const line = content.slice(0, m.index).split('\n').length
    deadEnds.push({
      file: filePath,
      line,
      type: 'abandoned-code',
      description: `${m[1]} marker found: ${lines[line - 1]?.trim()}`,
      severity: 'minor',
    })
  }

  const ifFalse = Array.from(content.matchAll(/\bif\s*\(\s*(false|0|null|undefined|!true)\s*\)/g))
  for (const m of ifFalse) {
    const line = content.slice(0, m.index).split('\n').length
    deadEnds.push({
      file: filePath,
      line,
      type: 'phantom-branch',
      description: `Branch condition is always false: ${m[0]}`,
      severity: 'moderate',
    })
  }

  return deadEnds
}

// ─── Score Computation ─────────────────────────────────────────────────────────

/**
 * Compute navigability score (0-100)
 * @example
 * computeNavigability(paths, minotaurs, 60) // 75
 */
export function computeNavigability(paths: LabyrinthPath[], minotaurs: MinotaurPoint[], lighting: number): number {
  if (paths.length === 0) return 100

  const avgNav = paths.reduce((s, p) => s + p.navigability, 0) / paths.length
  const minotaurPenalty = minotaurs.reduce((s, m) => s + (m.dangerLevel === 'deadly' ? 15 : m.dangerLevel === 'dangerous' ? 8 : m.dangerLevel === 'caution' ? 3 : 0), 0)
  const lightingBonus = lighting * 0.1

  return Math.max(0, Math.min(100, Math.round(avgNav - minotaurPenalty + lightingBonus)))
}

/**
 * Compute thread score — can you trace through (0-100)
 * @example
 * computeThreadScore(paths, minotaurs) // 70
 */
export function computeThreadScore(paths: LabyrinthPath[], minotaurs: MinotaurPoint[]): number {
  if (paths.length === 0) return 100

  const shortcuts = paths.filter(p => p.type === 'shortcut').length
  const traps = paths.filter(p => p.type === 'trap').length
  const spirals = paths.filter(p => p.type === 'spiral').length
  const avgComplexity = paths.reduce((s, p) => s + p.complexity, 0) / paths.length
  const threadRequired = minotaurs.filter(m => m.threadRequired).length

  let score = 80
  score += shortcuts * 3
  score -= traps * 10
  score -= spirals * 8
  score -= threadRequired * 10
  score -= avgComplexity * 0.3

  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Compute lighting (documentation coverage) 0-100
 * @example
 * computeLighting('// comment\n// code') // 100
 */
export function computeLighting(content: string): number {
  if (content.length === 0) return 100
  const lines = content.split('\n')
  const totalLines = lines.length

  const docLines = lines.filter(l => {
    const t = l.trim()
    return t.startsWith('//') || t.startsWith('*') || t.startsWith('/**') || t.startsWith('*/')
  }).length

  const jsdoc = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  const jsdocBonus = Math.min(20, jsdoc * 5)

  return Math.min(100, Math.round((docLines / totalLines) * 100 + jsdocBonus))
}

/**
 * Compute file complexity score (0-100)
 * @example
 * computeFileComplexity(paths, minotaurs) // 45
 */
export function computeFileComplexity(paths: LabyrinthPath[], minotaurs: MinotaurPoint[]): number {
  if (paths.length === 0) return 0
  const avgPathComplexity = paths.reduce((s, p) => s + p.complexity, 0) / paths.length
  const minotaurComplexity = minotaurs.reduce((s, m) => s + m.complexity, 0)
  const maxDepth = Math.max(...paths.map(p => p.depth), 0)
  return Math.min(100, Math.round(avgPathComplexity * 0.5 + minotaurComplexity * 0.3 + maxDepth * 3))
}

/**
 * Classify a labyrinth file
 * @example
 * classifyLabyrinthFile(80, 20, 70) // 'well-lit-corridor'
 */
export function classifyLabyrinthFile(
  navigability: number,
  complexity: number,
  lighting: number,
): LabyrinthFile['classification'] {
  if (navigability >= 70 && lighting >= 60) return 'well-lit-corridor'
  if (navigability >= 50 && complexity <= 40) return 'structured-maze'
  if (navigability >= 30 && complexity <= 60) return 'twisting-passage'
  if (complexity >= 70 && lighting < 30) return 'inescapable-maze'
  if (complexity >= 50 || navigability < 30) return 'dark-labyrinth'
  return 'twisting-passage'
}

/**
 * Compute labyrinth score (0-100, lower is better)
 * @example
 * computeLabyrinthScore(files) // 35
 */
export function computeLabyrinthScore(files: LabyrinthFile[]): number {
  if (files.length === 0) return 0

  const avgComplexity = files.reduce((s, f) => s + f.complexity, 0) / files.length
  const avgNav = files.reduce((s, f) => s + f.navigability, 0) / files.length
  const avgThread = files.reduce((s, f) => s + f.threadScore, 0) / files.length
  const darkFiles = files.filter(f => f.classification === 'dark-labyrinth' || f.classification === 'inescapable-maze').length
  const darkPenalty = darkFiles * 10

  return Math.max(0, Math.min(100, Math.round(avgComplexity * 0.4 + (100 - avgNav) * 0.3 + (100 - avgThread) * 0.2 + darkPenalty)))
}

/**
 * Compute thread reliability (0-100)
 * @example
 * computeThreadReliability(files) // 80
 */
export function computeThreadReliability(files: LabyrinthFile[]): number {
  if (files.length === 0) return 100
  return Math.round(files.reduce((s, f) => s + f.threadScore, 0) / files.length)
}

/**
 * Classify overall labyrinth
 * @example
 * classifyOverall(20, 80, 85) // 'crystal-palace'
 */
export function classifyOverall(
  labyrinthScore: number,
  navigability: number,
  threadReliability: number,
): LabyrinthStats['classification'] {
  const combined = (navigability + threadReliability) / 2
  if (labyrinthScore <= 20 && combined >= 80) return 'crystal-palace'
  if (labyrinthScore <= 35 && combined >= 60) return 'garden-maze'
  if (labyrinthScore <= 50) return 'medieval-castle'
  if (labyrinthScore <= 70) return 'minotaur-labyrinth'
  return 'eldritch-horror'
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate labyrinth improvement recommendations
 * @example
 * generateRecommendations(files, paths, minotaurs, deadEnds, stats) // ['Remove dead ends...']
 */
export function generateRecommendations(
  files: LabyrinthFile[],
  _paths: LabyrinthPath[],
  minotaurs: MinotaurPoint[],
  deadEnds: DeadEnd[],
  stats: LabyrinthStats,
): string[] {
  const recs: string[] = []

  const unreachable = deadEnds.filter(d => d.type === 'unreachable')
  if (unreachable.length > 0) {
    recs.push(`Remove ${unreachable.length} unreachable code segment(s) to simplify paths`)
  }

  const deadly = minotaurs.filter(m => m.dangerLevel === 'deadly' || m.dangerLevel === 'dangerous')
  if (deadly.length > 0) {
    recs.push(`Simplify ${deadly.length} complex intersection(s) — consider extracting methods`)
  }

  const dark = files.filter(f => f.classification === 'dark-labyrinth')
  if (dark.length > 0) {
    recs.push(`Add documentation to ${dark.length} dark labyrinth file(s) for better navigation`)
  }

  const spirals = deadEnds.filter(d => d.type === 'infinite-loop-risk')
  if (spirals.length > 0) {
    recs.push(`Add termination conditions to ${spirals.length} spiral/loop pattern(s)`)
  }

  const inescapable = files.filter(f => f.classification === 'inescapable-maze')
  if (inescapable.length > 0) {
    recs.push(`Refactor ${inescapable.length} inescapable maze(s) — break into smaller, testable functions`)
  }

  if (stats.avgLighting < 20) {
    recs.push('Low documentation coverage — add comments to illuminate dark passages')
  }

  if (stats.threadReliability < 40) {
    recs.push('Low thread reliability — code is hard to trace, consider simplifying control flow')
  }

  const abandoned = deadEnds.filter(d => d.type === 'abandoned-code')
  if (abandoned.length > 3) {
    recs.push(`Address ${abandoned.length} TODO/FIXME marker(s) — abandoned code adds confusion`)
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the complete labyrinth analysis result
 * @example
 * buildLabyrinthResult(['src/a.ts'], ['if (x) { foo() }'], {}) // LabyrinthResult
 */
export function buildLabyrinthResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): LabyrinthResult {
  const labyrinthFiles: LabyrinthFile[] = []
  const allPaths: LabyrinthPath[] = []
  const allMinotaurs: MinotaurPoint[] = []
  const allDeadEnds: DeadEnd[] = []

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]
    const content = contents[i]

    const paths = mapPaths(content, filePath)
    const minotaurs = findMinotaurPoints(content, filePath)
    const deadEnds = findDeadEnds(content, filePath)
    const lighting = computeLighting(content)
    const navigability = computeNavigability(paths, minotaurs, lighting)
    const threadScore = computeThreadScore(paths, minotaurs)
    const complexity = computeFileComplexity(paths, minotaurs)
    const maxDepth = paths.length > 0 ? Math.max(...paths.map(p => p.depth)) : 0
    const classification = classifyLabyrinthFile(navigability, complexity, lighting)

    const lf: LabyrinthFile = {
      file: filePath,
      paths,
      minotaurs,
      deadEnds,
      totalCorridors: paths.filter(p => p.type === 'corridor').length,
      totalBranches: paths.filter(p => p.type === 'branch').length,
      maxDepth,
      navigability,
      threadScore,
      complexity,
      lighting,
      classification,
    }

    labyrinthFiles.push(lf)
    allPaths.push(...paths)
    allMinotaurs.push(...minotaurs)
    allDeadEnds.push(...deadEnds)
  }

  const avgNavigability = labyrinthFiles.length > 0
    ? Math.round(labyrinthFiles.reduce((s, f) => s + f.navigability, 0) / labyrinthFiles.length * 10) / 10
    : 100
  const avgThreadScore = labyrinthFiles.length > 0
    ? Math.round(labyrinthFiles.reduce((s, f) => s + f.threadScore, 0) / labyrinthFiles.length * 10) / 10
    : 100
  const avgComplexity = labyrinthFiles.length > 0
    ? Math.round(labyrinthFiles.reduce((s, f) => s + f.complexity, 0) / labyrinthFiles.length * 10) / 10
    : 0
  const avgLighting = labyrinthFiles.length > 0
    ? Math.round(labyrinthFiles.reduce((s, f) => s + f.lighting, 0) / labyrinthFiles.length * 10) / 10
    : 100

  const labyrinthScore = computeLabyrinthScore(labyrinthFiles)
  const threadReliability = computeThreadReliability(labyrinthFiles)
  const overallNavigability = Math.round(avgNavigability)

  const stats: LabyrinthStats = {
    totalPaths: allPaths.length,
    corridors: allPaths.filter(p => p.type === 'corridor').length,
    branches: allPaths.filter(p => p.type === 'branch').length,
    deadEnds: allPaths.filter(p => p.type === 'dead-end').length,
    spirals: allPaths.filter(p => p.type === 'spiral').length,
    shortcuts: allPaths.filter(p => p.type === 'shortcut').length,
    traps: allPaths.filter(p => p.type === 'trap').length,
    totalMinotaurs: allMinotaurs.length,
    deadlyMinotaurs: allMinotaurs.filter(m => m.dangerLevel === 'deadly').length,
    totalDeadEnds: allDeadEnds.length,
    avgNavigability,
    avgThreadScore,
    avgComplexity,
    avgLighting,
    wellLitFiles: labyrinthFiles.filter(f => f.classification === 'well-lit-corridor').length,
    darkLabyrinthFiles: labyrinthFiles.filter(f => f.classification === 'dark-labyrinth').length,
    inescapableMazeFiles: labyrinthFiles.filter(f => f.classification === 'inescapable-maze').length,
    overallNavigability,
    labyrinthScore,
    threadReliability,
    classification: classifyOverall(labyrinthScore, overallNavigability, threadReliability),
  }

  const recommendations = generateRecommendations(labyrinthFiles, allPaths, allMinotaurs, allDeadEnds, stats)

  return { files: labyrinthFiles, stats, recommendations }
}
