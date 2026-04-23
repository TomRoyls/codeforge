import { type ModifierableNode, Node, type SourceFile } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'

import type { ASTVisitor, RuleViolation, VisitorContext } from '../ast/visitor.js'
import type {
  Logger,
  PluginConfig,
  RuleContext as PluginRuleContext,
  RuleDefinition as PluginRuleDefinition,
  ReportDescriptor,
} from '../plugins/types.js'
import type { RuleDefinition, RuleMeta, RuleOptions } from './types.js'

function getAccessibilityModifier(
  node: ModifierableNode,
): 'private' | 'protected' | 'public' | undefined {
  if (node.hasModifier('private')) return 'private'
  if (node.hasModifier('protected')) return 'protected'
  if (node.hasModifier('public')) return 'public'
  return undefined
}

// Module-level source text for trivia skipping in convertRawCompilerNode
let _rangeSourceText = ''

function skipTrivia(pos: number): number {
  const text = _rangeSourceText
  if (!text) return pos
  let i = pos
  while (i < text.length) {
    const ch = text.codePointAt(i) ?? 0
    if (ch === 0x20 || ch === 0x09 || ch === 0x0a || ch === 0x0d) {
      i++
      continue
    }

    if (ch === 0x2f && i + 1 < text.length) {
      const next = text.codePointAt(i + 1) ?? 0
      if (next === 0x2f) {
        while (i < text.length && text.codePointAt(i) !== 0x0a) i++
        continue
      }

      if (next === 0x2a) {
        i += 2
        while (
          i + 1 < text.length &&
          !((text.codePointAt(i) ?? 0) === 0x2a && (text.codePointAt(i + 1) ?? 0) === 0x2f)
        )
          i++
        i += 2
        continue
      }
    }

    break
  }

  return i
}

// Build a clean kind-number-to-name map, filtering out range markers (First*, Last*)
// that share enum values with actual node types
const KIND_MAP: Record<number, string> = {}
for (const [name, value] of Object.entries(SyntaxKind)) {
  if (typeof value !== 'number') continue
  if (name.startsWith('First') || name.startsWith('Last')) continue
  KIND_MAP[value] = name
}

const silentLogger: Logger = {
  debug() {},
  error() {},
  info() {},
  warn() {},
}

const defaultConfig: PluginConfig = {
  options: {},
  rules: {},
  transforms: [],
}

const PROPERTY_MAP: Record<string, string> = {
  alternate: 'alternate',
  arguments: 'arguments',
  block: 'body',
  body: 'body',
  condition: 'test',
  consequent: 'consequent',
  declarationList: 'declarations',
  declarations: 'declarations',
  decorators: 'decorators',
  defaultImport: 'local',
  elements: 'elements',
  elseStatement: 'alternate',
  escapedText: 'name',
  expression: 'argument',
  expressions: 'expressions',
  externalModuleReference: 'source',
  heritageClauses: 'heritage',
  importClause: 'importClause',
  importSpecifier: 'imported',
  initializer: 'init',
  left: 'left',
  members: 'body',
  modifierFlags: 'modifierFlags',
  moduleSpecifier: 'source',
  name: 'name',
  namedBindings: 'namedBindings',
  namedImports: 'namedImports',
  namespaceImport: 'namespaceImport',
  objectLiteral: 'objectValue',
  operand: 'argument',
  operator: 'operator',
  operatorToken: 'operator',
  parameters: 'params',
  properties: 'properties',
  propertyName: 'imported',
  right: 'right',
  statements: 'body',
  stringLiteral: 'importPath',
  test: 'test',
  text: 'raw',
  thenStatement: 'consequent',
  type: 'typeAnnotation',
  typeArguments: 'typeParameters',
  typeParameters: 'typeParameters',
  variableDeclaration: 'param',
}

const KIND_NAME_ALIASES: Record<string, string> = {
  AnyKeyword: 'TSAnyKeyword',
  ArrayDestructuring: 'ArrayPattern',
  ArrayLiteralExpression: 'ArrayExpression',
  ArrowFunction: 'ArrowFunctionExpression',
  AsExpression: 'TSAsExpression',
  AwaitExpression: 'AwaitExpression',
  BigIntLiteral: 'Literal',
  BinaryExpression: 'BinaryExpression',
  Block: 'BlockStatement',
  BooleanKeyword: 'TSBooleanKeyword',
  BreakStatement: 'BreakStatement',
  CallExpression: 'CallExpression',
  CallSignature: 'TSCallSignatureDeclaration',
  CaseClause: 'SwitchCase',
  CatchClause: 'CatchClause',
  ClassDeclaration: 'ClassDeclaration',
  ClassExpression: 'ClassExpression',
  ComputedPropertyName: 'Literal',
  ConditionalExpression: 'ConditionalExpression',
  Constructor: 'MethodDefinition',
  ContinueStatement: 'ContinueStatement',
  DebuggerStatement: 'DebuggerStatement',
  DefaultClause: 'SwitchCase',
  DefaultKeyword: 'Literal',
  DeleteExpression: 'UnaryExpression',
  DoStatement: 'DoWhileStatement',
  ElementAccessExpression: 'MemberExpression',
  EnumDeclaration: 'TSEnumDeclaration',
  ExportDeclaration: 'ExportDeclaration',
  ExportKeyword: 'TSExportKeyword',
  ExportSpecifier: 'ExportSpecifier',
  ExpressionStatement: 'ExpressionStatement',
  ExternalModuleReference: 'TSExternalModuleReference',
  FalseKeyword: 'BooleanLiteral',
  ForInStatement: 'ForInStatement',
  ForOfStatement: 'ForOfStatement',
  ForStatement: 'ForStatement',
  FunctionDeclaration: 'FunctionDeclaration',
  FunctionExpression: 'FunctionExpression',
  GetAccessor: 'MethodDefinition',
  Identifier: 'Identifier',
  IfStatement: 'IfStatement',
  ImportDeclaration: 'ImportDeclaration',
  ImportEqualsDeclaration: 'TSImportEqualsDeclaration',
  ImportExpression: 'Import',
  ImportSpecifier: 'ImportSpecifier',
  InExpression: 'BinaryExpression',
  InstanceOfExpression: 'BinaryExpression',
  InterfaceDeclaration: 'TSInterfaceDeclaration',
  LabeledStatement: 'LabeledStatement',
  MethodDeclaration: 'MethodDefinition',
  ModuleDeclaration: 'TSModuleDeclaration',
  NewExpression: 'NewExpression',
  NonNullExpression: 'TSNonNullExpression',
  NoSubstitutionTemplateLiteral: 'TemplateLiteral',
  NullKeyword: 'Literal',
  NumberKeyword: 'TSNumberKeyword',
  NumericLiteral: 'Literal',
  ObjectDestructuring: 'ObjectPattern',
  ObjectKeyword: 'TSObjectKeyword',
  ObjectLiteralExpression: 'ObjectExpression',
  ParenthesizedExpression: 'SequenceExpression',
  PostfixUnaryExpression: 'UpdateExpression',
  PrefixUnaryExpression: 'UnaryExpression',
  PrivateIdentifier: 'PrivateIdentifier',
  PropertyAccessExpression: 'MemberExpression',
  PropertyAssignment: 'Property',
  PropertyDeclaration: 'PropertyDefinition',
  RegularExpressionLiteral: 'RegExpLiteral',
  ReturnStatement: 'ReturnStatement',
  SetAccessor: 'MethodDefinition',
  ShorthandPropertyAssignment: 'Property',
  SpreadAssignment: 'SpreadElement',
  SpreadElement: 'SpreadElement',
  StaticBlock: 'StaticBlock',
  StringKeyword: 'TSStringKeyword',
  StringLiteral: 'Literal',
  SuperKeyword: 'Super',
  SwitchStatement: 'SwitchStatement',
  TaggedTemplateExpression: 'TaggedTemplateExpression',
  TemplateExpression: 'TemplateLiteral',
  ThisKeyword: 'ThisExpression',
  ThrowStatement: 'ThrowStatement',
  TrueKeyword: 'BooleanLiteral',
  TryStatement: 'TryStatement',
  TSAnyKeyword: 'TSAnyKeyword',
  TSArrayType: 'TSArrayType',
  TSEnumMember: 'TSEnumMember',
  TSInterfaceBody: 'TSInterfaceBody',
  TSInterfaceDeclaration: 'TSInterfaceDeclaration',
  TSUnionType: 'TSUnionType',
  TypeAliasDeclaration: 'TSTypeAliasDeclaration',
  TypeAnnotation: 'TSTypeAnnotation',
  TypeAssertion: 'TSTypeAssertion',
  TypeLiteral: 'TSTypeLiteral',
  TypeOfExpression: 'UnaryExpression',
  TypeReference: 'TSTypeReference',
  UnknownKeyword: 'TSUnknownKeyword',
  VariableDeclaration: 'VariableDeclarator',
  VariableDeclarationList: 'VariableDeclaration',
  VariableStatement: 'VariableDeclaration',
  VoidExpression: 'UnaryExpression',
  VoidKeyword: 'TSVoidKeyword',
  WhileStatement: 'WhileStatement',
  YieldExpression: 'YieldExpression',
}

const KIND_SPECIFIC_MAP: Record<string, Record<string, string>> = {
  ArrowFunction: { type: 'returnType' },
  AwaitExpression: { expression: 'argument' },
  CallExpression: { expression: 'callee' },
  CaseClause: { expression: 'test', statements: 'consequent' },
  ClassDeclaration: { name: 'id' },
  DefaultClause: { statements: 'consequent' },
  DeleteExpression: { expression: 'argument' },
  DoStatement: { expression: 'test', statement: 'body' },
  ElementAccessExpression: { argumentExpression: 'property', expression: 'object' },
  ExportSpecifier: { name: 'exported', propertyName: 'imported' },
  ForInStatement: { expression: 'right', initializer: 'left', statement: 'body' },
  ForOfStatement: { expression: 'right', initializer: 'left', statement: 'body' },
  ForStatement: {
    condition: 'test',
    incrementor: 'update',
    initializer: 'init',
    statement: 'body',
  },
  FunctionDeclaration: { name: 'id', type: 'returnType' },
  FunctionExpression: { type: 'returnType' },
  GetAccessor: { name: 'key' },
  IfStatement: { elseStatement: 'alternate', expression: 'test', thenStatement: 'consequent' },
  ImportSpecifier: { name: 'local', propertyName: 'imported' },
  LabeledStatement: { statement: 'body' },
  MethodDeclaration: { name: 'key' },
  NewExpression: { expression: 'callee' },
  ParenthesizedExpression: { expression: 'expression' },
  PostfixUnaryExpression: { operand: 'argument' },
  PrefixUnaryExpression: { operand: 'argument' },
  PropertyAccessExpression: { expression: 'object', name: 'property' },
  PropertyAssignment: { initializer: 'value', name: 'key' },
  PropertyDeclaration: { initializer: 'value', name: 'key' },
  ReturnStatement: { expression: 'argument' },
  SetAccessor: { name: 'key' },
  SpreadAssignment: { expression: 'argument' },
  SpreadElement: { expression: 'argument' },
  SwitchStatement: { caseBlock: 'cases', expression: 'discriminant' },
  TaggedTemplateExpression: { template: 'quasi' },
  ThrowStatement: { expression: 'argument' },
  TryStatement: { catchClause: 'handler', finallyBlock: 'finalizer', tryBlock: 'block' },
  TypeOfExpression: { expression: 'argument' },
  VariableDeclaration: { name: 'id', type: 'typeAnnotation' },
  VoidExpression: { expression: 'argument' },
  WhileStatement: { expression: 'test', statement: 'body' },
  WithStatement: { statement: 'body' },
  YieldExpression: { expression: 'argument' },
}

const MAX_DEPTH = 5

const SKIP_KEYS = new Set([
  'end',
  'flags',
  'id',
  'jlChildren',
  'kind',
  'locals',
  'modifierFlagsCache',
  'nextContainer',
  'original',
  'parent',
  'pos',
  'symbol',
  'transformFlags',
])

const OPERATOR_TOKEN_MAP: Record<string, string> = {
  AmpersandAmpersandEqualsToken: '&&=',
  AmpersandAmpersandToken: '&&',
  AmpersandEqualsToken: '&=',
  AmpersandToken: '&',
  ArrowToken: '=>',
  AsteriskAsteriskEqualsToken: '**=',
  AsteriskAsteriskToken: '**',
  AsteriskEqualsToken: '*=',
  AsteriskToken: '*',
  BarBarEqualsToken: '||=',
  BarBarToken: '||',
  BarEqualsToken: '|=',
  BarToken: '|',
  CaretEqualsToken: '^=',
  CaretToken: '^',
  ColonToken: ':',
  CommaToken: ',',
  DotDotDotToken: '...',
  DotToken: '.',
  EqualsEqualsEqualsToken: '===',
  EqualsEqualsToken: '==',
  EqualsToken: '=',
  ExclamationEqualsEqualsToken: '!==',
  ExclamationEqualsToken: '!=',
  ExclamationToken: '!',
  GreaterThanEqualsToken: '>=',
  GreaterThanGreaterThanEqualsToken: '>>=',
  GreaterThanGreaterThanGreaterThanEqualsToken: '>>>=',
  GreaterThanGreaterThanGreaterThanToken: '>>>',
  GreaterThanGreaterThanToken: '>>',
  GreaterThanToken: '>',
  InKeyword: 'in',
  InstanceOfKeyword: 'instanceof',
  LessThanEqualsToken: '<=',
  LessThanLessThanEqualsToken: '<<=',
  LessThanLessThanToken: '<<',
  LessThanToken: '<',
  MinusEqualsToken: '-=',
  MinusToken: '-',
  OfKeyword: 'of',
  PercentEqualsToken: '%=',
  PercentToken: '%',
  PlusEqualsToken: '+=',
  PlusToken: '+',
  QuestionDotToken: '?.',
  QuestionQuestionEqualsToken: '??=',
  QuestionQuestionToken: '??',
  SemicolonToken: ';',
  SlashEqualsToken: '/=',
  SlashToken: '/',
  TildeToken: '~',
}

const ASSIGNMENT_OPERATORS = new Set([
  '%=',
  '&&=',
  '&=',
  '**=',
  '*=',
  '+=',
  '-=',
  '/=',
  '<<=',
  '=',
  '>>=',
  '>>>=',
  '??=',
  '^=',
  '|=',
  '||=',
])

const LOGICAL_OPERATORS = new Set(['&&', '??', '||'])

const EXPORTABLE_KINDS = new Set([
  'ClassDeclaration',
  'EnumDeclaration',
  'FunctionDeclaration',
  'InterfaceDeclaration',
  'ModuleDeclaration',
  'TypeAliasDeclaration',
])

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

function convertRawCompilerNode(
  raw: Record<string, unknown>,
  depth: number,
): null | Record<string, unknown> {
  if (depth >= MAX_DEPTH) return null
  if (!raw || typeof raw !== 'object') return null

  const kind: number = raw.kind as number
  const kindName: string = KIND_MAP[kind] ?? `Unknown(${kind})`
  const kindMap = KIND_SPECIFIC_MAP[kindName]

  const result: Record<string, unknown> = {}
  if (typeof raw.pos === 'number' && typeof raw.end === 'number') {
    const startPos = skipTrivia(raw.pos as number)
    result.range = [startPos, raw.end] as [number, number]
    result.start = startPos
    result.end = raw.end
  }

  result.type = KIND_NAME_ALIASES[kindName] ?? kindName

  // Add literal values
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
  } else
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

  // Iterate children
  for (const [key, val] of Object.entries(raw)) {
    if (key.startsWith('_')) continue
    if (SKIP_KEYS.has(key)) continue

    const estreeName = kindMap?.[key] ?? PROPERTY_MAP[key] ?? key

    // Special: caseBlock → extract clauses array as ESTree cases
    if (key === 'caseBlock' && val && typeof val === 'object') {
      const cb = val as Record<string, unknown>
      if (Array.isArray(cb.clauses)) {
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

        result[estreeName] = converted
      }

      continue
    }

    // Special: TemplateExpression → synthesize quasis[] and expressions[]
    if (kindName === 'TemplateExpression' && (key === 'head' || key === 'templateSpans')) {
      if (!result.quasis && !result.expressions) {
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

      continue
    }

    // Special: NoSubstitutionTemplateLiteral → single quasi with tail=true
    if (kindName === 'NoSubstitutionTemplateLiteral' && key === 'text') {
      if (!result.quasis) {
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

      continue
    }

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

  return result
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

  // Add literal value
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

  // Iterate compiler node children using raw compiler node
  // (ts-morph getter methods like getExpression() fail on detached nodes)
  try {
    const { compilerNode } = node as unknown as { compilerNode: Record<string, unknown> }
    if (compilerNode && typeof compilerNode === 'object') {
      for (const [key, val] of Object.entries(compilerNode)) {
        if (key.startsWith('_')) continue
        if (SKIP_KEYS.has(key)) continue

        const estreeName = kindMap?.[key] ?? PROPERTY_MAP[key] ?? key

        // Special: caseBlock -> extract clauses array as ESTree cases
        if (key === 'caseBlock' && val && typeof val === 'object') {
          const cb = val as Record<string, unknown>
          if (Array.isArray(cb.clauses)) {
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

            result[estreeName] = converted
          }

          continue
        }

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
              const itemKindName = KIND_MAP[(item as Record<string, unknown>).kind as number] ?? ''
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
    }
  } catch {}

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

  return result
}

function nodeToGeneric(node: Node): Record<string, unknown> {
  const sourceFile = node.getSourceFile()
  const start = node.getStart()
  const end = node.getEnd()
  const startPos = sourceFile.getLineAndColumnAtPos(start)
  const endPos = sourceFile.getLineAndColumnAtPos(end)

  // Base properties
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
      } catch {}
    }

    if (Node.isImportDeclaration(node)) {
      try {
        if (node.isTypeOnly()) base.importKind = 'type'
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
        base[key] = key === 'operatorToken' || key === 'operator' ? convertOperatorToken(val) : val
      }
    }
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
    const hasRest = base.dotDotDotToken !== null
    const hasInit = base.init !== null
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
        const saved = { end: base.end, loc: base.loc, range: base.range, start: base.start }
        for (const key of Object.keys(base)) {
          delete base[key]
        }

        Object.assign(base, nameNode)
        if (nameNode.range === null) {
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

  // Synthesize .value FunctionExpression for method-like nodes
  if (base.method === true && base.type === 'MethodDefinition' && !base.value) {
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

  // Synthesize ChainExpression wrapper for optional chaining (?.)
  if (
    base.optional === true &&
    (base.type === 'MemberExpression' || base.type === 'CallExpression')
  ) {
    const inner = { ...base }
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

    default: {
      return 'style'
    }
  }
}

function setParentRefs(
  node: Record<string, unknown>,
  parent: null | Record<string, unknown> = null,
): void {
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
            setParentRefs(item as Record<string, unknown>, node)
          }
        }
      } else if ((val as Record<string, unknown>).type) {
        setParentRefs(val as Record<string, unknown>, node)
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
          } catch {}

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
            _rangeSourceText = sourceText
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
          } catch {}

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

          // ImportDeclaration → add specifiers and source
          if (kindName === 'ImportDeclaration') {
            genericNode.specifiers = extractImportSpecifiers(node)
            for (const spec of genericNode.specifiers as unknown[]) {
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
