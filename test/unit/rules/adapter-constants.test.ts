import { describe, test, expect } from 'vitest'
import { SyntaxKind } from 'ts-morph'
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
} from '../../../src/rules/adapter-constants.js'

describe('adapter-constants', () => {
  describe('KIND_MAP', () => {
    test('is a Record<number, string>', () => {
      expect(typeof KIND_MAP).toBe('object')
      expect(KIND_MAP).not.toBeNull()
    })

    test('maps SyntaxKind.StringLiteral to "StringLiteral"', () => {
      expect(KIND_MAP[SyntaxKind.StringLiteral]).toBe('StringLiteral')
    })

    test('maps SyntaxKind.NumericLiteral to "NumericLiteral"', () => {
      expect(KIND_MAP[SyntaxKind.NumericLiteral]).toBe('NumericLiteral')
    })

    test('maps SyntaxKind.Identifier to "Identifier"', () => {
      expect(KIND_MAP[SyntaxKind.Identifier]).toBe('Identifier')
    })

    test('maps SyntaxKind.Block to "Block"', () => {
      expect(KIND_MAP[SyntaxKind.Block]).toBe('Block')
    })

    test('maps SyntaxKind.FunctionDeclaration to "FunctionDeclaration"', () => {
      expect(KIND_MAP[SyntaxKind.FunctionDeclaration]).toBe('FunctionDeclaration')
    })

    test('maps SyntaxKind.ClassDeclaration to "ClassDeclaration"', () => {
      expect(KIND_MAP[SyntaxKind.ClassDeclaration]).toBe('ClassDeclaration')
    })

    test('maps SyntaxKind.VariableDeclaration to "VariableDeclaration"', () => {
      expect(KIND_MAP[SyntaxKind.VariableDeclaration]).toBe('VariableDeclaration')
    })

    test('maps SyntaxKind.BinaryExpression to "BinaryExpression"', () => {
      expect(KIND_MAP[SyntaxKind.BinaryExpression]).toBe('BinaryExpression')
    })

    test('maps SyntaxKind.CallExpression to "CallExpression"', () => {
      expect(KIND_MAP[SyntaxKind.CallExpression]).toBe('CallExpression')
    })

    test('maps SyntaxKind.IfStatement to "IfStatement"', () => {
      expect(KIND_MAP[SyntaxKind.IfStatement]).toBe('IfStatement')
    })

    test('excludes First* range markers', () => {
      const firstKeys = Object.values(KIND_MAP).filter((name) => name.startsWith('First'))
      expect(firstKeys).toHaveLength(0)
    })

    test('excludes Last* range markers', () => {
      const lastKeys = Object.values(KIND_MAP).filter((name) => name.startsWith('Last'))
      expect(lastKeys).toHaveLength(0)
    })

    test('contains many known SyntaxKind names', () => {
      const values = Object.values(KIND_MAP)
      expect(values).toContain('StringLiteral')
      expect(values).toContain('NumericLiteral')
      expect(values).toContain('Identifier')
      expect(values).toContain('BinaryExpression')
      expect(values).toContain('CallExpression')
    })
  })

  describe('silentLogger', () => {
    test('has debug method that does not throw', () => {
      expect(() => silentLogger.debug('test')).not.toThrow()
    })

    test('has info method that does not throw', () => {
      expect(() => silentLogger.info('test')).not.toThrow()
    })

    test('has warn method that does not throw', () => {
      expect(() => silentLogger.warn('test')).not.toThrow()
    })

    test('has error method that does not throw', () => {
      expect(() => silentLogger.error('test')).not.toThrow()
    })

    test('debug returns undefined', () => {
      expect(silentLogger.debug('test')).toBeUndefined()
    })

    test('info returns undefined', () => {
      expect(silentLogger.info('test')).toBeUndefined()
    })

    test('warn returns undefined', () => {
      expect(silentLogger.warn('test')).toBeUndefined()
    })

    test('error returns undefined', () => {
      expect(silentLogger.error('test')).toBeUndefined()
    })

    test('all methods are functions', () => {
      expect(typeof silentLogger.debug).toBe('function')
      expect(typeof silentLogger.info).toBe('function')
      expect(typeof silentLogger.warn).toBe('function')
      expect(typeof silentLogger.error).toBe('function')
    })
  })

  describe('defaultConfig', () => {
    test('has options property as empty object', () => {
      expect(defaultConfig.options).toEqual({})
    })

    test('has rules property as empty object', () => {
      expect(defaultConfig.rules).toEqual({})
    })

    test('has transforms property as empty array', () => {
      expect(defaultConfig.transforms).toEqual([])
    })

    test('is a valid PluginConfig object', () => {
      expect(defaultConfig).toHaveProperty('options')
      expect(defaultConfig).toHaveProperty('rules')
      expect(defaultConfig).toHaveProperty('transforms')
    })
  })

  describe('PROPERTY_MAP', () => {
    test('maps block to body', () => {
      expect(PROPERTY_MAP['block']).toBe('body')
    })

    test('maps expression to argument', () => {
      expect(PROPERTY_MAP['expression']).toBe('argument')
    })

    test('maps escapedText to name', () => {
      expect(PROPERTY_MAP['escapedText']).toBe('name')
    })

    test('maps text to raw', () => {
      expect(PROPERTY_MAP['text']).toBe('raw')
    })

    test('maps initializer to init', () => {
      expect(PROPERTY_MAP['initializer']).toBe('init')
    })

    test('maps thenStatement to consequent', () => {
      expect(PROPERTY_MAP['thenStatement']).toBe('consequent')
    })

    test('maps elseStatement to alternate', () => {
      expect(PROPERTY_MAP['elseStatement']).toBe('alternate')
    })

    test('maps declarationList to declarations', () => {
      expect(PROPERTY_MAP['declarationList']).toBe('declarations')
    })

    test('maps condition to test', () => {
      expect(PROPERTY_MAP['condition']).toBe('test')
    })

    test('maps statements to body', () => {
      expect(PROPERTY_MAP['statements']).toBe('body')
    })

    test('maps moduleSpecifier to source', () => {
      expect(PROPERTY_MAP['moduleSpecifier']).toBe('source')
    })

    test('maps heritageClauses to heritage', () => {
      expect(PROPERTY_MAP['heritageClauses']).toBe('heritage')
    })

    test('maps type to typeAnnotation', () => {
      expect(PROPERTY_MAP['type']).toBe('typeAnnotation')
    })

    test('maps typeArguments to typeParameters', () => {
      expect(PROPERTY_MAP['typeArguments']).toBe('typeParameters')
    })

    test('maps parameters to params', () => {
      expect(PROPERTY_MAP['parameters']).toBe('params')
    })

    test('is a Record<string, string>', () => {
      expect(typeof PROPERTY_MAP).toBe('object')
      expect(PROPERTY_MAP).not.toBeNull()
    })
  })

  describe('KIND_NAME_ALIASES', () => {
    test('maps Block to BlockStatement', () => {
      expect(KIND_NAME_ALIASES['Block']).toBe('BlockStatement')
    })

    test('maps StringLiteral to Literal', () => {
      expect(KIND_NAME_ALIASES['StringLiteral']).toBe('Literal')
    })

    test('maps NumericLiteral to Literal', () => {
      expect(KIND_NAME_ALIASES['NumericLiteral']).toBe('Literal')
    })

    test('maps TrueKeyword to BooleanLiteral', () => {
      expect(KIND_NAME_ALIASES['TrueKeyword']).toBe('BooleanLiteral')
    })

    test('maps FalseKeyword to BooleanLiteral', () => {
      expect(KIND_NAME_ALIASES['FalseKeyword']).toBe('BooleanLiteral')
    })

    test('maps NullKeyword to Literal', () => {
      expect(KIND_NAME_ALIASES['NullKeyword']).toBe('Literal')
    })

    test('maps ObjectLiteralExpression to ObjectExpression', () => {
      expect(KIND_NAME_ALIASES['ObjectLiteralExpression']).toBe('ObjectExpression')
    })

    test('maps ArrayLiteralExpression to ArrayExpression', () => {
      expect(KIND_NAME_ALIASES['ArrayLiteralExpression']).toBe('ArrayExpression')
    })

    test('maps ArrowFunction to ArrowFunctionExpression', () => {
      expect(KIND_NAME_ALIASES['ArrowFunction']).toBe('ArrowFunctionExpression')
    })

    test('maps PropertyAccessExpression to MemberExpression', () => {
      expect(KIND_NAME_ALIASES['PropertyAccessExpression']).toBe('MemberExpression')
    })

    test('maps ElementAccessExpression to MemberExpression', () => {
      expect(KIND_NAME_ALIASES['ElementAccessExpression']).toBe('MemberExpression')
    })

    test('maps VariableDeclaration to VariableDeclarator', () => {
      expect(KIND_NAME_ALIASES['VariableDeclaration']).toBe('VariableDeclarator')
    })

    test('maps VariableDeclarationList to VariableDeclaration', () => {
      expect(KIND_NAME_ALIASES['VariableDeclarationList']).toBe('VariableDeclaration')
    })

    test('maps DoStatement to DoWhileStatement', () => {
      expect(KIND_NAME_ALIASES['DoStatement']).toBe('DoWhileStatement')
    })

    test('maps TemplateExpression to TemplateLiteral', () => {
      expect(KIND_NAME_ALIASES['TemplateExpression']).toBe('TemplateLiteral')
    })

    test('maps PrefixUnaryExpression to UnaryExpression', () => {
      expect(KIND_NAME_ALIASES['PrefixUnaryExpression']).toBe('UnaryExpression')
    })

    test('maps PostfixUnaryExpression to UpdateExpression', () => {
      expect(KIND_NAME_ALIASES['PostfixUnaryExpression']).toBe('UpdateExpression')
    })

    test('maps Identifier to Identifier', () => {
      expect(KIND_NAME_ALIASES['Identifier']).toBe('Identifier')
    })

    test('maps FunctionDeclaration to FunctionDeclaration', () => {
      expect(KIND_NAME_ALIASES['FunctionDeclaration']).toBe('FunctionDeclaration')
    })

    test('is a Record<string, string>', () => {
      expect(typeof KIND_NAME_ALIASES).toBe('object')
      expect(KIND_NAME_ALIASES).not.toBeNull()
    })
  })

  describe('KIND_SPECIFIC_MAP', () => {
    test('maps SwitchStatement expression to discriminant', () => {
      expect(KIND_SPECIFIC_MAP['SwitchStatement']['expression']).toBe('discriminant')
    })

    test('maps SwitchStatement caseBlock to cases', () => {
      expect(KIND_SPECIFIC_MAP['SwitchStatement']['caseBlock']).toBe('cases')
    })

    test('maps CaseClause expression to test', () => {
      expect(KIND_SPECIFIC_MAP['CaseClause']['expression']).toBe('test')
    })

    test('maps CaseClause statements to consequent', () => {
      expect(KIND_SPECIFIC_MAP['CaseClause']['statements']).toBe('consequent')
    })

    test('maps TryStatement tryBlock to block', () => {
      expect(KIND_SPECIFIC_MAP['TryStatement']['tryBlock']).toBe('block')
    })

    test('maps TryStatement catchClause to handler', () => {
      expect(KIND_SPECIFIC_MAP['TryStatement']['catchClause']).toBe('handler')
    })

    test('maps TryStatement finallyBlock to finalizer', () => {
      expect(KIND_SPECIFIC_MAP['TryStatement']['finallyBlock']).toBe('finalizer')
    })

    test('maps ForStatement initializer to init', () => {
      expect(KIND_SPECIFIC_MAP['ForStatement']['initializer']).toBe('init')
    })

    test('maps ForStatement condition to test', () => {
      expect(KIND_SPECIFIC_MAP['ForStatement']['condition']).toBe('test')
    })

    test('maps ForStatement incrementor to update', () => {
      expect(KIND_SPECIFIC_MAP['ForStatement']['incrementor']).toBe('update')
    })

    test('maps CallExpression expression to callee', () => {
      expect(KIND_SPECIFIC_MAP['CallExpression']['expression']).toBe('callee')
    })

    test('maps PropertyAccessExpression expression to object', () => {
      expect(KIND_SPECIFIC_MAP['PropertyAccessExpression']['expression']).toBe('object')
    })

    test('maps PropertyAccessExpression name to property', () => {
      expect(KIND_SPECIFIC_MAP['PropertyAccessExpression']['name']).toBe('property')
    })

    test('is a Record<string, Record<string, string>>', () => {
      expect(typeof KIND_SPECIFIC_MAP).toBe('object')
      expect(KIND_SPECIFIC_MAP).not.toBeNull()
    })
  })

  describe('MAX_DEPTH', () => {
    test('is 5', () => {
      expect(MAX_DEPTH).toBe(5)
    })

    test('is a number', () => {
      expect(typeof MAX_DEPTH).toBe('number')
    })
  })

  describe('SKIP_KEYS', () => {
    test('contains kind', () => {
      expect(SKIP_KEYS.has('kind')).toBe(true)
    })

    test('contains pos', () => {
      expect(SKIP_KEYS.has('pos')).toBe(true)
    })

    test('contains end', () => {
      expect(SKIP_KEYS.has('end')).toBe(true)
    })

    test('contains flags', () => {
      expect(SKIP_KEYS.has('flags')).toBe(true)
    })

    test('contains parent', () => {
      expect(SKIP_KEYS.has('parent')).toBe(true)
    })

    test('contains modifierFlagsCache', () => {
      expect(SKIP_KEYS.has('modifierFlagsCache')).toBe(true)
    })

    test('contains transformFlags', () => {
      expect(SKIP_KEYS.has('transformFlags')).toBe(true)
    })

    test('contains original', () => {
      expect(SKIP_KEYS.has('original')).toBe(true)
    })

    test('contains symbol', () => {
      expect(SKIP_KEYS.has('symbol')).toBe(true)
    })

    test('contains locals', () => {
      expect(SKIP_KEYS.has('locals')).toBe(true)
    })

    test('contains jlChildren', () => {
      expect(SKIP_KEYS.has('jlChildren')).toBe(true)
    })

    test('contains nextContainer', () => {
      expect(SKIP_KEYS.has('nextContainer')).toBe(true)
    })

    test('is a Set', () => {
      expect(SKIP_KEYS instanceof Set).toBe(true)
    })
  })

  describe('OPERATOR_TOKEN_MAP', () => {
    test('maps EqualsEqualsToken to ==', () => {
      expect(OPERATOR_TOKEN_MAP['EqualsEqualsToken']).toBe('==')
    })

    test('maps EqualsEqualsEqualsToken to ===', () => {
      expect(OPERATOR_TOKEN_MAP['EqualsEqualsEqualsToken']).toBe('===')
    })

    test('maps ExclamationEqualsToken to !=', () => {
      expect(OPERATOR_TOKEN_MAP['ExclamationEqualsToken']).toBe('!=')
    })

    test('maps ExclamationEqualsEqualsToken to !==', () => {
      expect(OPERATOR_TOKEN_MAP['ExclamationEqualsEqualsToken']).toBe('!==')
    })

    test('maps LessThanToken to <', () => {
      expect(OPERATOR_TOKEN_MAP['LessThanToken']).toBe('<')
    })

    test('maps GreaterThanToken to >', () => {
      expect(OPERATOR_TOKEN_MAP['GreaterThanToken']).toBe('>')
    })

    test('maps PlusToken to +', () => {
      expect(OPERATOR_TOKEN_MAP['PlusToken']).toBe('+')
    })

    test('maps MinusToken to -', () => {
      expect(OPERATOR_TOKEN_MAP['MinusToken']).toBe('-')
    })

    test('maps AsteriskToken to *', () => {
      expect(OPERATOR_TOKEN_MAP['AsteriskToken']).toBe('*')
    })

    test('maps SlashToken to /', () => {
      expect(OPERATOR_TOKEN_MAP['SlashToken']).toBe('/')
    })

    test('maps PercentToken to %', () => {
      expect(OPERATOR_TOKEN_MAP['PercentToken']).toBe('%')
    })

    test('maps AsteriskAsteriskToken to **', () => {
      expect(OPERATOR_TOKEN_MAP['AsteriskAsteriskToken']).toBe('**')
    })

    test('maps AmpersandAmpersandToken to &&', () => {
      expect(OPERATOR_TOKEN_MAP['AmpersandAmpersandToken']).toBe('&&')
    })

    test('maps BarBarToken to ||', () => {
      expect(OPERATOR_TOKEN_MAP['BarBarToken']).toBe('||')
    })

    test('maps QuestionQuestionToken to ??', () => {
      expect(OPERATOR_TOKEN_MAP['QuestionQuestionToken']).toBe('??')
    })

    test('maps EqualsToken to =', () => {
      expect(OPERATOR_TOKEN_MAP['EqualsToken']).toBe('=')
    })

    test('maps PlusEqualsToken to +=', () => {
      expect(OPERATOR_TOKEN_MAP['PlusEqualsToken']).toBe('+=')
    })

    test('maps MinusEqualsToken to -=', () => {
      expect(OPERATOR_TOKEN_MAP['MinusEqualsToken']).toBe('-=')
    })

    test('maps DotDotDotToken to ...', () => {
      expect(OPERATOR_TOKEN_MAP['DotDotDotToken']).toBe('...')
    })

    test('maps ArrowToken to =>', () => {
      expect(OPERATOR_TOKEN_MAP['ArrowToken']).toBe('=>')
    })

    test('maps InKeyword to in', () => {
      expect(OPERATOR_TOKEN_MAP['InKeyword']).toBe('in')
    })

    test('maps InstanceOfKeyword to instanceof', () => {
      expect(OPERATOR_TOKEN_MAP['InstanceOfKeyword']).toBe('instanceof')
    })

    test('is a Record<string, string>', () => {
      expect(typeof OPERATOR_TOKEN_MAP).toBe('object')
      expect(OPERATOR_TOKEN_MAP).not.toBeNull()
    })
  })

  describe('ASSIGNMENT_OPERATORS', () => {
    test('contains =', () => {
      expect(ASSIGNMENT_OPERATORS.has('=')).toBe(true)
    })

    test('contains +=', () => {
      expect(ASSIGNMENT_OPERATORS.has('+=')).toBe(true)
    })

    test('contains -=', () => {
      expect(ASSIGNMENT_OPERATORS.has('-=')).toBe(true)
    })

    test('contains *=', () => {
      expect(ASSIGNMENT_OPERATORS.has('*=')).toBe(true)
    })

    test('contains /=', () => {
      expect(ASSIGNMENT_OPERATORS.has('/=')).toBe(true)
    })

    test('contains %=', () => {
      expect(ASSIGNMENT_OPERATORS.has('%=')).toBe(true)
    })

    test('contains **=', () => {
      expect(ASSIGNMENT_OPERATORS.has('**=')).toBe(true)
    })

    test('contains &=', () => {
      expect(ASSIGNMENT_OPERATORS.has('&=')).toBe(true)
    })

    test('contains |=', () => {
      expect(ASSIGNMENT_OPERATORS.has('|=')).toBe(true)
    })

    test('contains ^=', () => {
      expect(ASSIGNMENT_OPERATORS.has('^=')).toBe(true)
    })

    test('contains <<=', () => {
      expect(ASSIGNMENT_OPERATORS.has('<<=')).toBe(true)
    })

    test('contains >>=', () => {
      expect(ASSIGNMENT_OPERATORS.has('>>=')).toBe(true)
    })

    test('contains >>>=', () => {
      expect(ASSIGNMENT_OPERATORS.has('>>>=')).toBe(true)
    })

    test('contains &&=', () => {
      expect(ASSIGNMENT_OPERATORS.has('&&=')).toBe(true)
    })

    test('contains ||=', () => {
      expect(ASSIGNMENT_OPERATORS.has('||=')).toBe(true)
    })

    test('contains ??=', () => {
      expect(ASSIGNMENT_OPERATORS.has('??=')).toBe(true)
    })

    test('is a Set', () => {
      expect(ASSIGNMENT_OPERATORS instanceof Set).toBe(true)
    })

    test('does not contain ==', () => {
      expect(ASSIGNMENT_OPERATORS.has('==')).toBe(false)
    })

    test('does not contain +', () => {
      expect(ASSIGNMENT_OPERATORS.has('+')).toBe(false)
    })
  })

  describe('LOGICAL_OPERATORS', () => {
    test('contains &&', () => {
      expect(LOGICAL_OPERATORS.has('&&')).toBe(true)
    })

    test('contains ||', () => {
      expect(LOGICAL_OPERATORS.has('||')).toBe(true)
    })

    test('contains ??', () => {
      expect(LOGICAL_OPERATORS.has('??')).toBe(true)
    })

    test('is a Set', () => {
      expect(LOGICAL_OPERATORS instanceof Set).toBe(true)
    })

    test('has exactly 3 operators', () => {
      expect(LOGICAL_OPERATORS.size).toBe(3)
    })

    test('does not contain &', () => {
      expect(LOGICAL_OPERATORS.has('&')).toBe(false)
    })

    test('does not contain |', () => {
      expect(LOGICAL_OPERATORS.has('|')).toBe(false)
    })
  })

  describe('EXPORTABLE_KINDS', () => {
    test('contains FunctionDeclaration', () => {
      expect(EXPORTABLE_KINDS.has('FunctionDeclaration')).toBe(true)
    })

    test('contains ClassDeclaration', () => {
      expect(EXPORTABLE_KINDS.has('ClassDeclaration')).toBe(true)
    })

    test('contains InterfaceDeclaration', () => {
      expect(EXPORTABLE_KINDS.has('InterfaceDeclaration')).toBe(true)
    })

    test('contains EnumDeclaration', () => {
      expect(EXPORTABLE_KINDS.has('EnumDeclaration')).toBe(true)
    })

    test('contains TypeAliasDeclaration', () => {
      expect(EXPORTABLE_KINDS.has('TypeAliasDeclaration')).toBe(true)
    })

    test('contains ModuleDeclaration', () => {
      expect(EXPORTABLE_KINDS.has('ModuleDeclaration')).toBe(true)
    })

    test('is a Set', () => {
      expect(EXPORTABLE_KINDS instanceof Set).toBe(true)
    })

    test('has exactly 6 kinds', () => {
      expect(EXPORTABLE_KINDS.size).toBe(6)
    })

    test('does not contain VariableDeclaration', () => {
      expect(EXPORTABLE_KINDS.has('VariableDeclaration')).toBe(false)
    })

    test('does not contain Identifier', () => {
      expect(EXPORTABLE_KINDS.has('Identifier')).toBe(false)
    })
  })

  describe('KIND_MAP additional coverage', () => {
    test('maps SyntaxKind.ReturnStatement to "ReturnStatement"', () => {
      expect(KIND_MAP[SyntaxKind.ReturnStatement]).toBe('ReturnStatement')
    })

    test('maps SyntaxKind.ThrowStatement to "ThrowStatement"', () => {
      expect(KIND_MAP[SyntaxKind.ThrowStatement]).toBe('ThrowStatement')
    })

    test('maps SyntaxKind.WhileStatement to "WhileStatement"', () => {
      expect(KIND_MAP[SyntaxKind.WhileStatement]).toBe('WhileStatement')
    })

    test('maps SyntaxKind.ForStatement to "ForStatement"', () => {
      expect(KIND_MAP[SyntaxKind.ForStatement]).toBe('ForStatement')
    })

    test('has no undefined values for common SyntaxKinds', () => {
      const commonKinds = [
        SyntaxKind.Block,
        SyntaxKind.VariableStatement,
        SyntaxKind.ExpressionStatement,
        SyntaxKind.IfStatement,
      ]
      for (const kind of commonKinds) {
        expect(KIND_MAP[kind]).toBeDefined()
      }
    })
  })

  describe('silentLogger additional coverage', () => {
    test('debug accepts multiple arguments without throwing', () => {
      expect(() => silentLogger.debug('a', 'b', 'c')).not.toThrow()
    })

    test('warn accepts multiple arguments without throwing', () => {
      expect(() => silentLogger.warn('x', { y: 1 })).not.toThrow()
    })

    test('error accepts multiple arguments without throwing', () => {
      expect(() => silentLogger.error('err', new Error('test'))).not.toThrow()
    })
  })

  describe('PROPERTY_MAP additional coverage', () => {
    test('maps expressions to expressions', () => {
      expect(PROPERTY_MAP['expressions']).toBe('expressions')
    })

    test('maps left to left', () => {
      expect(PROPERTY_MAP['left']).toBe('left')
    })

    test('maps right to right', () => {
      expect(PROPERTY_MAP['right']).toBe('right')
    })

    test('maps test to test', () => {
      expect(PROPERTY_MAP['test']).toBe('test')
    })

    test('maps consequent to consequent', () => {
      expect(PROPERTY_MAP['consequent']).toBe('consequent')
    })

    test('maps alternate to alternate', () => {
      expect(PROPERTY_MAP['alternate']).toBe('alternate')
    })

    test('maps operatorToken to operator', () => {
      expect(PROPERTY_MAP['operatorToken']).toBe('operator')
    })

    test('maps body to body', () => {
      expect(PROPERTY_MAP['body']).toBe('body')
    })

    test('maps arguments to arguments', () => {
      expect(PROPERTY_MAP['arguments']).toBe('arguments')
    })

    test('maps decorators to decorators', () => {
      expect(PROPERTY_MAP['decorators']).toBe('decorators')
    })

    test('maps operand to argument', () => {
      expect(PROPERTY_MAP['operand']).toBe('argument')
    })

    test('maps operator to operator', () => {
      expect(PROPERTY_MAP['operator']).toBe('operator')
    })

    test('maps name to name', () => {
      expect(PROPERTY_MAP['name']).toBe('name')
    })

    test('maps elements to elements', () => {
      expect(PROPERTY_MAP['elements']).toBe('elements')
    })
  })

  describe('KIND_NAME_ALIASES additional coverage', () => {
    test('maps RegularExpressionLiteral to RegExpLiteral', () => {
      expect(KIND_NAME_ALIASES['RegularExpressionLiteral']).toBe('RegExpLiteral')
    })

    test('maps BigIntLiteral to Literal', () => {
      expect(KIND_NAME_ALIASES['BigIntLiteral']).toBe('Literal')
    })

    test('maps CallExpression to CallExpression', () => {
      expect(KIND_NAME_ALIASES['CallExpression']).toBe('CallExpression')
    })

    test('maps NewExpression to NewExpression', () => {
      expect(KIND_NAME_ALIASES['NewExpression']).toBe('NewExpression')
    })

    test('maps BinaryExpression to BinaryExpression', () => {
      expect(KIND_NAME_ALIASES['BinaryExpression']).toBe('BinaryExpression')
    })

    test('maps ConditionalExpression to ConditionalExpression', () => {
      expect(KIND_NAME_ALIASES['ConditionalExpression']).toBe('ConditionalExpression')
    })

    test('maps ImportDeclaration to ImportDeclaration', () => {
      expect(KIND_NAME_ALIASES['ImportDeclaration']).toBe('ImportDeclaration')
    })

    test('maps ExportDeclaration to ExportDeclaration', () => {
      expect(KIND_NAME_ALIASES['ExportDeclaration']).toBe('ExportDeclaration')
    })

    test('maps CatchClause to CatchClause', () => {
      expect(KIND_NAME_ALIASES['CatchClause']).toBe('CatchClause')
    })

    test('maps CaseClause to SwitchCase', () => {
      expect(KIND_NAME_ALIASES['CaseClause']).toBe('SwitchCase')
    })

    test('maps DefaultClause to SwitchCase', () => {
      expect(KIND_NAME_ALIASES['DefaultClause']).toBe('SwitchCase')
    })

    test('maps AwaitExpression to AwaitExpression', () => {
      expect(KIND_NAME_ALIASES['AwaitExpression']).toBe('AwaitExpression')
    })

    test('maps YieldExpression to YieldExpression', () => {
      expect(KIND_NAME_ALIASES['YieldExpression']).toBe('YieldExpression')
    })

    test('maps ClassExpression to ClassExpression', () => {
      expect(KIND_NAME_ALIASES['ClassExpression']).toBe('ClassExpression')
    })

    test('maps SuperKeyword to Super', () => {
      expect(KIND_NAME_ALIASES['SuperKeyword']).toBe('Super')
    })

    test('maps ThisKeyword to ThisExpression', () => {
      expect(KIND_NAME_ALIASES['ThisKeyword']).toBe('ThisExpression')
    })

    test('maps StaticBlock to StaticBlock', () => {
      expect(KIND_NAME_ALIASES['StaticBlock']).toBe('StaticBlock')
    })
  })

  describe('KIND_SPECIFIC_MAP additional coverage', () => {
    test('maps DefaultClause statements to consequent', () => {
      expect(KIND_SPECIFIC_MAP['DefaultClause']['statements']).toBe('consequent')
    })

    test('maps IfStatement expression to test', () => {
      expect(KIND_SPECIFIC_MAP['IfStatement']['expression']).toBe('test')
    })

    test('maps IfStatement thenStatement to consequent', () => {
      expect(KIND_SPECIFIC_MAP['IfStatement']['thenStatement']).toBe('consequent')
    })

    test('maps IfStatement elseStatement to alternate', () => {
      expect(KIND_SPECIFIC_MAP['IfStatement']['elseStatement']).toBe('alternate')
    })

    test('maps ForInStatement expression to right', () => {
      expect(KIND_SPECIFIC_MAP['ForInStatement']['expression']).toBe('right')
    })

    test('maps ForInStatement initializer to left', () => {
      expect(KIND_SPECIFIC_MAP['ForInStatement']['initializer']).toBe('left')
    })

    test('maps ForOfStatement expression to right', () => {
      expect(KIND_SPECIFIC_MAP['ForOfStatement']['expression']).toBe('right')
    })

    test('maps ForOfStatement initializer to left', () => {
      expect(KIND_SPECIFIC_MAP['ForOfStatement']['initializer']).toBe('left')
    })

    test('maps LabeledStatement statement to body', () => {
      expect(KIND_SPECIFIC_MAP['LabeledStatement']['statement']).toBe('body')
    })

    test('maps DoStatement expression to test', () => {
      expect(KIND_SPECIFIC_MAP['DoStatement']['expression']).toBe('test')
    })

    test('maps WhileStatement expression to test', () => {
      expect(KIND_SPECIFIC_MAP['WhileStatement']['expression']).toBe('test')
    })

    test('maps NewExpression expression to callee', () => {
      expect(KIND_SPECIFIC_MAP['NewExpression']['expression']).toBe('callee')
    })

    test('maps ElementAccessExpression expression to object', () => {
      expect(KIND_SPECIFIC_MAP['ElementAccessExpression']['expression']).toBe('object')
    })

    test('maps ElementAccessExpression argumentExpression to property', () => {
      expect(KIND_SPECIFIC_MAP['ElementAccessExpression']['argumentExpression']).toBe('property')
    })

    test('maps ThrowStatement expression to argument', () => {
      expect(KIND_SPECIFIC_MAP['ThrowStatement']['expression']).toBe('argument')
    })

    test('maps VariableDeclaration name to id', () => {
      expect(KIND_SPECIFIC_MAP['VariableDeclaration']['name']).toBe('id')
    })

    test('maps ClassDeclaration name to id', () => {
      expect(KIND_SPECIFIC_MAP['ClassDeclaration']['name']).toBe('id')
    })

    test('maps FunctionDeclaration name to id', () => {
      expect(KIND_SPECIFIC_MAP['FunctionDeclaration']['name']).toBe('id')
    })

    test('maps PropertyDeclaration name to key', () => {
      expect(KIND_SPECIFIC_MAP['PropertyDeclaration']['name']).toBe('key')
    })

    test('maps MethodDeclaration name to key', () => {
      expect(KIND_SPECIFIC_MAP['MethodDeclaration']['name']).toBe('key')
    })

    test('maps TaggedTemplateExpression template to quasi', () => {
      expect(KIND_SPECIFIC_MAP['TaggedTemplateExpression']['template']).toBe('quasi')
    })
  })

  describe('OPERATOR_TOKEN_MAP additional coverage', () => {
    test('maps LessThanEqualsToken to <=', () => {
      expect(OPERATOR_TOKEN_MAP['LessThanEqualsToken']).toBe('<=')
    })

    test('maps GreaterThanEqualsToken to >=', () => {
      expect(OPERATOR_TOKEN_MAP['GreaterThanEqualsToken']).toBe('>=')
    })

    test('maps AmpersandToken to &', () => {
      expect(OPERATOR_TOKEN_MAP['AmpersandToken']).toBe('&')
    })

    test('maps BarToken to |', () => {
      expect(OPERATOR_TOKEN_MAP['BarToken']).toBe('|')
    })

    test('maps CaretToken to ^', () => {
      expect(OPERATOR_TOKEN_MAP['CaretToken']).toBe('^')
    })

    test('maps LessThanLessThanToken to <<', () => {
      expect(OPERATOR_TOKEN_MAP['LessThanLessThanToken']).toBe('<<')
    })

    test('maps GreaterThanGreaterThanToken to >>', () => {
      expect(OPERATOR_TOKEN_MAP['GreaterThanGreaterThanToken']).toBe('>>')
    })

    test('maps GreaterThanGreaterThanGreaterThanToken to >>>', () => {
      expect(OPERATOR_TOKEN_MAP['GreaterThanGreaterThanGreaterThanToken']).toBe('>>>')
    })

    test('maps ColonToken to :', () => {
      expect(OPERATOR_TOKEN_MAP['ColonToken']).toBe(':')
    })

    test('maps SemicolonToken to ;', () => {
      expect(OPERATOR_TOKEN_MAP['SemicolonToken']).toBe(';')
    })

    test('maps DotToken to .', () => {
      expect(OPERATOR_TOKEN_MAP['DotToken']).toBe('.')
    })

    test('maps QuestionDotToken to ?.', () => {
      expect(OPERATOR_TOKEN_MAP['QuestionDotToken']).toBe('?.')
    })

    test('maps ExclamationToken to !', () => {
      expect(OPERATOR_TOKEN_MAP['ExclamationToken']).toBe('!')
    })

    test('maps TildeToken to ~', () => {
      expect(OPERATOR_TOKEN_MAP['TildeToken']).toBe('~')
    })

    test('maps OfKeyword to of', () => {
      expect(OPERATOR_TOKEN_MAP['OfKeyword']).toBe('of')
    })
  })

  describe('SKIP_KEYS additional coverage', () => {
    test('contains id', () => {
      expect(SKIP_KEYS.has('id')).toBe(true)
    })

    test('has exactly 13 keys', () => {
      expect(SKIP_KEYS.size).toBe(13)
    })

    test('does not contain body', () => {
      expect(SKIP_KEYS.has('body')).toBe(false)
    })

    test('does not contain name', () => {
      expect(SKIP_KEYS.has('name')).toBe(false)
    })
  })

  describe('cross-constant integrity', () => {
    test('ASSIGNMENT_OPERATORS is subset of OPERATOR_TOKEN_MAP values', () => {
      const operatorValues = new Set(Object.values(OPERATOR_TOKEN_MAP))
      for (const op of ASSIGNMENT_OPERATORS) {
        expect(operatorValues.has(op)).toBe(true)
      }
    })

    test('LOGICAL_OPERATORS is subset of OPERATOR_TOKEN_MAP values', () => {
      const operatorValues = new Set(Object.values(OPERATOR_TOKEN_MAP))
      for (const op of LOGICAL_OPERATORS) {
        expect(operatorValues.has(op)).toBe(true)
      }
    })

    test('all PROPERTY_MAP values are strings', () => {
      const values = Object.values(PROPERTY_MAP)
      for (const v of values) {
        expect(typeof v).toBe('string')
      }
    })

    test('all KIND_NAME_ALIASES values are strings', () => {
      const values = Object.values(KIND_NAME_ALIASES)
      for (const v of values) {
        expect(typeof v).toBe('string')
      }
    })

    test('all OPERATOR_TOKEN_MAP values are non-empty strings', () => {
      const values = Object.values(OPERATOR_TOKEN_MAP)
      for (const v of values) {
        expect(typeof v).toBe('string')
        expect(v.length).toBeGreaterThan(0)
      }
    })

    test('KIND_SPECIFIC_MAP keys overlap with KIND_NAME_ALIASES keys', () => {
      const aliasKeys = new Set(Object.keys(KIND_NAME_ALIASES))
      const specificKeys = Object.keys(KIND_SPECIFIC_MAP)
      const overlap = specificKeys.filter((k) => aliasKeys.has(k))
      expect(overlap.length).toBeGreaterThan(0)
    })

    test('defaultConfig has exactly 3 properties', () => {
      expect(Object.keys(defaultConfig)).toHaveLength(3)
    })

    test('MAX_DEPTH is a positive integer', () => {
      expect(Number.isInteger(MAX_DEPTH)).toBe(true)
      expect(MAX_DEPTH).toBeGreaterThan(0)
    })
  })

  describe('KIND_MAP deep coverage', () => {
    test('maps SyntaxKind.DoStatement to "DoStatement"', () => {
      expect(KIND_MAP[SyntaxKind.DoStatement]).toBe('DoStatement')
    })

    test('maps SyntaxKind.ForInStatement to "ForInStatement"', () => {
      expect(KIND_MAP[SyntaxKind.ForInStatement]).toBe('ForInStatement')
    })

    test('maps SyntaxKind.ForOfStatement to "ForOfStatement"', () => {
      expect(KIND_MAP[SyntaxKind.ForOfStatement]).toBe('ForOfStatement')
    })

    test('maps SyntaxKind.SwitchStatement to "SwitchStatement"', () => {
      expect(KIND_MAP[SyntaxKind.SwitchStatement]).toBe('SwitchStatement')
    })

    test('maps SyntaxKind.ExpressionStatement to "ExpressionStatement"', () => {
      expect(KIND_MAP[SyntaxKind.ExpressionStatement]).toBe('ExpressionStatement')
    })

    test('maps SyntaxKind.VariableStatement to "VariableStatement"', () => {
      expect(KIND_MAP[SyntaxKind.VariableStatement]).toBe('VariableStatement')
    })

    test('maps SyntaxKind.TryStatement to "TryStatement"', () => {
      expect(KIND_MAP[SyntaxKind.TryStatement]).toBe('TryStatement')
    })

    test('maps SyntaxKind.TypeOfExpression to "TypeOfExpression"', () => {
      expect(KIND_MAP[SyntaxKind.TypeOfExpression]).toBe('TypeOfExpression')
    })

    test('maps SyntaxKind.AwaitExpression to "AwaitExpression"', () => {
      expect(KIND_MAP[SyntaxKind.AwaitExpression]).toBe('AwaitExpression')
    })

    test('maps SyntaxKind.ArrowFunction to "ArrowFunction"', () => {
      expect(KIND_MAP[SyntaxKind.ArrowFunction]).toBe('ArrowFunction')
    })

    test('has unique numeric keys', () => {
      const keys = Object.keys(KIND_MAP).map(Number)
      const uniqueKeys = new Set(keys)
      expect(uniqueKeys.size).toBe(keys.length)
    })
  })

  describe('PROPERTY_MAP remaining entries', () => {
    test('maps declarations to declarations', () => {
      expect(PROPERTY_MAP['declarations']).toBe('declarations')
    })

    test('maps typeParameters to typeParameters', () => {
      expect(PROPERTY_MAP['typeParameters']).toBe('typeParameters')
    })

    test('maps members to body', () => {
      expect(PROPERTY_MAP['members']).toBe('body')
    })

    test('maps properties to properties', () => {
      expect(PROPERTY_MAP['properties']).toBe('properties')
    })

    test('maps objectLiteral to objectValue', () => {
      expect(PROPERTY_MAP['objectLiteral']).toBe('objectValue')
    })

    test('maps importClause to importClause', () => {
      expect(PROPERTY_MAP['importClause']).toBe('importClause')
    })

    test('maps namedImports to namedImports', () => {
      expect(PROPERTY_MAP['namedImports']).toBe('namedImports')
    })

    test('maps namespaceImport to namespaceImport', () => {
      expect(PROPERTY_MAP['namespaceImport']).toBe('namespaceImport')
    })

    test('maps stringLiteral to importPath', () => {
      expect(PROPERTY_MAP['stringLiteral']).toBe('importPath')
    })

    test('maps defaultImport to local', () => {
      expect(PROPERTY_MAP['defaultImport']).toBe('local')
    })

    test('maps namedBindings to namedBindings', () => {
      expect(PROPERTY_MAP['namedBindings']).toBe('namedBindings')
    })

    test('maps importSpecifier to imported', () => {
      expect(PROPERTY_MAP['importSpecifier']).toBe('imported')
    })

    test('maps propertyName to imported', () => {
      expect(PROPERTY_MAP['propertyName']).toBe('imported')
    })

    test('maps externalModuleReference to source', () => {
      expect(PROPERTY_MAP['externalModuleReference']).toBe('source')
    })

    test('maps modifierFlags to modifierFlags', () => {
      expect(PROPERTY_MAP['modifierFlags']).toBe('modifierFlags')
    })

    test('maps variableDeclaration to param', () => {
      expect(PROPERTY_MAP['variableDeclaration']).toBe('param')
    })

    test('has identity mappings where key equals value', () => {
      const identityKeys = [
        'expressions',
        'left',
        'right',
        'test',
        'consequent',
        'alternate',
        'body',
        'arguments',
        'decorators',
        'operator',
        'name',
        'elements',
        'properties',
      ]
      for (const key of identityKeys) {
        expect(PROPERTY_MAP[key]).toBe(key)
      }
    })
  })

  describe('KIND_NAME_ALIASES remaining entries', () => {
    test('maps VariableStatement to VariableDeclaration', () => {
      expect(KIND_NAME_ALIASES['VariableStatement']).toBe('VariableDeclaration')
    })

    test('maps InterfaceDeclaration to TSInterfaceDeclaration', () => {
      expect(KIND_NAME_ALIASES['InterfaceDeclaration']).toBe('TSInterfaceDeclaration')
    })

    test('maps ImportEqualsDeclaration to TSImportEqualsDeclaration', () => {
      expect(KIND_NAME_ALIASES['ImportEqualsDeclaration']).toBe('TSImportEqualsDeclaration')
    })

    test('maps ImportExpression to Import', () => {
      expect(KIND_NAME_ALIASES['ImportExpression']).toBe('Import')
    })

    test('maps ForStatement to ForStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['ForStatement']).toBe('ForStatement')
    })

    test('maps ForInStatement to ForInStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['ForInStatement']).toBe('ForInStatement')
    })

    test('maps ForOfStatement to ForOfStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['ForOfStatement']).toBe('ForOfStatement')
    })

    test('maps WhileStatement to WhileStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['WhileStatement']).toBe('WhileStatement')
    })

    test('maps SwitchStatement to SwitchStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['SwitchStatement']).toBe('SwitchStatement')
    })

    test('maps TryStatement to TryStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['TryStatement']).toBe('TryStatement')
    })

    test('maps ExpressionStatement to ExpressionStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['ExpressionStatement']).toBe('ExpressionStatement')
    })

    test('maps TypeReference to TSTypeReference', () => {
      expect(KIND_NAME_ALIASES['TypeReference']).toBe('TSTypeReference')
    })

    test('maps TypeLiteral to TSTypeLiteral', () => {
      expect(KIND_NAME_ALIASES['TypeLiteral']).toBe('TSTypeLiteral')
    })

    test('maps EnumDeclaration to TSEnumDeclaration', () => {
      expect(KIND_NAME_ALIASES['EnumDeclaration']).toBe('TSEnumDeclaration')
    })

    test('maps ModuleDeclaration to TSModuleDeclaration', () => {
      expect(KIND_NAME_ALIASES['ModuleDeclaration']).toBe('TSModuleDeclaration')
    })

    test('maps ImportSpecifier to ImportSpecifier (identity)', () => {
      expect(KIND_NAME_ALIASES['ImportSpecifier']).toBe('ImportSpecifier')
    })

    test('maps ExportSpecifier to ExportSpecifier (identity)', () => {
      expect(KIND_NAME_ALIASES['ExportSpecifier']).toBe('ExportSpecifier')
    })

    test('maps PropertyDeclaration to PropertyDefinition', () => {
      expect(KIND_NAME_ALIASES['PropertyDeclaration']).toBe('PropertyDefinition')
    })

    test('maps Constructor to MethodDefinition', () => {
      expect(KIND_NAME_ALIASES['Constructor']).toBe('MethodDefinition')
    })

    test('maps GetAccessor to MethodDefinition', () => {
      expect(KIND_NAME_ALIASES['GetAccessor']).toBe('MethodDefinition')
    })

    test('maps SetAccessor to MethodDefinition', () => {
      expect(KIND_NAME_ALIASES['SetAccessor']).toBe('MethodDefinition')
    })

    test('maps ShorthandPropertyAssignment to Property', () => {
      expect(KIND_NAME_ALIASES['ShorthandPropertyAssignment']).toBe('Property')
    })

    test('maps SpreadAssignment to SpreadElement', () => {
      expect(KIND_NAME_ALIASES['SpreadAssignment']).toBe('SpreadElement')
    })

    test('maps SpreadElement to SpreadElement (identity)', () => {
      expect(KIND_NAME_ALIASES['SpreadElement']).toBe('SpreadElement')
    })

    test('maps NoSubstitutionTemplateLiteral to TemplateLiteral', () => {
      expect(KIND_NAME_ALIASES['NoSubstitutionTemplateLiteral']).toBe('TemplateLiteral')
    })

    test('maps TaggedTemplateExpression to TaggedTemplateExpression (identity)', () => {
      expect(KIND_NAME_ALIASES['TaggedTemplateExpression']).toBe('TaggedTemplateExpression')
    })

    test('maps DeleteExpression to UnaryExpression', () => {
      expect(KIND_NAME_ALIASES['DeleteExpression']).toBe('UnaryExpression')
    })

    test('maps VoidExpression to UnaryExpression', () => {
      expect(KIND_NAME_ALIASES['VoidExpression']).toBe('UnaryExpression')
    })

    test('maps TypeOfExpression to UnaryExpression', () => {
      expect(KIND_NAME_ALIASES['TypeOfExpression']).toBe('UnaryExpression')
    })

    test('maps InstanceOfExpression to BinaryExpression', () => {
      expect(KIND_NAME_ALIASES['InstanceOfExpression']).toBe('BinaryExpression')
    })

    test('maps InExpression to BinaryExpression', () => {
      expect(KIND_NAME_ALIASES['InExpression']).toBe('BinaryExpression')
    })

    test('maps AsExpression to TSAsExpression', () => {
      expect(KIND_NAME_ALIASES['AsExpression']).toBe('TSAsExpression')
    })

    test('maps TypeAssertion to TSTypeAssertion', () => {
      expect(KIND_NAME_ALIASES['TypeAssertion']).toBe('TSTypeAssertion')
    })

    test('maps NonNullExpression to TSNonNullExpression', () => {
      expect(KIND_NAME_ALIASES['NonNullExpression']).toBe('TSNonNullExpression')
    })

    test('ParenthesizedExpression is NOT in KIND_NAME_ALIASES (unwrapped at higher level)', () => {
      expect(KIND_NAME_ALIASES['ParenthesizedExpression']).toBeUndefined()
    })

    test('maps ObjectDestructuring to ObjectPattern', () => {
      expect(KIND_NAME_ALIASES['ObjectDestructuring']).toBe('ObjectPattern')
    })

    test('maps ArrayDestructuring to ArrayPattern', () => {
      expect(KIND_NAME_ALIASES['ArrayDestructuring']).toBe('ArrayPattern')
    })

    test('ComputedPropertyName is NOT in KIND_NAME_ALIASES (unwrapped at higher level)', () => {
      expect(KIND_NAME_ALIASES['ComputedPropertyName']).toBeUndefined()
    })

    test('maps DefaultKeyword to TSDefaultKeyword', () => {
      expect(KIND_NAME_ALIASES['DefaultKeyword']).toBe('TSDefaultKeyword')
    })

    test('maps BreakStatement to BreakStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['BreakStatement']).toBe('BreakStatement')
    })

    test('maps ContinueStatement to ContinueStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['ContinueStatement']).toBe('ContinueStatement')
    })

    test('maps DebuggerStatement to DebuggerStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['DebuggerStatement']).toBe('DebuggerStatement')
    })

    test('maps LabeledStatement to LabeledStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['LabeledStatement']).toBe('LabeledStatement')
    })

    test('maps PrivateIdentifier to PrivateIdentifier (identity)', () => {
      expect(KIND_NAME_ALIASES['PrivateIdentifier']).toBe('PrivateIdentifier')
    })

    test('maps FunctionExpression to FunctionExpression (identity)', () => {
      expect(KIND_NAME_ALIASES['FunctionExpression']).toBe('FunctionExpression')
    })

    test('maps AnyKeyword to TSAnyKeyword', () => {
      expect(KIND_NAME_ALIASES['AnyKeyword']).toBe('TSAnyKeyword')
    })

    test('maps TSArrayType to TSArrayType (identity)', () => {
      expect(KIND_NAME_ALIASES['TSArrayType']).toBe('TSArrayType')
    })

    test('maps TSUnionType to TSUnionType (identity)', () => {
      expect(KIND_NAME_ALIASES['TSUnionType']).toBe('TSUnionType')
    })

    test('maps TSEnumMember to TSEnumMember (identity)', () => {
      expect(KIND_NAME_ALIASES['TSEnumMember']).toBe('TSEnumMember')
    })

    test('maps TSInterfaceBody to TSInterfaceBody (identity)', () => {
      expect(KIND_NAME_ALIASES['TSInterfaceBody']).toBe('TSInterfaceBody')
    })

    test('maps TSInterfaceDeclaration to TSInterfaceDeclaration (identity)', () => {
      expect(KIND_NAME_ALIASES['TSInterfaceDeclaration']).toBe('TSInterfaceDeclaration')
    })

    test('maps AnyKeyword to TSAnyKeyword', () => {
      expect(KIND_NAME_ALIASES['AnyKeyword']).toBe('TSAnyKeyword')
    })

    test('maps BooleanKeyword to TSBooleanKeyword', () => {
      expect(KIND_NAME_ALIASES['BooleanKeyword']).toBe('TSBooleanKeyword')
    })

    test('maps NumberKeyword to TSNumberKeyword', () => {
      expect(KIND_NAME_ALIASES['NumberKeyword']).toBe('TSNumberKeyword')
    })

    test('maps StringKeyword to TSStringKeyword', () => {
      expect(KIND_NAME_ALIASES['StringKeyword']).toBe('TSStringKeyword')
    })

    test('maps VoidKeyword to TSVoidKeyword', () => {
      expect(KIND_NAME_ALIASES['VoidKeyword']).toBe('TSVoidKeyword')
    })

    test('maps UnknownKeyword to TSUnknownKeyword', () => {
      expect(KIND_NAME_ALIASES['UnknownKeyword']).toBe('TSUnknownKeyword')
    })

    test('maps ObjectKeyword to TSObjectKeyword', () => {
      expect(KIND_NAME_ALIASES['ObjectKeyword']).toBe('TSObjectKeyword')
    })

    test('maps CallSignature to TSCallSignatureDeclaration', () => {
      expect(KIND_NAME_ALIASES['CallSignature']).toBe('TSCallSignatureDeclaration')
    })

    test('maps TypeAliasDeclaration to TSTypeAliasDeclaration', () => {
      expect(KIND_NAME_ALIASES['TypeAliasDeclaration']).toBe('TSTypeAliasDeclaration')
    })

    test('maps ExternalModuleReference to TSExternalModuleReference', () => {
      expect(KIND_NAME_ALIASES['ExternalModuleReference']).toBe('TSExternalModuleReference')
    })

    test('maps ExportKeyword to TSExportKeyword', () => {
      expect(KIND_NAME_ALIASES['ExportKeyword']).toBe('TSExportKeyword')
    })

    test('maps TypeAnnotation to TSTypeAnnotation', () => {
      expect(KIND_NAME_ALIASES['TypeAnnotation']).toBe('TSTypeAnnotation')
    })
  })

  describe('KIND_SPECIFIC_MAP remaining entries', () => {
    test('maps WithStatement statement to body', () => {
      expect(KIND_SPECIFIC_MAP['WithStatement']['statement']).toBe('body')
    })

    test('maps ForStatement statement to body', () => {
      expect(KIND_SPECIFIC_MAP['ForStatement']['statement']).toBe('body')
    })

    test('maps ForInStatement statement to body', () => {
      expect(KIND_SPECIFIC_MAP['ForInStatement']['statement']).toBe('body')
    })

    test('maps ForOfStatement statement to body', () => {
      expect(KIND_SPECIFIC_MAP['ForOfStatement']['statement']).toBe('body')
    })

    test('maps DoStatement statement to body', () => {
      expect(KIND_SPECIFIC_MAP['DoStatement']['statement']).toBe('body')
    })

    test('maps WhileStatement statement to body', () => {
      expect(KIND_SPECIFIC_MAP['WhileStatement']['statement']).toBe('body')
    })

    test('maps ReturnStatement expression to argument', () => {
      expect(KIND_SPECIFIC_MAP['ReturnStatement']['expression']).toBe('argument')
    })

    test('maps DeleteExpression expression to argument', () => {
      expect(KIND_SPECIFIC_MAP['DeleteExpression']['expression']).toBe('argument')
    })

    test('maps VoidExpression expression to argument', () => {
      expect(KIND_SPECIFIC_MAP['VoidExpression']['expression']).toBe('argument')
    })

    test('maps TypeOfExpression expression to argument', () => {
      expect(KIND_SPECIFIC_MAP['TypeOfExpression']['expression']).toBe('argument')
    })

    test('maps AwaitExpression expression to argument', () => {
      expect(KIND_SPECIFIC_MAP['AwaitExpression']['expression']).toBe('argument')
    })

    test('maps YieldExpression expression to argument', () => {
      expect(KIND_SPECIFIC_MAP['YieldExpression']['expression']).toBe('argument')
    })

    test('maps PrefixUnaryExpression operand to argument', () => {
      expect(KIND_SPECIFIC_MAP['PrefixUnaryExpression']['operand']).toBe('argument')
    })

    test('maps PostfixUnaryExpression operand to argument', () => {
      expect(KIND_SPECIFIC_MAP['PostfixUnaryExpression']['operand']).toBe('argument')
    })

    test('maps FunctionExpression type to returnType', () => {
      expect(KIND_SPECIFIC_MAP['FunctionExpression']['type']).toBe('returnType')
    })

    test('maps ArrowFunction type to returnType', () => {
      expect(KIND_SPECIFIC_MAP['ArrowFunction']['type']).toBe('returnType')
    })

    test('maps PropertyDeclaration initializer to value', () => {
      expect(KIND_SPECIFIC_MAP['PropertyDeclaration']['initializer']).toBe('value')
    })

    test('maps PropertyAssignment initializer to value', () => {
      expect(KIND_SPECIFIC_MAP['PropertyAssignment']['initializer']).toBe('value')
    })

    test('maps GetAccessor name to key', () => {
      expect(KIND_SPECIFIC_MAP['GetAccessor']['name']).toBe('key')
    })

    test('maps SetAccessor name to key', () => {
      expect(KIND_SPECIFIC_MAP['SetAccessor']['name']).toBe('key')
    })

    test('maps ImportSpecifier name to local', () => {
      expect(KIND_SPECIFIC_MAP['ImportSpecifier']['name']).toBe('local')
    })

    test('maps ImportSpecifier propertyName to imported', () => {
      expect(KIND_SPECIFIC_MAP['ImportSpecifier']['propertyName']).toBe('imported')
    })

    test('maps ExportSpecifier name to exported', () => {
      expect(KIND_SPECIFIC_MAP['ExportSpecifier']['name']).toBe('exported')
    })

    test('maps ExportSpecifier propertyName to imported', () => {
      expect(KIND_SPECIFIC_MAP['ExportSpecifier']['propertyName']).toBe('imported')
    })

    test('maps ParenthesizedExpression expression to expression', () => {
      expect(KIND_SPECIFIC_MAP['ParenthesizedExpression']['expression']).toBe('expression')
    })

    test('maps SpreadElement expression to argument', () => {
      expect(KIND_SPECIFIC_MAP['SpreadElement']['expression']).toBe('argument')
    })

    test('maps SpreadAssignment expression to argument', () => {
      expect(KIND_SPECIFIC_MAP['SpreadAssignment']['expression']).toBe('argument')
    })

    test('maps VariableDeclaration type to typeAnnotation', () => {
      expect(KIND_SPECIFIC_MAP['VariableDeclaration']['type']).toBe('typeAnnotation')
    })

    test('maps FunctionDeclaration type to returnType', () => {
      expect(KIND_SPECIFIC_MAP['FunctionDeclaration']['type']).toBe('returnType')
    })
  })

  describe('OPERATOR_TOKEN_MAP remaining entries', () => {
    test('maps AsteriskEqualsToken to *=', () => {
      expect(OPERATOR_TOKEN_MAP['AsteriskEqualsToken']).toBe('*=')
    })

    test('maps SlashEqualsToken to /=', () => {
      expect(OPERATOR_TOKEN_MAP['SlashEqualsToken']).toBe('/=')
    })

    test('maps PercentEqualsToken to %=', () => {
      expect(OPERATOR_TOKEN_MAP['PercentEqualsToken']).toBe('%=')
    })

    test('maps AmpersandEqualsToken to &=', () => {
      expect(OPERATOR_TOKEN_MAP['AmpersandEqualsToken']).toBe('&=')
    })

    test('maps BarEqualsToken to |=', () => {
      expect(OPERATOR_TOKEN_MAP['BarEqualsToken']).toBe('|=')
    })

    test('maps CaretEqualsToken to ^=', () => {
      expect(OPERATOR_TOKEN_MAP['CaretEqualsToken']).toBe('^=')
    })

    test('maps LessThanLessThanEqualsToken to <<=', () => {
      expect(OPERATOR_TOKEN_MAP['LessThanLessThanEqualsToken']).toBe('<<=')
    })

    test('maps GreaterThanGreaterThanEqualsToken to >>=', () => {
      expect(OPERATOR_TOKEN_MAP['GreaterThanGreaterThanEqualsToken']).toBe('>>=')
    })

    test('maps GreaterThanGreaterThanGreaterThanEqualsToken to >>>=', () => {
      expect(OPERATOR_TOKEN_MAP['GreaterThanGreaterThanGreaterThanEqualsToken']).toBe('>>>=')
    })

    test('maps AmpersandAmpersandEqualsToken to &&=', () => {
      expect(OPERATOR_TOKEN_MAP['AmpersandAmpersandEqualsToken']).toBe('&&=')
    })

    test('maps BarBarEqualsToken to ||=', () => {
      expect(OPERATOR_TOKEN_MAP['BarBarEqualsToken']).toBe('||=')
    })

    test('maps QuestionQuestionEqualsToken to ??=', () => {
      expect(OPERATOR_TOKEN_MAP['QuestionQuestionEqualsToken']).toBe('??=')
    })

    test('maps CommaToken to ,', () => {
      expect(OPERATOR_TOKEN_MAP['CommaToken']).toBe(',')
    })
  })

  describe('structural integrity deep checks', () => {
    test('KIND_MAP has entries for all major statement kinds', () => {
      const expected = [
        SyntaxKind.BreakStatement,
        SyntaxKind.ContinueStatement,
        SyntaxKind.LabeledStatement,
        SyntaxKind.CatchClause,
        SyntaxKind.CaseClause,
        SyntaxKind.DefaultClause,
      ]
      for (const kind of expected) {
        expect(KIND_MAP[kind]).toBeDefined()
      }
    })

    test('KIND_NAME_ALIASES maps MethodDeclaration to MethodDefinition', () => {
      expect(KIND_NAME_ALIASES['MethodDeclaration']).toBe('MethodDefinition')
    })

    test('KIND_NAME_ALIASES maps PropertyAssignment to Property', () => {
      expect(KIND_NAME_ALIASES['PropertyAssignment']).toBe('Property')
    })

    test('KIND_NAME_ALIASES maps IfStatement to IfStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['IfStatement']).toBe('IfStatement')
    })

    test('KIND_NAME_ALIASES maps ReturnStatement to ReturnStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['ReturnStatement']).toBe('ReturnStatement')
    })

    test('KIND_NAME_ALIASES maps ThrowStatement to ThrowStatement (identity)', () => {
      expect(KIND_NAME_ALIASES['ThrowStatement']).toBe('ThrowStatement')
    })

    test('KIND_NAME_ALIASES maps ClassDeclaration to ClassDeclaration (identity)', () => {
      expect(KIND_NAME_ALIASES['ClassDeclaration']).toBe('ClassDeclaration')
    })

    test('silentLogger methods have correct arity', () => {
      expect(silentLogger.debug.length).toBe(0)
      expect(silentLogger.info.length).toBe(0)
      expect(silentLogger.warn.length).toBe(0)
      expect(silentLogger.error.length).toBe(0)
    })

    test('defaultConfig options is frozen or extensible', () => {
      expect(Object.isExtensible(defaultConfig.options)).toBe(true)
    })

    test('PROPERTY_MAP does not have unmapped keys', () => {
      const keys = Object.keys(PROPERTY_MAP)
      for (const key of keys) {
        expect(PROPERTY_MAP[key]).toBeDefined()
        expect(typeof PROPERTY_MAP[key]).toBe('string')
      }
    })

    test('KIND_SPECIFIC_MAP has exactly 59 entries', () => {
      expect(Object.keys(KIND_SPECIFIC_MAP).length).toBe(59)
    })

    test('OPERATOR_TOKEN_MAP has exactly 53 entries', () => {
      expect(Object.keys(OPERATOR_TOKEN_MAP).length).toBe(53)
    })

    test('all KIND_SPECIFIC_MAP inner values are strings', () => {
      for (const inner of Object.values(KIND_SPECIFIC_MAP)) {
        for (const v of Object.values(inner)) {
          expect(typeof v).toBe('string')
        }
      }
    })

    test('ASSIGNMENT_OPERATORS and LOGICAL_OPERATORS are disjoint', () => {
      for (const op of LOGICAL_OPERATORS) {
        expect(ASSIGNMENT_OPERATORS.has(op)).toBe(false)
      }
    })

    test('all EXPORTABLE_KINDS values are also in KIND_NAME_ALIASES', () => {
      for (const kind of EXPORTABLE_KINDS) {
        expect(KIND_NAME_ALIASES[kind]).toBeDefined()
      }
    })
  })
})
