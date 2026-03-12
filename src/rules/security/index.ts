import { noDeprecatedApiRule } from './no-deprecated-api.js'
import { noEvalRule } from './no-eval.js'
import { noUnsafeTypeAssertionRule } from './no-unsafe-type-assertion.js'

export const securityRules = {
  'no-deprecated-api': noDeprecatedApiRule,
  'no-eval': noEvalRule,
  'no-unsafe-type-assertion': noUnsafeTypeAssertionRule,
}

export { noDeprecatedApiRule, noEvalRule, noUnsafeTypeAssertionRule }
