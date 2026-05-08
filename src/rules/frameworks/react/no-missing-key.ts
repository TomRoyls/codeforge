import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface NoMissingKeyOptions extends RuleOptions {}

export const noMissingKeyRule: RuleDefinition<NoMissingKeyOptions> = {
  create(_options: NoMissingKeyOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete() {
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (!Node.isCallExpression(node)) return

          const expression = node.getExpression()
          if (!Node.isPropertyAccessExpression(expression)) return

          const methodName = expression.getName()
          if (methodName !== 'map') return

          const args = node.getArguments()
          if (args.length === 0) return

          const callbackArg = args[0]!
          if (!Node.isArrowFunction(callbackArg) && !Node.isFunctionExpression(callbackArg)) return

          const body = callbackArg.getBody()
          const bodyText = body.getText()

          const hasJsxElement = /<[A-Z][a-zA-Z]*[\s/>]/.test(bodyText) || /<div[\s/>]/.test(bodyText) || /<span[\s/>]/.test(bodyText) || /<li[\s/>]/.test(bodyText)
          if (!hasJsxElement) return

          const hasKeyProp = /\bkey\s*=/.test(bodyText)
          if (hasKeyProp) return

          const range = getNodeRange(node)
          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: 'Missing "key" prop for element in iterator. Add a unique key prop to each element.',
            range,
            ruleId: 'react/no-missing-key',
            severity: 'error',
            suggestion: 'Add a unique key prop to each element returned from the map callback.',
          })
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'correctness',
    description: 'Detects missing key prop in JSX map/iterator',
    name: 'react/no-missing-key',
    recommended: true,
    severity: 'error',
  },
}

export default noMissingKeyRule
