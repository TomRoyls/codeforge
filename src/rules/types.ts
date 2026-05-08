import type { SourceFile } from 'ts-morph'

import type { ASTVisitor, RuleViolation } from '../ast/visitor.js'
import type { FixResult } from '../fix/types.js'

/**
 * @stable
 */
export interface RuleOptions {
  [key: string]: unknown
  max?: number
}

/**
 * @stable
 */
export interface RuleDocs {
  category?: string
  description?: string
  fixable?: 'code' | 'whitespace'
  recommended?: boolean
  severity?: RuleSeverity
  url?: string
}

/**
 * @stable
 */
export interface RuleMeta {
  category:
    | 'complexity'
    | 'correctness'
    | 'dependencies'
    | 'patterns'
    | 'performance'
    | 'security'
    | 'style'
    | 'testing'
  deprecated?: boolean
  description: string
  docs?: RuleDocs
  fixable?: 'code' | 'whitespace'
  name: string
  recommended: boolean
  replacedBy?: string
  severity?: RuleSeverity
}

/**
 * @stable
 */
export interface RuleDefinition<TOptions extends RuleOptions = RuleOptions> {
  create: (options: TOptions) => {
    onComplete?: () => RuleViolation[]
    visitor: ASTVisitor
  }
  defaultOptions: TOptions
  fix?: (sourceFile: SourceFile, violation: RuleViolation) => FixResult | null
  meta: RuleMeta
}

/**
 * @stable
 */
export interface RuleContext {
  filePath: string
  options: RuleOptions
  report: (violation: Omit<RuleViolation, 'filePath' | 'ruleId'>) => void
  sourceFile: SourceFile
}

/**
 * @stable
 */
export type RuleSeverity = 'error' | 'info' | 'warning'

/**
 * @stable
 */
export interface RuleConfig {
  options?: RuleOptions
  severity: RuleSeverity
}

interface Position {
  column: number
  line: number
}

/**
 * @stable
 */
export function createViolation(
  filePath: string,
  message: string,
  range: { column: number; line: number } | { end: Position; start: Position },
  ruleId: string,
  severity: RuleSeverity = 'error',
  suggestion?: string,
): RuleViolation {
  const normalizedRange =
    'line' in range
      ? {
          end: { column: range.column + 1, line: range.line },
          start: { column: range.column, line: range.line },
        }
      : range

  return {
    filePath,
    message,
    range: normalizedRange,
    ruleId,
    severity,
    suggestion,
  }
}
