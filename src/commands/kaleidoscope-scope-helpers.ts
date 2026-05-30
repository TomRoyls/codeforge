// ─── Types ─────────────────────────────────────────────────────────────────────

export type ScopeLayerType = 'global' | 'module' | 'class' | 'function' | 'block' | 'loop' | 'catch' | 'with'
export type DeclKind = 'var' | 'let' | 'const' | 'function' | 'class' | 'import' | 'parameter' | 'type' | 'enum'
export type ScopeType = 'global' | 'module' | 'function' | 'block'
export type Visibility = 'public' | 'private' | 'protected' | 'internal' | 'global'
export type IssueType = 'shadow' | 'leak' | 'hoist' | 'unused' | 'global-pollution' | 'scope-creep' | 'dead-zone' | 'implicit-global'
export type IssueSeverity = 'info' | 'warning' | 'error'
export type ScopePatternName = 'tight-scope' | 'function-scoped' | 'module-scoped' | 'global-heavy' | 'block-scoped'
export type ScopeHealth = 'pristine' | 'clean' | 'acceptable' | 'messy' | 'hazardous'

export interface ScopeLayer {
  type: ScopeLayerType
  depth: number
  declarations: ScopeDeclaration[]
  isClean: boolean
  issues: ScopeIssue[]
}

export interface ScopeDeclaration {
  name: string
  kind: DeclKind
  scopeType: ScopeType
  depth: number
  isExported: boolean
  isUsed: boolean
  lineCount: number
  references: number
  visibility: Visibility
}

export interface ScopeIssue {
  type: IssueType
  name: string
  line: number
  severity: IssueSeverity
  description: string
  suggestion: string
}

export interface ScopePattern {
  name: ScopePatternName
  description: string
  files: string[]
  score: number
  color: string
}

export interface ScopeFile {
  file: string
  layers: ScopeLayer[]
  declarations: ScopeDeclaration[]
  issues: ScopeIssue[]
  maxScopeDepth: number
  avgScopeDepth: number
  scopeHygiene: number
  pattern: string
}

export interface KaleidoscopeScopeStats {
  totalDeclarations: number
  totalScopeLayers: number
  totalIssues: number
  shadows: number
  leaks: number
  hoists: number
  unused: number
  globalPollution: number
  scopeCreep: number
  avgScopeDepth: number
  maxScopeDepth: number
  avgHygiene: number
  varCount: number
  letCount: number
  constCount: number
  functionCount: number
  classCount: number
  exportedCount: number
  unusedCount: number
  dominantPattern: string
  scopeHealth: ScopeHealth
  kaleidoscopeSymmetry: number
}

export interface KaleidoscopeScopeResult {
  files: ScopeFile[]
  patterns: ScopePattern[]
  stats: KaleidoscopeScopeStats
  recommendations: string[]
}

export interface KaleidoscopeScopeOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Parse Scope Layers ────────────────────────────────────────────────────────

/**
 * Extract scope hierarchy from source content.
 *
 * @example
 * parseScopeLayers('function foo() { if (x) { } }') // => ScopeLayer[]
 */
export function parseScopeLayers(content: string): ScopeLayer[] {
  const layers: ScopeLayer[] = []
  if (content.trim().length === 0) return layers

  const lines = content.split('\n')
  let depth = 0
  const scopeStack: { type: ScopeLayerType; depth: number }[] = [{ depth: 0, type: 'module' }]

  layers.push({ type: 'module', depth: 0, declarations: [], isClean: true, issues: [] })

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const trimmed = line.trim()

    const fnMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/)
    if (fnMatch) {
      depth++

      scopeStack.push({ type: 'function', depth })
      layers.push({ type: 'function', depth, declarations: [], isClean: true, issues: [] })
      continue
    }

    const arrowMatch = trimmed.match(/^(?:export\s+)?(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\(/)
    if (arrowMatch) {
      depth++

      scopeStack.push({ type: 'function', depth })
      layers.push({ type: 'function', depth, declarations: [], isClean: true, issues: [] })
    }

    const classMatch = trimmed.match(/^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/)
    if (classMatch) {
      depth++
      scopeStack.push({ type: 'class', depth })
      layers.push({ type: 'class', depth, declarations: [], isClean: true, issues: [] })
      continue
    }

    const forMatch = trimmed.match(/^(?:for|while|do)\s*[\({]/)
    if (forMatch) {
      depth++
      scopeStack.push({ type: 'loop', depth })
      layers.push({ type: 'loop', depth, declarations: [], isClean: true, issues: [] })
    }

    const catchMatch = trimmed.match(/^catch\s*[\({]/)
    if (catchMatch) {
      depth++
      scopeStack.push({ type: 'catch', depth })
      layers.push({ type: 'catch', depth, declarations: [], isClean: true, issues: [] })
    }

    const blockOpen = (trimmed.match(/{/g) ?? []).length
    const blockClose = (trimmed.match(/}/g) ?? []).length

    const opensFromNonScope = blockOpen - (fnMatch || classMatch || forMatch || catchMatch ? 1 : 0) - (arrowMatch ? 1 : 0)
    for (let b = 0; b < opensFromNonScope; b++) {
      if (b === 0 && !(fnMatch || classMatch || forMatch || catchMatch || arrowMatch)) {
        depth++
        scopeStack.push({ type: 'block', depth })
        layers.push({ type: 'block', depth, declarations: [], isClean: true, issues: [] })
      }
    }

    for (let b = 0; b < blockClose; b++) {
      if (scopeStack.length > 1) {
        scopeStack.pop()
        depth = Math.max(0, depth - 1)
      }
    }
  }

  return layers
}

// ─── Extract Declarations ──────────────────────────────────────────────────────

/**
 * Find all declarations in source content.
 *
 * @example
 * extractDeclarations('const x = 1; let y = 2', layers) // => ScopeDeclaration[]
 */
export function extractDeclarations(content: string, _layers: ScopeLayer[]): ScopeDeclaration[] {
  const declarations: ScopeDeclaration[] = []
  if (content.trim().length === 0) return declarations

  const lines = content.split('\n')
  const nameCounts = new Map<string, number>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const trimmed = line.trim()

    const varMatch = trimmed.match(/^(?:export\s+)?var\s+(\w+)/)
    if (varMatch) {
      const name = varMatch[1] ?? ''
      declarations.push(makeDecl(name, 'var', content, i, nameCounts))
      continue
    }

    const letMatch = trimmed.match(/^(?:export\s+)?let\s+(\w+)/)
    if (letMatch) {
      const name = letMatch[1] ?? ''
      declarations.push(makeDecl(name, 'let', content, i, nameCounts))
      continue
    }

    const constMatch = trimmed.match(/^(?:export\s+)?const\s+(\w+)/)
    if (constMatch) {
      const name = constMatch[1] ?? ''
      declarations.push(makeDecl(name, 'const', content, i, nameCounts))
      continue
    }

    const fnMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/)
    if (fnMatch) {
      const name = fnMatch[1] ?? ''
      declarations.push(makeDecl(name, 'function', content, i, nameCounts))
      continue
    }

    const classMatch = trimmed.match(/^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/)
    if (classMatch) {
      const name = classMatch[1] ?? ''
      declarations.push(makeDecl(name, 'class', content, i, nameCounts))
      continue
    }

    const importMatch = trimmed.match(/^import\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from/)
    if (importMatch) {
      const namedImports = trimmed.match(/\{([^}]*)\}/)
      if (namedImports) {
        const names = namedImports[1]?.split(',').map(n => n.trim().split(/\s+as\s+/).pop()?.trim()).filter(Boolean) ?? []
        const kind: DeclKind = trimmed.includes('import type') ? 'type' : 'import'
        for (const n of names) {
          if (n) declarations.push(makeDecl(n, kind, content, i, nameCounts))
        }
      } else {
        const defaultImport = trimmed.match(/^import\s+(?:type\s+)?(\w+)/)
        if (defaultImport) {
          const name = defaultImport[1]
          if (name) declarations.push(makeDecl(name, 'import', content, i, nameCounts))
        }
        const starImport = trimmed.match(/^import\s+\*\s+as\s+(\w+)/)
        if (starImport) {
          const name = starImport[1]
          if (name) declarations.push(makeDecl(name, 'import', content, i, nameCounts))
        }
      }
      continue
    }

    const typeMatch = trimmed.match(/^(?:export\s+)?type\s+(\w+)/)
    if (typeMatch) {
      const name = typeMatch[1]
      if (name) declarations.push(makeDecl(name, 'type', content, i, nameCounts))
      continue
    }

    const enumMatch = trimmed.match(/^(?:export\s+)?enum\s+(\w+)/)
    if (enumMatch) {
      const name = enumMatch[1]
      if (name) declarations.push(makeDecl(name, 'enum', content, i, nameCounts))
      continue
    }
  }

  return declarations
}

function makeDecl(name: string, kind: DeclKind, content: string, lineIdx: number, nameCounts: Map<string, number>): ScopeDeclaration {
  const count = nameCounts.get(name) ?? 0
  nameCounts.set(name, count + 1)

  const isExported = content.split('\n')[lineIdx]?.includes('export') ?? false
  const nameRegex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'g')
  const allRefs = content.match(nameRegex) ?? []
  const references = Math.max(0, allRefs.length - 1)

  const isUsed = references > 0
  const depth = computeDeclDepth(content, lineIdx)

  const scopeType: ScopeType = kind === 'var' ? 'function' : depth === 0 ? 'module' : 'block'
  const visibility = classifyDeclarationVisibility({ name, kind, scopeType, depth, isExported, isUsed, references, lineCount: 0 })

  return {
    name,
    kind,
    scopeType,
    depth,
    isExported,
    isUsed,
    lineCount: 0,
    references,
    visibility,
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function computeDeclDepth(content: string, lineIdx: number): number {
  let depth = 0
  const lines = content.split('\n')
  for (let i = 0; i <= Math.min(lineIdx, lines.length - 1); i++) {
    const l = lines[i]
    if (!l) continue
    depth += (l.match(/{/g) ?? []).length
    depth -= (l.match(/}/g) ?? []).length
  }
  return Math.max(0, depth)
}

// ─── Detect Scope Issues ───────────────────────────────────────────────────────

/**
 * Detect scope issues in source content.
 *
 * @example
 * detectScopeIssues(content, declarations, layers) // => ScopeIssue[]
 */
export function detectScopeIssues(content: string, declarations: ScopeDeclaration[], _layers: ScopeLayer[]): ScopeIssue[] {
  const issues: ScopeIssue[] = []
  if (content.trim().length === 0) return issues

  const lines = content.split('\n')

  const namesSeen = new Map<string, number>()
  for (const decl of declarations) {
    const prev = namesSeen.get(decl.name)
    if (prev !== undefined && prev >= 1) {
      const lineNum = findDeclLine(content, decl.name, decl.kind)
      issues.push({
        type: 'shadow',
        name: decl.name,
        line: lineNum,
        severity: 'warning',
        description: `Variable '${decl.name}' shadows an outer scope declaration`,
        suggestion: `Rename the inner '${decl.name}' to avoid confusion`,
      })
    }
    namesSeen.set(decl.name, (prev ?? 0) + 1)
  }

  for (const decl of declarations) {
    if (decl.kind === 'var' && decl.depth > 1) {
      const lineNum = findDeclLine(content, decl.name, decl.kind)
      issues.push({
        type: 'leak',
        name: decl.name,
        line: lineNum,
        severity: 'warning',
        description: `var '${decl.name}' leaks out of block scope to function scope`,
        suggestion: `Replace 'var' with 'let' or 'const' for block scoping`,
      })
    }
  }

  for (const decl of declarations) {
    if (decl.kind === 'var') {
      const lineNum = findDeclLine(content, decl.name, decl.kind)
      issues.push({
        type: 'hoist',
        name: decl.name,
        line: lineNum,
        severity: 'info',
        description: `var '${decl.name}' is hoisted to function scope`,
        suggestion: `Use 'let' or 'const' to avoid hoisting surprises`,
      })
    }
  }

  for (const decl of declarations) {
    if (!decl.isUsed && decl.kind !== 'import' && decl.kind !== 'parameter' && decl.kind !== 'type') {
      const lineNum = findDeclLine(content, decl.name, decl.kind)
      issues.push({
        type: 'unused',
        name: decl.name,
        line: lineNum,
        severity: 'info',
        description: `'${decl.name}' is declared but never used`,
        suggestion: `Remove unused declaration or prefix with underscore`,
      })
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i]?.trim() ?? ''
    const implicitMatch = trimmed.match(/^(\w+)\s*=[^=]/)
    if (implicitMatch && !trimmed.startsWith('var ') && !trimmed.startsWith('let ') && !trimmed.startsWith('const ') && !trimmed.startsWith('export ') && !trimmed.startsWith('import ') && !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('function') && !trimmed.startsWith('class') && !trimmed.startsWith('type') && !trimmed.startsWith('enum') && !trimmed.startsWith('return') && !trimmed.startsWith('if') && !trimmed.startsWith('for') && !trimmed.startsWith('while') && !trimmed.startsWith('switch') && !trimmed.startsWith('case') && !trimmed.startsWith('throw') && !trimmed.startsWith('try') && !trimmed.startsWith('catch') && !trimmed.startsWith('else')) {
      const name = implicitMatch[1] ?? ''
      const isKnownDecl = declarations.some(d => d.name === name)
      if (!isKnownDecl) {
        issues.push({
          type: 'implicit-global',
          name,
          line: i + 1,
          severity: 'error',
          description: `'${name}' is implicitly global — missing declaration keyword`,
          suggestion: `Add 'const', 'let', or 'var' before '${name}'`,
        })
      }
    }
  }

  const declNameMap = new Map<string, number>()
  for (const decl of declarations) {
    declNameMap.set(decl.name, (declNameMap.get(decl.name) ?? 0) + 1)
  }

  for (const decl of declarations) {
    if (decl.references > 10 && decl.depth === 0) {
      const lineNum = findDeclLine(content, decl.name, decl.kind)
      issues.push({
        type: 'scope-creep',
        name: decl.name,
        line: lineNum,
        severity: 'warning',
        description: `'${decl.name}' is referenced ${decl.references} times across many scopes`,
        suggestion: `Consider narrowing the scope of '${decl.name}'`,
      })
    }
  }

  return issues
}

function findDeclLine(content: string, name: string, kind: DeclKind): number {
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const trimmed = line.trim()
    switch (kind) {
      case 'var': if (trimmed.match(new RegExp(`^(?:export\\s+)?var\\s+${escapeRegex(name)}\\b`))) return i + 1; break
      case 'let': if (trimmed.match(new RegExp(`^(?:export\\s+)?let\\s+${escapeRegex(name)}\\b`))) return i + 1; break
      case 'const': if (trimmed.match(new RegExp(`^(?:export\\s+)?const\\s+${escapeRegex(name)}\\b`))) return i + 1; break
      case 'function': if (trimmed.match(new RegExp(`^(?:export\\s+)?(?:async\\s+)?function\\s+${escapeRegex(name)}\\b`))) return i + 1; break
      case 'class': if (trimmed.match(new RegExp(`^(?:export\\s+)?(?:abstract\\s+)?class\\s+${escapeRegex(name)}\\b`))) return i + 1; break
      default: break
    }
  }
  return 1
}

// ─── Classify Visibility ───────────────────────────────────────────────────────

/**
 * Classify a declaration's visibility.
 *
 * @example
 * classifyDeclarationVisibility(decl) // => 'public'
 */
export function classifyDeclarationVisibility(decl: Partial<ScopeDeclaration>): Visibility {
  if (decl.isExported) return 'public'
  if (decl.kind === 'var' && (decl.depth ?? 0) === 0) return 'global'
  if ((decl.depth ?? 0) === 0 && !decl.isExported) return 'internal'
  if (decl.depth && decl.depth > 0) return 'private'
  return 'internal'
}

// ─── Scope Hygiene ─────────────────────────────────────────────────────────────

/**
 * Compute scope hygiene score 0-100.
 *
 * @example
 * computeScopeHygiene(issues, declarations) // => 85
 */
export function computeScopeHygiene(issues: ScopeIssue[], declarations: ScopeDeclaration[]): number {
  if (declarations.length === 0) return 100

  let score = 100
  for (const issue of issues) {
    switch (issue.severity) {
      case 'error': score -= 8; break
      case 'warning': score -= 4; break
      case 'info': score -= 1; break
    }
  }

  const varDecls = declarations.filter(d => d.kind === 'var').length
  score -= varDecls * 2

  const unusedDecls = declarations.filter(d => !d.isUsed).length
  score -= unusedDecls * 1

  return Math.max(0, Math.min(100, score))
}

// ─── Identify Scope Pattern ────────────────────────────────────────────────────

const PATTERN_COLORS: Record<ScopePatternName, string> = {
  'tight-scope': 'emerald',
  'function-scoped': 'amber',
  'module-scoped': 'sapphire',
  'global-heavy': 'crimson',
  'block-scoped': 'violet',
}

const PATTERN_DESC: Record<ScopePatternName, string> = {
  'tight-scope': 'All variables const/let, minimal scope, no issues',
  'function-scoped': 'Mostly function-scoped (var), older style',
  'module-scoped': 'Module-level declarations dominate',
  'global-heavy': 'Many global-level declarations',
  'block-scoped': 'Heavy use of block scoping, good modern patterns',
}

/**
 * Identify the dominant scope pattern for a file.
 *
 * @example
 * identifyScopePattern(file) // => 'tight-scope'
 */
export function identifyScopePattern(file: ScopeFile): ScopePatternName {
  const decls = file.declarations
  if (decls.length === 0) return 'module-scoped'

  const total = decls.length
  const varRatio = decls.filter(d => d.kind === 'var').length / total
  const constRatio = decls.filter(d => d.kind === 'const').length / total
  const moduleRatio = decls.filter(d => d.depth === 0).length / total
  const blockRatio = decls.filter(d => d.depth > 0 && (d.kind === 'let' || d.kind === 'const')).length / total
  const globalRatio = decls.filter(d => d.scopeType === 'global').length / total

  if (globalRatio > 0.3) return 'global-heavy'
  if (varRatio > 0.4) return 'function-scoped'
  if (moduleRatio > 0.6) return 'module-scoped'
  if (constRatio > 0.5 && blockRatio > 0.3 && file.issues.length === 0) return 'tight-scope'
  if (blockRatio > 0.4) return 'block-scoped'
  if (constRatio > 0.5) return 'tight-scope'
  if (file.issues.length === 0) return 'tight-scope'

  return 'module-scoped'
}

/**
 * Compute scope pattern score 0-100.
 *
 * @example
 * computePatternScore('tight-scope') // => 95
 */
export function computePatternScore(pattern: ScopePatternName, hygiene: number): number {
  const baseScores: Record<ScopePatternName, number> = {
    'tight-scope': 95,
    'block-scoped': 80,
    'module-scoped': 65,
    'function-scoped': 45,
    'global-heavy': 25,
  }
  return Math.max(0, Math.min(100, Math.round((baseScores[pattern] + hygiene) / 2)))
}

// ─── Kaleidoscope Symmetry ─────────────────────────────────────────────────────

/**
 * Compute kaleidoscope symmetry (pattern consistency) 0-100.
 *
 * @example
 * computeKaleidoscopeSymmetry(patterns) // => 80
 */
export function computeKaleidoscopeSymmetry(files: ScopeFile[]): number {
  if (files.length <= 1) return 100

  const patternCounts = new Map<string, number>()
  for (const f of files) {
    patternCounts.set(f.pattern, (patternCounts.get(f.pattern) ?? 0) + 1)
  }

  const dominant = Math.max(...Array.from(patternCounts.values()))
  const ratio = dominant / files.length

  const hygieneVariance = computeVariance(files.map(f => f.scopeHygiene))
  const hygieneBonus = Math.max(0, 20 - hygieneVariance)

  return Math.max(0, Math.min(100, Math.round(ratio * 80 + hygieneBonus)))
}

function computeVariance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
}

// ─── Scope Health ──────────────────────────────────────────────────────────────

/**
 * Classify overall scope health.
 *
 * @example
 * classifyScopeHealth(90, 2) // => 'pristine'
 */
export function classifyScopeHealth(avgHygiene: number, issueCount: number): ScopeHealth {
  if (avgHygiene >= 90 && issueCount === 0) return 'pristine'
  if (avgHygiene >= 80) return 'clean'
  if (avgHygiene >= 60) return 'acceptable'
  if (avgHygiene >= 35) return 'messy'
  return 'hazardous'
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate scope-based recommendations.
 *
 * @example
 * generateScopeRecommendations(files, patterns, issues, stats) // => ['Convert var...']
 */
export function generateScopeRecommendations(
  _files: ScopeFile[],
  _patterns: ScopePattern[],
  issues: ScopeIssue[],
  stats: KaleidoscopeScopeStats,
): string[] {
  const recs: string[] = []

  const shadows = issues.filter(i => i.type === 'shadow')
  if (shadows.length > 0) {
    recs.push(`Rename ${shadows.length} shadowed variable${shadows.length > 1 ? 's' : ''} to prevent scope confusion`)
  }

  const varDecls = stats.varCount
  if (varDecls > 0) {
    recs.push(`Convert ${varDecls} var declaration${varDecls > 1 ? 's' : ''} to let/const for block scoping`)
  }

  const unusedDecls = stats.unusedCount
  if (unusedDecls > 0) {
    recs.push(`Remove or prefix ${unusedDecls} unused declaration${unusedDecls > 1 ? 's' : ''} with underscore`)
  }

  const globals = issues.filter(i => i.type === 'implicit-global' || i.type === 'global-pollution')
  if (globals.length > 0) {
    recs.push(`Add proper declarations for ${globals.length} implicit global${globals.length > 1 ? 's' : ''}`)
  }

  const creepers = issues.filter(i => i.type === 'scope-creep')
  if (creepers.length > 0) {
    recs.push(`Narrow the scope of ${creepers.length} variable${creepers.length > 1 ? 's' : ''} with excessive references`)
  }

  const leaks = issues.filter(i => i.type === 'leak')
  if (leaks.length > 0) {
    recs.push(`Fix ${leaks.length} var leak${leaks.length > 1 ? 's' : ''} by switching to block-scoped declarations`)
  }

  if (stats.avgHygiene < 50) {
    recs.push('Consider a scope hygiene refactor — hygiene score is below 50')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete kaleidoscope scope result.
 *
 * @example
 * buildKaleidoscopeScopeResult(['a.ts'], ['code'], {}) // => KaleidoscopeScopeResult
 */
export function buildKaleidoscopeScopeResult(files: string[], contents: string[], options: KaleidoscopeScopeOptions): KaleidoscopeScopeResult {
  const scopeFiles: ScopeFile[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const layers = parseScopeLayers(content)
    const declarations = extractDeclarations(content, layers)
    const issues = detectScopeIssues(content, declarations, layers)
    const hygiene = computeScopeHygiene(issues, declarations)

    const depths = layers.map(l => l.depth)
    const maxDepth = depths.length > 0 ? Math.max(...depths) : 0
    const avgDepth = depths.length > 0 ? depths.reduce((s, d) => s + d, 0) / depths.length : 0

    const scopeFile: ScopeFile = {
      file: files[i] ?? '',
      layers,
      declarations,
      issues,
      maxScopeDepth: maxDepth,
      avgScopeDepth: Math.round(avgDepth * 10) / 10,
      scopeHygiene: hygiene,
      pattern: 'module-scoped',
    }

    scopeFile.pattern = identifyScopePattern(scopeFile)
    scopeFiles.push(scopeFile)
  }

  const allDeclarations = scopeFiles.flatMap(f => f.declarations)
  const allIssues = scopeFiles.flatMap(f => f.issues)

  const patternMap = new Map<ScopePatternName, { files: string[]; scores: number[] }>()
  for (const f of scopeFiles) {
    const pName = f.pattern as ScopePatternName
    const entry = patternMap.get(pName) ?? { files: [], scores: [] }
    entry.files.push(f.file)
    entry.scores.push(computePatternScore(pName, f.scopeHygiene))
    patternMap.set(pName, entry)
  }

  const patterns: ScopePattern[] = []
  for (const [name, data] of Array.from(patternMap)) {
    const avgScore = data.scores.length > 0 ? Math.round(data.scores.reduce((s, v) => s + v, 0) / data.scores.length) : 0
    patterns.push({
      name,
      description: PATTERN_DESC[name],
      files: data.files,
      score: avgScore,
      color: PATTERN_COLORS[name],
    })
  }

  const totalDeclarations = allDeclarations.length
  const totalLayers = scopeFiles.reduce((s, f) => s + f.layers.length, 0)
  const avgHygiene = scopeFiles.length > 0
    ? Math.round(scopeFiles.reduce((s, f) => s + f.scopeHygiene, 0) / scopeFiles.length) : 100
  const maxScopeDepth = scopeFiles.length > 0
    ? Math.max(...scopeFiles.map(f => f.maxScopeDepth)) : 0
  const avgScopeDepth = scopeFiles.length > 0
    ? Math.round(scopeFiles.reduce((s, f) => s + f.avgScopeDepth, 0) / scopeFiles.length * 10) / 10 : 0

  const dominantPattern = patterns.length > 0
    ? (patterns.sort((a, b) => b.files.length - a.files.length)[0] ?? { name: 'module-scoped' }).name : 'module-scoped'

  const symmetry = computeKaleidoscopeSymmetry(scopeFiles)
  const health = classifyScopeHealth(avgHygiene, allIssues.length)

  if (options.verbose) {
    void null
  }

  const stats: KaleidoscopeScopeStats = {
    totalDeclarations,
    totalScopeLayers: totalLayers,
    totalIssues: allIssues.length,
    shadows: allIssues.filter(i => i.type === 'shadow').length,
    leaks: allIssues.filter(i => i.type === 'leak').length,
    hoists: allIssues.filter(i => i.type === 'hoist').length,
    unused: allIssues.filter(i => i.type === 'unused').length,
    globalPollution: allIssues.filter(i => i.type === 'global-pollution').length,
    scopeCreep: allIssues.filter(i => i.type === 'scope-creep').length,
    avgScopeDepth,
    maxScopeDepth,
    avgHygiene,
    varCount: allDeclarations.filter(d => d.kind === 'var').length,
    letCount: allDeclarations.filter(d => d.kind === 'let').length,
    constCount: allDeclarations.filter(d => d.kind === 'const').length,
    functionCount: allDeclarations.filter(d => d.kind === 'function').length,
    classCount: allDeclarations.filter(d => d.kind === 'class').length,
    exportedCount: allDeclarations.filter(d => d.isExported).length,
    unusedCount: allDeclarations.filter(d => !d.isUsed).length,
    dominantPattern,
    scopeHealth: health,
    kaleidoscopeSymmetry: symmetry,
  }

  const recommendations = generateScopeRecommendations(scopeFiles, patterns, allIssues, stats)

  return { files: scopeFiles, patterns, stats, recommendations }
}
