import { noThrowLiteralRule } from './no-throw-literal.js'
import { noConstantBinaryExpressionRule } from './no-constant-binary-expression.js'

export { noThrowLiteralRule, noConstantBinaryExpressionRule }

export const correctnessRules = {
  'no-throw-literal': noThrowLiteralRule,
  'no-constant-binary-expression': noConstantBinaryExpressionRule,
}
