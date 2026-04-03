import { noDeprecatedApiRule } from './no-deprecated-api.js'
import { noDynamicDeleteRule } from './no-dynamic-delete.js'
import { noEvalRule } from './no-eval.js'
import { noUnsafeRegexRule } from './no-unsafe-regex.js'
import { noUnsafeReturnRule } from './no-unsafe-return.js'
import { noUnsafeTypeAssertionRule } from './no-unsafe-type-assertion.js'

export const securityRules = {
  'no-deprecated-api': noDeprecatedApiRule,
  'no-dynamic-delete': noDynamicDeleteRule,
  'no-eval': noEvalRule,
  'no-unsafe-regex': noUnsafeRegexRule,
  'no-unsafe-return': noUnsafeReturnRule,
  'no-unsafe-type-assertion': noUnsafeTypeAssertionRule,
}

export {
  noDeprecatedApiRule,
  noDynamicDeleteRule,
  noEvalRule,
  noUnsafeRegexRule,
  noUnsafeReturnRule,
  noUnsafeTypeAssertionRule,
}
