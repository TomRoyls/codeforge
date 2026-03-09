import { noDeprecatedApiRule } from './no-deprecated-api.js'
import { noEvalRule } from './no-eval.js'

export const securityRules = {
  'no-deprecated-api': noDeprecatedApiRule,
  'no-eval': noEvalRule,
}

export { noDeprecatedApiRule, noEvalRule }
