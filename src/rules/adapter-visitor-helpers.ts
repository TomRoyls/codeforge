import { Node } from 'ts-morph'

import type { RuleVisitor } from '../plugins/types.js'

import { ASSIGNMENT_OPERATORS, EXPORTABLE_KINDS, LOGICAL_OPERATORS } from './adapter-constants.js'
import {
  extractExportSpecifiers,
  extractImportSpecifiers,
  genericNodeCache,
  getExportInfo,
  nodeToGeneric,
  setParentRefs,
} from './adapter-node-converter.js'

type GenericNode = Record<string, unknown>

export function ensureGenericNode(node: Node): GenericNode {
  let genericNode = genericNodeCache.get(node)
  if (!genericNode) {
    genericNode = nodeToGeneric(node)
    setParentRefs(genericNode)

    try {
      const tsParent = node.getParent()
      if (tsParent && genericNodeCache.has(tsParent)) {
        genericNode.parent = genericNodeCache.get(tsParent)!
      }
    } catch {
      // Parent may not be accessible for all node types
    }

    genericNodeCache.set(node, genericNode)
  }

  return genericNode
}

export function applyTypeRewrites(kindName: string, genericNode: GenericNode): void {
  if (kindName === 'BinaryExpression' && ASSIGNMENT_OPERATORS.has(genericNode.operator as string)) {
    genericNode.type = 'AssignmentExpression'
  }

  if (kindName === 'BinaryExpression' && LOGICAL_OPERATORS.has(genericNode.operator as string)) {
    genericNode.type = 'LogicalExpression'
  }

  if (kindName === 'PrefixUnaryExpression') {
    const op = genericNode.operator as string
    if (op === '++' || op === '--') {
      genericNode.type = 'UpdateExpression'
      genericNode.prefix = true
    } else {
      genericNode.type = 'UnaryExpression'
    }
  }

  if (kindName === 'PostfixUnaryExpression') {
    genericNode.prefix = false
  }
}

export function dispatchExportDeclaration(
  kindName: string,
  node: Node,
  genericNode: GenericNode,
  pluginVisitor: RuleVisitor,
  suffix: string,
): void {
  if (kindName !== 'ExportDeclaration') return

  let exportSpecs: unknown[]
  if (suffix === '') {
    exportSpecs = extractExportSpecifiers(node)
    if (exportSpecs.length > 0) {
      genericNode.specifiers = exportSpecs
    }
  } else {
    exportSpecs = ((genericNode as GenericNode).specifiers as undefined | unknown[]) ?? []
    exportSpecs = exportSpecs.length > 0 ? exportSpecs : []
  }

  const sourceValue = (genericNode.source as string) ?? null
  const sourceLiteral = sourceValue
    ? {
        loc: genericNode.loc,
        range: genericNode.range,
        type: 'Literal',
        value: sourceValue,
      }
    : null

  if (exportSpecs.length === 0 && sourceValue) {
    const handler = pluginVisitor['ExportAllDeclaration' + suffix]
    if (handler) {
      handler({
        exported: null,
        exportKind: genericNode.exportKind ?? 'value',
        loc: genericNode.loc,
        range: genericNode.range,
        source: sourceLiteral,
        type: 'ExportAllDeclaration',
      })
    }
  } else {
    const handler = pluginVisitor['ExportNamedDeclaration' + suffix]
    if (handler) {
      handler({
        declaration: null,
        exportKind: genericNode.exportKind ?? 'value',
        loc: genericNode.loc,
        range: genericNode.range,
        source: sourceLiteral,
        specifiers: exportSpecs,
        type: 'ExportNamedDeclaration',
      })
    }
  }
}

export function dispatchExportWrapper(
  kindName: string,
  node: Node,
  genericNode: GenericNode,
  pluginVisitor: RuleVisitor,
  suffix: string,
): void {
  if (!EXPORTABLE_KINDS.has(kindName)) return

  const { isDefault, isExported } = getExportInfo(node)
  if (!isExported) return

  const exportWrapper: GenericNode = {
    declaration: genericNode,
    type: isDefault ? 'ExportDefaultDeclaration' : 'ExportNamedDeclaration',
    ...(isDefault ? {} : { specifiers: [] }),
    loc: genericNode.loc,
    range: genericNode.range,
    source: null,
  }
  const exportType = exportWrapper.type as string
  const handler = pluginVisitor[exportType + suffix]
  if (handler) {
    handler(exportWrapper)
  }
}

export function dispatchClassBody(
  kindName: string,
  genericNode: GenericNode,
  pluginVisitor: RuleVisitor,
  suffix: string,
): void {
  if (kindName !== 'ClassDeclaration' && kindName !== 'ClassExpression') return

  const {body} = genericNode
  if (!Array.isArray(body)) return

  const classBodyNode: GenericNode = {
    body,
    loc: genericNode.loc,
    parent: genericNode,
    range: genericNode.range,
    type: 'ClassBody',
  }

  if (suffix === '') {
    for (const member of body) {
      if (member && typeof member === 'object') {
        ;(member as GenericNode).parent = classBodyNode
      }
    }
  }

  const handler = pluginVisitor['ClassBody' + suffix]
  if (handler) {
    handler(classBodyNode)
  }
}

export function dispatchExportAssignment(
  kindName: string,
  genericNode: GenericNode,
  pluginVisitor: RuleVisitor,
  suffix: string,
): void {
  if (kindName !== 'ExportAssignment') return

  const defWrapper: GenericNode = {
    declaration: genericNode.expression ?? genericNode,
    loc: genericNode.loc,
    range: genericNode.range,
    type: 'ExportDefaultDeclaration',
  }
  const handler = pluginVisitor['ExportDefaultDeclaration' + suffix]
  if (handler) {
    handler(defWrapper)
  }
}

export function dispatchImportSpecifiers(
  kindName: string,
  node: Node,
  genericNode: GenericNode,
  pluginVisitor: RuleVisitor,
  suffix: string,
): void {
  if (kindName !== 'ImportDeclaration') return

  let specs: unknown[]
  if (suffix === '') {
    specs = extractImportSpecifiers(node)
    genericNode.specifiers = specs
  } else {
    specs = (genericNode as GenericNode).specifiers as unknown[]
    if (!Array.isArray(specs)) return
  }

  for (const spec of specs) {
    if (spec && typeof spec === 'object') {
      const specRec = spec as GenericNode
      const specType = specRec.type as string
      if (specType) {
        const handler = pluginVisitor[specType + suffix]
        if (handler) {
          handler(spec)
        }
      }
    }
  }
}
