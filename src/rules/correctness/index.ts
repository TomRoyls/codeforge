import { noAsyncConstructorRule } from './no-async-constructor.js'
import { noConstantBinaryExpressionRule } from './no-constant-binary-expression.js'
import { noEmptyCatchRule } from './no-empty-catch.js'
import { noEmptyCharacterClassRule } from './no-empty-character-class.js'
import { noEmptyFunctionRule } from './no-empty-function.js'
import { noThrowLiteralRule } from './no-throw-literal.js'
import { noUselessCatchRule } from './no-useless-catch.js'
import { noInvalidUseBeforeDefRule } from './no-invalid-use-before-def.js'
import { noImplicitGlobalsRule } from './no-implicit-globals.js'
import { noNonNullAssertedOptionalChainRule } from './no-non-null-asserted-optional-chain.js'
import { noMisleadingSpreadRule } from './no-misleading-spread.js'
import { noApproximateConstantsRule } from './no-approximate-constants.js'
import { noImplicitUndefinedRule } from './no-implicit-undefined.js'
import { noMisleadingAssertionRule } from './no-misleading-assertion.js'
import { noUnsafeNegationRule } from '../patterns/no-unsafe-negation.js'
import { noRequireImportsRule } from './no-require-imports.js'
import { noCompareNegationRule } from './no-compare-negation.js'



export const correctnessRules = {
  'no-async-constructor': noAsyncConstructorRule,
  'no-constant-binary-expression': noConstantBinaryExpressionRule,
  'no-empty-catch': noEmptyCatchRule,
  'no-empty-character-class': noEmptyCharacterClassRule,
  'no-empty-function': noEmptyFunctionRule,
  'no-throw-literal': noThrowLiteralRule,
  'no-useless-catch': noUselessCatchRule,
  'no-invalid-use-before-def': noInvalidUseBeforeDefRule,
  'no-implicit-globals': noImplicitGlobalsRule,
  'no-non-null-asserted-optional-chain': noNonNullAssertedOptionalChainRule,
  'no-misleading-spread': noMisleadingSpreadRule,
  'no-approximate-constants': noApproximateConstantsRule,
  'no-implicit-undefined': noImplicitUndefinedRule,
  'no-misleading-assertion': noMisleadingAssertionRule,
  'no-unsafe-negation': noUnsafeNegationRule,
  'no-require-imports': noRequireImportsRule,
  'no-compare-negation': noCompareNegationRule,
}

export {noAsyncConstructorRule} from './no-async-constructor.js'
export {noConstantBinaryExpressionRule} from './no-constant-binary-expression.js'
export {noEmptyCatchRule} from './no-empty-catch.js'
export {noEmptyCharacterClassRule} from './no-empty-character-class.js'
export {noEmptyFunctionRule} from './no-empty-function.js'
export {noThrowLiteralRule} from './no-throw-literal.js'
export {noUselessCatchRule} from './no-useless-catch.js'
export {noInvalidUseBeforeDefRule} from './no-invalid-use-before-def.js'
export {noImplicitGlobalsRule} from './no-implicit-globals.js'
export {noNonNullAssertedOptionalChainRule} from './no-non-null-asserted-optional-chain.js'
export {noMisleadingSpreadRule} from './no-misleading-spread.js'
export {noApproximateConstantsRule} from './no-approximate-constants.js'
export {noImplicitUndefinedRule} from './no-implicit-undefined.js'
export {noMisleadingAssertionRule} from './no-misleading-assertion.js'
export {noUnsafeNegationRule} from '../patterns/no-unsafe-negation.js'
export {noRequireImportsRule} from './no-require-imports.js'
export {noCompareNegationRule} from './no-compare-negation.js'
