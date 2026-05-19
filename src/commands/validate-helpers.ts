// ─── Interfaces ──────────────────────────────────────────

export interface Violation {
  rule: string
  file: string
  line: number
  message: string
  severity: 'error' | 'warning'
  fix: string | null
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  severity: 'error' | 'warning'
  category: string
  check: (content: string, filePath: string) => Violation[]
}

export interface ValidationStats {
  total: number
  errors: number
  warnings: number
  byRule: Record<string, number>
  byFile: Record<string, number>
}

export interface ValidationResult {
  violations: Violation[]
  rules: ValidationRule[]
  stats: ValidationStats
}

export interface ValidateOptions {
  ignorePatterns: string[]
  extensions: string[] | null
  rules: string[] | null
}

export type ContentReader = (filePath: string) => Promise<string>

// ─── Rule: MAX_FILE_LENGTH ────────────────────────────────

/**
 * Check that files do not exceed 300 lines.
 *
 * @example
 * ```ts
 * const violations = checkMaxFileLength(longContent, 'big.ts')
 * ```
 */
export function checkMaxFileLength(content: string, filePath: string): Violation[] {
  const lines = content.split('\n')
  if (lines.length <= 300) return []
  return [
    {
      file: filePath,
      fix: 'Split this file into smaller modules',
      line: 1,
      message: `File has ${lines.length} lines (max 300)`,
      rule: 'MAX_FILE_LENGTH',
      severity: 'warning',
    },
  ]
}

// ─── Rule: NO_CONSOLE ─────────────────────────────────────

/**
 * Check for console.log, console.warn, console.error calls.
 *
 * @example
 * ```ts
 * const violations = checkNoConsole(content, 'app.ts')
 * ```
 */
export function checkNoConsole(content: string, filePath: string): Violation[] {
  const violations: Violation[] = []
  const lines = content.split('\n')
  const pattern = /\bconsole\.(log|warn|error|debug|info)\s*\(/

  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      violations.push({
        file: filePath,
        fix: 'Use a proper logging library instead',
        line: i + 1,
        message: `Unexpected console.${lines[i].match(/\bconsole\.(\w+)/)?.[1] ?? 'call'}`,
        rule: 'NO_CONSOLE',
        severity: 'warning',
      })
    }
  }
  return violations
}

// ─── Rule: REQUIRE_JSDOC ──────────────────────────────────

/**
 * Check that exported functions have JSDoc comments.
 *
 * @example
 * ```ts
 * const violations = checkRequireJSDoc(content, 'utils.ts')
 * ```
 */
export function checkRequireJSDoc(content: string, filePath: string): Violation[] {
  const violations: Violation[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (
      trimmed.startsWith('export function') ||
      trimmed.startsWith('export async function')
    ) {
      const prevLine = i > 0 ? lines[i - 1].trim() : ''
      if (!prevLine.endsWith('*/')) {
        const fnName = trimmed.match(/function\s+(\w+)/)?.[1] ?? 'unknown'
        violations.push({
          file: filePath,
          fix: `Add JSDoc comment above ${fnName}`,
          line: i + 1,
          message: `Exported function "${fnName}" is missing JSDoc`,
          rule: 'REQUIRE_JSDOC',
          severity: 'warning',
        })
      }
    }
  }
  return violations
}

// ─── Rule: NO_TODO ────────────────────────────────────────

/**
 * Check for TODO and FIXME comments.
 *
 * @example
 * ```ts
 * const violations = checkNoTodo(content, 'module.ts')
 * ```
 */
export function checkNoTodo(content: string, filePath: string): Violation[] {
  const violations: Violation[] = []
  const lines = content.split('\n')
  const pattern = /\b(TODO|FIXME)\b/

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(pattern)
    if (match) {
      violations.push({
        file: filePath,
        fix: `Resolve or convert to a tracked issue`,
        line: i + 1,
        message: `Found ${match[1]} comment`,
        rule: 'NO_TODO',
        severity: 'warning',
      })
    }
  }
  return violations
}

// ─── Rule: MAX_FUNCTION_LENGTH ────────────────────────────

/**
 * Check that functions do not exceed 50 lines.
 *
 * @example
 * ```ts
 * const violations = checkMaxFunctionLength(content, 'funcs.ts')
 * ```
 */
export function checkMaxFunctionLength(content: string, filePath: string): Violation[] {
  const violations: Violation[] = []
  const lines = content.split('\n')
  let fnStartLine = -1
  let braceDepth = 0
  let inFunction = false

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()

    const isFnStart =
      trimmed.includes('function ') ||
      trimmed.match(/const\s+\w+\s*=\s*(async\s+)?\(/) !== null ||
      trimmed.match(/const\s+\w+\s*=\s*(async\s+)?\(/) !== null

    if (isFnStart && !inFunction) {
      fnStartLine = i + 1
      inFunction = true
      braceDepth = 0
    }

    if (inFunction) {
      for (const ch of trimmed) {
        if (ch === '{') braceDepth++
        if (ch === '}') braceDepth--
      }

      if (braceDepth <= 0 && i > fnStartLine - 1) {
        const fnLength = i + 1 - fnStartLine + 1
        if (fnLength > 50) {
          violations.push({
            file: filePath,
            fix: 'Break this function into smaller helper functions',
            line: fnStartLine,
            message: `Function is ${fnLength} lines long (max 50)`,
            rule: 'MAX_FUNCTION_LENGTH',
            severity: 'error',
          })
        }
        inFunction = false
      }
    }
  }
  return violations
}

// ─── Rule: MAX_PARAMS ─────────────────────────────────────

/**
 * Check that functions do not have more than 5 parameters.
 *
 * @example
 * ```ts
 * const violations = checkMaxParams(content, 'api.ts')
 * ```
 */
export function checkMaxParams(content: string, filePath: string): Violation[] {
  const violations: Violation[] = []
  const lines = content.split('\n')
  const fnPattern = /function\s+\w+\s*\(([^)]*)\)/
  const arrowPattern = /(?:const|let)\s+\w+\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?::|=>)/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const fnMatch = line.match(fnPattern) ?? line.match(arrowPattern)
    if (fnMatch) {
      const params = fnMatch[1].split(',').filter((p) => p.trim().length > 0)
      if (params.length > 5) {
        violations.push({
          file: filePath,
          fix: 'Use an options object instead of multiple parameters',
          line: i + 1,
          message: `Function has ${params.length} parameters (max 5)`,
          rule: 'MAX_PARAMS',
          severity: 'warning',
        })
      }
    }
  }
  return violations
}

// ─── Rule: NAMING_CONVENTION ──────────────────────────────

/**
 * Check naming conventions: camelCase vars, PascalCase classes, UPPER_SNAKE constants.
 *
 * @example
 * ```ts
 * const violations = checkNamingConvention(content, 'types.ts')
 * ```
 */
export function checkNamingConvention(content: string, filePath: string): Violation[] {
  const violations: Violation[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()

    const classMatch = trimmed.match(/^class\s+([a-z])/)
    if (classMatch) {
      violations.push({
        file: filePath,
        fix: 'Use PascalCase for class names',
        line: i + 1,
        message: 'Class name should be PascalCase',
        rule: 'NAMING_CONVENTION',
        severity: 'warning',
      })
    }

    const constMatch = trimmed.match(/^const\s+([a-z]{2,}[A-Z])/)
    if (constMatch && !trimmed.includes('function') && !trimmed.includes('=>')) {
      violations.push({
        file: filePath,
        fix: 'Use UPPER_SNAKE_CASE for constants',
        line: i + 1,
        message: 'Constant should use UPPER_SNAKE_CASE',
        rule: 'NAMING_CONVENTION',
        severity: 'warning',
      })
    }
  }
  return violations
}

// ─── Rule: IMPORT_ORDER ───────────────────────────────────

/**
 * Check that imports are grouped: external → internal → relative.
 *
 * @example
 * ```ts
 * const violations = checkImportOrder(content, 'module.ts')
 * ```
 */
export function checkImportOrder(content: string, filePath: string): Violation[] {
  const violations: Violation[] = []
  const lines = content.split('\n')
  const importPattern = /^import\s.*from\s+['"](.+)['"]/

  let lastCategory = -1
  const categoryOrder = (imp: string): number => {
    if (imp.startsWith('.')) return 2
    if (imp.startsWith('@')) return 0
    return 1
  }

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(importPattern)
    if (match) {
      const category = categoryOrder(match[1])
      if (category < lastCategory) {
        violations.push({
          file: filePath,
          fix: 'Reorder imports: external → internal → relative',
          line: i + 1,
          message: 'Import is out of order (external → internal → relative)',
          rule: 'IMPORT_ORDER',
          severity: 'warning',
        })
      }
      lastCategory = category
    }
  }
  return violations
}

// ─── Rule: NO_TYPE_ANY ────────────────────────────────────

/**
 * Check for usage of the `any` type.
 *
 * @example
 * ```ts
 * const violations = checkNoTypeAny(content, 'types.ts')
 * ```
 */
export function checkNoTypeAny(content: string, filePath: string): Violation[] {
  const violations: Violation[] = []
  const lines = content.split('\n')
  const pattern = /:\s*any\b/

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (pattern.test(trimmed) && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
      violations.push({
        file: filePath,
        fix: 'Replace `any` with a proper type',
        line: i + 1,
        message: 'Usage of `any` type detected',
        rule: 'NO_TYPE_ANY',
        severity: 'error',
      })
    }
  }
  return violations
}

// ─── Rule: EXPLICIT_RETURN_TYPES ──────────────────────────

/**
 * Check that exported functions have explicit return types.
 *
 * @example
 * ```ts
 * const violations = checkExplicitReturnTypes(content, 'api.ts')
 * ```
 */
export function checkExplicitReturnTypes(content: string, filePath: string): Violation[] {
  const violations: Violation[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (
      trimmed.startsWith('export function') &&
      !trimmed.includes(': ') &&
      !trimmed.includes('): ')
    ) {
      const fnName = trimmed.match(/function\s+(\w+)/)?.[1] ?? 'unknown'
      violations.push({
        file: filePath,
        fix: `Add an explicit return type to ${fnName}`,
        line: i + 1,
        message: `Exported function "${fnName}" is missing return type`,
        rule: 'EXPLICIT_RETURN_TYPES',
        severity: 'warning',
      })
    }
  }
  return violations
}

// ─── Rule: NO_HARDCODED_STRINGS ───────────────────────────

/**
 * Check for long string literals (>50 chars) outside constants.
 *
 * @example
 * ```ts
 * const violations = checkNoHardcodedStrings(content, 'ui.ts')
 * ```
 */
export function checkNoHardcodedStrings(content: string, filePath: string): Violation[] {
  const violations: Violation[] = []
  const lines = content.split('\n')
  const stringPattern = /['"`]([^'"`]{50,})['"`]/

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (
      stringPattern.test(trimmed) &&
      !trimmed.startsWith('const') &&
      !trimmed.startsWith('let') &&
      !trimmed.startsWith('//')
    ) {
      violations.push({
        file: filePath,
        fix: 'Extract string into a named constant',
        line: i + 1,
        message: 'Long hardcoded string detected (50+ chars)',
        rule: 'NO_HARDCODED_STRINGS',
        severity: 'warning',
      })
    }
  }
  return violations
}

// ─── Rule: CONSISTENT_NAMING ──────────────────────────────

/**
 * Check that file names use kebab-case.
 *
 * @example
 * ```ts
 * const violations = checkConsistentNaming(content, 'myFile.ts')
 * ```
 */
export function checkConsistentNaming(_content: string, filePath: string): Violation[] {
  const violations: Violation[] = []
  const fileName = filePath.split('/').pop() ?? filePath

  if (/[A-Z]/.test(fileName) && !fileName.includes('.test.') && !fileName.includes('.spec.')) {
    violations.push({
      file: filePath,
      fix: 'Rename file to kebab-case',
      line: 0,
      message: `File name "${fileName}" should use kebab-case`,
      rule: 'CONSISTENT_NAMING',
      severity: 'warning',
    })
  }
  return violations
}

// ─── Built-in rules registry ──────────────────────────────

/**
 * Return all built-in validation rules.
 *
 * @example
 * ```ts
 * const rules = getBuiltinRules()
 * console.log(rules.length) // 12
 * ```
 */
export function getBuiltinRules(): ValidationRule[] {
  return [
    {
      category: 'size',
      check: checkMaxFileLength,
      description: 'Files should not exceed 300 lines',
      id: 'MAX_FILE_LENGTH',
      name: 'Max File Length',
      severity: 'warning',
    },
    {
      category: 'quality',
      check: checkNoConsole,
      description: 'No console statements in production code',
      id: 'NO_CONSOLE',
      name: 'No Console',
      severity: 'warning',
    },
    {
      category: 'documentation',
      check: checkRequireJSDoc,
      description: 'Exported functions must have JSDoc comments',
      id: 'REQUIRE_JSDOC',
      name: 'Require JSDoc',
      severity: 'warning',
    },
    {
      category: 'quality',
      check: checkNoTodo,
      description: 'No TODO or FIXME comments',
      id: 'NO_TODO',
      name: 'No TODO',
      severity: 'warning',
    },
    {
      category: 'complexity',
      check: checkMaxFunctionLength,
      description: 'Functions should not exceed 50 lines',
      id: 'MAX_FUNCTION_LENGTH',
      name: 'Max Function Length',
      severity: 'error',
    },
    {
      category: 'complexity',
      check: checkMaxParams,
      description: 'Functions should have at most 5 parameters',
      id: 'MAX_PARAMS',
      name: 'Max Parameters',
      severity: 'warning',
    },
    {
      category: 'style',
      check: checkNamingConvention,
      description: 'Follow naming conventions (camelCase, PascalCase, UPPER_SNAKE)',
      id: 'NAMING_CONVENTION',
      name: 'Naming Convention',
      severity: 'warning',
    },
    {
      category: 'style',
      check: checkImportOrder,
      description: 'Imports should be grouped: external → internal → relative',
      id: 'IMPORT_ORDER',
      name: 'Import Order',
      severity: 'warning',
    },
    {
      category: 'types',
      check: checkNoTypeAny,
      description: 'Do not use the `any` type',
      id: 'NO_TYPE_ANY',
      name: 'No Type Any',
      severity: 'error',
    },
    {
      category: 'types',
      check: checkExplicitReturnTypes,
      description: 'Exported functions must have explicit return types',
      id: 'EXPLICIT_RETURN_TYPES',
      name: 'Explicit Return Types',
      severity: 'warning',
    },
    {
      category: 'quality',
      check: checkNoHardcodedStrings,
      description: 'No long hardcoded strings (>50 chars) outside constants',
      id: 'NO_HARDCODED_STRINGS',
      name: 'No Hardcoded Strings',
      severity: 'warning',
    },
    {
      category: 'style',
      check: checkConsistentNaming,
      description: 'File names should use kebab-case',
      id: 'CONSISTENT_NAMING',
      name: 'Consistent Naming',
      severity: 'warning',
    },
  ]
}

// ─── Stats computation ────────────────────────────────────

/**
 * Compute aggregate validation statistics from violations.
 *
 * @example
 * ```ts
 * const stats = computeValidationStats(violations)
 * console.log(stats.errors)
 * ```
 */
export function computeValidationStats(violations: Violation[]): ValidationStats {
  let errors = 0
  let warnings = 0
  const byRule: Record<string, number> = {}
  const byFile: Record<string, number> = {}

  for (const v of violations) {
    if (v.severity === 'error') errors++
    else warnings++
    byRule[v.rule] = (byRule[v.rule] ?? 0) + 1
    byFile[v.file] = (byFile[v.file] ?? 0) + 1
  }

  return {
    byFile,
    byRule,
    errors,
    total: violations.length,
    warnings,
  }
}

// ─── Build validation result ──────────────────────────────

/**
 * Orchestrate validation across files with the given rules.
 *
 * @example
 * ```ts
 * const result = await buildValidationResult(files, reader, options)
 * console.log(result.stats.errors)
 * ```
 */
export async function buildValidationResult(
  files: string[],
  contentReader: ContentReader,
  options: ValidateOptions,
): Promise<ValidationResult> {
  const allRules = getBuiltinRules()
  const activeRules = options.rules
    ? allRules.filter((r) => options.rules!.includes(r.id))
    : allRules

  const violations: Violation[] = []

  for (const file of files) {
    try {
      const content = await contentReader(file)
      for (const rule of activeRules) {
        const result = rule.check(content, file)
        violations.push(...result)
      }
    } catch {
      // Skip unreadable files
    }
  }

  const stats = computeValidationStats(violations)

  return {
    rules: activeRules,
    stats,
    violations,
  }
}
