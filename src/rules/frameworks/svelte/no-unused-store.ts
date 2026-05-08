import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface NoUnusedStoreOptions extends RuleOptions {}

export const noUnusedStoreRule: RuleDefinition<NoUnusedStoreOptions> = {
  create(_options: NoUnusedStoreOptions) {
    const violations: RuleViolation[] = []
    const importedStores = new Map<string, Node>()
    const usedStores = new Set<string>()

    return {
      onComplete() {
        for (const [name, node] of importedStores) {
          if (usedStores.has(name)) continue
          const range = getNodeRange(node)
          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: `Store '${name}' is imported but never used.`,
            range,
            ruleId: 'svelte/no-unused-store',
            severity: 'warning',
            suggestion: `Remove unused store '${name}' or use it with the '$' prefix.`,
          })
        }
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (Node.isImportSpecifier(node)) {
            const source = node.getImportDeclaration()?.getModuleSpecifierValue() ?? ''
            if (!source.includes('store')) return

            const nameNode = node.getNameNode()
            if (!Node.isIdentifier(nameNode)) return

            const name = nameNode.getText()
            importedStores.set(name, nameNode)
          }

          if (Node.isIdentifier(node)) {
            const name = node.getText()
            if (importedStores.has(name)) {
              const parent = node.getParent()
              if (!Node.isImportSpecifier(parent)) {
                usedStores.add(name)
              }
            }

            if (name.startsWith('$') && name.length > 1) {
              const storeName = name.substring(1)
              usedStores.add(storeName)
            }
          }
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'correctness',
    description: 'Detects unused Svelte stores',
    name: 'svelte/no-unused-store',
    recommended: true,
    severity: 'warning',
  },
}

export default noUnusedStoreRule
