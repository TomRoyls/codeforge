import { describe, it, expect } from 'vitest'
import { ExtensionAPI, DEFAULT_VSCODE_CONFIG } from '../../src/core/vscode/index.js'
import type {
  VSCodeExtensionConfig,
  VSCodeCommand,
  VSCodeConfiguration,
  VSCodeProperty,
  VSCodeLanguage,
  DiagnosticItem,
  ExtensionMessage,
} from '../../src/core/vscode/index.js'

const VALID_DIAGNOSTIC: DiagnosticItem = {
  filePath: '/src/index.ts',
  line: 10,
  column: 5,
  endLine: 10,
  endColumn: 15,
  message: 'Unexpected token',
  severity: 'error',
  ruleId: 'no-syntax-error',
  source: 'codeforge',
}

function makeConfig(overrides: Partial<VSCodeExtensionConfig> = {}): VSCodeExtensionConfig {
  return { ...DEFAULT_VSCODE_CONFIG, ...overrides }
}

describe('DEFAULT_VSCODE_CONFIG', () => {
  it('has correct extensionId', () => {
    expect(DEFAULT_VSCODE_CONFIG.extensionId).toBe('codeforge.codeforge')
  })

  it('has correct displayName', () => {
    expect(DEFAULT_VSCODE_CONFIG.displayName).toBe('CodeForge')
  })

  it('has correct version', () => {
    expect(DEFAULT_VSCODE_CONFIG.version).toBe('0.1.0')
  })

  it('has correct publisher', () => {
    expect(DEFAULT_VSCODE_CONFIG.publisher).toBe('codeforge')
  })

  it('has correct engine constraint', () => {
    expect(DEFAULT_VSCODE_CONFIG.engines.vscode).toBe('^1.85.0')
  })

  it('has correct categories', () => {
    expect(DEFAULT_VSCODE_CONFIG.categories).toEqual(['Linters', 'Programming Languages'])
  })

  it('has correct activationEvents', () => {
    expect(DEFAULT_VSCODE_CONFIG.activationEvents).toEqual([
      'onLanguage:typescript',
      'onLanguage:javascript',
    ])
  })

  it('has correct main entry', () => {
    expect(DEFAULT_VSCODE_CONFIG.main).toBe('./dist/extension.js')
  })

  it('has three commands', () => {
    expect(DEFAULT_VSCODE_CONFIG.contributes.commands).toHaveLength(3)
  })

  it('has analyze command with correct properties', () => {
    const cmd = DEFAULT_VSCODE_CONFIG.contributes.commands[0]!
    expect(cmd.command).toBe('codeforge.analyze')
    expect(cmd.title).toBe('Analyze Current File')
    expect(cmd.category).toBe('CodeForge')
    expect(cmd.icon).toBe('$(search)')
  })

  it('has analyzeWorkspace command', () => {
    const cmd = DEFAULT_VSCODE_CONFIG.contributes.commands[1]!
    expect(cmd.command).toBe('codeforge.analyzeWorkspace')
    expect(cmd.title).toBe('Analyze Workspace')
  })

  it('has fix command', () => {
    const cmd = DEFAULT_VSCODE_CONFIG.contributes.commands[2]!
    expect(cmd.command).toBe('codeforge.fix')
    expect(cmd.title).toBe('Fix Violations')
  })

  it('has configuration with correct title', () => {
    expect(DEFAULT_VSCODE_CONFIG.contributes.configuration.title).toBe('CodeForge')
  })

  it('has enable property as boolean', () => {
    const prop = DEFAULT_VSCODE_CONFIG.contributes.configuration.properties['codeforge.enable']!
    expect(prop.type).toBe('boolean')
    expect(prop.default).toBe(true)
  })

  it('has severityLevel property with enum', () => {
    const prop = DEFAULT_VSCODE_CONFIG.contributes.configuration.properties['codeforge.severityLevel']!
    expect(prop.type).toBe('string')
    expect(prop.default).toBe('warning')
    expect(prop.enum).toEqual(['error', 'warning', 'info'])
  })

  it('has runOnSave property as boolean', () => {
    const prop = DEFAULT_VSCODE_CONFIG.contributes.configuration.properties['codeforge.runOnSave']!
    expect(prop.type).toBe('boolean')
    expect(prop.default).toBe(true)
  })

  it('has two language contributions', () => {
    expect(DEFAULT_VSCODE_CONFIG.contributes.languages).toHaveLength(2)
  })

  it('has typescript language with extensions', () => {
    const lang = DEFAULT_VSCODE_CONFIG.contributes.languages[0]!
    expect(lang.id).toBe('typescript')
    expect(lang.extensions).toEqual(['.ts', '.tsx'])
  })

  it('has javascript language with extensions', () => {
    const lang = DEFAULT_VSCODE_CONFIG.contributes.languages[1]!
    expect(lang.id).toBe('javascript')
    expect(lang.extensions).toEqual(['.js', '.jsx'])
  })

  it('satisfies VSCodeExtensionConfig type at runtime', () => {
    const config: VSCodeExtensionConfig = DEFAULT_VSCODE_CONFIG
    expect(config.extensionId).toBeTruthy()
    expect(config.contributes.commands.length).toBeGreaterThan(0)
  })
})

describe('ExtensionAPI constructor', () => {
  it('creates instance with default config when no args', () => {
    const api = new ExtensionAPI()
    expect(api.getConfig().extensionId).toBe('codeforge.codeforge')
  })

  it('creates instance with undefined config arg', () => {
    const api = new ExtensionAPI(undefined)
    expect(api.getConfig().displayName).toBe('CodeForge')
  })

  it('overrides extensionId via partial config', () => {
    const api = new ExtensionAPI({ extensionId: 'custom.ext' })
    expect(api.getConfig().extensionId).toBe('custom.ext')
  })

  it('overrides displayName via partial config', () => {
    const api = new ExtensionAPI({ displayName: 'Custom' })
    expect(api.getConfig().displayName).toBe('Custom')
  })

  it('overrides version via partial config', () => {
    const api = new ExtensionAPI({ version: '2.0.0' })
    expect(api.getConfig().version).toBe('2.0.0')
  })

  it('overrides publisher via partial config', () => {
    const api = new ExtensionAPI({ publisher: 'my-publisher' })
    expect(api.getConfig().publisher).toBe('my-publisher')
  })

  it('preserves non-overridden defaults', () => {
    const api = new ExtensionAPI({ version: '3.0.0' })
    const cfg = api.getConfig()
    expect(cfg.extensionId).toBe('codeforge.codeforge')
    expect(cfg.displayName).toBe('CodeForge')
    expect(cfg.publisher).toBe('codeforge')
  })

  it('initializes with empty diagnostics', () => {
    const api = new ExtensionAPI()
    expect(api.getDiagnostics()).toEqual([])
  })
})

describe('ExtensionAPI.getConfig', () => {
  it('returns a copy of the config', () => {
    const api = new ExtensionAPI()
    const cfg1 = api.getConfig()
    const cfg2 = api.getConfig()
    expect(cfg1).toEqual(cfg2)
    expect(cfg1).not.toBe(cfg2)
  })

  it('returns object matching DEFAULT_VSCODE_CONFIG for default instance', () => {
    const api = new ExtensionAPI()
    expect(api.getConfig()).toEqual(DEFAULT_VSCODE_CONFIG)
  })

  it('returns overridden values', () => {
    const api = new ExtensionAPI({ extensionId: 'test.test', version: '5.0.0' })
    const cfg = api.getConfig()
    expect(cfg.extensionId).toBe('test.test')
    expect(cfg.version).toBe('5.0.0')
  })

  it('does not allow external mutation of internal config', () => {
    const api = new ExtensionAPI()
    const cfg = api.getConfig()
    cfg.extensionId = 'mutated'
    expect(api.getConfig().extensionId).toBe('codeforge.codeforge')
  })
})

describe('ExtensionAPI.generateManifest', () => {
  it('returns valid JSON string', () => {
    const api = new ExtensionAPI()
    const manifest = api.generateManifest()
    expect(() => JSON.parse(manifest)).not.toThrow()
  })

  it('includes name field matching extensionId', () => {
    const api = new ExtensionAPI()
    const parsed = JSON.parse(api.generateManifest())
    expect(parsed.name).toBe('codeforge.codeforge')
  })

  it('includes displayName', () => {
    const api = new ExtensionAPI()
    const parsed = JSON.parse(api.generateManifest())
    expect(parsed.displayName).toBe('CodeForge')
  })

  it('includes version', () => {
    const api = new ExtensionAPI()
    const parsed = JSON.parse(api.generateManifest())
    expect(parsed.version).toBe('0.1.0')
  })

  it('includes publisher', () => {
    const api = new ExtensionAPI()
    const parsed = JSON.parse(api.generateManifest())
    expect(parsed.publisher).toBe('codeforge')
  })

  it('includes engines', () => {
    const api = new ExtensionAPI()
    const parsed = JSON.parse(api.generateManifest())
    expect(parsed.engines).toEqual({ vscode: '^1.85.0' })
  })

  it('includes categories', () => {
    const api = new ExtensionAPI()
    const parsed = JSON.parse(api.generateManifest())
    expect(parsed.categories).toEqual(['Linters', 'Programming Languages'])
  })

  it('includes activationEvents', () => {
    const api = new ExtensionAPI()
    const parsed = JSON.parse(api.generateManifest())
    expect(parsed.activationEvents).toEqual(['onLanguage:typescript', 'onLanguage:javascript'])
  })

  it('includes main entry', () => {
    const api = new ExtensionAPI()
    const parsed = JSON.parse(api.generateManifest())
    expect(parsed.main).toBe('./dist/extension.js')
  })

  it('includes contributes section', () => {
    const api = new ExtensionAPI()
    const parsed = JSON.parse(api.generateManifest())
    expect(parsed.contributes).toBeDefined()
    expect(parsed.contributes.commands).toHaveLength(3)
  })

  it('formats with 2-space indentation', () => {
    const api = new ExtensionAPI()
    const manifest = api.generateManifest()
    expect(manifest).toContain('  "name"')
  })

  it('reflects custom config overrides', () => {
    const api = new ExtensionAPI({ extensionId: 'x.y', version: '9.9.9' })
    const parsed = JSON.parse(api.generateManifest())
    expect(parsed.name).toBe('x.y')
    expect(parsed.version).toBe('9.9.9')
  })
})

describe('ExtensionAPI.convertToDiagnostics', () => {
  it('converts empty array', () => {
    const api = new ExtensionAPI()
    expect(api.convertToDiagnostics([])).toEqual([])
  })

  it('converts single violation', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      {
        filePath: '/a.ts',
        line: 1,
        column: 1,
        message: 'err',
        severity: 'error',
        ruleId: 'rule1',
      },
    ])
    expect(result).toHaveLength(1)
    expect(result[0]!.filePath).toBe('/a.ts')
    expect(result[0]!.line).toBe(1)
    expect(result[0]!.column).toBe(1)
    expect(result[0]!.endLine).toBe(1)
    expect(result[0]!.endColumn).toBe(2)
    expect(result[0]!.message).toBe('err')
    expect(result[0]!.severity).toBe('error')
    expect(result[0]!.ruleId).toBe('rule1')
    expect(result[0]!.source).toBe('codeforge')
  })

  it('uses provided endLine and endColumn', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      {
        filePath: '/b.ts',
        line: 5,
        column: 3,
        endLine: 8,
        endColumn: 10,
        message: 'warn',
        severity: 'warning',
        ruleId: 'rule2',
      },
    ])
    expect(result[0]!.endLine).toBe(8)
    expect(result[0]!.endColumn).toBe(10)
  })

  it('defaults endLine to line when not provided', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      {
        filePath: '/c.ts',
        line: 7,
        column: 2,
        message: 'info',
        severity: 'info',
        ruleId: 'rule3',
      },
    ])
    expect(result[0]!.endLine).toBe(7)
  })

  it('defaults endColumn to column + 1 when not provided', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      {
        filePath: '/d.ts',
        line: 1,
        column: 4,
        message: 'msg',
        severity: 'hint',
        ruleId: 'rule4',
      },
    ])
    expect(result[0]!.endColumn).toBe(5)
  })

  it('maps error severity correctly', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      { filePath: '/x', line: 1, column: 1, message: '', severity: 'error', ruleId: 'r' },
    ])
    expect(result[0]!.severity).toBe('error')
  })

  it('maps warning severity correctly', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      { filePath: '/x', line: 1, column: 1, message: '', severity: 'warning', ruleId: 'r' },
    ])
    expect(result[0]!.severity).toBe('warning')
  })

  it('maps info severity correctly', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      { filePath: '/x', line: 1, column: 1, message: '', severity: 'info', ruleId: 'r' },
    ])
    expect(result[0]!.severity).toBe('info')
  })

  it('maps hint severity correctly', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      { filePath: '/x', line: 1, column: 1, message: '', severity: 'hint', ruleId: 'r' },
    ])
    expect(result[0]!.severity).toBe('hint')
  })

  it('maps unknown severity to info', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      { filePath: '/x', line: 1, column: 1, message: '', severity: 'unknown', ruleId: 'r' },
    ])
    expect(result[0]!.severity).toBe('info')
  })

  it('always sets source to codeforge', () => {
    const api = new ExtensionAPI()
    const results = api.convertToDiagnostics([
      { filePath: '/a', line: 1, column: 1, message: '', severity: 'error', ruleId: 'r1' },
      { filePath: '/b', line: 2, column: 2, message: '', severity: 'warning', ruleId: 'r2' },
    ])
    expect(results.every((d) => d.source === 'codeforge')).toBe(true)
  })

  it('converts multiple violations preserving order', () => {
    const api = new ExtensionAPI()
    const results = api.convertToDiagnostics([
      { filePath: '/first', line: 1, column: 1, message: 'first', severity: 'error', ruleId: 'a' },
      { filePath: '/second', line: 2, column: 2, message: 'second', severity: 'warning', ruleId: 'b' },
      { filePath: '/third', line: 3, column: 3, message: 'third', severity: 'info', ruleId: 'c' },
    ])
    expect(results).toHaveLength(3)
    expect(results[0]!.filePath).toBe('/first')
    expect(results[1]!.filePath).toBe('/second')
    expect(results[2]!.filePath).toBe('/third')
  })

  it('handles violations with column 0', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      { filePath: '/z', line: 1, column: 0, message: 'm', severity: 'error', ruleId: 'r' },
    ])
    expect(result[0]!.endColumn).toBe(1)
  })

  it('handles violations with large line numbers', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      { filePath: '/big', line: 99999, column: 100, message: 'm', severity: 'error', ruleId: 'r' },
    ])
    expect(result[0]!.endLine).toBe(99999)
    expect(result[0]!.endColumn).toBe(101)
  })
})

describe('ExtensionAPI.getCommands', () => {
  it('returns default commands', () => {
    const api = new ExtensionAPI()
    const cmds = api.getCommands()
    expect(cmds).toHaveLength(3)
  })

  it('returns a copy of the commands array', () => {
    const api = new ExtensionAPI()
    const cmds1 = api.getCommands()
    const cmds2 = api.getCommands()
    expect(cmds1).not.toBe(cmds2)
  })

  it('preserves command properties', () => {
    const api = new ExtensionAPI()
    const cmds = api.getCommands()
    const analyze = cmds.find((c) => c.command === 'codeforge.analyze')
    expect(analyze).toBeDefined()
    expect(analyze!.title).toBe('Analyze Current File')
    expect(analyze!.category).toBe('CodeForge')
    expect(analyze!.icon).toBe('$(search)')
  })

  it('returns commands from custom config', () => {
    const api = new ExtensionAPI({
      contributes: {
        commands: [{ command: 'custom.run', title: 'Run Custom' }],
        configuration: DEFAULT_VSCODE_CONFIG.contributes.configuration,
        languages: DEFAULT_VSCODE_CONFIG.contributes.languages,
      },
    })
    const cmds = api.getCommands()
    expect(cmds).toHaveLength(1)
    expect(cmds[0]!.command).toBe('custom.run')
  })

  it('mutation of returned array does not affect internal state', () => {
    const api = new ExtensionAPI()
    const cmds = api.getCommands()
    cmds.push({ command: 'injected', title: 'Injected' })
    expect(api.getCommands()).toHaveLength(3)
  })
})

describe('ExtensionAPI.getDefaultConfiguration', () => {
  it('returns all default values', () => {
    const api = new ExtensionAPI()
    const defaults = api.getDefaultConfiguration()
    expect(defaults['codeforge.enable']).toBe(true)
    expect(defaults['codeforge.severityLevel']).toBe('warning')
    expect(defaults['codeforge.runOnSave']).toBe(true)
  })

  it('returns correct number of properties', () => {
    const api = new ExtensionAPI()
    const defaults = api.getDefaultConfiguration()
    expect(Object.keys(defaults)).toHaveLength(3)
  })

  it('reflects custom configuration properties', () => {
    const api = new ExtensionAPI({
      contributes: {
        commands: DEFAULT_VSCODE_CONFIG.contributes.commands,
        configuration: {
          title: 'Custom',
          properties: {
            'custom.flag': { type: 'boolean', default: false, description: 'A flag' },
            'custom.name': { type: 'string', default: 'test', description: 'A name' },
          },
        },
        languages: DEFAULT_VSCODE_CONFIG.contributes.languages,
      },
    })
    const defaults = api.getDefaultConfiguration()
    expect(defaults['custom.flag']).toBe(false)
    expect(defaults['custom.name']).toBe('test')
    expect(Object.keys(defaults)).toHaveLength(2)
  })
})

describe('ExtensionAPI.createStatusMessage', () => {
  it('creates running status message', () => {
    const api = new ExtensionAPI()
    const msg = api.createStatusMessage('running')
    expect(msg.type).toBe('statusUpdate')
    expect(msg.data).toBeDefined()
  })

  it('creates idle status message', () => {
    const api = new ExtensionAPI()
    const msg = api.createStatusMessage('idle')
    expect(msg.type).toBe('statusUpdate')
  })

  it('creates error status message', () => {
    const api = new ExtensionAPI()
    const msg = api.createStatusMessage('error')
    expect(msg.type).toBe('analysisError')
  })

  it('includes details when provided', () => {
    const api = new ExtensionAPI()
    const msg = api.createStatusMessage('running', 'Analyzing src/')
    const data = msg.data as { details: string }
    expect(data.details).toBe('Analyzing src/')
  })

  it('sets details to null when not provided', () => {
    const api = new ExtensionAPI()
    const msg = api.createStatusMessage('idle')
    const data = msg.data as { details: null }
    expect(data.details).toBeNull()
  })

  it('includes timestamp in data', () => {
    const api = new ExtensionAPI()
    const before = Date.now()
    const msg = api.createStatusMessage('running')
    const after = Date.now()
    const data = msg.data as { timestamp: number }
    expect(data.timestamp).toBeGreaterThanOrEqual(before)
    expect(data.timestamp).toBeLessThanOrEqual(after)
  })

  it('includes status in data', () => {
    const api = new ExtensionAPI()
    const msg = api.createStatusMessage('error', 'crashed')
    const data = msg.data as { status: string }
    expect(data.status).toBe('error')
  })

  it('returns ExtensionMessage type', () => {
    const api = new ExtensionAPI()
    const msg: ExtensionMessage = api.createStatusMessage('running')
    expect(['analysisComplete', 'analysisError', 'configChanged', 'statusUpdate']).toContain(msg.type)
  })
})

describe('ExtensionAPI.validateConfig', () => {
  it('returns empty array for valid default config', () => {
    const api = new ExtensionAPI()
    expect(api.validateConfig()).toEqual([])
  })

  it('reports missing extensionId', () => {
    const api = new ExtensionAPI({ extensionId: '' })
    const errors = api.validateConfig()
    expect(errors).toContain('extensionId is required')
  })

  it('reports whitespace-only extensionId', () => {
    const api = new ExtensionAPI({ extensionId: '   ' })
    const errors = api.validateConfig()
    expect(errors).toContain('extensionId is required')
  })

  it('reports missing displayName', () => {
    const api = new ExtensionAPI({ displayName: '' })
    const errors = api.validateConfig()
    expect(errors).toContain('displayName is required')
  })

  it('reports whitespace-only displayName', () => {
    const api = new ExtensionAPI({ displayName: '   ' })
    const errors = api.validateConfig()
    expect(errors).toContain('displayName is required')
  })

  it('reports missing version', () => {
    const api = new ExtensionAPI({ version: '' })
    const errors = api.validateConfig()
    expect(errors).toContain('version must follow semver format (e.g., 1.0.0)')
  })

  it('reports invalid version format', () => {
    const api = new ExtensionAPI({ version: 'abc' })
    const errors = api.validateConfig()
    expect(errors).toContain('version must follow semver format (e.g., 1.0.0)')
  })

  it('accepts valid semver version', () => {
    const api = new ExtensionAPI({ version: '1.2.3' })
    const errors = api.validateConfig()
    expect(errors).not.toContain('version must follow semver format (e.g., 1.0.0)')
  })

  it('accepts semver version with prerelease', () => {
    const api = new ExtensionAPI({ version: '1.0.0-beta.1' })
    const errors = api.validateConfig()
    expect(errors).not.toContain('version must follow semver format (e.g., 1.0.0)')
  })

  it('reports missing publisher', () => {
    const api = new ExtensionAPI({ publisher: '' })
    const errors = api.validateConfig()
    expect(errors).toContain('publisher is required')
  })

  it('reports whitespace-only publisher', () => {
    const api = new ExtensionAPI({ publisher: '   ' })
    const errors = api.validateConfig()
    expect(errors).toContain('publisher is required')
  })

  it('reports missing engines.vscode', () => {
    const api = new ExtensionAPI({ engines: { vscode: '' } })
    const errors = api.validateConfig()
    expect(errors).toContain('engines.vscode is required')
  })

  it('reports missing main entry', () => {
    const api = new ExtensionAPI({ main: '' })
    const errors = api.validateConfig()
    expect(errors).toContain('main entry point is required')
  })

  it('reports whitespace-only main entry', () => {
    const api = new ExtensionAPI({ main: '   ' })
    const errors = api.validateConfig()
    expect(errors).toContain('main entry point is required')
  })

  it('reports empty commands array', () => {
    const api = new ExtensionAPI({
      contributes: {
        commands: [],
        configuration: DEFAULT_VSCODE_CONFIG.contributes.configuration,
        languages: DEFAULT_VSCODE_CONFIG.contributes.languages,
      },
    })
    const errors = api.validateConfig()
    expect(errors).toContain('at least one command must be defined')
  })

  it('reports missing configuration', () => {
    const api = new ExtensionAPI({
      contributes: {
        commands: DEFAULT_VSCODE_CONFIG.contributes.commands,
        configuration: undefined as unknown as VSCodeConfiguration,
        languages: DEFAULT_VSCODE_CONFIG.contributes.languages,
      },
    })
    const errors = api.validateConfig()
    expect(errors).toContain('configuration is required')
  })

  it('returns multiple errors for multiple invalid fields', () => {
    const api = new ExtensionAPI({
      extensionId: '',
      displayName: '',
      version: 'x',
      publisher: '',
    })
    const errors = api.validateConfig()
    expect(errors.length).toBeGreaterThanOrEqual(4)
  })

  it('returns only relevant errors', () => {
    const api = new ExtensionAPI({ extensionId: '' })
    const errors = api.validateConfig()
    expect(errors).toEqual(['extensionId is required'])
  })
})

describe('ExtensionAPI diagnostics management', () => {
  it('starts with empty diagnostics', () => {
    const api = new ExtensionAPI()
    expect(api.getDiagnostics()).toEqual([])
  })

  it('addDiagnostic adds a single item', () => {
    const api = new ExtensionAPI()
    api.addDiagnostic(VALID_DIAGNOSTIC)
    expect(api.getDiagnostics()).toHaveLength(1)
  })

  it('getDiagnostics returns a copy', () => {
    const api = new ExtensionAPI()
    api.addDiagnostic(VALID_DIAGNOSTIC)
    const d1 = api.getDiagnostics()
    const d2 = api.getDiagnostics()
    expect(d1).not.toBe(d2)
  })

  it('addDiagnostic preserves item properties', () => {
    const api = new ExtensionAPI()
    api.addDiagnostic(VALID_DIAGNOSTIC)
    const d = api.getDiagnostics()[0]!
    expect(d.filePath).toBe(VALID_DIAGNOSTIC.filePath)
    expect(d.line).toBe(VALID_DIAGNOSTIC.line)
    expect(d.column).toBe(VALID_DIAGNOSTIC.column)
    expect(d.endLine).toBe(VALID_DIAGNOSTIC.endLine)
    expect(d.endColumn).toBe(VALID_DIAGNOSTIC.endColumn)
    expect(d.message).toBe(VALID_DIAGNOSTIC.message)
    expect(d.severity).toBe(VALID_DIAGNOSTIC.severity)
    expect(d.ruleId).toBe(VALID_DIAGNOSTIC.ruleId)
    expect(d.source).toBe(VALID_DIAGNOSTIC.source)
  })

  it('addDiagnostic adds multiple items in order', () => {
    const api = new ExtensionAPI()
    const d1: DiagnosticItem = { ...VALID_DIAGNOSTIC, message: 'first' }
    const d2: DiagnosticItem = { ...VALID_DIAGNOSTIC, message: 'second' }
    api.addDiagnostic(d1)
    api.addDiagnostic(d2)
    const diags = api.getDiagnostics()
    expect(diags).toHaveLength(2)
    expect(diags[0]!.message).toBe('first')
    expect(diags[1]!.message).toBe('second')
  })

  it('clearDiagnostics removes all items', () => {
    const api = new ExtensionAPI()
    api.addDiagnostic(VALID_DIAGNOSTIC)
    api.addDiagnostic(VALID_DIAGNOSTIC)
    expect(api.getDiagnostics()).toHaveLength(2)
    api.clearDiagnostics()
    expect(api.getDiagnostics()).toEqual([])
  })

  it('clearDiagnostics on empty is safe', () => {
    const api = new ExtensionAPI()
    expect(() => api.clearDiagnostics()).not.toThrow()
    expect(api.getDiagnostics()).toEqual([])
  })

  it('getDiagnosticsByFile filters correctly', () => {
    const api = new ExtensionAPI()
    const d1: DiagnosticItem = { ...VALID_DIAGNOSTIC, filePath: '/a.ts' }
    const d2: DiagnosticItem = { ...VALID_DIAGNOSTIC, filePath: '/b.ts' }
    const d3: DiagnosticItem = { ...VALID_DIAGNOSTIC, filePath: '/a.ts' }
    api.addDiagnostic(d1)
    api.addDiagnostic(d2)
    api.addDiagnostic(d3)
    expect(api.getDiagnosticsByFile('/a.ts')).toHaveLength(2)
    expect(api.getDiagnosticsByFile('/b.ts')).toHaveLength(1)
  })

  it('getDiagnosticsByFile returns empty for no match', () => {
    const api = new ExtensionAPI()
    api.addDiagnostic(VALID_DIAGNOSTIC)
    expect(api.getDiagnosticsByFile('/nonexistent.ts')).toEqual([])
  })

  it('getDiagnosticsByFile requires exact match', () => {
    const api = new ExtensionAPI()
    api.addDiagnostic({ ...VALID_DIAGNOSTIC, filePath: '/src/index.ts' })
    expect(api.getDiagnosticsByFile('/src/index')).toEqual([])
    expect(api.getDiagnosticsByFile('index.ts')).toEqual([])
  })

  it('addDiagnostic after clear works', () => {
    const api = new ExtensionAPI()
    api.addDiagnostic(VALID_DIAGNOSTIC)
    api.clearDiagnostics()
    const newDiag: DiagnosticItem = { ...VALID_DIAGNOSTIC, message: 'new' }
    api.addDiagnostic(newDiag)
    expect(api.getDiagnostics()).toHaveLength(1)
    expect(api.getDiagnostics()[0]!.message).toBe('new')
  })

  it('handles diagnostics with different severity levels', () => {
    const api = new ExtensionAPI()
    const severities: Array<DiagnosticItem['severity']> = ['error', 'warning', 'info', 'hint']
    for (const sev of severities) {
      api.addDiagnostic({ ...VALID_DIAGNOSTIC, severity: sev })
    }
    const diags = api.getDiagnostics()
    expect(diags).toHaveLength(4)
    expect(diags.map((d) => d.severity)).toEqual(severities)
  })

  it('getDiagnosticsByFile returns copy', () => {
    const api = new ExtensionAPI()
    api.addDiagnostic(VALID_DIAGNOSTIC)
    const r1 = api.getDiagnosticsByFile(VALID_DIAGNOSTIC.filePath)
    const r2 = api.getDiagnosticsByFile(VALID_DIAGNOSTIC.filePath)
    expect(r1).not.toBe(r2)
  })
})

describe('Type interfaces runtime shape', () => {
  it('VSCodeCommand has expected shape', () => {
    const cmd: VSCodeCommand = {
      command: 'test.run',
      title: 'Run Test',
    }
    expect(cmd.command).toBe('test.run')
    expect(cmd.title).toBe('Run Test')
    expect(cmd.category).toBeUndefined()
    expect(cmd.icon).toBeUndefined()
  })

  it('VSCodeCommand with optional fields', () => {
    const cmd: VSCodeCommand = {
      command: 'test.run',
      title: 'Run Test',
      category: 'Test',
      icon: '$(play)',
    }
    expect(cmd.category).toBe('Test')
    expect(cmd.icon).toBe('$(play)')
  })

  it('VSCodeProperty has expected shape', () => {
    const prop: VSCodeProperty = {
      type: 'string',
      default: 'value',
      description: 'A property',
    }
    expect(prop.type).toBe('string')
    expect(prop.default).toBe('value')
    expect(prop.description).toBe('A property')
    expect(prop.enum).toBeUndefined()
  })

  it('VSCodeProperty with enum', () => {
    const prop: VSCodeProperty = {
      type: 'string',
      default: 'a',
      description: 'desc',
      enum: ['a', 'b', 'c'],
    }
    expect(prop.enum).toEqual(['a', 'b', 'c'])
  })

  it('DiagnosticItem has expected shape', () => {
    const diag: DiagnosticItem = {
      filePath: '/test.ts',
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 5,
      message: 'test error',
      severity: 'error',
      ruleId: 'test-rule',
      source: 'test',
    }
    expect(diag.filePath).toBe('/test.ts')
    expect(diag.severity).toBe('error')
  })

  it('DiagnosticItem supports all severity levels', () => {
    const severities: Array<DiagnosticItem['severity']> = ['error', 'warning', 'info', 'hint']
    expect(severities).toHaveLength(4)
  })

  it('ExtensionMessage supports all types', () => {
    const types: Array<ExtensionMessage['type']> = [
      'analysisComplete',
      'analysisError',
      'configChanged',
      'statusUpdate',
    ]
    expect(types).toHaveLength(4)
  })

  it('VSCodeLanguage has expected shape', () => {
    const lang: VSCodeLanguage = {
      id: 'python',
      extensions: ['.py'],
      aliases: ['Python'],
    }
    expect(lang.id).toBe('python')
    expect(lang.extensions).toEqual(['.py'])
  })

  it('VSCodeConfiguration has expected shape', () => {
    const config: VSCodeConfiguration = {
      title: 'Test',
      properties: {
        'test.opt': { type: 'boolean', default: true, description: 'A flag' },
      },
    }
    expect(config.title).toBe('Test')
    expect(config.properties['test.opt']).toBeDefined()
  })
})

describe('Stress scenarios', () => {
  it('handles many diagnostics', () => {
    const api = new ExtensionAPI()
    for (let i = 0; i < 1000; i++) {
      api.addDiagnostic({
        ...VALID_DIAGNOSTIC,
        line: i,
        message: `Error ${i}`,
      })
    }
    expect(api.getDiagnostics()).toHaveLength(1000)
  })

  it('handles many convertToDiagnostics calls', () => {
    const api = new ExtensionAPI()
    const violations = Array.from({ length: 500 }, (_, i) => ({
      filePath: `/file${i}.ts`,
      line: i + 1,
      column: 1,
      message: `Error ${i}`,
      severity: 'error',
      ruleId: `rule-${i}`,
    }))
    const result = api.convertToDiagnostics(violations)
    expect(result).toHaveLength(500)
    expect(result[499]!.filePath).toBe('/file499.ts')
  })

  it('handles mixed add and clear operations', () => {
    const api = new ExtensionAPI()
    api.addDiagnostic(VALID_DIAGNOSTIC)
    api.clearDiagnostics()
    api.addDiagnostic(VALID_DIAGNOSTIC)
    api.addDiagnostic(VALID_DIAGNOSTIC)
    api.clearDiagnostics()
    api.addDiagnostic(VALID_DIAGNOSTIC)
    expect(api.getDiagnostics()).toHaveLength(1)
  })

  it('handles repeated validateConfig calls', () => {
    const api = new ExtensionAPI()
    for (let i = 0; i < 100; i++) {
      expect(api.validateConfig()).toEqual([])
    }
  })

  it('handles repeated generateManifest calls', () => {
    const api = new ExtensionAPI()
    const first = api.generateManifest()
    for (let i = 0; i < 50; i++) {
      expect(api.generateManifest()).toBe(first)
    }
  })

  it('handles getDiagnosticsByFile with many files', () => {
    const api = new ExtensionAPI()
    for (let i = 0; i < 100; i++) {
      api.addDiagnostic({
        ...VALID_DIAGNOSTIC,
        filePath: `/file${i % 10}.ts`,
        line: i,
      })
    }
    for (let f = 0; f < 10; f++) {
      expect(api.getDiagnosticsByFile(`/file${f}.ts`)).toHaveLength(10)
    }
  })

  it('handles large config overrides', () => {
    const api = new ExtensionAPI({
      extensionId: 'x.y',
      displayName: 'X',
      version: '99.99.99',
      publisher: 'pub',
      engines: { vscode: '^100.0.0' },
      categories: ['A', 'B', 'C'],
      activationEvents: ['onCommand:a', 'onCommand:b'],
      main: './out.js',
      contributes: {
        commands: [{ command: 'a.b', title: 'B' }, { command: 'a.c', title: 'C' }],
        configuration: {
          title: 'X',
          properties: {
            'x.p1': { type: 'boolean', default: false, description: 'P1' },
            'x.p2': { type: 'string', default: 'v', description: 'P2' },
          },
        },
        languages: [{ id: 'go', extensions: ['.go'], aliases: ['Go'] }],
      },
    })
    const cfg = api.getConfig()
    expect(cfg.extensionId).toBe('x.y')
    expect(cfg.contributes.commands).toHaveLength(2)
    expect(cfg.contributes.languages).toHaveLength(1)
    expect(api.validateConfig()).toEqual([])
  })

  it('handles special characters in messages', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      {
        filePath: '/path with spaces/file (1).ts',
        line: 1,
        column: 1,
        message: 'Error: "quotes" & <tags> and\nnewlines',
        severity: 'error',
        ruleId: 'special-chars',
      },
    ])
    expect(result[0]!.filePath).toContain(' ')
    expect(result[0]!.message).toContain('"quotes"')
  })

  it('handles unicode in file paths and messages', () => {
    const api = new ExtensionAPI()
    api.addDiagnostic({
      ...VALID_DIAGNOSTIC,
      filePath: '/ユーザー/コード/main.ts',
      message: 'エラー: 無効な構文',
    })
    const diags = api.getDiagnosticsByFile('/ユーザー/コード/main.ts')
    expect(diags).toHaveLength(1)
    expect(diags[0]!.message).toBe('エラー: 無効な構文')
  })
})

describe('Edge cases: convertToDiagnostics boundary values', () => {
  it('handles endLine equal to line', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      { filePath: '/a', line: 5, column: 1, endLine: 5, endColumn: 10, message: '', severity: 'error', ruleId: 'r' },
    ])
    expect(result[0]!.endLine).toBe(5)
    expect(result[0]!.endColumn).toBe(10)
  })

  it('handles endLine greater than line', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      { filePath: '/a', line: 1, column: 1, endLine: 5, endColumn: 1, message: '', severity: 'error', ruleId: 'r' },
    ])
    expect(result[0]!.endLine).toBe(5)
  })

  it('handles column 0 with no endColumn', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      { filePath: '/a', line: 1, column: 0, message: '', severity: 'error', ruleId: 'r' },
    ])
    expect(result[0]!.endColumn).toBe(1)
  })

  it('handles empty filePath', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      { filePath: '', line: 1, column: 1, message: '', severity: 'error', ruleId: 'r' },
    ])
    expect(result[0]!.filePath).toBe('')
  })

  it('handles empty message', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      { filePath: '/a', line: 1, column: 1, message: '', severity: 'error', ruleId: 'r' },
    ])
    expect(result[0]!.message).toBe('')
  })

  it('handles empty ruleId', () => {
    const api = new ExtensionAPI()
    const result = api.convertToDiagnostics([
      { filePath: '/a', line: 1, column: 1, message: 'm', severity: 'error', ruleId: '' },
    ])
    expect(result[0]!.ruleId).toBe('')
  })
})

describe('Edge cases: validateConfig boundary values', () => {
  it('accepts version with build metadata', () => {
    const api = new ExtensionAPI({ version: '1.0.0+build.123' })
    expect(api.validateConfig()).not.toContain('version must follow semver format (e.g., 1.0.0)')
  })

  it('rejects version with only two parts', () => {
    const api = new ExtensionAPI({ version: '1.0' })
    expect(api.validateConfig()).toContain('version must follow semver format (e.g., 1.0.0)')
  })

  it('accepts version starting with v-like pattern', () => {
    const api = new ExtensionAPI({ version: '1.0.0-alpha' })
    expect(api.validateConfig()).not.toContain('version must follow semver format (e.g., 1.0.0)')
  })

  it('accepts single-digit version parts', () => {
    const api = new ExtensionAPI({ version: '0.0.0' })
    expect(api.validateConfig()).not.toContain('version must follow semver format (e.g., 1.0.0)')
  })

  it('accepts multi-digit version parts', () => {
    const api = new ExtensionAPI({ version: '100.200.300' })
    expect(api.validateConfig()).not.toContain('version must follow semver format (e.g., 1.0.0)')
  })
})

describe('Multiple instances isolation', () => {
  it('diagnostics are isolated between instances', () => {
    const api1 = new ExtensionAPI()
    const api2 = new ExtensionAPI()
    api1.addDiagnostic(VALID_DIAGNOSTIC)
    expect(api1.getDiagnostics()).toHaveLength(1)
    expect(api2.getDiagnostics()).toHaveLength(0)
  })

  it('config overrides do not affect other instances', () => {
    const api1 = new ExtensionAPI({ extensionId: 'one' })
    const api2 = new ExtensionAPI({ extensionId: 'two' })
    expect(api1.getConfig().extensionId).toBe('one')
    expect(api2.getConfig().extensionId).toBe('two')
  })

  it('clearDiagnostics only affects own instance', () => {
    const api1 = new ExtensionAPI()
    const api2 = new ExtensionAPI()
    api1.addDiagnostic(VALID_DIAGNOSTIC)
    api2.addDiagnostic(VALID_DIAGNOSTIC)
    api1.clearDiagnostics()
    expect(api1.getDiagnostics()).toHaveLength(0)
    expect(api2.getDiagnostics()).toHaveLength(1)
  })

  it('manifests are independent between instances', () => {
    const api1 = new ExtensionAPI({ version: '1.0.0' })
    const api2 = new ExtensionAPI({ version: '2.0.0' })
    const m1 = JSON.parse(api1.generateManifest())
    const m2 = JSON.parse(api2.generateManifest())
    expect(m1.version).toBe('1.0.0')
    expect(m2.version).toBe('2.0.0')
  })
})
