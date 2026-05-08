import { describe, test, expect, beforeEach } from 'vitest'
import { Project, type SourceFile } from 'ts-morph'
import { traverseAST } from '../../src/ast/visitor.js'

import { noEmptyMethodRule } from '../../src/rules/frameworks/angular/no-empty-method.js'
import { noInputRenameRule } from '../../src/rules/frameworks/angular/no-input-rename.js'
import { preferOnPushRule } from '../../src/rules/frameworks/angular/prefer-on-push.js'
import { noServicesInComponentRule } from '../../src/rules/frameworks/angular/no-services-in-component.js'
import { angularRules } from '../../src/rules/frameworks/angular/index.js'

import { noReactiveAssignmentsRule } from '../../src/rules/frameworks/svelte/no-reactive-assignments.js'
import { noUnusedStoreRule } from '../../src/rules/frameworks/svelte/no-unused-store.js'
import { preferInlineHandlerRule } from '../../src/rules/frameworks/svelte/prefer-inline-handler.js'
import { noDomManipulationRule } from '../../src/rules/frameworks/svelte/no-dom-manipulation.js'
import { svelteRules } from '../../src/rules/frameworks/svelte/index.js'

function runRule(rule: { create: (opts: any) => { visitor: any; onComplete?: () => any }; defaultOptions?: any }, sourceFile: SourceFile) {
  const { visitor, onComplete } = rule.create(rule.defaultOptions ?? {})
  traverseAST(sourceFile, visitor)
  return onComplete ? onComplete() : []
}

describe('Angular Framework Rules', () => {
  let project: Project

  beforeEach(() => {
    project = new Project({
      skipFileDependencyResolution: true,
      skipAddingFilesFromTsConfig: true,
      compilerOptions: {
        allowJs: true,
        checkJs: false,
        experimentalDecorators: true,
      },
    })
  })

  describe('angular/no-empty-method', () => {
    test('detects empty ngOnInit', () => {
      const code = `
        class MyComponent implements OnInit {
          ngOnInit() {}
        }
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noEmptyMethodRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('angular/no-empty-method')
    })

    test('detects empty ngOnDestroy', () => {
      const code = `
        class MyComponent implements OnDestroy {
          ngOnDestroy() {}
        }
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noEmptyMethodRule, sourceFile)
      expect(violations.length).toBe(1)
    })

    test('does not flag ngOnInit with body', () => {
      const code = `
        class MyComponent implements OnInit {
          ngOnInit() {
            this.loadData();
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noEmptyMethodRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag non-lifecycle methods', () => {
      const code = `
        class MyComponent {
          doSomething() {}
        }
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noEmptyMethodRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.ts', '')
      const violations = runRule(noEmptyMethodRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('detects multiple empty lifecycle methods', () => {
      const code = `
        class MyComponent implements OnInit, OnDestroy {
          ngOnInit() {}
          ngOnDestroy() {}
        }
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noEmptyMethodRule, sourceFile)
      expect(violations.length).toBe(2)
    })

    test('detects empty ngAfterViewInit', () => {
      const code = `
        class MyComponent {
          ngAfterViewInit() {}
        }
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noEmptyMethodRule, sourceFile)
      expect(violations.length).toBe(1)
    })

    test('does not flag unrelated code', () => {
      const code = `const x = 5;`
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noEmptyMethodRule, sourceFile)
      expect(violations.length).toBe(0)
    })
  })

  describe('angular/no-input-rename', () => {
    test('detects redundant @Input alias', () => {
      const code = `
        class MyComponent {
          @Input('name') name: string;
        }
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noInputRenameRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('angular/no-input-rename')
    })

    test('does not flag @Input without alias', () => {
      const code = `
        class MyComponent {
          @Input() name: string;
        }
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noInputRenameRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag @Input with different alias', () => {
      const code = `
        class MyComponent {
          @Input('firstName') name: string;
        }
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noInputRenameRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.ts', '')
      const violations = runRule(noInputRenameRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag unrelated decorators', () => {
      const code = `
        class MyComponent {
          @Output('name') name: string;
        }
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noInputRenameRule, sourceFile)
      expect(violations.length).toBe(0)
    })
  })

  describe('angular/prefer-on-push', () => {
    test('detects component without ChangeDetectionStrategy', () => {
      const code = `
        @Component({ template: '<div></div>' })
        class MyComponent {}
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(preferOnPushRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('angular/prefer-on-push')
    })

    test('does not flag component with ChangeDetectionStrategy', () => {
      const code = `
        @Component({ template: '<div></div>', changeDetection: ChangeDetectionStrategy.OnPush })
        class MyComponent {}
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(preferOnPushRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag non-component classes', () => {
      const code = `
        @Injectable()
        class MyService {}
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(preferOnPushRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.ts', '')
      const violations = runRule(preferOnPushRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles component with no arguments', () => {
      const code = `
        @Component()
        class MyComponent {}
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(preferOnPushRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag unrelated code', () => {
      const code = `const x = 5;`
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(preferOnPushRule, sourceFile)
      expect(violations.length).toBe(0)
    })
  })

  describe('angular/no-services-in-component', () => {
    test('detects constructor with more than 5 services', () => {
      const code = `
        class MyComponent {
          constructor(
            svc1: Service1,
            svc2: Service2,
            svc3: Service3,
            svc4: Service4,
            svc5: Service5,
            svc6: Service6
          ) {}
        }
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noServicesInComponentRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('angular/no-services-in-component')
    })

    test('does not flag constructor with 5 or fewer services', () => {
      const code = `
        class MyComponent {
          constructor(
            svc1: Service1,
            svc2: Service2,
            svc3: Service3
          ) {}
        }
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noServicesInComponentRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag constructor with exactly 5 services', () => {
      const code = `
        class MyComponent {
          constructor(
            svc1: Service1,
            svc2: Service2,
            svc3: Service3,
            svc4: Service4,
            svc5: Service5
          ) {}
        }
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noServicesInComponentRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.ts', '')
      const violations = runRule(noServicesInComponentRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag class without constructor', () => {
      const code = `class MyComponent {}`
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noServicesInComponentRule, sourceFile)
      expect(violations.length).toBe(0)
    })
  })

  describe('angularRules index', () => {
    test('exports all 4 Angular rules', () => {
      expect(Object.keys(angularRules).length).toBe(4)
      expect(angularRules['angular/no-empty-method']).toBeDefined()
      expect(angularRules['angular/no-input-rename']).toBeDefined()
      expect(angularRules['angular/prefer-on-push']).toBeDefined()
      expect(angularRules['angular/no-services-in-component']).toBeDefined()
    })
  })
})

describe('Svelte Framework Rules', () => {
  let project: Project

  beforeEach(() => {
    project = new Project({
      skipFileDependencyResolution: true,
      skipAddingFilesFromTsConfig: true,
      compilerOptions: {
        allowJs: true,
        checkJs: false,
      },
    })
  })

  describe('svelte/no-reactive-assignments', () => {
    test('detects self-referencing reactive assignment', () => {
      const code = `
        $: x = x + 1;
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noReactiveAssignmentsRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('svelte/no-reactive-assignments')
    })

    test('does not flag non-self-referencing reactive assignment', () => {
      const code = `
        $: doubled = count * 2;
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noReactiveAssignmentsRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.ts', '')
      const violations = runRule(noReactiveAssignmentsRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag regular labeled statement', () => {
      const code = `
        label: for (let i = 0; i < 10; i++) {}
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noReactiveAssignmentsRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('detects plus-equals self-assignment', () => {
      const code = `
        $: x += x;
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noReactiveAssignmentsRule, sourceFile)
      expect(violations.length).toBe(1)
    })

    test('does not flag unrelated code', () => {
      const code = `const x = 5;`
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noReactiveAssignmentsRule, sourceFile)
      expect(violations.length).toBe(0)
    })
  })

  describe('svelte/no-unused-store', () => {
    test('detects unused store import', () => {
      const code = `
        import { writable, userStore } from 'svelte/store';
        const count = writable(0);
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noUnusedStoreRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('svelte/no-unused-store')
    })

    test('does not flag used store with dollar prefix', () => {
      const code = `
        import { count } from './stores';
        console.log($count);
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noUnusedStoreRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag used store directly', () => {
      const code = `
        import { count } from './stores';
        console.log(count);
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noUnusedStoreRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.ts', '')
      const violations = runRule(noUnusedStoreRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag non-store imports', () => {
      const code = `
        import { something } from './utils';
        console.log(something);
      `
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noUnusedStoreRule, sourceFile)
      expect(violations.length).toBe(0)
    })
  })

  describe('svelte/prefer-inline-handler', () => {
    test('detects arrow function wrapper for simple call in JSX attribute', () => {
      const code = `<div on:click={() => doSomething()}></div>`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(preferInlineHandlerRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('svelte/prefer-inline-handler')
    })

    test('does not flag arrow function with arguments', () => {
      const code = `<div on:click={(e) => handleClick(e)}></div>`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(preferInlineHandlerRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag direct handler reference', () => {
      const code = `<div on:click={handleClick}></div>`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(preferInlineHandlerRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.tsx', '')
      const violations = runRule(preferInlineHandlerRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag unrelated code', () => {
      const code = `const x = 5;`
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(preferInlineHandlerRule, sourceFile)
      expect(violations.length).toBe(0)
    })
  })

  describe('svelte/no-dom-manipulation', () => {
    test('detects document.getElementById', () => {
      const code = `const el = document.getElementById('myElement');`
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noDomManipulationRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('svelte/no-dom-manipulation')
    })

    test('detects document.querySelector', () => {
      const code = `const el = document.querySelector('.my-class');`
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noDomManipulationRule, sourceFile)
      expect(violations.length).toBe(1)
    })

    test('detects direct style assignment', () => {
      const code = `element.style.color = 'red';`
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noDomManipulationRule, sourceFile)
      expect(violations.length).toBe(1)
    })

    test('does not flag Svelte reactive assignment', () => {
      const code = `let color = 'red';`
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noDomManipulationRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.ts', '')
      const violations = runRule(noDomManipulationRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag unrelated code', () => {
      const code = `const x = 5;`
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noDomManipulationRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('detects document.createElement', () => {
      const code = `const div = document.createElement('div');`
      const sourceFile = project.createSourceFile('/test.ts', code)
      const violations = runRule(noDomManipulationRule, sourceFile)
      expect(violations.length).toBe(1)
    })
  })

  describe('svelteRules index', () => {
    test('exports all 4 Svelte rules', () => {
      expect(Object.keys(svelteRules).length).toBe(4)
      expect(svelteRules['svelte/no-reactive-assignments']).toBeDefined()
      expect(svelteRules['svelte/no-unused-store']).toBeDefined()
      expect(svelteRules['svelte/prefer-inline-handler']).toBeDefined()
      expect(svelteRules['svelte/no-dom-manipulation']).toBeDefined()
    })
  })
})

describe('Cross-framework edge cases (Angular + Svelte)', () => {
  let project: Project

  beforeEach(() => {
    project = new Project({
      skipFileDependencyResolution: true,
      skipAddingFilesFromTsConfig: true,
      compilerOptions: {
        allowJs: true,
        checkJs: false,
        experimentalDecorators: true,
      },
    })
  })

  test('Angular rules do not crash on Svelte-like code', () => {
    const code = `
      import { writable } from 'svelte/store';
      const count = writable(0);
      $: doubled = $count * 2;
    `
    const sourceFile = project.createSourceFile('/test.ts', code)
    expect(() => runRule(noEmptyMethodRule, sourceFile)).not.toThrow()
    expect(() => runRule(noInputRenameRule, sourceFile)).not.toThrow()
    expect(() => runRule(preferOnPushRule, sourceFile)).not.toThrow()
    expect(() => runRule(noServicesInComponentRule, sourceFile)).not.toThrow()
  })

  test('Svelte rules do not crash on Angular-like code', () => {
    const code = `
      import { Component, Input, OnInit } from '@angular/core';
      @Component({ template: '<div></div>' })
      export class MyComponent implements OnInit {
        @Input() name: string;
        ngOnInit() {}
      }
    `
    const sourceFile = project.createSourceFile('/test.ts', code)
    expect(() => runRule(noReactiveAssignmentsRule, sourceFile)).not.toThrow()
    expect(() => runRule(noUnusedStoreRule, sourceFile)).not.toThrow()
    expect(() => runRule(preferInlineHandlerRule, sourceFile)).not.toThrow()
    expect(() => runRule(noDomManipulationRule, sourceFile)).not.toThrow()
  })

  test('all Angular rules handle completely empty source', () => {
    const sourceFile = project.createSourceFile('/empty.ts', '')
    expect(runRule(noEmptyMethodRule, sourceFile)).toEqual([])
    expect(runRule(noInputRenameRule, sourceFile)).toEqual([])
    expect(runRule(preferOnPushRule, sourceFile)).toEqual([])
    expect(runRule(noServicesInComponentRule, sourceFile)).toEqual([])
  })

  test('all Svelte rules handle completely empty source', () => {
    const sourceFile = project.createSourceFile('/empty.ts', '')
    expect(runRule(noReactiveAssignmentsRule, sourceFile)).toEqual([])
    expect(runRule(noUnusedStoreRule, sourceFile)).toEqual([])
    expect(runRule(preferInlineHandlerRule, sourceFile)).toEqual([])
    expect(runRule(noDomManipulationRule, sourceFile)).toEqual([])
  })

  test('Angular rules handle code with only comments', () => {
    const code = '// just a comment'
    const sourceFile = project.createSourceFile('/comment.ts', code)
    expect(runRule(noEmptyMethodRule, sourceFile)).toEqual([])
    expect(runRule(noInputRenameRule, sourceFile)).toEqual([])
  })

  test('Svelte rules handle code with only comments', () => {
    const code = '// just a comment'
    const sourceFile = project.createSourceFile('/comment.ts', code)
    expect(runRule(noReactiveAssignmentsRule, sourceFile)).toEqual([])
    expect(runRule(noUnusedStoreRule, sourceFile)).toEqual([])
  })

  test('angular/no-empty-method detects empty ngDoCheck', () => {
    const code = `
      class MyComponent {
        ngDoCheck() {}
      }
    `
    const sourceFile = project.createSourceFile('/test.ts', code)
    const violations = runRule(noEmptyMethodRule, sourceFile)
    expect(violations.length).toBe(1)
  })

  test('angular/no-services-in-component detects 8 services', () => {
    const code = `
      class MyComponent {
        constructor(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) {}
      }
    `
    const sourceFile = project.createSourceFile('/test.ts', code)
    const violations = runRule(noServicesInComponentRule, sourceFile)
    expect(violations.length).toBe(1)
  })

  test('svelte/no-dom-manipulation detects document.getElementsByClassName', () => {
    const code = `const els = document.getElementsByClassName('active');`
    const sourceFile = project.createSourceFile('/test.ts', code)
    const violations = runRule(noDomManipulationRule, sourceFile)
    expect(violations.length).toBe(1)
  })

  test('angular/no-input-rename detects multiple redundant aliases', () => {
    const code = `
      class MyComponent {
        @Input('name') name: string;
        @Input('age') age: number;
      }
    `
    const sourceFile = project.createSourceFile('/test.ts', code)
    const violations = runRule(noInputRenameRule, sourceFile)
    expect(violations.length).toBe(2)
  })
})
