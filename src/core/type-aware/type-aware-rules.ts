import type { RuleDefinition, RuleOptions } from '../../rules/types.js'
import type { ASTVisitor, RuleViolation } from '../../ast/visitor.js'

interface TypeAwareRuleOptions extends RuleOptions {
  sourceCode?: string
  filePath?: string
}

function countLineCol(text: string, matchIndex: number): { column: number; line: number } {
  const before = text.substring(0, matchIndex)
  const line = (before.match(/\n/g) ?? []).length + 1
  const lastNewline = before.lastIndexOf('\n')
  const column = lastNewline === -1 ? matchIndex + 1 : matchIndex - lastNewline
  return { column, line }
}

function getLines(text: string): string[] {
  return text.split('\n')
}

export function createNoImplicitAnyRule(): RuleDefinition<TypeAwareRuleOptions> {
  return {
    create(options: TypeAwareRuleOptions) {
      const sourceCode = options.sourceCode ?? ''
      const filePath = options.filePath ?? ''
      const violations: RuleViolation[] = []

      const onComplete = (): RuleViolation[] => {
        if (!sourceCode) return violations

        const lines = getLines(sourceCode)
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]!
          const lineNum = i + 1

          const paramPattern = /(?:function\s*\w*\s*\(|(?:const|let|var)\s*\w+\s*=\s*\([^)]*\)\s*=>\s*\(|\w+\s*\()[^)]*\b(\w+)\s*:\s*any\b/g
          let match: RegExpExecArray | null
          while ((match = paramPattern.exec(line)) !== null) {
            const varName = match[1]
            const startIdx = match.index
            violations.push({
              filePath,
              message: `Parameter '${varName}' has implicit any type`,
              range: {
                end: { column: startIdx + match[0].length, line: lineNum },
                start: { column: startIdx + 1, line: lineNum },
              },
              ruleId: 'no-implicit-any',
              severity: 'error',
              suggestion: `Add explicit type annotation for '${varName}'`,
            })
          }
        }

        const colonAnyPattern = /:\s*any\b/g
        let colonMatch: RegExpExecArray | null
        while ((colonMatch = colonAnyPattern.exec(sourceCode)) !== null) {
          const pos = countLineCol(sourceCode, colonMatch.index)
          const before = sourceCode.substring(Math.max(0, colonMatch.index - 30), colonMatch.index)
          const nameMatch = before.match(/(\w+)\s*$/)
          const varName = nameMatch?.[1] ?? 'unknown'
          violations.push({
            filePath,
            message: `Variable or parameter '${varName}' uses any type`,
            range: {
              end: { column: pos.column + colonMatch[0].length, line: pos.line },
              start: { column: pos.column, line: pos.line },
            },
            ruleId: 'no-implicit-any',
            severity: 'error',
            suggestion: `Replace 'any' with a specific type for '${varName}'`,
          })
        }

        return violations
      }

      return {
        onComplete,
        visitor: {} as ASTVisitor,
      }
    },
    defaultOptions: {},
    meta: {
      category: 'correctness',
      description: 'Disallow implicit any type usage',
      name: 'no-implicit-any',
      recommended: true,
    },
  }
}

export function createNoExplicitAnyRule(): RuleDefinition<TypeAwareRuleOptions> {
  return {
    create(options: TypeAwareRuleOptions) {
      const sourceCode = options.sourceCode ?? ''
      const filePath = options.filePath ?? ''
      const violations: RuleViolation[] = []

      const onComplete = (): RuleViolation[] => {
        if (!sourceCode) return violations

        const anyPattern = /:\s*any\b(?!\s*\[)/g
        let match: RegExpExecArray | null
        while ((match = anyPattern.exec(sourceCode)) !== null) {
          const pos = countLineCol(sourceCode, match.index)
          const before = sourceCode.substring(Math.max(0, match.index - 40), match.index)
          const nameMatch = before.match(/(\w+)\s*$/)
          const varName = nameMatch?.[1] ?? 'unknown'

          violations.push({
            filePath,
            message: `Explicit any type on '${varName}'`,
            range: {
              end: { column: pos.column + match[0].length, line: pos.line },
              start: { column: pos.column, line: pos.line },
            },
            ruleId: 'no-explicit-any',
            severity: 'warning',
            suggestion: `Replace 'any' with a more specific type`,
          })
        }

        return violations
      }

      return {
        onComplete,
        visitor: {} as ASTVisitor,
      }
    },
    defaultOptions: {},
    meta: {
      category: 'correctness',
      description: 'Disallow explicit any type annotations',
      name: 'no-explicit-any',
      recommended: true,
    },
  }
}

export function createNoTypeAssertionRule(): RuleDefinition<TypeAwareRuleOptions> {
  return {
    create(options: TypeAwareRuleOptions) {
      const sourceCode = options.sourceCode ?? ''
      const filePath = options.filePath ?? ''
      const violations: RuleViolation[] = []

      const onComplete = (): RuleViolation[] => {
        if (!sourceCode) return violations

        const asPattern = /\bas\s+(?!const\b)(\w+)/g
        let match: RegExpExecArray | null
        while ((match = asPattern.exec(sourceCode)) !== null) {
          const pos = countLineCol(sourceCode, match.index)
          const target = match[1]
          const before = sourceCode.substring(Math.max(0, match.index - 40), match.index)
          const exprMatch = before.match(/(\w+)\s*$/)
          const exprName = exprMatch?.[1] ?? 'expression'

          violations.push({
            filePath,
            message: `Type assertion '${exprName} as ${target}' is unsafe`,
            range: {
              end: { column: pos.column + match[0].length, line: pos.line },
              start: { column: pos.column, line: pos.line },
            },
            ruleId: 'no-type-assertion',
            severity: 'warning',
            suggestion: `Use a type guard or proper type narrowing instead of 'as ${target}'`,
          })
        }

        return violations
      }

      return {
        onComplete,
        visitor: {} as ASTVisitor,
      }
    },
    defaultOptions: {},
    meta: {
      category: 'correctness',
      description: 'Disallow type assertions (as X) except as const',
      name: 'no-type-assertion',
      recommended: true,
    },
  }
}

export function createNoNonNullAssertionRule(): RuleDefinition<TypeAwareRuleOptions> {
  return {
    create(options: TypeAwareRuleOptions) {
      const sourceCode = options.sourceCode ?? ''
      const filePath = options.filePath ?? ''
      const violations: RuleViolation[] = []

      const onComplete = (): RuleViolation[] => {
        if (!sourceCode) return violations

        const nonNullPattern = /(\w+)!(?![a-zA-Z0-9_])/g
        let match: RegExpExecArray | null
        while ((match = nonNullPattern.exec(sourceCode)) !== null) {
          const pos = countLineCol(sourceCode, match.index)
          const name = match[1]

          violations.push({
            filePath,
            message: `Non-null assertion on '${name}'`,
            range: {
              end: { column: pos.column + match[0].length, line: pos.line },
              start: { column: pos.column, line: pos.line },
            },
            ruleId: 'no-non-null-assertion',
            severity: 'warning',
            suggestion: `Use optional chaining or null checks instead of '${name}!'`,
          })
        }

        return violations
      }

      return {
        onComplete,
        visitor: {} as ASTVisitor,
      }
    },
    defaultOptions: {},
    meta: {
      category: 'correctness',
      description: 'Disallow non-null assertions (!.)',
      name: 'no-non-null-assertion',
      recommended: true,
    },
  }
}

export function createExplicitReturnTypeRule(): RuleDefinition<TypeAwareRuleOptions> {
  return {
    create(options: TypeAwareRuleOptions) {
      const sourceCode = options.sourceCode ?? ''
      const filePath = options.filePath ?? ''
      const violations: RuleViolation[] = []

      const onComplete = (): RuleViolation[] => {
        if (!sourceCode) return violations

        const lines = getLines(sourceCode)
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]!
          const lineNum = i + 1

          const exportFuncPattern = /export\s+function\s+(\w+)\s*\([^)]*\)\s*\{/g
          let match: RegExpExecArray | null
          while ((match = exportFuncPattern.exec(line)) !== null) {
            const funcName = match[1]
            const fullDecl = match[0]

            violations.push({
              filePath,
              message: `Exported function '${funcName}' missing return type`,
              range: {
                end: { column: match.index + fullDecl.length, line: lineNum },
                start: { column: match.index + 1, line: lineNum },
              },
              ruleId: 'explicit-return-type',
              severity: 'warning',
              suggestion: `Add explicit return type to '${funcName}'`,
            })
          }

          const exportConstArrowPattern =
            /export\s+const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*[^{]/g
          while ((match = exportConstArrowPattern.exec(line)) !== null) {
            const funcName = match[1]
            const fullDecl = match[0]

            violations.push({
              filePath,
              message: `Exported arrow function '${funcName}' missing return type`,
              range: {
                end: { column: match.index + fullDecl.length, line: lineNum },
                start: { column: match.index + 1, line: lineNum },
              },
              ruleId: 'explicit-return-type',
              severity: 'warning',
              suggestion: `Add explicit return type to '${funcName}'`,
            })
          }
        }

        return violations
      }

      return {
        onComplete,
        visitor: {} as ASTVisitor,
      }
    },
    defaultOptions: {},
    meta: {
      category: 'style',
      description: 'Require explicit return types on exported functions',
      name: 'explicit-return-type',
      recommended: false,
    },
  }
}
