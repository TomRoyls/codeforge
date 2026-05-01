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
import { noInnerHTMLRule } from './no-innerhtml.js'
import { noBannedPropertiesRule } from './no-banned-properties.js'
import { noDocumentWriteRule } from './no-document-write.js'
import { noRegexConstructorRule } from './no-regex-constructor.js'
import { noRegexConcatRule } from './no-regex-concat.js'
import { noUnsafeArgumentRule } from './no-unsafe-argument.js'
import { noRestrictedGlobalsRule } from './no-restricted-globals.js'
import { noRestrictedPropertiesRule } from './no-restricted-properties.js'
import { noRestrictedImportsRule } from './no-restricted-imports.js'

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
  'no-innerhtml': noInnerHTMLRule,
  'no-banned-properties': noBannedPropertiesRule,
  'no-document-write': noDocumentWriteRule,
  'no-regex-concat': noRegexConcatRule,
  'no-regex-constructor': noRegexConstructorRule,
  'no-unsafe-argument': noUnsafeArgumentRule,
  'no-restricted-globals': noRestrictedGlobalsRule,
  'no-restricted-imports': noRestrictedImportsRule,
  'no-restricted-properties': noRestrictedPropertiesRule,
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
export {noInnerHTMLRule} from './no-innerhtml.js'
export {noBannedPropertiesRule} from './no-banned-properties.js'
export {noDocumentWriteRule} from './no-document-write.js'
export {noRegexConcatRule} from './no-regex-concat.js'
export {noRegexConstructorRule} from './no-regex-constructor.js'
export {noUnsafeArgumentRule} from './no-unsafe-argument.js'
export {noRestrictedGlobalsRule} from './no-restricted-globals.js'
export {noRestrictedImportsRule} from './no-restricted-imports.js'
export {noRestrictedPropertiesRule} from './no-restricted-properties.js'
