import type { SourceFile } from 'ts-morph'
import type { FixResult } from '../fix/types.js'
import type { RuleViolation, ASTVisitor } from '../ast/visitor.js'

export interface RuleOptions {
  [key: string]: unknown
  max?: number
}

export interface RuleMeta {
  category: 'complexity' | 'style' | 'correctness' | 'performance' | 'security'
  deprecated?: boolean
  description: string
  fixable?: 'code' | 'whitespace'
  name: string
  recommended: boolean
  replacedBy?: string
}

export interface RuleDefinition<TOptions extends RuleOptions = RuleOptions> {
  create: (options: TOptions) => {
    onComplete?: () => RuleViolation[]
    visitor: ASTVisitor
  }
  defaultOptions: TOptions
  fix?: (sourceFile: SourceFile, violation: RuleViolation) => FixResult | null
  meta: RuleMeta
}

export interface RuleContext {
  filePath: string
  options: RuleOptions
  report: (violation: Omit<RuleViolation, 'filePath' | 'ruleId'>) => void
  sourceFile: SourceFile
}

export type RuleSeverity = 'error' | 'warning' | 'info'

export interface RuleConfig {
  options?: RuleOptions
  severity: RuleSeverity
}

interface Position {
  column: number
  line: number
}

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
