import type { Node, SourceFile } from 'ts-morph'
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
  RegularExpressionLiteral: 'Literal',
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
  InterfaceDeclaration: 'InterfaceDeclaration',
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
  PropertyDeclaration: { name: 'key' },
  PropertyAssignment: { name: 'key' },
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
  const base: Record<string, unknown> = {
    type: KIND_NAME_ALIASES[kindName] ?? kindName,
    range: [start, end] as [number, number],
    loc: {
      start: { line: startPos.line, column: startPos.column },
      end: { line: endPos.line, column: endPos.column },
    },
    start,
    end,
    text: node.getText(),
  }

  // Enhanced properties from compiler node traversal
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

export function adaptPluginRule(pluginRule: PluginRuleDefinition, ruleId: string): RuleDefinition {
  return {
    meta: convertMeta(pluginRule.meta, ruleId),
    defaultOptions: {},

    create(_options: RuleOptions) {
      let violations: RuleViolation[] = []
      let sourceFile: SourceFile | null = null
      let sourceText = ''

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

          const handler = pluginVisitor['SourceFile'] ?? pluginVisitor['Program']
          if (handler) {
            handler(nodeToGeneric(node))
          }
        },

        visitNode(node, _context: VisitorContext) {
          if (!sourceFile) {
            sourceFile = node.getSourceFile()
            sourceText = sourceFile.getFullText()
          }

          const kindName = node.getKindName()
          const genericNode = nodeToGeneric(node)

          // Special case: ts-morph's BinaryExpression covers both binary ops and assignments.
          // ESTree separates these into BinaryExpression and AssignmentExpression.
          // Detect assignment operators and set the correct ESTree type.
          if (
            kindName === 'BinaryExpression' &&
            ASSIGNMENT_OPERATORS.has(genericNode.operator as string)
          ) {
            genericNode.type = 'AssignmentExpression'
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

          const genericHandler = pluginVisitor['*'] ?? pluginVisitor['Any']
          if (genericHandler) {
            genericHandler(genericNode)
          }
        },
      }

      return {
        visitor,
        onComplete: () => {
          const exitHandler = pluginVisitor['Program:exit']
          if (exitHandler) {
            exitHandler({})
          }
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
