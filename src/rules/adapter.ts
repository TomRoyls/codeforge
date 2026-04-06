import { Node, type SourceFile } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'
import type { RuleViolation, VisitorContext, ASTVisitor } from '../ast/visitor.js'
import type { RuleDefinition, RuleOptions, RuleMeta } from './types.js'
import type {
  RuleDefinition as PluginRuleDefinition,
  RuleContext as PluginRuleContext,
  ReportDescriptor,
  Logger,
  PluginConfig,
} from '../plugins/types.js'

// Build a clean kind-number-to-name map, filtering out range markers (First*, Last*)
// that share enum values with actual node types
const KIND_MAP: Record<number, string> = {}
for (const [name, value] of Object.entries(SyntaxKind)) {
  if (typeof value !== 'number') continue
  if (name.startsWith('First') || name.startsWith('Last')) continue
  KIND_MAP[value] = name
}

const silentLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

const defaultConfig: PluginConfig = {
  options: {},
  rules: {},
  transforms: [],
}

const PROPERTY_MAP: Record<string, string> = {
  block: 'body',
  expression: 'argument',
  expressions: 'expressions',
  escapedText: 'name',
  text: 'raw',
  initializer: 'init',
  left: 'left',
  right: 'right',
  test: 'test',
  consequent: 'consequent',
  alternate: 'alternate',
  operatorToken: 'operator',
  condition: 'test',
  body: 'body',
  thenStatement: 'consequent',
  elseStatement: 'alternate',
  declarationList: 'declarations',
  declarations: 'declarations',
  name: 'name',
  type: 'typeAnnotation',
  typeArguments: 'typeParameters',
  typeParameters: 'typeParameters',
  parameters: 'params',
  arguments: 'arguments',
  heritageClauses: 'heritage',
  members: 'body',
  elements: 'elements',
  properties: 'properties',
  objectLiteral: 'objectValue',
  importClause: 'importClause',
  moduleSpecifier: 'source',
  namedImports: 'namedImports',
  namespaceImport: 'namespaceImport',
  stringLiteral: 'importPath',
  defaultImport: 'local',
  namedBindings: 'namedBindings',
  importSpecifier: 'imported',
  propertyName: 'imported',
  externalModuleReference: 'source',
  decorators: 'decorators',
  modifierFlags: 'modifierFlags',
  statements: 'body',
  variableDeclaration: 'param',
  operand: 'argument',
  operator: 'operator',
}

const KIND_NAME_ALIASES: Record<string, string> = {
  Block: 'BlockStatement',
  StringLiteral: 'Literal',
  NumericLiteral: 'Literal',
  BigIntLiteral: 'Literal',
  TrueKeyword: 'Literal',
  FalseKeyword: 'Literal',
  NullKeyword: 'Literal',
  RegularExpressionLiteral: 'RegExpLiteral',
  ObjectLiteralExpression: 'ObjectExpression',
  ArrayLiteralExpression: 'ArrayExpression',
  FunctionExpression: 'FunctionExpression',
  ArrowFunction: 'ArrowFunctionExpression',
  PropertyAccessExpression: 'MemberExpression',
  ElementAccessExpression: 'MemberExpression',
  CallExpression: 'CallExpression',
  NewExpression: 'NewExpression',
  BinaryExpression: 'BinaryExpression',
  PrefixUnaryExpression: 'UnaryExpression',
  PostfixUnaryExpression: 'UpdateExpression',
  ConditionalExpression: 'ConditionalExpression',
  VariableDeclaration: 'VariableDeclarator',
  VariableDeclarationList: 'VariableDeclaration',
  VariableStatement: 'VariableDeclaration',
  FunctionDeclaration: 'FunctionDeclaration',
  ClassDeclaration: 'ClassDeclaration',
  InterfaceDeclaration: 'TSInterfaceDeclaration',
  ImportDeclaration: 'ImportDeclaration',
  ExportDeclaration: 'ExportDeclaration',
  ReturnStatement: 'ReturnStatement',
  ThrowStatement: 'ThrowStatement',
  IfStatement: 'IfStatement',
  ForStatement: 'ForStatement',
  ForInStatement: 'ForInStatement',
  ForOfStatement: 'ForOfStatement',
  WhileStatement: 'WhileStatement',
  DoStatement: 'DoWhileStatement',
  SwitchStatement: 'SwitchStatement',
  TryStatement: 'TryStatement',
  ExpressionStatement: 'ExpressionStatement',
  TypeReference: 'TSTypeReference',
  TypeLiteral: 'TSTypeLiteral',
  EnumDeclaration: 'TSEnumDeclaration',
  ModuleDeclaration: 'TSModuleDeclaration',
  ImportSpecifier: 'ImportSpecifier',
  ExportSpecifier: 'ExportSpecifier',
  CatchClause: 'CatchClause',
  CaseClause: 'SwitchCase',
  DefaultClause: 'SwitchCase',
  PropertyDeclaration: 'PropertyDefinition',
  PropertyAssignment: 'Property',
  MethodDeclaration: 'MethodDefinition',
  Constructor: 'MethodDefinition',
  GetAccessor: 'MethodDefinition',
  SetAccessor: 'MethodDefinition',
  ShorthandPropertyAssignment: 'Property',
  SpreadAssignment: 'SpreadElement',
  SpreadElement: 'SpreadElement',
  TemplateExpression: 'TemplateLiteral',
  NoSubstitutionTemplateLiteral: 'TemplateLiteral',
  TaggedTemplateExpression: 'TaggedTemplateExpression',
  AwaitExpression: 'AwaitExpression',
  YieldExpression: 'YieldExpression',
  DeleteExpression: 'UnaryExpression',
  VoidExpression: 'UnaryExpression',
  TypeOfExpression: 'UnaryExpression',
  InstanceOfExpression: 'BinaryExpression',
  InExpression: 'BinaryExpression',
  AsExpression: 'TSAsExpression',
  TypeAssertion: 'TSTypeAssertion',
  NonNullExpression: 'TSNonNullExpression',
  ParenthesizedExpression: 'SequenceExpression',
  ObjectDestructuring: 'ObjectPattern',
  ArrayDestructuring: 'ArrayPattern',
  ComputedPropertyName: 'Literal',
  DefaultKeyword: 'Literal',
  SuperKeyword: 'Super',
  ThisKeyword: 'ThisExpression',
  BreakStatement: 'BreakStatement',
  ContinueStatement: 'ContinueStatement',
  DebuggerStatement: 'DebuggerStatement',
  LabeledStatement: 'LabeledStatement',
  ClassExpression: 'ClassExpression',
  Identifier: 'Identifier',
  PrivateIdentifier: 'PrivateIdentifier',
  TSAnyKeyword: 'TSAnyKeyword',
  TSArrayType: 'TSArrayType',
  TSUnionType: 'TSUnionType',
  TSEnumMember: 'TSEnumMember',
  TSInterfaceDeclaration: 'TSInterfaceDeclaration',
  StaticBlock: 'StaticBlock',
}

const KIND_SPECIFIC_MAP: Record<string, Record<string, string>> = {
  SwitchStatement: { expression: 'discriminant', caseBlock: 'cases' },
  CaseClause: { expression: 'test', statements: 'consequent' },
  DefaultClause: { statements: 'consequent' },
  TryStatement: { tryBlock: 'block', catchClause: 'handler', finallyBlock: 'finalizer' },
  IfStatement: { expression: 'test', thenStatement: 'consequent', elseStatement: 'alternate' },
  ForStatement: {
    initializer: 'init',
    condition: 'test',
    incrementor: 'update',
    statement: 'body',
  },
  ForInStatement: { expression: 'right', initializer: 'left', statement: 'body' },
  ForOfStatement: { expression: 'right', initializer: 'left', statement: 'body' },
  LabeledStatement: { statement: 'body' },
  WithStatement: { statement: 'body' },
  DoStatement: { expression: 'test', statement: 'body' },
  WhileStatement: { expression: 'test', statement: 'body' },
  CallExpression: { expression: 'callee' },
  NewExpression: { expression: 'callee' },
  PropertyAccessExpression: { expression: 'object', name: 'property' },
  ElementAccessExpression: { expression: 'object', argumentExpression: 'property' },
  ThrowStatement: { expression: 'argument' },
  ReturnStatement: { expression: 'argument' },
  DeleteExpression: { expression: 'argument' },
  VoidExpression: { expression: 'argument' },
  TypeOfExpression: { expression: 'argument' },
  AwaitExpression: { expression: 'argument' },
  YieldExpression: { expression: 'argument' },
  PrefixUnaryExpression: { operand: 'argument' },
  PostfixUnaryExpression: { operand: 'argument' },
  VariableDeclaration: { name: 'id' },
  FunctionDeclaration: { name: 'id' },
  ClassDeclaration: { name: 'id' },
  PropertyDeclaration: { name: 'key', initializer: 'value' },
  PropertyAssignment: { name: 'key', initializer: 'value' },
  MethodDeclaration: { name: 'key' },
  GetAccessor: { name: 'key' },
  SetAccessor: { name: 'key' },
  ImportSpecifier: { name: 'local', propertyName: 'imported' },
  ExportSpecifier: { name: 'exported', propertyName: 'imported' },
  ParenthesizedExpression: { expression: 'expression' },
  SpreadElement: { expression: 'argument' },
  SpreadAssignment: { expression: 'argument' },
  TaggedTemplateExpression: { template: 'quasi' },
}

const MAX_DEPTH = 5

const SKIP_KEYS = new Set([
  'kind',
  'pos',
  'end',
  'flags',
  'modifierFlagsCache',
  'transformFlags',
  'parent',
  'original',
  'jlChildren',
  'symbol',
  'locals',
  'nextContainer',
  'id',
])

const OPERATOR_TOKEN_MAP: Record<string, string> = {
  EqualsEqualsToken: '==',
  EqualsEqualsEqualsToken: '===',
  ExclamationEqualsToken: '!=',
  ExclamationEqualsEqualsToken: '!==',
  LessThanToken: '<',
  LessThanEqualsToken: '<=',
  GreaterThanToken: '>',
  GreaterThanEqualsToken: '>=',
  PlusToken: '+',
  MinusToken: '-',
  AsteriskToken: '*',
  SlashToken: '/',
  PercentToken: '%',
  AsteriskAsteriskToken: '**',
  AmpersandToken: '&',
  BarToken: '|',
  CaretToken: '^',
  LessThanLessThanToken: '<<',
  GreaterThanGreaterThanToken: '>>',
  GreaterThanGreaterThanGreaterThanToken: '>>>',
  EqualsToken: '=',
  PlusEqualsToken: '+=',
  MinusEqualsToken: '-=',
  AsteriskEqualsToken: '*=',
  SlashEqualsToken: '/=',
  PercentEqualsToken: '%=',
  AsteriskAsteriskEqualsToken: '**=',
  AmpersandEqualsToken: '&=',
  BarEqualsToken: '|=',
  CaretEqualsToken: '^=',
  LessThanLessThanEqualsToken: '<<=',
  GreaterThanGreaterThanEqualsToken: '>>=',
  GreaterThanGreaterThanGreaterThanEqualsToken: '>>>=',
  AmpersandAmpersandToken: '&&',
  BarBarToken: '||',
  QuestionQuestionToken: '??',
  AmpersandAmpersandEqualsToken: '&&=',
  BarBarEqualsToken: '||=',
  QuestionQuestionEqualsToken: '??=',
  DotDotDotToken: '...',
  CommaToken: ',',
  ColonToken: ':',
  SemicolonToken: ';',
  ArrowToken: '=>',
  DotToken: '.',
  QuestionDotToken: '?.',
  ExclamationToken: '!',
  TildeToken: '~',
  InKeyword: 'in',
  InstanceOfKeyword: 'instanceof',
  OfKeyword: 'of',
}

const ASSIGNMENT_OPERATORS = new Set([
  '=',
  '+=',
  '-=',
  '*=',
  '/=',
  '%=',
  '**=',
  '&=',
  '|=',
  '^=',
  '<<=',
  '>>=',
  '>>>=',
  '&&=',
  '||=',
  '??=',
])

const LOGICAL_OPERATORS = new Set(['&&', '||', '??'])

const EXPORTABLE_KINDS = new Set([
  'FunctionDeclaration',
  'ClassDeclaration',
  'InterfaceDeclaration',
  'EnumDeclaration',
  'TypeAliasDeclaration',
  'ModuleDeclaration',
])

function getExportInfo(node: Node): { isExported: boolean; isDefault: boolean } {
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

function extractImportSpecifiers(node: Node): unknown[] {
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

function extractExportSpecifiers(node: Node): unknown[] {
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
): Record<string, unknown> | null {
  if (depth >= MAX_DEPTH) return null
  if (!raw || typeof raw !== 'object') return null

  const kind: number = raw.kind as number
  const kindName: string = KIND_MAP[kind] ?? `Unknown(${kind})`
  const kindMap = KIND_SPECIFIC_MAP[kindName]

  const result: Record<string, unknown> = {}
  // Add source position metadata from raw compiler node
  if (typeof raw.pos === 'number' && typeof raw.end === 'number') {
    result.range = [raw.pos, raw.end] as [number, number]
    result.start = raw.pos
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
  } else if (kindName === 'TrueKeyword') {
    result.value = true
    result.raw = 'true'
  } else if (kindName === 'FalseKeyword') {
    result.value = false
    result.raw = 'false'
  } else if (kindName === 'NullKeyword') {
    result.value = null
    result.raw = 'null'
  } else if (kindName === 'RegularExpressionLiteral' && raw.text !== undefined) {
    result.raw = raw.text as string
    const regexText = raw.text as string
    const regexMatch = regexText.match(/^\/(.*)\/([gimsuvy]*)$/)
    if (regexMatch) {
      result.regex = { pattern: regexMatch[1], flags: regexMatch[2] }
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
            type: 'TemplateElement',
            value: {
              raw: (head.rawText ?? head.text) as string,
              cooked: (head.text ?? head.rawText) as string,
            },
            tail: false,
            range:
              typeof head.pos === 'number' && typeof head.end === 'number'
                ? [head.pos as number, head.end as number]
                : undefined,
          })
        }

        // templateSpans → alternating expression + TemplateElement
        const spans = raw.templateSpans as Array<Record<string, unknown>> | undefined
        if (Array.isArray(spans)) {
          for (let i = 0; i < spans.length; i++) {
            const span = spans[i]! as Record<string, unknown>
            const spanExpr = span['expression'] as Record<string, unknown> | undefined
            if (spanExpr && typeof spanExpr.kind === 'number') {
              expressions.push(convertRawCompilerNode(spanExpr, depth + 1))
            }
            const lit = span.literal as Record<string, unknown> | undefined
            if (lit && typeof lit.kind === 'number') {
              const isTail = i === spans.length - 1
              quasis.push({
                type: 'TemplateElement',
                value: {
                  raw: (lit.rawText ?? lit.text) as string,
                  cooked: (lit.text ?? lit.rawText) as string,
                },
                tail: isTail,
                range:
                  typeof lit.pos === 'number' && typeof lit.end === 'number'
                    ? [lit.pos as number, lit.end as number]
                    : undefined,
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
            type: 'TemplateElement',
            value: { raw: rawText, cooked: cookedText },
            tail: true,
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
      if (varDecl.name && typeof varDecl.name === 'object') {
        result[estreeName] = convertRawCompilerNode(
          varDecl.name as Record<string, unknown>,
          depth + 1,
        )
      } else {
        result[estreeName] = null
      }
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

  // VariableDeclarationList: convert flags to ESTree kind property ('var'/'let'/'const')
  if (result.type === 'VariableDeclaration') {
    let flags: number | undefined = undefined
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

function convertCompilerNode(node: Node, depth: number = 0): Record<string, unknown> | null {
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

  const compilerNode = (node as unknown as { compilerNode: Record<string, unknown> }).compilerNode
  if (compilerNode && typeof compilerNode === 'object') {
    // Add source position metadata
    if (typeof compilerNode.pos === 'number' && typeof compilerNode.end === 'number') {
      result.range = [compilerNode.pos, compilerNode.end] as [number, number]
      result.start = compilerNode.pos
      result.end = compilerNode.end
    }
  }

  // Add literal value
  if (kindName === 'StringLiteral') {
    const text = node.getText()
    result.value = text.slice(1, -1) // Remove quotes
    result.raw = text
  } else if (kindName === 'NumericLiteral' || kindName === 'BigIntLiteral') {
    const text = node.getText()
    result.value = Number(text)
    result.raw = text
  } else if (kindName === 'TrueKeyword') {
    result.value = true
    result.raw = 'true'
  } else if (kindName === 'FalseKeyword') {
    result.value = false
    result.raw = 'false'
  } else if (kindName === 'NullKeyword') {
    result.value = null
    result.raw = 'null'
  } else if (kindName === 'RegularExpressionLiteral') {
    const regexText = node.getText()
    result.raw = regexText
    const regexMatch = regexText.match(/^\/(.*)\/([gimsuvy]*)$/)
    if (regexMatch) {
      result.regex = { pattern: regexMatch[1], flags: regexMatch[2] }
    }
  }

  // Iterate compiler node children using raw compiler node
  // (ts-morph getter methods like getExpression() fail on detached nodes)
  try {
    const compilerNode = (node as unknown as { compilerNode: Record<string, unknown> }).compilerNode
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
          if (varDecl.name && typeof varDecl.name === 'object') {
            result[estreeName] = convertRawCompilerNode(
              varDecl.name as Record<string, unknown>,
              depth + 1,
            )
          } else {
            result[estreeName] = null
          }
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

  if (result.type === 'VariableDeclaration') {
    let rawFlags = compilerNode?.flags
    if (typeof rawFlags === 'number' && rawFlags & 3) {
      // NodeFlags.Const = 2, NodeFlags.Let = 1
      if (rawFlags & 2) {
        result.kind = 'const'
      } else {
        result.kind = 'let'
      }
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
    // Optional chaining: PropertyAccessExpression and ElementAccessExpression
    // can have a questionDotToken (?.) — set .optional = true for ESTree
    if (Node.isPropertyAccessExpression(node)) {
      if ((node as any).questionDotToken) base.optional = true
    }
    if (Node.isElementAccessExpression(node)) {
      if ((node as any).questionDotToken) base.optional = true
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
  }

  return base
}

function convertSeverity(severity: 'off' | 'warn' | 'error'): 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'error':
      return 'error'
    case 'warn':
      return 'warning'
    case 'off':
      return 'info'
  }
}

function convertMeta(pluginMeta: PluginRuleDefinition['meta'], ruleId: string): RuleMeta {
  return {
    name: ruleId,
    description: pluginMeta.docs?.description ?? pluginMeta.type,
    category: mapCategory(pluginMeta.docs?.category),
    recommended: pluginMeta.docs?.recommended ?? false,
    deprecated: pluginMeta.deprecated,
    replacedBy: pluginMeta.replacedBy?.[0],
    severity: convertSeverity(pluginMeta.severity),
    fixable:
      pluginMeta.fixable === 'code'
        ? 'code'
        : pluginMeta.fixable === 'whitespace'
          ? 'whitespace'
          : undefined,
    docs: pluginMeta.docs?.url
      ? { description: pluginMeta.docs?.description, url: pluginMeta.docs.url }
      : undefined,
  }
}

function mapCategory(category: string | undefined): RuleMeta['category'] {
  switch (category?.toLowerCase()) {
    case 'performance':
      return 'performance'
    case 'security':
      return 'security'
    case 'style':
      return 'style'
    case 'correctness':
      return 'correctness'
    case 'complexity':
      return 'complexity'
    case 'patterns':
      return 'patterns'
    case 'dependencies':
      return 'dependencies'
    default:
      return 'style'
  }
}

function setParentRefs(
  node: Record<string, unknown>,
  parent: Record<string, unknown> | null = null,
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
    meta: convertMeta(pluginRule.meta, ruleId),
    defaultOptions: {},

    create(_options: RuleOptions) {
      let violations: RuleViolation[] = []
      let sourceFile: SourceFile | null = null
      let sourceText = ''

      const convertedNodes = new WeakMap<Node, Record<string, unknown>>()

      const pluginContext: PluginRuleContext = {
        logger: silentLogger,
        config: defaultConfig,
        workspaceRoot: process.cwd(),
        getSource: () => sourceText,
        getFilePath: () => sourceFile?.getFilePath() ?? '',
        getAST: () => null,
        getTokens: () => [],
        getComments: () => [],
        report: (descriptor: ReportDescriptor) => {
          const loc = descriptor.loc ?? {
            start: { line: 1, column: 0 },
            end: { line: 1, column: 1 },
          }

          violations.push({
            ruleId,
            severity: convertSeverity(pluginRule.meta.severity),
            message: descriptor.message,
            filePath: sourceFile?.getFilePath() ?? '',
            range: {
              start: { line: loc.start.line, column: loc.start.column },
              end: { line: loc.end.line, column: loc.end.column },
            },
            suggestion: descriptor.suggest?.[0]?.desc,
          })
        },
      }

      const pluginVisitor = pluginRule.create(pluginContext)

      const visitor: ASTVisitor = {
        visitSourceFile(node, _context: VisitorContext) {
          sourceFile = node
          sourceText = node.getFullText()
          violations = []

          const genericNode = nodeToGeneric(node)
          setParentRefs(genericNode)
          convertedNodes.set(node, genericNode)

          const handler = pluginVisitor['SourceFile'] ?? pluginVisitor['Program']
          if (handler) {
            handler(genericNode)
          }
        },

        visitNode(node, _context: VisitorContext) {
          if (!sourceFile) {
            sourceFile = node.getSourceFile()
            sourceText = sourceFile.getFullText()
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
          // ts-morph classes contain members directly; ESTree wraps them in a ClassBody node
          if (kindName === 'ClassDeclaration' || kindName === 'ClassExpression') {
            const body = genericNode.body
            if (Array.isArray(body)) {
              const classBodyNode: Record<string, unknown> = {
                type: 'ClassBody',
                body,
                range: genericNode.range,
                loc: genericNode.loc,
                parent: genericNode,
              }
              for (const member of body) {
                if (member && typeof member === 'object') {
                  ;(member as Record<string, unknown>).parent = classBodyNode
                }
              }
              const classBodyHandler = pluginVisitor['ClassBody']
              if (classBodyHandler) {
                classBodyHandler(classBodyNode)
              }
            }
          }

          // === Export wrapper dispatch ===
          // Declarations with export modifier → synthetic ExportNamedDeclaration/ExportDefaultDeclaration
          if (EXPORTABLE_KINDS.has(kindName)) {
            const { isExported, isDefault } = getExportInfo(node)
            if (isExported) {
              const exportWrapper: Record<string, unknown> = {
                type: isDefault ? 'ExportDefaultDeclaration' : 'ExportNamedDeclaration',
                declaration: genericNode,
                ...(isDefault ? {} : { specifiers: [] }),
                source: null,
                range: genericNode.range,
                loc: genericNode.loc,
              }
              const exportType = exportWrapper.type as string
              const exportHandler = pluginVisitor[exportType]
              if (exportHandler) {
                exportHandler(exportWrapper)
              }
            }
          }

          // ExportDeclaration → add specifiers and dispatch as ExportNamedDeclaration
          if (kindName === 'ExportDeclaration') {
            const exportSpecs = extractExportSpecifiers(node)
            if (exportSpecs.length > 0) {
              genericNode.specifiers = exportSpecs
            }
            const exportNamedHandler = pluginVisitor['ExportNamedDeclaration']
            if (exportNamedHandler) {
              const wrapper: Record<string, unknown> = {
                type: 'ExportNamedDeclaration',
                declaration: null,
                specifiers: exportSpecs,
                source: genericNode.moduleSpecifier ?? null,
                range: genericNode.range,
                loc: genericNode.loc,
              }
              exportNamedHandler(wrapper)
            }
          }

          // ExportAssignment → dispatch as ExportDefaultDeclaration
          if (kindName === 'ExportAssignment') {
            const defWrapper: Record<string, unknown> = {
              type: 'ExportDefaultDeclaration',
              declaration: genericNode.expression ?? genericNode,
              range: genericNode.range,
              loc: genericNode.loc,
            }
            const defHandler = pluginVisitor['ExportDefaultDeclaration']
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

          const genericHandler = pluginVisitor['*'] ?? pluginVisitor['Any']
          if (genericHandler) {
            genericHandler(genericNode)
          }
        },

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
            const body = genericNode.body
            if (Array.isArray(body)) {
              const classBodyNode: Record<string, unknown> = {
                type: 'ClassBody',
                body,
                range: genericNode.range,
                loc: genericNode.loc,
                parent: genericNode,
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
            const { isExported, isDefault } = getExportInfo(node)
            if (isExported) {
              const exportWrapper: Record<string, unknown> = {
                type: isDefault ? 'ExportDefaultDeclaration' : 'ExportNamedDeclaration',
                declaration: genericNode,
                ...(isDefault ? {} : { specifiers: [] }),
                source: null,
                range: genericNode.range,
                loc: genericNode.loc,
              }
              const exportType = exportWrapper.type as string
              const exportExitHandler = pluginVisitor[exportType + ':exit']
              if (exportExitHandler) {
                exportExitHandler(exportWrapper)
              }
            }
          }

          // ExportDeclaration → dispatch ExportNamedDeclaration:exit
          if (kindName === 'ExportDeclaration') {
            const exportSpecs = (genericNode as Record<string, unknown>).specifiers as
              | unknown[]
              | undefined
            const specsToUse = exportSpecs && exportSpecs.length > 0 ? exportSpecs : []
            const exportNamedExitHandler = pluginVisitor['ExportNamedDeclaration:exit']
            if (exportNamedExitHandler) {
              const wrapper: Record<string, unknown> = {
                type: 'ExportNamedDeclaration',
                declaration: null,
                specifiers: specsToUse,
                source: genericNode.moduleSpecifier ?? null,
                range: genericNode.range,
                loc: genericNode.loc,
              }
              exportNamedExitHandler(wrapper)
            }
          }

          // ExportAssignment → dispatch ExportDefaultDeclaration:exit
          if (kindName === 'ExportAssignment') {
            const defWrapper: Record<string, unknown> = {
              type: 'ExportDefaultDeclaration',
              declaration: genericNode.expression ?? genericNode,
              range: genericNode.range,
              loc: genericNode.loc,
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
      }

      return {
        visitor,
        onComplete: () => {
          return violations
        },
      }
    },
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
