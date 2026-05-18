import { describe, expect, it } from 'vitest'

import {
  ASSIGNMENT_OPERATORS,
  EXPORTABLE_KINDS,
  KIND_MAP,
  KIND_NAME_ALIASES,
  KIND_SPECIFIC_MAP,
  LOGICAL_OPERATORS,
  MAX_DEPTH,
  OPERATOR_TOKEN_MAP,
  PROPERTY_MAP,
  SKIP_KEYS,
  defaultConfig,
  silentLogger,
} from '../../src/rules/adapter-constants.js'

// ─── KIND_MAP ───

describe('KIND_MAP', () => {
  it('is a plain object with numeric keys', () => {
    expect(typeof KIND_MAP).toBe('object')
    expect(KIND_MAP).not.toBeNull()
    const keys = Object.keys(KIND_MAP)
    expect(keys.length).toBeGreaterThan(100)
  })

  it('contains no keys starting with "First"', () => {
    const firstKeys = Object.values(KIND_MAP).filter((v) => v.startsWith('First'))
    expect(firstKeys).toEqual([])
  })

  it('contains no keys starting with "Last"', () => {
    const lastKeys = Object.values(KIND_MAP).filter((v) => v.startsWith('Last'))
    expect(lastKeys).toEqual([])
  })

  it('has all string values', () => {
    const values = Object.values(KIND_MAP)
    for (const v of values) {
      expect(typeof v).toBe('string')
    }
  })

  it('includes common SyntaxKind names like Identifier', () => {
    const values = Object.values(KIND_MAP)
    expect(values).toContain('Identifier')
    expect(values).toContain('StringLiteral')
    expect(values).toContain('NumericLiteral')
    expect(values).toContain('IfStatement')
    expect(values).toContain('ForStatement')
    expect(values).toContain('ClassDeclaration')
    expect(values).toContain('FunctionDeclaration')
    expect(values).toContain('ReturnStatement')
  })

  it('maps unique numbers to names (no duplicate values sharing a key)', () => {
    const values = Object.values(KIND_MAP)
    const uniqueValues = new Set(values)
    expect(uniqueValues.size).toBe(values.length)
  })
})

// ─── silentLogger ───

describe('silentLogger', () => {
  it('has a debug method', () => {
    expect(typeof silentLogger.debug).toBe('function')
  })

  it('has an error method', () => {
    expect(typeof silentLogger.error).toBe('function')
  })

  it('has an info method', () => {
    expect(typeof silentLogger.info).toBe('function')
  })

  it('has a warn method', () => {
    expect(typeof silentLogger.warn).toBe('function')
  })

  it('debug returns undefined', () => {
    expect(silentLogger.debug('test')).toBeUndefined()
  })

  it('error returns undefined', () => {
    expect(silentLogger.error('test')).toBeUndefined()
  })

  it('info returns undefined', () => {
    expect(silentLogger.info('test')).toBeUndefined()
  })

  it('warn returns undefined', () => {
    expect(silentLogger.warn('test')).toBeUndefined()
  })
})

// ─── defaultConfig ───

describe('defaultConfig', () => {
  it('has options property as empty object', () => {
    expect(defaultConfig.options).toEqual({})
  })

  it('has rules property as empty object', () => {
    expect(defaultConfig.rules).toEqual({})
  })

  it('has transforms property as empty array', () => {
    expect(defaultConfig.transforms).toEqual([])
  })
})

// ─── PROPERTY_MAP ───

describe('PROPERTY_MAP', () => {
  it('maps expression to argument', () => {
    expect(PROPERTY_MAP['expression']).toBe('argument')
  })

  it('maps condition to test', () => {
    expect(PROPERTY_MAP['condition']).toBe('test')
  })

  it('maps initializer to init', () => {
    expect(PROPERTY_MAP['initializer']).toBe('init')
  })

  it('maps body to body', () => {
    expect(PROPERTY_MAP['body']).toBe('body')
  })

  it('maps statements to body', () => {
    expect(PROPERTY_MAP['statements']).toBe('body')
  })

  it('maps elseStatement to alternate', () => {
    expect(PROPERTY_MAP['elseStatement']).toBe('alternate')
  })

  it('maps thenStatement to consequent', () => {
    expect(PROPERTY_MAP['thenStatement']).toBe('consequent')
  })

  it('maps escapedText to name', () => {
    expect(PROPERTY_MAP['escapedText']).toBe('name')
  })

  it('has only string values', () => {
    for (const v of Object.values(PROPERTY_MAP)) {
      expect(typeof v).toBe('string')
    }
  })
})

// ─── KIND_NAME_ALIASES ───

describe('KIND_NAME_ALIASES', () => {
  it('maps ArrayLiteralExpression to ArrayExpression', () => {
    expect(KIND_NAME_ALIASES['ArrayLiteralExpression']).toBe('ArrayExpression')
  })

  it('maps ArrowFunction to ArrowFunctionExpression', () => {
    expect(KIND_NAME_ALIASES['ArrowFunction']).toBe('ArrowFunctionExpression')
  })

  it('maps ObjectLiteralExpression to ObjectExpression', () => {
    expect(KIND_NAME_ALIASES['ObjectLiteralExpression']).toBe('ObjectExpression')
  })

  it('maps Block to BlockStatement', () => {
    expect(KIND_NAME_ALIASES['Block']).toBe('BlockStatement')
  })

  it('maps VariableDeclaration to VariableDeclarator', () => {
    expect(KIND_NAME_ALIASES['VariableDeclaration']).toBe('VariableDeclarator')
  })

  it('maps EnumDeclaration to TSEnumDeclaration', () => {
    expect(KIND_NAME_ALIASES['EnumDeclaration']).toBe('TSEnumDeclaration')
  })

  it('has only string values', () => {
    for (const v of Object.values(KIND_NAME_ALIASES)) {
      expect(typeof v).toBe('string')
    }
  })
})

// ─── KIND_SPECIFIC_MAP ───

describe('KIND_SPECIFIC_MAP', () => {
  it('has IfStatement with expression→test override', () => {
    expect(KIND_SPECIFIC_MAP['IfStatement']['expression']).toBe('test')
  })

  it('has IfStatement with elseStatement→alternate override', () => {
    expect(KIND_SPECIFIC_MAP['IfStatement']['elseStatement']).toBe('alternate')
  })

  it('has FunctionDeclaration with name→id override', () => {
    expect(KIND_SPECIFIC_MAP['FunctionDeclaration']['name']).toBe('id')
  })

  it('has CallExpression with expression→callee override', () => {
    expect(KIND_SPECIFIC_MAP['CallExpression']['expression']).toBe('callee')
  })

  it('has PropertyAccessExpression with expression→object override', () => {
    expect(KIND_SPECIFIC_MAP['PropertyAccessExpression']['expression']).toBe('object')
  })

  it('has PropertyAccessExpression with name→property override', () => {
    expect(KIND_SPECIFIC_MAP['PropertyAccessExpression']['name']).toBe('property')
  })

  it('has TryStatement with catchClause→handler override', () => {
    expect(KIND_SPECIFIC_MAP['TryStatement']['catchClause']).toBe('handler')
  })

  it('has TryStatement with finallyBlock→finalizer override', () => {
    expect(KIND_SPECIFIC_MAP['TryStatement']['finallyBlock']).toBe('finalizer')
  })

  it('has SwitchStatement with expression→discriminant override', () => {
    expect(KIND_SPECIFIC_MAP['SwitchStatement']['expression']).toBe('discriminant')
  })
})

// ─── MAX_DEPTH ───

describe('MAX_DEPTH', () => {
  it('equals 5', () => {
    expect(MAX_DEPTH).toBe(5)
  })
})

// ─── SKIP_KEYS ───

describe('SKIP_KEYS', () => {
  it('is a Set', () => {
    expect(SKIP_KEYS).toBeInstanceOf(Set)
  })

  it('contains parent', () => {
    expect(SKIP_KEYS.has('parent')).toBe(true)
  })

  it('contains pos', () => {
    expect(SKIP_KEYS.has('pos')).toBe(true)
  })

  it('contains end', () => {
    expect(SKIP_KEYS.has('end')).toBe(true)
  })

  it('contains kind', () => {
    expect(SKIP_KEYS.has('kind')).toBe(true)
  })

  it('contains symbol', () => {
    expect(SKIP_KEYS.has('symbol')).toBe(true)
  })

  it('contains flags', () => {
    expect(SKIP_KEYS.has('flags')).toBe(true)
  })

  it('contains original', () => {
    expect(SKIP_KEYS.has('original')).toBe(true)
  })

  it('does not contain name', () => {
    expect(SKIP_KEYS.has('name')).toBe(false)
  })
})

// ─── OPERATOR_TOKEN_MAP ───

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

  it('maps AmpersandAmpersandToken to "&&"', () => {
    expect(OPERATOR_TOKEN_MAP['AmpersandAmpersandToken']).toBe('&&')
  })

  it('maps BarBarToken to "||"', () => {
    expect(OPERATOR_TOKEN_MAP['BarBarToken']).toBe('||')
  })

  it('maps QuestionQuestionToken to "??"', () => {
    expect(OPERATOR_TOKEN_MAP['QuestionQuestionToken']).toBe('??')
  })

  it('maps ExclamationToken to "!"', () => {
    expect(OPERATOR_TOKEN_MAP['ExclamationToken']).toBe('!')
  })

  it('maps ArrowToken to "=>"', () => {
    expect(OPERATOR_TOKEN_MAP['ArrowToken']).toBe('=>')
  })

  it('has only string values', () => {
    for (const v of Object.values(OPERATOR_TOKEN_MAP)) {
      expect(typeof v).toBe('string')
    }
  })
})

// ─── ASSIGNMENT_OPERATORS ───

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

  it('does not contain non-assignment operators like "+"', () => {
    expect(ASSIGNMENT_OPERATORS.has('+')).toBe(false)
  })

  it('does not contain logical operators like "&&"', () => {
    expect(ASSIGNMENT_OPERATORS.has('&&')).toBe(false)
  })
})

// ─── LOGICAL_OPERATORS ───

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

  it('has exactly 3 members', () => {
    expect(LOGICAL_OPERATORS.size).toBe(3)
  })
})

// ─── EXPORTABLE_KINDS ───

describe('EXPORTABLE_KINDS', () => {
  it('is a Set', () => {
    expect(EXPORTABLE_KINDS).toBeInstanceOf(Set)
  })

  it('contains ClassDeclaration', () => {
    expect(EXPORTABLE_KINDS.has('ClassDeclaration')).toBe(true)
  })

  it('contains FunctionDeclaration', () => {
    expect(EXPORTABLE_KINDS.has('FunctionDeclaration')).toBe(true)
  })

  it('contains InterfaceDeclaration', () => {
    expect(EXPORTABLE_KINDS.has('InterfaceDeclaration')).toBe(true)
  })

  it('contains EnumDeclaration', () => {
    expect(EXPORTABLE_KINDS.has('EnumDeclaration')).toBe(true)
  })

  it('contains TypeAliasDeclaration', () => {
    expect(EXPORTABLE_KINDS.has('TypeAliasDeclaration')).toBe(true)
  })

  it('contains ModuleDeclaration', () => {
    expect(EXPORTABLE_KINDS.has('ModuleDeclaration')).toBe(true)
  })

  it('does not contain non-declaration kinds', () => {
    expect(EXPORTABLE_KINDS.has('Identifier')).toBe(false)
    expect(EXPORTABLE_KINDS.has('ReturnStatement')).toBe(false)
  })
})

// ─── Cross-constant invariants ───

describe('cross-constant invariants', () => {
  it('no ASSIGNMENT_OPERATORS overlap with LOGICAL_OPERATORS', () => {
    for (const op of ASSIGNMENT_OPERATORS) {
      expect(LOGICAL_OPERATORS.has(op)).toBe(false)
    }
  })

  it('EXPORTABLE_KINDS is a subset of KIND_NAME_ALIASES keys', () => {
    const aliasKeys = new Set(Object.keys(KIND_NAME_ALIASES))
    for (const kind of EXPORTABLE_KINDS) {
      expect(aliasKeys.has(kind)).toBe(true)
    }
  })

  it('all KIND_SPECIFIC_MAP inner values are strings', () => {
    for (const inner of Object.values(KIND_SPECIFIC_MAP)) {
      for (const v of Object.values(inner)) {
        expect(typeof v).toBe('string')
      }
    }
  })
})
