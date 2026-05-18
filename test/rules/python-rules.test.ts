import { describe, expect, it } from 'vitest'

import { analyzeNoBareExcept, noBareExceptRule } from '../../src/rules/languages/python/no-bare-except.js'
import { analyzeNoGlobalVariables, noGlobalVariablesRule } from '../../src/rules/languages/python/no-global-variables.js'
import { analyzeNoMutableDefaultArgs, noMutableDefaultArgsRule } from '../../src/rules/languages/python/no-mutable-default-args.js'

// ─── Section: no-mutable-default-args ───

describe('no-mutable-default-args', () => {
  it('reports mutable default argument with empty list', () => {
    const code = 'def foo(items=[]):\n    pass'
    const violations = analyzeNoMutableDefaultArgs(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('[]')
    expect(violations[0]!.message).toContain('Mutable default argument')
  })

  it('reports mutable default argument with empty dict', () => {
    const code = 'def bar(config={}):\n    return config'
    const violations = analyzeNoMutableDefaultArgs(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('{}')
    expect(violations[0]!.message).toContain('Mutable default argument')
  })

  it('reports mutable default argument with set()', () => {
    const code = 'def baz(items=set()):\n    pass'
    const violations = analyzeNoMutableDefaultArgs(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('set()')
  })

  it('does not report immutable default argument with None', () => {
    const code = 'def foo(items=None):\n    pass'
    const violations = analyzeNoMutableDefaultArgs(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report immutable default argument with string', () => {
    const code = 'def foo(name="default"):\n    pass'
    const violations = analyzeNoMutableDefaultArgs(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report immutable default argument with integer', () => {
    const code = 'def foo(count=0):\n    pass'
    const violations = analyzeNoMutableDefaultArgs(code)

    expect(violations).toHaveLength(0)
  })

  it('reports multiple mutable defaults in same function', () => {
    const code = 'def foo(a=[], b={}):\n    pass'
    const violations = analyzeNoMutableDefaultArgs(code)

    expect(violations).toHaveLength(2)
  })

  it('reports mutable defaults across multiple functions', () => {
    const code = 'def foo(x=[]):\n    pass\n\ndef bar(y={}):\n    pass'
    const violations = analyzeNoMutableDefaultArgs(code)

    expect(violations).toHaveLength(2)
  })

  it('reports correct line number for violation', () => {
    const code = 'def safe(x=0):\n    pass\n\ndef unsafe(y=[]):\n    pass'
    const violations = analyzeNoMutableDefaultArgs(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.range.start.line).toBe(4)
  })

  it('reports correct column for violation', () => {
    const code = 'def foo(items=[]):\n    pass'
    const violations = analyzeNoMutableDefaultArgs(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.range.start.column).toBe(code.indexOf('=[]'))
  })

  it('uses provided file path in violation', () => {
    const code = 'def foo(x=[]):\n    pass'
    const violations = analyzeNoMutableDefaultArgs(code, 'my_module.py')

    expect(violations[0]!.filePath).toBe('my_module.py')
  })

  it('uses <input> as default file path', () => {
    const code = 'def foo(x=[]):\n    pass'
    const violations = analyzeNoMutableDefaultArgs(code)

    expect(violations[0]!.filePath).toBe('<input>')
  })

  it('returns empty array for clean code', () => {
    const code = 'def foo(x, y=1, z=None):\n    return x + y'
    const violations = analyzeNoMutableDefaultArgs(code)

    expect(violations).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noMutableDefaultArgsRule.meta.category).toBe('correctness')
    expect(noMutableDefaultArgsRule.meta.name).toBe('python/no-mutable-default-args')
    expect(noMutableDefaultArgsRule.meta.recommended).toBe(true)
    expect(noMutableDefaultArgsRule.meta.severity).toBe('error')
  })
})

// ─── Section: no-global-variables ───

describe('no-global-variables', () => {
  it('reports global variable declaration', () => {
    const code = 'def foo():\n    global counter\n    counter += 1'
    const violations = analyzeNoGlobalVariables(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('counter')
    expect(violations[0]!.message).toContain('Global variable declaration')
  })

  it('reports global declaration with multiple names', () => {
    const code = 'def foo():\n    global x\n    global y\n    pass'
    const violations = analyzeNoGlobalVariables(code)

    expect(violations).toHaveLength(2)
    expect(violations[0]!.message).toContain('x')
    expect(violations[1]!.message).toContain('y')
  })

  it('does not report normal variable assignment', () => {
    const code = 'x = 10\ndef foo():\n    y = 20'
    const violations = analyzeNoGlobalVariables(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report module-level variable declaration', () => {
    const code = 'CONFIG = {"key": "value"}'
    const violations = analyzeNoGlobalVariables(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report strings containing the word global', () => {
    const code = 'msg = "this is a global message"'
    const violations = analyzeNoGlobalVariables(code)

    expect(violations).toHaveLength(0)
  })

  it('reports correct line number for violation', () => {
    const code = 'def foo():\n    x = 1\n    global total\n    total = x + 1'
    const violations = analyzeNoGlobalVariables(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.range.start.line).toBe(3)
  })

  it('reports correct column for violation', () => {
    const code = 'def foo():\n    global counter'
    const violations = analyzeNoGlobalVariables(code)

    expect(violations).toHaveLength(1)
    const globalLine = code.split('\n')[1]!
    expect(violations[0]!.range.start.column).toBe(globalLine.indexOf('global'))
  })

  it('uses provided file path in violation', () => {
    const code = 'def foo():\n    global x'
    const violations = analyzeNoGlobalVariables(code, 'utils.py')

    expect(violations[0]!.filePath).toBe('utils.py')
  })

  it('includes suggestion to return value instead', () => {
    const code = 'def foo():\n    global result'
    const violations = analyzeNoGlobalVariables(code)

    expect(violations[0]!.suggestion).toContain('Return the value')
    expect(violations[0]!.suggestion).toContain('result')
  })

  it('does not report global keyword inside string literal', () => {
    const code = 'def foo():\n    return "global"'
    const violations = analyzeNoGlobalVariables(code)

    expect(violations).toHaveLength(0)
  })

  it('reports global with leading whitespace (indented inside function)', () => {
    const code = 'def foo():\n    global my_var'
    const violations = analyzeNoGlobalVariables(code)

    expect(violations).toHaveLength(1)
  })

  it('returns empty array for clean code', () => {
    const code = 'def foo(x, y):\n    return x + y\n\ndef bar():\n    return 42'
    const violations = analyzeNoGlobalVariables(code)

    expect(violations).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noGlobalVariablesRule.meta.category).toBe('patterns')
    expect(noGlobalVariablesRule.meta.name).toBe('python/no-global-variables')
    expect(noGlobalVariablesRule.meta.recommended).toBe(true)
    expect(noGlobalVariablesRule.meta.severity).toBe('warning')
  })
})

// ─── Section: no-bare-except ───

describe('no-bare-except', () => {
  it('reports bare except clause', () => {
    const code = 'try:\n    pass\nexcept:\n    pass'
    const violations = analyzeNoBareExcept(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Bare except clause')
  })

  it('does not report except with specific exception type', () => {
    const code = 'try:\n    pass\nexcept ValueError:\n    pass'
    const violations = analyzeNoBareExcept(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report except with Exception base class', () => {
    const code = 'try:\n    pass\nexcept Exception:\n    pass'
    const violations = analyzeNoBareExcept(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report except with tuple of exceptions', () => {
    const code = 'try:\n    pass\nexcept (ValueError, TypeError):\n    pass'
    const violations = analyzeNoBareExcept(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report except with exception as variable', () => {
    const code = 'try:\n    pass\nexcept ValueError as e:\n    pass'
    const violations = analyzeNoBareExcept(code)

    expect(violations).toHaveLength(0)
  })

  it('reports multiple bare except clauses', () => {
    const code = 'try:\n    pass\nexcept:\n    pass\n\ntry:\n    pass\nexcept:\n    pass'
    const violations = analyzeNoBareExcept(code)

    expect(violations).toHaveLength(2)
  })

  it('reports correct line number for violation', () => {
    const code = 'try:\n    risky()\nexcept:\n    handle()'
    const violations = analyzeNoBareExcept(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.range.start.line).toBe(3)
  })

  it('reports correct column for violation', () => {
    const code = 'try:\n    pass\nexcept:\n    pass'
    const violations = analyzeNoBareExcept(code)

    expect(violations).toHaveLength(1)
    // Line 3 is "except:", column should point to "except"
    expect(violations[0]!.range.start.column).toBe(0)
  })

  it('uses provided file path in violation', () => {
    const code = 'try:\n    pass\nexcept:\n    pass'
    const violations = analyzeNoBareExcept(code, 'handler.py')

    expect(violations[0]!.filePath).toBe('handler.py')
  })

  it('includes suggestion to specify exception type', () => {
    const code = 'try:\n    pass\nexcept:\n    pass'
    const violations = analyzeNoBareExcept(code)

    expect(violations[0]!.suggestion).toContain('specific exception type')
    expect(violations[0]!.suggestion).toContain('except ValueError:')
  })

  it('reports bare except with trailing whitespace', () => {
    const code = 'try:\n    pass\nexcept  :\n    pass'
    const violations = analyzeNoBareExcept(code)

    expect(violations).toHaveLength(1)
  })

  it('does not report indented except with exception type', () => {
    const code = 'def foo():\n    try:\n        pass\n    except RuntimeError:\n        pass'
    const violations = analyzeNoBareExcept(code)

    expect(violations).toHaveLength(0)
  })

  it('reports indented bare except inside function', () => {
    const code = 'def foo():\n    try:\n        pass\n    except:\n        pass'
    const violations = analyzeNoBareExcept(code)

    expect(violations).toHaveLength(1)
  })

  it('returns empty array for code with no try/except', () => {
    const code = 'def foo():\n    return 42'
    const violations = analyzeNoBareExcept(code)

    expect(violations).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noBareExceptRule.meta.category).toBe('patterns')
    expect(noBareExceptRule.meta.name).toBe('python/no-bare-except')
    expect(noBareExceptRule.meta.recommended).toBe(true)
    expect(noBareExceptRule.meta.severity).toBe('warning')
  })
})
