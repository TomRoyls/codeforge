export type RuleOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn'
  | 'matches'
  | 'exists'

export interface RuleCondition {
  field: string
  operator: RuleOperator
  value: unknown
}

export type RuleActionType = 'set' | 'remove' | 'add' | 'log' | 'error'

export interface RuleAction {
  type: RuleActionType
  target: string
  value: unknown
}

export interface Rule {
  id: string
  name: string
  description: string
  priority: number
  enabled: boolean
  conditions: RuleCondition[]
  actions: RuleAction[]
  tags: string[]
}

export interface RuleEvaluationContext {
  data: Record<string, unknown>
  metadata: Record<string, unknown>
}

export interface ActionResult {
  action: RuleAction
  success: boolean
  result: unknown
  error?: string
}

export interface RuleResult {
  ruleId: string
  matched: boolean
  actions: ActionResult[]
  duration: number
}

export interface EngineConfig {
  maxRules: number
  stopOnFirstMatch: boolean
  throwOnError: boolean
}
