import { Node } from 'ts-morph'
import { KIND_NAME_ALIASES } from './adapter-constants.js'
import { convertCompilerNode, convertOperatorToken } from './adapter-converter.js'

export function getExportInfo(node: Node): { isExported: boolean; isDefault: boolean } {
  let isExported = false
  let isDefault = false
  try {
    const n = node as unknown as { getModifiers?: () => Array<{ getKindName: () => string }> }
    if (typeof n.getModifiers === 'function') {
      const modifiers = n.getModifiers()
      if (modifiers) {
        for (const mod of modifiers) {
          const modKind = mod.getKindName()
          if (modKind === 'ExportKeyword') isExported = true
          if (modKind === 'DefaultKeyword') isDefault = true
        }
      }
    }
  } catch {
    // Not all node types support getModifiers
  }
  return { isExported, isDefault }
}

export function extractImportSpecifiers(node: Node): unknown[] {
  const specifiers: unknown[] = []
  try {
    const compilerNode = (node as unknown as { compilerNode: Record<string, unknown> }).compilerNode
    if (!compilerNode) return specifiers
    const clause = compilerNode.importClause as Record<string, unknown> | undefined
    if (!clause) return specifiers

    // Default import: import Foo from '...'
    if (clause.name && typeof clause.name === 'object') {
      const name = clause.name as Record<string, unknown>
      specifiers.push({
        type: 'ImportDefaultSpecifier',
        local: { type: 'Identifier', name: name.text, value: name.text },
        range: [name.pos, name.end],
        start: name.pos,
        end: name.end,
      })
    }

    // Named/namespace bindings
    if (clause.namedBindings && typeof clause.namedBindings === 'object') {
      const bindings = clause.namedBindings as Record<string, unknown>

      // import { A, B } from '...'
      if (Array.isArray(bindings.elements)) {
        for (const el of bindings.elements) {
          if (!el || typeof el !== 'object') continue
          const e = el as Record<string, unknown>
          const spec: Record<string, unknown> = {
            type: 'ImportSpecifier',
            range: [e.pos, e.end],
            start: e.pos,
            end: e.end,
          }
          if (e.name && typeof e.name === 'object') {
            const nameObj = e.name as Record<string, unknown>
            spec.local = { type: 'Identifier', name: nameObj.text, value: nameObj.text }
          }
          if (e.propertyName && typeof e.propertyName === 'object') {
            const pn = e.propertyName as Record<string, unknown>
            spec.imported = { type: 'Identifier', name: pn.text, value: pn.text }
          } else if (e.name && typeof e.name === 'object') {
            const nameObj = e.name as Record<string, unknown>
            spec.imported = { type: 'Identifier', name: nameObj.text, value: nameObj.text }
          }
          spec.importKind =
            typeof e.isTypeOnly === 'boolean' ? (e.isTypeOnly ? 'type' : 'value') : 'value'
          specifiers.push(spec)
        }
      }

      // import * as Foo from '...'
      if (bindings.name && typeof bindings.name === 'object') {
        const name = bindings.name as Record<string, unknown>
        specifiers.push({
          type: 'ImportNamespaceSpecifier',
          local: { type: 'Identifier', name: name.text, value: name.text },
          range: [bindings.pos ?? name.pos, bindings.end ?? name.end],
          start: bindings.pos ?? name.pos,
          end: bindings.end ?? name.end,
        })
      }
    }
  } catch {
    // Compiler node not available
  }
  return specifiers
}

export function extractExportSpecifiers(node: Node): unknown[] {
  const specifiers: unknown[] = []
  try {
    const compilerNode = (node as unknown as { compilerNode: Record<string, unknown> }).compilerNode
    if (!compilerNode) return specifiers

    const exportClause = compilerNode.exportClause as Record<string, unknown> | undefined
    if (exportClause && Array.isArray(exportClause.elements)) {
      for (const el of exportClause.elements) {
        if (!el || typeof el !== 'object') continue
        const e = el as Record<string, unknown>
        const spec: Record<string, unknown> = {
          type: 'ExportSpecifier',
          range: [e.pos, e.end],
          start: e.pos,
          end: e.end,
        }
        if (e.name && typeof e.name === 'object') {
          const nameObj = e.name as Record<string, unknown>
          spec.local = { type: 'Identifier', name: nameObj.text, value: nameObj.text }
          spec.exported = { type: 'Identifier', name: nameObj.text, value: nameObj.text }
        }
        if (e.propertyName && typeof e.propertyName === 'object') {
          const pn = e.propertyName as Record<string, unknown>
          spec.exported = { type: 'Identifier', name: pn.text, value: pn.text }
        }
        spec.exportKind =
          typeof e.isTypeOnly === 'boolean' ? (e.isTypeOnly ? 'type' : 'value') : 'value'
        specifiers.push(spec)
      }
    }
  } catch {
    // Compiler node not available
  }
  return specifiers
}

export function nodeToGeneric(node: Node): Record<string, unknown> {
  const sourceFile = node.getSourceFile()
  const start = node.getStart()
  const end = node.getEnd()
  const startPos = sourceFile.getLineAndColumnAtPos(start)
  const endPos = sourceFile.getLineAndColumnAtPos(end)

  // Base properties
  const kindName = node.getKindName()
  const estreeType = KIND_NAME_ALIASES[kindName] ?? kindName
  const base: Record<string, unknown> = {
    type: estreeType,
    range: [start, end] as [number, number],
    loc: {
      start: { line: startPos.line, column: startPos.column },
      end: { line: endPos.line, column: endPos.column },
    },
    start,
    end,
    text: node.getText(),
  }

  if (estreeType === 'MemberExpression') {
    base.computed = kindName === 'ElementAccessExpression'
  }
  if (typeof node.getKind === 'function') {
    if (Node.isFunctionDeclaration(node)) {
      if (node.isAsync()) base.async = true
      if (node.isGenerator()) base.generator = true
    }
    if (Node.isFunctionExpression(node)) {
      if (node.isAsync()) base.async = true
      if (node.isGenerator()) base.generator = true
    }
    if (Node.isArrowFunction(node)) {
      if (node.isAsync()) base.async = true
    }
    if (Node.isPropertyDeclaration(node)) {
      if (node.isStatic()) base.static = true
      if (node.isReadonly()) base.readonly = true
    }
    if (Node.isMethodDeclaration(node)) {
      base.method = true
      base.kind = 'method'
      if (node.isStatic()) base.static = true
      if ((node as any).getAccessibility) {
        const acc = (node as any).getAccessibility()
        if (acc) base.accessibility = acc
      }
    }
    if (Node.isConstructorDeclaration(node)) {
      base.kind = 'constructor'
      base.method = true
      if ((node as any).getAccessibility) {
        const acc = (node as any).getAccessibility()
        if (acc) base.accessibility = acc
      }
    }
    if (Node.isGetAccessorDeclaration(node)) {
      base.kind = 'get'
      base.method = true
      if (node.isStatic()) base.static = true
      if ((node as any).getAccessibility) {
        const acc = (node as any).getAccessibility()
        if (acc) base.accessibility = acc
      }
    }
    if (Node.isSetAccessorDeclaration(node)) {
      base.kind = 'set'
      base.method = true
      if (node.isStatic()) base.static = true
      if ((node as any).getAccessibility) {
        const acc = (node as any).getAccessibility()
        if (acc) base.accessibility = acc
      }
    }
    if (kindName === 'RegularExpressionLiteral') {
      const regexText = node.getText()
      base.raw = regexText
      const regexMatch = regexText.match(/^\/(.*)\/([gimsuvy]*)$/)
      if (regexMatch) {
        base.regex = { pattern: regexMatch[1], flags: regexMatch[2] }
      }
    }
    if (Node.isShorthandPropertyAssignment(node)) {
      base.shorthand = true
    }
    if (Node.isPropertyAccessExpression(node)) {
      if ((node as any).questionDotToken) base.optional = true
    }
    if (Node.isElementAccessExpression(node)) {
      if ((node as any).questionDotToken) base.optional = true
    }
    if (Node.isCallExpression(node)) {
      if ((node as any).questionDotToken) base.optional = true
    }
    // Extract exportKind/importKind for type-only imports/exports
    if (Node.isExportDeclaration(node)) {
      try {
        if (typeof (node as any).isTypeOnly === 'function') {
          base.exportKind = (node as any).isTypeOnly() ? 'type' : 'value'
        }
      } catch {}
    }
    if (Node.isImportDeclaration(node)) {
      try {
        if (typeof (node as any).isTypeOnly === 'function') {
          base.importKind = (node as any).isTypeOnly() ? 'type' : 'value'
        }
      } catch {}
    }
  }

  // Enhancement properties from compiler node traversal
  const enhanced = convertCompilerNode(node, 0)
  if (enhanced) {
    // Merge enhanced into base, but base properties win
    for (const [key, val] of Object.entries(enhanced)) {
      if (!(key in base)) {
        // Convert operator tokens
        if (key === 'operatorToken' || key === 'operator') {
          base[key] = convertOperatorToken(val)
        } else {
          base[key] = val
        }
      }
    }
  }

  // Detect parameter properties for TSParameterProperty synthesis
  let isParamProp = false
  let paramPropAccessibility: string | null = null
  let paramPropReadonly = false
  let paramPropOverride = false
  if (base.type === 'Parameter') {
    try {
      if (Node.isParameterDeclaration(node) && (node as any).isParameterProperty?.()) {
        isParamProp = true
        if (typeof (node as any).getAccessibility === 'function') {
          const acc = (node as any).getAccessibility()
          paramPropAccessibility = acc || null
        }
        if (typeof (node as any).isReadonly === 'function') {
          paramPropReadonly = (node as any).isReadonly()
        }
        if (typeof (node as any).hasOverrideKeyword === 'function') {
          paramPropOverride = (node as any).hasOverrideKeyword()
        }
      }
    } catch {
      /* not a parameter property */
    }
  }

  // Synthesize RestElement / AssignmentPattern for function parameters
  if (base.type === 'Parameter') {
    const hasRest = base.dotDotDotToken != null
    const hasInit = base.init != null
    if (hasRest) {
      base.type = 'RestElement'
      base.argument = base.name
      delete base.name
      delete base.init
      delete base.dotDotDotToken
      delete base.questionToken
      delete base.typeAnnotation
      delete base.modifiers
    } else if (hasInit) {
      base.type = 'AssignmentPattern'
      base.left = base.name
      base.right = base.init
      delete base.name
      delete base.init
      delete base.dotDotDotToken
      delete base.questionToken
      delete base.typeAnnotation
      delete base.modifiers
    } else {
      // Simple parameter — flatten to the name node (Identifier / ObjectPattern / ArrayPattern)
      const nameNode = base.name as Record<string, unknown> | undefined
      if (nameNode && typeof nameNode === 'object') {
        const saved = { range: base.range, loc: base.loc, start: base.start, end: base.end }
        for (const key of Object.keys(base)) {
          delete (base as any)[key]
        }
        Object.assign(base, nameNode)
        if ((nameNode as any).range == null) {
          base.range = saved.range
          base.loc = saved.loc
          base.start = saved.start
          base.end = saved.end
        }
      }
    }
  }

  // Wrap parameter properties in TSParameterProperty node
  if (isParamProp) {
    const inner = { ...(base as Record<string, unknown>) }
    const savedRange = { range: base.range, loc: base.loc, start: base.start, end: base.end }
    for (const key of Object.keys(base)) {
      delete (base as any)[key]
    }
    base.type = 'TSParameterProperty'
    base.parameter = inner
    base.accessibility = paramPropAccessibility
    base.readonly = paramPropReadonly
    base.override = paramPropOverride
    base.static = false
    base.decorators = []
    base.range = savedRange.range
    base.loc = savedRange.loc
    base.start = savedRange.start
    base.end = savedRange.end
  }

  // Synthesize .value FunctionExpression for method-like nodes
  if (base.method === true && base.type === 'MethodDefinition' && !base.value) {
    const funcBody = base.body
    const funcParams = base.params
    const isAsync = base.async === true
    const isGenerator = base.generator === true
    base.value = {
      type: 'FunctionExpression',
      id: null,
      params: funcParams ?? [],
      body: funcBody ?? { type: 'BlockStatement', body: [] },
      async: isAsync,
      generator: isGenerator,
      range: base.range,
      loc: base.loc,
      parent: base,
    }
    // ESTree: body/params live on .value only
    delete base.body
    delete base.params
  }

  // Synthesize ChainExpression wrapper for optional chaining (?.)
  if (
    base.optional === true &&
    (base.type === 'MemberExpression' || base.type === 'CallExpression')
  ) {
    const inner = { ...(base as Record<string, unknown>) }
    const savedRange = { range: base.range, loc: base.loc, start: base.start, end: base.end }
    for (const key of Object.keys(base)) {
      delete (base as any)[key]
    }
    base.type = 'ChainExpression'
    base.expression = inner
    base.range = savedRange.range
    base.loc = savedRange.loc
    base.start = savedRange.start
    base.end = savedRange.end
  }

  return base
}

export function setParentRefs(
  root: Record<string, unknown>,
  parent: Record<string, unknown> | null = null,
): void {
  // Iterative traversal using an explicit stack to avoid
  // "Maximum call stack size exceeded" on deeply nested AST nodes.
  const visited = new WeakSet<Record<string, unknown>>()
  const stack: Array<{ node: Record<string, unknown>; parent: Record<string, unknown> | null }> = [
    { node: root, parent },
  ]

  while (stack.length > 0) {
    const entry = stack.pop()!
    const { node: current, parent: currentParent } = entry

    if (visited.has(current)) continue
    visited.add(current)

    if (currentParent !== null) {
      current.parent = currentParent
    }

    for (const val of Object.values(current)) {
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          for (const item of val) {
            if (
              item &&
              typeof item === 'object' &&
              !Array.isArray(item) &&
              (item as Record<string, unknown>).type
            ) {
              stack.push({ node: item as Record<string, unknown>, parent: current })
            }
          }
        } else if ((val as Record<string, unknown>).type) {
          stack.push({ node: val as Record<string, unknown>, parent: current })
        }
      }
    }
  }
}

// Module-level cache for nodeToGeneric results, shared across all rules.
// WeakMap entries are GC'd when the ts-morph SourceFile is released.
// This eliminates redundant conversions: with 209 rules, each node was
// previously converted 209×. Now it's converted once.
export const genericNodeCache = new WeakMap<Node, Record<string, unknown>>()
