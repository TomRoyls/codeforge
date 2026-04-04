import { noThrowLiteralRule } from './no-throw-literal.js'
import { noConstantBinaryExpressionRule } from './no-constant-binary-expression.js'
import { noEmptyFunctionRule } from './no-empty-function.js'
import { noEmptyCharacterClassRule } from './no-empty-character-class.js'
import { noEmptyCatchRule } from './no-empty-catch.js'

export {
  noThrowLiteralRule,
  noConstantBinaryExpressionRule,
  noEmptyFunctionRule,
  noEmptyCharacterClassRule,
  noEmptyCatchRule,
}

export const correctnessRules = {
  'no-throw-literal': noThrowLiteralRule,
  'no-constant-binary-expression': noConstantBinaryExpressionRule,
  'no-empty-function': noEmptyFunctionRule,
  'no-empty-character-class': noEmptyCharacterClassRule,
  'no-empty-catch': noEmptyCatchRule,
}
