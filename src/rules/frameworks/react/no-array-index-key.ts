import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface NoArrayIndexKeyOptions extends RuleOptions {}

export const noArrayIndexKeyRule: RuleDefinition<NoArrayIndexKeyOptions> = {
  create(_options: NoArrayIndexKeyOptions) {
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
          if (expression.getName() !== 'map') return

          const args = node.getArguments()
          if (args.length === 0) return

          const callbackArg = args[0]!
          if (!Node.isArrowFunction(callbackArg) && !Node.isFunctionExpression(callbackArg)) return

          const params = callbackArg.getParameters()
          if (params.length < 2) return

          const indexParam = params[1]!
          const indexName = indexParam.getName()

          const body = callbackArg.getBody()
          const bodyText = body.getText()

          const keyPattern = new RegExp(`\\bkey\\s*=\\s*\\{\\s*${indexName}\\s*\\}`)
          if (!keyPattern.test(bodyText)) return

          const range = getNodeRange(node)
          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: `Using array index as key prop is not recommended. Use a unique identifier instead.`,
            range,
            ruleId: 'react/no-array-index-key',
            severity: 'warning',
            suggestion: 'Use a stable unique identifier from the data instead of the array index.',
          })
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'performance',
    description: 'Detects using array index as key prop in JSX',
    name: 'react/no-array-index-key',
    recommended: true,
    severity: 'warning',
  },
}

export default noArrayIndexKeyRule
