import { describe, it, expect } from 'vitest'
import {
  KIND_MAP,
  silentLogger,
  defaultConfig,
  PROPERTY_MAP,
  KIND_NAME_ALIASES,
  KIND_SPECIFIC_MAP,
  MAX_DEPTH,
  SKIP_KEYS,
  OPERATOR_TOKEN_MAP,
  ASSIGNMENT_OPERATORS,
  LOGICAL_OPERATORS,
  EXPORTABLE_KINDS,
} from '../src/rules/adapter-constants.js'

// ─── KIND_MAP ──────────────────────────────────────────
describe('KIND_MAP', () => {
  it('maps numeric SyntaxKind values to string names', () => {
    expect(typeof KIND_MAP).toBe('object')
    const values = Object.values(KIND_MAP)
    expect(values.length).toBeGreaterThan(100)
  })

  it('contains common node types', () => {
    expect(Object.values(KIND_MAP)).toContain('Identifier')
    expect(Object.values(KIND_MAP)).toContain('StringLiteral')
    expect(Object.values(KIND_MAP)).toContain('NumericLiteral')
    expect(Object.values(KIND_MAP)).toContain('BinaryExpression')
    expect(Object.values(KIND_MAP)).toContain('CallExpression')
    expect(Object.values(KIND_MAP)).toContain('FunctionDeclaration')
    expect(Object.values(KIND_MAP)).toContain('ClassDeclaration')
    expect(Object.values(KIND_MAP)).toContain('ReturnStatement')
    expect(Object.values(KIND_MAP)).toContain('IfStatement')
    expect(Object.values(KIND_MAP)).toContain('ForStatement')
  })

  it('excludes First* range markers', () => {
    for (const name of Object.values(KIND_MAP)) {
      expect(name.startsWith('First')).toBe(false)
    }
  })

  it('excludes Last* range markers', () => {
    for (const name of Object.values(KIND_MAP)) {
      expect(name.startsWith('Last')).toBe(false)
    }
  })

  it('only contains string values', () => {
    for (const val of Object.values(KIND_MAP)) {
      expect(typeof val).toBe('string')
    }
  })

  it('only contains number keys', () => {
    for (const key of Object.keys(KIND_MAP)) {
      expect(Number.isInteger(Number(key))).toBe(true)
    }
  })

  it('maps kind number 80 to Identifier', () => {
    // ts-morph SyntaxKind.Identifier = 80
    expect(KIND_MAP[80]).toBe('Identifier')
  })

  it('maps kind number 11 to StringLiteral', () => {
    // ts-morph SyntaxKind.StringLiteral = 11
    expect(KIND_MAP[11]).toBe('StringLiteral')
  })

  it('maps kind number 9 to NumericLiteral', () => {
    // ts-morph SyntaxKind.NumericLiteral = 9
    expect(KIND_MAP[9]).toBe('NumericLiteral')
  })

  it('returns undefined for unknown kind numbers', () => {
    expect(KIND_MAP[-1]).toBeUndefined()
    expect(KIND_MAP[999999]).toBeUndefined()
  })

  it('has unique values (no duplicate kind names)', () => {
    const values = Object.values(KIND_MAP)
    const unique = new Set(values)
    expect(unique.size).toBe(values.length)
  })
})

// ─── silentLogger ──────────────────────────────────────
describe('silentLogger', () => {
  it('has debug method that does not throw', () => {
    expect(() => silentLogger.debug('msg')).not.toThrow()
  })

  it('has error method that does not throw', () => {
    expect(() => silentLogger.error('msg')).not.toThrow()
  })

  it('has info method that does not throw', () => {
    expect(() => silentLogger.info('msg')).not.toThrow()
  })

  it('has warn method that does not throw', () => {
    expect(() => silentLogger.warn('msg')).not.toThrow()
  })

  it('debug returns undefined', () => {
    expect(silentLogger.debug('msg')).toBeUndefined()
  })

  it('error returns undefined', () => {
    expect(silentLogger.error('msg')).toBeUndefined()
  })

  it('info returns undefined', () => {
    expect(silentLogger.info('msg')).toBeUndefined()
  })

  it('warn returns undefined', () => {
    expect(silentLogger.warn('msg')).toBeUndefined()
  })

  it('accepts multiple arguments', () => {
    expect(() => silentLogger.debug('msg', 1, { a: 2 })).not.toThrow()
    expect(() => silentLogger.error('msg', new Error('x'))).not.toThrow()
  })

  it('has exactly 4 methods', () => {
    const methods = Object.keys(silentLogger)
    expect(methods).toHaveLength(4)
    expect(methods.sort()).toEqual(['debug', 'error', 'info', 'warn'])
  })
})

// ─── defaultConfig ─────────────────────────────────────
describe('defaultConfig', () => {
  it('has empty options', () => {
    expect(defaultConfig.options).toEqual({})
  })

  it('has empty rules', () => {
    expect(defaultConfig.rules).toEqual({})
  })

  it('has empty transforms array', () => {
    expect(defaultConfig.transforms).toEqual([])
  })

  it('options is a plain object', () => {
    expect(typeof defaultConfig.options).toBe('object')
    expect(defaultConfig.options).not.toBeNull()
  })

  it('rules is a plain object', () => {
    expect(typeof defaultConfig.rules).toBe('object')
    expect(defaultConfig.rules).not.toBeNull()
  })

  it('transforms is an array', () => {
    expect(Array.isArray(defaultConfig.transforms)).toBe(true)
  })

  it('has exactly 3 top-level keys', () => {
    expect(Object.keys(defaultConfig)).toHaveLength(3)
  })
})

// ─── PROPERTY_MAP ──────────────────────────────────────
describe('PROPERTY_MAP', () => {
  it('maps alternate to alternate', () => {
    expect(PROPERTY_MAP['alternate']).toBe('alternate')
  })

  it('maps body to body', () => {
    expect(PROPERTY_MAP['body']).toBe('body')
  })

  it('maps condition to test', () => {
    expect(PROPERTY_MAP['condition']).toBe('test')
  })

  it('maps expression to argument', () => {
    expect(PROPERTY_MAP['expression']).toBe('argument')
  })

  it('maps initializer to init', () => {
    expect(PROPERTY_MAP['initializer']).toBe('init')
  })

  it('maps statements to body', () => {
    expect(PROPERTY_MAP['statements']).toBe('body')
  })

  it('maps declarations to declarations', () => {
    expect(PROPERTY_MAP['declarations']).toBe('declarations')
  })

  it('maps parameters to params', () => {
    expect(PROPERTY_MAP['parameters']).toBe('params')
  })

  it('maps elseStatement to alternate', () => {
    expect(PROPERTY_MAP['elseStatement']).toBe('alternate')
  })

  it('maps thenStatement to consequent', () => {
    expect(PROPERTY_MAP['thenStatement']).toBe('consequent')
  })

  it('maps type to typeAnnotation', () => {
    expect(PROPERTY_MAP['type']).toBe('typeAnnotation')
  })

  it('maps escapedText to name', () => {
    expect(PROPERTY_MAP['escapedText']).toBe('name')
  })

  it('maps name to name', () => {
    expect(PROPERTY_MAP['name']).toBe('name')
  })

  it('maps operatorToken to operator', () => {
    expect(PROPERTY_MAP['operatorToken']).toBe('operator')
  })

  it('maps text to raw', () => {
    expect(PROPERTY_MAP['text']).toBe('raw')
  })

  it('maps moduleSpecifier to source', () => {
    expect(PROPERTY_MAP['moduleSpecifier']).toBe('source')
  })

  it('maps heritageClauses to heritage', () => {
    expect(PROPERTY_MAP['heritageClauses']).toBe('heritage')
  })

  it('has only string keys and string values', () => {
    for (const [key, val] of Object.entries(PROPERTY_MAP)) {
      expect(typeof key).toBe('string')
      expect(typeof val).toBe('string')
    }
  })

  it('has more than 40 entries', () => {
    expect(Object.keys(PROPERTY_MAP).length).toBeGreaterThan(40)
  })

  it('maps members to body', () => {
    expect(PROPERTY_MAP['members']).toBe('body')
  })

  it('maps block to body', () => {
    expect(PROPERTY_MAP['block']).toBe('body')
  })

  it('maps incrementor is not in map (uses default key)', () => {
    expect(PROPERTY_MAP['incrementor']).toBeUndefined()
  })
})

// ─── KIND_NAME_ALIASES ────────────────────────────────
describe('KIND_NAME_ALIASES', () => {
  it('maps Identifier to Identifier', () => {
    expect(KIND_NAME_ALIASES['Identifier']).toBe('Identifier')
  })

  it('maps BinaryExpression to BinaryExpression', () => {
    expect(KIND_NAME_ALIASES['BinaryExpression']).toBe('BinaryExpression')
  })

  it('maps CallExpression to CallExpression', () => {
    expect(KIND_NAME_ALIASES['CallExpression']).toBe('CallExpression')
  })

  it('maps StringLiteral to Literal', () => {
    expect(KIND_NAME_ALIASES['StringLiteral']).toBe('Literal')
  })

  it('maps NumericLiteral to Literal', () => {
    expect(KIND_NAME_ALIASES['NumericLiteral']).toBe('Literal')
  })

  it('maps ArrayLiteralExpression to ArrayExpression', () => {
    expect(KIND_NAME_ALIASES['ArrayLiteralExpression']).toBe('ArrayExpression')
  })

  it('maps ArrowFunction to ArrowFunctionExpression', () => {
    expect(KIND_NAME_ALIASES['ArrowFunction']).toBe('ArrowFunctionExpression')
  })

  it('maps Block to BlockStatement', () => {
    expect(KIND_NAME_ALIASES['Block']).toBe('BlockStatement')
  })

  it('maps IfStatement to IfStatement', () => {
    expect(KIND_NAME_ALIASES['IfStatement']).toBe('IfStatement')
  })

  it('maps FunctionDeclaration to FunctionDeclaration', () => {
    expect(KIND_NAME_ALIASES['FunctionDeclaration']).toBe('FunctionDeclaration')
  })

  it('maps ClassDeclaration to ClassDeclaration', () => {
    expect(KIND_NAME_ALIASES['ClassDeclaration']).toBe('ClassDeclaration')
  })

  it('maps FalseKeyword to BooleanLiteral', () => {
    expect(KIND_NAME_ALIASES['FalseKeyword']).toBe('BooleanLiteral')
  })

  it('maps TrueKeyword to BooleanLiteral', () => {
    expect(KIND_NAME_ALIASES['TrueKeyword']).toBe('BooleanLiteral')
  })

  it('maps NullKeyword to Literal', () => {
    expect(KIND_NAME_ALIASES['NullKeyword']).toBe('Literal')
  })

  it('maps ObjectLiteralExpression to ObjectExpression', () => {
    expect(KIND_NAME_ALIASES['ObjectLiteralExpression']).toBe('ObjectExpression')
  })

  it('maps PropertyAccessExpression to MemberExpression', () => {
    expect(KIND_NAME_ALIASES['PropertyAccessExpression']).toBe('MemberExpression')
  })

  it('maps ElementAccessExpression to MemberExpression', () => {
    expect(KIND_NAME_ALIASES['ElementAccessExpression']).toBe('MemberExpression')
  })

  it('maps RegularExpressionLiteral to RegExpLiteral', () => {
    expect(KIND_NAME_ALIASES['RegularExpressionLiteral']).toBe('RegExpLiteral')
  })

  it('maps VariableDeclaration to VariableDeclarator', () => {
    expect(KIND_NAME_ALIASES['VariableDeclaration']).toBe('VariableDeclarator')
  })

  it('maps PrefixUnaryExpression to UnaryExpression', () => {
    expect(KIND_NAME_ALIASES['PrefixUnaryExpression']).toBe('UnaryExpression')
  })

  it('maps PostfixUnaryExpression to UpdateExpression', () => {
    expect(KIND_NAME_ALIASES['PostfixUnaryExpression']).toBe('UpdateExpression')
  })

  it('maps ThisKeyword to ThisExpression', () => {
    expect(KIND_NAME_ALIASES['ThisKeyword']).toBe('ThisExpression')
  })

  it('maps SuperKeyword to Super', () => {
    expect(KIND_NAME_ALIASES['SuperKeyword']).toBe('Super')
  })

  it('maps TemplateExpression to TemplateLiteral', () => {
    expect(KIND_NAME_ALIASES['TemplateExpression']).toBe('TemplateLiteral')
  })

  it('maps ImportDeclaration to ImportDeclaration', () => {
    expect(KIND_NAME_ALIASES['ImportDeclaration']).toBe('ImportDeclaration')
  })

  it('maps CaseClause to SwitchCase', () => {
    expect(KIND_NAME_ALIASES['CaseClause']).toBe('SwitchCase')
  })

  it('maps DefaultClause to SwitchCase', () => {
    expect(KIND_NAME_ALIASES['DefaultClause']).toBe('SwitchCase')
  })

  it('has only string keys and string values', () => {
    for (const [key, val] of Object.entries(KIND_NAME_ALIASES)) {
      expect(typeof key).toBe('string')
      expect(typeof val).toBe('string')
    }
  })

  it('has more than 80 entries', () => {
    expect(Object.keys(KIND_NAME_ALIASES).length).toBeGreaterThan(80)
  })
})

// ─── KIND_SPECIFIC_MAP ────────────────────────────────
describe('KIND_SPECIFIC_MAP', () => {
  it('maps CallExpression.expression to callee', () => {
    expect(KIND_SPECIFIC_MAP['CallExpression']?.['expression']).toBe('callee')
  })

  it('maps NewExpression.expression to callee', () => {
    expect(KIND_SPECIFIC_MAP['NewExpression']?.['expression']).toBe('callee')
  })

  it('maps PropertyAccessExpression.expression to object', () => {
    expect(KIND_SPECIFIC_MAP['PropertyAccessExpression']?.['expression']).toBe('object')
  })

  it('maps PropertyAccessExpression.name to property', () => {
    expect(KIND_SPECIFIC_MAP['PropertyAccessExpression']?.['name']).toBe('property')
  })

  it('maps IfStatement.expression to test', () => {
    expect(KIND_SPECIFIC_MAP['IfStatement']?.['expression']).toBe('test')
  })

  it('maps IfStatement.thenStatement to consequent', () => {
    expect(KIND_SPECIFIC_MAP['IfStatement']?.['thenStatement']).toBe('consequent')
  })

  it('maps IfStatement.elseStatement to alternate', () => {
    expect(KIND_SPECIFIC_MAP['IfStatement']?.['elseStatement']).toBe('alternate')
  })

  it('maps ForStatement.initializer to init', () => {
    expect(KIND_SPECIFIC_MAP['ForStatement']?.['initializer']).toBe('init')
  })

  it('maps ForStatement.condition to test', () => {
    expect(KIND_SPECIFIC_MAP['ForStatement']?.['condition']).toBe('test')
  })

  it('maps ForStatement.incrementor to update', () => {
    expect(KIND_SPECIFIC_MAP['ForStatement']?.['incrementor']).toBe('update')
  })

  it('maps SwitchStatement.expression to discriminant', () => {
    expect(KIND_SPECIFIC_MAP['SwitchStatement']?.['expression']).toBe('discriminant')
  })

  it('maps SwitchStatement.caseBlock to cases', () => {
    expect(KIND_SPECIFIC_MAP['SwitchStatement']?.['caseBlock']).toBe('cases')
  })

  it('maps TryStatement.tryBlock to block', () => {
    expect(KIND_SPECIFIC_MAP['TryStatement']?.['tryBlock']).toBe('block')
  })

  it('maps TryStatement.catchClause to handler', () => {
    expect(KIND_SPECIFIC_MAP['TryStatement']?.['catchClause']).toBe('handler')
  })

  it('maps TryStatement.finallyBlock to finalizer', () => {
    expect(KIND_SPECIFIC_MAP['TryStatement']?.['finallyBlock']).toBe('finalizer')
  })

  it('maps ClassDeclaration.name to id', () => {
    expect(KIND_SPECIFIC_MAP['ClassDeclaration']?.['name']).toBe('id')
  })

  it('maps FunctionDeclaration.name to id', () => {
    expect(KIND_SPECIFIC_MAP['FunctionDeclaration']?.['name']).toBe('id')
  })

  it('maps ThrowStatement.expression to argument', () => {
    expect(KIND_SPECIFIC_MAP['ThrowStatement']?.['expression']).toBe('argument')
  })

  it('maps ReturnStatement.expression to argument', () => {
    expect(KIND_SPECIFIC_MAP['ReturnStatement']?.['expression']).toBe('argument')
  })

  it('maps PropertyAssignment.initializer to value', () => {
    expect(KIND_SPECIFIC_MAP['PropertyAssignment']?.['initializer']).toBe('value')
  })

  it('maps PropertyAssignment.name to key', () => {
    expect(KIND_SPECIFIC_MAP['PropertyAssignment']?.['name']).toBe('key')
  })

  it('maps AwaitExpression.expression to argument', () => {
    expect(KIND_SPECIFIC_MAP['AwaitExpression']?.['expression']).toBe('argument')
  })

  it('maps TaggedTemplateExpression.template to quasi', () => {
    expect(KIND_SPECIFIC_MAP['TaggedTemplateExpression']?.['template']).toBe('quasi')
  })

  it('maps VariableDeclaration.name to id', () => {
    expect(KIND_SPECIFIC_MAP['VariableDeclaration']?.['name']).toBe('id')
  })

  it('maps FunctionDeclaration.type to returnType', () => {
    expect(KIND_SPECIFIC_MAP['FunctionDeclaration']?.['type']).toBe('returnType')
  })

  it('maps ArrowFunction.type to returnType', () => {
    expect(KIND_SPECIFIC_MAP['ArrowFunction']?.['type']).toBe('returnType')
  })

  it('maps MethodDeclaration.name to key', () => {
    expect(KIND_SPECIFIC_MAP['MethodDeclaration']?.['name']).toBe('key')
  })

  it('maps GetAccessor.name to key', () => {
    expect(KIND_SPECIFIC_MAP['GetAccessor']?.['name']).toBe('key')
  })

  it('maps SetAccessor.name to key', () => {
    expect(KIND_SPECIFIC_MAP['SetAccessor']?.['name']).toBe('key')
  })

  it('has more than 30 kind entries', () => {
    expect(Object.keys(KIND_SPECIFIC_MAP).length).toBeGreaterThan(30)
  })

  it('has only string values in nested maps', () => {
    for (const inner of Object.values(KIND_SPECIFIC_MAP)) {
      for (const val of Object.values(inner)) {
        expect(typeof val).toBe('string')
      }
    }
  })
})

// ─── MAX_DEPTH ─────────────────────────────────────────
describe('MAX_DEPTH', () => {
  it('is 5', () => {
    expect(MAX_DEPTH).toBe(5)
  })

  it('is a number', () => {
    expect(typeof MAX_DEPTH).toBe('number')
  })

  it('is a positive integer', () => {
    expect(MAX_DEPTH).toBeGreaterThan(0)
    expect(Number.isInteger(MAX_DEPTH)).toBe(true)
  })
})

// ─── SKIP_KEYS ────────────────────────────────────────
describe('SKIP_KEYS', () => {
  it('is a Set', () => {
    expect(SKIP_KEYS).toBeInstanceOf(Set)
  })

  it('contains "end"', () => {
    expect(SKIP_KEYS.has('end')).toBe(true)
  })

  it('contains "pos"', () => {
    expect(SKIP_KEYS.has('pos')).toBe(true)
  })

  it('contains "kind"', () => {
    expect(SKIP_KEYS.has('kind')).toBe(true)
  })

  it('contains "parent"', () => {
    expect(SKIP_KEYS.has('parent')).toBe(true)
  })

  it('contains "flags"', () => {
    expect(SKIP_KEYS.has('flags')).toBe(true)
  })

  it('contains "id"', () => {
    expect(SKIP_KEYS.has('id')).toBe(true)
  })

  it('contains "symbol"', () => {
    expect(SKIP_KEYS.has('symbol')).toBe(true)
  })

  it('contains "original"', () => {
    expect(SKIP_KEYS.has('original')).toBe(true)
  })

  it('contains "locals"', () => {
    expect(SKIP_KEYS.has('locals')).toBe(true)
  })

  it('contains "transformFlags"', () => {
    expect(SKIP_KEYS.has('transformFlags')).toBe(true)
  })

  it('contains "modifierFlagsCache"', () => {
    expect(SKIP_KEYS.has('modifierFlagsCache')).toBe(true)
  })

  it('contains "nextContainer"', () => {
    expect(SKIP_KEYS.has('nextContainer')).toBe(true)
  })

  it('contains "jlChildren"', () => {
    expect(SKIP_KEYS.has('jlChildren')).toBe(true)
  })

  it('does not contain "expression"', () => {
    expect(SKIP_KEYS.has('expression')).toBe(false)
  })

  it('does not contain "name"', () => {
    expect(SKIP_KEYS.has('name')).toBe(false)
  })

  it('does not contain "body"', () => {
    expect(SKIP_KEYS.has('body')).toBe(false)
  })

  it('has 63 entries', () => {
    expect(SKIP_KEYS.size).toBe(63)
  })
})

// ─── OPERATOR_TOKEN_MAP ───────────────────────────────
describe('OPERATOR_TOKEN_MAP', () => {
  it('maps EqualsToken to "="', () => {
    expect(OPERATOR_TOKEN_MAP['EqualsToken']).toBe('=')
  })

  it('maps PlusToken to "+"', () => {
    expect(OPERATOR_TOKEN_MAP['PlusToken']).toBe('+')
  })

  it('maps MinusToken to "-"', () => {
    expect(OPERATOR_TOKEN_MAP['MinusToken']).toBe('-')
  })

  it('maps AsteriskToken to "*"', () => {
    expect(OPERATOR_TOKEN_MAP['AsteriskToken']).toBe('*')
  })

  it('maps SlashToken to "/"', () => {
    expect(OPERATOR_TOKEN_MAP['SlashToken']).toBe('/')
  })

  it('maps PercentToken to "%"', () => {
    expect(OPERATOR_TOKEN_MAP['PercentToken']).toBe('%')
  })

  it('maps EqualsEqualsEqualsToken to "==="', () => {
    expect(OPERATOR_TOKEN_MAP['EqualsEqualsEqualsToken']).toBe('===')
  })

  it('maps ExclamationEqualsEqualsToken to "!=="', () => {
    expect(OPERATOR_TOKEN_MAP['ExclamationEqualsEqualsToken']).toBe('!==')
  })

  it('maps LessThanToken to "<"', () => {
    expect(OPERATOR_TOKEN_MAP['LessThanToken']).toBe('<')
  })

  it('maps GreaterThanToken to ">"', () => {
    expect(OPERATOR_TOKEN_MAP['GreaterThanToken']).toBe('>')
  })

  it('maps AmpersandAmpersandToken to "&&"', () => {
    expect(OPERATOR_TOKEN_MAP['AmpersandAmpersandToken']).toBe('&&')
  })

  it('maps BarBarToken to "||"', () => {
    expect(OPERATOR_TOKEN_MAP['BarBarToken']).toBe('||')
  })

  it('maps ArrowToken to "=>"', () => {
    expect(OPERATOR_TOKEN_MAP['ArrowToken']).toBe('=>')
  })

  it('maps DotToken to "."', () => {
    expect(OPERATOR_TOKEN_MAP['DotToken']).toBe('.')
  })

  it('maps CommaToken to ","', () => {
    expect(OPERATOR_TOKEN_MAP['CommaToken']).toBe(',')
  })

  it('maps ColonToken to ":"', () => {
    expect(OPERATOR_TOKEN_MAP['ColonToken']).toBe(':')
  })

  it('maps SemicolonToken to ";"', () => {
    expect(OPERATOR_TOKEN_MAP['SemicolonToken']).toBe(';')
  })

  it('maps QuestionDotToken to "?."', () => {
    expect(OPERATOR_TOKEN_MAP['QuestionDotToken']).toBe('?.')
  })

  it('maps QuestionQuestionToken to "??"', () => {
    expect(OPERATOR_TOKEN_MAP['QuestionQuestionToken']).toBe('??')
  })

  it('maps AsteriskAsteriskToken to "**"', () => {
    expect(OPERATOR_TOKEN_MAP['AsteriskAsteriskToken']).toBe('**')
  })

  it('maps InKeyword to "in"', () => {
    expect(OPERATOR_TOKEN_MAP['InKeyword']).toBe('in')
  })

  it('maps InstanceOfKeyword to "instanceof"', () => {
    expect(OPERATOR_TOKEN_MAP['InstanceOfKeyword']).toBe('instanceof')
  })

  it('maps OfKeyword to "of"', () => {
    expect(OPERATOR_TOKEN_MAP['OfKeyword']).toBe('of')
  })

  it('maps TildeToken to "~"', () => {
    expect(OPERATOR_TOKEN_MAP['TildeToken']).toBe('~')
  })

  it('maps ExclamationToken to "!"', () => {
    expect(OPERATOR_TOKEN_MAP['ExclamationToken']).toBe('!')
  })

  it('maps DotDotDotToken to "..."', () => {
    expect(OPERATOR_TOKEN_MAP['DotDotDotToken']).toBe('...')
  })

  it('has only string keys and string values', () => {
    for (const [key, val] of Object.entries(OPERATOR_TOKEN_MAP)) {
      expect(typeof key).toBe('string')
      expect(typeof val).toBe('string')
    }
  })

  it('has more than 40 entries', () => {
    expect(Object.keys(OPERATOR_TOKEN_MAP).length).toBeGreaterThan(40)
  })
})

// ─── ASSIGNMENT_OPERATORS ─────────────────────────────
describe('ASSIGNMENT_OPERATORS', () => {
  it('is a Set', () => {
    expect(ASSIGNMENT_OPERATORS).toBeInstanceOf(Set)
  })

  it('contains "="', () => {
    expect(ASSIGNMENT_OPERATORS.has('=')).toBe(true)
  })

  it('contains "+="', () => {
    expect(ASSIGNMENT_OPERATORS.has('+=')).toBe(true)
  })

  it('contains "-="', () => {
    expect(ASSIGNMENT_OPERATORS.has('-=')).toBe(true)
  })

  it('contains "*="', () => {
    expect(ASSIGNMENT_OPERATORS.has('*=')).toBe(true)
  })

  it('contains "/="', () => {
    expect(ASSIGNMENT_OPERATORS.has('/=')).toBe(true)
  })

  it('contains "**="', () => {
    expect(ASSIGNMENT_OPERATORS.has('**=')).toBe(true)
  })

  it('contains "%="', () => {
    expect(ASSIGNMENT_OPERATORS.has('%=')).toBe(true)
  })

  it('contains "<<="', () => {
    expect(ASSIGNMENT_OPERATORS.has('<<=')).toBe(true)
  })

  it('contains ">>="', () => {
    expect(ASSIGNMENT_OPERATORS.has('>>=')).toBe(true)
  })

  it('contains ">>>="', () => {
    expect(ASSIGNMENT_OPERATORS.has('>>>=')).toBe(true)
  })

  it('contains "&="', () => {
    expect(ASSIGNMENT_OPERATORS.has('&=')).toBe(true)
  })

  it('contains "|="', () => {
    expect(ASSIGNMENT_OPERATORS.has('|=')).toBe(true)
  })

  it('contains "^="', () => {
    expect(ASSIGNMENT_OPERATORS.has('^=')).toBe(true)
  })

  it('contains "&&="', () => {
    expect(ASSIGNMENT_OPERATORS.has('&&=')).toBe(true)
  })

  it('contains "||="', () => {
    expect(ASSIGNMENT_OPERATORS.has('||=')).toBe(true)
  })

  it('contains "??"', () => {
    expect(ASSIGNMENT_OPERATORS.has('??=')).toBe(true)
  })

  it('does not contain "=="', () => {
    expect(ASSIGNMENT_OPERATORS.has('==')).toBe(false)
  })

  it('does not contain "==="', () => {
    expect(ASSIGNMENT_OPERATORS.has('===')).toBe(false)
  })

  it('does not contain "&&"', () => {
    expect(ASSIGNMENT_OPERATORS.has('&&')).toBe(false)
  })

  it('does not contain "+"', () => {
    expect(ASSIGNMENT_OPERATORS.has('+')).toBe(false)
  })

  it('has 17 entries', () => {
    expect(ASSIGNMENT_OPERATORS.size).toBe(16)
  })
})

// ─── LOGICAL_OPERATORS ────────────────────────────────
describe('LOGICAL_OPERATORS', () => {
  it('is a Set', () => {
    expect(LOGICAL_OPERATORS).toBeInstanceOf(Set)
  })

  it('contains "&&"', () => {
    expect(LOGICAL_OPERATORS.has('&&')).toBe(true)
  })

  it('contains "||"', () => {
    expect(LOGICAL_OPERATORS.has('||')).toBe(true)
  })

  it('contains "??"', () => {
    expect(LOGICAL_OPERATORS.has('??')).toBe(true)
  })

  it('does not contain "="', () => {
    expect(LOGICAL_OPERATORS.has('=')).toBe(false)
  })

  it('does not contain "+="', () => {
    expect(LOGICAL_OPERATORS.has('+=')).toBe(false)
  })

  it('has exactly 3 entries', () => {
    expect(LOGICAL_OPERATORS.size).toBe(3)
  })
})

// ─── EXPORTABLE_KINDS ─────────────────────────────────
describe('EXPORTABLE_KINDS', () => {
  it('is a Set', () => {
    expect(EXPORTABLE_KINDS).toBeInstanceOf(Set)
  })

  it('contains ClassDeclaration', () => {
    expect(EXPORTABLE_KINDS.has('ClassDeclaration')).toBe(true)
  })

  it('contains EnumDeclaration', () => {
    expect(EXPORTABLE_KINDS.has('EnumDeclaration')).toBe(true)
  })

  it('contains FunctionDeclaration', () => {
    expect(EXPORTABLE_KINDS.has('FunctionDeclaration')).toBe(true)
  })

  it('contains InterfaceDeclaration', () => {
    expect(EXPORTABLE_KINDS.has('InterfaceDeclaration')).toBe(true)
  })

  it('contains ModuleDeclaration', () => {
    expect(EXPORTABLE_KINDS.has('ModuleDeclaration')).toBe(true)
  })

  it('contains TypeAliasDeclaration', () => {
    expect(EXPORTABLE_KINDS.has('TypeAliasDeclaration')).toBe(true)
  })

  it('does not contain VariableDeclaration', () => {
    expect(EXPORTABLE_KINDS.has('VariableDeclaration')).toBe(false)
  })

  it('does not contain Identifier', () => {
    expect(EXPORTABLE_KINDS.has('Identifier')).toBe(false)
  })

  it('has exactly 6 entries', () => {
    expect(EXPORTABLE_KINDS.size).toBe(6)
  })
})
