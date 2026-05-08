import { describe, test, expect, beforeEach } from 'vitest'
import { Project, type SourceFile } from 'ts-morph'
import { traverseAST } from '../../src/ast/visitor.js'

import { noUnusedStateRule } from '../../src/rules/frameworks/react/no-unused-state.js'
import { noMissingKeyRule } from '../../src/rules/frameworks/react/no-missing-key.js'
import { noDirectMutationRule } from '../../src/rules/frameworks/react/no-direct-mutation.js'
import { preferFunctionComponentRule } from '../../src/rules/frameworks/react/prefer-function-component.js'
import { noArrayIndexKeyRule } from '../../src/rules/frameworks/react/no-array-index-key.js'
import { reactRules } from '../../src/rules/frameworks/react/index.js'

import { noMutatingPropsRule } from '../../src/rules/frameworks/vue/no-mutating-props.js'
import { noVHtmlRule } from '../../src/rules/frameworks/vue/no-v-html.js'
import { requireDefaultPropRule } from '../../src/rules/frameworks/vue/require-default-prop.js'
import { noComputedSideEffectsRule } from '../../src/rules/frameworks/vue/no-computed-side-effects.js'
import { vueRules } from '../../src/rules/frameworks/vue/index.js'

function runRule(rule: { create: (opts: any) => { visitor: any; onComplete?: () => any } }, sourceFile: SourceFile) {
  const { visitor, onComplete } = rule.create(rule.defaultOptions ?? {})
  traverseAST(sourceFile, visitor)
  return onComplete ? onComplete() : []
}

describe('React Framework Rules', () => {
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

  describe('react/no-unused-state', () => {
    test('detects unused useState variable', () => {
      const code = `
        const [count, setCount] = useState(0);
        setCount(1);
      `
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noUnusedStateRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('react/no-unused-state')
    })

    test('does not flag used useState variable', () => {
      const code = `
        const [count, setCount] = useState(0);
        console.log(count);
      `
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noUnusedStateRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag when useState is not called', () => {
      const code = `const x = 5;`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noUnusedStateRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.tsx', '')
      const violations = runRule(noUnusedStateRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('detects multiple unused useState variables', () => {
      const code = `
        const [a, setA] = useState(1);
        const [b, setB] = useState(2);
      `
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noUnusedStateRule, sourceFile)
      expect(violations.length).toBe(2)
    })
  })

  describe('react/no-missing-key', () => {
    test('detects map without key prop returning JSX element', () => {
      const code = `items.map((item) => <div>{item}</div>)`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noMissingKeyRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('react/no-missing-key')
    })

    test('does not flag map with key prop', () => {
      const code = `items.map((item) => <div key={item.id}>{item}</div>)`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noMissingKeyRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag non-map calls', () => {
      const code = `items.filter((item) => item.active)`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noMissingKeyRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.tsx', '')
      const violations = runRule(noMissingKeyRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag map without JSX return', () => {
      const code = `items.map((item) => item.name)`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noMissingKeyRule, sourceFile)
      expect(violations.length).toBe(0)
    })
  })

  describe('react/no-direct-mutation', () => {
    test('detects direct this.state mutation', () => {
      const code = `this.state.count = 5;`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noDirectMutationRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('react/no-direct-mutation')
    })

    test('detects direct useState variable mutation', () => {
      const code = `
        const [count, setCount] = useState(0);
        count = 5;
      `
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noDirectMutationRule, sourceFile)
      expect(violations.length).toBe(1)
    })

    test('does not flag setState usage', () => {
      const code = `
        const [count, setCount] = useState(0);
        setCount(5);
      `
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noDirectMutationRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.tsx', '')
      const violations = runRule(noDirectMutationRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag regular variable assignment', () => {
      const code = `let x = 5; x = 10;`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noDirectMutationRule, sourceFile)
      expect(violations.length).toBe(0)
    })
  })

  describe('react/prefer-function-component', () => {
    test('detects class component without lifecycle or state', () => {
      const code = `
        class MyComponent extends React.Component {
          render() {
            return null;
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(preferFunctionComponentRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('react/prefer-function-component')
    })

    test('does not flag class with state', () => {
      const code = `
        class MyComponent extends React.Component {
          state = { count: 0 };
          render() {
            return null;
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(preferFunctionComponentRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag class with lifecycle method', () => {
      const code = `
        class MyComponent extends React.Component {
          componentDidMount() {}
          render() {
            return null;
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(preferFunctionComponentRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.tsx', '')
      const violations = runRule(preferFunctionComponentRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag regular class', () => {
      const code = `class MyClass {}`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(preferFunctionComponentRule, sourceFile)
      expect(violations.length).toBe(0)
    })
  })

  describe('react/no-array-index-key', () => {
    test('detects array index used as key', () => {
      const code = `items.map((item, i) => <div key={i}>{item}</div>)`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noArrayIndexKeyRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('react/no-array-index-key')
    })

    test('does not flag stable key usage', () => {
      const code = `items.map((item) => <div key={item.id}>{item}</div>)`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noArrayIndexKeyRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag map without second parameter', () => {
      const code = `items.map((item) => <div key={item}>{item}</div>)`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noArrayIndexKeyRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.tsx', '')
      const violations = runRule(noArrayIndexKeyRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('detects index named "index"', () => {
      const code = `items.map((item, index) => <div key={index}>{item}</div>)`
      const sourceFile = project.createSourceFile('/test.tsx', code)
      const violations = runRule(noArrayIndexKeyRule, sourceFile)
      expect(violations.length).toBe(1)
    })
  })

  describe('reactRules index', () => {
    test('exports all 5 React rules', () => {
      expect(Object.keys(reactRules).length).toBe(5)
      expect(reactRules['react/no-unused-state']).toBeDefined()
      expect(reactRules['react/no-missing-key']).toBeDefined()
      expect(reactRules['react/no-direct-mutation']).toBeDefined()
      expect(reactRules['react/prefer-function-component']).toBeDefined()
      expect(reactRules['react/no-array-index-key']).toBeDefined()
    })
  })
})

describe('Vue Framework Rules', () => {
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

  describe('vue/no-mutating-props', () => {
    test('detects direct prop mutation with array props', () => {
      const code = `
        export default {
          props: ['name'],
          methods: {
            doSomething() {
              this.name = 'new name';
            }
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(noMutatingPropsRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('vue/no-mutating-props')
    })

    test('does not flag reading props', () => {
      const code = `
        export default {
          props: ['name'],
          methods: {
            doSomething() {
              return this.name;
            }
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(noMutatingPropsRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('detects prop mutation with object props', () => {
      const code = `
        export default {
          props: { name: String },
          methods: {
            doSomething() {
              this.name = 'new name';
            }
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(noMutatingPropsRule, sourceFile)
      expect(violations.length).toBe(1)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.vue.ts', '')
      const violations = runRule(noMutatingPropsRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag mutation of non-prop properties', () => {
      const code = `
        export default {
          props: ['name'],
          methods: {
            doSomething() {
              this.otherProp = 'value';
            }
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(noMutatingPropsRule, sourceFile)
      expect(violations.length).toBe(0)
    })
  })

  describe('vue/no-v-html', () => {
    test('detects v-html in string literal', () => {
      const code = `const template = '<div v-html="content"></div>'`
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(noVHtmlRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('vue/no-v-html')
    })

    test('detects v-html in template expression', () => {
      const code = 'const template = `<div v-html="${content}"></div>`'
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(noVHtmlRule, sourceFile)
      expect(violations.length).toBe(1)
    })

    test('does not flag v-text usage', () => {
      const code = `const template = '<div v-text="content"></div>'`
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(noVHtmlRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.vue.ts', '')
      const violations = runRule(noVHtmlRule, sourceFile)
      expect(violations.length).toBe(0)
    })
  })

  describe('vue/require-default-prop', () => {
    test('detects prop without default or required', () => {
      const code = `
        export default {
          props: {
            name: {
              type: String,
            }
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(requireDefaultPropRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('vue/require-default-prop')
    })

    test('does not flag prop with required true', () => {
      const code = `
        export default {
          props: {
            name: {
              type: String,
              required: true,
            }
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(requireDefaultPropRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag prop with default value', () => {
      const code = `
        export default {
          props: {
            name: {
              type: String,
              default: 'hello',
            }
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(requireDefaultPropRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.vue.ts', '')
      const violations = runRule(requireDefaultPropRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('detects multiple props without default or required', () => {
      const code = `
        export default {
          props: {
            name: {
              type: String,
            },
            age: {
              type: Number,
            }
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(requireDefaultPropRule, sourceFile)
      expect(violations.length).toBe(2)
    })
  })

  describe('vue/no-computed-side-effects', () => {
    test('detects assignment in computed property', () => {
      const code = `
        export default {
          computed: {
            fullName() {
              this.sideEffect = true;
              return this.first + this.last;
            }
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(noComputedSideEffectsRule, sourceFile)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('vue/no-computed-side-effects')
    })

    test('detects side effect in arrow function computed', () => {
      const code = `
        export default {
          computed: {
            fullName: () => {
              window.counter = 0;
              return 'name';
            }
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(noComputedSideEffectsRule, sourceFile)
      expect(violations.length).toBe(1)
    })

    test('does not flag pure computed property', () => {
      const code = `
        export default {
          computed: {
            fullName() {
              return this.first + this.last;
            }
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(noComputedSideEffectsRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('handles empty file', () => {
      const sourceFile = project.createSourceFile('/test.vue.ts', '')
      const violations = runRule(noComputedSideEffectsRule, sourceFile)
      expect(violations.length).toBe(0)
    })

    test('does not flag object without computed', () => {
      const code = `
        export default {
          methods: {
            doSomething() {
              this.x = 5;
            }
          }
        }
      `
      const sourceFile = project.createSourceFile('/test.vue.ts', code)
      const violations = runRule(noComputedSideEffectsRule, sourceFile)
      expect(violations.length).toBe(0)
    })
  })

  describe('vueRules index', () => {
    test('exports all 4 Vue rules', () => {
      expect(Object.keys(vueRules).length).toBe(4)
      expect(vueRules['vue/no-mutating-props']).toBeDefined()
      expect(vueRules['vue/no-v-html']).toBeDefined()
      expect(vueRules['vue/require-default-prop']).toBeDefined()
      expect(vueRules['vue/no-computed-side-effects']).toBeDefined()
    })
  })
})

describe('Cross-framework edge cases', () => {
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

  test('React rules do not crash on Vue-like code', () => {
    const code = `
      export default {
        props: ['name'],
        computed: {
          greeting() {
            return 'Hello ' + this.name;
          }
        }
      }
    `
    const sourceFile = project.createSourceFile('/test.ts', code)
    expect(() => runRule(noUnusedStateRule, sourceFile)).not.toThrow()
    expect(() => runRule(noMissingKeyRule, sourceFile)).not.toThrow()
  })

  test('Vue rules do not crash on React-like code', () => {
    const code = `
      const [count, setCount] = useState(0);
      return <div>{count}</div>;
    `
    const sourceFile = project.createSourceFile('/test.tsx', code)
    expect(() => runRule(noMutatingPropsRule, sourceFile)).not.toThrow()
    expect(() => runRule(noVHtmlRule, sourceFile)).not.toThrow()
  })

  test('all React rules handle completely empty source', () => {
    const sourceFile = project.createSourceFile('/empty.ts', '')
    expect(runRule(noUnusedStateRule, sourceFile)).toEqual([])
    expect(runRule(noMissingKeyRule, sourceFile)).toEqual([])
    expect(runRule(noDirectMutationRule, sourceFile)).toEqual([])
    expect(runRule(preferFunctionComponentRule, sourceFile)).toEqual([])
    expect(runRule(noArrayIndexKeyRule, sourceFile)).toEqual([])
  })

  test('all Vue rules handle completely empty source', () => {
    const sourceFile = project.createSourceFile('/empty.ts', '')
    expect(runRule(noMutatingPropsRule, sourceFile)).toEqual([])
    expect(runRule(noVHtmlRule, sourceFile)).toEqual([])
    expect(runRule(requireDefaultPropRule, sourceFile)).toEqual([])
    expect(runRule(noComputedSideEffectsRule, sourceFile)).toEqual([])
  })

  test('React rules handle code with only comments', () => {
    const code = '// just a comment'
    const sourceFile = project.createSourceFile('/comment.ts', code)
    expect(runRule(noUnusedStateRule, sourceFile)).toEqual([])
    expect(runRule(noMissingKeyRule, sourceFile)).toEqual([])
  })

  test('Vue rules handle code with only comments', () => {
    const code = '// just a comment'
    const sourceFile = project.createSourceFile('/comment.ts', code)
    expect(runRule(noMutatingPropsRule, sourceFile)).toEqual([])
    expect(runRule(noVHtmlRule, sourceFile)).toEqual([])
  })

  test('react/no-missing-key detects list items without key', () => {
    const code = 'list.map((item) => <li>{item}</li>)'
    const sourceFile = project.createSourceFile('/test.tsx', code)
    const violations = runRule(noMissingKeyRule, sourceFile)
    expect(violations.length).toBe(1)
  })

  test('react/no-direct-mutation detects compound assignment on state', () => {
    const code = 'this.state.count += 1;'
    const sourceFile = project.createSourceFile('/test.tsx', code)
    const violations = runRule(noDirectMutationRule, sourceFile)
    expect(violations.length).toBe(1)
  })

  test('react/no-array-index-key detects idx parameter as key', () => {
    const code = 'items.map((item, idx) => <div key={idx}>{item}</div>)'
    const sourceFile = project.createSourceFile('/test.tsx', code)
    const violations = runRule(noArrayIndexKeyRule, sourceFile)
    expect(violations.length).toBe(1)
  })

  test('vue/no-mutating-props detects plus-equals mutation', () => {
    const code = `
      export default {
        props: ['count'],
        methods: {
          increment() {
            this.count += 1;
          }
        }
      }
    `
    const sourceFile = project.createSourceFile('/test.vue.ts', code)
    const violations = runRule(noMutatingPropsRule, sourceFile)
    expect(violations.length).toBe(1)
  })

  test('vue/no-computed-side-effects detects plus-equals in computed', () => {
    const code = `
      export default {
        computed: {
          total() {
            this.sum += 1;
            return this.sum;
          }
        }
      }
    `
    const sourceFile = project.createSourceFile('/test.vue.ts', code)
    const violations = runRule(noComputedSideEffectsRule, sourceFile)
    expect(violations.length).toBe(1)
  })

  test('vue/require-default-prop handles mixed props correctly', () => {
    const code = `
      export default {
        props: {
          name: {
            type: String,
            required: true,
          },
          age: {
            type: Number,
          },
          email: {
            type: String,
            default: '',
          }
        }
      }
    `
    const sourceFile = project.createSourceFile('/test.vue.ts', code)
    const violations = runRule(requireDefaultPropRule, sourceFile)
    expect(violations.length).toBe(1)
    expect(violations[0].message).toContain('age')
  })

  test('react/prefer-function-component detects PureComponent without state', () => {
    const code = `
      class MyComponent extends React.PureComponent {
        render() {
          return null;
        }
      }
    `
    const sourceFile = project.createSourceFile('/test.tsx', code)
    const violations = runRule(preferFunctionComponentRule, sourceFile)
    expect(violations.length).toBe(1)
  })

  test('react/no-unused-state does not flag when state is used in expression', () => {
    const code = `
      const [name, setName] = useState('');
      const greeting = 'Hello ' + name;
    `
    const sourceFile = project.createSourceFile('/test.tsx', code)
    const violations = runRule(noUnusedStateRule, sourceFile)
    expect(violations.length).toBe(0)
  })
})
