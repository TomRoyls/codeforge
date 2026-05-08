import { describe, it, expect } from 'vitest'
import { SuggestionEngine } from '../../src/core/fixer/suggestion-engine.js'
import type { FixTemplate } from '../../src/core/fixer/suggestion-engine.js'
import type { FixSuggestion, FixPlan, FixerConfig } from '../../src/core/fixer/types.js'
import { DEFAULT_FIXER_CONFIG, CONFIDENCE_ORDER } from '../../src/core/fixer/types.js'

describe('SuggestionEngine', () => {
  describe('constructor', () => {
    it('should create engine with default config', () => {
      const engine = new SuggestionEngine()
      const config = engine.getConfig()
      expect(config.autoApplySafe).toBe(false)
      expect(config.maxSuggestionsPerFile).toBe(50)
      expect(config.minConfidence).toBe('suggested')
      expect(config.excludedRules).toEqual([])
      expect(config.includedCategories).toEqual([])
    })

    it('should create engine with custom config', () => {
      const engine = new SuggestionEngine({ autoApplySafe: true, maxSuggestionsPerFile: 10 })
      const config = engine.getConfig()
      expect(config.autoApplySafe).toBe(true)
      expect(config.maxSuggestionsPerFile).toBe(10)
    })

    it('should register default templates', () => {
      const engine = new SuggestionEngine()
      const templates = engine.getTemplates()
      expect(templates.has('prefer-const')).toBe(true)
      expect(templates.has('no-console')).toBe(true)
      expect(templates.has('no-unused-var')).toBe(true)
      expect(templates.has('no-eval')).toBe(true)
      expect(templates.has('max-params')).toBe(true)
      expect(templates.has('no-any')).toBe(true)
      expect(templates.has('eq-eq-eq')).toBe(true)
    })
  })

  describe('generateSuggestion', () => {
    it('should generate suggestion for prefer-const violation', () => {
      const engine = new SuggestionEngine()
      const suggestion = engine.generateSuggestion({
        ruleId: 'prefer-const',
        filePath: 'test.ts',
        line: 5,
        column: 0,
        message: 'Use const instead of let',
      })
      expect(suggestion).not.toBeNull()
      expect(suggestion!.confidence).toBe('safe')
      expect(suggestion!.category).toBe('formatting')
      expect(suggestion!.risk).toBe('low')
      expect(suggestion!.ruleId).toBe('prefer-const')
    })

    it('should generate suggestion for no-console violation', () => {
      const engine = new SuggestionEngine()
      const suggestion = engine.generateSuggestion({
        ruleId: 'no-console',
        filePath: 'test.ts',
        line: 3,
        column: 0,
        message: 'Unexpected console statement',
      })
      expect(suggestion).not.toBeNull()
      expect(suggestion!.confidence).toBe('suggested')
      expect(suggestion!.category).toBe('refactor')
    })

    it('should generate suggestion for no-unused-var violation', () => {
      const engine = new SuggestionEngine()
      const suggestion = engine.generateSuggestion({
        ruleId: 'no-unused-var',
        filePath: 'test.ts',
        line: 10,
        column: 4,
        message: 'Unused variable x',
      })
      expect(suggestion).not.toBeNull()
      expect(suggestion!.confidence).toBe('suggested')
      expect(suggestion!.category).toBe('refactor')
    })

    it('should generate suggestion for no-eval violation', () => {
      const engine = new SuggestionEngine()
      const suggestion = engine.generateSuggestion({
        ruleId: 'no-eval',
        filePath: 'test.ts',
        line: 7,
        column: 0,
        message: 'eval can be harmful',
      })
      expect(suggestion).not.toBeNull()
      expect(suggestion!.confidence).toBe('unsafe')
      expect(suggestion!.category).toBe('security')
    })

    it('should generate suggestion for max-params violation', () => {
      const engine = new SuggestionEngine()
      const suggestion = engine.generateSuggestion({
        ruleId: 'max-params',
        filePath: 'test.ts',
        line: 2,
        column: 0,
        message: 'Too many parameters',
      })
      expect(suggestion).not.toBeNull()
      expect(suggestion!.confidence).toBe('manual')
      expect(suggestion!.category).toBe('refactor')
    })

    it('should generate suggestion for no-any violation', () => {
      const engine = new SuggestionEngine()
      const suggestion = engine.generateSuggestion({
        ruleId: 'no-any',
        filePath: 'test.ts',
        line: 8,
        column: 10,
        message: 'Unexpected any',
      })
      expect(suggestion).not.toBeNull()
      expect(suggestion!.confidence).toBe('manual')
      expect(suggestion!.category).toBe('type-fix')
    })

    it('should generate suggestion for eq-eq-eq violation', () => {
      const engine = new SuggestionEngine()
      const suggestion = engine.generateSuggestion({
        ruleId: 'eq-eq-eq',
        filePath: 'test.ts',
        line: 4,
        column: 0,
        message: 'Expected === instead of ==',
      })
      expect(suggestion).not.toBeNull()
      expect(suggestion!.confidence).toBe('safe')
      expect(suggestion!.category).toBe('type-fix')
    })

    it('should generate generic suggestion for unknown rule', () => {
      const engine = new SuggestionEngine()
      const suggestion = engine.generateSuggestion({
        ruleId: 'custom-unknown-rule',
        filePath: 'test.ts',
        line: 1,
        column: 0,
        message: 'Some custom violation',
      })
      expect(suggestion).not.toBeNull()
      expect(suggestion!.confidence).toBe('manual')
      expect(suggestion!.ruleId).toBe('custom-unknown-rule')
    })

    it('should return suggestion with unique id', () => {
      const engine = new SuggestionEngine()
      const s1 = engine.generateSuggestion({
        ruleId: 'prefer-const',
        filePath: 'a.ts',
        line: 1,
        column: 0,
        message: 'Use const',
      })
      const s2 = engine.generateSuggestion({
        ruleId: 'prefer-const',
        filePath: 'a.ts',
        line: 2,
        column: 0,
        message: 'Use const',
      })
      expect(s1!.id).not.toBe(s2!.id)
    })

    it('should include patch in suggestion', () => {
      const engine = new SuggestionEngine()
      const suggestion = engine.generateSuggestion({
        ruleId: 'prefer-const',
        filePath: 'test.ts',
        line: 5,
        column: 2,
        message: 'Use const',
      })
      expect(suggestion!.patch).toBeDefined()
      expect(suggestion!.patch.startLine).toBe(5)
      expect(suggestion!.patch.startColumn).toBe(2)
    })
  })

  describe('generateSuggestions', () => {
    it('should group violations by file', () => {
      const engine = new SuggestionEngine()
      const plans = engine.generateSuggestions([
        { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'Use const', severity: 'warning' },
        { ruleId: 'prefer-const', filePath: 'b.ts', line: 1, column: 0, message: 'Use const', severity: 'warning' },
      ])
      expect(plans.length).toBe(2)
      expect(plans[0]!.filePath).toBe('a.ts')
      expect(plans[1]!.filePath).toBe('b.ts')
    })

    it('should create FixPlan per file with correct counts', () => {
      const engine = new SuggestionEngine()
      const plans = engine.generateSuggestions([
        { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'Use const', severity: 'warning' },
        { ruleId: 'no-console', filePath: 'a.ts', line: 2, column: 0, message: 'Console', severity: 'warning' },
      ])
      expect(plans.length).toBe(1)
      expect(plans[0]!.totalFixCount).toBe(2)
      expect(plans[0]!.safeFixCount).toBe(1)
    })

    it('should respect maxSuggestionsPerFile', () => {
      const engine = new SuggestionEngine({ maxSuggestionsPerFile: 2 })
      const violations = Array.from({ length: 10 }, (_, i) => ({
        ruleId: 'prefer-const',
        filePath: 'a.ts',
        line: i + 1,
        column: 0,
        message: 'Use const',
        severity: 'warning',
      }))
      const plans = engine.generateSuggestions(violations)
      expect(plans[0]!.suggestions.length).toBe(2)
    })

    it('should exclude rules in excludedRules config', () => {
      const engine = new SuggestionEngine({ excludedRules: ['prefer-const'] })
      const plans = engine.generateSuggestions([
        { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'Use const', severity: 'warning' },
        { ruleId: 'eq-eq-eq', filePath: 'a.ts', line: 2, column: 0, message: 'Use ===', severity: 'warning' },
      ])
      expect(plans[0]!.suggestions.length).toBe(1)
      expect(plans[0]!.suggestions[0]!.ruleId).toBe('eq-eq-eq')
    })

    it('should filter by includedCategories when specified', () => {
      const engine = new SuggestionEngine({ includedCategories: ['formatting'] })
      const plans = engine.generateSuggestions([
        { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'Use const', severity: 'warning' },
        { ruleId: 'no-console', filePath: 'a.ts', line: 2, column: 0, message: 'Console', severity: 'warning' },
      ])
      expect(plans[0]!.suggestions.length).toBe(1)
      expect(plans[0]!.suggestions[0]!.category).toBe('formatting')
    })

    it('should include riskAssessment in plans', () => {
      const engine = new SuggestionEngine()
      const plans = engine.generateSuggestions([
        { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'Use const', severity: 'warning' },
      ])
      expect(plans[0]!.riskAssessment).toBeDefined()
      expect(plans[0]!.riskAssessment.level).toBe('low')
    })

    it('should handle empty violations array', () => {
      const engine = new SuggestionEngine()
      const plans = engine.generateSuggestions([])
      expect(plans).toEqual([])
    })

    it('should estimate time saved', () => {
      const engine = new SuggestionEngine()
      const plans = engine.generateSuggestions([
        { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'Use const', severity: 'warning' },
        { ruleId: 'eq-eq-eq', filePath: 'a.ts', line: 2, column: 0, message: 'Use ===', severity: 'warning' },
      ])
      expect(plans[0]!.estimatedTimeSaved).toBe(1)
    })
  })

  describe('applyFix', () => {
    it('should apply a single-line fix', () => {
      const engine = new SuggestionEngine()
      const source = 'let x = 1;\nlet y = 2;'
      const suggestion: FixSuggestion = {
        id: 'fix-test',
        ruleId: 'prefer-const',
        filePath: 'test.ts',
        line: 1,
        column: 0,
        message: 'Use const',
        confidence: 'safe',
        category: 'formatting',
        risk: 'low',
        patch: { startLine: 1, startColumn: 0, endLine: 1, endColumn: 10, replacement: 'const x = 1;' },
        description: 'Replace let with const',
        beforeCode: 'let x = 1;',
        afterCode: 'const x = 1;',
      }
      const result = engine.applyFix(source, suggestion)
      expect(result).toBe('const x = 1;\nlet y = 2;')
    })

    it('should apply fix to second line', () => {
      const engine = new SuggestionEngine()
      const source = 'let x = 1;\nlet y = 2;'
      const suggestion: FixSuggestion = {
        id: 'fix-test',
        ruleId: 'prefer-const',
        filePath: 'test.ts',
        line: 2,
        column: 0,
        message: 'Use const',
        confidence: 'safe',
        category: 'formatting',
        risk: 'low',
        patch: { startLine: 2, startColumn: 0, endLine: 2, endColumn: 10, replacement: 'const y = 2;' },
        description: 'Replace let with const',
        beforeCode: 'let y = 2;',
        afterCode: 'const y = 2;',
      }
      const result = engine.applyFix(source, suggestion)
      expect(result).toBe('let x = 1;\nconst y = 2;')
    })

    it('should return source unchanged for out-of-bounds line', () => {
      const engine = new SuggestionEngine()
      const source = 'let x = 1;'
      const suggestion: FixSuggestion = {
        id: 'fix-test',
        ruleId: 'prefer-const',
        filePath: 'test.ts',
        line: 100,
        column: 0,
        message: 'Use const',
        confidence: 'safe',
        category: 'formatting',
        risk: 'low',
        patch: { startLine: 100, startColumn: 0, endLine: 100, endColumn: 3, replacement: 'const' },
        description: 'Replace let with const',
        beforeCode: 'let',
        afterCode: 'const',
      }
      const result = engine.applyFix(source, suggestion)
      expect(result).toBe('let x = 1;')
    })
  })

  describe('applySafeFixes', () => {
    it('should apply only safe fixes in reverse line order', () => {
      const engine = new SuggestionEngine()
      const source = 'let x = 1;\nconsole.log(x);\nlet y = 2;'
      const plan: FixPlan = {
        filePath: 'test.ts',
        suggestions: [
          {
            id: 'fix-1',
            ruleId: 'prefer-const',
            filePath: 'test.ts',
            line: 1,
            column: 0,
            message: 'Use const',
            confidence: 'safe',
            category: 'formatting',
            risk: 'low',
            patch: { startLine: 1, startColumn: 0, endLine: 1, endColumn: 10, replacement: 'const x = 1;' },
            description: 'Replace let with const',
            beforeCode: 'let x = 1;',
            afterCode: 'const x = 1;',
          },
          {
            id: 'fix-2',
            ruleId: 'no-console',
            filePath: 'test.ts',
            line: 2,
            column: 0,
            message: 'Console',
            confidence: 'suggested',
            category: 'refactor',
            risk: 'low',
            patch: { startLine: 2, startColumn: 0, endLine: 2, endColumn: 14, replacement: '// removed' },
            description: 'Remove console',
            beforeCode: 'console.log(x);',
            afterCode: '// removed',
          },
          {
            id: 'fix-3',
            ruleId: 'prefer-const',
            filePath: 'test.ts',
            line: 3,
            column: 0,
            message: 'Use const',
            confidence: 'safe',
            category: 'formatting',
            risk: 'low',
            patch: { startLine: 3, startColumn: 0, endLine: 3, endColumn: 10, replacement: 'const y = 2;' },
            description: 'Replace let with const',
            beforeCode: 'let y = 2;',
            afterCode: 'const y = 2;',
          },
        ],
        safeFixCount: 2,
        totalFixCount: 3,
        estimatedTimeSaved: 1.5,
        riskAssessment: { level: 'low', factors: [], affectedLines: 3, breakingChanges: false, requiresReview: false },
      }
      const result = engine.applySafeFixes(source, plan)
      expect(result).toContain('const x = 1;')
      expect(result).toContain('console.log(x)')
      expect(result).toContain('const y = 2;')
    })

    it('should return source unchanged if no safe fixes', () => {
      const engine = new SuggestionEngine()
      const source = 'eval("test");'
      const plan: FixPlan = {
        filePath: 'test.ts',
        suggestions: [
          {
            id: 'fix-1',
            ruleId: 'no-eval',
            filePath: 'test.ts',
            line: 1,
            column: 0,
            message: 'eval',
            confidence: 'unsafe',
            category: 'security',
            risk: 'medium',
            patch: { startLine: 1, startColumn: 0, endLine: 1, endColumn: 13, replacement: 'Function("test")' },
            description: 'Replace eval',
            beforeCode: 'eval("test");',
            afterCode: 'Function("test")',
          },
        ],
        safeFixCount: 0,
        totalFixCount: 1,
        estimatedTimeSaved: 0.5,
        riskAssessment: { level: 'medium', factors: [], affectedLines: 1, breakingChanges: false, requiresReview: true },
      }
      const result = engine.applySafeFixes(source, plan)
      expect(result).toBe(source)
    })
  })

  describe('assessRisk', () => {
    it('should return low risk for all safe fixes', () => {
      const engine = new SuggestionEngine()
      const plan: FixPlan = {
        filePath: 'test.ts',
        suggestions: [
          createSuggestion('s1', 1, 'safe'),
          createSuggestion('s2', 2, 'safe'),
        ],
        safeFixCount: 2,
        totalFixCount: 2,
        estimatedTimeSaved: 1,
        riskAssessment: { level: 'low', factors: [], affectedLines: 2, breakingChanges: false, requiresReview: false },
      }
      const risk = engine.assessRisk(plan)
      expect(risk.level).toBe('low')
      expect(risk.requiresReview).toBe(false)
    })

    it('should require review for unsafe fixes', () => {
      const engine = new SuggestionEngine()
      const plan: FixPlan = {
        filePath: 'test.ts',
        suggestions: [
          createSuggestion('s1', 1, 'unsafe'),
        ],
        safeFixCount: 0,
        totalFixCount: 1,
        estimatedTimeSaved: 0.5,
        riskAssessment: { level: 'medium', factors: [], affectedLines: 1, breakingChanges: false, requiresReview: false },
      }
      const risk = engine.assessRisk(plan)
      expect(risk.requiresReview).toBe(true)
    })

    it('should return high risk for more than 10 fixes', () => {
      const engine = new SuggestionEngine()
      const suggestions = Array.from({ length: 12 }, (_, i) => createSuggestion(`s${i}`, i + 1, 'safe'))
      const plan: FixPlan = {
        filePath: 'test.ts',
        suggestions,
        safeFixCount: 12,
        totalFixCount: 12,
        estimatedTimeSaved: 6,
        riskAssessment: { level: 'low', factors: [], affectedLines: 12, breakingChanges: false, requiresReview: false },
      }
      const risk = engine.assessRisk(plan)
      expect(risk.level).toBe('high')
    })

    it('should return medium risk for fixes spanning > 50 lines', () => {
      const engine = new SuggestionEngine()
      const suggestions = [
        createSuggestion('s1', 1, 'safe'),
        createSuggestion('s2', 55, 'safe'),
      ]
      const plan: FixPlan = {
        filePath: 'test.ts',
        suggestions,
        safeFixCount: 2,
        totalFixCount: 2,
        estimatedTimeSaved: 1,
        riskAssessment: { level: 'low', factors: [], affectedLines: 2, breakingChanges: false, requiresReview: false },
      }
      const risk = engine.assessRisk(plan)
      expect(risk.affectedLines).toBe(55)
      expect(risk.level).toBe('medium')
    })

    it('should detect overlapping fixes as high risk', () => {
      const engine = new SuggestionEngine()
      const suggestions = [
        createSuggestion('s1', 5, 'safe'),
        createSuggestion('s2', 5, 'safe'),
      ]
      const plan: FixPlan = {
        filePath: 'test.ts',
        suggestions,
        safeFixCount: 2,
        totalFixCount: 2,
        estimatedTimeSaved: 1,
        riskAssessment: { level: 'low', factors: [], affectedLines: 1, breakingChanges: false, requiresReview: false },
      }
      const risk = engine.assessRisk(plan)
      expect(risk.breakingChanges).toBe(true)
      expect(risk.level).toBe('high')
    })

    it('should include risk factors in assessment', () => {
      const engine = new SuggestionEngine()
      const plan: FixPlan = {
        filePath: 'test.ts',
        suggestions: [createSuggestion('s1', 1, 'manual')],
        safeFixCount: 0,
        totalFixCount: 1,
        estimatedTimeSaved: 0.5,
        riskAssessment: { level: 'high', factors: [], affectedLines: 1, breakingChanges: false, requiresReview: false },
      }
      const risk = engine.assessRisk(plan)
      expect(risk.factors.length).toBeGreaterThan(0)
    })
  })

  describe('prioritize', () => {
    it('should sort by confidence (safe first)', () => {
      const engine = new SuggestionEngine()
      const suggestions: FixSuggestion[] = [
        createSuggestion('s1', 1, 'unsafe'),
        createSuggestion('s2', 2, 'safe'),
        createSuggestion('s3', 3, 'manual'),
        createSuggestion('s4', 4, 'suggested'),
      ]
      const result = engine.prioritize(suggestions)
      expect(result[0]!.confidence).toBe('safe')
      expect(result[1]!.confidence).toBe('suggested')
      expect(result[2]!.confidence).toBe('unsafe')
      expect(result[3]!.confidence).toBe('manual')
    })

    it('should sort by line number when confidence is equal', () => {
      const engine = new SuggestionEngine()
      const suggestions: FixSuggestion[] = [
        createSuggestion('s1', 10, 'safe'),
        createSuggestion('s2', 3, 'safe'),
        createSuggestion('s3', 7, 'safe'),
      ]
      const result = engine.prioritize(suggestions)
      expect(result[0]!.line).toBe(3)
      expect(result[1]!.line).toBe(7)
      expect(result[2]!.line).toBe(10)
    })

    it('should not modify original array', () => {
      const engine = new SuggestionEngine()
      const suggestions: FixSuggestion[] = [
        createSuggestion('s1', 1, 'unsafe'),
        createSuggestion('s2', 2, 'safe'),
      ]
      engine.prioritize(suggestions)
      expect(suggestions[0]!.confidence).toBe('unsafe')
    })

    it('should handle empty array', () => {
      const engine = new SuggestionEngine()
      const result = engine.prioritize([])
      expect(result).toEqual([])
    })

    it('should handle single suggestion', () => {
      const engine = new SuggestionEngine()
      const suggestions = [createSuggestion('s1', 1, 'safe')]
      const result = engine.prioritize(suggestions)
      expect(result.length).toBe(1)
    })
  })

  describe('registerTemplate', () => {
    it('should register a custom template', () => {
      const engine = new SuggestionEngine()
      const template: FixTemplate = {
        ruleId: 'custom-rule',
        confidence: 'safe',
        category: 'performance',
        generateFix: () => ({ replacement: 'optimized()', description: 'Optimize call' }),
      }
      engine.registerTemplate('custom-rule', template)
      const templates = engine.getTemplates()
      expect(templates.has('custom-rule')).toBe(true)
    })

    it('should use custom template for suggestion generation', () => {
      const engine = new SuggestionEngine()
      const template: FixTemplate = {
        ruleId: 'my-custom',
        confidence: 'safe',
        category: 'security',
        generateFix: () => ({ replacement: 'secured', description: 'Apply security fix' }),
      }
      engine.registerTemplate('my-custom', template)
      const suggestion = engine.generateSuggestion({
        ruleId: 'my-custom',
        filePath: 'test.ts',
        line: 5,
        column: 0,
        message: 'Security issue',
      })
      expect(suggestion).not.toBeNull()
      expect(suggestion!.confidence).toBe('safe')
      expect(suggestion!.category).toBe('security')
      expect(suggestion!.description).toBe('Apply security fix')
    })

    it('should override existing template', () => {
      const engine = new SuggestionEngine()
      const template: FixTemplate = {
        ruleId: 'prefer-const',
        confidence: 'unsafe',
        category: 'security',
        generateFix: () => ({ replacement: 'custom', description: 'Custom fix' }),
      }
      engine.registerTemplate('prefer-const', template)
      const suggestion = engine.generateSuggestion({
        ruleId: 'prefer-const',
        filePath: 'test.ts',
        line: 1,
        column: 0,
        message: 'Use const',
      })
      expect(suggestion!.confidence).toBe('unsafe')
      expect(suggestion!.description).toBe('Custom fix')
    })
  })

  describe('getTemplates', () => {
    it('should return a copy of templates map', () => {
      const engine = new SuggestionEngine()
      const templates1 = engine.getTemplates()
      const templates2 = engine.getTemplates()
      expect(templates1).not.toBe(templates2)
    })
  })

  describe('getConfig', () => {
    it('should return a copy of config', () => {
      const engine = new SuggestionEngine()
      const config1 = engine.getConfig()
      const config2 = engine.getConfig()
      expect(config1).not.toBe(config2)
      expect(config1).toEqual(config2)
    })
  })

  describe('getFixPlan', () => {
    it('should analyze source and generate a fix plan', () => {
      const engine = new SuggestionEngine()
      const source = 'let x = 1;\nconsole.log(x);\nlet y = 2;'
      const plan = engine.getFixPlan('test.ts', source)
      expect(plan.filePath).toBe('test.ts')
      expect(plan.suggestions.length).toBeGreaterThan(0)
    })

    it('should respect maxSuggestionsPerFile', () => {
      const engine = new SuggestionEngine({ maxSuggestionsPerFile: 1 })
      const source = 'let x = 1;\nconsole.log(x);'
      const plan = engine.getFixPlan('test.ts', source)
      expect(plan.suggestions.length).toBeLessThanOrEqual(1)
    })

    it('should return empty plan for clean source', () => {
      const engine = new SuggestionEngine()
      const source = 'const x = 1;'
      const plan = engine.getFixPlan('test.ts', source)
      expect(plan.suggestions.length).toBe(0)
      expect(plan.safeFixCount).toBe(0)
    })
  })

  describe('template-based fix generation', () => {
    it('should fix prefer-const in source', () => {
      const engine = new SuggestionEngine()
      const templates = engine.getTemplates()
      const template = templates.get('prefer-const')!
      const result = template.generateFix({ line: 1, column: 0, message: '', source: 'let x = 1;' })
      expect(result).not.toBeNull()
      expect(result!.replacement).toBe('const x = 1;')
    })

    it('should fix no-console in source', () => {
      const engine = new SuggestionEngine()
      const templates = engine.getTemplates()
      const template = templates.get('no-console')!
      const result = template.generateFix({ line: 1, column: 0, message: '', source: '  console.log("test");' })
      expect(result).not.toBeNull()
      expect(result!.replacement).toContain('// console statement removed')
    })

    it('should fix no-unused-var in source', () => {
      const engine = new SuggestionEngine()
      const templates = engine.getTemplates()
      const template = templates.get('no-unused-var')!
      const result = template.generateFix({ line: 1, column: 0, message: '', source: 'const myVar = 1;' })
      expect(result).not.toBeNull()
      expect(result!.replacement).toContain('_myVar')
    })

    it('should fix no-eval in source', () => {
      const engine = new SuggestionEngine()
      const templates = engine.getTemplates()
      const template = templates.get('no-eval')!
      const result = template.generateFix({ line: 1, column: 0, message: '', source: 'eval("dangerous")' })
      expect(result).not.toBeNull()
      expect(result!.replacement).toContain('Function(')
    })

    it('should fix no-any in source', () => {
      const engine = new SuggestionEngine()
      const templates = engine.getTemplates()
      const template = templates.get('no-any')!
      const result = template.generateFix({ line: 1, column: 0, message: '', source: 'const x: any = {};' })
      expect(result).not.toBeNull()
      expect(result!.replacement).toContain(': unknown')
    })

    it('should fix eq-eq-eq in source', () => {
      const engine = new SuggestionEngine()
      const templates = engine.getTemplates()
      const template = templates.get('eq-eq-eq')!
      const result = template.generateFix({ line: 1, column: 0, message: '', source: 'if (x == 1)' })
      expect(result).not.toBeNull()
      expect(result!.replacement).toBe('if (x === 1)')
    })

    it('should return null for max-params template (manual fix)', () => {
      const engine = new SuggestionEngine()
      const templates = engine.getTemplates()
      const template = templates.get('max-params')!
      const result = template.generateFix({ line: 1, column: 0, message: '', source: 'function f(a,b,c,d,e) {}' })
      expect(result).toBeNull()
    })

    it('should return null when prefer-const finds no let', () => {
      const engine = new SuggestionEngine()
      const templates = engine.getTemplates()
      const template = templates.get('prefer-const')!
      const result = template.generateFix({ line: 1, column: 0, message: '', source: 'const x = 1;' })
      expect(result).toBeNull()
    })

    it('should return null when no-console finds no console', () => {
      const engine = new SuggestionEngine()
      const templates = engine.getTemplates()
      const template = templates.get('no-console')!
      const result = template.generateFix({ line: 1, column: 0, message: '', source: 'const x = 1;' })
      expect(result).toBeNull()
    })

    it('should return null when eq-eq-eq finds no ==', () => {
      const engine = new SuggestionEngine()
      const templates = engine.getTemplates()
      const template = templates.get('eq-eq-eq')!
      const result = template.generateFix({ line: 1, column: 0, message: '', source: 'if (x === 1)' })
      expect(result).toBeNull()
    })
  })

  describe('CONFIDENCE_ORDER', () => {
    it('should order safe as highest', () => {
      expect(CONFIDENCE_ORDER.safe).toBeGreaterThan(CONFIDENCE_ORDER.suggested)
      expect(CONFIDENCE_ORDER.suggested).toBeGreaterThan(CONFIDENCE_ORDER.unsafe)
      expect(CONFIDENCE_ORDER.unsafe).toBeGreaterThan(CONFIDENCE_ORDER.manual)
    })
  })

  describe('DEFAULT_FIXER_CONFIG', () => {
    it('should have correct defaults', () => {
      expect(DEFAULT_FIXER_CONFIG.autoApplySafe).toBe(false)
      expect(DEFAULT_FIXER_CONFIG.maxSuggestionsPerFile).toBe(50)
      expect(DEFAULT_FIXER_CONFIG.minConfidence).toBe('suggested')
      expect(DEFAULT_FIXER_CONFIG.excludedRules).toEqual([])
      expect(DEFAULT_FIXER_CONFIG.includedCategories).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('should handle violation with excluded rule through generateSuggestions', () => {
      const engine = new SuggestionEngine({ excludedRules: ['prefer-const'] })
      const plans = engine.generateSuggestions([
        { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'Use const', severity: 'warning' },
      ])
      expect(plans[0]!.suggestions.length).toBe(0)
    })

    it('should handle multiple violations on same line', () => {
      const engine = new SuggestionEngine()
      const plans = engine.generateSuggestions([
        { ruleId: 'prefer-const', filePath: 'a.ts', line: 1, column: 0, message: 'Use const', severity: 'warning' },
        { ruleId: 'eq-eq-eq', filePath: 'a.ts', line: 1, column: 5, message: 'Use ===', severity: 'warning' },
      ])
      expect(plans[0]!.suggestions.length).toBe(2)
    })

    it('should handle source with only newlines', () => {
      const engine = new SuggestionEngine()
      const plan = engine.getFixPlan('test.ts', '\n\n\n')
      expect(plan.suggestions.length).toBe(0)
    })

    it('should handle template returning null during getFixPlan', () => {
      const engine = new SuggestionEngine()
      const plan = engine.getFixPlan('test.ts', 'function f(a, b, c, d, e) { return 1; }')
      expect(plan).toBeDefined()
      expect(plan.filePath).toBe('test.ts')
    })

    it('should handle large number of files', () => {
      const engine = new SuggestionEngine()
      const violations = Array.from({ length: 100 }, (_, i) => ({
        ruleId: 'prefer-const',
        filePath: `file${i}.ts`,
        line: 1,
        column: 0,
        message: 'Use const',
        severity: 'warning',
      }))
      const plans = engine.generateSuggestions(violations)
      expect(plans.length).toBe(100)
    })
  })
})

function createSuggestion(id: string, line: number, confidence: 'safe' | 'suggested' | 'unsafe' | 'manual'): FixSuggestion {
  return {
    id,
    ruleId: 'test-rule',
    filePath: 'test.ts',
    line,
    column: 0,
    message: 'Test message',
    confidence,
    category: 'formatting',
    risk: confidence === 'safe' ? 'low' : confidence === 'unsafe' ? 'medium' : 'high',
    patch: { startLine: line, startColumn: 0, endLine: line, endColumn: 1, replacement: 'x' },
    description: `Test fix at line ${line}`,
    beforeCode: 'a',
    afterCode: 'x',
  }
}
