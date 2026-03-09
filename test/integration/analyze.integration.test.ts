import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'

import Analyze from '../../dist/commands/analyze.js'
import Fix from '../../dist/commands/fix.js'
import Rules from '../../dist/commands/rules.js'
import Stats from '../../dist/commands/stats.js'

import Report from '../../dist/commands/report.js'

describe('CLI Integration Tests', () => {
  let tempDir: string

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-int--'))
  })

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('Analyze command', () => {
    test('should have correct description', () => {
      expect(Analyze.description).toContain('Analyze code')
    })

    test('should have required flags defined', () => {
      expect(Analyze.flags).toBeDefined()
      expect(Analyze.flags.format).toBeDefined()
      expect(Analyze.flags.rules).toBeDefined()
    })
  })

  describe('Fix command', () => {
    test('should have correct description', () => {
      expect(Fix.description).toContain('fix violations')
    })

    test('should have required flags defined', () => {
      expect(Fix.flags).toBeDefined()
      expect(Fix.flags['dry-run']).toBeDefined()
      expect(Fix.flags.rules).toBeDefined()
    })
  })

  describe('Rules command', () => {
    test('should have correct description', () => {
      expect(Rules.description).toContain('List all available rules')
    })

    test('should have required flags defined', () => {
      expect(Rules.flags).toBeDefined()
      expect(Rules.flags.category).toBeDefined()
      expect(Rules.flags.fixable).toBeDefined()
    })
  })

  describe('Stats command', () => {
    test('should have correct description', () => {
      expect(Stats.description).toContain('codebase statistics')
    })
    test('should have required flags defined', () => {
      expect(Stats.flags).toBeDefined()
    })
  })

  describe('Report command', () => {
    test('should have correct description', () => {
      expect(Report.description).toContain('analysis reports')
    })

    test('should have required flags defined', () => {
      expect(Report.flags).toBeDefined()
      expect(Report.flags.format).toBeDefined()
      expect(Report.flags.output).toBeDefined()
    })
  })
})
