import { noDeprecatedApiRule } from './no-deprecated-api.js'
import { noDynamicDeleteRule } from './no-dynamic-delete.js'
import { noEvalRule } from './no-eval.js'
import { noHardcodedCredentialsRule } from './no-hardcoded-credentials.js'
import { noSqlInjectionRule } from './no-sql-injection.js'
import { noUnsafeCallRule } from './no-unsafe-call.js'
import { noUnsafeHtmlRule } from './no-unsafe-html.js'
import { noUnsafeMemberAccessRule } from './no-unsafe-member-access.js'
import { noUnsafeRegexRule } from './no-unsafe-regex.js'
import { noUnsafeReturnRule } from './no-unsafe-return.js'
import { noUnsafeTypeAssertionRule } from './no-unsafe-type-assertion.js'
import { noWeakCryptoRule } from './no-weak-crypto.js'

export const securityRules = {
  'no-deprecated-api': noDeprecatedApiRule,
  'no-dynamic-delete': noDynamicDeleteRule,
  'no-eval': noEvalRule,
  'no-hardcoded-credentials': noHardcodedCredentialsRule,
  'no-sql-injection': noSqlInjectionRule,
  'no-unsafe-call': noUnsafeCallRule,
  'no-unsafe-html': noUnsafeHtmlRule,
  'no-unsafe-member-access': noUnsafeMemberAccessRule,
  'no-unsafe-regex': noUnsafeRegexRule,
  'no-unsafe-return': noUnsafeReturnRule,
  'no-unsafe-type-assertion': noUnsafeTypeAssertionRule,
  'no-weak-crypto': noWeakCryptoRule,
}



export {noDeprecatedApiRule} from './no-deprecated-api.js'
export {noDynamicDeleteRule} from './no-dynamic-delete.js'
export {noEvalRule} from './no-eval.js'
export {noHardcodedCredentialsRule} from './no-hardcoded-credentials.js'
export {noSqlInjectionRule} from './no-sql-injection.js'
export {noUnsafeCallRule} from './no-unsafe-call.js'
export {noUnsafeHtmlRule} from './no-unsafe-html.js'
export {noUnsafeMemberAccessRule} from './no-unsafe-member-access.js'
export {noUnsafeRegexRule} from './no-unsafe-regex.js'
export {noUnsafeReturnRule} from './no-unsafe-return.js'
export {noUnsafeTypeAssertionRule} from './no-unsafe-type-assertion.js'
export {noWeakCryptoRule} from './no-weak-crypto.js'