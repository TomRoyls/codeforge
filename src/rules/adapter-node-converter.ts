import { Node } from 'ts-morph'

import { KIND_NAME_ALIASES } from './adapter-constants.js'
import { convertCompilerNode, convertOperatorToken } from './adapter-converter.js'

interface AccessibilitySource {
  getAccessibility?: () => string | undefined
  hasModifier?: (text: string) => boolean
}

function getAccessibilityModifier(node: Node): string | undefined {
  const n = node as unknown as AccessibilitySource

  if (typeof n.getAccessibility === 'function') {
    const acc = n.getAccessibility()
    if (acc) return acc
    return undefined
  }

  if (typeof n.hasModifier === 'function') {
    if (n.hasModifier('private')) return 'private'
    if (n.hasModifier('protected')) return 'protected'
    if (n.hasModifier('public')) return 'public'
  }

  return undefined
}

function applyFunctionFlags(base: Record<string, unknown>, node: Node): void {
  if (Node.isFunctionDeclaration(node) || Node.isFunctionExpression(node)) {
    if (node.isAsync()) base.async = true
    if (node.isGenerator()) base.generator = true
  } else if (Node.isArrowFunction(node) && node.isAsync()) base.async = true
}

function applyClassMemberFlags(base: Record<string, unknown>, node: Node): void {
  if (Node.isPropertyDeclaration(node)) {
    if (node.isStatic()) base.static = true
    if (node.isReadonly()) base.readonly = true
    return
  }

  if (Node.isMethodDeclaration(node)) {
    base.method = true
    base.kind = 'method'
    if (node.isStatic()) base.static = true
    const acc = getAccessibilityModifier(node)
    if (acc) base.accessibility = acc
    return
  }

  if (Node.isConstructorDeclaration(node)) {
    base.kind = 'constructor'
    base.method = true
    const acc = getAccessibilityModifier(node)
    if (acc) base.accessibility = acc
    return
  }

  if (Node.isGetAccessorDeclaration(node)) {
    base.kind = 'get'
    base.method = true
    if (node.isStatic()) base.static = true
    const acc = getAccessibilityModifier(node)
    if (acc) base.accessibility = acc
    return
  }

  if (Node.isSetAccessorDeclaration(node)) {
    base.kind = 'set'
    base.method = true
    if (node.isStatic()) base.static = true
    const acc = getAccessibilityModifier(node)
    if (acc) base.accessibility = acc
  }
}

interface OptionalChainSource {
  hasQuestionDotToken?: () => boolean
  questionDotToken?: unknown
}

function applyOptionalChaining(base: Record<string, unknown>, node: Node): void {
  if (
    !Node.isPropertyAccessExpression(node) &&
    !Node.isElementAccessExpression(node) &&
    !Node.isCallExpression(node)
  )
    return

  const n = node as unknown as OptionalChainSource
  const isOptional =
    typeof n.hasQuestionDotToken === 'function'
      ? n.hasQuestionDotToken()
      : Boolean(n.questionDotToken)

  if (isOptional) base.optional = true
}

function applyRegexLiteral(base: Record<string, unknown>, kindName: string, node: Node): void {
  if (kindName !== 'RegularExpressionLiteral') return
  const regexText = node.getText()
  base.raw = regexText
  const regexMatch = regexText.match(/^\/(.*)\/([gimsuvy]*)$/)
  if (regexMatch) {
    base.regex = { flags: regexMatch[2], pattern: regexMatch[1] }
  }
}

function applyTypeOnlyFlags(base: Record<string, unknown>, node: Node): void {
  if (Node.isExportDeclaration(node)) {
    try {
      if (typeof node.isTypeOnly === 'function') {
        base.exportKind = node.isTypeOnly() ? 'type' : 'value'
      }
    } catch {
      /* guard against ts-morph version differences */
    }

    return
  }

  if (Node.isImportDeclaration(node)) {
    try {
      if (typeof node.isTypeOnly === 'function') {
        base.importKind = node.isTypeOnly() ? 'type' : 'value'
      }
    } catch {
      /* guard against ts-morph version differences */
    }
  }
}

interface ParamPropInfo {
  accessibility: string | undefined
  isParamProp: boolean
  override: boolean
  readonly: boolean
}

interface ParamPropNode {
  getAccessibility?: () => string | undefined
  hasOverrideKeyword?: () => boolean
  isParameterProperty?: () => boolean
  isReadonly?: () => boolean
}

function detectParamProp(node: Node): ParamPropInfo {
  const result: ParamPropInfo = {
    accessibility: undefined,
    isParamProp: false,
    override: false,
    readonly: false,
  }

  try {
    if (!Node.isParameterDeclaration(node)) return result
    const n = node as unknown as ParamPropNode
    if (typeof n.isParameterProperty !== 'function' || !n.isParameterProperty()) return result

    result.isParamProp = true
    if (typeof n.getAccessibility === 'function') {
      const acc = n.getAccessibility()
      if (acc) result.accessibility = acc
    }

    if (typeof n.isReadonly === 'function') result.readonly = n.isReadonly()
    if (typeof n.hasOverrideKeyword === 'function') result.override = n.hasOverrideKeyword()
  } catch {
    /* not a parameter property */
  }

  return result
}

function applyParameterTransform(base: Record<string, unknown>, node: Node): void {
  if (base.type !== 'Parameter') return

  const propInfo = detectParamProp(node)
  const hasRest = base.dotDotDotToken !== null && base.dotDotDotToken !== undefined
  const hasInit = base.init !== null && base.init !== undefined

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
    flattenSimpleParameter(base)
  }

  if (propInfo.isParamProp) {
    wrapInParamProperty(base, propInfo)
  }
}

function flattenSimpleParameter(base: Record<string, unknown>): void {
  const nameNode = base.name as Record<string, unknown> | undefined
  if (!nameNode || typeof nameNode !== 'object') return

  const savedTypeAnnotation = base.typeAnnotation
  const saved = { end: base.end, loc: base.loc, range: base.range, start: base.start }
  for (const key of Object.keys(base)) {
    delete base[key]
  }

  Object.assign(base, nameNode)
  if (savedTypeAnnotation !== undefined && savedTypeAnnotation !== null) {
    base.typeAnnotation = savedTypeAnnotation
  }
  if (nameNode.range === null || nameNode.range === undefined) {
    base.end = saved.end
    base.loc = saved.loc
    base.range = saved.range
    base.start = saved.start
  }
}

function wrapInParamProperty(base: Record<string, unknown>, propInfo: ParamPropInfo): void {
  const inner = { ...base }
  const savedRange = { end: base.end, loc: base.loc, range: base.range, start: base.start }
  for (const key of Object.keys(base)) {
    delete base[key]
  }

  base.accessibility = propInfo.accessibility ?? null
  base.decorators = []
  base.end = savedRange.end
  base.loc = savedRange.loc
  base.override = propInfo.override
  base.parameter = inner
  base.range = savedRange.range
  base.readonly = propInfo.readonly
  base.start = savedRange.start
  base.static = false
  base.type = 'TSParameterProperty'
}

function applyMethodSynthesis(base: Record<string, unknown>): void {
  if (base.method !== true || base.type !== 'MethodDefinition') return

  if (base.value !== undefined) {
    const value = base.value as Record<string, unknown>
    if (value.parent === undefined) value.parent = base
    if (value.loc === undefined && base.loc !== undefined) value.loc = base.loc
    if (value.range === undefined && base.range !== undefined) value.range = base.range
    if (value.returnType === undefined && base.returnType !== undefined) {
      value.returnType = base.returnType
      delete base.returnType
    }
    return
  }

  const value: Record<string, unknown> = {
    async: base.async === true,
    body: base.body ?? { body: [], type: 'BlockStatement' },
    generator: base.generator === true,
    id: null,
    loc: base.loc,
    params: base.params ?? [],
    parent: base,
    range: base.range,
    type: 'FunctionExpression',
  }
  if (base.returnType !== undefined) {
    value.returnType = base.returnType
    delete base.returnType
  }
  base.value = value
  delete base.body
  delete base.params
}

function applyChainExpressionSynthesis(base: Record<string, unknown>): void {
  if (base.optional !== true) return
  if (base.type !== 'MemberExpression' && base.type !== 'CallExpression') return

  const inner = { ...base }
  if (inner.type === 'MemberExpression') inner.type = 'OptionalMemberExpression'
  if (inner.type === 'CallExpression') inner.type = 'OptionalCallExpression'
  const savedRange = { end: base.end, loc: base.loc, range: base.range, start: base.start }
  for (const key of Object.keys(base)) {
    delete base[key]
  }

  base.end = savedRange.end
  base.expression = inner
  base.loc = savedRange.loc
  base.range = savedRange.range
  base.start = savedRange.start
  base.type = 'ChainExpression'
}

function extractDefaultImport(clause: Record<string, unknown>): unknown {
  if (!clause.name || typeof clause.name !== 'object') return undefined
  const name = clause.name as Record<string, unknown>
  return {
    end: name.end,
    local: { name: name.text, type: 'Identifier', value: name.text },
    range: [name.pos, name.end],
    start: name.pos,
    type: 'ImportDefaultSpecifier',
  }
}

function extractNamedBindingSpecifiers(bindings: Record<string, unknown>): unknown[] {
  const specifiers: unknown[] = []

  if (Array.isArray(bindings.elements)) {
    for (const el of bindings.elements) {
      const spec = buildImportSpecifier(el)
      if (spec) specifiers.push(spec)
    }
  }

  if (bindings.name && typeof bindings.name === 'object') {
    const name = bindings.name as Record<string, unknown>
    specifiers.push({
      end: bindings.end ?? name.end,
      local: { name: name.text, type: 'Identifier', value: name.text },
      range: [bindings.pos ?? name.pos, bindings.end ?? name.end],
      start: bindings.pos ?? name.pos,
      type: 'ImportNamespaceSpecifier',
    })
  }

  return specifiers
}

function buildImportSpecifier(el: unknown): Record<string, unknown> | undefined {
  if (!el || typeof el !== 'object') return undefined
  const e = el as Record<string, unknown>
  const spec: Record<string, unknown> = {
    end: e.end,
    range: [e.pos, e.end],
    start: e.pos,
    type: 'ImportSpecifier',
  }
  if (e.name && typeof e.name === 'object') {
    const nameObj = e.name as Record<string, unknown>
    spec.local = { name: nameObj.text, type: 'Identifier', value: nameObj.text }
  }

  if (e.propertyName && typeof e.propertyName === 'object') {
    const pn = e.propertyName as Record<string, unknown>
    spec.imported = { name: pn.text, type: 'Identifier', value: pn.text }
  } else if (e.name && typeof e.name === 'object') {
    const nameObj = e.name as Record<string, unknown>
    spec.imported = { name: nameObj.text, type: 'Identifier', value: nameObj.text }
  }

  spec.importKind = typeof e.isTypeOnly === 'boolean' ? (e.isTypeOnly ? 'type' : 'value') : 'value'
  return spec
}

function buildExportSpecifier(el: unknown): Record<string, unknown> | undefined {
  if (!el || typeof el !== 'object') return undefined
  const e = el as Record<string, unknown>
  const spec: Record<string, unknown> = {
    end: e.end,
    range: [e.pos, e.end],
    start: e.pos,
    type: 'ExportSpecifier',
  }
  if (e.name && typeof e.name === 'object') {
    const nameObj = e.name as Record<string, unknown>
    spec.exported = { name: nameObj.text, type: 'Identifier', value: nameObj.text }
    spec.local = { name: nameObj.text, type: 'Identifier', value: nameObj.text }
  }

  if (e.propertyName && typeof e.propertyName === 'object') {
    const pn = e.propertyName as Record<string, unknown>
    spec.exported = { name: pn.text, type: 'Identifier', value: pn.text }
  }

  spec.exportKind = typeof e.isTypeOnly === 'boolean' ? (e.isTypeOnly ? 'type' : 'value') : 'value'
  return spec
}

function scanModifiers(modifiers: Array<{ getKindName: () => string }>): {
  isDefault: boolean
  isExported: boolean
} {
  let isExported = false
  let isDefault = false

  for (const mod of modifiers) {
    const modKind = mod.getKindName()
    if (modKind === 'ExportKeyword') isExported = true
    if (modKind === 'DefaultKeyword') isDefault = true
  }

  // eslint-disable-next-line perfectionist/sort-objects
  return { isExported, isDefault }
}

// eslint-disable-next-line perfectionist/sort-object-types
export function getExportInfo(node: Node): { isExported: boolean; isDefault: boolean } {
  try {
    const n = node as unknown as { getModifiers?: () => Array<{ getKindName: () => string }> }
    if (typeof n.getModifiers !== 'function') {
      // eslint-disable-next-line perfectionist/sort-objects
      return { isExported: false, isDefault: false }
    }

    const modifiers = n.getModifiers()
    if (modifiers) return scanModifiers(modifiers)
  } catch {
    // Not all node types support getModifiers
  }

  // eslint-disable-next-line perfectionist/sort-objects
  return { isExported: false, isDefault: false }
}

export function extractImportSpecifiers(node: Node): unknown[] {
  const specifiers: unknown[] = []

  try {
    const { compilerNode } = node as unknown as { compilerNode: Record<string, unknown> }
    if (!compilerNode) return specifiers

    const clause = compilerNode.importClause as Record<string, unknown> | undefined
    if (!clause) return specifiers

    const defaultSpec = extractDefaultImport(clause)
    if (defaultSpec) specifiers.push(defaultSpec)

    if (clause.namedBindings && typeof clause.namedBindings === 'object') {
      const bindings = clause.namedBindings as Record<string, unknown>
      specifiers.push(...extractNamedBindingSpecifiers(bindings))
    }
  } catch {
    // Compiler node not available
  }

  return specifiers
}

export function extractExportSpecifiers(node: Node): unknown[] {
  const specifiers: unknown[] = []

  try {
    const { compilerNode } = node as unknown as { compilerNode: Record<string, unknown> }
    if (!compilerNode) return specifiers

    const exportClause = compilerNode.exportClause as Record<string, unknown> | undefined
    if (!exportClause || !Array.isArray(exportClause.elements)) return specifiers

    for (const el of exportClause.elements) {
      const spec = buildExportSpecifier(el)
      if (spec) specifiers.push(spec)
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

  const kindName = node.getKindName()
  const estreeType = KIND_NAME_ALIASES[kindName] ?? kindName
  const base: Record<string, unknown> = {
    end,
    loc: {
      end: { column: endPos.column, line: endPos.line },
      start: { column: startPos.column, line: startPos.line },
    },
    range: [start, end] as [number, number],
    start,
    text: node.getText(),
    type: estreeType,
  }

  if (estreeType === 'MemberExpression') {
    base.computed = kindName === 'ElementAccessExpression'
  }

  if (typeof node.getKind === 'function') {
    applyFunctionFlags(base, node)
    applyClassMemberFlags(base, node)
    applyRegexLiteral(base, kindName, node)

    if (Node.isShorthandPropertyAssignment(node)) {
      base.shorthand = true
    }

    applyOptionalChaining(base, node)
    applyTypeOnlyFlags(base, node)
  }

  // Enhancement properties from compiler node traversal
  const enhanced = convertCompilerNode(node, 0)
  if (enhanced) {
    for (const [key, val] of Object.entries(enhanced)) {
      if (!(key in base)) {
        base[key] = key === 'operatorToken' || key === 'operator' ? convertOperatorToken(val) : val
      }
    }
  }

  applyParameterTransform(base, node)
  applyMethodSynthesis(base)

  if (base.type === 'CallExpression' && !base.optional) {
    const callee = base.callee as Record<string, unknown> | undefined
    if (callee?.type === 'OptionalMemberExpression' || callee?.optional === true) {
      base.optional = true
    }
  }

  applyChainExpressionSynthesis(base)

  return base
}

export function setParentRefs(
  root: Record<string, unknown>,
  parent: null | Record<string, unknown> = null,
): void {
  const visited = new WeakSet<Record<string, unknown>>()
  const stack: Array<{ node: Record<string, unknown>; parent: null | Record<string, unknown> }> = [
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
        pushChildrenToStack(val, current, stack)
      }
    }
  }
}

function pushChildrenToStack(
  val: unknown,
  parent: Record<string, unknown>,
  stack: Array<{ node: Record<string, unknown>; parent: null | Record<string, unknown> }>,
): void {
  if (Array.isArray(val)) {
    for (const item of val) {
      if (isAstNode(item)) {
        stack.push({ node: item, parent })
      }
    }
  } else if (isAstNode(val)) {
    stack.push({ node: val, parent })
  }
}

function isAstNode(val: unknown): val is Record<string, unknown> {
  return (
    val !== null &&
    typeof val === 'object' &&
    !Array.isArray(val) &&
    (val as Record<string, unknown>).type !== undefined
  )
}

// Module-level cache for nodeToGeneric results, shared across all rules.
// WeakMap entries are GC'd when the ts-morph SourceFile is released.
// This eliminates redundant conversions: with 209 rules, each node was
// previously converted 209×. Now it's converted once.
export const genericNodeCache = new WeakMap<Node, Record<string, unknown>>()
