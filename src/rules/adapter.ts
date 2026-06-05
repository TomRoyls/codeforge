import { type ModifierableNode, Node, type SourceFile } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'

import type { ASTVisitor, RuleViolation, VisitorContext } from '../ast/visitor.js'
import type {
  RuleContext as PluginRuleContext,
  RuleDefinition as PluginRuleDefinition,
  ReportDescriptor,
} from '../plugins/types.js'
import type { RuleDefinition, RuleMeta, RuleOptions } from './types.js'

import {
  ASSIGNMENT_OPERATORS,
  defaultConfig,
  EXPORTABLE_KINDS,
  KIND_NAME_ALIASES,
  KIND_SPECIFIC_MAP,
  LOGICAL_OPERATORS,
  MAX_DEPTH,
  OPERATOR_TOKEN_MAP,
  PROPERTY_MAP,
  silentLogger,
  SKIP_KEYS,
} from './adapter-constants.js'
import {
  setRangeSourceText,
  skipTrivia,
} from './adapter-converter.js'

function getAccessibilityModifier(
  node: ModifierableNode,
): 'private' | 'protected' | 'public' | undefined {
  if (node.hasModifier('private')) return 'private'
  if (node.hasModifier('protected')) return 'protected'
  if (node.hasModifier('public')) return 'public'
  return undefined
}

// Build a clean kind-number-to-name map, filtering out range markers (First*, Last*)
// that share enum values with actual node types
const KIND_MAP: Record<number, string> = {}
for (const [name, value] of Object.entries(SyntaxKind)) {
  if (typeof value !== 'number') continue
  if (name.startsWith('First') || name.startsWith('Last')) continue
  KIND_MAP[value] = name
}

function getExportInfo(node: Node): { isDefault: boolean; isExported: boolean } {
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

  return { isDefault, isExported }
}

function extractImportSpecifiers(node: Node): unknown[] {
  const specifiers: unknown[] = []
  try {
    const { compilerNode } = node as unknown as { compilerNode: Record<string, unknown> }
    if (!compilerNode) return specifiers
    const clause = compilerNode.importClause as Record<string, unknown> | undefined
    if (!clause) return specifiers

    // Default import: import Foo from '...'
    if (clause.name && typeof clause.name === 'object') {
      const name = clause.name as Record<string, unknown>
      specifiers.push({
        end: name.end,
        local: { name: name.text, type: 'Identifier', value: name.text },
        range: [name.pos, name.end],
        start: name.pos,
        type: 'ImportDefaultSpecifier',
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

          spec.importKind =
            typeof e.isTypeOnly === 'boolean' ? (e.isTypeOnly ? 'type' : 'value') : 'value'
          specifiers.push(spec)
        }
      }

      // import * as Foo from '...'
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
    }
  } catch {
    // Compiler node not available
  }

  return specifiers
}

function extractExportSpecifiers(node: Node): unknown[] {
  const specifiers: unknown[] = []
  try {
    const { compilerNode } = node as unknown as { compilerNode: Record<string, unknown> }
    if (!compilerNode) return specifiers

    const exportClause = compilerNode.exportClause as Record<string, unknown> | undefined
    if (exportClause && Array.isArray(exportClause.elements)) {
      for (const el of exportClause.elements) {
        if (!el || typeof el !== 'object') continue
        const e = el as Record<string, unknown>
        const spec: Record<string, unknown> = {
          end: e.end,
          range: [e.pos, e.end],
          start: e.pos,
          type: 'ExportSpecifier',
        }
        if (e.name && typeof e.name === 'object') {
          const nameObj = e.name as Record<string, unknown>
          spec.local = { name: nameObj.text, type: 'Identifier', value: nameObj.text }
          spec.exported = { name: nameObj.text, type: 'Identifier', value: nameObj.text }
        }

        if (e.propertyName && typeof e.propertyName === 'object') {
          const pn = e.propertyName as Record<string, unknown>
          spec.exported = { name: pn.text, type: 'Identifier', value: pn.text }
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

function convertOperatorToken(token: unknown): string {
  if (typeof token === 'string') return token
  if (typeof token === 'number') {
    const tokenName = KIND_MAP[token as number] ?? ''
    return (OPERATOR_TOKEN_MAP[tokenName] ?? tokenName) || String(token)
  }

  if (token && typeof token === 'object') {
    const obj = token as Record<string, unknown>
    if (typeof obj.type === 'string') {
      const mapped = OPERATOR_TOKEN_MAP[obj.type]
      if (mapped) return mapped
    }

    if (typeof obj.getText === 'function') return (obj.getText as () => string)()
    if (obj.operator !== undefined) return String(obj.operator)
  }

  return String(token)
}

function applyRawLiteralValues(
  result: Record<string, unknown>,
  kindName: string,
  raw: Record<string, unknown>,
): void {
  if (kindName === 'StringLiteral' && raw.text !== undefined) {
    result.value = raw.text
    result.raw = `"${raw.text}"`
  } else if (
    (kindName === 'NumericLiteral' || kindName === 'BigIntLiteral') &&
    raw.text !== undefined
  ) {
    result.value = Number(raw.text)
    result.raw = raw.text
  } else if (kindName === 'Identifier' && raw.escapedText !== undefined) {
    result.name = raw.escapedText
    result.value = raw.escapedText
  } else {
    switch (kindName) {
      case 'FalseKeyword': {
        result.value = false
        result.raw = 'false'

        break
      }

      case 'NullKeyword': {
        result.value = null
        result.raw = 'null'

        break
      }

      case 'TrueKeyword': {
        result.value = true
        result.raw = 'true'

        break
      }

      default: {
        if (kindName === 'RegularExpressionLiteral' && raw.text !== undefined) {
          result.raw = raw.text as string
          const regexText = raw.text as string
          const regexMatch = regexText.match(/^\/(.*)\/([gimsuvy]*)$/)
          if (regexMatch) {
            result.regex = { flags: regexMatch[2], pattern: regexMatch[1] }
          }
        }
      }
    }
  }
}

function convertRawCaseClauses(val: unknown, depth: number): undefined | unknown[] {
  if (!val || typeof val !== 'object') return undefined
  const cb = val as Record<string, unknown>
  if (!Array.isArray(cb.clauses)) return undefined
  const converted: unknown[] = []
  for (const clause of cb.clauses) {
    if (
      clause &&
      typeof clause === 'object' &&
      typeof (clause as Record<string, unknown>).kind === 'number'
    ) {
      converted.push(convertRawCompilerNode(clause as Record<string, unknown>, depth + 1))
    }
  }

  return converted
}

function synthesizeTemplateExpression(
  result: Record<string, unknown>,
  raw: Record<string, unknown>,
  depth: number,
): void {
  if (result.quasis || result.expressions) return

  const quasis: unknown[] = []
  const expressions: unknown[] = []

  // head → first TemplateElement (tail=false)
  const head = raw.head as Record<string, unknown> | undefined
  if (head && typeof head.kind === 'number') {
    quasis.push({
      range:
        typeof head.pos === 'number' && typeof head.end === 'number'
          ? [head.pos as number, head.end as number]
          : undefined,
      tail: false,
      type: 'TemplateElement',
      value: {
        cooked: (head.text ?? head.rawText) as string,
        raw: (head.rawText ?? head.text) as string,
      },
    })
  }

  // templateSpans → alternating expression + TemplateElement
  const spans = raw.templateSpans as Array<Record<string, unknown>> | undefined
  if (Array.isArray(spans)) {
    for (let i = 0; i < spans.length; i++) {
      const span = spans[i]! as Record<string, unknown>
      const spanExpr = span.expression as Record<string, unknown> | undefined
      if (spanExpr && typeof spanExpr.kind === 'number') {
        expressions.push(convertRawCompilerNode(spanExpr, depth + 1))
      }

      const lit = span.literal as Record<string, unknown> | undefined
      if (lit && typeof lit.kind === 'number') {
        const isTail = i === spans.length - 1
        quasis.push({
          range:
            typeof lit.pos === 'number' && typeof lit.end === 'number'
              ? [lit.pos as number, lit.end as number]
              : undefined,
          tail: isTail,
          type: 'TemplateElement',
          value: {
            cooked: (lit.text ?? lit.rawText) as string,
            raw: (lit.rawText ?? lit.text) as string,
          },
        })
      }
    }
  }

  result.quasis = quasis
  result.expressions = expressions
}

function synthesizeNoSubstitutionTemplate(
  result: Record<string, unknown>,
  raw: Record<string, unknown>,
): void {
  if (result.quasis) return

  const rawText = (raw.rawText ?? raw.text) as string
  const cookedText = (raw.text ?? raw.rawText) as string
  result.quasis = [
    {
      tail: true,
      type: 'TemplateElement',
      value: { cooked: cookedText, raw: rawText },
    },
  ]
  result.expressions = []
}

function assignRawProperty(
  result: Record<string, unknown>,
  key: string,
  val: unknown,
  estreeName: string,
  depth: number,
): void {
  if (val === null || val === undefined) {
    result[estreeName] = val
  } else if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    result[estreeName] = val
  } else if (
    key === 'operatorToken' &&
    val !== null &&
    typeof val === 'object' &&
    typeof (val as Record<string, unknown>).kind === 'number'
  ) {
    const tokenKindName = KIND_MAP[(val as Record<string, unknown>).kind as number] ?? ''
    result[estreeName] = OPERATOR_TOKEN_MAP[tokenKindName] ?? tokenKindName
  } else if (
    key === 'variableDeclaration' &&
    val !== null &&
    typeof val === 'object' &&
    typeof (val as Record<string, unknown>).kind === 'number'
  ) {
    const varDecl = val as Record<string, unknown>
    result[estreeName] =
      varDecl.name && typeof varDecl.name === 'object'
        ? convertRawCompilerNode(varDecl.name as Record<string, unknown>, depth + 1)
        : null
  } else if (
    typeof val === 'object' &&
    typeof (val as Record<string, unknown>).kind === 'number'
  ) {
    result[estreeName] = convertRawCompilerNode(val as Record<string, unknown>, depth + 1)
  } else if (Array.isArray(val)) {
    const converted: unknown[] = []
    for (const item of val) {
      if (
        item &&
        typeof item === 'object' &&
        typeof (item as Record<string, unknown>).kind === 'number'
      ) {
        // OmittedExpression (sparse array hole) → null
        const itemKind = (item as Record<string, unknown>).kind as number
        const itemKindName = KIND_MAP[itemKind] ?? ''
        if (itemKindName === 'OmittedExpression') {
          converted.push(null)
        } else {
          converted.push(convertRawCompilerNode(item as Record<string, unknown>, depth + 1))
        }
      } else {
        converted.push(item)
      }
    }

    result[estreeName] = converted
  }
}

function applyRawPostFixups(
  result: Record<string, unknown>,
  kindName: string,
  raw: Record<string, unknown>,
): void {
  // BinaryExpression with assignment operator → AssignmentExpression
  if (result.type === 'BinaryExpression' && ASSIGNMENT_OPERATORS.has(result.operator as string)) {
    result.type = 'AssignmentExpression'
  }

  // BinaryExpression with logical operator → LogicalExpression
  if (result.type === 'BinaryExpression' && LOGICAL_OPERATORS.has(result.operator as string)) {
    result.type = 'LogicalExpression'
  }

  // UnaryExpression/UpdateExpression: convert numeric operator to string
  if (typeof result.operator === 'number') {
    const tokenName = KIND_MAP[result.operator as number] ?? ''
    result.operator = (OPERATOR_TOKEN_MAP[tokenName] ?? tokenName) || String(result.operator)
  }

  // PrefixUnaryExpression: ++/-- → UpdateExpression with prefix:true
  if (kindName === 'PrefixUnaryExpression') {
    const op = result.operator as string
    if (op === '++' || op === '--') {
      result.type = 'UpdateExpression'
      result.prefix = true
    }
  }

  // PostfixUnaryExpression: always UpdateExpression with prefix:false
  if (kindName === 'PostfixUnaryExpression') {
    result.prefix = false
  }

  if (kindName === 'DeleteExpression') {
    result.operator = 'delete'
    result.prefix = true
  }

  if (kindName === 'TypeOfExpression') {
    result.operator = 'typeof'
    result.prefix = true
  }

  if (kindName === "VoidExpression") {
    result.operator = 'void'
    result.prefix = true
  }

  if (kindName === 'ElementAccessExpression') {
    result.computed = true
  }

  if (kindName === 'PropertyAccessExpression') {
    result.computed = false
  }

  if (kindName === 'PropertyAssignment' || kindName === 'PropertyDeclaration') {
    const rawName = raw.name as Record<string, unknown> | undefined
    if (rawName && typeof rawName.kind === 'number') {
      result.computed = KIND_MAP[rawName.kind as number] === 'ComputedPropertyName'
    }
  }

  if (kindName === 'ShorthandPropertyAssignment') {
    result.shorthand = true
    result.computed = false
    if (result.key && !result.value) {
      result.value = result.key
    }
  }

  if (kindName === 'GetAccessor') {
    result.kind = 'get'
  }

  if (kindName === 'SetAccessor') {
    result.kind = 'set'
  }

  if (kindName === 'MethodDeclaration') {
    result.kind = 'method'
  }

  if (kindName === 'Constructor') {
    result.kind = 'constructor'
  }

  if (kindName === 'ClassDeclaration' || kindName === 'ClassExpression') {
    const heritageClauses = raw.heritageClauses as Record<string, unknown>[] | undefined
    if (Array.isArray(heritageClauses)) {
      for (const clause of heritageClauses) {
        if (typeof clause?.token === 'number') {
          const tokenName = KIND_MAP[clause.token as number]
          if (tokenName === 'ExtendsKeyword') {
            const types = clause.types as Record<string, unknown>[]
            if (Array.isArray(types) && types.length > 0) {
              const expr = types[0]?.expression
              if (expr && typeof expr === 'object' && typeof (expr as Record<string, unknown>).kind === 'number') {
                result.superClass = convertRawCompilerNode(expr as Record<string, unknown>, 0)
              }
            }
            break
          }
        }
      }
    }
  }

  // VariableDeclarationList: convert flags to ESTree kind property ('var'/'let'/'const')
  if (result.type === 'VariableDeclaration') {
    let flags: number | undefined
    if (typeof raw.flags === 'number' && (raw.flags as number) & 3) {
      flags = raw.flags as number
    } else {
      const declList = raw.declarationList as Record<string, unknown> | undefined
      if (typeof declList?.flags === 'number') {
        flags = declList.flags as number
      }
    }

    if (typeof flags === 'number') {
      if (flags & 2) {
        result.kind = 'const'
      } else if (flags & 1) {
        result.kind = 'let'
      } else {
        result.kind = 'var'
      }
    }
  }

  if (raw.questionDotToken !== undefined && raw.questionDotToken !== null) {
    result.optional = true
    delete result.questionDotToken
    if (result.type === 'MemberExpression') result.type = 'OptionalMemberExpression'
    if (result.type === 'CallExpression') result.type = 'OptionalCallExpression'
  }

  // Wrap returnType in TSTypeAnnotation if not already wrapped
  // ESTree typescript-eslint: returnType = { type: 'TSTypeAnnotation', typeAnnotation: <type node> }
  const rt = result.returnType as Record<string, unknown> | undefined
  if (rt && typeof rt === 'object' && rt.type !== 'TSTypeAnnotation') {
    result.returnType = { type: 'TSTypeAnnotation', typeAnnotation: rt }
  }

  const ta = result.typeAnnotation as Record<string, unknown> | undefined
  if (ta && typeof ta === 'object' && ta.type !== 'TSTypeAnnotation') {
    result.typeAnnotation = { type: 'TSTypeAnnotation', typeAnnotation: ta }
  }
}

function convertRawCompilerNode(
  raw: Record<string, unknown>,
  depth: number,
): null | Record<string, unknown> {
  if (depth >= MAX_DEPTH) return null
  if (!raw || typeof raw !== 'object') return null

  const kind: number = raw.kind as number
  const kindName: string = KIND_MAP[kind] ?? `Unknown(${kind})`
  const kindMap = KIND_SPECIFIC_MAP[kindName]

  // ParenthesizedExpression: unwrap to inner expression (ESTree has no Parens node)
  if (kindName === 'ParenthesizedExpression' && raw.expression && typeof raw.expression === 'object') {
    return convertRawCompilerNode(raw.expression as Record<string, unknown>, depth)
  }

  // ComputedPropertyName: unwrap to inner expression (ESTree uses computed:true on parent Property)
  if (kindName === 'ComputedPropertyName' && raw.expression && typeof raw.expression === 'object') {
    return convertRawCompilerNode(raw.expression as Record<string, unknown>, depth)
  }

  const result: Record<string, unknown> = {}
  if (typeof raw.pos === 'number' && typeof raw.end === 'number') {
    const startPos = skipTrivia(raw.pos as number)
    result.range = [startPos, raw.end] as [number, number]
    result.start = startPos
    result.end = raw.end
  }

  result.type = KIND_NAME_ALIASES[kindName] ?? kindName

  applyRawLiteralValues(result, kindName, raw)

  for (const [key, val] of Object.entries(raw)) {
    if (key.startsWith('_')) continue
    if (SKIP_KEYS.has(key)) continue

    const estreeName = kindMap?.[key] ?? PROPERTY_MAP[key] ?? key

    if (key === 'caseBlock') {
      const converted = convertRawCaseClauses(val, depth)
      if (converted !== undefined) {
        result[estreeName] = converted
      }

      continue
    }

    // VariableStatement: flatten declarationList.declarations to declarations array
    // ESTree VariableDeclaration has { kind, declarations[] } — no intermediate list node
    if (kindName === 'VariableStatement' && key === 'declarationList') {
      const declList = val as Record<string, unknown>
      if (declList && Array.isArray(declList.declarations)) {
        result.declarations = declList.declarations.map(
          (d: unknown) =>
            d && typeof d === 'object' && typeof (d as Record<string, unknown>).kind === 'number'
              ? convertRawCompilerNode(d as Record<string, unknown>, depth)
              : d,
        )
      }

      continue
    }

    // ClassDeclaration/ClassExpression: wrap members in ClassBody node
    // ESTree: class.body = { type: 'ClassBody', body: [...members] }
    if (
      (kindName === 'ClassDeclaration' || kindName === 'ClassExpression') &&
      key === 'members' &&
      Array.isArray(val)
    ) {
      result.body = {
        body: val.map(
          (m: unknown) =>
            m && typeof m === 'object' && typeof (m as Record<string, unknown>).kind === 'number'
              ? convertRawCompilerNode(m as Record<string, unknown>, depth)
              : m,
        ),
        type: 'ClassBody',
      }

      continue
    }

    // InterfaceDeclaration: wrap members in TSInterfaceBody node
    // ESTree typescript-eslint: iface.body = { type: 'TSInterfaceBody', body: [...members] }
    if (kindName === 'InterfaceDeclaration' && key === 'members' && Array.isArray(val)) {
      result.body = {
        body: val.map(
          (m: unknown) =>
            m && typeof m === 'object' && typeof (m as Record<string, unknown>).kind === 'number'
              ? convertRawCompilerNode(m as Record<string, unknown>, depth)
              : m,
        ),
        type: 'TSInterfaceBody',
      }

      continue
    }

    if (kindName === 'TemplateExpression' && (key === 'head' || key === 'templateSpans')) {
      synthesizeTemplateExpression(result, raw, depth)

      continue
    }

    if (kindName === 'NoSubstitutionTemplateLiteral' && key === 'text') {
      synthesizeNoSubstitutionTemplate(result, raw)

      continue
    }

    assignRawProperty(result, key, val, estreeName, depth)
  }

  applyRawPostFixups(result, kindName, raw)

  return result
}

function applyCompilerLiteralValue(
  result: Record<string, unknown>,
  kindName: string,
  node: Node,
): void {
  switch (kindName) {
    case 'BigIntLiteral':
    // falls through
    case 'NumericLiteral': {
      const text = node.getText()
      result.value = Number(text)
      result.raw = text

      break
    }

    case 'FalseKeyword': {
      result.value = false
      result.raw = 'false'

      break
    }

    case 'NullKeyword': {
      result.value = null
      result.raw = 'null'

      break
    }

    case 'RegularExpressionLiteral': {
      const regexText = node.getText()
      result.raw = regexText
      const regexMatch = regexText.match(/^\/(.*)\/([gimsuvy]*)$/)
      if (regexMatch) {
        result.regex = { flags: regexMatch[2], pattern: regexMatch[1] }
      }

      break
    }

    case 'StringLiteral': {
      const text = node.getText()
      result.value = text.slice(1, -1) // Remove quotes
      result.raw = text

      break
    }

    case 'TrueKeyword': {
      result.value = true
      result.raw = 'true'

      break
    }
    // No default
  }
}

function convertCompilerCaseClauses(val: unknown, depth: number): undefined | unknown[] {
  if (!val || typeof val !== 'object') return undefined
  const cb = val as Record<string, unknown>
  if (!Array.isArray(cb.clauses)) return undefined
  const converted: unknown[] = []
  for (const clause of cb.clauses) {
    if (
      clause &&
      typeof clause === 'object' &&
      typeof (clause as Record<string, unknown>).kind === 'number'
    ) {
      converted.push(convertRawCompilerNode(clause as Record<string, unknown>, depth + 1))
    }
  }

  return converted
}

function convertCompilerArrayItem(item: unknown, depth: number): unknown {
  if (
    item &&
    typeof item === 'object' &&
    typeof (item as Record<string, unknown>).kind === 'number'
  ) {
    const itemKindName = KIND_MAP[(item as Record<string, unknown>).kind as number] ?? ''
    if (itemKindName === 'OmittedExpression') {
      return null
    }

    return convertRawCompilerNode(item as Record<string, unknown>, depth + 1)
  }

  return item
}

function assignCompilerProperty(
  result: Record<string, unknown>,
  key: string,
  val: unknown,
  estreeName: string,
  depth: number,
): void {
  if (val === null || val === undefined) {
    result[estreeName] = val
  } else if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    result[estreeName] = val
  } else if (
    key === 'operatorToken' &&
    val !== null &&
    typeof val === 'object' &&
    typeof (val as Record<string, unknown>).kind === 'number'
  ) {
    const tokenKindName = KIND_MAP[(val as Record<string, unknown>).kind as number] ?? ''
    result[estreeName] = OPERATOR_TOKEN_MAP[tokenKindName] ?? tokenKindName
  } else if (
    key === 'variableDeclaration' &&
    val !== null &&
    typeof val === 'object' &&
    typeof (val as Record<string, unknown>).kind === 'number'
  ) {
    const varDecl = val as Record<string, unknown>
    result[estreeName] =
      varDecl.name && typeof varDecl.name === 'object'
        ? convertRawCompilerNode(varDecl.name as Record<string, unknown>, depth + 1)
        : null
  } else if (typeof val === 'object' && typeof (val as Record<string, unknown>).kind === 'number') {
    result[estreeName] = convertRawCompilerNode(val as Record<string, unknown>, depth + 1)
  } else if (Array.isArray(val)) {
    result[estreeName] = val.map((item) => convertCompilerArrayItem(item, depth))
  }
}

function applyPostConvertFixups(
  result: Record<string, unknown>,
  kindName: string,
  compilerNode: Record<string, unknown> | undefined,
): void {
  if (result.type === 'BinaryExpression' && ASSIGNMENT_OPERATORS.has(result.operator as string)) {
    result.type = 'AssignmentExpression'
  }

  if (result.type === 'BinaryExpression' && LOGICAL_OPERATORS.has(result.operator as string)) {
    result.type = 'LogicalExpression'
  }

  if (typeof result.operator === 'number') {
    const tokenName = KIND_MAP[result.operator as number] ?? ''
    result.operator = (OPERATOR_TOKEN_MAP[tokenName] ?? tokenName) || String(result.operator)
  }

  // PrefixUnaryExpression: ++/-- → UpdateExpression with prefix:true
  if (kindName === 'PrefixUnaryExpression') {
    const op = result.operator as string
    if (op === '++' || op === '--') {
      result.type = 'UpdateExpression'
      result.prefix = true
    }
  }

  // PostfixUnaryExpression: always UpdateExpression with prefix:false
  if (kindName === 'PostfixUnaryExpression') {
    result.prefix = false
  }

  if (kindName === 'DeleteExpression') {
    result.operator = 'delete'
    result.prefix = true
  }

  if (kindName === 'TypeOfExpression') {
    result.operator = 'typeof'
    result.prefix = true
  }

  if (kindName === "VoidExpression") {
    result.operator = 'void'
    result.prefix = true
  }

  if (kindName === 'ElementAccessExpression') {
    result.computed = true
  }

  if (kindName === 'PropertyAccessExpression') {
    result.computed = false
  }

  if (kindName === 'ShorthandPropertyAssignment') {
    result.shorthand = true
    result.computed = false
    if (result.key && !result.value) {
      result.value = result.key
    }
  }

  if (kindName === 'GetAccessor') {
    result.kind = 'get'
  }

  if (kindName === 'SetAccessor') {
    result.kind = 'set'
  }

  if (kindName === 'MethodDeclaration') {
    result.kind = 'method'
  }

  if (kindName === 'Constructor') {
    result.kind = 'constructor'
  }

  if (kindName === 'ClassDeclaration' || kindName === 'ClassExpression') {
    const heritageClauses = compilerNode?.heritageClauses as Record<string, unknown>[] | undefined
    if (Array.isArray(heritageClauses)) {
      for (const clause of heritageClauses) {
        if (typeof clause?.token === 'number') {
          const tokenName = KIND_MAP[clause.token as number]
          if (tokenName === 'ExtendsKeyword') {
            const types = clause.types as Record<string, unknown>[]
            if (Array.isArray(types) && types.length > 0) {
              const expr = types[0]?.expression
              if (expr && typeof expr === 'object' && typeof (expr as Record<string, unknown>).kind === 'number') {
                result.superClass = convertRawCompilerNode(expr as Record<string, unknown>, 0)
              }
            }
            break
          }
        }
      }
    }
  }

  if (result.type === 'VariableDeclaration') {
    const rawFlags = compilerNode?.flags
    if (typeof rawFlags === 'number' && rawFlags & 3) {
      // NodeFlags.Const = 2, NodeFlags.Let = 1
      result.kind = rawFlags & 2 ? 'const' : 'let'
    } else {
      const declList = compilerNode?.declarationList as Record<string, unknown> | undefined
      const listFlags = declList?.flags
      if (typeof listFlags === 'number') {
        if (listFlags & 2) {
          result.kind = 'const'
        } else if (listFlags & 1) {
          result.kind = 'let'
        } else {
          result.kind = 'var'
        }
      }
    }
  }

  if (compilerNode?.questionDotToken !== undefined && compilerNode?.questionDotToken !== null) {
    result.optional = true
    delete result.questionDotToken
    if (result.type === 'MemberExpression') result.type = 'OptionalMemberExpression'
    if (result.type === 'CallExpression') result.type = 'OptionalCallExpression'
  }

  // Wrap returnType in TSTypeAnnotation if not already wrapped
  // ESTree typescript-eslint: returnType = { type: 'TSTypeAnnotation', typeAnnotation: <type node> }
  const rt = result.returnType as Record<string, unknown> | undefined
  if (rt && typeof rt === 'object' && rt.type !== 'TSTypeAnnotation') {
    result.returnType = { type: 'TSTypeAnnotation', typeAnnotation: rt }
  }

  const ta = result.typeAnnotation as Record<string, unknown> | undefined
  if (ta && typeof ta === 'object' && ta.type !== 'TSTypeAnnotation') {
    result.typeAnnotation = { type: 'TSTypeAnnotation', typeAnnotation: ta }
  }
}

function convertCompilerNode(node: Node, depth: number = 0): null | Record<string, unknown> {
  if (depth >= MAX_DEPTH) return null
  if (!node || typeof node !== 'object') return null

  let kindName: string
  try {
    kindName = node.getKindName()
  } catch {
    return null
  }

  const kindMap = KIND_SPECIFIC_MAP[kindName]

  const result: Record<string, unknown> = {
    type: KIND_NAME_ALIASES[kindName] ?? kindName,
  }

  const { compilerNode } = node as unknown as { compilerNode: Record<string, unknown> }
  if (
    compilerNode &&
    typeof compilerNode === 'object' &&
    typeof compilerNode.pos === 'number' &&
    typeof compilerNode.end === 'number'
  ) {
    const startPos = skipTrivia(compilerNode.pos as number)
    result.range = [startPos, compilerNode.end] as [number, number]
    result.start = startPos
    result.end = compilerNode.end
  }

  applyCompilerLiteralValue(result, kindName, node)

  try {
    const { compilerNode } = node as unknown as { compilerNode: Record<string, unknown> }
    if (compilerNode && typeof compilerNode === 'object') {
      for (const [key, val] of Object.entries(compilerNode)) {
        if (key.startsWith('_')) continue
        if (SKIP_KEYS.has(key)) continue

        const estreeName = kindMap?.[key] ?? PROPERTY_MAP[key] ?? key

        // Special: caseBlock -> extract clauses array as ESTree cases
        if (key === 'caseBlock') {
          const converted = convertCompilerCaseClauses(val, depth)
          if (converted !== undefined) {
            result[estreeName] = converted
          }

          continue
        }

        // VariableStatement: flatten declarationList.declarations to declarations array
        if (kindName === 'VariableStatement' && key === 'declarationList') {
          const declList = val as Record<string, unknown>
          if (declList && Array.isArray(declList.declarations)) {
            result.declarations = declList.declarations.map(
              (d: unknown) =>
                d && typeof d === 'object' && typeof (d as Record<string, unknown>).kind === 'number'
                  ? convertRawCompilerNode(d as Record<string, unknown>, depth)
                  : d,
            )
          }

          continue
        }

        // ClassDeclaration/ClassExpression: wrap members in ClassBody node
        if (
          (kindName === 'ClassDeclaration' || kindName === 'ClassExpression') &&
          key === 'members' &&
          Array.isArray(val)
        ) {
          result.body = {
            body: val.map(
              (m: unknown) =>
                m && typeof m === 'object' && typeof (m as Record<string, unknown>).kind === 'number'
                  ? convertRawCompilerNode(m as Record<string, unknown>, depth)
                  : m,
            ),
            type: 'ClassBody',
          }

          continue
        }

        // InterfaceDeclaration: wrap members in TSInterfaceBody
        // ESTree typescript-eslint: iface.body = { type: 'TSInterfaceBody', body: [...members] }
        if (kindName === 'InterfaceDeclaration' && key === 'members' && Array.isArray(val)) {
          result.body = {
            body: val.map(
              (m: unknown) =>
                m && typeof m === 'object' && typeof (m as Record<string, unknown>).kind === 'number'
                  ? convertRawCompilerNode(m as Record<string, unknown>, depth)
                  : m,
            ),
            type: 'TSInterfaceBody',
          }

          continue
        }

        assignCompilerProperty(result, key, val, estreeName, depth)
      }
    }
  } catch {
    // Some compiler properties may not be accessible on all node types
  }

  // Synthesize TemplateLiteral quasis/expressions from head/templateSpans
  if (kindName === 'TemplateExpression' && compilerNode) {
    synthesizeTemplateExpression(result, compilerNode, depth)
  } else if (kindName === 'NoSubstitutionTemplateLiteral' && compilerNode) {
    synthesizeNoSubstitutionTemplate(result, compilerNode)
  }

  applyPostConvertFixups(result, kindName, compilerNode)

  // ModuleDeclaration: detect namespace vs module keyword from source text
  // TypeScript flags don't reliably indicate namespace keyword
  if (kindName === 'ModuleDeclaration' && compilerNode) {
    try {
      const sf = node.getSourceFile()
      const fullText = sf.getFullText()
      const pos = skipTrivia(compilerNode.pos as number)
      const keywordMatch = fullText.slice(pos, pos + 15).match(/^(namespace|module)\b/)
      result.kind = keywordMatch?.[1] ?? 'module'
    } catch {
      result.kind = 'module'
    }
  }

  return result
}

function applyNodeModifiers(base: Record<string, unknown>, node: Node, kindName: string): void {
  if (typeof node.getKind !== 'function') return

  if (Node.isFunctionDeclaration(node)) {
    if (node.isAsync()) base.async = true
    if (node.isGenerator()) base.generator = true
  }

  if (Node.isFunctionExpression(node)) {
    if (node.isAsync()) base.async = true
    if (node.isGenerator()) base.generator = true
  }

  if (Node.isArrowFunction(node) && node.isAsync()) base.async = true
  if (Node.isPropertyDeclaration(node)) {
    if (node.isStatic()) base.static = true
    if (node.isReadonly()) base.readonly = true
  }

  if (Node.isMethodDeclaration(node)) {
    base.method = true
    base.kind = 'method'
    if (node.isStatic()) base.static = true
    const acc = getAccessibilityModifier(node)
    if (acc) base.accessibility = acc
  }

  if (Node.isConstructorDeclaration(node)) {
    base.kind = 'constructor'
    base.method = true
    const acc = getAccessibilityModifier(node)
    if (acc) base.accessibility = acc
  }

  if (Node.isGetAccessorDeclaration(node)) {
    base.kind = 'get'
    base.method = true
    if (node.isStatic()) base.static = true
    const acc = getAccessibilityModifier(node)
    if (acc) base.accessibility = acc
  }

  if (Node.isSetAccessorDeclaration(node)) {
    base.kind = 'set'
    base.method = true
    if (node.isStatic()) base.static = true
    const acc = getAccessibilityModifier(node)
    if (acc) base.accessibility = acc
  }

  if (kindName === 'RegularExpressionLiteral') {
    const regexText = node.getText()
    base.raw = regexText
    const regexMatch = regexText.match(/^\/(.*)\/([gimsuvy]*)$/)
    if (regexMatch) {
      base.regex = { flags: regexMatch[2], pattern: regexMatch[1] }
    }
  }

  if (Node.isShorthandPropertyAssignment(node)) {
    base.shorthand = true
  }

  if (Node.isPropertyAccessExpression(node) && node.hasQuestionDotToken()) base.optional = true
  if (Node.isElementAccessExpression(node) && node.hasQuestionDotToken()) base.optional = true
  if (Node.isCallExpression(node) && node.hasQuestionDotToken()) base.optional = true
  // Extract exportKind/importKind for type-only imports/exports
  if (Node.isExportDeclaration(node)) {
    try {
      if (node.isTypeOnly()) base.exportKind = 'type'
    } catch {
      // Not all export nodes support isTypeOnly
    }
  }

  if (Node.isImportDeclaration(node)) {
    try {
      if (node.isTypeOnly()) base.importKind = 'type'
    } catch {
      // Not all import nodes support isTypeOnly
    }
  }
}

function transformParameterNode(base: Record<string, unknown>): void {
  const savedTypeAnnotation = base.typeAnnotation
  const hasRest = base.dotDotDotToken !== null
  const hasInit = base.init !== null
  if (hasRest) {
    base.type = 'RestElement'
    base.argument = base.name
    delete base.name
    delete base.init
    delete base.dotDotDotToken
    delete base.questionToken
    delete base.modifiers
  } else if (hasInit) {
    base.type = 'AssignmentPattern'
    base.left = base.name
    base.right = base.init
    delete base.name
    delete base.init
    delete base.dotDotDotToken
    delete base.questionToken
    delete base.modifiers
  } else {
    // Simple parameter — flatten to the name node (Identifier / ObjectPattern / ArrayPattern)
    const nameNode = base.name as Record<string, unknown> | undefined
    if (nameNode && typeof nameNode === 'object') {
      const saved = { end: base.end, loc: base.loc, range: base.range, start: base.start }
      for (const key of Object.keys(base)) {
        delete base[key]
      }

      Object.assign(base, nameNode)
      if (savedTypeAnnotation !== undefined && savedTypeAnnotation !== null) {
        base.typeAnnotation = savedTypeAnnotation
      }
      if (nameNode.range === null) {
        base.range = saved.range
        base.loc = saved.loc
        base.start = saved.start
        base.end = saved.end
      }
    }
  }
}

function wrapParameterProperty(
  base: Record<string, unknown>,
  paramPropAccessibility: null | string,
  paramPropReadonly: boolean,
  paramPropOverride: boolean,
): void {
  const inner = { ...base }
  const savedRange = { end: base.end, loc: base.loc, range: base.range, start: base.start }
  for (const key of Object.keys(base)) {
    delete base[key]
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

function synthesizeMethodValue(base: Record<string, unknown>): void {
  const funcBody = base.body
  const funcParams = base.params
  const isAsync = base.async === true
  const isGenerator = base.generator === true
  base.value = {
    async: isAsync,
    body: funcBody ?? { body: [], type: 'BlockStatement' },
    generator: isGenerator,
    id: null,
    loc: base.loc,
    params: funcParams ?? [],
    parent: base,
    range: base.range,
    type: 'FunctionExpression',
  }
  // ESTree: body/params live on .value only
  delete base.body
  delete base.params
}

function synthesizeChainExpression(base: Record<string, unknown>): void {
  const inner = { ...base }
  if (inner.type === 'MemberExpression') inner.type = 'OptionalMemberExpression'
  if (inner.type === 'CallExpression') inner.type = 'OptionalCallExpression'
  const savedRange = { end: base.end, loc: base.loc, range: base.range, start: base.start }
  for (const key of Object.keys(base)) {
    delete base[key]
  }

  base.type = 'ChainExpression'
  base.expression = inner
  base.range = savedRange.range
  base.loc = savedRange.loc
  base.start = savedRange.start
  base.end = savedRange.end
}

function fillLocFromRange(obj: unknown, sourceFile: SourceFile, visited: WeakSet<object> = new WeakSet()): void {
  if (!obj || typeof obj !== 'object') return
  if (visited.has(obj as object)) return
  visited.add(obj as object)
  if (Array.isArray(obj)) {
    for (const item of obj) fillLocFromRange(item, sourceFile, visited)
    return
  }
  const record = obj as Record<string, unknown>
  if (Array.isArray(record.range) && record.range.length === 2 && !record.loc) {
    const [start, end] = record.range as [number, number]
    try {
      const startPos = sourceFile.getLineAndColumnAtPos(start)
      const endPos = sourceFile.getLineAndColumnAtPos(end)
      record.loc = {
        end: { column: endPos.column, line: endPos.line },
        start: { column: startPos.column, line: startPos.line },
      }
    } catch { /* position out of range */ }
  }
  for (const val of Object.values(record)) {
    if (val && typeof val === 'object') {
      fillLocFromRange(val, sourceFile, visited)
    }
  }
}

function nodeToGeneric(node: Node): Record<string, unknown> {
  const sourceFile = node.getSourceFile()
  const start = node.getStart()
  const end = node.getEnd()
  const startPos = sourceFile.getLineAndColumnAtPos(start)
  const endPos = sourceFile.getLineAndColumnAtPos(end)

  // Base properties
  const kindName = node.getKindName()

  // ParenthesizedExpression: unwrap to inner expression (ESTree convention)
  // ESTree doesn't have a ParenthesizedExpression node — parens are implicit
  if (kindName === 'ParenthesizedExpression') {
    try {
      const inner = (node as unknown as { getExpression?: () => Node }).getExpression?.()
      if (inner) {
        const innerGeneric = nodeToGeneric(inner)
        return innerGeneric
      }
    } catch { /* fall through to default handling */ }
  }

  // ComputedPropertyName: unwrap to inner expression (ESTree uses computed:true on parent)
  if (kindName === 'ComputedPropertyName') {
    try {
      const inner = (node as unknown as { getExpression?: () => Node }).getExpression?.()
      if (inner) {
        const innerGeneric = nodeToGeneric(inner)
        return innerGeneric
      }
    } catch { /* fall through to default handling */ }
  }

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

  applyNodeModifiers(base, node, kindName)

  // Enhancement properties from compiler node traversal
  const enhanced = convertCompilerNode(node, 0)
  if (enhanced) {
    for (const [key, val] of Object.entries(enhanced)) {
      if (!(key in base)) {
        base[key] = key === 'operatorToken' || key === 'operator' ? convertOperatorToken(val) : val
      }
    }
    fillLocFromRange(base, sourceFile)
  }

  // Detect parameter properties for TSParameterProperty synthesis
  let isParamProp = false
  let paramPropAccessibility: null | string = null
  let paramPropReadonly = false
  let paramPropOverride = false
  if (base.type === 'Parameter') {
    try {
      if (Node.isParameterDeclaration(node) && node.isParameterProperty?.()) {
        isParamProp = true
        const acc = getAccessibilityModifier(node)
        paramPropAccessibility = acc ?? null
        paramPropReadonly = node.isReadonly()
        paramPropOverride = node.hasModifier('override')
      }
    } catch {
      /* not a parameter property */
    }
  }

  // Synthesize RestElement / AssignmentPattern for function parameters
  if (base.type === 'Parameter') {
    transformParameterNode(base)
  }

  // Wrap parameter properties in TSParameterProperty node
  if (isParamProp) {
    wrapParameterProperty(base, paramPropAccessibility, paramPropReadonly, paramPropOverride)
  }

  // Synthesize .value FunctionExpression for method-like nodes
  if (base.method === true && base.type === 'MethodDefinition' && !base.value) {
    synthesizeMethodValue(base)
  }

  // Synthesize ChainExpression wrapper for optional chaining (?.)
  if (
    base.optional === true &&
    (base.type === 'MemberExpression' || base.type === 'CallExpression')
  ) {
    synthesizeChainExpression(base)
  }

  return base
}

function convertSeverity(severity: 'error' | 'off' | 'warn'): 'error' | 'info' | 'warning' {
  switch (severity) {
    case 'error': {
      return 'error'
    }

    case 'off': {
      return 'info'
    }

    case 'warn': {
      return 'warning'
    }
  }
}

function convertMeta(pluginMeta: PluginRuleDefinition['meta'], ruleId: string): RuleMeta {
  return {
    category: mapCategory(pluginMeta.docs?.category),
    deprecated: pluginMeta.deprecated,
    description: pluginMeta.docs?.description ?? pluginMeta.type,
    docs: pluginMeta.docs?.url
      ? { description: pluginMeta.docs?.description, url: pluginMeta.docs.url }
      : undefined,
    fixable:
      pluginMeta.fixable === 'code'
        ? 'code'
        : pluginMeta.fixable === 'whitespace'
          ? 'whitespace'
          : undefined,
    name: ruleId,
    recommended: pluginMeta.docs?.recommended ?? false,
    replacedBy: pluginMeta.replacedBy?.[0],
    severity: convertSeverity(pluginMeta.severity),
  }
}

function mapCategory(category: string | undefined): RuleMeta['category'] {
  switch (category?.toLowerCase()) {
    case 'complexity': {
      return 'complexity'
    }

    case 'correctness': {
      return 'correctness'
    }

    case 'dependencies': {
      return 'dependencies'
    }

    case 'patterns': {
      return 'patterns'
    }

    case 'performance': {
      return 'performance'
    }

    case 'security': {
      return 'security'
    }

    case 'style': {
      return 'style'
    }

    case 'testing': {
      return 'testing'
    }

    default: {
      return 'style'
    }
  }
}

function setParentRefs(
  node: Record<string, unknown>,
  parent: null | Record<string, unknown> = null,
  visited: Set<Record<string, unknown>> = new Set(),
): void {
  if (visited.has(node)) return
  visited.add(node)

  if (parent !== null) {
    node.parent = parent
  }

  for (const val of Object.values(node)) {
    if (val && typeof val === 'object') {
      if (Array.isArray(val)) {
        for (const item of val) {
          if (
            item &&
            typeof item === 'object' &&
            !Array.isArray(item) &&
            (item as Record<string, unknown>).type
          ) {
            setParentRefs(item as Record<string, unknown>, node, visited)
          }
        }
      } else if ((val as Record<string, unknown>).type) {
        setParentRefs(val as Record<string, unknown>, node, visited)
      }
    }
  }
}

export function adaptPluginRule(pluginRule: PluginRuleDefinition, ruleId: string): RuleDefinition {
  return {
    create(_options: RuleOptions) {
      let violations: RuleViolation[] = []
      let sourceFile: null | SourceFile = null
      let sourceText = ''

      const convertedNodes = new WeakMap<Node, Record<string, unknown>>()

      const pluginContext: PluginRuleContext = {
        config: defaultConfig,
        getAST: () => null,
        getComments: () => [],
        getFilePath: () => sourceFile?.getFilePath() ?? '',
        getSource: () => sourceText,
        getTokens: () => [],
        logger: silentLogger,
        report(descriptor: ReportDescriptor) {
          const loc = descriptor.loc ?? {
            end: { column: 1, line: 1 },
            start: { column: 0, line: 1 },
          }

          violations.push({
            filePath: sourceFile?.getFilePath() ?? '',
            message: descriptor.message,
            range: {
              end: { column: loc.end.column, line: loc.end.line },
              start: { column: loc.start.column, line: loc.start.line },
            },
            ruleId,
            severity: convertSeverity(pluginRule.meta.severity),
            suggestion: descriptor.suggest?.[0]?.desc,
          })
        },
        workspaceRoot: process.cwd(),
      }

      const pluginVisitor = pluginRule.create(pluginContext)

      const visitor: ASTVisitor = {
        exitNode(node: Node, _context: VisitorContext) {
          const kindName = node.getKindName()
          const genericNode = nodeToGeneric(node)

          // Set parent references within the converted subtree
          setParentRefs(genericNode)

          // Link to parent from previously converted ancestor
          try {
            const tsParent = node.getParent()
            if (tsParent && convertedNodes.has(tsParent)) {
              genericNode.parent = convertedNodes.get(tsParent)!
            }
          } catch {
            // Parent may not be accessible for all node types
          }

          if (
            kindName === 'BinaryExpression' &&
            ASSIGNMENT_OPERATORS.has(genericNode.operator as string)
          ) {
            genericNode.type = 'AssignmentExpression'
          }

          if (
            kindName === 'BinaryExpression' &&
            LOGICAL_OPERATORS.has(genericNode.operator as string)
          ) {
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

          if (kindName === 'DeleteExpression') {
            genericNode.operator = 'delete'
            genericNode.prefix = true
          }

          if (kindName === 'TypeOfExpression') {
            genericNode.operator = 'typeof'
            genericNode.prefix = true
          }

          if (kindName === "VoidExpression") {
            genericNode.operator = 'void'
            genericNode.prefix = true
          }

          if (kindName === 'ElementAccessExpression') {
            genericNode.computed = true
          }

          if (kindName === 'PropertyAccessExpression') {
            genericNode.computed = false
          }

          if (kindName === 'ShorthandPropertyAssignment') {
            genericNode.shorthand = true
            genericNode.computed = false
            if (genericNode.key && !genericNode.value) {
              genericNode.value = genericNode.key
            }
          }

          // Dispatch exit handler by ts-morph kind name
          const exitHandler = pluginVisitor[kindName + ':exit']
          if (exitHandler) {
            exitHandler(genericNode)
          }

          // Dispatch by ESTree-compatible type name if different
          const estreeType = genericNode.type as string
          if (estreeType && estreeType !== kindName) {
            const estreeExitHandler = pluginVisitor[estreeType + ':exit']
            if (estreeExitHandler) {
              estreeExitHandler(genericNode)
            }
          }

          // ImportDeclaration → dispatch specifier exit handlers
          if (kindName === 'ImportDeclaration') {
            const specs = (genericNode as Record<string, unknown>).specifiers as unknown[]
            if (Array.isArray(specs)) {
              for (const spec of specs) {
                if (spec && typeof spec === 'object') {
                  const specType = (spec as Record<string, unknown>).type as string
                  if (specType) {
                    const specExitHandler = pluginVisitor[specType + ':exit']
                    if (specExitHandler) {
                      specExitHandler(spec)
                    }
                  }
                }
              }
            }
          }

          // === Synthetic ClassBody exit dispatch ===
          if (kindName === 'ClassDeclaration' || kindName === 'ClassExpression') {
            const { body } = genericNode
            if (Array.isArray(body)) {
              const classBodyNode: Record<string, unknown> = {
                body,
                loc: genericNode.loc,
                parent: genericNode,
                range: genericNode.range,
                type: 'ClassBody',
              }
              const classBodyExitHandler = pluginVisitor['ClassBody:exit']
              if (classBodyExitHandler) {
                classBodyExitHandler(classBodyNode)
              }
            }
          }

          // === Export wrapper exit dispatch ===
          // Declarations with export modifier → synthetic ExportNamedDeclaration/ExportDefaultDeclaration exit
          if (EXPORTABLE_KINDS.has(kindName)) {
            const { isDefault, isExported } = getExportInfo(node)
            if (isExported) {
              const exportWrapper: Record<string, unknown> = {
                declaration: genericNode,
                type: isDefault ? 'ExportDefaultDeclaration' : 'ExportNamedDeclaration',
                ...(isDefault ? {} : { specifiers: [] }),
                loc: genericNode.loc,
                range: genericNode.range,
                source: null,
              }
              const exportType = exportWrapper.type as string
              const exportExitHandler = pluginVisitor[exportType + ':exit']
              if (exportExitHandler) {
                exportExitHandler(exportWrapper)
              }
            }
          }

          // ExportDeclaration → dispatch ExportNamedDeclaration:exit or ExportAllDeclaration:exit
          if (kindName === 'ExportDeclaration') {
            const exportSpecs = (genericNode as Record<string, unknown>).specifiers as
              | undefined
              | unknown[]
            const specsToUse = exportSpecs && exportSpecs.length > 0 ? exportSpecs : []
            const sourceValue = (genericNode.source as string) ?? null
            const sourceLiteral = sourceValue
              ? {
                  loc: genericNode.loc,
                  range: genericNode.range,
                  type: 'Literal',
                  value: sourceValue,
                }
              : null

            if (specsToUse.length === 0 && sourceValue) {
              const exportAllExitHandler = pluginVisitor['ExportAllDeclaration:exit']
              if (exportAllExitHandler) {
                const wrapper: Record<string, unknown> = {
                  exported: null,
                  exportKind: genericNode.exportKind ?? 'value',
                  loc: genericNode.loc,
                  range: genericNode.range,
                  source: sourceLiteral,
                  type: 'ExportAllDeclaration',
                }
                exportAllExitHandler(wrapper)
              }
            } else {
              const exportNamedExitHandler = pluginVisitor['ExportNamedDeclaration:exit']
              if (exportNamedExitHandler) {
                const wrapper: Record<string, unknown> = {
                  declaration: null,
                  exportKind: genericNode.exportKind ?? 'value',
                  loc: genericNode.loc,
                  range: genericNode.range,
                  source: sourceLiteral,
                  specifiers: specsToUse,
                  type: 'ExportNamedDeclaration',
                }
                exportNamedExitHandler(wrapper)
              }
            }
          }

          // ExportAssignment → dispatch ExportDefaultDeclaration:exit
          if (kindName === 'ExportAssignment') {
            const defWrapper: Record<string, unknown> = {
              declaration: genericNode.expression ?? genericNode,
              loc: genericNode.loc,
              range: genericNode.range,
              type: 'ExportDefaultDeclaration',
            }
            const defExitHandler = pluginVisitor['ExportDefaultDeclaration:exit']
            if (defExitHandler) {
              defExitHandler(defWrapper)
            }
          }

          // SourceFile exit → also dispatch Program:exit
          if (Node.isSourceFile(node)) {
            const programExitHandler = pluginVisitor['Program:exit']
            if (programExitHandler) {
              programExitHandler(genericNode)
            }
          }
        },

        visitNode(node, _context: VisitorContext) {
          if (!sourceFile) {
            sourceFile = node.getSourceFile()
            sourceText = sourceFile.getFullText()
            setRangeSourceText(sourceText)
          }

          const kindName = node.getKindName()
          const genericNode = nodeToGeneric(node)

          // Set parent references within the converted subtree
          setParentRefs(genericNode)

          // Link to parent from previously converted ancestor
          try {
            const tsParent = node.getParent()
            if (tsParent && convertedNodes.has(tsParent)) {
              genericNode.parent = convertedNodes.get(tsParent)!
            }
          } catch {
            // Parent may not be accessible for all node types
          }

          // Register for child lookups
          convertedNodes.set(node, genericNode)

          if (
            kindName === 'BinaryExpression' &&
            ASSIGNMENT_OPERATORS.has(genericNode.operator as string)
          ) {
            genericNode.type = 'AssignmentExpression'
          }

          if (
            kindName === 'BinaryExpression' &&
            LOGICAL_OPERATORS.has(genericNode.operator as string)
          ) {
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

          if (kindName === 'DeleteExpression') {
            genericNode.operator = 'delete'
            genericNode.prefix = true
          }

          if (kindName === 'TypeOfExpression') {
            genericNode.operator = 'typeof'
            genericNode.prefix = true
          }

          if (kindName === "VoidExpression") {
            genericNode.operator = 'void'
            genericNode.prefix = true
          }

          if (kindName === 'ElementAccessExpression') {
            genericNode.computed = true
          }

          if (kindName === 'PropertyAccessExpression') {
            genericNode.computed = false
          }

          // === Export wrapper dispatch (before declaration handler for ESTree traversal order) ===
          if (EXPORTABLE_KINDS.has(kindName)) {
            const { isDefault, isExported } = getExportInfo(node)
            if (isExported) {
              const exportWrapper: Record<string, unknown> = {
                declaration: genericNode,
                type: isDefault ? 'ExportDefaultDeclaration' : 'ExportNamedDeclaration',
                ...(isDefault ? {} : { specifiers: [] }),
                loc: genericNode.loc,
                range: genericNode.range,
                source: null,
              }
              const exportType = exportWrapper.type as string
              const exportHandler = pluginVisitor[exportType]
              if (exportHandler) {
                exportHandler(exportWrapper)
              }
            }
          }

          if (kindName === 'ImportDeclaration') {
            genericNode.specifiers = extractImportSpecifiers(node)
          }

          // Dispatch by ts-morph kind name (for rules registered with ts-morph names)
          const handler = pluginVisitor[kindName]
          if (handler) {
            handler(genericNode)
          }

          // Dispatch by ESTree-compatible type name if different from ts-morph kind name
          const estreeType = genericNode.type as string
          if (estreeType && estreeType !== kindName) {
            const estreeHandler = pluginVisitor[estreeType]
            if (estreeHandler) {
              estreeHandler(genericNode)
            }
          }

          // === Synthetic ClassBody dispatch ===
          if (kindName === 'ClassDeclaration' || kindName === 'ClassExpression') {
            const { body } = genericNode
            if (Array.isArray(body)) {
              const classBodyNode: Record<string, unknown> = {
                body,
                loc: genericNode.loc,
                parent: genericNode,
                range: genericNode.range,
                type: 'ClassBody',
              }
              for (const member of body) {
                if (member && typeof member === 'object') {
                  ;(member as Record<string, unknown>).parent = classBodyNode
                }
              }

              const classBodyHandler = pluginVisitor.ClassBody
              if (classBodyHandler) {
                classBodyHandler(classBodyNode)
              }
            }
          }

          // ExportDeclaration → dispatch as ExportNamedDeclaration or ExportAllDeclaration
          if (kindName === 'ExportDeclaration') {
            const exportSpecs = extractExportSpecifiers(node)
            if (exportSpecs.length > 0) {
              genericNode.specifiers = exportSpecs
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
              const exportAllHandler = pluginVisitor.ExportAllDeclaration
              if (exportAllHandler) {
                const wrapper: Record<string, unknown> = {
                  exported: null,
                  exportKind: genericNode.exportKind ?? 'value',
                  loc: genericNode.loc,
                  range: genericNode.range,
                  source: sourceLiteral,
                  type: 'ExportAllDeclaration',
                }
                exportAllHandler(wrapper)
              }
            } else {
              const exportNamedHandler = pluginVisitor.ExportNamedDeclaration
              if (exportNamedHandler) {
                const wrapper: Record<string, unknown> = {
                  declaration: null,
                  exportKind: genericNode.exportKind ?? 'value',
                  loc: genericNode.loc,
                  range: genericNode.range,
                  source: sourceLiteral,
                  specifiers: exportSpecs,
                  type: 'ExportNamedDeclaration',
                }
                exportNamedHandler(wrapper)
              }
            }
          }

          // ExportAssignment → dispatch as ExportDefaultDeclaration
          if (kindName === 'ExportAssignment') {
            const defWrapper: Record<string, unknown> = {
              declaration: genericNode.expression ?? genericNode,
              loc: genericNode.loc,
              range: genericNode.range,
              type: 'ExportDefaultDeclaration',
            }
            const defHandler = pluginVisitor.ExportDefaultDeclaration
            if (defHandler) {
              defHandler(defWrapper)
            }
          }

          // ImportDeclaration → dispatch specifier handlers (specifiers already set above)
          if (kindName === 'ImportDeclaration') {
            const specs = genericNode.specifiers as unknown[]
            if (Array.isArray(specs)) {
              for (const spec of specs) {
                if (spec && typeof spec === 'object') {
                  const specRec = spec as Record<string, unknown>
                  const specType = specRec.type as string
                  if (specType) {
                    const specHandler = pluginVisitor[specType]
                    if (specHandler) {
                      specHandler(spec)
                    }
                  }
                }
              }
            }
          }

          const genericHandler = pluginVisitor['*'] ?? pluginVisitor.Any
          if (genericHandler) {
            genericHandler(genericNode)
          }
        },

        visitSourceFile(node, _context: VisitorContext) {
          sourceFile = node
          sourceText = node.getFullText()
          violations = []

          const genericNode = nodeToGeneric(node)
          setParentRefs(genericNode)
          convertedNodes.set(node, genericNode)

          const handler = pluginVisitor.SourceFile ?? pluginVisitor.Program
          if (handler) {
            handler(genericNode)
          }
        },
      }

      return {
        onComplete() {
          return violations
        },
        visitor,
      }
    },
    defaultOptions: {},

    meta: convertMeta(pluginRule.meta, ruleId),
  }
}

export function adaptPluginRules(
  rules: Record<string, PluginRuleDefinition>,
): Record<string, RuleDefinition> {
  const adapted: Record<string, RuleDefinition> = {}

  for (const [ruleId, pluginRule] of Object.entries(rules)) {
    adapted[ruleId] = adaptPluginRule(pluginRule, ruleId)
  }

  return adapted
}
