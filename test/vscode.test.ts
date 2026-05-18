import { describe, expect, it } from 'vitest'

import { ExtensionAPI, DEFAULT_VSCODE_CONFIG } from '../src/core/vscode/extension-api.js'

// ─── ExtensionAPI construction ───────────────────────────
describe('ExtensionAPI construction', () => {
  it('creates with default config', () => {
    const api = new ExtensionAPI()
    const config = api.getConfig()
    expect(config.extensionId).toBe('codeforge.codeforge')
    expect(config.displayName).toBe('CodeForge')
    expect(config.version).toBe('0.1.0')
  })

  it('creates with custom config', () => {
    const api = new ExtensionAPI({ displayName: 'Custom' })
    expect(api.getConfig().displayName).toBe('Custom')
  })

  it('does not mutate the default config', () => {
    const api = new ExtensionAPI({ displayName: 'Test' })
    expect(DEFAULT_VSCODE_CONFIG.displayName).toBe('CodeForge')
  })
})

// ─── generateManifest ────────────────────────────────────
describe('ExtensionAPI generateManifest', () => {
  it('generates valid JSON', () => {
    const api = new ExtensionAPI()
    const manifest = api.generateManifest()
    const parsed = JSON.parse(manifest)
    expect(parsed.name).toBe('codeforge.codeforge')
    expect(parsed.contributes).toBeDefined()
  })

  it('includes all required fields', () => {
    const api = new ExtensionAPI()
    const manifest = JSON.parse(api.generateManifest())
    expect(manifest.name).toBeDefined()
    expect(manifest.version).toBeDefined()
    expect(manifest.publisher).toBeDefined()
    expect(manifest.engines).toBeDefined()
    expect(manifest.main).toBeDefined()
  })
})

// ─── convertToDiagnostics ────────────────────────────────
describe('ExtensionAPI convertToDiagnostics', () => {
  it('converts violations to diagnostics', () => {
    const api = new ExtensionAPI()
    const diagnostics = api.convertToDiagnostics([{
      filePath: 'test.ts',
      line: 1,
      column: 5,
      message: 'Error found',
      severity: 'error',
      ruleId: 'test-rule',
    }])
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]!.source).toBe('codeforge')
    expect(diagnostics[0]!.severity).toBe('error')
    expect(diagnostics[0]!.endLine).toBe(1)
    expect(diagnostics[0]!.endColumn).toBe(6)
  })

  it('maps severity correctly', () => {
    const api = new ExtensionAPI()
    const diag = api.convertToDiagnostics([{
      filePath: 'test.ts', line: 1, column: 1,
      message: 'warn', severity: 'warning', ruleId: 'r',
    }])
    expect(diag[0]!.severity).toBe('warning')
  })

  it('uses default endLine/endColumn when not provided', () => {
    const api = new ExtensionAPI()
    const diag = api.convertToDiagnostics([{
      filePath: 'test.ts', line: 3, column: 7,
      message: 'info', severity: 'info', ruleId: 'r',
    }])
    expect(diag[0]!.endLine).toBe(3)
    expect(diag[0]!.endColumn).toBe(8)
  })
})

// ─── getCommands ─────────────────────────────────────────
describe('ExtensionAPI getCommands', () => {
  it('returns configured commands', () => {
    const api = new ExtensionAPI()
    const commands = api.getCommands()
    expect(commands.length).toBeGreaterThan(0)
    expect(commands[0]!.command).toContain('codeforge')
  })
})

// ─── getDefaultConfiguration ─────────────────────────────
describe('ExtensionAPI getDefaultConfiguration', () => {
  it('returns default config values', () => {
    const api = new ExtensionAPI()
    const defaults = api.getDefaultConfiguration()
    expect(defaults['codeforge.enable']).toBe(true)
    expect(defaults['codeforge.severityLevel']).toBe('warning')
  })
})

// ─── createStatusMessage ─────────────────────────────────
describe('ExtensionAPI createStatusMessage', () => {
  it('creates running status', () => {
    const api = new ExtensionAPI()
    const msg = api.createStatusMessage('running')
    expect(msg.type).toBe('statusUpdate')
    expect((msg.data as Record<string, unknown>).status).toBe('running')
  })

  it('creates error status', () => {
    const api = new ExtensionAPI()
    const msg = api.createStatusMessage('error', 'something failed')
    expect(msg.type).toBe('analysisError')
    expect((msg.data as Record<string, unknown>).details).toBe('something failed')
  })

  it('includes timestamp', () => {
    const api = new ExtensionAPI()
    const msg = api.createStatusMessage('idle')
    expect(typeof (msg.data as Record<string, unknown>).timestamp).toBe('number')
  })
})

// ─── validateConfig ──────────────────────────────────────
describe('ExtensionAPI validateConfig', () => {
  it('passes validation for default config', () => {
    const api = new ExtensionAPI()
    expect(api.validateConfig()).toHaveLength(0)
  })

  it('fails for empty extensionId', () => {
    const api = new ExtensionAPI({ extensionId: '' })
    const errors = api.validateConfig()
    expect(errors).toContain('extensionId is required')
  })

  it('fails for invalid version', () => {
    const api = new ExtensionAPI({ version: 'abc' })
    const errors = api.validateConfig()
    expect(errors.some((e) => e.includes('version'))).toBe(true)
  })

  it('fails for missing publisher', () => {
    const api = new ExtensionAPI({ publisher: '' })
    const errors = api.validateConfig()
    expect(errors).toContain('publisher is required')
  })
})

// ─── diagnostics management ──────────────────────────────
describe('ExtensionAPI diagnostics management', () => {
  it('addDiagnostic and getDiagnostics', () => {
    const api = new ExtensionAPI()
    api.addDiagnostic({
      filePath: 'a.ts', line: 1, column: 1, endLine: 1, endColumn: 2,
      message: 'test', severity: 'error', ruleId: 'r', source: 'codeforge',
    })
    expect(api.getDiagnostics()).toHaveLength(1)
  })

  it('getDiagnosticsByFile filters correctly', () => {
    const api = new ExtensionAPI()
    api.addDiagnostic({
      filePath: 'a.ts', line: 1, column: 1, endLine: 1, endColumn: 2,
      message: 'test', severity: 'error', ruleId: 'r', source: 'codeforge',
    })
    api.addDiagnostic({
      filePath: 'b.ts', line: 2, column: 1, endLine: 2, endColumn: 2,
      message: 'test2', severity: 'warning', ruleId: 'r', source: 'codeforge',
    })
    expect(api.getDiagnosticsByFile('a.ts')).toHaveLength(1)
    expect(api.getDiagnosticsByFile('b.ts')).toHaveLength(1)
    expect(api.getDiagnosticsByFile('c.ts')).toHaveLength(0)
  })

  it('clearDiagnostics clears all', () => {
    const api = new ExtensionAPI()
    api.addDiagnostic({
      filePath: 'a.ts', line: 1, column: 1, endLine: 1, endColumn: 2,
      message: 'test', severity: 'error', ruleId: 'r', source: 'codeforge',
    })
    api.clearDiagnostics()
    expect(api.getDiagnostics()).toHaveLength(0)
  })
})
