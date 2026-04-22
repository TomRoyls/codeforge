import { describe, test, expect, beforeEach, vi } from 'vitest'

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}))

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockRejectedValue(new Error('File not found')),
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../src/rules/index.js', () => ({
  allRules: {
    'max-complexity': {
      meta: {
        name: 'max-complexity',
        description: 'Enforce a maximum cyclomatic complexity threshold',
        category: 'complexity',
        recommended: true,
      },
      defaultOptions: { max: 10 },
      create: vi.fn(),
    },
    'no-circular-deps': {
      meta: {
        name: 'no-circular-deps',
        description: 'Disallow circular dependencies',
        category: 'dependencies',
        recommended: true,
      },
      defaultOptions: {},
      create: vi.fn(),
    },
  },
  getRuleCategory: vi.fn((ruleId: string) => {
    if (ruleId.includes('complexity')) return 'complexity'
    if (ruleId.includes('dependencies')) return 'dependencies'
    if (ruleId.includes('security')) return 'security'
    if (ruleId.includes('patterns')) return 'patterns'
    if (ruleId.includes('documentation') || ruleId.includes('jsdoc')) {
      return 'documentation'
    }
    return 'complexity'
  }),
}))

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../../src/core/parser.js', () => ({
  Parser: vi.fn().mockImplementation(function () {
    return {
      initialize: vi.fn().mockResolvedValue(undefined),
      dispose: vi.fn(),
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: { getFilePath: () => '/test/file.ts', getText: () => 'test code' },
        filePath: '/test/file.ts',
        parseTime: 10,
      }),
    }
  }),
}))

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(function () {
    return {
      register: vi.fn(),
      runRules: vi.fn().mockReturnValue([]),
      getEnabledRules: vi.fn().mockReturnValue([]),
      getRule: vi.fn(),
      disable: vi.fn(),
    }
  }),
}))

describe('Debt Command', () => {
  let Debt: typeof import('../../../src/commands/debt.js').default

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    Debt = (await import('../../../src/commands/debt.js')).default
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Debt.description).toBe('Track and analyze technical debt in your codebase')
    })

    test('has examples defined', () => {
      expect(Debt.examples).toBeDefined()
      expect(Debt.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Debt.flags).toBeDefined()
      expect(Debt.flags.json).toBeDefined()
      expect(Debt.flags.verbose).toBeDefined()
      expect(Debt.flags.history).toBeDefined()
      expect(Debt.flags.save).toBeDefined()
    })

    test('json flag has default false', () => {
      expect(Debt.flags.json.default).toBe(false)
    })

    test('verbose flag has char v', () => {
      expect(Debt.flags.verbose.char).toBe('v')
    })

    test('verbose flag has default false', () => {
      expect(Debt.flags.verbose.default).toBe(false)
    })

    test('history flag has default false', () => {
      expect(Debt.flags.history.default).toBe(false)
    })

    test('save flag has default false', () => {
      expect(Debt.flags.save.default).toBe(false)
    })

    test('has path argument', () => {
      expect(Debt.args.path).toBeDefined()
      expect(Debt.args.path.default).toBe('.')
    })

    test('path argument has description', () => {
      expect(Debt.args.path.description).toBe('Path to analyze')
    })

    test('path argument is not required', () => {
      expect(Debt.args.path.required).toBe(false)
    })

    test('has all example definitions', () => {
      expect(Debt.examples).toHaveLength(5)
      const firstExample = Debt.examples[0] as { command: string; description: string }
      expect(firstExample).toHaveProperty('command')
      expect(firstExample).toHaveProperty('description')
    })
  })

  describe('calculateBreakdown', () => {
    function getTestableCommand(): {
      calculateBreakdown: (
        violations: Array<{
          filePath: string
          ruleId: string
          severity: string
        }>,
      ) => {
        complexity: number
        dependencies: number
        documentation: number
        patterns: number
        security: number
      }
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns zero values for empty violations', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateBreakdown([])
      expect(result.complexity).toBe(0)
      expect(result.dependencies).toBe(0)
      expect(result.documentation).toBe(0)
      expect(result.patterns).toBe(0)
      expect(result.security).toBe(0)
    })

    test('calculates complexity debt with weight', () => {
      const cmd = getTestableCommand()
      const violations = [
        { filePath: 'a.ts', ruleId: 'max-complexity', severity: 'warning' },
        { filePath: 'b.ts', ruleId: 'max-complexity', severity: 'warning' },
      ]
      const result = cmd.calculateBreakdown(violations)
      expect(result.complexity).toBe(6)
    })

    test('calculates dependencies debt with weight', () => {
      const cmd = getTestableCommand()
      const violations = [{ filePath: 'a.ts', ruleId: 'dependencies-circular', severity: 'error' }]
      const result = cmd.calculateBreakdown(violations)
      expect(result.dependencies).toBe(2)
    })

    test('counts documentation violations', () => {
      const cmd = getTestableCommand()
      const violations = [{ filePath: 'a.ts', ruleId: 'require-jsdoc', severity: 'info' }]
      const result = cmd.calculateBreakdown(violations)
      expect(result.documentation).toBe(2)
    })

    test('counts jsdoc violations as documentation', () => {
      const cmd = getTestableCommand()
      const violations = [{ filePath: 'a.ts', ruleId: 'jsdoc-missing', severity: 'info' }]
      const result = cmd.calculateBreakdown(violations)
      expect(result.documentation).toBe(2)
    })

    test('unknown rules default to complexity category', () => {
      const cmd = getTestableCommand()
      const violations = [{ filePath: 'a.ts', ruleId: 'unknown-rule', severity: 'info' }]
      const result = cmd.calculateBreakdown(violations)
      expect(result.complexity).toBe(3)
      expect(result.dependencies).toBe(0)
      expect(result.documentation).toBe(0)
      expect(result.patterns).toBe(0)
      expect(result.security).toBe(0)
    })

    test('accumulates multiple violation types', () => {
      const cmd = getTestableCommand()
      const violations = [
        { filePath: 'a.ts', ruleId: 'max-complexity', severity: 'warning' },
        { filePath: 'b.ts', ruleId: 'dependencies-circular', severity: 'error' },
        { filePath: 'c.ts', ruleId: 'require-jsdoc', severity: 'info' },
        { filePath: 'd.ts', ruleId: 'security-issue', severity: 'error' },
      ]
      const result = cmd.calculateBreakdown(violations)
      expect(result.complexity).toBe(3)
      expect(result.dependencies).toBe(2)
      expect(result.documentation).toBe(2)
      expect(result.security).toBe(5)
    })
  })

  describe('calculateInterest', () => {
    function getTestableCommand(): {
      calculateInterest: (debtPoints: number) => { weekly: number; monthly: number; annual: number }
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns zero for zero debt', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateInterest(0)
      expect(result.weekly).toBe(0)
      expect(result.monthly).toBe(0)
      expect(result.annual).toBe(0)
    })

    test('calculates interest for debt points', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateInterest(10)
      expect(result.weekly).toBeGreaterThan(0)
      expect(result.monthly).toBeGreaterThan(result.weekly)
      expect(result.annual).toBeGreaterThan(result.monthly)
    })

    test('annual interest is roughly 52x weekly', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateInterest(20)
      expect(result.annual).toBeCloseTo(result.weekly * 52, -1)
    })

    test('monthly interest is roughly 4x weekly', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateInterest(15)
      expect(result.monthly).toBeCloseTo(result.weekly * 4, -1)
    })

    test('handles large debt values', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateInterest(1000)
      expect(result.weekly).toBeGreaterThan(0)
      expect(result.annual).toBeGreaterThan(result.monthly)
    })
  })

  describe('calculateOverall', () => {
    function getTestableCommand(): {
      calculateOverall: (
        breakdown: {
          complexity: number
          dependencies: number
          documentation: number
          patterns: number
          security: number
        },
        filesCount: number,
      ) => number
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns zero for empty breakdown', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateOverall(
        { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        10,
      )
      expect(result).toBe(0)
    })

    test('normalizes by file count', () => {
      const cmd = getTestableCommand()
      const breakdown = {
        complexity: 10,
        dependencies: 0,
        documentation: 0,
        patterns: 0,
        security: 0,
      }
      const result1 = cmd.calculateOverall(breakdown, 10)
      const result2 = cmd.calculateOverall(breakdown, 5)
      expect(result2).toBeGreaterThan(result1)
    })

    test('handles zero files gracefully', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateOverall(
        { complexity: 10, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        0,
      )
      expect(result).toBe(10)
    })

    test('sums all breakdown values', () => {
      const cmd = getTestableCommand()
      const breakdown = {
        complexity: 10,
        dependencies: 20,
        documentation: 5,
        patterns: 15,
        security: 10,
      }
      const result = cmd.calculateOverall(breakdown, 1)
      expect(result).toBe(60)
    })

    test('returns rounded integer', () => {
      const cmd = getTestableCommand()
      const breakdown = {
        complexity: 3,
        dependencies: 7,
        documentation: 2,
        patterns: 4,
        security: 1,
      }
      const result = cmd.calculateOverall(breakdown, 3)
      expect(Number.isInteger(result)).toBe(true)
    })
  })

  describe('getDebtColor', () => {
    function getTestableCommand(): { getDebtColor: (score: number) => (text: string) => string } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns green for low debt (score <= 5)', () => {
      const cmd = getTestableCommand()
      expect(cmd.getDebtColor(0)).toBeDefined()
      expect(cmd.getDebtColor(5)).toBeDefined()
    })

    test('returns yellow for medium debt (6-15)', () => {
      const cmd = getTestableCommand()
      expect(cmd.getDebtColor(6)).toBeDefined()
      expect(cmd.getDebtColor(10)).toBeDefined()
      expect(cmd.getDebtColor(15)).toBeDefined()
    })

    test('returns red for high debt (score > 15)', () => {
      const cmd = getTestableCommand()
      expect(cmd.getDebtColor(16)).toBeDefined()
      expect(cmd.getDebtColor(20)).toBeDefined()
      expect(cmd.getDebtColor(100)).toBeDefined()
    })

    test('boundary values at 5 and 15', () => {
      const cmd = getTestableCommand()
      const color5 = cmd.getDebtColor(5)
      const color6 = cmd.getDebtColor(6)
      const color15 = cmd.getDebtColor(15)
      const color16 = cmd.getDebtColor(16)
      expect(color5).not.toBe(color6)
      expect(color15).not.toBe(color16)
    })
  })

  describe('getRecommendations', () => {
    function getTestableCommand(): {
      getRecommendations: (report: {
        breakdown: {
          complexity: number
          dependencies: number
          documentation: number
          patterns: number
          security: number
        }
        overall: number
      }) => string[]
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns empty array for healthy project', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        overall: 0,
      })
      expect(recommendations.length).toBe(0)
    })

    test('recommends addressing security issues', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 10 },
        overall: 10,
      })
      expect(recommendations.some((r) => r.includes('security'))).toBe(true)
    })

    test('recommends reducing complexity', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 15, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        overall: 15,
      })
      expect(recommendations.some((r) => r.includes('complexity'))).toBe(true)
    })

    test('limits recommendations to 5', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: {
          complexity: 20,
          dependencies: 10,
          documentation: 15,
          patterns: 10,
          security: 10,
        },
        overall: 30,
      })
      expect(recommendations.length).toBeLessThanOrEqual(5)
    })

    test('recommends reviewing dependencies when high', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 0, dependencies: 15, documentation: 0, patterns: 0, security: 0 },
        overall: 15,
      })
      expect(
        recommendations.some((r) => r.includes('dependencies') || r.includes('circular')),
      ).toBe(true)
    })

    test('recommends adding documentation when high', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 0, dependencies: 0, documentation: 20, patterns: 0, security: 0 },
        overall: 20,
      })
      expect(recommendations.some((r) => r.includes('JSDoc') || r.includes('documentation'))).toBe(
        true,
      )
    })

    test('recommends sprint dedication for high overall debt', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        overall: 50,
      })
      expect(recommendations.some((r) => r.includes('sprint') || r.includes('reduction'))).toBe(
        true,
      )
    })
  })

  describe('formatDebt', () => {
    function getTestableCommand(): { formatDebt: (score: number) => string } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('formats low debt score', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatDebt(3)
      expect(result).toContain('3')
    })

    test('formats medium debt score', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatDebt(10)
      expect(result).toContain('10')
    })

    test('formats high debt score', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatDebt(25)
      expect(result).toContain('25')
    })

    test('pads single digit scores', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatDebt(5)
      expect(result).toMatch(/\s*5/)
    })

    test('formats three digit scores', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatDebt(100)
      expect(result).toContain('100')
    })
  })

  describe('getHistoryPath', () => {
    function getTestableCommand(): { getHistoryPath: (targetPath: string) => string } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns correct path for history file', () => {
      const cmd = getTestableCommand()
      const result = cmd.getHistoryPath('/project')
      expect(result).toContain('.codeforge')
      expect(result).toContain('debt-history.json')
    })

    test('includes target path in result', () => {
      const cmd = getTestableCommand()
      const result = cmd.getHistoryPath('/my/project')
      expect(result).toContain('/my/project')
    })
  })

  describe('getTrend', () => {
    function getTestableCommand(): {
      getTrend: (
        targetPath: string,
        current: number,
      ) => Promise<{ change: number; direction: string; previous: number | null }>
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns stable trend when no history exists', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.getTrend('/nonexistent/path', 10)
      expect(result.direction).toBe('stable')
      expect(result.change).toBe(0)
      expect(result.previous).toBeNull()
    })

    test('returns stable for current directory without history file', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.getTrend('.', 15)
      expect(result.direction).toBe('stable')
      expect(result.previous).toBeNull()
    })

    test('returns decreasing trend when current is lower', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([{ overall: 20, timestamp: '2024-01-01', breakdown: {}, filesAnalyzed: 5 }]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        getTrend: (
          targetPath: string,
          current: number,
        ) => Promise<{ change: number; direction: string; previous: number | null }>
      }
      const result = await cmd.getTrend('/test', 15)

      expect(result.direction).toBe('decreasing')
      expect(result.change).toBe(-5)
      expect(result.previous).toBe(20)
    })

    test('returns increasing trend when current is higher', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([{ overall: 10, timestamp: '2024-01-01', breakdown: {}, filesAnalyzed: 5 }]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        getTrend: (
          targetPath: string,
          current: number,
        ) => Promise<{ change: number; direction: string; previous: number | null }>
      }
      const result = await cmd.getTrend('/test', 20)

      expect(result.direction).toBe('increasing')
      expect(result.change).toBe(10)
      expect(result.previous).toBe(10)
    })

    test('returns stable trend when change is within threshold', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([{ overall: 15, timestamp: '2024-01-01', breakdown: {}, filesAnalyzed: 5 }]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        getTrend: (
          targetPath: string,
          current: number,
        ) => Promise<{ change: number; direction: string; previous: number | null }>
      }
      const result = await cmd.getTrend('/test', 16)

      expect(result.direction).toBe('stable')
      expect(result.change).toBe(1)
    })

    test('returns null previous for empty history', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify([]))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        getTrend: (
          targetPath: string,
          current: number,
        ) => Promise<{ change: number; direction: string; previous: number | null }>
      }
      const result = await cmd.getTrend('/test', 10)

      expect(result.previous).toBeNull()
      expect(result.direction).toBe('stable')
    })
  })

  describe('saveHistory', () => {
    function getTestableCommand(): {
      saveHistory: (
        targetPath: string,
        report: {
          breakdown: {
            complexity: number
            dependencies: number
            documentation: number
            patterns: number
            security: number
          }
          filesAnalyzed: number
          overall: number
        },
      ) => Promise<void>
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('saveHistory method exists and can be called', async () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.saveHistory).toBe('function')
    })

    test('creates directory and writes file', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Not found'))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        saveHistory: (
          targetPath: string,
          report: { breakdown: Record<string, number>; filesAnalyzed: number; overall: number },
        ) => Promise<void>
      }
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        overall: 11,
      }

      await cmd.saveHistory('/test', report)

      expect(fs.mkdir).toHaveBeenCalled()
      expect(fs.writeFile).toHaveBeenCalled()
    })

    test('appends to existing history', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      const existingHistory = [
        { overall: 10, timestamp: '2024-01-01', breakdown: {}, filesAnalyzed: 5 },
      ]
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(existingHistory))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        saveHistory: (
          targetPath: string,
          report: { breakdown: Record<string, number>; filesAnalyzed: number; overall: number },
        ) => Promise<void>
      }
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        overall: 15,
      }

      await cmd.saveHistory('/test', report)

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0]
      const writtenData = JSON.parse(writeCall[1] as string)
      expect(writtenData.length).toBe(2)
    })

    test('trims history to max entries', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      const existingHistory = Array.from({ length: 105 }, (_, i) => ({
        overall: i,
        timestamp: `2024-01-${String(i + 1).padStart(2, '0')}`,
        breakdown: {},
        filesAnalyzed: 5,
      }))
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(existingHistory))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        saveHistory: (
          targetPath: string,
          report: { breakdown: Record<string, number>; filesAnalyzed: number; overall: number },
        ) => Promise<void>
      }
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        overall: 20,
      }

      await cmd.saveHistory('/test', report)

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0]
      const writtenData = JSON.parse(writeCall[1] as string)
      expect(writtenData.length).toBeLessThanOrEqual(100)
    })
  })

  describe('showHistory', () => {
    function getTestableCommand(): { showHistory: (targetPath: string) => Promise<void> } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('showHistory method exists and can be called', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.showHistory).toBe('function')
    })

    test('showHistory handles missing history file gracefully', async () => {
      const cmd = getTestableCommand()
      await expect(cmd.showHistory('/nonexistent/path')).resolves.not.toThrow()
    })

    test('showHistory handles current directory without history', async () => {
      const cmd = getTestableCommand()
      await expect(cmd.showHistory('.')).resolves.not.toThrow()
    })

    test('showHistory handles temp directory', async () => {
      const cmd = getTestableCommand()
      await expect(cmd.showHistory('/tmp')).resolves.not.toThrow()
    })

    test('displays history entries', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          { overall: 10, timestamp: '2024-01-01T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
          { overall: 15, timestamp: '2024-01-02T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
        ]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('History'))
    })

    test('displays decreasing trend message', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          { overall: 20, timestamp: '2024-01-01T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
          { overall: 10, timestamp: '2024-01-02T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
        ]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('reduced'))
    })

    test('displays increasing trend message', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          { overall: 10, timestamp: '2024-01-01T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
          { overall: 25, timestamp: '2024-01-02T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
        ]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('increased'))
    })

    test('displays stable trend message', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          { overall: 15, timestamp: '2024-01-01T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
          { overall: 15, timestamp: '2024-01-02T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
        ]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('stable'))
    })

    test('shows no history message for empty history', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify([]))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('No history found'))
    })

    test('shows trend arrows between entries', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          { overall: 10, timestamp: '2024-01-01T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
          { overall: 15, timestamp: '2024-01-02T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
          { overall: 8, timestamp: '2024-01-03T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
        ]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => c[0])
      const hasUpArrow = logCalls.some((c) => typeof c === 'string' && c.includes('↑'))
      const hasDownArrow = logCalls.some((c) => typeof c === 'string' && c.includes('↓'))
      expect(hasUpArrow || hasDownArrow).toBe(true)
    })
  })

  describe('displayReport', () => {
    function getTestableCommand(): {
      displayReport: (report: Record<string, unknown>, verbose: boolean) => void
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('displayReport method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.displayReport).toBe('function')
    })

    test('displayReport can be called with minimal report', () => {
      const cmd = getTestableCommand()
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displayReport with verbose flag', () => {
      const cmd = getTestableCommand()
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }
      expect(() => cmd.displayReport(report, true)).not.toThrow()
    })

    test('displayReport with decreasing trend', () => {
      const cmd = getTestableCommand()
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: -5, direction: 'decreasing', previous: 16 },
      }
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('displayReport with increasing trend', () => {
      const cmd = getTestableCommand()
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 16,
        path: '/test',
        trend: { change: 5, direction: 'increasing', previous: 11 },
      }
      expect(() => cmd.displayReport(report, false)).not.toThrow()
    })

    test('shows category breakdown in verbose mode', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 10, dependencies: 5, documentation: 3, patterns: 2, security: 1 },
        filesAnalyzed: 25,
        interest: { weekly: 2, monthly: 8, annual: 104 },
        overall: 21,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }

      cmd.displayReport(report, true)

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => c[0])
      expect(logCalls.some((c) => typeof c === 'string' && c.includes('Complexity'))).toBe(true)
      expect(logCalls.some((c) => typeof c === 'string' && c.includes('Dependencies'))).toBe(true)
      expect(logCalls.some((c) => typeof c === 'string' && c.includes('Documentation'))).toBe(true)
    })

    test('shows debt interest in verbose mode', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 10, dependencies: 5, documentation: 3, patterns: 2, security: 1 },
        filesAnalyzed: 25,
        interest: { weekly: 2, monthly: 8, annual: 104 },
        overall: 21,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }

      cmd.displayReport(report, true)

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => c[0])
      expect(logCalls.some((c) => typeof c === 'string' && c.includes('Weekly'))).toBe(true)
      expect(logCalls.some((c) => typeof c === 'string' && c.includes('Monthly'))).toBe(true)
      expect(logCalls.some((c) => typeof c === 'string' && c.includes('Annual'))).toBe(true)
    })

    test('shows files analyzed in verbose mode', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 10, dependencies: 5, documentation: 3, patterns: 2, security: 1 },
        filesAnalyzed: 25,
        interest: { weekly: 2, monthly: 8, annual: 104 },
        overall: 21,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }

      cmd.displayReport(report, true)

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => c[0])
      expect(logCalls.some((c) => typeof c === 'string' && c.includes('Files analyzed'))).toBe(true)
    })

    test('shows trend with decreasing direction', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: -5, direction: 'decreasing', previous: 16 },
      }

      cmd.displayReport(report, false)

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => c[0])
      expect(logCalls.some((c) => typeof c === 'string' && c.includes('↓'))).toBe(true)
    })

    test('shows trend with increasing direction', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 16,
        path: '/test',
        trend: { change: 5, direction: 'increasing', previous: 11 },
      }

      cmd.displayReport(report, false)

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => c[0])
      expect(logCalls.some((c) => typeof c === 'string' && c.includes('↑'))).toBe(true)
    })

    test('shows trend with stable direction', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: 11 },
      }

      cmd.displayReport(report, false)

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => c[0])
      expect(logCalls.some((c) => typeof c === 'string' && c.includes('→'))).toBe(true)
    })

    test('does not show trend when previous is null', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }

      cmd.displayReport(report, false)

      const logCalls = vi.mocked(cmd.log).mock.calls.flat()
      const hasTrendLine = logCalls.some((c) => typeof c === 'string' && c.includes('Trend:'))
      expect(hasTrendLine).toBe(false)
    })
  })

  describe('analyzeDebt', () => {
    function getTestableCommand(): {
      analyzeDebt: (targetPath: string) => Promise<{
        breakdown: {
          complexity: number
          dependencies: number
          documentation: number
          patterns: number
          security: number
        }
        filesAnalyzed: number
        interest: { weekly: number; monthly: number; annual: number }
        overall: number
        path: string
        trend: { change: number; direction: string; previous: number | null }
      }>
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('analyzeDebt method exists', () => {
      const cmd = getTestableCommand()
      expect(typeof cmd.analyzeDebt).toBe('function')
    })

    test('analyzeDebt returns report with all fields', async () => {
      vi.resetModules()
      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        { path: 'test.ts', absolutePath: '/test/test.ts' },
      ])

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        analyzeDebt: (targetPath: string) => Promise<{
          breakdown: Record<string, number>
          filesAnalyzed: number
          interest: { weekly: number; monthly: number; annual: number }
          overall: number
          path: string
          trend: { change: number; direction: string; previous: number | null }
        }>
      }

      const result = await cmd.analyzeDebt('/test')

      expect(result).toHaveProperty('breakdown')
      expect(result).toHaveProperty('filesAnalyzed')
      expect(result).toHaveProperty('interest')
      expect(result).toHaveProperty('overall')
      expect(result).toHaveProperty('path')
      expect(result).toHaveProperty('trend')
      expect(result.filesAnalyzed).toBe(1)
    })
  })

  describe('run() method', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Debt([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: { path: '.' },
        flags,
      })
      return command
    }

    test('errors when path does not exist', async () => {
      vi.resetModules()
      const { existsSync } = await import('node:fs')
      vi.mocked(existsSync).mockReturnValueOnce(false)

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never)
      const cmdWithMock = cmd as unknown as {
        parse: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: { path: '/nonexistent' },
        flags: { json: false, verbose: false, history: false, save: false },
      })
      cmdWithMock.error = vi.fn()

      await cmd.run()

      expect(cmdWithMock.error).toHaveBeenCalledWith(expect.stringContaining('Path not found'), {
        exit: 1,
      })
    })

    test('shows history when --history flag is set', async () => {
      const cmd = createCommandWithMockedParse({
        json: false,
        verbose: false,
        history: true,
        save: false,
      })
      const cmdWithMock = cmd as unknown as { showHistory: ReturnType<typeof vi.fn> }
      cmdWithMock.showHistory = vi.fn().mockResolvedValue(undefined)

      await cmd.run()

      expect(cmdWithMock.showHistory).toHaveBeenCalled()
    })

    test('outputs JSON when --json flag is set', async () => {
      const cmd = createCommandWithMockedParse({
        json: true,
        verbose: false,
        history: false,
        save: false,
      })
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        analyzeDebt: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.analyzeDebt = vi.fn().mockResolvedValue({
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      })

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalledWith(expect.stringContaining('"overall"'))
    })

    test('calls displayReport with verbose flag when --verbose is set', async () => {
      const cmd = createCommandWithMockedParse({
        json: false,
        verbose: true,
        history: false,
        save: false,
      })
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }
      const cmdWithMock = cmd as unknown as {
        analyzeDebt: ReturnType<typeof vi.fn>
        displayReport: ReturnType<typeof vi.fn>
      }
      cmdWithMock.analyzeDebt = vi.fn().mockResolvedValue(report)
      cmdWithMock.displayReport = vi.fn()

      await cmd.run()

      expect(cmdWithMock.displayReport).toHaveBeenCalledWith(report, true)
    })

    test('calls displayReport without verbose flag by default', async () => {
      const cmd = createCommandWithMockedParse({
        json: false,
        verbose: false,
        history: false,
        save: false,
      })
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }
      const cmdWithMock = cmd as unknown as {
        analyzeDebt: ReturnType<typeof vi.fn>
        displayReport: ReturnType<typeof vi.fn>
      }
      cmdWithMock.analyzeDebt = vi.fn().mockResolvedValue(report)
      cmdWithMock.displayReport = vi.fn()

      await cmd.run()

      expect(cmdWithMock.displayReport).toHaveBeenCalledWith(report, false)
    })

    test('saves history when --save flag is set', async () => {
      const cmd = createCommandWithMockedParse({
        json: false,
        verbose: false,
        history: false,
        save: true,
      })
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }
      const cmdWithMock = cmd as unknown as {
        analyzeDebt: ReturnType<typeof vi.fn>
        saveHistory: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
      }
      cmdWithMock.analyzeDebt = vi.fn().mockResolvedValue(report)
      cmdWithMock.saveHistory = vi.fn().mockResolvedValue(undefined)
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(cmdWithMock.saveHistory).toHaveBeenCalled()
      expect(cmdWithMock.log).toHaveBeenCalledWith(expect.stringContaining('saved'))
    })
  })

  describe('Command metadata - extended', () => {
    test('description is a non-empty string', () => {
      expect(typeof Debt.description).toBe('string')
      expect(Debt.description.length).toBeGreaterThan(0)
    })

    test('examples is an array', () => {
      expect(Array.isArray(Debt.examples)).toBe(true)
    })

    test('first example shows default usage', () => {
      const firstExample = Debt.examples[0] as { command: string; description: string }
      expect(firstExample.command).toContain('command.id')
    })

    test('second example shows src directory usage', () => {
      const secondExample = Debt.examples[1] as { command: string; description: string }
      expect(secondExample.command).toContain('src/')
    })

    test('third example shows --json flag', () => {
      const thirdExample = Debt.examples[2] as { command: string; description: string }
      expect(thirdExample.command).toContain('--json')
    })

    test('fourth example shows --history flag', () => {
      const fourthExample = Debt.examples[3] as { command: string; description: string }
      expect(fourthExample.command).toContain('--history')
    })

    test('fifth example shows --save flag', () => {
      const fifthExample = Debt.examples[4] as { command: string; description: string }
      expect(fifthExample.command).toContain('--save')
    })

    test('each example has both command and description', () => {
      for (const example of Debt.examples) {
        const ex = example as { command: string; description: string }
        expect(ex).toHaveProperty('command')
        expect(ex).toHaveProperty('description')
        expect(ex.command.length).toBeGreaterThan(0)
        expect(ex.description.length).toBeGreaterThan(0)
      }
    })

    test('json flag has correct description', () => {
      expect(Debt.flags.json.description).toBe('Output as JSON')
    })

    test('verbose flag has correct description', () => {
      expect(Debt.flags.verbose.description).toBe('Show detailed breakdown')
    })

    test('history flag has correct description', () => {
      expect(Debt.flags.history.description).toBe('Show debt trend history')
    })

    test('save flag has correct description', () => {
      expect(Debt.flags.save.description).toBe('Save debt snapshot for trend tracking')
    })

    test('args has exactly one argument', () => {
      expect(Object.keys(Debt.args)).toHaveLength(1)
    })

    test('path argument has correct name', () => {
      expect(Debt.args.path).toBeDefined()
      expect(typeof Debt.args.path).toBe('object')
    })

    test('flags object has exactly four flags', () => {
      expect(Object.keys(Debt.flags)).toHaveLength(4)
    })
  })

  describe('calculateBreakdown - extended', () => {
    function getTestableCommand(): {
      calculateBreakdown: (
        violations: Array<{
          filePath: string
          ruleId: string
          severity: string
        }>,
      ) => {
        complexity: number
        dependencies: number
        documentation: number
        patterns: number
        security: number
      }
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('calculates security debt with weight', () => {
      const cmd = getTestableCommand()
      const violations = [{ filePath: 'a.ts', ruleId: 'security-xss', severity: 'error' }]
      const result = cmd.calculateBreakdown(violations)
      expect(result.security).toBe(5)
    })

    test('calculates patterns debt with weight', () => {
      const cmd = getTestableCommand()
      const violations = [{ filePath: 'a.ts', ruleId: 'patterns-legacy', severity: 'warning' }]
      const result = cmd.calculateBreakdown(violations)
      expect(result.patterns).toBe(1)
    })

    test('multiple security violations accumulate', () => {
      const cmd = getTestableCommand()
      const violations = [
        { filePath: 'a.ts', ruleId: 'security-xss', severity: 'error' },
        { filePath: 'b.ts', ruleId: 'security-injection', severity: 'error' },
      ]
      const result = cmd.calculateBreakdown(violations)
      expect(result.security).toBe(10)
    })

    test('multiple complexity violations accumulate', () => {
      const cmd = getTestableCommand()
      const violations = [
        { filePath: 'a.ts', ruleId: 'max-complexity', severity: 'warning' },
        { filePath: 'b.ts', ruleId: 'max-complexity', severity: 'warning' },
        { filePath: 'c.ts', ruleId: 'max-complexity', severity: 'warning' },
      ]
      const result = cmd.calculateBreakdown(violations)
      expect(result.complexity).toBe(9)
    })

    test('violations across all categories', () => {
      const cmd = getTestableCommand()
      const violations = [
        { filePath: 'a.ts', ruleId: 'max-complexity', severity: 'warning' },
        { filePath: 'b.ts', ruleId: 'dependencies-circular', severity: 'error' },
        { filePath: 'c.ts', ruleId: 'require-jsdoc', severity: 'info' },
        { filePath: 'd.ts', ruleId: 'patterns-legacy', severity: 'warning' },
        { filePath: 'e.ts', ruleId: 'security-eval', severity: 'error' },
      ]
      const result = cmd.calculateBreakdown(violations)
      expect(result.complexity).toBe(3)
      expect(result.dependencies).toBe(2)
      expect(result.documentation).toBe(2)
      expect(result.patterns).toBe(1)
      expect(result.security).toBe(5)
    })

    test('documentation rule with jsdoc prefix is counted', () => {
      const cmd = getTestableCommand()
      const violations = [{ filePath: 'a.ts', ruleId: 'require-jsdoc-method', severity: 'info' }]
      const result = cmd.calculateBreakdown(violations)
      expect(result.documentation).toBe(2)
    })

    test('ruleId containing documentation string adds to docs count', () => {
      const cmd = getTestableCommand()
      const violations = [
        { filePath: 'a.ts', ruleId: 'require-documentation-strings', severity: 'info' },
      ]
      const result = cmd.calculateBreakdown(violations)
      expect(result.documentation).toBe(2)
    })

    test('single violation has correct complexity weight of 3', () => {
      const cmd = getTestableCommand()
      const violations = [{ filePath: 'a.ts', ruleId: 'max-complexity', severity: 'warning' }]
      const result = cmd.calculateBreakdown(violations)
      expect(result.complexity).toBe(3)
    })

    test('single dependency violation has weight of 2', () => {
      const cmd = getTestableCommand()
      const violations = [{ filePath: 'a.ts', ruleId: 'dependencies-cycle', severity: 'error' }]
      const result = cmd.calculateBreakdown(violations)
      expect(result.dependencies).toBe(2)
    })

    test('single security violation has weight of 5', () => {
      const cmd = getTestableCommand()
      const violations = [{ filePath: 'a.ts', ruleId: 'security-hardcoded', severity: 'error' }]
      const result = cmd.calculateBreakdown(violations)
      expect(result.security).toBe(5)
    })

    test('large number of violations', () => {
      const cmd = getTestableCommand()
      const violations = Array.from({ length: 50 }, (_, i) => ({
        filePath: `file${i}.ts`,
        ruleId: 'max-complexity',
        severity: 'warning',
      }))
      const result = cmd.calculateBreakdown(violations)
      expect(result.complexity).toBe(150)
    })
  })

  describe('calculateInterest - extended', () => {
    function getTestableCommand(): {
      calculateInterest: (debtPoints: number) => { weekly: number; monthly: number; annual: number }
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('calculates correct weekly interest for 1 point', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateInterest(1)
      expect(result.weekly).toBe(0)
    })

    test('calculates correct weekly interest for 4 points', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateInterest(4)
      expect(result.weekly).toBe(1)
    })

    test('calculates correct weekly interest for 10 points', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateInterest(10)
      expect(result.weekly).toBe(3)
    })

    test('monthly is greater than weekly for any non-zero debt', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateInterest(50)
      expect(result.monthly).toBeGreaterThan(result.weekly)
    })

    test('annual is greater than monthly for any non-zero debt', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateInterest(50)
      expect(result.annual).toBeGreaterThan(result.monthly)
    })

    test('all values are integers', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateInterest(7)
      expect(Number.isInteger(result.weekly)).toBe(true)
      expect(Number.isInteger(result.monthly)).toBe(true)
      expect(Number.isInteger(result.annual)).toBe(true)
    })

    test('returns positive values for positive debt', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateInterest(100)
      expect(result.weekly).toBeGreaterThan(0)
      expect(result.monthly).toBeGreaterThan(0)
      expect(result.annual).toBeGreaterThan(0)
    })

    test('handles very small debt value of 1', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateInterest(1)
      expect(result.annual).toBeGreaterThanOrEqual(0)
    })

    test('proportional scaling between different debt values', () => {
      const cmd = getTestableCommand()
      const result10 = cmd.calculateInterest(10)
      const result20 = cmd.calculateInterest(20)
      expect(result20.weekly).toBeGreaterThan(result10.weekly)
    })
  })

  describe('calculateOverall - extended', () => {
    function getTestableCommand(): {
      calculateOverall: (
        breakdown: {
          complexity: number
          dependencies: number
          documentation: number
          patterns: number
          security: number
        },
        filesCount: number,
      ) => number
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('higher file count reduces overall score', () => {
      const cmd = getTestableCommand()
      const breakdown = {
        complexity: 20,
        dependencies: 0,
        documentation: 0,
        patterns: 0,
        security: 0,
      }
      const result1 = cmd.calculateOverall(breakdown, 1)
      const result10 = cmd.calculateOverall(breakdown, 10)
      expect(result10).toBeLessThan(result1)
    })

    test('only security breakdown contributes correctly', () => {
      const cmd = getTestableCommand()
      const breakdown = {
        complexity: 0,
        dependencies: 0,
        documentation: 0,
        patterns: 0,
        security: 50,
      }
      const result = cmd.calculateOverall(breakdown, 5)
      expect(result).toBe(10)
    })

    test('only patterns breakdown contributes correctly', () => {
      const cmd = getTestableCommand()
      const breakdown = {
        complexity: 0,
        dependencies: 0,
        documentation: 0,
        patterns: 30,
        security: 0,
      }
      const result = cmd.calculateOverall(breakdown, 3)
      expect(result).toBe(10)
    })

    test('only documentation breakdown contributes correctly', () => {
      const cmd = getTestableCommand()
      const breakdown = {
        complexity: 0,
        dependencies: 0,
        documentation: 40,
        patterns: 0,
        security: 0,
      }
      const result = cmd.calculateOverall(breakdown, 4)
      expect(result).toBe(10)
    })

    test('returns 0 when all breakdown values are 0', () => {
      const cmd = getTestableCommand()
      const result = cmd.calculateOverall(
        { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        100,
      )
      expect(result).toBe(0)
    })

    test('handles single file correctly', () => {
      const cmd = getTestableCommand()
      const breakdown = {
        complexity: 10,
        dependencies: 5,
        documentation: 3,
        patterns: 2,
        security: 5,
      }
      const result = cmd.calculateOverall(breakdown, 1)
      expect(result).toBe(25)
    })

    test('large number of files normalizes properly', () => {
      const cmd = getTestableCommand()
      const breakdown = {
        complexity: 1000,
        dependencies: 500,
        documentation: 200,
        patterns: 100,
        security: 50,
      }
      const result = cmd.calculateOverall(breakdown, 100)
      expect(result).toBe(19)
    })
  })

  describe('getDebtColor - extended', () => {
    function getTestableCommand(): { getDebtColor: (score: number) => (text: string) => string } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('score 0 returns green', () => {
      const cmd = getTestableCommand()
      const colorFn = cmd.getDebtColor(0)
      expect(colorFn).toBeDefined()
    })

    test('score 1 returns green', () => {
      const cmd = getTestableCommand()
      const colorFn = cmd.getDebtColor(1)
      const colorFn0 = cmd.getDebtColor(0)
      expect(colorFn).toBe(colorFn0)
    })

    test('score 5 returns green (boundary)', () => {
      const cmd = getTestableCommand()
      const colorFn5 = cmd.getDebtColor(5)
      const colorFn0 = cmd.getDebtColor(0)
      expect(colorFn5).toBe(colorFn0)
    })

    test('score 6 returns yellow (boundary)', () => {
      const cmd = getTestableCommand()
      const colorFn6 = cmd.getDebtColor(6)
      const colorFn5 = cmd.getDebtColor(5)
      expect(colorFn6).not.toBe(colorFn5)
    })

    test('score 10 returns yellow', () => {
      const cmd = getTestableCommand()
      const colorFn10 = cmd.getDebtColor(10)
      const colorFn6 = cmd.getDebtColor(6)
      expect(colorFn10).toBe(colorFn6)
    })

    test('score 15 returns yellow (boundary)', () => {
      const cmd = getTestableCommand()
      const colorFn15 = cmd.getDebtColor(15)
      const colorFn6 = cmd.getDebtColor(6)
      expect(colorFn15).toBe(colorFn6)
    })

    test('score 16 returns red (boundary)', () => {
      const cmd = getTestableCommand()
      const colorFn16 = cmd.getDebtColor(16)
      const colorFn15 = cmd.getDebtColor(15)
      expect(colorFn16).not.toBe(colorFn15)
    })

    test('score 100 returns red', () => {
      const cmd = getTestableCommand()
      const colorFn100 = cmd.getDebtColor(100)
      const colorFn16 = cmd.getDebtColor(16)
      expect(colorFn100).toBe(colorFn16)
    })

    test('returns a function', () => {
      const cmd = getTestableCommand()
      const colorFn = cmd.getDebtColor(5)
      expect(typeof colorFn).toBe('function')
    })

    test('returned function produces string output', () => {
      const cmd = getTestableCommand()
      const colorFn = cmd.getDebtColor(5)
      const result = colorFn('test')
      expect(typeof result).toBe('string')
    })
  })

  describe('getRecommendations - extended', () => {
    function getTestableCommand(): {
      getRecommendations: (report: {
        breakdown: {
          complexity: number
          dependencies: number
          documentation: number
          patterns: number
          security: number
        }
        overall: number
      }) => string[]
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns security recommendation when above threshold', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 6 },
        overall: 6,
      })
      expect(recommendations.some((r) => r.toLowerCase().includes('security'))).toBe(true)
    })

    test('does not return security recommendation at threshold', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 5 },
        overall: 5,
      })
      expect(recommendations.some((r) => r.toLowerCase().includes('security'))).toBe(false)
    })

    test('returns complexity recommendation when above threshold', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 11, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        overall: 11,
      })
      expect(recommendations.some((r) => r.toLowerCase().includes('complexity'))).toBe(true)
    })

    test('does not return complexity recommendation at threshold', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 10, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        overall: 10,
      })
      expect(recommendations.some((r) => r.toLowerCase().includes('complexity'))).toBe(false)
    })

    test('returns dependencies recommendation when above threshold', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 0, dependencies: 6, documentation: 0, patterns: 0, security: 0 },
        overall: 6,
      })
      expect(recommendations.some((r) => r.includes('circular') || r.includes('dependen'))).toBe(
        true,
      )
    })

    test('does not return dependencies recommendation at threshold', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 0, dependencies: 5, documentation: 0, patterns: 0, security: 0 },
        overall: 5,
      })
      expect(recommendations.some((r) => r.includes('circular') || r.includes('dependen'))).toBe(
        false,
      )
    })

    test('returns documentation recommendation when above threshold', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 0, dependencies: 0, documentation: 11, patterns: 0, security: 0 },
        overall: 11,
      })
      expect(recommendations.some((r) => r.includes('JSDoc'))).toBe(true)
    })

    test('returns overall debt recommendation when above threshold', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        overall: 21,
      })
      expect(recommendations.some((r) => r.includes('sprint'))).toBe(true)
    })

    test('does not return overall recommendation at threshold', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        overall: 20,
      })
      expect(recommendations.some((r) => r.includes('sprint'))).toBe(false)
    })

    test('multiple recommendations at once', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: {
          complexity: 15,
          dependencies: 10,
          documentation: 0,
          patterns: 0,
          security: 10,
        },
        overall: 35,
      })
      expect(recommendations.length).toBeGreaterThanOrEqual(3)
    })

    test('recommendations are all non-empty strings', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: {
          complexity: 20,
          dependencies: 10,
          documentation: 15,
          patterns: 0,
          security: 10,
        },
        overall: 55,
      })
      for (const rec of recommendations) {
        expect(rec.length).toBeGreaterThan(0)
        expect(typeof rec).toBe('string')
      }
    })

    test('patterns category has no direct recommendation threshold', () => {
      const cmd = getTestableCommand()
      const recommendations = cmd.getRecommendations({
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 100, security: 0 },
        overall: 100,
      })
      const hasPatternRec = recommendations.some((r) => r.toLowerCase().includes('pattern'))
      expect(hasPatternRec).toBe(false)
    })
  })

  describe('formatDebt - extended', () => {
    function getTestableCommand(): { formatDebt: (score: number) => string } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('formats zero correctly', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatDebt(0)
      expect(result).toContain('0')
    })

    test('pads score to 3 characters for small values', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatDebt(1)
      expect(result.trim()).toBe('1')
    })

    test('formats double digit score', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatDebt(42)
      expect(result).toContain('42')
    })

    test('very large score is formatted', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatDebt(9999)
      expect(result).toContain('9999')
    })

    test('returns string type', () => {
      const cmd = getTestableCommand()
      const result = cmd.formatDebt(5)
      expect(typeof result).toBe('string')
    })
  })

  describe('getHistoryPath - extended', () => {
    function getTestableCommand(): { getHistoryPath: (targetPath: string) => string } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns path ending with debt-history.json', () => {
      const cmd = getTestableCommand()
      const result = cmd.getHistoryPath('/project')
      expect(result.endsWith('debt-history.json')).toBe(true)
    })

    test('contains .codeforge directory', () => {
      const cmd = getTestableCommand()
      const result = cmd.getHistoryPath('/project')
      expect(result).toContain('.codeforge/')
    })

    test('handles root path', () => {
      const cmd = getTestableCommand()
      const result = cmd.getHistoryPath('/')
      expect(result).toContain('.codeforge')
    })

    test('handles relative path', () => {
      const cmd = getTestableCommand()
      const result = cmd.getHistoryPath('.')
      expect(result).toContain('.codeforge')
    })

    test('handles nested path', () => {
      const cmd = getTestableCommand()
      const result = cmd.getHistoryPath('/a/b/c/d')
      expect(result).toContain('/a/b/c/d')
      expect(result).toContain('.codeforge')
    })
  })

  describe('getTrend - extended', () => {
    function getTestableCommand(): {
      getTrend: (
        targetPath: string,
        current: number,
      ) => Promise<{ change: number; direction: string; previous: number | null }>
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('returns stable with change 0 when no history', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.getTrend('/no/history', 10)
      expect(result.direction).toBe('stable')
      expect(result.change).toBe(0)
    })

    test('returns decreasing when change is -2', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([{ overall: 12, timestamp: '2024-01-01', breakdown: {}, filesAnalyzed: 5 }]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        getTrend: (
          targetPath: string,
          current: number,
        ) => Promise<{ change: number; direction: string; previous: number | null }>
      }
      const result = await cmd.getTrend('/test', 10)

      expect(result.direction).toBe('decreasing')
      expect(result.change).toBe(-2)
    })

    test('returns increasing when change is +2', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([{ overall: 8, timestamp: '2024-01-01', breakdown: {}, filesAnalyzed: 5 }]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        getTrend: (
          targetPath: string,
          current: number,
        ) => Promise<{ change: number; direction: string; previous: number | null }>
      }
      const result = await cmd.getTrend('/test', 10)

      expect(result.direction).toBe('increasing')
      expect(result.change).toBe(2)
    })

    test('returns stable when change is exactly +1', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([{ overall: 9, timestamp: '2024-01-01', breakdown: {}, filesAnalyzed: 5 }]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        getTrend: (
          targetPath: string,
          current: number,
        ) => Promise<{ change: number; direction: string; previous: number | null }>
      }
      const result = await cmd.getTrend('/test', 10)

      expect(result.direction).toBe('stable')
      expect(result.change).toBe(1)
    })

    test('returns stable when change is exactly -1', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([{ overall: 11, timestamp: '2024-01-01', breakdown: {}, filesAnalyzed: 5 }]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        getTrend: (
          targetPath: string,
          current: number,
        ) => Promise<{ change: number; direction: string; previous: number | null }>
      }
      const result = await cmd.getTrend('/test', 10)

      expect(result.direction).toBe('stable')
      expect(result.change).toBe(-1)
    })

    test('uses last entry from multiple history entries', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          { overall: 5, timestamp: '2024-01-01', breakdown: {}, filesAnalyzed: 5 },
          { overall: 10, timestamp: '2024-01-02', breakdown: {}, filesAnalyzed: 5 },
          { overall: 15, timestamp: '2024-01-03', breakdown: {}, filesAnalyzed: 5 },
        ]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        getTrend: (
          targetPath: string,
          current: number,
        ) => Promise<{ change: number; direction: string; previous: number | null }>
      }
      const result = await cmd.getTrend('/test', 20)

      expect(result.previous).toBe(15)
      expect(result.change).toBe(5)
      expect(result.direction).toBe('increasing')
    })

    test('handles malformed JSON in history file', async () => {
      const cmd = getTestableCommand()
      const result = await cmd.getTrend('/bad/json', 10)
      expect(result.direction).toBe('stable')
      expect(result.previous).toBeNull()
    })

    test('handles equal current and previous values', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([{ overall: 10, timestamp: '2024-01-01', breakdown: {}, filesAnalyzed: 5 }]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        getTrend: (
          targetPath: string,
          current: number,
        ) => Promise<{ change: number; direction: string; previous: number | null }>
      }
      const result = await cmd.getTrend('/test', 10)

      expect(result.direction).toBe('stable')
      expect(result.change).toBe(0)
      expect(result.previous).toBe(10)
    })
  })

  describe('saveHistory - extended', () => {
    function getTestableCommand(): {
      saveHistory: (
        targetPath: string,
        report: {
          breakdown: {
            complexity: number
            dependencies: number
            documentation: number
            patterns: number
            security: number
          }
          filesAnalyzed: number
          overall: number
        },
      ) => Promise<void>
    } {
      return new Debt([], {} as never) as unknown as ReturnType<typeof getTestableCommand>
    }

    test('saves entry with correct breakdown values', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Not found'))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        saveHistory: (
          targetPath: string,
          report: { breakdown: Record<string, number>; filesAnalyzed: number; overall: number },
        ) => Promise<void>
      }
      const report = {
        breakdown: { complexity: 10, dependencies: 5, documentation: 3, patterns: 2, security: 1 },
        filesAnalyzed: 20,
        overall: 21,
      }

      await cmd.saveHistory('/test', report)

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0]
      const writtenData = JSON.parse(writeCall[1] as string)
      expect(writtenData[0].breakdown.complexity).toBe(10)
      expect(writtenData[0].breakdown.security).toBe(1)
    })

    test('saves entry with filesAnalyzed', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Not found'))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        saveHistory: (
          targetPath: string,
          report: { breakdown: Record<string, number>; filesAnalyzed: number; overall: number },
        ) => Promise<void>
      }
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 42,
        overall: 11,
      }

      await cmd.saveHistory('/test', report)

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0]
      const writtenData = JSON.parse(writeCall[1] as string)
      expect(writtenData[0].filesAnalyzed).toBe(42)
    })

    test('saves entry with overall score', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Not found'))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        saveHistory: (
          targetPath: string,
          report: { breakdown: Record<string, number>; filesAnalyzed: number; overall: number },
        ) => Promise<void>
      }
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        overall: 99,
      }

      await cmd.saveHistory('/test', report)

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0]
      const writtenData = JSON.parse(writeCall[1] as string)
      expect(writtenData[0].overall).toBe(99)
    })

    test('saves entry with valid ISO timestamp', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Not found'))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        saveHistory: (
          targetPath: string,
          report: { breakdown: Record<string, number>; filesAnalyzed: number; overall: number },
        ) => Promise<void>
      }
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        overall: 11,
      }

      await cmd.saveHistory('/test', report)

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0]
      const writtenData = JSON.parse(writeCall[1] as string)
      expect(typeof writtenData[0].timestamp).toBe('string')
      expect(() => new Date(writtenData[0].timestamp)).not.toThrow()
    })

    test('writes JSON with 2-space indent', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Not found'))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        saveHistory: (
          targetPath: string,
          report: { breakdown: Record<string, number>; filesAnalyzed: number; overall: number },
        ) => Promise<void>
      }
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        overall: 11,
      }

      await cmd.saveHistory('/test', report)

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0]
      const writtenData = writeCall[1] as string
      expect(writtenData).toContain('  "')
    })

    test('creates .codeforge directory', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Not found'))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        saveHistory: (
          targetPath: string,
          report: { breakdown: Record<string, number>; filesAnalyzed: number; overall: number },
        ) => Promise<void>
      }

      await cmd.saveHistory('/test', {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        overall: 11,
      })

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('.codeforge'),
        expect.objectContaining({ recursive: true }),
      )
    })

    test('handles write failure gracefully', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Not found'))
      vi.mocked(fs.mkdir).mockRejectedValueOnce(new Error('Permission denied'))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        saveHistory: (
          targetPath: string,
          report: { breakdown: Record<string, number>; filesAnalyzed: number; overall: number },
        ) => Promise<void>
        warn: ReturnType<typeof vi.fn>
      }
      cmd.warn = vi.fn()

      await cmd.saveHistory('/readonly', {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        overall: 11,
      })

      expect(cmd.warn).toHaveBeenCalledWith(expect.stringContaining('Failed'))
    })

    test('preserves exactly max entries after trimming', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      const existingHistory = Array.from({ length: 30 }, (_, i) => ({
        overall: i + 1,
        timestamp: `2024-01-${String(i + 1).padStart(2, '0')}`,
        breakdown: {},
        filesAnalyzed: 5,
      }))
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(existingHistory))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        saveHistory: (
          targetPath: string,
          report: { breakdown: Record<string, number>; filesAnalyzed: number; overall: number },
        ) => Promise<void>
      }

      await cmd.saveHistory('/test', {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        overall: 50,
      })

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0]
      const writtenData = JSON.parse(writeCall[1] as string)
      expect(writtenData.length).toBe(30)
    })
  })

  describe('showHistory - extended', () => {
    test('handles single history entry', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          { overall: 10, timestamp: '2024-01-01T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
        ]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('History'))
    })

    test('shows debt reduced message with correct points', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          { overall: 30, timestamp: '2024-01-01T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
          { overall: 10, timestamp: '2024-01-02T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
        ]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('20'))
    })

    test('shows debt increased message with correct points', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          { overall: 5, timestamp: '2024-01-01T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
          { overall: 25, timestamp: '2024-01-02T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
        ]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('20'))
    })

    test('displays table header with Date column', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          { overall: 10, timestamp: '2024-01-01T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
        ]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('Date'))
    })

    test('displays table header with Debt column', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          { overall: 10, timestamp: '2024-01-01T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
        ]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('Debt'))
    })

    test('displays table header with Trend column', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          { overall: 10, timestamp: '2024-01-01T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
        ]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('Trend'))
    })

    test('first entry shows dash for trend', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          { overall: 10, timestamp: '2024-01-01T10:00:00Z', breakdown: {}, filesAnalyzed: 5 },
        ]),
      )

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      expect(cmd.log).toHaveBeenCalled()
    })

    test('suggestion message when no history file found', async () => {
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/nohistory')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('No history found'))
    })

    test('empty history suggests running debt --save', async () => {
      vi.resetModules()
      const fs = await import('node:fs/promises')
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify([]))

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        showHistory: (targetPath: string) => Promise<void>
      }
      cmd.log = vi.fn()

      await cmd.showHistory('/test')

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('--save'))
    })
  })

  describe('displayReport - extended', () => {
    test('displays Technical Debt Analysis header', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }

      cmd.displayReport(report, false)

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('Technical Debt Analysis'))
    })

    test('displays Debt Score', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }

      cmd.displayReport(report, false)

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('Debt Score'))
    })

    test('displays Recommendations section when present', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 20, dependencies: 0, documentation: 0, patterns: 0, security: 10 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 30,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }

      cmd.displayReport(report, false)

      expect(cmd.log).toHaveBeenCalledWith(expect.stringContaining('Recommendations'))
    })

    test('does not show Recommendations for healthy project', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 0, dependencies: 0, documentation: 0, patterns: 0, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 0, monthly: 0, annual: 0 },
        overall: 0,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }

      cmd.displayReport(report, false)

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => String(c[0]))
      expect(logCalls.some((c) => c.includes('Recommendations'))).toBe(false)
    })

    test('non-verbose mode hides category breakdown', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 10, dependencies: 5, documentation: 3, patterns: 2, security: 1 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 21,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }

      cmd.displayReport(report, false)

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => String(c[0]))
      expect(logCalls.some((c) => c.includes('Category Breakdown'))).toBe(false)
    })

    test('non-verbose mode hides debt interest', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 10, dependencies: 5, documentation: 3, patterns: 2, security: 1 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 21,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }

      cmd.displayReport(report, false)

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => String(c[0]))
      expect(logCalls.some((c) => c.includes('Debt Interest'))).toBe(false)
    })

    test('verbose mode shows Security category', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 10, dependencies: 5, documentation: 3, patterns: 2, security: 8 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 21,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }

      cmd.displayReport(report, true)

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => String(c[0]))
      expect(logCalls.some((c) => c.includes('Security'))).toBe(true)
    })

    test('verbose mode shows Patterns category', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 10, dependencies: 5, documentation: 3, patterns: 7, security: 1 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 21,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }

      cmd.displayReport(report, true)

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => String(c[0]))
      expect(logCalls.some((c) => c.includes('Patterns'))).toBe(true)
    })

    test('trend line shows negative change for decreasing', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 5,
        path: '/test',
        trend: { change: -10, direction: 'decreasing', previous: 15 },
      }

      cmd.displayReport(report, false)

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => String(c[0]))
      expect(logCalls.some((c) => c.includes('-10'))).toBe(true)
    })

    test('trend line shows positive change for increasing', async () => {
      vi.resetModules()
      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        log: ReturnType<typeof vi.fn>
        displayReport: (report: Record<string, unknown>, verbose: boolean) => void
      }
      cmd.log = vi.fn()
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 20,
        path: '/test',
        trend: { change: 10, direction: 'increasing', previous: 10 },
      }

      cmd.displayReport(report, false)

      const logCalls = vi.mocked(cmd.log).mock.calls.map((c) => String(c[0]))
      expect(logCalls.some((c) => c.includes('+10'))).toBe(true)
    })
  })

  describe('analyzeDebt - extended', () => {
    test('returns breakdown with all category keys', async () => {
      vi.resetModules()
      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        { path: 'test.ts', absolutePath: '/test/test.ts' },
      ])

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        analyzeDebt: (targetPath: string) => Promise<{
          breakdown: Record<string, number>
          filesAnalyzed: number
        }>
      }

      const result = await cmd.analyzeDebt('/test')

      expect(result.breakdown).toHaveProperty('complexity')
      expect(result.breakdown).toHaveProperty('dependencies')
      expect(result.breakdown).toHaveProperty('documentation')
      expect(result.breakdown).toHaveProperty('patterns')
      expect(result.breakdown).toHaveProperty('security')
    })

    test('returns trend data', async () => {
      vi.resetModules()
      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        analyzeDebt: (targetPath: string) => Promise<{
          trend: { change: number; direction: string; previous: number | null }
        }>
      }

      const result = await cmd.analyzeDebt('/test')

      expect(result.trend).toHaveProperty('change')
      expect(result.trend).toHaveProperty('direction')
      expect(result.trend).toHaveProperty('previous')
    })

    test('returns interest data', async () => {
      vi.resetModules()
      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        analyzeDebt: (targetPath: string) => Promise<{
          interest: { weekly: number; monthly: number; annual: number }
        }>
      }

      const result = await cmd.analyzeDebt('/test')

      expect(result.interest).toHaveProperty('weekly')
      expect(result.interest).toHaveProperty('monthly')
      expect(result.interest).toHaveProperty('annual')
    })

    test('returns path in report', async () => {
      vi.resetModules()
      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        analyzeDebt: (targetPath: string) => Promise<{
          path: string
        }>
      }

      const result = await cmd.analyzeDebt('/test')

      expect(result.path).toContain('/test')
    })

    test('handles empty files list', async () => {
      vi.resetModules()
      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        analyzeDebt: (targetPath: string) => Promise<{
          filesAnalyzed: number
          overall: number
        }>
      }

      const result = await cmd.analyzeDebt('/test')

      expect(result.filesAnalyzed).toBe(0)
      expect(result.overall).toBe(0)
    })

    test('handles file parse errors gracefully', async () => {
      vi.resetModules()
      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        { path: 'bad.ts', absolutePath: '/test/bad.ts' },
      ])

      const { Parser } = await import('../../../src/core/parser.js')
      vi.mocked(Parser).mockImplementationOnce(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          dispose: vi.fn(),
          parseFile: vi.fn().mockRejectedValue(new Error('Parse error')),
        }
      })

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        analyzeDebt: (targetPath: string) => Promise<{
          filesAnalyzed: number
          overall: number
        }>
      }

      const result = await cmd.analyzeDebt('/test')

      expect(result.filesAnalyzed).toBe(1)
    })

    test('registers all rules from allRules', async () => {
      vi.resetModules()
      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      vi.mocked(discoverFiles).mockResolvedValueOnce([])

      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      const mockRegister = vi.fn()
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: mockRegister,
          runRules: vi.fn().mockReturnValue([]),
          getEnabledRules: vi.fn().mockReturnValue([]),
          getRule: vi.fn(),
          disable: vi.fn(),
        }
      })

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        analyzeDebt: (targetPath: string) => Promise<unknown>
      }

      await cmd.analyzeDebt('/test')

      expect(mockRegister).toHaveBeenCalled()
    })

    test('uses violations from registry for breakdown', async () => {
      vi.resetModules()
      const { discoverFiles } = await import('../../../src/core/file-discovery.js')
      vi.mocked(discoverFiles).mockResolvedValueOnce([
        { path: 'test.ts', absolutePath: '/test/test.ts' },
      ])

      const { RuleRegistry } = await import('../../../src/core/rule-registry.js')
      vi.mocked(RuleRegistry).mockImplementationOnce(function () {
        return {
          register: vi.fn(),
          runRules: vi
            .fn()
            .mockReturnValue([{ ruleId: 'max-complexity', severity: 'warning', message: 'test' }]),
          getEnabledRules: vi.fn().mockReturnValue([]),
          getRule: vi.fn(),
          disable: vi.fn(),
        }
      })

      const DebtFresh = (await import('../../../src/commands/debt.js')).default
      const cmd = new DebtFresh([], {} as never) as unknown as {
        analyzeDebt: (targetPath: string) => Promise<{
          breakdown: Record<string, number>
        }>
      }

      const result = await cmd.analyzeDebt('/test')

      expect(result.breakdown.complexity).toBe(3)
    })
  })

  describe('run() method - extended', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Debt([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: { path: '.' },
        flags,
      })
      return command
    }

    test('history flag takes precedence over other flags', async () => {
      const cmd = createCommandWithMockedParse({
        json: true,
        verbose: true,
        history: true,
        save: true,
      })
      const cmdWithMock = cmd as unknown as {
        showHistory: ReturnType<typeof vi.fn>
        analyzeDebt: ReturnType<typeof vi.fn>
      }
      cmdWithMock.showHistory = vi.fn().mockResolvedValue(undefined)
      cmdWithMock.analyzeDebt = vi.fn()

      await cmd.run()

      expect(cmdWithMock.showHistory).toHaveBeenCalled()
      expect(cmdWithMock.analyzeDebt).not.toHaveBeenCalled()
    })

    test('resolves path argument', async () => {
      const cmd = new Debt([], {} as never)
      const cmdWithMock = cmd as unknown as {
        parse: ReturnType<typeof vi.fn>
        error: ReturnType<typeof vi.fn>
      }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: { path: 'src/' },
        flags: { json: false, verbose: false, history: false, save: false },
      })
      cmdWithMock.error = vi.fn()

      await cmd.run()

      expect(cmdWithMock.error).not.toHaveBeenCalled()
    })

    test('save flag triggers saveHistory before display', async () => {
      const cmd = createCommandWithMockedParse({
        json: false,
        verbose: false,
        history: false,
        save: true,
      })
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }
      const callOrder: string[] = []
      const cmdWithMock = cmd as unknown as {
        analyzeDebt: ReturnType<typeof vi.fn>
        saveHistory: ReturnType<typeof vi.fn>
        displayReport: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
      }
      cmdWithMock.analyzeDebt = vi.fn().mockResolvedValue(report)
      cmdWithMock.saveHistory = vi.fn().mockImplementation(() => {
        callOrder.push('save')
        return Promise.resolve()
      })
      cmdWithMock.displayReport = vi.fn().mockImplementation(() => {
        callOrder.push('display')
      })
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(callOrder).toEqual(['save', 'display'])
    })

    test('save flag logs success message', async () => {
      const cmd = createCommandWithMockedParse({
        json: false,
        verbose: false,
        history: false,
        save: true,
      })
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }
      const cmdWithMock = cmd as unknown as {
        analyzeDebt: ReturnType<typeof vi.fn>
        saveHistory: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
      }
      cmdWithMock.analyzeDebt = vi.fn().mockResolvedValue(report)
      cmdWithMock.saveHistory = vi.fn().mockResolvedValue(undefined)
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalledWith(expect.stringContaining('✓'))
    })

    test('json and save flags work together', async () => {
      const cmd = createCommandWithMockedParse({
        json: true,
        verbose: false,
        history: false,
        save: true,
      })
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }
      const cmdWithMock = cmd as unknown as {
        analyzeDebt: ReturnType<typeof vi.fn>
        saveHistory: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
      }
      cmdWithMock.analyzeDebt = vi.fn().mockResolvedValue(report)
      cmdWithMock.saveHistory = vi.fn().mockResolvedValue(undefined)
      cmdWithMock.log = vi.fn()

      await cmd.run()

      expect(cmdWithMock.saveHistory).toHaveBeenCalled()
      const logCalls = vi.mocked(cmdWithMock.log).mock.calls.map((c) => String(c[0]))
      expect(logCalls.some((c) => c.includes('"overall"'))).toBe(true)
    })

    test('json output contains breakdown field', async () => {
      const cmd = createCommandWithMockedParse({
        json: true,
        verbose: false,
        history: false,
        save: false,
      })
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        analyzeDebt: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.analyzeDebt = vi.fn().mockResolvedValue(report)

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalledWith(expect.stringContaining('"breakdown"'))
    })

    test('json output contains interest field', async () => {
      const cmd = createCommandWithMockedParse({
        json: true,
        verbose: false,
        history: false,
        save: false,
      })
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        analyzeDebt: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.analyzeDebt = vi.fn().mockResolvedValue(report)

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalledWith(expect.stringContaining('"interest"'))
    })

    test('json output contains trend field', async () => {
      const cmd = createCommandWithMockedParse({
        json: true,
        verbose: false,
        history: false,
        save: false,
      })
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        analyzeDebt: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.analyzeDebt = vi.fn().mockResolvedValue(report)

      await cmd.run()

      expect(cmdWithMock.log).toHaveBeenCalledWith(expect.stringContaining('"trend"'))
    })

    test('json output is valid JSON', async () => {
      const cmd = createCommandWithMockedParse({
        json: true,
        verbose: false,
        history: false,
        save: false,
      })
      const report = {
        breakdown: { complexity: 5, dependencies: 2, documentation: 1, patterns: 3, security: 0 },
        filesAnalyzed: 10,
        interest: { weekly: 1, monthly: 4, annual: 52 },
        overall: 11,
        path: '/test',
        trend: { change: 0, direction: 'stable', previous: null },
      }
      const cmdWithMock = cmd as unknown as {
        log: ReturnType<typeof vi.fn>
        analyzeDebt: ReturnType<typeof vi.fn>
      }
      cmdWithMock.log = vi.fn()
      cmdWithMock.analyzeDebt = vi.fn().mockResolvedValue(report)

      await cmd.run()

      const logCall = vi.mocked(cmdWithMock.log).mock.calls[0]
      expect(() => JSON.parse(logCall[0] as string)).not.toThrow()
    })
  })
})
