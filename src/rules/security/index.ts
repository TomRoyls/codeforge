import { noDeprecatedApiRule } from './no-deprecated-api.js'
import { noDynamicDeleteRule } from './no-dynamic-delete.js'
import { noEvalRule } from './no-eval.js'
import { noUnsafeReturnRule } from './no-unsafe-return.js'
import { noUnsafeTypeAssertionRule } from './no-unsafe-type-assertion.js'

export const securityRules = {
  'no-deprecated-api': noDeprecatedApiRule,
  'no-dynamic-delete': noDynamicDeleteRule,
  'no-eval': noEvalRule,
  'no-unsafe-return': noUnsafeReturnRule,
  'no-unsafe-type-assertion': noUnsafeTypeAssertionRule,
}

export {
  noDeprecatedApiRule,
  noDynamicDeleteRule,
  noEvalRule,
  noUnsafeReturnRule,
  noUnsafeTypeAssertionRule,
}
