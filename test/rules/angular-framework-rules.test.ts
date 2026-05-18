import { describe, expect, it } from 'vitest'

import { noEmptyMethodRule } from '../../src/rules/frameworks/angular/no-empty-method.js'
import { noInputRenameRule } from '../../src/rules/frameworks/angular/no-input-rename.js'
import { noServicesInComponentRule } from '../../src/rules/frameworks/angular/no-services-in-component.js'
import { preferOnPushRule } from '../../src/rules/frameworks/angular/prefer-on-push.js'

// ─── SyntaxKind constants (from @ts-morph/common) ───

const SK = {
  ArrowFunction: 219,
  BinaryExpression: 226,
  Block: 241,
  CallExpression: 213,
  ClassDeclaration: 263,
  Constructor: 176,
  ExpressionStatement: 244,
  Identifier: 80,
  LabeledStatement: 256,
  MethodDeclaration: 174,
  ObjectLiteralExpression: 210,
  PropertyAccessExpression: 211,
  PropertyAssignment: 303,
  PropertyDeclaration: 172,
  StringLiteral: 11,
} as const

// ─── Shared mock helpers ───

type MockNode = Record<string, unknown>

type LooseVisitor = Record<string, ((...args: unknown[]) => void) | undefined>

function looseVisitor(v: unknown): LooseVisitor {
  return v as unknown as LooseVisitor
}

function createSourceFileMock(): MockNode {
  return {
    getFilePath: () => 'test.ts',
    getLineAndColumnAtPos: (_pos: number) => ({ column: 0, line: 1 }),
  }
}

function makeNode(overrides: MockNode): MockNode {
  const sf = createSourceFileMock()
  return {
    getEnd: () => 100,
    getKind: () => 0,
    getParent: () => ({}),
    getSourceFile: () => sf,
    getStart: () => 0,
    getText: () => '',
    ...overrides,
  }
}

const emptyContext: MockNode = {
  addViolation: () => {},
  depth: 0,
  getFilePath: () => 'test.ts',
  parent: undefined,
  sourceFile: {
    getFilePath: () => 'test.ts',
    getLineAndColumnAtPos: (_pos: number) => ({ column: 0, line: 1 }),
  },
}

// ─── Section: angular/no-empty-method ───

describe('angular/no-empty-method', () => {
  function createMethodNode(
    methodName: string,
    bodyStatements: MockNode[] = [],
    hasBody = true,
  ): MockNode {
    const sf = createSourceFileMock()
    const body: MockNode = bodyStatements.length === 0
      ? { getKind: () => SK.Block, getStatements: () => [] }
      : { getKind: () => SK.Block, getStatements: () => bodyStatements }

    return makeNode({
      getBody: () => hasBody ? body : undefined,
      getKind: () => SK.MethodDeclaration,
      getNameNode: () => ({ getText: () => methodName }),
      getSourceFile: () => sf,
    })
  }

  // ─── Positive cases (should trigger) ───

  it('reports empty ngOnInit method', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMethodNode('ngOnInit'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('ngOnInit')
    expect(violations[0]!.message).toContain('Empty lifecycle method')
    expect(violations[0]!.ruleId).toBe('angular/no-empty-method')
    expect(violations[0]!.severity).toBe('warning')
  })

  it('reports empty ngOnDestroy method', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMethodNode('ngOnDestroy'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('ngOnDestroy')
  })

  it('reports empty ngOnChanges method', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMethodNode('ngOnChanges'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('reports empty ngDoCheck method', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMethodNode('ngDoCheck'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('reports empty ngAfterContentInit method', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMethodNode('ngAfterContentInit'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('reports empty ngAfterContentChecked method', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMethodNode('ngAfterContentChecked'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('reports empty ngAfterViewInit method', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMethodNode('ngAfterViewInit'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('reports empty ngAfterViewChecked method', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMethodNode('ngAfterViewChecked'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  // ─── Negative cases (should NOT trigger) ───

  it('does not report ngOnInit with statements', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    const stmt: MockNode = { getText: () => 'console.log("init")' }
    visitor.visitNode!(createMethodNode('ngOnInit', [stmt]), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report ngOnDestroy with cleanup logic', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    const stmt: MockNode = { getText: () => 'this.subscription.unsubscribe()' }
    visitor.visitNode!(createMethodNode('ngOnDestroy', [stmt]), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-lifecycle methods', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMethodNode('customMethod'), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report onClick method', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMethodNode('onClick'), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report method without a body', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMethodNode('ngOnInit', [], false), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report method without a name node', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getBody: () => ({ getKind: () => SK.Block, getStatements: () => [] }),
      getKind: () => SK.MethodDeclaration,
      getNameNode: () => undefined,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report body that is not a block', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getBody: () => ({ getKind: () => SK.Identifier, getText: () => 'expression' }),
      getKind: () => SK.MethodDeclaration,
      getNameNode: () => ({ getText: () => 'ngOnInit' }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-method-declaration nodes', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.ClassDeclaration }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report identifier nodes', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report constructor declarations', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      makeNode({
        getKind: () => SK.Constructor,
        getParameters: () => [],
      }),
      emptyContext,
    )
    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Edge cases ───

  it('reports multiple empty lifecycle methods independently', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMethodNode('ngOnInit'), emptyContext)
    visitor.visitNode!(createMethodNode('ngOnDestroy'), emptyContext)
    visitor.visitNode!(createMethodNode('ngAfterViewInit'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(3)
  })

  it('includes suggestion in violation', () => {
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMethodNode('ngOnInit'), emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('ngOnInit')
    expect(violations[0]!.suggestion).toContain('Remove')
  })

  it('reports each lifecycle method name correctly', () => {
    const lifecycleMethods = [
      'ngOnInit',
      'ngOnChanges',
      'ngDoCheck',
      'ngAfterContentInit',
      'ngAfterContentChecked',
      'ngAfterViewInit',
      'ngAfterViewChecked',
      'ngOnDestroy',
    ]

    for (const name of lifecycleMethods) {
      const result = noEmptyMethodRule.create({})
      const visitor = looseVisitor(result.visitor)

      visitor.visitNode!(createMethodNode(name), emptyContext)

      const violations = result.onComplete!()
      expect(violations).toHaveLength(1)
      expect(violations[0]!.message).toContain(name)
    }
  })

  it('reports violation with correct filePath', () => {
    const sf = {
      getFilePath: () => '/src/app.component.ts',
      getLineAndColumnAtPos: (_pos: number) => ({ column: 0, line: 1 }),
    }
    const result = noEmptyMethodRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getBody: () => ({ getKind: () => SK.Block, getStatements: () => [] }),
      getKind: () => SK.MethodDeclaration,
      getNameNode: () => ({ getText: () => 'ngOnInit' }),
      getSourceFile: () => sf,
    })

    visitor.visitNode!(node, { ...emptyContext, getFilePath: () => '/src/app.component.ts' })

    const violations = result.onComplete!()
    expect(violations[0]!.filePath).toBe('/src/app.component.ts')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noEmptyMethodRule.meta.category).toBe('patterns')
    expect(noEmptyMethodRule.meta.description).toContain('lifecycle')
    expect(noEmptyMethodRule.meta.name).toBe('angular/no-empty-method')
    expect(noEmptyMethodRule.meta.recommended).toBe(true)
    expect(noEmptyMethodRule.meta.severity).toBe('warning')
  })

  it('has empty default options', () => {
    expect(noEmptyMethodRule.defaultOptions).toEqual({})
  })
})

// ─── Section: angular/no-input-rename ───

describe('angular/no-input-rename', () => {
  function createPropertyWithInputDecorator(
    propertyName: string,
    alias: string | null,
  ): MockNode {
    const sf = createSourceFileMock()
    const decoratorArgs: MockNode[] = alias !== null
      ? [{ getKind: () => SK.StringLiteral, getLiteralValue: () => alias }]
      : []

    const callee: MockNode = { getKind: () => SK.Identifier, getText: () => 'Input' }
    const expr: MockNode = {
      getArguments: () => decoratorArgs,
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const decorator: MockNode = makeNode({ getExpression: () => expr })

    return makeNode({
      getDecorators: () => [decorator],
      getKind: () => SK.PropertyDeclaration,
      getName: () => propertyName,
      getSourceFile: () => sf,
    })
  }

  // ─── Positive cases (should trigger) ───

  it('reports @Input alias matching property name', () => {
    const result = noInputRenameRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createPropertyWithInputDecorator('title', 'title'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('redundant')
    expect(violations[0]!.message).toContain('title')
    expect(violations[0]!.ruleId).toBe('angular/no-input-rename')
    expect(violations[0]!.severity).toBe('info')
  })

  it('reports @Input alias matching for items property', () => {
    const result = noInputRenameRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createPropertyWithInputDecorator('items', 'items'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('items')
  })

  it('reports @Input alias matching for data property', () => {
    const result = noInputRenameRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createPropertyWithInputDecorator('data', 'data'), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports multiple redundant aliases independently', () => {
    const result = noInputRenameRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createPropertyWithInputDecorator('title', 'title'), emptyContext)
    visitor.visitNode!(createPropertyWithInputDecorator('name', 'name'), emptyContext)
    visitor.visitNode!(createPropertyWithInputDecorator('label', 'label'), emptyContext)

    expect(result.onComplete!()).toHaveLength(3)
  })

  it('includes suggestion to remove alias', () => {
    const result = noInputRenameRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createPropertyWithInputDecorator('data', 'data'), emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('@Input() data')
  })

  // ─── Negative cases (should NOT trigger) ───

  it('does not report @Input with different alias', () => {
    const result = noInputRenameRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createPropertyWithInputDecorator('myTitle', 'title'), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report @Input without arguments', () => {
    const result = noInputRenameRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createPropertyWithInputDecorator('title', null), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-property-declaration nodes', () => {
    const result = noInputRenameRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report property without decorators', () => {
    const result = noInputRenameRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getDecorators: () => [],
      getKind: () => SK.PropertyDeclaration,
      getName: () => 'title',
    })
    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report decorator with non-Input name', () => {
    const result = noInputRenameRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee: MockNode = { getKind: () => SK.Identifier, getText: () => 'Output' }
    const strLit: MockNode = { getKind: () => SK.StringLiteral, getLiteralValue: () => 'myOutput' }
    const expr: MockNode = {
      getArguments: () => [strLit],
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const decorator: MockNode = { getExpression: () => expr }
    const node = makeNode({
      getDecorators: () => [decorator],
      getKind: () => SK.PropertyDeclaration,
      getName: () => 'myOutput',
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when decorator expression is not a call expression', () => {
    const result = noInputRenameRule.create({})
    const visitor = looseVisitor(result.visitor)

    const decorator: MockNode = { getExpression: () => ({ getKind: () => SK.Identifier }) }
    const node = makeNode({
      getDecorators: () => [decorator],
      getKind: () => SK.PropertyDeclaration,
      getName: () => 'title',
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when callee is not an identifier', () => {
    const result = noInputRenameRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee: MockNode = { getKind: () => SK.PropertyAccessExpression }
    const expr: MockNode = {
      getArguments: () => [],
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const decorator: MockNode = { getExpression: () => expr }
    const node = makeNode({
      getDecorators: () => [decorator],
      getKind: () => SK.PropertyDeclaration,
      getName: () => 'title',
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when first arg is not a string literal', () => {
    const result = noInputRenameRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee: MockNode = { getKind: () => SK.Identifier, getText: () => 'Input' }
    const expr: MockNode = {
      getArguments: () => [{ getKind: () => SK.Identifier }],
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const decorator: MockNode = { getExpression: () => expr }
    const node = makeNode({
      getDecorators: () => [decorator],
      getKind: () => SK.PropertyDeclaration,
      getName: () => 'title',
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noInputRenameRule.meta.category).toBe('patterns')
    expect(noInputRenameRule.meta.name).toBe('angular/no-input-rename')
    expect(noInputRenameRule.meta.recommended).toBe(true)
    expect(noInputRenameRule.meta.severity).toBe('info')
  })
})

// ─── Section: angular/prefer-on-push ───

describe('angular/prefer-on-push', () => {
  function createComponentClassNode(
    decoratorConfig: 'none' | 'with-change-detection' | 'empty-args' | 'non-object-arg' | 'with-other-props',
  ): MockNode {
    const sf = createSourceFileMock()
    const decoratorArgs: MockNode[] = []

    if (decoratorConfig === 'with-change-detection') {
      const changeDetectionProp: MockNode = {
        getKind: () => SK.PropertyAssignment,
        getName: () => 'changeDetection',
      }
      const otherProp: MockNode = {
        getKind: () => SK.PropertyAssignment,
        getName: () => 'selector',
      }
      const objLit: MockNode = {
        getKind: () => SK.ObjectLiteralExpression,
        getProperties: () => [otherProp, changeDetectionProp],
      }
      decoratorArgs.push(objLit)
    } else if (decoratorConfig === 'none') {
      const selectorProp: MockNode = {
        getKind: () => SK.PropertyAssignment,
        getName: () => 'selector',
      }
      const objLit: MockNode = {
        getKind: () => SK.ObjectLiteralExpression,
        getProperties: () => [selectorProp],
      }
      decoratorArgs.push(objLit)
    } else if (decoratorConfig === 'with-other-props') {
      const templateProp: MockNode = {
        getKind: () => SK.PropertyAssignment,
        getName: () => 'template',
      }
      const objLit: MockNode = {
        getKind: () => SK.ObjectLiteralExpression,
        getProperties: () => [templateProp],
      }
      decoratorArgs.push(objLit)
    } else if (decoratorConfig === 'empty-args') {
      // no args
    } else if (decoratorConfig === 'non-object-arg') {
      decoratorArgs.push({ getKind: () => SK.Identifier })
    }

    const callee: MockNode = {
      getKind: () => SK.Identifier,
      getText: () => 'Component',
    }
    const expression: MockNode = {
      getArguments: () => decoratorArgs,
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const decorator: MockNode = {
      getExpression: () => expression,
    }

    return makeNode({
      getDecorators: () => [decorator],
      getKind: () => SK.ClassDeclaration,
      getSourceFile: () => sf,
    })
  }

  // ─── Positive cases (should trigger) ───

  it('reports component without changeDetection', () => {
    const result = preferOnPushRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createComponentClassNode('none'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('OnPush')
    expect(violations[0]!.ruleId).toBe('angular/prefer-on-push')
    expect(violations[0]!.severity).toBe('info')
  })

  it('reports component with other props but no changeDetection', () => {
    const result = preferOnPushRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createComponentClassNode('with-other-props'), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports multiple components without changeDetection', () => {
    const result = preferOnPushRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createComponentClassNode('none'), emptyContext)
    visitor.visitNode!(createComponentClassNode('with-other-props'), emptyContext)

    expect(result.onComplete!()).toHaveLength(2)
  })

  it('includes suggestion in violation', () => {
    const result = preferOnPushRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createComponentClassNode('none'), emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('ChangeDetectionStrategy.OnPush')
  })

  // ─── Negative cases (should NOT trigger) ───

  it('does not report component with changeDetection', () => {
    const result = preferOnPushRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createComponentClassNode('with-change-detection'), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-class-declaration nodes', () => {
    const result = preferOnPushRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report class without decorators', () => {
    const result = preferOnPushRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getDecorators: () => [],
      getKind: () => SK.ClassDeclaration,
    })
    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report decorator with non-Component name', () => {
    const result = preferOnPushRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee: MockNode = { getKind: () => SK.Identifier, getText: () => 'Injectable' }
    const expr: MockNode = {
      getArguments: () => [],
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const decorator: MockNode = { getExpression: () => expr }
    const node = makeNode({
      getDecorators: () => [decorator],
      getKind: () => SK.ClassDeclaration,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when decorator expression is not a call expression', () => {
    const result = preferOnPushRule.create({})
    const visitor = looseVisitor(result.visitor)

    const decorator: MockNode = { getExpression: () => ({ getKind: () => SK.Identifier }) }
    const node = makeNode({
      getDecorators: () => [decorator],
      getKind: () => SK.ClassDeclaration,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when callee is not an identifier', () => {
    const result = preferOnPushRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee: MockNode = { getKind: () => SK.PropertyAccessExpression }
    const expr: MockNode = {
      getArguments: () => [],
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const decorator: MockNode = { getExpression: () => expr }
    const node = makeNode({
      getDecorators: () => [decorator],
      getKind: () => SK.ClassDeclaration,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when decorator has empty args', () => {
    const result = preferOnPushRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createComponentClassNode('empty-args'), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when first arg is not an object literal', () => {
    const result = preferOnPushRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createComponentClassNode('non-object-arg'), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-PropertyAssignment props in decorator', () => {
    const result = preferOnPushRule.create({})
    const visitor = looseVisitor(result.visitor)

    const spreadProp: MockNode = {
      getKind: () => SK.Identifier,
    }
    const objLit: MockNode = {
      getKind: () => SK.ObjectLiteralExpression,
      getProperties: () => [spreadProp],
    }
    const callee: MockNode = {
      getKind: () => SK.Identifier,
      getText: () => 'Component',
    }
    const expression: MockNode = {
      getArguments: () => [objLit],
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const decorator: MockNode = { getExpression: () => expression }
    const node = makeNode({
      getDecorators: () => [decorator],
      getKind: () => SK.ClassDeclaration,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(1)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(preferOnPushRule.meta.category).toBe('performance')
    expect(preferOnPushRule.meta.name).toBe('angular/prefer-on-push')
    expect(preferOnPushRule.meta.recommended).toBe(true)
    expect(preferOnPushRule.meta.severity).toBe('info')
  })
})

// ─── Section: angular/no-services-in-component ───

describe('angular/no-services-in-component', () => {
  function createConstructorNode(paramCount: number): MockNode {
    const params = Array.from({ length: paramCount }, (_, i) => ({ getName: () => `param${i}` }))
    return makeNode({
      getKind: () => SK.Constructor,
      getParameters: () => params,
    })
  }

  // ─── Positive cases (should trigger) ───

  it('reports constructor with more than 5 service injections', () => {
    const result = noServicesInComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createConstructorNode(6), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('6')
    expect(violations[0]!.message).toContain('5')
    expect(violations[0]!.ruleId).toBe('angular/no-services-in-component')
    expect(violations[0]!.severity).toBe('warning')
  })

  it('reports constructor with 10 service injections', () => {
    const result = noServicesInComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createConstructorNode(10), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('10')
  })

  it('reports constructor with 20 service injections', () => {
    const result = noServicesInComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createConstructorNode(20), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports multiple constructors independently', () => {
    const result = noServicesInComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createConstructorNode(7), emptyContext)
    visitor.visitNode!(createConstructorNode(8), emptyContext)

    expect(result.onComplete!()).toHaveLength(2)
  })

  it('includes suggestion in violation', () => {
    const result = noServicesInComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createConstructorNode(6), emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('facade')
    expect(violations[0]!.suggestion).toContain('composition')
  })

  // ─── Negative cases (should NOT trigger) ───

  it('does not report constructor with exactly 5 service injections', () => {
    const result = noServicesInComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createConstructorNode(5), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report constructor with fewer than 5 service injections', () => {
    const result = noServicesInComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createConstructorNode(3), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report constructor with zero parameters', () => {
    const result = noServicesInComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createConstructorNode(0), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report constructor with 1 parameter', () => {
    const result = noServicesInComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createConstructorNode(1), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Custom max option ───

  it('respects custom max option of 3', () => {
    const result = noServicesInComponentRule.create({ max: 3 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createConstructorNode(4), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('4')
    expect(violations[0]!.message).toContain('3')
  })

  it('does not report with custom max when within limit', () => {
    const result = noServicesInComponentRule.create({ max: 3 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createConstructorNode(3), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report with custom max of 1 and 1 parameter', () => {
    const result = noServicesInComponentRule.create({ max: 1 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createConstructorNode(1), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports with custom max of 1 and 2 parameters', () => {
    const result = noServicesInComponentRule.create({ max: 1 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createConstructorNode(2), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  // ─── Edge cases ───

  it('does not report non-constructor nodes', () => {
    const result = noServicesInComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.ClassDeclaration }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report identifier nodes', () => {
    const result = noServicesInComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report method declaration nodes', () => {
    const result = noServicesInComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.MethodDeclaration }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noServicesInComponentRule.meta.category).toBe('complexity')
    expect(noServicesInComponentRule.meta.name).toBe('angular/no-services-in-component')
    expect(noServicesInComponentRule.meta.recommended).toBe(true)
    expect(noServicesInComponentRule.meta.severity).toBe('warning')
  })

  it('has default options with max 5', () => {
    expect(noServicesInComponentRule.defaultOptions.max).toBe(5)
  })
})
