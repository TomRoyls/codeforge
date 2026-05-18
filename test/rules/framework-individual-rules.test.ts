/**
 * Tests for the 17 framework-specific rule modules.
 *
 * These rules export {@link RuleDefinition} objects (not `analyze*` functions),
 * so we validate their meta properties, default options, and the visitor contract
 * returned by `create()`.
 */

import { describe, expect, it } from 'vitest'

import type { RuleDefinition, RuleOptions } from '../../src/rules/types.js'

import { noEmptyMethodRule } from '../../src/rules/frameworks/angular/no-empty-method.js'
import { noInputRenameRule } from '../../src/rules/frameworks/angular/no-input-rename.js'
import { noServicesInComponentRule } from '../../src/rules/frameworks/angular/no-services-in-component.js'
import { preferOnPushRule } from '../../src/rules/frameworks/angular/prefer-on-push.js'
import { noArrayIndexKeyRule } from '../../src/rules/frameworks/react/no-array-index-key.js'
import { noDirectMutationRule } from '../../src/rules/frameworks/react/no-direct-mutation.js'
import { noMissingKeyRule } from '../../src/rules/frameworks/react/no-missing-key.js'
import { noUnusedStateRule } from '../../src/rules/frameworks/react/no-unused-state.js'
import { preferFunctionComponentRule } from '../../src/rules/frameworks/react/prefer-function-component.js'
import { noDomManipulationRule } from '../../src/rules/frameworks/svelte/no-dom-manipulation.js'
import { noReactiveAssignmentsRule } from '../../src/rules/frameworks/svelte/no-reactive-assignments.js'
import { noUnusedStoreRule } from '../../src/rules/frameworks/svelte/no-unused-store.js'
import { preferInlineHandlerRule } from '../../src/rules/frameworks/svelte/prefer-inline-handler.js'
import { noComputedSideEffectsRule } from '../../src/rules/frameworks/vue/no-computed-side-effects.js'
import { noMutatingPropsRule } from '../../src/rules/frameworks/vue/no-mutating-props.js'
import { noVHtmlRule } from '../../src/rules/frameworks/vue/no-v-html.js'
import { requireDefaultPropRule } from '../../src/rules/frameworks/vue/require-default-prop.js'

// ─── Helpers ───

type RuleSeverity = 'error' | 'info' | 'warning'
type RuleCategory =
  | 'complexity'
  | 'correctness'
  | 'dependencies'
  | 'patterns'
  | 'performance'
  | 'security'
  | 'style'
  | 'testing'

const VALID_CATEGORIES: ReadonlySet<string> = new Set<RuleCategory>([
  'complexity',
  'correctness',
  'dependencies',
  'patterns',
  'performance',
  'security',
  'style',
  'testing',
])

const VALID_SEVERITIES: ReadonlySet<string> = new Set<RuleSeverity>([
  'error',
  'info',
  'warning',
])

interface RuleExpectation {
  category: RuleCategory
  defaultOptions: RuleOptions
  name: string
  recommended: boolean
  severity: RuleSeverity
}

function expectRuleMeta(rule: RuleDefinition<RuleOptions>, expected: RuleExpectation): void {
  expect(rule.meta.name).toBe(expected.name)
  expect(rule.meta.category).toBe(expected.category)
  expect(rule.meta.description).toBeTruthy()
  expect(typeof rule.meta.description).toBe('string')
  expect(rule.meta.severity).toBe(expected.severity)
  expect(rule.meta.recommended).toBe(expected.recommended)
  expect(VALID_CATEGORIES.has(rule.meta.category)).toBe(true)
  expect(VALID_SEVERITIES.has(rule.meta.severity!)).toBe(true)
}

function expectCreateReturnsVisitor(rule: RuleDefinition<RuleOptions>): void {
  const result = rule.create(rule.defaultOptions)
  expect(result.visitor).toBeDefined()
  expect(typeof result.visitor).toBe('object')
  expect(result.onComplete).toBeDefined()
  expect(typeof result.onComplete).toBe('function')
  const violations = result.onComplete!()
  expect(Array.isArray(violations)).toBe(true)
  expect(violations).toHaveLength(0)
}

// ─── Section: Angular ───

describe('Angular framework rules', () => {
  describe('angular/no-empty-method', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(noEmptyMethodRule, {
        category: 'patterns',
        defaultOptions: {},
        name: 'angular/no-empty-method',
        recommended: true,
        severity: 'warning',
      })
    })

    it('has correct default options', () => {
      expect(noEmptyMethodRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(noEmptyMethodRule)
    })
  })

  describe('angular/no-input-rename', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(noInputRenameRule, {
        category: 'patterns',
        defaultOptions: {},
        name: 'angular/no-input-rename',
        recommended: true,
        severity: 'info',
      })
    })

    it('has correct default options', () => {
      expect(noInputRenameRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(noInputRenameRule)
    })
  })

  describe('angular/no-services-in-component', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(noServicesInComponentRule, {
        category: 'complexity',
        defaultOptions: { max: 5 },
        name: 'angular/no-services-in-component',
        recommended: true,
        severity: 'warning',
      })
    })

    it('has default max of 5', () => {
      expect(noServicesInComponentRule.defaultOptions.max).toBe(5)
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(noServicesInComponentRule)
    })

    it('create() accepts custom max option', () => {
      const result = noServicesInComponentRule.create({ max: 3 })
      expect(result.visitor).toBeDefined()
      expect(result.onComplete!()).toEqual([])
    })
  })

  describe('angular/prefer-on-push', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(preferOnPushRule, {
        category: 'performance',
        defaultOptions: {},
        name: 'angular/prefer-on-push',
        recommended: true,
        severity: 'info',
      })
    })

    it('has correct default options', () => {
      expect(preferOnPushRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(preferOnPushRule)
    })
  })
})

// ─── Section: React ───

describe('React framework rules', () => {
  describe('react/no-array-index-key', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(noArrayIndexKeyRule, {
        category: 'performance',
        defaultOptions: {},
        name: 'react/no-array-index-key',
        recommended: true,
        severity: 'warning',
      })
    })

    it('has correct default options', () => {
      expect(noArrayIndexKeyRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(noArrayIndexKeyRule)
    })
  })

  describe('react/no-direct-mutation', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(noDirectMutationRule, {
        category: 'correctness',
        defaultOptions: {},
        name: 'react/no-direct-mutation',
        recommended: true,
        severity: 'error',
      })
    })

    it('has correct default options', () => {
      expect(noDirectMutationRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(noDirectMutationRule)
    })
  })

  describe('react/no-missing-key', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(noMissingKeyRule, {
        category: 'correctness',
        defaultOptions: {},
        name: 'react/no-missing-key',
        recommended: true,
        severity: 'error',
      })
    })

    it('has correct default options', () => {
      expect(noMissingKeyRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(noMissingKeyRule)
    })
  })

  describe('react/no-unused-state', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(noUnusedStateRule, {
        category: 'correctness',
        defaultOptions: {},
        name: 'react/no-unused-state',
        recommended: true,
        severity: 'warning',
      })
    })

    it('has correct default options', () => {
      expect(noUnusedStateRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(noUnusedStateRule)
    })
  })

  describe('react/prefer-function-component', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(preferFunctionComponentRule, {
        category: 'patterns',
        defaultOptions: {},
        name: 'react/prefer-function-component',
        recommended: false,
        severity: 'info',
      })
    })

    it('has correct default options', () => {
      expect(preferFunctionComponentRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(preferFunctionComponentRule)
    })
  })
})

// ─── Section: Svelte ───

describe('Svelte framework rules', () => {
  describe('svelte/no-dom-manipulation', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(noDomManipulationRule, {
        category: 'patterns',
        defaultOptions: {},
        name: 'svelte/no-dom-manipulation',
        recommended: true,
        severity: 'warning',
      })
    })

    it('has correct default options', () => {
      expect(noDomManipulationRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(noDomManipulationRule)
    })
  })

  describe('svelte/no-reactive-assignments', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(noReactiveAssignmentsRule, {
        category: 'correctness',
        defaultOptions: {},
        name: 'svelte/no-reactive-assignments',
        recommended: true,
        severity: 'error',
      })
    })

    it('has correct default options', () => {
      expect(noReactiveAssignmentsRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(noReactiveAssignmentsRule)
    })
  })

  describe('svelte/no-unused-store', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(noUnusedStoreRule, {
        category: 'correctness',
        defaultOptions: {},
        name: 'svelte/no-unused-store',
        recommended: true,
        severity: 'warning',
      })
    })

    it('has correct default options', () => {
      expect(noUnusedStoreRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(noUnusedStoreRule)
    })
  })

  describe('svelte/prefer-inline-handler', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(preferInlineHandlerRule, {
        category: 'patterns',
        defaultOptions: {},
        name: 'svelte/prefer-inline-handler',
        recommended: true,
        severity: 'info',
      })
    })

    it('has correct default options', () => {
      expect(preferInlineHandlerRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(preferInlineHandlerRule)
    })
  })
})

// ─── Section: Vue ───

describe('Vue framework rules', () => {
  describe('vue/no-computed-side-effects', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(noComputedSideEffectsRule, {
        category: 'correctness',
        defaultOptions: {},
        name: 'vue/no-computed-side-effects',
        recommended: true,
        severity: 'warning',
      })
    })

    it('has correct default options', () => {
      expect(noComputedSideEffectsRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(noComputedSideEffectsRule)
    })
  })

  describe('vue/no-mutating-props', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(noMutatingPropsRule, {
        category: 'correctness',
        defaultOptions: {},
        name: 'vue/no-mutating-props',
        recommended: true,
        severity: 'error',
      })
    })

    it('has correct default options', () => {
      expect(noMutatingPropsRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(noMutatingPropsRule)
    })
  })

  describe('vue/no-v-html', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(noVHtmlRule, {
        category: 'security',
        defaultOptions: {},
        name: 'vue/no-v-html',
        recommended: true,
        severity: 'warning',
      })
    })

    it('has correct default options', () => {
      expect(noVHtmlRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(noVHtmlRule)
    })
  })

  describe('vue/require-default-prop', () => {
    it('has correct meta properties', () => {
      expectRuleMeta(requireDefaultPropRule, {
        category: 'patterns',
        defaultOptions: {},
        name: 'vue/require-default-prop',
        recommended: false,
        severity: 'info',
      })
    })

    it('has correct default options', () => {
      expect(requireDefaultPropRule.defaultOptions).toEqual({})
    })

    it('create() returns visitor with onComplete that yields empty array', () => {
      expectCreateReturnsVisitor(requireDefaultPropRule)
    })
  })
})

// ─── Section: Cross-cutting contract tests ───

describe('All framework rules share a consistent contract', () => {
  const allRules: ReadonlyArray<{ name: string; rule: RuleDefinition<RuleOptions> }> = [
    { name: 'angular/no-empty-method', rule: noEmptyMethodRule },
    { name: 'angular/no-input-rename', rule: noInputRenameRule },
    { name: 'angular/no-services-in-component', rule: noServicesInComponentRule },
    { name: 'angular/prefer-on-push', rule: preferOnPushRule },
    { name: 'react/no-array-index-key', rule: noArrayIndexKeyRule },
    { name: 'react/no-direct-mutation', rule: noDirectMutationRule },
    { name: 'react/no-missing-key', rule: noMissingKeyRule },
    { name: 'react/no-unused-state', rule: noUnusedStateRule },
    { name: 'react/prefer-function-component', rule: preferFunctionComponentRule },
    { name: 'svelte/no-dom-manipulation', rule: noDomManipulationRule },
    { name: 'svelte/no-reactive-assignments', rule: noReactiveAssignmentsRule },
    { name: 'svelte/no-unused-store', rule: noUnusedStoreRule },
    { name: 'svelte/prefer-inline-handler', rule: preferInlineHandlerRule },
    { name: 'vue/no-computed-side-effects', rule: noComputedSideEffectsRule },
    { name: 'vue/no-mutating-props', rule: noMutatingPropsRule },
    { name: 'vue/no-v-html', rule: noVHtmlRule },
    { name: 'vue/require-default-prop', rule: requireDefaultPropRule },
  ]

  it('all 17 rules are present', () => {
    expect(allRules).toHaveLength(17)
  })

  it('every rule meta.name is unique', () => {
    const names = allRules.map(({ name }) => name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('every rule meta.name matches its declared name', () => {
    for (const { name, rule } of allRules) {
      expect(rule.meta.name).toBe(name)
    }
  })

  it('every rule has a non-empty description', () => {
    for (const { name, rule } of allRules) {
      expect(rule.meta.description.length, `description for ${name}`).toBeGreaterThan(0)
    }
  })

  it('every rule has a valid category', () => {
    for (const { name, rule } of allRules) {
      expect(VALID_CATEGORIES.has(rule.meta.category), `category for ${name}`).toBe(true)
    }
  })

  it('every rule has a valid severity', () => {
    for (const { name, rule } of allRules) {
      expect(VALID_SEVERITIES.has(rule.meta.severity!), `severity for ${name}`).toBe(true)
    }
  })

  it('every rule visitor has a visitNode method', () => {
    for (const { name, rule } of allRules) {
      const result = rule.create(rule.defaultOptions)
      expect(typeof result.visitor.visitNode, `visitNode for ${name}`).toBe('function')
    }
  })

  it('every rule create() yields empty violations before any visit', () => {
    for (const { name, rule } of allRules) {
      const result = rule.create(rule.defaultOptions)
      const violations = result.onComplete!()
      expect(violations, `violations for ${name}`).toEqual([])
    }
  })

  it('every rule defaultOptions is an object (not null or undefined)', () => {
    for (const { name, rule } of allRules) {
      expect(rule.defaultOptions, `defaultOptions for ${name}`).toBeDefined()
      expect(typeof rule.defaultOptions, `typeof defaultOptions for ${name}`).toBe('object')
    }
  })
})
