import { describe, it, expect, beforeEach } from 'vitest'
import { ExtensionAPI, DEFAULT_VSCODE_CONFIG } from '../../src/core/vscode/extension-api.js'
import type { DiagnosticItem, VSCodeExtensionConfig } from '../../src/core/vscode/types.js'

describe('ExtensionAPI', () => {
  let api: ExtensionAPI

  beforeEach(() => {
    api = new ExtensionAPI()
  })

  describe('constructor', () => {
    it('should create API with default config', () => {
      const a = new ExtensionAPI()
      expect(a).toBeInstanceOf(ExtensionAPI)
    })

    it('should merge partial config with defaults', () => {
      const a = new ExtensionAPI({ version: '2.0.0' })
      const config = a.getConfig()
      expect(config.version).toBe('2.0.0')
      expect(config.publisher).toBe(DEFAULT_VSCODE_CONFIG.publisher)
    })

    it('should accept empty config object', () => {
      const a = new ExtensionAPI({})
      expect(a).toBeInstanceOf(ExtensionAPI)
    })

    it('should override extensionId', () => {
      const a = new ExtensionAPI({ extensionId: 'my.ext' })
      expect(a.getConfig().extensionId).toBe('my.ext')
    })

    it('should override displayName', () => {
      const a = new ExtensionAPI({ displayName: 'My Extension' })
      expect(a.getConfig().displayName).toBe('My Extension')
    })
  })

  describe('getConfig', () => {
    it('should return the full config', () => {
      const config = api.getConfig()
      expect(config.extensionId).toBe(DEFAULT_VSCODE_CONFIG.extensionId)
      expect(config.displayName).toBe(DEFAULT_VSCODE_CONFIG.displayName)
    })

    it('should return a copy', () => {
      const config1 = api.getConfig()
      const config2 = api.getConfig()
      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2)
    })
  })

  describe('generateManifest', () => {
    it('should generate valid JSON string', () => {
      const manifest = api.generateManifest()
      expect(() => JSON.parse(manifest)).not.toThrow()
    })

    it('should include name field', () => {
      const manifest = JSON.parse(api.generateManifest())
      expect(manifest.name).toBe(DEFAULT_VSCODE_CONFIG.extensionId)
    })

    it('should include displayName field', () => {
      const manifest = JSON.parse(api.generateManifest())
      expect(manifest.displayName).toBe(DEFAULT_VSCODE_CONFIG.displayName)
    })

    it('should include version field', () => {
      const manifest = JSON.parse(api.generateManifest())
      expect(manifest.version).toBe(DEFAULT_VSCODE_CONFIG.version)
    })

    it('should include publisher field', () => {
      const manifest = JSON.parse(api.generateManifest())
      expect(manifest.publisher).toBe(DEFAULT_VSCODE_CONFIG.publisher)
    })

    it('should include engines field', () => {
      const manifest = JSON.parse(api.generateManifest())
      expect(manifest.engines).toEqual(DEFAULT_VSCODE_CONFIG.engines)
    })

    it('should include categories field', () => {
      const manifest = JSON.parse(api.generateManifest())
      expect(manifest.categories).toEqual(DEFAULT_VSCODE_CONFIG.categories)
    })

    it('should include activationEvents field', () => {
      const manifest = JSON.parse(api.generateManifest())
      expect(manifest.activationEvents).toEqual(DEFAULT_VSCODE_CONFIG.activationEvents)
    })

    it('should include main field', () => {
      const manifest = JSON.parse(api.generateManifest())
      expect(manifest.main).toBe(DEFAULT_VSCODE_CONFIG.main)
    })

    it('should include contributes field', () => {
      const manifest = JSON.parse(api.generateManifest())
      expect(manifest.contributes).toBeDefined()
      expect(manifest.contributes.commands).toBeInstanceOf(Array)
    })

    it('should be formatted with 2-space indent', () => {
      const manifest = api.generateManifest()
      expect(manifest).toContain('  "name"')
    })

    it('should reflect custom config', () => {
      const a = new ExtensionAPI({ version: '3.0.0', extensionId: 'custom.ext' })
      const manifest = JSON.parse(a.generateManifest())
      expect(manifest.version).toBe('3.0.0')
      expect(manifest.name).toBe('custom.ext')
    })
  })

  describe('convertToDiagnostics', () => {
    it('should convert violations to DiagnosticItem array', () => {
      const result = api.convertToDiagnostics([
        {
          filePath: 'test.ts',
          line: 1,
          column: 0,
          message: 'Test error',
          severity: 'error',
          ruleId: 'test-rule',
        },
      ])
      expect(result.length).toBe(1)
      expect(result[0]!.filePath).toBe('test.ts')
    })

    it('should map severity correctly', () => {
      const result = api.convertToDiagnostics([
        { filePath: 'a.ts', line: 1, column: 0, message: 'e', severity: 'error', ruleId: 'r' },
        { filePath: 'b.ts', line: 1, column: 0, message: 'w', severity: 'warning', ruleId: 'r' },
        { filePath: 'c.ts', line: 1, column: 0, message: 'i', severity: 'info', ruleId: 'r' },
        { filePath: 'd.ts', line: 1, column: 0, message: 'h', severity: 'hint', ruleId: 'r' },
      ])
      expect(result[0]!.severity).toBe('error')
      expect(result[1]!.severity).toBe('warning')
      expect(result[2]!.severity).toBe('info')
      expect(result[3]!.severity).toBe('hint')
    })

    it('should default unknown severity to info', () => {
      const result = api.convertToDiagnostics([
        { filePath: 'a.ts', line: 1, column: 0, message: 'm', severity: 'unknown', ruleId: 'r' },
      ])
      expect(result[0]!.severity).toBe('info')
    })

    it('should use endLine from violation when provided', () => {
      const result = api.convertToDiagnostics([
        { filePath: 'a.ts', line: 1, column: 0, endLine: 3, endColumn: 5, message: 'm', severity: 'error', ruleId: 'r' },
      ])
      expect(result[0]!.endLine).toBe(3)
      expect(result[0]!.endColumn).toBe(5)
    })

    it('should default endLine and endColumn when not provided', () => {
      const result = api.convertToDiagnostics([
        { filePath: 'a.ts', line: 5, column: 2, message: 'm', severity: 'error', ruleId: 'r' },
      ])
      expect(result[0]!.endLine).toBe(5)
      expect(result[0]!.endColumn).toBe(3)
    })

    it('should set source to codeforge', () => {
      const result = api.convertToDiagnostics([
        { filePath: 'a.ts', line: 1, column: 0, message: 'm', severity: 'error', ruleId: 'r' },
      ])
      expect(result[0]!.source).toBe('codeforge')
    })

    it('should handle empty violations array', () => {
      const result = api.convertToDiagnostics([])
      expect(result).toEqual([])
    })
  })

  describe('getCommands', () => {
    it('should return commands from config', () => {
      const commands = api.getCommands()
      expect(commands.length).toBe(3)
    })

    it('should return a copy of commands', () => {
      const commands1 = api.getCommands()
      const commands2 = api.getCommands()
      expect(commands1).toEqual(commands2)
      expect(commands1).not.toBe(commands2)
    })

    it('should include analyze command', () => {
      const commands = api.getCommands()
      const analyze = commands.find((c) => c.command === 'codeforge.analyze')
      expect(analyze).toBeDefined()
      expect(analyze!.title).toBe('Analyze Current File')
    })

    it('should include analyzeWorkspace command', () => {
      const commands = api.getCommands()
      const ws = commands.find((c) => c.command === 'codeforge.analyzeWorkspace')
      expect(ws).toBeDefined()
    })

    it('should include fix command', () => {
      const commands = api.getCommands()
      const fix = commands.find((c) => c.command === 'codeforge.fix')
      expect(fix).toBeDefined()
    })
  })

  describe('getDefaultConfiguration', () => {
    it('should return default config values', () => {
      const defaults = api.getDefaultConfiguration()
      expect(defaults['codeforge.enable']).toBe(true)
    })

    it('should include severityLevel default', () => {
      const defaults = api.getDefaultConfiguration()
      expect(defaults['codeforge.severityLevel']).toBe('warning')
    })

    it('should include runOnSave default', () => {
      const defaults = api.getDefaultConfiguration()
      expect(defaults['codeforge.runOnSave']).toBe(true)
    })

    it('should have all three properties', () => {
      const defaults = api.getDefaultConfiguration()
      expect(Object.keys(defaults).length).toBe(3)
    })
  })

  describe('createStatusMessage', () => {
    it('should create running status message', () => {
      const msg = api.createStatusMessage('running')
      expect(msg.type).toBe('statusUpdate')
      const data = msg.data as { status: string }
      expect(data.status).toBe('running')
    })

    it('should create idle status message', () => {
      const msg = api.createStatusMessage('idle')
      expect(msg.type).toBe('statusUpdate')
      const data = msg.data as { status: string }
      expect(data.status).toBe('idle')
    })

    it('should create error status message', () => {
      const msg = api.createStatusMessage('error')
      expect(msg.type).toBe('analysisError')
    })

    it('should include details when provided', () => {
      const msg = api.createStatusMessage('running', 'Analyzing src/')
      const data = msg.data as { details: string | null }
      expect(data.details).toBe('Analyzing src/')
    })

    it('should set details to null when not provided', () => {
      const msg = api.createStatusMessage('idle')
      const data = msg.data as { details: string | null }
      expect(data.details).toBeNull()
    })

    it('should include timestamp', () => {
      const before = Date.now()
      const msg = api.createStatusMessage('running')
      const after = Date.now()
      const data = msg.data as { timestamp: number }
      expect(data.timestamp).toBeGreaterThanOrEqual(before)
      expect(data.timestamp).toBeLessThanOrEqual(after)
    })
  })

  describe('validateConfig', () => {
    it('should return empty array for valid default config', () => {
      const errors = api.validateConfig()
      expect(errors).toEqual([])
    })

    it('should report missing extensionId', () => {
      const a = new ExtensionAPI({ extensionId: '' })
      const errors = a.validateConfig()
      expect(errors).toContain('extensionId is required')
    })

    it('should report missing displayName', () => {
      const a = new ExtensionAPI({ displayName: '' })
      const errors = a.validateConfig()
      expect(errors).toContain('displayName is required')
    })

    it('should report invalid version format', () => {
      const a = new ExtensionAPI({ version: 'invalid' })
      const errors = a.validateConfig()
      expect(errors).toContain('version must follow semver format (e.g., 1.0.0)')
    })

    it('should report missing publisher', () => {
      const a = new ExtensionAPI({ publisher: '' })
      const errors = a.validateConfig()
      expect(errors).toContain('publisher is required')
    })

    it('should report missing main entry point', () => {
      const a = new ExtensionAPI({ main: '' })
      const errors = a.validateConfig()
      expect(errors).toContain('main entry point is required')
    })

    it('should accept valid semver version', () => {
      const a = new ExtensionAPI({ version: '1.2.3-beta.1' })
      const errors = a.validateConfig()
      expect(errors).not.toContain('version must follow semver format (e.g., 1.0.0)')
    })
  })

  describe('diagnostics management', () => {
    it('should start with empty diagnostics', () => {
      expect(api.getDiagnostics()).toEqual([])
    })

    it('should add a diagnostic', () => {
      const d: DiagnosticItem = {
        filePath: 'test.ts',
        line: 1,
        column: 0,
        endLine: 1,
        endColumn: 5,
        message: 'Test',
        severity: 'error',
        ruleId: 'test-rule',
        source: 'codeforge',
      }
      api.addDiagnostic(d)
      expect(api.getDiagnostics().length).toBe(1)
    })

    it('should return all diagnostics', () => {
      api.addDiagnostic({ filePath: 'a.ts', line: 1, column: 0, endLine: 1, endColumn: 1, message: 'e1', severity: 'error', ruleId: 'r1', source: 'codeforge' })
      api.addDiagnostic({ filePath: 'b.ts', line: 2, column: 0, endLine: 2, endColumn: 1, message: 'e2', severity: 'warning', ruleId: 'r2', source: 'codeforge' })
      expect(api.getDiagnostics().length).toBe(2)
    })

    it('should return a copy from getDiagnostics', () => {
      api.addDiagnostic({ filePath: 'a.ts', line: 1, column: 0, endLine: 1, endColumn: 1, message: 'e', severity: 'error', ruleId: 'r', source: 'codeforge' })
      const d1 = api.getDiagnostics()
      const d2 = api.getDiagnostics()
      expect(d1).toEqual(d2)
      expect(d1).not.toBe(d2)
    })

    it('should filter diagnostics by file', () => {
      api.addDiagnostic({ filePath: 'a.ts', line: 1, column: 0, endLine: 1, endColumn: 1, message: 'e1', severity: 'error', ruleId: 'r1', source: 'codeforge' })
      api.addDiagnostic({ filePath: 'b.ts', line: 2, column: 0, endLine: 2, endColumn: 1, message: 'e2', severity: 'error', ruleId: 'r2', source: 'codeforge' })
      api.addDiagnostic({ filePath: 'a.ts', line: 3, column: 0, endLine: 3, endColumn: 1, message: 'e3', severity: 'info', ruleId: 'r3', source: 'codeforge' })
      const filtered = api.getDiagnosticsByFile('a.ts')
      expect(filtered.length).toBe(2)
    })

    it('should return empty array for file with no diagnostics', () => {
      api.addDiagnostic({ filePath: 'a.ts', line: 1, column: 0, endLine: 1, endColumn: 1, message: 'e', severity: 'error', ruleId: 'r', source: 'codeforge' })
      expect(api.getDiagnosticsByFile('other.ts')).toEqual([])
    })

    it('should clear all diagnostics', () => {
      api.addDiagnostic({ filePath: 'a.ts', line: 1, column: 0, endLine: 1, endColumn: 1, message: 'e', severity: 'error', ruleId: 'r', source: 'codeforge' })
      api.clearDiagnostics()
      expect(api.getDiagnostics()).toEqual([])
    })

    it('should be safe to clear when empty', () => {
      api.clearDiagnostics()
      expect(api.getDiagnostics()).toEqual([])
    })
  })
})
