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
})
