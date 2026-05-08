import type { RuleDefinition } from '../../types.js'

import { noDomManipulationRule } from './no-dom-manipulation.js'
import { noReactiveAssignmentsRule } from './no-reactive-assignments.js'
import { noUnusedStoreRule } from './no-unused-store.js'
import { preferInlineHandlerRule } from './prefer-inline-handler.js'

export const svelteRules: Record<string, RuleDefinition> = {
  'svelte/no-reactive-assignments': noReactiveAssignmentsRule,
  'svelte/no-unused-store': noUnusedStoreRule,
  'svelte/prefer-inline-handler': preferInlineHandlerRule,
  'svelte/no-dom-manipulation': noDomManipulationRule,
}

export { noReactiveAssignmentsRule } from './no-reactive-assignments.js'
export { noUnusedStoreRule } from './no-unused-store.js'
export { preferInlineHandlerRule } from './prefer-inline-handler.js'
export { noDomManipulationRule } from './no-dom-manipulation.js'
