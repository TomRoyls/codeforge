import { noConstantBinaryExpressionRule } from './no-constant-binary-expression.js'
import { noEmptyCatchRule } from './no-empty-catch.js'
import { noEmptyCharacterClassRule } from './no-empty-character-class.js'
import { noEmptyFunctionRule } from './no-empty-function.js'
import { noThrowLiteralRule } from './no-throw-literal.js'
import { noUselessCatchRule } from './no-useless-catch.js'



export const correctnessRules = {
  'no-constant-binary-expression': noConstantBinaryExpressionRule,
  'no-empty-catch': noEmptyCatchRule,
  'no-empty-character-class': noEmptyCharacterClassRule,
  'no-empty-function': noEmptyFunctionRule,
  'no-throw-literal': noThrowLiteralRule,
  'no-useless-catch': noUselessCatchRule,
}

export {noConstantBinaryExpressionRule} from './no-constant-binary-expression.js'
export {noEmptyCatchRule} from './no-empty-catch.js'
export {noEmptyCharacterClassRule} from './no-empty-character-class.js'
export {noEmptyFunctionRule} from './no-empty-function.js'
export {noThrowLiteralRule} from './no-throw-literal.js'
export {noUselessCatchRule} from './no-useless-catch.js'