import { describe, it, expect } from 'vitest'
import { CodeLinter } from '../../src/core/code-linter/code-linter.js'
import type { LintRule, LintViolation, LintSeverity } from '../../src/core/code-linter/types.js'

describe('CodeLinter', () => {
  describe('construction', () => {
    it('should initialize with default config', () => {
      const linter = new CodeLinter()
      const config = linter.getConfig()
      expect(config.maxViolations).toBe(-1)
      expect(config.ignorePatterns).toEqual([])
      expect(config.failOnWarnings).toBe(false)
    })

    it('should initialize with custom config', () => {
      const linter = new CodeLinter({ maxViolations: 10, failOnWarnings: true })
      const config = linter.getConfig()
      expect(config.maxViolations).toBe(10)
      expect(config.failOnWarnings).toBe(true)
    })

    it('should register 6 built-in rules', () => {
      const linter = new CodeLinter()
      const rules = linter.getRules()
      expect(rules).toHaveLength(6)
    })

    it('should have correct built-in rule ids', () => {
      const linter = new CodeLinter()
      const rules = linter.getRules()
      const ids = rules.map((r) => r.id)
      expect(ids).toContain('no-trailing-spaces')
      expect(ids).toContain('no-tabs')
      expect(ids).toContain('max-line-length')
      expect(ids).toContain('no-console')
      expect(ids).toContain('no-debugger')
      expect(ids).toContain('no-unused-var')
    })

    it('should accept config with custom rules', () => {
      const customRule: LintRule = {
        id: 'custom-test',
        description: 'Test rule',
        severity: 'info',
        check: () => [],
      }
      const linter = new CodeLinter({ rules: [customRule] })
      const rules = linter.getRules()
      expect(rules).toHaveLength(7)
      expect(rules.map((r) => r.id)).toContain('custom-test')
    })
  })

  describe('built-in rules', () => {
    describe('no-trailing-spaces', () => {
      it('should detect trailing spaces', () => {
        const linter = new CodeLinter()
        const result = linter.lint('hello   \nworld')
        expect(result.violations).toHaveLength(1)
        expect(result.violations[0]!.ruleId).toBe('no-trailing-spaces')
        expect(result.violations[0]!.column).toBe(6)
      })

      it('should detect trailing tabs', () => {
        const linter = new CodeLinter()
        const result = linter.lint('hello\t\nworld')
        const trailing = result.violations.filter((v) => v.ruleId === 'no-trailing-spaces')
        expect(trailing).toHaveLength(1)
      })

      it('should not flag clean lines', () => {
        const linter = new CodeLinter()
        const result = linter.lint('hello\nworld')
        const trailing = result.violations.filter((v) => v.ruleId === 'no-trailing-spaces')
        expect(trailing).toHaveLength(0)
      })

      it('should provide a fix suggestion', () => {
        const linter = new CodeLinter()
        const result = linter.lint('hello   ')
        expect(result.violations[0]!.fix).toBe('hello')
      })
    })

    describe('no-tabs', () => {
      it('should detect tab character', () => {
        const linter = new CodeLinter()
        const result = linter.lint('hello\tworld')
        const tabs = result.violations.filter((v) => v.ruleId === 'no-tabs')
        expect(tabs).toHaveLength(1)
        expect(tabs[0]!.column).toBe(6)
      })

      it('should detect multiple tabs', () => {
        const linter = new CodeLinter()
        const result = linter.lint('\thello\tworld\t')
        const tabs = result.violations.filter((v) => v.ruleId === 'no-tabs')
        expect(tabs).toHaveLength(3)
        expect(tabs[0]!.column).toBe(1)
        expect(tabs[1]!.column).toBe(7)
        expect(tabs[2]!.column).toBe(13)
      })

      it('should not flag lines without tabs', () => {
        const linter = new CodeLinter()
        const result = linter.lint('hello world')
        const tabs = result.violations.filter((v) => v.ruleId === 'no-tabs')
        expect(tabs).toHaveLength(0)
      })

      it('should report correct column positions', () => {
        const linter = new CodeLinter()
        const result = linter.lint('a\tb\tc')
        const tabs = result.violations.filter((v) => v.ruleId === 'no-tabs')
        expect(tabs[0]!.column).toBe(2)
        expect(tabs[1]!.column).toBe(4)
      })
    })

    describe('max-line-length', () => {
      it('should detect lines over 120 chars', () => {
        const linter = new CodeLinter()
        const longLine = 'a'.repeat(121)
        const result = linter.lint(longLine)
        const length = result.violations.filter((v) => v.ruleId === 'max-line-length')
        expect(length).toHaveLength(1)
        expect(length[0]!.message).toContain('121')
      })

      it('should not flag lines at exactly 120 chars', () => {
        const linter = new CodeLinter()
        const line = 'a'.repeat(120)
        const result = linter.lint(line)
        const length = result.violations.filter((v) => v.ruleId === 'max-line-length')
        expect(length).toHaveLength(0)
      })

      it('should not flag short lines', () => {
        const linter = new CodeLinter()
        const result = linter.lint('short line')
        const length = result.violations.filter((v) => v.ruleId === 'max-line-length')
        expect(length).toHaveLength(0)
      })
    })

    describe('no-console', () => {
      it('should detect console.log', () => {
        const linter = new CodeLinter()
        const result = linter.lint('console.log("hello")')
        const console_ = result.violations.filter((v) => v.ruleId === 'no-console')
        expect(console_).toHaveLength(1)
        expect(console_[0]!.message).toContain('log')
      })

      it('should detect console.warn', () => {
        const linter = new CodeLinter()
        const result = linter.lint('console.warn("watch out")')
        const console_ = result.violations.filter((v) => v.ruleId === 'no-console')
        expect(console_).toHaveLength(1)
        expect(console_[0]!.message).toContain('warn')
      })

      it('should detect console.error', () => {
        const linter = new CodeLinter()
        const result = linter.lint('console.error("oops")')
        const console_ = result.violations.filter((v) => v.ruleId === 'no-console')
        expect(console_).toHaveLength(1)
        expect(console_[0]!.message).toContain('error')
      })

      it('should not flag lines without console calls', () => {
        const linter = new CodeLinter()
        const result = linter.lint('const x = 1')
        const console_ = result.violations.filter((v) => v.ruleId === 'no-console')
        expect(console_).toHaveLength(0)
      })

      it('should report correct column position', () => {
        const linter = new CodeLinter()
        const result = linter.lint('  console.log("hello")')
        const console_ = result.violations.filter((v) => v.ruleId === 'no-console')
        expect(console_[0]!.column).toBe(3)
      })
    })

    describe('no-debugger', () => {
      it('should detect debugger statement', () => {
        const linter = new CodeLinter()
        const result = linter.lint('debugger;')
        const dbg = result.violations.filter((v) => v.ruleId === 'no-debugger')
        expect(dbg).toHaveLength(1)
        expect(dbg[0]!.column).toBe(1)
      })

      it('should not flag lines without debugger', () => {
        const linter = new CodeLinter()
        const result = linter.lint('const x = 1')
        const dbg = result.violations.filter((v) => v.ruleId === 'no-debugger')
        expect(dbg).toHaveLength(0)
      })

      it('should have error severity', () => {
        const linter = new CodeLinter()
        const result = linter.lint('debugger;')
        const dbg = result.violations.find((v) => v.ruleId === 'no-debugger')
        expect(dbg!.severity).toBe('error')
      })
    })

    describe('no-unused-var', () => {
      it('should detect var keyword', () => {
        const linter = new CodeLinter()
        const result = linter.lint('var x = 1')
        const var_ = result.violations.filter((v) => v.ruleId === 'no-unused-var')
        expect(var_).toHaveLength(1)
        expect(var_[0]!.column).toBe(1)
      })

      it('should not flag let keyword', () => {
        const linter = new CodeLinter()
        const result = linter.lint('let x = 1')
        const var_ = result.violations.filter((v) => v.ruleId === 'no-unused-var')
        expect(var_).toHaveLength(0)
      })

      it('should not flag const keyword', () => {
        const linter = new CodeLinter()
        const result = linter.lint('const x = 1')
        const var_ = result.violations.filter((v) => v.ruleId === 'no-unused-var')
        expect(var_).toHaveLength(0)
      })

      it('should not flag variable keyword', () => {
        const linter = new CodeLinter()
        const result = linter.lint('const variable = 1')
        const var_ = result.violations.filter((v) => v.ruleId === 'no-unused-var')
        expect(var_).toHaveLength(0)
      })
    })
  })

  describe('lint', () => {
    it('should return no violations for clean code', () => {
      const linter = new CodeLinter()
      const result = linter.lint('const x = 1\nconst y = 2\nreturn x + y')
      expect(result.violations).toHaveLength(0)
      expect(result.errorCount).toBe(0)
      expect(result.warningCount).toBe(0)
    })

    it('should detect single violation', () => {
      const linter = new CodeLinter()
      const result = linter.lint('var x = 1')
      expect(result.violations).toHaveLength(1)
      expect(result.violations[0]!.ruleId).toBe('no-unused-var')
    })

    it('should detect multiple violations', () => {
      const linter = new CodeLinter()
      const result = linter.lint('var x = 1\nconsole.log(x)')
      expect(result.violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should count violations by severity', () => {
      const linter = new CodeLinter()
      const result = linter.lint('debugger;\nconsole.log("hi")')
      expect(result.errorCount).toBe(1)
      expect(result.warningCount).toBeGreaterThanOrEqual(1)
    })

    it('should count total lines correctly', () => {
      const linter = new CodeLinter()
      const result = linter.lint('line1\nline2\nline3')
      expect(result.totalLines).toBe(3)
    })

    it('should handle empty code string', () => {
      const linter = new CodeLinter()
      const result = linter.lint('')
      expect(result.totalLines).toBe(1)
      expect(result.violations).toHaveLength(0)
    })

    it('should respect maxViolations config', () => {
      const linter = new CodeLinter({ maxViolations: 1 })
      const result = linter.lint('var x = 1\nconsole.log(x)\ndebugger;')
      expect(result.violations).toHaveLength(1)
    })

    it('should handle code with all violation types', () => {
      const linter = new CodeLinter()
      const longLine = 'a'.repeat(150)
      const code = `var x = 1   \nconsole.log(x)\ndebugger;\n\tindented\n${longLine}`
      const result = linter.lint(code)
      expect(result.violations.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('lintLine', () => {
    it('should return empty array for clean line', () => {
      const linter = new CodeLinter()
      const violations = linter.lintLine('const x = 1', 1)
      expect(violations).toHaveLength(0)
    })

    it('should detect violations on single line', () => {
      const linter = new CodeLinter()
      const violations = linter.lintLine('var x = 1', 5)
      expect(violations).toHaveLength(1)
      expect(violations[0]!.line).toBe(5)
    })

    it('should use provided line number', () => {
      const linter = new CodeLinter()
      const violations = linter.lintLine('debugger;', 42)
      expect(violations[0]!.line).toBe(42)
    })

    it('should detect multiple violations on one line', () => {
      const linter = new CodeLinter()
      const violations = linter.lintLine('var x = 1; console.log(x)', 1)
      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should skip lines matching ignore patterns', () => {
      const linter = new CodeLinter({ ignorePatterns: ['console'] })
      const violations = linter.lintLine('console.log("debug")', 1)
      expect(violations).toHaveLength(0)
    })
  })

  describe('custom rules', () => {
    it('should add a custom rule successfully', () => {
      const linter = new CodeLinter()
      const rule: LintRule = {
        id: 'custom-rule',
        description: 'Custom test rule',
        severity: 'info',
        check: (line, lineNumber) => {
          if (line.includes('TODO')) {
            return [
              {
                ruleId: 'custom-rule',
                message: 'TODO found',
                line: lineNumber,
                column: line.indexOf('TODO') + 1,
                severity: 'info' as LintSeverity,
              },
            ]
          }
          return []
        },
      }
      const result = linter.addRule(rule)
      expect(result).toBe(true)
    })

    it('should use custom rule in linting', () => {
      const linter = new CodeLinter()
      const rule: LintRule = {
        id: 'no-todo',
        description: 'No TODO comments',
        severity: 'info',
        check: (line, lineNumber) => {
          if (line.includes('TODO')) {
            return [
              {
                ruleId: 'no-todo',
                message: 'TODO found',
                line: lineNumber,
                column: line.indexOf('TODO') + 1,
                severity: 'info' as LintSeverity,
              },
            ]
          }
          return []
        },
      }
      linter.addRule(rule)
      const lintResult = linter.lint('// TODO: fix this')
      const todoViolations = lintResult.violations.filter((v) => v.ruleId === 'no-todo')
      expect(todoViolations).toHaveLength(1)
    })

    it('should return false for duplicate rule id', () => {
      const linter = new CodeLinter()
      const rule: LintRule = {
        id: 'no-debugger',
        description: 'Duplicate',
        severity: 'warning',
        check: () => [],
      }
      const result = linter.addRule(rule)
      expect(result).toBe(false)
    })

    it('should return false for duplicate builtin rule id', () => {
      const linter = new CodeLinter()
      const rule: LintRule = {
        id: 'no-console',
        description: 'Duplicate',
        severity: 'warning',
        check: () => [],
      }
      expect(linter.addRule(rule)).toBe(false)
    })

    it('should remove a custom rule', () => {
      const linter = new CodeLinter()
      const rule: LintRule = {
        id: 'temp-rule',
        description: 'Temporary',
        severity: 'info',
        check: () => [],
      }
      linter.addRule(rule)
      expect(linter.getRules()).toHaveLength(7)
      const removed = linter.removeRule('temp-rule')
      expect(removed).toBe(true)
      expect(linter.getRules()).toHaveLength(6)
    })

    it('should return false when removing non-existent rule', () => {
      const linter = new CodeLinter()
      const removed = linter.removeRule('non-existent')
      expect(removed).toBe(false)
    })

    it('should include custom rules in getRules', () => {
      const linter = new CodeLinter()
      const rule: LintRule = {
        id: 'my-rule',
        description: 'My rule',
        severity: 'warning',
        check: () => [],
      }
      linter.addRule(rule)
      const rules = linter.getRules()
      const ids = rules.map((r) => r.id)
      expect(ids).toContain('my-rule')
    })

    it('should retrieve custom rule by id', () => {
      const linter = new CodeLinter()
      const rule: LintRule = {
        id: 'findable-rule',
        description: 'Find me',
        severity: 'info',
        check: () => [],
      }
      linter.addRule(rule)
      const found = linter.getRule('findable-rule')
      expect(found).toBeDefined()
      expect(found!.id).toBe('findable-rule')
    })
  })

  describe('getRule', () => {
    it('should return builtin rule by id', () => {
      const linter = new CodeLinter()
      const rule = linter.getRule('no-debugger')
      expect(rule).toBeDefined()
      expect(rule!.id).toBe('no-debugger')
      expect(rule!.severity).toBe('error')
    })

    it('should return undefined for unknown rule', () => {
      const linter = new CodeLinter()
      const rule = linter.getRule('non-existent')
      expect(rule).toBeUndefined()
    })
  })

  describe('hasViolations', () => {
    it('should return true when violations exist', () => {
      const linter = new CodeLinter()
      const result = linter.lint('debugger;')
      expect(linter.hasViolations(result)).toBe(true)
    })

    it('should return false when no violations', () => {
      const linter = new CodeLinter()
      const result = linter.lint('const x = 1')
      expect(linter.hasViolations(result)).toBe(false)
    })
  })

  describe('hasErrors', () => {
    it('should return true when errors exist', () => {
      const linter = new CodeLinter()
      const result = linter.lint('debugger;')
      expect(linter.hasErrors(result)).toBe(true)
    })

    it('should return false when only warnings', () => {
      const linter = new CodeLinter()
      const result = linter.lint('console.log("hi")')
      expect(linter.hasErrors(result)).toBe(false)
    })

    it('should return false when no violations', () => {
      const linter = new CodeLinter()
      const result = linter.lint('const x = 1')
      expect(linter.hasErrors(result)).toBe(false)
    })
  })

  describe('getViolationsBySeverity', () => {
    it('should filter by error severity', () => {
      const linter = new CodeLinter()
      const result = linter.lint('debugger;\nconsole.log("hi")')
      const errors = linter.getViolationsBySeverity(result, 'error')
      expect(errors.every((v) => v.severity === 'error')).toBe(true)
      expect(errors.length).toBeGreaterThanOrEqual(1)
    })

    it('should filter by warning severity', () => {
      const linter = new CodeLinter()
      const result = linter.lint('console.log("hi")\nvar x = 1')
      const warnings = linter.getViolationsBySeverity(result, 'warning')
      expect(warnings.every((v) => v.severity === 'warning')).toBe(true)
      expect(warnings.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty for non-matching severity', () => {
      const linter = new CodeLinter()
      const result = linter.lint('console.log("hi")')
      const infos = linter.getViolationsBySeverity(result, 'info')
      expect(infos).toHaveLength(0)
    })
  })

  describe('getViolationsByRule', () => {
    it('should filter by rule id', () => {
      const linter = new CodeLinter()
      const result = linter.lint('var x = 1\nconsole.log(x)')
      const varViolations = linter.getViolationsByRule(result, 'no-unused-var')
      expect(varViolations).toHaveLength(1)
      expect(varViolations.every((v) => v.ruleId === 'no-unused-var')).toBe(true)
    })

    it('should return empty for non-matching rule', () => {
      const linter = new CodeLinter()
      const result = linter.lint('const x = 1')
      const matches = linter.getViolationsByRule(result, 'no-debugger')
      expect(matches).toHaveLength(0)
    })

    it('should handle multiple violations from same rule', () => {
      const linter = new CodeLinter()
      const result = linter.lint('var x = 1\nvar y = 2\nvar z = 3')
      const varViolations = linter.getViolationsByRule(result, 'no-unused-var')
      expect(varViolations).toHaveLength(3)
    })
  })

  describe('countByRule', () => {
    it('should count violations by rule', () => {
      const linter = new CodeLinter()
      const result = linter.lint('var x = 1\nvar y = 2\nconsole.log(x)')
      const counts = linter.countByRule(result.violations)
      expect(counts.get('no-unused-var')).toBe(2)
      expect(counts.get('no-console')).toBe(1)
    })

    it('should return empty map for no violations', () => {
      const linter = new CodeLinter()
      const counts = linter.countByRule([])
      expect(counts.size).toBe(0)
    })

    it('should handle multiple rules', () => {
      const linter = new CodeLinter()
      const violations: LintViolation[] = [
        { ruleId: 'a', message: 'a', line: 1, column: 1, severity: 'error' },
        { ruleId: 'a', message: 'a', line: 2, column: 1, severity: 'error' },
        { ruleId: 'b', message: 'b', line: 3, column: 1, severity: 'warning' },
      ]
      const counts = linter.countByRule(violations)
      expect(counts.get('a')).toBe(2)
      expect(counts.get('b')).toBe(1)
    })
  })

  describe('countBySeverity', () => {
    it('should count violations by severity', () => {
      const linter = new CodeLinter()
      const result = linter.lint('debugger;\nconsole.log("hi")\nvar x = 1')
      const counts = linter.countBySeverity(result.violations)
      expect(counts.error).toBeGreaterThanOrEqual(1)
      expect(counts.warning).toBeGreaterThanOrEqual(1)
    })

    it('should return zeros for no violations', () => {
      const linter = new CodeLinter()
      const counts = linter.countBySeverity([])
      expect(counts.error).toBe(0)
      expect(counts.warning).toBe(0)
      expect(counts.info).toBe(0)
    })

    it('should return all severity keys', () => {
      const linter = new CodeLinter()
      const counts = linter.countBySeverity([])
      expect(counts).toHaveProperty('error')
      expect(counts).toHaveProperty('warning')
      expect(counts).toHaveProperty('info')
    })
  })

  describe('getConfig', () => {
    it('should return current config', () => {
      const linter = new CodeLinter({ maxViolations: 5 })
      const config = linter.getConfig()
      expect(config.maxViolations).toBe(5)
    })

    it('should return defensive copy', () => {
      const linter = new CodeLinter()
      const config = linter.getConfig()
      config.maxViolations = 999
      expect(linter.getConfig().maxViolations).toBe(-1)
    })

    it('should include rules array', () => {
      const customRule: LintRule = {
        id: 'config-rule',
        description: 'Config rule',
        severity: 'info',
        check: () => [],
      }
      const linter = new CodeLinter({ rules: [customRule] })
      const config = linter.getConfig()
      expect(config.rules).toHaveLength(1)
      expect(config.rules[0]!.id).toBe('config-rule')
    })
  })

  describe('reset', () => {
    it('should clear custom rules', () => {
      const linter = new CodeLinter()
      const rule: LintRule = {
        id: 'temp',
        description: 'Temp',
        severity: 'info',
        check: () => [],
      }
      linter.addRule(rule)
      expect(linter.getRules()).toHaveLength(7)
      linter.reset()
      expect(linter.getRules()).toHaveLength(6)
    })

    it('should restore default config', () => {
      const linter = new CodeLinter({ maxViolations: 5 })
      linter.reset()
      const config = linter.getConfig()
      expect(config.maxViolations).toBe(-1)
      expect(config.failOnWarnings).toBe(false)
      expect(config.ignorePatterns).toEqual([])
    })

    it('should not affect builtin rules', () => {
      const linter = new CodeLinter()
      linter.reset()
      const rule = linter.getRule('no-debugger')
      expect(rule).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle single line code without newline', () => {
      const linter = new CodeLinter()
      const result = linter.lint('const x = 1')
      expect(result.totalLines).toBe(1)
      expect(result.violations).toHaveLength(0)
    })

    it('should handle code ending with newline', () => {
      const linter = new CodeLinter()
      const result = linter.lint('const x = 1\n')
      expect(result.totalLines).toBe(2)
    })

    it('should handle very long lines', () => {
      const linter = new CodeLinter()
      const longLine = 'x'.repeat(500)
      const result = linter.lint(longLine)
      const length = result.violations.filter((v) => v.ruleId === 'max-line-length')
      expect(length).toHaveLength(1)
    })

    it('should handle code with no issues', () => {
      const linter = new CodeLinter()
      const result = linter.lint('const a = 1\nconst b = 2\nconst c = a + b')
      expect(result.violations).toHaveLength(0)
      expect(result.errorCount).toBe(0)
      expect(result.warningCount).toBe(0)
      expect(result.infoCount).toBe(0)
    })

    it('should handle lines with multiple issues', () => {
      const linter = new CodeLinter()
      const longLine = 'a'.repeat(150)
      const result = linter.lint(`var x = ${longLine}`)
      expect(result.violations.length).toBeGreaterThanOrEqual(2)
    })

    it('should ignore lines matching ignorePatterns', () => {
      const linter = new CodeLinter({ ignorePatterns: ['debugger'] })
      const result = linter.lint('debugger;')
      expect(result.violations).toHaveLength(0)
    })

    it('should handle mixed severity violations', () => {
      const linter = new CodeLinter()
      const result = linter.lint('debugger;\nvar x = 1\nconsole.log(x)')
      expect(result.errorCount).toBeGreaterThanOrEqual(1)
      expect(result.warningCount).toBeGreaterThanOrEqual(1)
    })

    it('should handle maxViolations of 0', () => {
      const linter = new CodeLinter({ maxViolations: 0 })
      const result = linter.lint('debugger;\nconsole.log("hi")')
      expect(result.violations).toHaveLength(0)
    })

    it('should handle multiple ignorePatterns', () => {
      const linter = new CodeLinter({ ignorePatterns: ['debugger', 'console'] })
      const result = linter.lint('debugger;\nconsole.log("hi")\nvar x = 1')
      expect(result.violations).toHaveLength(1)
    })

    it('should handle code with only whitespace', () => {
      const linter = new CodeLinter()
      const result = linter.lint('   \n\t\n')
      expect(result.totalLines).toBe(3)
      expect(result.violations.length).toBeGreaterThan(0)
    })

    it('should not flag var inside word variable', () => {
      const linter = new CodeLinter()
      const result = linter.lint('const variable = 1')
      const var_ = result.violations.filter((v) => v.ruleId === 'no-unused-var')
      expect(var_).toHaveLength(0)
    })

    it('should handle console with space before parens', () => {
      const linter = new CodeLinter()
      const result = linter.lint('console.log ("hello")')
      const console_ = result.violations.filter((v) => v.ruleId === 'no-console')
      expect(console_).toHaveLength(1)
    })

    it('should provide correct column for indented debugger', () => {
      const linter = new CodeLinter()
      const result = linter.lint('  debugger;')
      const dbg = result.violations.find((v) => v.ruleId === 'no-debugger')
      expect(dbg!.column).toBe(3)
    })

    it('should handle rule with info severity from custom rule', () => {
      const linter = new CodeLinter()
      const rule: LintRule = {
        id: 'info-rule',
        description: 'Info rule',
        severity: 'info',
        check: (line, lineNumber): LintViolation[] => {
          if (line.includes('INFO')) {
            return [
              {
                ruleId: 'info-rule',
                message: 'Info marker found',
                line: lineNumber,
                column: line.indexOf('INFO') + 1,
                severity: 'info' as LintSeverity,
              },
            ]
          }
          return []
        },
      }
      linter.addRule(rule)
      const result = linter.lint('const INFO = "info"')
      expect(result.infoCount).toBe(1)
    })
  })
})
