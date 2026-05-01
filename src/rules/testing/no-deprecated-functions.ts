import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getPropertyName,
  toASTNode,
} from '../../utils/ast-helpers.js'

const DEPRECATED_FUNCTIONS: Record<
  string,
  Record<string, { replacement: string; message?: string }>
> = {
  expect: {
    addSnapshotSerializer: {
      replacement: 'configuration (snapshotSerializers)',
      message:
        'Use configuration `snapshotSerializers` option instead',
    },
  },
  jest: {
    genMockFromModule: { replacement: 'createMockFromModule' },
    resetModuleRegistry: { replacement: 'resetModules' },
    runTimersToTime: { replacement: 'advanceTimersByTime' },
    runTimersToTimeAsync: { replacement: 'advanceTimersByTimeAsync' },
  },
}

const TARGET_OBJECTS = new Set(Object.keys(DEPRECATED_FUNCTIONS))

export const noDeprecatedFunctionsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const object = toASTNode(callee.object)
        if (!object || object.type !== 'Identifier') return

        const objectName = object.name
        if (typeof objectName !== 'string' || !TARGET_OBJECTS.has(objectName))
          return

        const propertyName = getPropertyName(callee.property)
        if (propertyName === null) return

        const deprecatedForObj = DEPRECATED_FUNCTIONS[objectName]
        if (!deprecatedForObj) return

        const deprecationInfo = deprecatedForObj[propertyName]
        if (!deprecationInfo) return

        const fullName = objectName + '.' + propertyName + '()'
        const replacementInfo = deprecationInfo.message
          ? deprecationInfo.message
          : 'Use `' +
            objectName +
            '.' +
            deprecationInfo.replacement +
            '()` instead'

        context.report({
          loc: extractLocation(node),
          message:
            'Deprecated function `' +
            fullName +
            '` found. ' +
            replacementInfo,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow usage of deprecated Jest/Vitest functions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-deprecated-functions',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noDeprecatedFunctionsRule
