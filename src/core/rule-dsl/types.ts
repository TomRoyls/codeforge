export type OperatorType = 'gt' | 'lt' | 'eq' | 'gte' | 'lte'

export type DSLCategory =
  | 'complexity'
  | 'security'
  | 'performance'
  | 'patterns'
  | 'dependencies'
  | 'style'

export type DSLSeverity = 'error' | 'warning' | 'info'

export interface DSLPatternCondition {
  type: 'pattern'
  value: string
}

export interface DSLAstCondition {
  type: 'ast'
  selector: string
  filter?: string
}

export interface DSLAndCondition {
  type: 'and'
  conditions: DSLCondition[]
}

export interface DSLOrCondition {
  type: 'or'
  conditions: DSLCondition[]
}

export interface DSLNotCondition {
  type: 'not'
  condition: DSLCondition
}

export interface DSLExistsCondition {
  type: 'exists'
  pattern: string
}

export interface DSLCountCondition {
  type: 'count'
  pattern: string
  operator: OperatorType
  value: number
}

export interface DSLLineLengthCondition {
  type: 'line-length'
  operator: OperatorType
  value: number
}

export interface DSLFileSizeCondition {
  type: 'file-size'
  operator: OperatorType
  value: number
}

export interface DSLRegexCondition {
  type: 'regex'
  pattern: string
  flags?: string
}

export type DSLCondition =
  | DSLPatternCondition
  | DSLAstCondition
  | DSLAndCondition
  | DSLOrCondition
  | DSLNotCondition
  | DSLExistsCondition
  | DSLCountCondition
  | DSLLineLengthCondition
  | DSLFileSizeCondition
  | DSLRegexCondition

export interface DSLFix {
  type: 'replace' | 'prepend' | 'append' | 'delete'
  pattern: string
  replacement?: string
}

export interface DSLRuleConfig {
  id: string
  name: string
  description: string
  severity: DSLSeverity
  category: DSLCategory
  enabled: boolean
  condition: DSLCondition
  message: string
  suggestion?: string
  fix?: DSLFix
}

export interface DSLEvaluationContext {
  filePath: string
  content: string
  lines: string[]
  lineNumber: number
  match?: RegExpMatchArray
}

export interface DSLParseResult {
  success: boolean
  rules: DSLRuleConfig[]
  errors: DSLParseError[]
}

export interface DSLParseError {
  line: number
  column: number
  message: string
}

export interface DSLViolation {
  ruleId: string
  filePath: string
  line: number
  column: number
  message: string
  severity: DSLSeverity
  suggestion?: string
}
