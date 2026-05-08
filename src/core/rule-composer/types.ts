export type RulePredicate<T> = (item: T) => boolean

export interface ComposedRule<T> {
  name: string
  predicate: RulePredicate<T>
  description: string
  children?: ComposedRule<T>[]
}

export type RuleOperator = 'and' | 'or' | 'not'

export interface RuleCompositionConfig {
  shortCircuit: boolean
}

export const DEFAULT_CONFIG: RuleCompositionConfig = {
  shortCircuit: true,
}
