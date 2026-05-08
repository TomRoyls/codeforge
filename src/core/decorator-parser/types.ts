export interface DecoratorInfo {
  name: string
  args: DecoratorArg[]
  target: DecoratorTarget
  isFactory: boolean
  source: string
  line: number
  column: number
}

export interface StringArg {
  kind: 'string'
  value: string
}

export interface NumberArg {
  kind: 'number'
  value: number
}

export interface BooleanArg {
  kind: 'boolean'
  value: boolean
}

export interface IdentifierArg {
  kind: 'identifier'
  value: string
}

export interface ObjectArg {
  kind: 'object'
  value: Record<string, unknown>
}

export interface ArrayArg {
  kind: 'array'
  value: unknown[]
}

export type DecoratorArg = StringArg | NumberArg | BooleanArg | IdentifierArg | ObjectArg | ArrayArg

export type DecoratorTarget = 'class' | 'method' | 'property' | 'parameter' | 'accessor'

export interface DecoratorUsage {
  name: string
  targets: DecoratorTarget[]
  frequency: number
  hasArguments: boolean
  argPatterns: string[][]
}

export interface DecoratorReport {
  totalDecorators: number
  uniqueDecorators: number
  byTarget: Record<DecoratorTarget, number>
  byName: Record<string, number>
  usages: DecoratorUsage[]
  source: string
}
