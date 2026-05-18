import { describe, it, expect } from 'vitest'
import {
  asSingleNode,
  containsNodeType,
  getArguments,
  getCallRootName,
  getCalleeName,
  getExpectRootName,
  getFunctionName,
  getIdentifierName,
  getNodeSource,
  getNodeText,
  getPropertyName,
  getRange,
  hasNotChain,
  isBinaryExpression,
  isCallExpression,
  isDescribeCall,
  isExpectCallee,
  isExpectCall,
  isFunctionExpression,
  isHookCall,
  isIdentifier,
  isLiteral,
  isLogicalExpression,
  isMemberExpression,
  isNewExpression,
  isReturnStatement,
  isTemplateLiteral,
  isUnaryExpression,
  toASTNode,
  type ASTNode,
} from '../src/utils/ast-helpers.js'

// ─── toASTNode ──────────────────────────────────────────
describe('toASTNode', () => {
  it('returns null for null input', () => {
    expect(toASTNode(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(toASTNode(undefined)).toBeNull()
  })

  it('returns null for a string', () => {
    expect(toASTNode('hello')).toBeNull()
  })

  it('returns null for a number', () => {
    expect(toASTNode(42)).toBeNull()
  })

  it('returns null for a boolean', () => {
    expect(toASTNode(true)).toBeNull()
  })

  it('returns the object cast as ASTNode for a plain object', () => {
    const node = { type: 'Identifier', name: 'foo' }
    const result = toASTNode(node)
    expect(result).not.toBeNull()
    expect(result?.type).toBe('Identifier')
  })

  it('returns the object for a full ASTNode', () => {
    const node: ASTNode = { type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' } }
    const result = toASTNode(node)
    expect(result).toBe(node)
  })

  it('returns the array cast as ASTNode for an empty array', () => {
    expect(toASTNode([])).not.toBeNull()
  })

  it('returns the object for a non-empty array (arrays are objects)', () => {
    // arrays are typeof 'object' and truthy, so they get cast
    const result = toASTNode([{ type: 'Identifier' }])
    expect(result).not.toBeNull()
  })
})

// ─── asSingleNode ───────────────────────────────────────
describe('asSingleNode', () => {
  it('returns null for undefined', () => {
    expect(asSingleNode(undefined)).toBeNull()
  })

  it('returns null for an empty array', () => {
    expect(asSingleNode([])).toBeNull()
  })

  it('returns null for a non-empty array', () => {
    expect(asSingleNode([{ type: 'Identifier' }])).toBeNull()
  })

  it('returns the node for a single ASTNode', () => {
    const node: ASTNode = { type: 'Identifier', name: 'x' }
    expect(asSingleNode(node)).toBe(node)
  })

  it('returns null for a node with falsy-like but valid object', () => {
    const node: ASTNode = { type: 'BlockStatement' }
    expect(asSingleNode(node)).toBe(node)
  })
})

// ─── getNodeSource ──────────────────────────────────────
describe('getNodeSource', () => {
  const context = { getSource: () => 'const x = 1;' }

  it('returns empty string when node has no range', () => {
    expect(getNodeSource(context, { type: 'Identifier' })).toBe('')
  })

  it('returns empty string for null node', () => {
    expect(getNodeSource(context, null)).toBe('')
  })

  it('returns empty string for undefined node', () => {
    expect(getNodeSource(context, undefined)).toBe('')
  })

  it('returns empty string for non-object node', () => {
    expect(getNodeSource(context, 'str')).toBe('')
  })

  it('slices source by range', () => {
    const node: ASTNode = { type: 'Identifier', range: [6, 7] }
    expect(getNodeSource(context, node)).toBe('x')
  })

  it('slices a larger range', () => {
    const node: ASTNode = { type: 'VariableDeclaration', range: [0, 11] }
    expect(getNodeSource(context, node)).toBe('const x = 1')
  })

  it('handles full source range', () => {
    const node: ASTNode = { type: 'Program', range: [0, 12] }
    expect(getNodeSource(context, node)).toBe('const x = 1;')
  })
})

// ─── isNewExpression ────────────────────────────────────
describe('isNewExpression', () => {
  it('returns true for NewExpression', () => {
    expect(isNewExpression({ type: 'NewExpression' })).toBe(true)
  })

  it('returns false for CallExpression', () => {
    expect(isNewExpression({ type: 'CallExpression' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isNewExpression(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isNewExpression(undefined)).toBe(false)
  })

  it('returns false for a string', () => {
    expect(isNewExpression('NewExpression')).toBe(false)
  })
})

// ─── isCallExpression ───────────────────────────────────
describe('isCallExpression', () => {
  it('returns true for CallExpression', () => {
    expect(isCallExpression({ type: 'CallExpression' })).toBe(true)
  })

  it('returns false for NewExpression', () => {
    expect(isCallExpression({ type: 'NewExpression' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isCallExpression(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isCallExpression(undefined)).toBe(false)
  })

  it('returns false for a number', () => {
    expect(isCallExpression(0)).toBe(false)
  })
})

// ─── isMemberExpression ─────────────────────────────────
describe('isMemberExpression', () => {
  it('returns true for MemberExpression', () => {
    expect(isMemberExpression({ type: 'MemberExpression' })).toBe(true)
  })

  it('returns false for CallExpression', () => {
    expect(isMemberExpression({ type: 'CallExpression' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isMemberExpression(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isMemberExpression(undefined)).toBe(false)
  })
})

// ─── isIdentifier ───────────────────────────────────────
describe('isIdentifier', () => {
  it('returns true for Identifier without name check', () => {
    expect(isIdentifier({ type: 'Identifier', name: 'foo' })).toBe(true)
  })

  it('returns true for Identifier with matching name', () => {
    expect(isIdentifier({ type: 'Identifier', name: 'foo' }, 'foo')).toBe(true)
  })

  it('returns false for Identifier with non-matching name', () => {
    expect(isIdentifier({ type: 'Identifier', name: 'foo' }, 'bar')).toBe(false)
  })

  it('returns false for non-Identifier type', () => {
    expect(isIdentifier({ type: 'CallExpression' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isIdentifier(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isIdentifier(undefined)).toBe(false)
  })

  it('returns true for Identifier with name check when name is undefined', () => {
    expect(isIdentifier({ type: 'Identifier', name: 'anything' }, undefined)).toBe(true)
  })

  it('returns false for object with no type', () => {
    expect(isIdentifier({ name: 'foo' })).toBe(false)
  })
})

// ─── isBinaryExpression ─────────────────────────────────
describe('isBinaryExpression', () => {
  it('returns true for BinaryExpression', () => {
    expect(isBinaryExpression({ type: 'BinaryExpression' })).toBe(true)
  })

  it('returns false for LogicalExpression', () => {
    expect(isBinaryExpression({ type: 'LogicalExpression' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isBinaryExpression(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isBinaryExpression(undefined)).toBe(false)
  })
})

// ─── isLiteral ──────────────────────────────────────────
describe('isLiteral', () => {
  it('returns true for Literal', () => {
    expect(isLiteral({ type: 'Literal', value: 42 })).toBe(true)
  })

  it('returns false for Identifier', () => {
    expect(isLiteral({ type: 'Identifier', name: 'x' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isLiteral(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isLiteral(undefined)).toBe(false)
  })
})

// ─── isLogicalExpression ────────────────────────────────
describe('isLogicalExpression', () => {
  it('returns true for LogicalExpression', () => {
    expect(isLogicalExpression({ type: 'LogicalExpression' })).toBe(true)
  })

  it('returns false for BinaryExpression', () => {
    expect(isLogicalExpression({ type: 'BinaryExpression' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isLogicalExpression(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isLogicalExpression(undefined)).toBe(false)
  })
})

// ─── isUnaryExpression ──────────────────────────────────
describe('isUnaryExpression', () => {
  it('returns true for UnaryExpression', () => {
    expect(isUnaryExpression({ type: 'UnaryExpression' })).toBe(true)
  })

  it('returns false for BinaryExpression', () => {
    expect(isUnaryExpression({ type: 'BinaryExpression' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isUnaryExpression(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isUnaryExpression(undefined)).toBe(false)
  })
})

// ─── isTemplateLiteral ──────────────────────────────────
describe('isTemplateLiteral', () => {
  it('returns true for TemplateLiteral', () => {
    expect(isTemplateLiteral({ type: 'TemplateLiteral' })).toBe(true)
  })

  it('returns false for Literal', () => {
    expect(isTemplateLiteral({ type: 'Literal' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isTemplateLiteral(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isTemplateLiteral(undefined)).toBe(false)
  })
})

// ─── isFunctionExpression ───────────────────────────────
describe('isFunctionExpression', () => {
  it('returns true for FunctionExpression', () => {
    expect(isFunctionExpression({ type: 'FunctionExpression' })).toBe(true)
  })

  it('returns true for ArrowFunctionExpression', () => {
    expect(isFunctionExpression({ type: 'ArrowFunctionExpression' })).toBe(true)
  })

  it('returns false for CallExpression', () => {
    expect(isFunctionExpression({ type: 'CallExpression' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isFunctionExpression(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isFunctionExpression(undefined)).toBe(false)
  })
})

// ─── isReturnStatement ──────────────────────────────────
describe('isReturnStatement', () => {
  it('returns true for ReturnStatement', () => {
    expect(isReturnStatement({ type: 'ReturnStatement' })).toBe(true)
  })

  it('returns false for ExpressionStatement', () => {
    expect(isReturnStatement({ type: 'ExpressionStatement' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isReturnStatement(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isReturnStatement(undefined)).toBe(false)
  })
})

// ─── getIdentifierName ──────────────────────────────────
describe('getIdentifierName', () => {
  it('returns the name of an Identifier node', () => {
    expect(getIdentifierName({ type: 'Identifier', name: 'foo' })).toBe('foo')
  })

  it('returns null for non-Identifier node', () => {
    expect(getIdentifierName({ type: 'CallExpression' })).toBeNull()
  })

  it('returns null for null', () => {
    expect(getIdentifierName(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(getIdentifierName(undefined)).toBeNull()
  })

  it('returns null when Identifier has no name', () => {
    expect(getIdentifierName({ type: 'Identifier' })).toBeNull()
  })

  it('returns empty string for Identifier with empty string name', () => {
    expect(getIdentifierName({ type: 'Identifier', name: '' })).toBe('')
  })
})

// ─── getCalleeName ──────────────────────────────────────
describe('getCalleeName', () => {
  it('returns callee name from a CallExpression', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'foo' },
    }
    expect(getCalleeName(node)).toBe('foo')
  })

  it('returns callee name from a NewExpression', () => {
    const node: ASTNode = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Bar' },
    }
    expect(getCalleeName(node)).toBe('Bar')
  })

  it('returns null for non-call/new expression', () => {
    expect(getCalleeName({ type: 'Identifier', name: 'foo' })).toBeNull()
  })

  it('returns null for null', () => {
    expect(getCalleeName(null)).toBeNull()
  })

  it('returns null when callee is a MemberExpression', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' } },
    }
    expect(getCalleeName(node)).toBeNull()
  })

  it('returns null when callee has no identifier name', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier' },
    }
    expect(getCalleeName(node)).toBeNull()
  })
})

// ─── getArguments ───────────────────────────────────────
describe('getArguments', () => {
  it('returns arguments array from a CallExpression', () => {
    const args: ASTNode[] = [{ type: 'Literal', value: 1 }]
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: args,
    }
    expect(getArguments(node)).toBe(args)
  })

  it('returns empty array when arguments is undefined', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
    }
    expect(getArguments(node)).toEqual([])
  })

  it('returns arguments from a NewExpression', () => {
    const args: ASTNode[] = [{ type: 'Literal', value: 'x' }]
    const node: ASTNode = {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Cls' },
      arguments: args,
    }
    expect(getArguments(node)).toBe(args)
  })

  it('returns empty array for non-call expression', () => {
    expect(getArguments({ type: 'Identifier', name: 'foo' })).toEqual([])
  })

  it('returns empty array for null', () => {
    expect(getArguments(null)).toEqual([])
  })
})

// ─── getRange ───────────────────────────────────────────
describe('getRange', () => {
  it('returns the range tuple from a node', () => {
    const node: ASTNode = { type: 'Identifier', range: [5, 10] }
    expect(getRange(node)).toEqual([5, 10])
  })

  it('returns null when node has no range', () => {
    expect(getRange({ type: 'Identifier' })).toBeNull()
  })

  it('returns null for null', () => {
    expect(getRange(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(getRange(undefined)).toBeNull()
  })

  it('returns null for a string', () => {
    expect(getRange('hello')).toBeNull()
  })
})

// ─── getNodeText ────────────────────────────────────────
describe('getNodeText', () => {
  const source = 'function hello() { return 1; }'

  it('returns text slice based on range', () => {
    const node: ASTNode = { type: 'Identifier', range: [9, 14] }
    expect(getNodeText(node, source)).toBe('hello')
  })

  it('returns empty string when no range', () => {
    expect(getNodeText({ type: 'Identifier' }, source)).toBe('')
  })

  it('returns empty string for null node', () => {
    expect(getNodeText(null, source)).toBe('')
  })

  it('returns full source for full range', () => {
    const node: ASTNode = { type: 'Program', range: [0, 30] }
    expect(getNodeText(node, source)).toBe(source)
  })
})

// ─── getPropertyName ────────────────────────────────────
describe('getPropertyName', () => {
  it('returns name from an Identifier', () => {
    expect(getPropertyName({ type: 'Identifier', name: 'prop' })).toBe('prop')
  })

  it('returns the property name from a MemberExpression', () => {
    const node: ASTNode = {
      type: 'MemberExpression',
      property: { type: 'Identifier', name: 'length' },
    }
    expect(getPropertyName(node)).toBe('length')
  })

  it('returns null for null', () => {
    expect(getPropertyName(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(getPropertyName(undefined)).toBeNull()
  })

  it('returns null for other node types', () => {
    expect(getPropertyName({ type: 'CallExpression' })).toBeNull()
  })

  it('returns null for Identifier without name', () => {
    expect(getPropertyName({ type: 'Identifier' })).toBeNull()
  })

  it('returns null for MemberExpression with non-Identifier property', () => {
    const node: ASTNode = {
      type: 'MemberExpression',
      property: { type: 'Literal', value: 0 },
    }
    expect(getPropertyName(node)).toBeNull()
  })
})

// ─── isExpectCallee ─────────────────────────────────────
describe('isExpectCallee', () => {
  it('returns true for Identifier named expect', () => {
    expect(isExpectCallee({ type: 'Identifier', name: 'expect' })).toBe(true)
  })

  it('returns false for Identifier with other name', () => {
    expect(isExpectCallee({ type: 'Identifier', name: 'assert' })).toBe(false)
  })

  it('returns true for MemberExpression with CallExpression object whose callee is expect', () => {
    const node: ASTNode = {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
      },
    }
    expect(isExpectCallee(node)).toBe(true)
  })

  it('returns true for MemberExpression with Identifier object named expect', () => {
    const node: ASTNode = {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'expect' },
    }
    expect(isExpectCallee(node)).toBe(true)
  })

  it('returns false for MemberExpression with other object', () => {
    const node: ASTNode = {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'assert' },
    }
    expect(isExpectCallee(node)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isExpectCallee(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isExpectCallee(undefined)).toBe(false)
  })

  it('returns false for other node types', () => {
    expect(isExpectCallee({ type: 'CallExpression' })).toBe(false)
  })

  it('returns false for MemberExpression with no object', () => {
    expect(isExpectCallee({ type: 'MemberExpression' })).toBe(false)
  })

  it('returns false for deeply nested expect chain (only handles 1 level)', () => {
    const node: ASTNode = {
      type: 'MemberExpression',
      object: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
        },
        property: { type: 'Identifier', name: 'not' },
      },
    }
    expect(isExpectCallee(node)).toBe(false)
  })
})

// ─── isExpectCall ───────────────────────────────────────
describe('isExpectCall', () => {
  it('returns true for direct expect() call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'expect' },
    }
    expect(isExpectCall(node)).toBe(true)
  })

  it('returns true for expect(x).toBe() call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'expect' },
        property: { type: 'Identifier', name: 'toBe' },
      },
    }
    // Wait - the callee is a MemberExpression with object Identifier 'expect'
    // But getExpectRootName walks MemberExpression.object -> Identifier -> 'expect'
    expect(isExpectCall(node)).toBe(true)
  })

  it('returns true for expect(x).not.toBe() call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'expect' },
          },
        },
      },
    }
    expect(isExpectCall(node)).toBe(true)
  })

  it('returns false for non-expect call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'assert' },
    }
    expect(isExpectCall(node)).toBe(false)
  })

  it('returns false for non-CallExpression', () => {
    expect(isExpectCall({ type: 'Identifier', name: 'expect' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isExpectCall(null)).toBe(false)
  })

  it('returns false for CallExpression with no callee', () => {
    expect(isExpectCall({ type: 'CallExpression' })).toBe(false)
  })
})

// ─── getExpectRootName ──────────────────────────────────
describe('getExpectRootName', () => {
  it('returns name from an Identifier', () => {
    expect(getExpectRootName({ type: 'Identifier', name: 'expect' })).toBe('expect')
  })

  it('returns root name from MemberExpression chain', () => {
    const node: ASTNode = {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'expect' },
    }
    expect(getExpectRootName(node)).toBe('expect')
  })

  it('returns root name from nested MemberExpression', () => {
    const node: ASTNode = {
      type: 'MemberExpression',
      object: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'sinon' },
      },
    }
    expect(getExpectRootName(node)).toBe('sinon')
  })

  it('returns root name from CallExpression callee', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'expect' },
    }
    expect(getExpectRootName(node)).toBe('expect')
  })

  it('returns null for null', () => {
    expect(getExpectRootName(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(getExpectRootName(undefined)).toBeNull()
  })

  it('returns null for other types', () => {
    expect(getExpectRootName({ type: 'Literal' })).toBeNull()
  })

  it('returns null for Identifier without name', () => {
    expect(getExpectRootName({ type: 'Identifier' })).toBeNull()
  })
})

// ─── getCallRootName ────────────────────────────────────
describe('getCallRootName', () => {
  it('returns name for direct call: foo()', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'foo' },
    }
    expect(getCallRootName(node)).toBe('foo')
  })

  it('returns object name for method call: obj.method()', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'method' },
      },
    }
    expect(getCallRootName(node)).toBe('obj')
  })

  it('returns null for null', () => {
    expect(getCallRootName(null)).toBeNull()
  })

  it('returns null for non-CallExpression', () => {
    expect(getCallRootName({ type: 'Identifier', name: 'foo' })).toBeNull()
  })

  it('returns null for CallExpression with no callee', () => {
    expect(getCallRootName({ type: 'CallExpression' })).toBeNull()
  })

  it('returns null for deep member chain: a.b.c()', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'b' },
        },
        property: { type: 'Identifier', name: 'c' },
      },
    }
    // callee.object is MemberExpression, not Identifier
    expect(getCallRootName(node)).toBeNull()
  })

  it('returns null when MemberExpression object is not Identifier', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'CallExpression' },
      },
    }
    expect(getCallRootName(node)).toBeNull()
  })
})

// ─── getFunctionName ────────────────────────────────────
describe('getFunctionName', () => {
  it('returns name from function id', () => {
    const node: ASTNode = { type: 'FunctionExpression', id: { type: 'Identifier', name: 'myFn' } }
    expect(getFunctionName(node)).toBe('myFn')
  })

  it('returns name from VariableDeclarator parent', () => {
    const node: ASTNode = {
      type: 'FunctionExpression',
      parent: {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'myVar' },
      },
    }
    expect(getFunctionName(node)).toBe('myVar')
  })

  it('returns name from Property parent', () => {
    const node: ASTNode = {
      type: 'FunctionExpression',
      parent: {
        type: 'Property',
        key: { type: 'Identifier', name: 'myMethod' },
      },
    }
    expect(getFunctionName(node)).toBe('myMethod')
  })

  it('returns name from MethodDefinition parent', () => {
    const node: ASTNode = {
      type: 'FunctionExpression',
      parent: {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'myMethod' },
      },
    }
    expect(getFunctionName(node)).toBe('myMethod')
  })

  it('returns name from AssignmentExpression parent', () => {
    const node: ASTNode = {
      type: 'FunctionExpression',
      parent: {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'assignedFn' },
      },
    }
    expect(getFunctionName(node)).toBe('assignedFn')
  })

  it('returns null when no name found', () => {
    expect(getFunctionName({ type: 'FunctionExpression' })).toBeNull()
  })

  it('returns null for null', () => {
    expect(getFunctionName(null)).toBeNull()
  })

  it('returns null for node with non-Identifier id', () => {
    expect(getFunctionName({ type: 'FunctionExpression', id: { type: 'Literal', value: 1 } })).toBeNull()
  })

  it('prefers id over parent name', () => {
    const node: ASTNode = {
      type: 'FunctionExpression',
      id: { type: 'Identifier', name: 'namedFn' },
      parent: {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'varFn' },
      },
    }
    expect(getFunctionName(node)).toBe('namedFn')
  })

  it('returns null for AssignmentExpression with non-Identifier left', () => {
    const node: ASTNode = {
      type: 'FunctionExpression',
      parent: {
        type: 'AssignmentExpression',
        left: { type: 'MemberExpression' },
      },
    }
    expect(getFunctionName(node)).toBeNull()
  })
})

// ─── isDescribeCall ─────────────────────────────────────
describe('isDescribeCall', () => {
  it('returns "describe" for direct describe() call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'describe' },
    }
    expect(isDescribeCall(node)).toBe('describe')
  })

  it('returns "context" for direct context() call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'context' },
    }
    expect(isDescribeCall(node)).toBe('context')
  })

  it('returns "suite" for direct suite() call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'suite' },
    }
    expect(isDescribeCall(node)).toBe('suite')
  })

  it('returns "describe" for describe.only() call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'describe' },
        property: { type: 'Identifier', name: 'only' },
      },
    }
    expect(isDescribeCall(node)).toBe('describe')
  })

  it('returns "context" for context.skip() call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'context' },
        property: { type: 'Identifier', name: 'skip' },
      },
    }
    expect(isDescribeCall(node)).toBe('context')
  })

  it('returns null for non-describe call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'it' },
    }
    expect(isDescribeCall(node)).toBeNull()
  })

  it('returns null for non-CallExpression', () => {
    expect(isDescribeCall({ type: 'Identifier', name: 'describe' })).toBeNull()
  })

  it('returns null for null', () => {
    expect(isDescribeCall(null)).toBeNull()
  })

  it('returns null for MemberExpression with non-describe object', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'foo' },
      },
    }
    expect(isDescribeCall(node)).toBeNull()
  })

  it('returns null for CallExpression with no callee', () => {
    expect(isDescribeCall({ type: 'CallExpression' })).toBeNull()
  })
})

// ─── isHookCall ─────────────────────────────────────────
describe('isHookCall', () => {
  it('returns "beforeEach" for direct beforeEach() call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'beforeEach' },
    }
    expect(isHookCall(node)).toBe('beforeEach')
  })

  it('returns "afterEach" for direct afterEach() call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'afterEach' },
    }
    expect(isHookCall(node)).toBe('afterEach')
  })

  it('returns "beforeAll" for direct beforeAll() call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'beforeAll' },
    }
    expect(isHookCall(node)).toBe('beforeAll')
  })

  it('returns "afterAll" for direct afterAll() call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'afterAll' },
    }
    expect(isHookCall(node)).toBe('afterAll')
  })

  it('returns hook name for member expression call: beforeEach.only()', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'beforeEach' },
      },
    }
    expect(isHookCall(node)).toBe('beforeEach')
  })

  it('returns null for non-hook call', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'describe' },
    }
    expect(isHookCall(node)).toBeNull()
  })

  it('returns null for non-CallExpression', () => {
    expect(isHookCall({ type: 'Identifier', name: 'beforeEach' })).toBeNull()
  })

  it('returns null for null', () => {
    expect(isHookCall(null)).toBeNull()
  })

  it('returns null for MemberExpression with non-hook object', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'foo' },
      },
    }
    expect(isHookCall(node)).toBeNull()
  })

  it('returns null for CallExpression with no callee', () => {
    expect(isHookCall({ type: 'CallExpression' })).toBeNull()
  })
})

// ─── containsNodeType ───────────────────────────────────
describe('containsNodeType', () => {
  it('returns true when node itself has the target type', () => {
    expect(containsNodeType({ type: 'Identifier', name: 'x' }, 'Identifier')).toBe(true)
  })

  it('returns false when node type does not match', () => {
    expect(containsNodeType({ type: 'Identifier', name: 'x' }, 'CallExpression')).toBe(false)
  })

  it('returns true when nested child has the target type', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'foo' },
    }
    expect(containsNodeType(node, 'Identifier')).toBe(true)
  })

  it('returns true when deeply nested child has the target type', () => {
    const node: ASTNode = {
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
      },
    }
    expect(containsNodeType(node, 'MemberExpression')).toBe(true)
  })

  it('searches array values', () => {
    const node: ASTNode = {
      type: 'Program',
      body: [
        { type: 'ExpressionStatement' },
        { type: 'ReturnStatement' },
      ],
    }
    expect(containsNodeType(node, 'ReturnStatement')).toBe(true)
  })

  it('returns false for null', () => {
    expect(containsNodeType(null, 'Identifier')).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(containsNodeType(undefined, 'Identifier')).toBe(false)
  })

  it('returns false for a string', () => {
    expect(containsNodeType('hello', 'Identifier')).toBe(false)
  })

  it('handles circular references without infinite loop', () => {
    const node: ASTNode = { type: 'Identifier', name: 'x' }
    // create a circular reference
    node.parent = node
    expect(containsNodeType(node, 'CallExpression')).toBe(false)
  })

  it('returns false when no match in empty object', () => {
    expect(containsNodeType({}, 'Identifier')).toBe(false)
  })

  it('returns true when match is in an array within an object', () => {
    const node = {
      type: 'BlockStatement',
      body: [{ type: 'IfStatement' }, { type: 'ForStatement' }],
    }
    expect(containsNodeType(node, 'ForStatement')).toBe(true)
  })

  it('uses provided visited set', () => {
    const visited = new Set<unknown>()
    const node = { type: 'Identifier', name: 'x' }
    visited.add(node)
    expect(containsNodeType(node, 'Identifier', visited)).toBe(false)
  })
})

// ─── hasNotChain ────────────────────────────────────────
describe('hasNotChain', () => {
  it('returns true when callee property is "not"', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'expect' },
        property: { type: 'Identifier', name: 'not' },
      },
    }
    expect(hasNotChain(node)).toBe(true)
  })

  it('returns false when property is not "not"', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'expect' },
        property: { type: 'Identifier', name: 'toBe' },
      },
    }
    expect(hasNotChain(node)).toBe(false)
  })

  it('returns true for nested not chain: expect(x).not.toBe()', () => {
    // The outer call is expect(x).not.toBe(val)
    // callee = MemberExpression (.toBe)
    //   object = CallExpression (expect(x).not)
    //     callee = MemberExpression (.not)
    //       object = CallExpression (expect(x))
    //       property = Identifier 'not'
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            property: { type: 'Identifier', name: 'not' },
            object: { type: 'Identifier', name: 'expect' },
          },
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
    }
    expect(hasNotChain(node)).toBe(true)
  })

  it('returns false for direct call without member expression', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
    }
    expect(hasNotChain(node)).toBe(false)
  })

  it('returns false for non-CallExpression', () => {
    expect(hasNotChain({ type: 'Identifier', name: 'x' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(hasNotChain(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(hasNotChain(undefined)).toBe(false)
  })

  it('returns false for CallExpression with no callee', () => {
    expect(hasNotChain({ type: 'CallExpression' })).toBe(false)
  })

  it('returns false when callee is MemberExpression with non-Identifier property', () => {
    const node: ASTNode = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Literal', value: 0 },
      },
    }
    expect(hasNotChain(node)).toBe(false)
  })
})
