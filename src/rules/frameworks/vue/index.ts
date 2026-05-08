import type { RuleDefinition } from '../../types.js'

import { noMutatingPropsRule } from './no-mutating-props.js'
import { noVHtmlRule } from './no-v-html.js'
import { requireDefaultPropRule } from './require-default-prop.js'
import { noComputedSideEffectsRule } from './no-computed-side-effects.js'

export const vueRules: Record<string, RuleDefinition> = {
  'vue/no-mutating-props': noMutatingPropsRule,
  'vue/no-v-html': noVHtmlRule,
  'vue/require-default-prop': requireDefaultPropRule,
  'vue/no-computed-side-effects': noComputedSideEffectsRule,
}

export { noMutatingPropsRule } from './no-mutating-props.js'
export { noVHtmlRule } from './no-v-html.js'
export { requireDefaultPropRule } from './require-default-prop.js'
export { noComputedSideEffectsRule } from './no-computed-side-effects.js'
