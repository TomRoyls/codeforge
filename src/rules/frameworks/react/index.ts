import type { RuleDefinition } from '../../types.js'

import { noUnusedStateRule } from './no-unused-state.js'
import { noMissingKeyRule } from './no-missing-key.js'
import { noDirectMutationRule } from './no-direct-mutation.js'
import { preferFunctionComponentRule } from './prefer-function-component.js'
import { noArrayIndexKeyRule } from './no-array-index-key.js'

export const reactRules: Record<string, RuleDefinition> = {
  'react/no-unused-state': noUnusedStateRule,
  'react/no-missing-key': noMissingKeyRule,
  'react/no-direct-mutation': noDirectMutationRule,
  'react/prefer-function-component': preferFunctionComponentRule,
  'react/no-array-index-key': noArrayIndexKeyRule,
}

export { noUnusedStateRule } from './no-unused-state.js'
export { noMissingKeyRule } from './no-missing-key.js'
export { noDirectMutationRule } from './no-direct-mutation.js'
export { preferFunctionComponentRule } from './prefer-function-component.js'
export { noArrayIndexKeyRule } from './no-array-index-key.js'
