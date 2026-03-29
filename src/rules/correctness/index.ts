import { noThrowLiteralRule } from './no-throw-literal.js'
import { noConstantBinaryExpressionRule } from './no-constant-binary-expression.js'
import { noEmptyFunctionRule } from './no-empty-function.js'

export { noThrowLiteralRule, noConstantBinaryExpressionRule, noEmptyFunctionRule }

export const correctnessRules = {
  'no-throw-literal': noThrowLiteralRule,
  'no-constant-binary-expression': noConstantBinaryExpressionRule,
  'no-empty-function': noEmptyFunctionRule,
}
