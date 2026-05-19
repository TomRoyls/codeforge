// ─── Interfaces ──────────────────────────────────────────

export interface DebtItem {
  file: string
  line: number
  type: string
  description: string
  effort: number
  priority: 'high' | 'medium' | 'low'
}

export interface DebtCategory {
  name: string
  score: number
  weight: number
  items: DebtItem[]
  description: string
}

export interface RepaymentAction {
  priority: 'high' | 'medium' | 'low'
  category: string
  action: string
  effort: number
  impact: string
}

export interface DebtScore {
  total: number
  grade: string
  categories: DebtCategory[]
  totalItems: number
  estimatedEffort: number
  repaymentPlan: RepaymentAction[]
}

export interface TechDebtOptions {
  ignorePatterns: string[]
  extensions: string[] | null
}

export interface FileContent {
  filePath: string
  content: string
  lines: number
}

// ─── Grade computation ────────────────────────────────────

/**
 * Convert a numeric debt score (0-100) to a letter grade.
 *
 * @example
 * ```ts
 * scoreToGrade(10) // 'A'
 * scoreToGrade(50) // 'C'
 * scoreToGrade(90) // 'F'
 * ```
 */
export function scoreToGrade(score: number): string {
  if (score <= 20) return 'A'
  if (score <= 35) return 'B'
  if (score <= 55) return 'C'
  if (score <= 75) return 'D'
  return 'F'
}

// ─── Complexity assessment ────────────────────────────────

/**
 * Assess cyclomatic complexity, deep nesting, and long functions.
 *
 * @example
 * ```ts
 * const cat = assessComplexity(files)
 * console.log(cat.score)
 * ```
 */
export function assessComplexity(files: FileContent[]): DebtCategory {
  const items: DebtItem[] = []

  for (const file of files) {
    const lines = file.content.split('\n')
    let nesting = 0
    let maxNesting = 0
    let fnStartLine = -1
    let fnLineCount = 0

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim()

      for (const ch of trimmed) {
        if (ch === '{') {
          nesting++
          if (nesting > maxNesting) maxNesting = nesting
        }
        if (ch === '}') {
          nesting = Math.max(0, nesting - 1)
        }
      }

      const isFnStart =
        trimmed.includes('function ') ||
        trimmed.match(/const\s+\w+\s*=\s*(async\s+)?\(/) !== null ||
        trimmed.match(/const\s+\w+\s*=\s*(async\s+)?\(/) !== null

      if (isFnStart && fnStartLine === -1) {
        fnStartLine = i + 1
        fnLineCount = 1
      } else if (fnStartLine !== -1) {
        fnLineCount++
      }

      if (fnStartLine !== -1 && fnLineCount > 50) {
        items.push({
          description: `Long function (${fnLineCount} lines)`,
          effort: 2,
          file: file.filePath,
          line: fnStartLine,
          priority: 'medium',
          type: 'long-function',
        })
        fnStartLine = -1
        fnLineCount = 0
      }

      if (maxNesting > 4 && nesting === maxNesting) {
        items.push({
          description: `Deep nesting (level ${maxNesting})`,
          effort: 1,
          file: file.filePath,
          line: i + 1,
          priority: 'high',
          type: 'deep-nesting',
        })
      }
    }

    let branchCount = 1
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('if ') || trimmed.startsWith('if(')) branchCount++
      if (trimmed.startsWith('else if ') || trimmed.startsWith('else if(')) branchCount++
      if (trimmed.includes('case ')) branchCount++
      if (trimmed.includes('&&') || trimmed.includes('||')) branchCount++
    }

    if (branchCount > 10) {
      items.push({
        description: `High cyclomatic complexity (~${branchCount})`,
        effort: 3,
        file: file.filePath,
        line: 1,
        priority: 'high',
        type: 'complexity',
      })
    }
  }

  const rawScore = Math.min(100, items.length * 8)
  return {
    description: 'Code complexity: cyclomatic complexity, nesting depth, function length',
    items,
    name: 'complexity',
    score: rawScore,
    weight: 0.20,
  }
}

// ─── Testing assessment ───────────────────────────────────

/**
 * Assess test coverage by analyzing source-to-test file ratio.
 *
 * @example
 * ```ts
 * const cat = assessTesting(files)
 * console.log(cat.items.length)
 * ```
 */
export function assessTesting(files: FileContent[]): DebtCategory {
  const items: DebtItem[] = []
  const sourceFiles = files.filter(
    (f) =>
      !f.filePath.includes('.test.') &&
      !f.filePath.includes('.spec.') &&
      !f.filePath.includes('__tests__'),
  )
  const testFiles = files.filter(
    (f) =>
      f.filePath.includes('.test.') ||
      f.filePath.includes('.spec.') ||
      f.filePath.includes('__tests__'),
  )

  if (sourceFiles.length === 0) {
    return {
      description: 'Test coverage: source/test file ratio and missing tests',
      items: [],
      name: 'testing',
      score: 0,
      weight: 0.20,
    }
  }

  const testFileNames = new Set(testFiles.map((f) => f.filePath))

  for (const src of sourceFiles) {
    const base = src.filePath.replace(/\.[^.]+$/, '')
    const hasTest =
      testFileNames.has(`${base}.test.ts`) ||
      testFileNames.has(`${base}.test.js`) ||
      testFileNames.has(`${base}.spec.ts`) ||
      testFileNames.has(`${base}.spec.js`) ||
      testFileNames.has(src.filePath.replace(/^.*\//, '').replace(/\.[^.]+$/, '.test.ts'))

    if (!hasTest && testFiles.length === 0) {
      items.push({
        description: `No test file for ${src.filePath}`,
        effort: 2,
        file: src.filePath,
        line: 0,
        priority: 'medium',
        type: 'missing-test',
      })
    }
  }

  const ratio = testFiles.length / sourceFiles.length
  let rawScore: number
  if (ratio >= 0.8) {
    rawScore = Math.max(0, (1 - ratio) * 20)
  } else if (ratio >= 0.5) {
    rawScore = 30 + (0.8 - ratio) * 100
  } else {
    rawScore = 60 + (0.5 - ratio) * 80
  }

  return {
    description: 'Test coverage: source/test file ratio and missing tests',
    items,
    name: 'testing',
    score: Math.min(100, Math.round(rawScore)),
    weight: 0.20,
  }
}

// ─── Documentation assessment ─────────────────────────────

/**
 * Assess documentation debt: missing JSDoc and module comments.
 *
 * @example
 * ```ts
 * const cat = assessDocumentation(files)
 * console.log(cat.score)
 * ```
 */
export function assessDocumentation(files: FileContent[]): DebtCategory {
  const items: DebtItem[] = []

  for (const file of files) {
    if (file.filePath.endsWith('.json') || file.filePath.endsWith('.md')) continue

    const lines = file.content.split('\n')
    let exportedFns = 0
    let documentedFns = 0

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim()
      if (
        (trimmed.startsWith('export function') ||
          trimmed.startsWith('export async function') ||
          trimmed.match(/^export\s+(const|let|var|class|interface|type)\s/) !== null) &&
        !trimmed.includes('//')
      ) {
        exportedFns++
        if (i > 0 && lines[i - 1].trim().endsWith('*/')) {
          documentedFns++
        }
        if (i > 1 && lines[i - 2].trim().endsWith('*/')) {
          documentedFns++
        }
      }
    }

    const missingDocs = exportedFns - documentedFns
    if (missingDocs > 0) {
      items.push({
        description: `${missingDocs} exported symbol(s) missing JSDoc`,
        effort: 0.5,
        file: file.filePath,
        line: 1,
        priority: 'low',
        type: 'missing-jsdoc',
      })
    }

    const firstLine = lines[0]?.trim() ?? ''
    if (
      !firstLine.startsWith('//') &&
      !firstLine.startsWith('/*') &&
      !firstLine.startsWith('/**') &&
      !firstLine.startsWith("'",
      ) &&
      !firstLine.startsWith('import')
    ) {
      items.push({
        description: 'Missing module-level comment',
        effort: 0.25,
        file: file.filePath,
        line: 1,
        priority: 'low',
        type: 'missing-module-doc',
      })
    }
  }

  const rawScore = Math.min(100, items.length * 6)
  return {
    description: 'Documentation: missing JSDoc and module comments',
    items,
    name: 'documentation',
    score: rawScore,
    weight: 0.15,
  }
}

// ─── TODOs assessment ─────────────────────────────────────

/**
 * Scan for TODO, FIXME, HACK, and XXX comments.
 *
 * @example
 * ```ts
 * const cat = assessTodos(files)
 * console.log(cat.items.length)
 * ```
 */
export function assessTodos(files: FileContent[]): DebtCategory {
  const items: DebtItem[] = []
  const todoPattern = /\b(TODO|FIXME|HACK|XXX)\b/g

  for (const file of files) {
    const lines = file.content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const matches = line.match(todoPattern)
      if (matches) {
        for (const match of matches) {
          let priority: DebtItem['priority'] = 'medium'
          if (match === 'FIXME' || match === 'HACK') priority = 'high'
          if (match === 'XXX') priority = 'high'

          const descMatch = line.match(new RegExp(`\\b${match}\\b[:\\s]*(.*)`))
          const description = descMatch?.[1]?.trim() ?? match

          items.push({
            description: `[${match}] ${description}`,
            effort: match === 'FIXME' ? 2 : 1,
            file: file.filePath,
            line: i + 1,
            priority,
            type: match.toLowerCase() as DebtItem['type'],
          })
        }
      }
    }
  }

  let rawScore: number
  if (items.length === 0) rawScore = 0
  else if (items.length <= 3) rawScore = 10
  else if (items.length <= 10) rawScore = 25
  else if (items.length <= 25) rawScore = 50
  else rawScore = Math.min(100, 50 + (items.length - 25) * 2)

  return {
    description: 'TODOs, FIXMEs, HACKs, and XXXs in the codebase',
    items,
    name: 'todos',
    score: rawScore,
    weight: 0.15,
  }
}

// ─── Coupling assessment ─────────────────────────────────

/**
 * Assess coupling: files with many imports.
 *
 * @example
 * ```ts
 * const cat = assessCoupling(files)
 * console.log(cat.score)
 * ```
 */
export function assessCoupling(files: FileContent[]): DebtCategory {
  const items: DebtItem[] = []
  const importPattern = /^import\s.*from\s+['"](.+)['"]/gm

  for (const file of files) {
    if (file.filePath.endsWith('.json') || file.filePath.endsWith('.md')) continue

    const imports: string[] = []
    let match: RegExpExecArray | null
    const content = file.content
    importPattern.lastIndex = 0
    while ((match = importPattern.exec(content)) !== null) {
      imports.push(match[1])
    }

    if (imports.length > 10) {
      items.push({
        description: `High coupling: ${imports.length} imports`,
        effort: 2,
        file: file.filePath,
        line: 1,
        priority: 'medium',
        type: 'high-imports',
      })
    }
  }

  const rawScore = Math.min(100, items.length * 12)
  return {
    description: 'Coupling: files with excessive imports or circular dependencies',
    items,
    name: 'coupling',
    score: rawScore,
    weight: 0.10,
  }
}

// ─── Stale code assessment ────────────────────────────────

/**
 * Assess stale code: commented-out code blocks and unused exports.
 *
 * @example
 * ```ts
 * const cat = assessStaleCode(files)
 * console.log(cat.items.length)
 * ```
 */
export function assessStaleCode(files: FileContent[]): DebtCategory {
  const items: DebtItem[] = []

  for (const file of files) {
    if (file.filePath.endsWith('.json') || file.filePath.endsWith('.md')) continue

    const lines = file.content.split('\n')
    let consecutiveCommentedCode = 0

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim()

      if (trimmed.startsWith('// ') && looksLikeCode(trimmed.slice(3))) {
        consecutiveCommentedCode++
        if (consecutiveCommentedCode === 3) {
          items.push({
            description: 'Commented-out code block',
            effort: 0.5,
            file: file.filePath,
            line: i - 1,
            priority: 'low',
            type: 'commented-code',
          })
        }
      } else {
        consecutiveCommentedCode = 0
      }
    }

    const exportPattern = /^export\s+(function|const|let|var|class|interface|type|enum|default)\s/gm
    const exports: string[] = []
    let match: RegExpExecArray | null
    exportPattern.lastIndex = 0
    while ((match = exportPattern.exec(file.content)) !== null) {
      exports.push(match[0])
    }

    if (exports.length > 15) {
      items.push({
        description: `Many exports (${exports.length}), some may be unused`,
        effort: 1,
        file: file.filePath,
        line: 1,
        priority: 'low',
        type: 'unused-exports',
      })
    }
  }

  const rawScore = Math.min(100, items.length * 8)
  return {
    description: 'Stale code: commented-out code and unused exports',
    items,
    name: 'stale-code',
    score: rawScore,
    weight: 0.10,
  }
}

function looksLikeCode(text: string): boolean {
  const codePatterns = [
    /\b(const|let|var|function|return|if|else|for|while|class|import|export)\b/,
    /[={};]/,
    /\w+\.\w+\(/,
  ]
  return codePatterns.some((p) => p.test(text))
}

// ─── Dependencies assessment ──────────────────────────────

/**
 * Assess dependency health based on package.json.
 *
 * @example
 * ```ts
 * const cat = await assessDependencies(cwd)
 * console.log(cat.score)
 * ```
 */
export async function assessDependencies(cwd: string): Promise<DebtCategory> {
  const items: DebtItem[] = []
  const fs = await import('node:fs/promises')
  const { join } = await import('node:path')

  try {
    const pkgPath = join(cwd, 'package.json')
    const pkgContent = await fs.readFile(pkgPath, 'utf8')
    const pkg = JSON.parse(pkgContent) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
      deprecated?: Record<string, string>
    }

    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
    const depCount = Object.keys(allDeps).length

    if (depCount > 50) {
      items.push({
        description: `Large dependency tree: ${depCount} packages`,
        effort: 3,
        file: 'package.json',
        line: 1,
        priority: 'medium',
        type: 'many-deps',
      })
    }

    const deprecatedMarkers = ['deprecated', 'DEPRECATED', 'no longer maintained']
    for (const [name, version] of Object.entries(allDeps)) {
      const ver = version.toLowerCase()
      if (deprecatedMarkers.some((m) => ver.includes(m))) {
        items.push({
          description: `Deprecated package: ${name}@${version}`,
          effort: 2,
          file: 'package.json',
          line: 1,
          priority: 'high',
          type: 'deprecated-dep',
        })
      }
    }
  } catch {
    // No package.json found — no dependency debt
  }

  const rawScore = Math.min(100, items.length * 15)
  return {
    description: 'Dependencies: deprecated or outdated packages',
    items,
    name: 'dependencies',
    score: rawScore,
    weight: 0.10,
  }
}

// ─── Compute debt score ───────────────────────────────────

/**
 * Compute the weighted total debt score from all categories.
 *
 * @example
 * ```ts
 * const score = computeDebtScore(categories)
 * console.log(score.grade)
 * ```
 */
export function computeDebtScore(categories: DebtCategory[]): DebtScore {
  let total = 0
  let totalItems = 0
  let estimatedEffort = 0

  for (const cat of categories) {
    total += cat.score * cat.weight
    totalItems += cat.items.length
    for (const item of cat.items) {
      estimatedEffort += item.effort
    }
  }

  total = Math.round(Math.min(100, total))
  const grade = scoreToGrade(total)
  const repaymentPlan = generateRepaymentPlan(categories)

  return {
    categories,
    estimatedEffort: Math.round(estimatedEffort * 10) / 10,
    grade,
    repaymentPlan,
    total,
    totalItems,
  }
}

// ─── Repayment plan ───────────────────────────────────────

/**
 * Generate a prioritized repayment plan from debt categories.
 *
 * @example
 * ```ts
 * const plan = generateRepaymentPlan(categories)
 * console.log(plan.length) // max 10
 * ```
 */
export function generateRepaymentPlan(categories: DebtCategory[]): RepaymentAction[] {
  const actions: RepaymentAction[] = []

  for (const cat of categories) {
    if (cat.items.length === 0) continue

    const highItems = cat.items.filter((i) => i.priority === 'high')
    const mediumItems = cat.items.filter((i) => i.priority === 'medium')
    const lowItems = cat.items.filter((i) => i.priority === 'low')

    if (highItems.length > 0) {
      const effort = Math.round(highItems.reduce((s, i) => s + i.effort, 0) * 10) / 10
      actions.push({
        action: `Fix ${highItems.length} high-priority ${cat.name} issues`,
        category: cat.name,
        effort,
        impact: 'high',
        priority: 'high',
      })
    }

    if (mediumItems.length > 0) {
      const effort = Math.round(mediumItems.reduce((s, i) => s + i.effort, 0) * 10) / 10
      actions.push({
        action: `Address ${mediumItems.length} medium-priority ${cat.name} items`,
        category: cat.name,
        effort,
        impact: 'medium',
        priority: 'medium',
      })
    }

    if (lowItems.length > 0) {
      const effort = Math.round(lowItems.reduce((s, i) => s + i.effort, 0) * 10) / 10
      actions.push({
        action: `Clean up ${lowItems.length} low-priority ${cat.name} items`,
        category: cat.name,
        effort,
        impact: 'low',
        priority: 'low',
      })
    }
  }

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return actions.slice(0, 10)
}

// ─── Build full debt score ────────────────────────────────

/**
 * Build a complete DebtScore by analyzing all files in the working directory.
 *
 * @example
 * ```ts
 * const score = await buildDebtScore(cwd, files, contents, options)
 * console.log(score.grade)
 * ```
 */
export async function buildDebtScore(
  cwd: string,
  files: string[],
  contents: Map<string, string>,
  options: TechDebtOptions,
): Promise<DebtScore> {
  const fileContents: FileContent[] = files.map((f) => ({
    content: contents.get(f) ?? '',
    filePath: f,
    lines: (contents.get(f) ?? '').split('\n').length,
  }))

  const depsCategory = await assessDependencies(cwd)

  const categories: DebtCategory[] = [
    assessComplexity(fileContents),
    assessTesting(fileContents),
    assessDocumentation(fileContents),
    assessTodos(fileContents),
    assessCoupling(fileContents),
    assessStaleCode(fileContents),
    depsCategory,
  ]

  return computeDebtScore(categories)
}
