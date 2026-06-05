// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Severity level for a code smell.
 *
 * @example
 * severity: 'info'       // minor issue
 * severity: 'warning'    // should address
 * severity: 'critical'   // must fix
 */
export type SmellSeverity = 'info' | 'warning' | 'critical'

/**
 * Category grouping for code smells.
 *
 * @example
 * category: 'complexity'   // cognitive load
 * category: 'size'         // too large
 * category: 'naming'       // poor names
 */
export type SmellCategoryName = 'complexity' | 'coupling' | 'naming' | 'size' | 'duplication' | 'abstraction' | 'consistency'

/**
 * A single detected code smell.
 *
 * @example
 * const smell: CodeSmell = {
 *   type: 'long-function', name: 'Long Function',
 *   file: 'src/core.ts', lineStart: 10, lineEnd: 80,
 *   severity: 'warning', description: 'Function is 70 lines', suggestion: 'Extract methods',
 *   category: 'size',
 * }
 */
export interface CodeSmell {
  type: string
  name: string
  file: string
  lineStart: number
  lineEnd: number
  severity: SmellSeverity
  description: string
  suggestion: string
  category: SmellCategoryName
}

/**
 * A grouped category of smells.
 *
 * @example
 * const cat: SmellCategory = { name: 'size', count: 3, severity: 'warning', smells: [...] }
 */
export interface SmellCategory {
  name: string
  count: number
  severity: SmellSeverity
  smells: CodeSmell[]
}

/**
 * Aggregate smell statistics.
 *
 * @example
 * const stats = { totalSmells: 10, warningCount: 5, smellDensity: 3.2, ... }
 */
export interface SmellsStats {
  totalSmells: number
  infoCount: number
  warningCount: number
  criticalCount: number
  filesAffected: number
  smellDensity: number
  mostCommonSmell: string
  mostAffectedFile: string
}

/**
 * Complete smell detection result.
 *
 * @example
 * const result: SmellsResult = { smells: [...], categories: [...], stats: {...}, recommendations: [...] }
 */
export interface SmellsResult {
  smells: CodeSmell[]
  categories: SmellCategory[]
  stats: SmellsStats
  recommendations: string[]
}

/**
 * Options for smell detection.
 *
 * @example
 * const opts: SmellsOptions = { severity: 'warning', longFunctionThreshold: 60 }
 */
export interface SmellsOptions {
  severity?: 'all' | 'info' | 'warning' | 'critical'
  longFunctionThreshold?: number
  deepNestingThreshold?: number
  tooManyParamsThreshold?: number
  godClassMethodThreshold?: number
  magicNumberExclusions?: number[]
}

// ─── Long Function Detection ──────────────────────────────────────────────────

/**
 * Count nesting depth of a line based on braces.
 *
 * @example
 * countBraceDepth('{ if (x) {', 0) // 2
 */
export function countBraceDepth(line: string, current: number): number {
  let depth = current
  for (const ch of line) {
    if (ch === '{') depth++
    else if (ch === '}') depth--
  }
  return depth
}

/**
 * Detect functions that exceed the line threshold.
 *
 * @example
 * detectLongFunctions('function foo() {\n  ...80 lines...\n}', 'a.ts') // [{ type: 'long-function', ... }]
 */
export function detectLongFunctions(content: string, filePath: string, threshold = 50): CodeSmell[] {
  const smells: CodeSmell[] = []
  const lines = content.split('\n')
  const funcRegex = /^(export\s+)?(async\s+)?function\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(|(\w+)\s*\(.*\)\s*\{|class\s+(\w+)\s*\{/

  let funcName = ''
  let funcStart = -1
  let braceDepth = 0
  let inFunction = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()

    if (!inFunction) {
      const match = trimmed.match(funcRegex)
      if (match) {
        funcName = match[3] ?? match[4] ?? match[5] ?? match[6] ?? 'anonymous'
        funcStart = i + 1
        braceDepth = 0
        inFunction = true
      }
    }

    if (inFunction) {
      for (const ch of line) {
        if (ch === '{') braceDepth++
        else if (ch === '}') braceDepth--
      }

      if (braceDepth <= 0 && i > funcStart - 1) {
        const funcLength = i + 1 - funcStart
        if (funcLength > threshold) {
          smells.push({
            type: 'long-function',
            name: 'Long Function',
            file: filePath,
            lineStart: funcStart,
            lineEnd: i + 1,
            severity: funcLength > threshold * 2 ? 'critical' : 'warning',
            description: `Function '${funcName}' is ${funcLength} lines (threshold: ${threshold})`,
            suggestion: 'Extract smaller helper functions from this function',
            category: 'size',
          })
        }
        inFunction = false
      }
    }
  }

  return smells
}

// ─── Deep Nesting Detection ────────────────────────────────────────────────────

/**
 * Detect code with nesting depth exceeding threshold.
 *
 * @example
 * detectDeepNesting('if (a) {\n  if (b) {\n    if (c) {\n      if (d) {\n        x\n}}}}', 'a.ts') // [smell]
 */
export function detectDeepNesting(content: string, filePath: string, threshold = 4): CodeSmell[] {
  const smells: CodeSmell[] = []
  const lines = content.split('\n')
  let depth = 0
  let deepStart = -1
  let maxDepth = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const prevDepth = depth
    depth = countBraceDepth(line, depth)

    if (depth > threshold && prevDepth <= threshold) {
      deepStart = i + 1
      maxDepth = depth
    }

    if (depth > maxDepth && deepStart > 0) {
      maxDepth = depth
    }

    if (depth <= threshold && prevDepth > threshold && deepStart > 0) {
      smells.push({
        type: 'deep-nesting',
        name: 'Deep Nesting',
        file: filePath,
        lineStart: deepStart,
        lineEnd: i + 1,
        severity: maxDepth > threshold + 2 ? 'critical' : 'warning',
        description: `Nesting depth reaches ${maxDepth} (threshold: ${threshold})`,
        suggestion: 'Use early returns, guard clauses, or extract nested logic into functions',
        category: 'complexity',
      })
      deepStart = -1
      maxDepth = 0
    }
  }

  return smells
}

// ─── Too Many Parameters ──────────────────────────────────────────────────────

/**
 * Detect functions with too many parameters.
 *
 * @example
 * detectTooManyParams('function foo(a, b, c, d, e) {}', 'a.ts') // [smell]
 */
export function detectTooManyParams(content: string, filePath: string, threshold = 4): CodeSmell[] {
  const smells: CodeSmell[] = []
  const lines = content.split('\n')
  const paramRegex = /^(export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)|(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?::\s*\w+(?:<[^>]+>)?\s*)?=>/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const match = line.match(paramRegex)
    if (!match) continue

    const name = match[2] ?? match[4] ?? 'anonymous'
    const paramStr = match[3] ?? match[5] ?? ''
    if (!paramStr.trim()) continue

    const params = paramStr.split(',').filter((p) => p.trim().length > 0)
    if (params.length > threshold) {
      smells.push({
        type: 'too-many-params',
        name: 'Too Many Parameters',
        file: filePath,
        lineStart: i + 1,
        lineEnd: i + 1,
        severity: params.length > threshold + 3 ? 'critical' : 'warning',
        description: `Function '${name}' has ${params.length} parameters (threshold: ${threshold})`,
        suggestion: 'Use an options object to group related parameters',
        category: 'complexity',
      })
    }
  }

  return smells
}

// ─── God Class Detection ──────────────────────────────────────────────────────

/**
 * Detect classes with too many methods or too many lines.
 *
 * @example
 * detectGodClasses('class Foo { m1(){} m2(){} ... m20(){} }', 'a.ts') // [smell]
 */
export function detectGodClasses(content: string, filePath: string, methodThreshold = 15): CodeSmell[] {
  const smells: CodeSmell[] = []
  const classRegex = /^(export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+(\w+)/
  const methodRegex = /(?:public|private|protected|static|async|abstract|override\s+)*\s*(?:get\s+|set\s+)?(\w+)\s*\(/g
  const lines = content.split('\n')

  let inClass = false
  let className = ''
  let classStart = -1
  let braceDepth = 0
  let methodCount = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()

    if (!inClass) {
      const match = trimmed.match(classRegex)
      if (match) {
        className = match[2] ?? 'Anonymous'
        classStart = i + 1
        braceDepth = 0
        methodCount = 0
        inClass = true
      }
    }

    if (inClass) {
      for (const ch of line) {
        if (ch === '{') braceDepth++
        else if (ch === '}') braceDepth--
      }

      const methodMatches = trimmed.matchAll(methodRegex)
      for (const m of methodMatches) {
        if (m[1] !== 'constructor') methodCount++
      }

      if (braceDepth <= 0 && i > classStart - 1) {
        const classLength = i + 1 - classStart
        if (methodCount > methodThreshold || classLength > 200) {
          smells.push({
            type: 'god-class',
            name: 'God Class',
            file: filePath,
            lineStart: classStart,
            lineEnd: i + 1,
            severity: methodCount > methodThreshold * 2 ? 'critical' : 'warning',
            description: `Class '${className}' has ${methodCount} methods and ${classLength} lines`,
            suggestion: 'Split into smaller, focused classes with single responsibilities',
            category: 'size',
          })
        }
        inClass = false
      }
    }
  }

  return smells
}

// ─── Magic Number Detection ───────────────────────────────────────────────────

/**
 * Detect magic numbers (numeric literals that aren't 0, 1, -1, or common).
 *
 * @example
 * detectMagicNumbers('const x = 42;', 'a.ts') // [smell]
 * detectMagicNumbers('for (let i = 0; i < arr.length; i++) {}', 'a.ts') // []
 */
export function detectMagicNumbers(content: string, filePath: string): CodeSmell[] {
  const smells: CodeSmell[] = []
  const exclusions = [0, 1, -1, 2, 10, 100, 1000]
  const numberRegex = /(?<![.\w])-?\d+(?:\.\d+)?(?!\w*[.:])/g
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('import')) continue

    let match: RegExpExecArray | null
    const seen = new Map<number, number>()
    numberRegex.lastIndex = 0
    while ((match = numberRegex.exec(trimmed)) !== null) {
      const num = Number(match[0])
      if (Number.isNaN(num) || exclusions.includes(num)) continue
      if (trimmed.includes(`for (`) || trimmed.includes(`for(`)) continue
      seen.set(num, (seen.get(num) ?? 0) + 1)
    }

    for (const [num, count] of seen) {
      if (count > 0) {
        smells.push({
          type: 'magic-number',
          name: 'Magic Number',
          file: filePath,
          lineStart: i + 1,
          lineEnd: i + 1,
          severity: 'info',
          description: `Unexplained numeric literal: ${num}`,
          suggestion: `Extract to a named constant (e.g., const MAX_${String(Math.abs(num)).toUpperCase()} = ${num})`,
          category: 'abstraction',
        })
      }
    }
  }

  return smells
}

// ─── Duplicate String Detection ───────────────────────────────────────────────

/**
 * Detect string literals that appear 3 or more times.
 *
 * @example
 * detectDuplicateStrings("const a = 'foo'; const b = 'foo'; const c = 'foo';", 'a.ts') // [smell]
 */
export function detectDuplicateStrings(content: string, filePath: string): CodeSmell[] {
  const smells: CodeSmell[] = []
  const stringRegex = /'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"/g
  const stringCounts = new Map<string, { count: number; firstLine: number }>()
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('import')) continue

    stringRegex.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = stringRegex.exec(trimmed)) !== null) {
      const str = match[1] ?? match[2] ?? ''
      if (str.length < 3) continue
      const existing = stringCounts.get(str)
      if (existing) {
        existing.count++
      } else {
        stringCounts.set(str, { count: 1, firstLine: i + 1 })
      }
    }
  }

  for (const [str, info] of stringCounts) {
    if (info.count >= 3) {
      smells.push({
        type: 'duplicate-string',
        name: 'Duplicate String',
        file: filePath,
        lineStart: info.firstLine,
        lineEnd: info.firstLine,
        severity: info.count >= 5 ? 'warning' : 'info',
        description: `String "${str.length > 30 ? str.slice(0, 30) + '...' : str}" appears ${info.count} times`,
        suggestion: 'Extract repeated string to a named constant',
        category: 'duplication',
      })
    }
  }

  return smells
}

// ─── Complex Condition Detection ──────────────────────────────────────────────

/**
 * Detect boolean expressions with 3 or more logical operators.
 *
 * @example
 * detectComplexConditions('if (a && b || c && d || e) {}', 'a.ts') // [smell]
 */
export function detectComplexConditions(content: string, filePath: string): CodeSmell[] {
  const smells: CodeSmell[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue

    const operatorCount = (trimmed.match(/&&|\|\|/g) ?? []).length
    if (operatorCount >= 3) {
      smells.push({
        type: 'complex-condition',
        name: 'Complex Condition',
        file: filePath,
        lineStart: i + 1,
        lineEnd: i + 1,
        severity: operatorCount >= 5 ? 'critical' : 'warning',
        description: `Condition has ${operatorCount} logical operators`,
        suggestion: 'Extract condition into a named boolean variable or function',
        category: 'complexity',
      })
    }
  }

  return smells
}

// ─── Empty Catch Detection ────────────────────────────────────────────────────

/**
 * Detect empty catch blocks.
 *
 * @example
 * detectEmptyCatch('try { x } catch(e) { }', 'a.ts') // [smell]
 */
export function detectEmptyCatch(content: string, filePath: string): CodeSmell[] {
  const smells: CodeSmell[] = []
  const lines = content.split('\n')
  const catchRegex = /catch\s*\(\w*\)\s*\{/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (!catchRegex.test(line)) continue

    const afterCatch = line.slice(line.indexOf('{') + 1)
    const closingBrace = afterCatch.indexOf('}')
    if (closingBrace >= 0 && afterCatch.slice(0, closingBrace).trim() === '') {
      smells.push({
        type: 'empty-catch',
        name: 'Empty Catch Block',
        file: filePath,
        lineStart: i + 1,
        lineEnd: i + 1,
        severity: 'warning',
        description: 'Empty catch block silently swallows errors',
        suggestion: 'At minimum, log the error or add a comment explaining why it is ignored',
        category: 'consistency',
      })
    } else if (closingBrace < 0 && i + 1 < lines.length) {
      const nextLine = lines[i + 1]!.trim()
      if (nextLine === '}' || nextLine === '') {
        smells.push({
          type: 'empty-catch',
          name: 'Empty Catch Block',
          file: filePath,
          lineStart: i + 1,
          lineEnd: i + 2,
          severity: 'warning',
          description: 'Empty catch block silently swallows errors',
          suggestion: 'At minimum, log the error or add a comment explaining why it is ignored',
          category: 'consistency',
        })
      }
    }
  }

  return smells
}

// ─── Console.log Detection ────────────────────────────────────────────────────

/**
 * Detect console.log statements in non-test files.
 *
 * @example
 * detectConsoleLog('console.log("debug")', 'src/core.ts') // [smell]
 * detectConsoleLog('console.log("test")', 'test/foo.test.ts') // []
 */
export function detectConsoleLog(content: string, filePath: string): CodeSmell[] {
  const smells: CodeSmell[] = []
  if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('__tests__')) return smells

  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()
    if (trimmed.startsWith('//')) continue
    if (/\bconsole\.log\s*\(/.test(trimmed)) {
      smells.push({
        type: 'console-log',
        name: 'Console Log',
        file: filePath,
        lineStart: i + 1,
        lineEnd: i + 1,
        severity: 'info',
        description: 'console.log found in production code',
        suggestion: 'Replace with a proper logging library or remove',
        category: 'consistency',
      })
    }
  }

  return smells
}

// ─── TODO Comment Detection ───────────────────────────────────────────────────

/**
 * Detect TODO, FIXME, and HACK comments.
 *
 * @example
 * detectTodos('// TODO: fix this later', 'a.ts') // [smell]
 */
export function detectTodos(content: string, filePath: string): CodeSmell[] {
  const smells: CodeSmell[] = []
  const todoRegex = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)\b[:\s]*/i
  const blockTodoRegex = /\*\s*(TODO|FIXME|HACK|XXX|BUG)\b[:\s]*/i
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const match = line.match(todoRegex) ?? line.match(blockTodoRegex)
    if (match) {
      const tag = (match[1] ?? '').toUpperCase()
      smells.push({
        type: 'todo-comment',
        name: 'TODO Comment',
        file: filePath,
        lineStart: i + 1,
        lineEnd: i + 1,
        severity: tag === 'FIXME' || tag === 'BUG' ? 'warning' : 'info',
        description: `${tag} comment found: ${line.trim().slice(0, 60)}`,
        suggestion: 'Create an issue to track this and resolve or link the issue ID',
        category: 'consistency',
      })
    }
  }

  return smells
}

// ─── Inconsistent Return Detection ────────────────────────────────────────────

/**
 * Detect functions that sometimes return and sometimes don't.
 *
 * @example
 * detectInconsistentReturn('function foo(x) { if (x) return 1; }', 'a.ts') // [smell]
 */
export function detectInconsistentReturn(content: string, filePath: string): CodeSmell[] {
  const smells: CodeSmell[] = []
  const lines = content.split('\n')
  const funcRegex = /^(export\s+)?(async\s+)?function\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*\w+(?:<[^>]+>)?\s*)?=>/

  let funcName = ''
  let funcStart = -1
  let braceDepth = 0
  let inFunction = false
  let hasReturn = false
  let hasImplicitReturn = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()

    if (!inFunction) {
      const match = trimmed.match(funcRegex)
      if (match) {
        funcName = match[3] ?? match[4] ?? 'anonymous'
        funcStart = i + 1
        braceDepth = 0
        inFunction = true
        hasReturn = false
        hasImplicitReturn = false
      }
    }

    if (inFunction) {
      for (const ch of line) {
        if (ch === '{') braceDepth++
        else if (ch === '}') braceDepth--
      }

      if (trimmed.startsWith('return ') || trimmed === 'return;' || trimmed.startsWith('return{') || trimmed.startsWith('return(')) {
        hasReturn = true
      }

      if (braceDepth <= 0 && i > funcStart - 1) {
        if (!trimmed.startsWith('return') && hasReturn) {
          hasImplicitReturn = true
        }

        if (hasReturn && hasImplicitReturn) {
          smells.push({
            type: 'inconsistent-return',
            name: 'Inconsistent Return',
            file: filePath,
            lineStart: funcStart,
            lineEnd: i + 1,
            severity: 'warning',
            description: `Function '${funcName}' has mixed return patterns`,
            suggestion: 'Ensure all code paths return a value consistently',
            category: 'consistency',
          })
        }
        inFunction = false
      }
    }
  }

  return smells
}

// ─── Full Detection ───────────────────────────────────────────────────────────

/**
 * Run all smell detectors on a single file's content.
 *
 * @example
 * detectSmells('function foo() { ... }', 'src/core.ts') // [smell, smell, ...]
 */
export function detectSmells(content: string, filePath: string, options: SmellsOptions = {}): CodeSmell[] {
  const allSmells: CodeSmell[] = [
    ...detectLongFunctions(content, filePath, options.longFunctionThreshold),
    ...detectDeepNesting(content, filePath, options.deepNestingThreshold),
    ...detectTooManyParams(content, filePath, options.tooManyParamsThreshold),
    ...detectGodClasses(content, filePath, options.godClassMethodThreshold),
    ...detectMagicNumbers(content, filePath),
    ...detectDuplicateStrings(content, filePath),
    ...detectComplexConditions(content, filePath),
    ...detectEmptyCatch(content, filePath),
    ...detectConsoleLog(content, filePath),
    ...detectTodos(content, filePath),
    ...detectInconsistentReturn(content, filePath),
  ]

  return allSmells
}

// ─── Categorization ───────────────────────────────────────────────────────────

/**
 * Group smells by category.
 *
 * @example
 * categorizeSmells(smells) // [{ name: 'size', count: 3, ... }, ...]
 */
export function categorizeSmells(smells: CodeSmell[]): SmellCategory[] {
  const categoryMap = new Map<SmellCategoryName, CodeSmell[]>()

  for (const smell of smells) {
    const existing = categoryMap.get(smell.category)
    if (existing) {
      existing.push(smell)
    } else {
      categoryMap.set(smell.category, [smell])
    }
  }

  const categories: SmellCategory[] = []
  for (const [name, catSmells] of categoryMap) {
    const hasCritical = catSmells.some((s) => s.severity === 'critical')
    const hasWarning = catSmells.some((s) => s.severity === 'warning')
    categories.push({
      name,
      count: catSmells.length,
      severity: hasCritical ? 'critical' : hasWarning ? 'warning' : 'info',
      smells: catSmells,
    })
  }

  categories.sort((a, b) => b.count - a.count)
  return categories
}

// ─── Statistics ────────────────────────────────────────────────────────────────

/**
 * Compute aggregate statistics from detected smells.
 *
 * @example
 * computeSmellStats(smells, 5000) // { totalSmells: 10, smellDensity: 2.0, ... }
 */
export function computeSmellStats(smells: CodeSmell[], totalLines: number): SmellsStats {
  const infoCount = smells.filter((s) => s.severity === 'info').length
  const warningCount = smells.filter((s) => s.severity === 'warning').length
  const criticalCount = smells.filter((s) => s.severity === 'critical').length

  const affectedFiles = new Set(smells.map((s) => s.file))
  const density = totalLines > 0 ? Math.round((smells.length / totalLines) * 1000 * 10) / 10 : 0

  const typeCounts = new Map<string, number>()
  for (const smell of smells) {
    typeCounts.set(smell.type, (typeCounts.get(smell.type) ?? 0) + 1)
  }
  let mostCommonSmell = ''
  let maxCount = 0
  for (const [type, count] of typeCounts) {
    if (count > maxCount) {
      maxCount = count
      mostCommonSmell = type
    }
  }

  const fileCounts = new Map<string, number>()
  for (const smell of smells) {
    fileCounts.set(smell.file, (fileCounts.get(smell.file) ?? 0) + 1)
  }
  let mostAffectedFile = ''
  let maxFileCount = 0
  for (const [file, count] of fileCounts) {
    if (count > maxFileCount) {
      maxFileCount = count
      mostAffectedFile = file
    }
  }

  return {
    totalSmells: smells.length,
    infoCount,
    warningCount,
    criticalCount,
    filesAffected: affectedFiles.size,
    smellDensity: density,
    mostCommonSmell,
    mostAffectedFile,
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate actionable recommendations based on categories and stats.
 *
 * @example
 * generateSmellRecommendations(categories, stats) // ['Address 5 god-class smells...', ...]
 */
export function generateSmellRecommendations(categories: SmellCategory[], stats: SmellsStats): string[] {
  const recs: string[] = []

  if (stats.criticalCount > 0) {
    recs.push(`Address ${stats.criticalCount} critical smell${stats.criticalCount > 1 ? 's' : ''} immediately — these indicate high-risk code.`)
  }

  if (stats.warningCount > 0) {
    recs.push(`Plan to resolve ${stats.warningCount} warning-level smell${stats.warningCount > 1 ? 's' : ''} in upcoming sprints.`)
  }

  for (const cat of categories) {
    if (cat.name === 'size' && cat.count > 3) {
      recs.push('Multiple size-related smells found. Consider breaking large functions and classes into smaller units.')
      break
    }
  }

  for (const cat of categories) {
    if (cat.name === 'complexity' && cat.count > 3) {
      recs.push('High complexity detected. Simplify conditions, reduce nesting, and limit parameter counts.')
      break
    }
  }

  for (const cat of categories) {
    if (cat.name === 'duplication' && cat.count > 0) {
      recs.push('Duplicate strings found. Extract common literals to shared constants.')
      break
    }
  }

  if (stats.smellDensity > 10) {
    recs.push(`Smell density is ${stats.smellDensity} per 1000 lines. Consider a dedicated refactoring sprint.`)
  }

  if (recs.length === 0) {
    recs.push('No significant code smells detected. Keep up the good practices!')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Build complete smell detection result from files and contents.
 *
 * @example
 * const result = buildSmellsResult(['a.ts'], [content], { severity: 'warning' })
 */
export function buildSmellsResult(
  files: string[],
  contents: string[],
  options: SmellsOptions = {},
): SmellsResult {
  const severityFilter = options.severity ?? 'all'
  const allSmells: CodeSmell[] = []
  let totalLines = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i]
    if (file === undefined || content === undefined) continue

    totalLines += content.split('\n').length
    const smells = detectSmells(content, file, options)
    allSmells.push(...smells)
  }

  const filteredSmells = severityFilter === 'all'
    ? allSmells
    : allSmells.filter((s) => {
        if (severityFilter === 'critical') return s.severity === 'critical'
        if (severityFilter === 'warning') return s.severity === 'warning' || s.severity === 'critical'
        return true
      })

  const categories = categorizeSmells(filteredSmells)
  const stats = computeSmellStats(filteredSmells, totalLines)
  const recommendations = generateSmellRecommendations(categories, stats)

  return { smells: filteredSmells, categories, stats, recommendations }
}
