export { noMutableDefaultArgsRule, analyzeNoMutableDefaultArgs } from './no-mutable-default-args.js'
export { noBareExceptRule, analyzeNoBareExcept } from './no-bare-except.js'
export { noGlobalVariablesRule, analyzeNoGlobalVariables } from './no-global-variables.js'

import { noMutableDefaultArgsRule } from './no-mutable-default-args.js'
import { noBareExceptRule } from './no-bare-except.js'
import { noGlobalVariablesRule } from './no-global-variables.js'

import type { RuleDefinition } from '../../types.js'

export const pythonRules: RuleDefinition[] = [
  noMutableDefaultArgsRule,
  noBareExceptRule,
  noGlobalVariablesRule,
]
