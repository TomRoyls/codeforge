import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface PreferFunctionComponentOptions extends RuleOptions {}

const LIFECYCLE_METHODS = new Set([
  'componentDidMount',
  'componentDidUpdate',
  'componentWillMount',
  'componentWillReceiveProps',
  'componentWillUnmount',
  'componentWillUpdate',
  'shouldComponentUpdate',
  'getSnapshotBeforeUpdate',
  'componentDidCatch',
  'getDerivedStateFromProps',
  'getDerivedStateFromError',
])

export const preferFunctionComponentRule: RuleDefinition<PreferFunctionComponentOptions> = {
  create(_options: PreferFunctionComponentOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete() {
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (!Node.isClassDeclaration(node)) return

          const heritage = node.getHeritageClauses()
          let extendsReact = false
          for (const clause of heritage) {
            const types = clause.getTypeNodes()
            for (const t of types) {
              const text = t.getText()
              if (text.includes('Component') || text.includes('PureComponent') || text.includes('React.Component')) {
                extendsReact = true
              }
            }
          }

          if (!extendsReact) return

          let usesLifecycle = false
          let usesThisState = false

          const methods = node.getMethods()
          for (const method of methods) {
            const name = method.getName()
            if (LIFECYCLE_METHODS.has(name)) {
              usesLifecycle = true
            }
            if (name === 'state' || name === 'setState') {
              usesThisState = true
            }
          }

          for (const prop of node.getProperties()) {
            if (prop.getName() === 'state') {
              usesThisState = true
            }
          }

          if (usesLifecycle || usesThisState) return

          const range = getNodeRange(node)
          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: 'Class component could be converted to a function component.',
            range,
            ruleId: 'react/prefer-function-component',
            severity: 'info',
            suggestion: 'Convert this class component to a function component for better performance and readability.',
          })
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'patterns',
    description: 'Suggests function components over class components when no lifecycle methods or state are used',
    name: 'react/prefer-function-component',
    recommended: false,
    severity: 'info',
  },
}

export default preferFunctionComponentRule
