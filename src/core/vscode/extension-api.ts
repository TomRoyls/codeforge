import type { DiagnosticItem } from './types.js'

export const DEFAULT_VSCODE_CONFIG = {
  extensionId: 'codeforge.codeforge',
  displayName: 'CodeForge',
  version: '0.1.0',
  publisher: 'codeforge',
  engines: { vscode: '^1.85.0' },
  categories: ['Linters', 'Programming Languages'],
  activationEvents: ['onLanguage:typescript', 'onLanguage:javascript'],
  main: './dist/extension.js',
  contributes: {
    commands: [
      {
        command: 'codeforge.analyze',
        title: 'Analyze Current File',
        category: 'CodeForge',
        icon: '$(search)',
      },
      {
        command: 'codeforge.analyzeWorkspace',
        title: 'Analyze Workspace',
        category: 'CodeForge',
        icon: '$(folder)',
      },
      {
        command: 'codeforge.fix',
        title: 'Fix Violations',
        category: 'CodeForge',
        icon: '$(wrench)',
      },
    ],
    configuration: {
      title: 'CodeForge',
      properties: {
        'codeforge.enable': {
          type: 'boolean',
          default: true,
          description: 'Enable CodeForge analysis',
        },
        'codeforge.severityLevel': {
          type: 'string',
          default: 'warning',
          description: 'Minimum severity level to report',
          enum: ['error', 'warning', 'info'],
        },
        'codeforge.runOnSave': {
          type: 'boolean',
          default: true,
          description: 'Run analysis on file save',
        },
      },
    },
    languages: [
      {
        id: 'typescript',
        extensions: ['.ts', '.tsx'],
        aliases: ['TypeScript', 'tsx'],
      },
      {
        id: 'javascript',
        extensions: ['.js', '.jsx'],
        aliases: ['JavaScript', 'jsx'],
      },
    ],
  },
} satisfies import('./types.js').VSCodeExtensionConfig

export class ExtensionAPI {
  private config: import('./types.js').VSCodeExtensionConfig
  private diagnostics: DiagnosticItem[]

  constructor(config?: Partial<import('./types.js').VSCodeExtensionConfig>) {
    this.config = { ...DEFAULT_VSCODE_CONFIG, ...config }
    this.diagnostics = []
  }

  getConfig(): import('./types.js').VSCodeExtensionConfig {
    return { ...this.config }
  }

  generateManifest(): string {
    const manifest = {
      name: this.config.extensionId,
      displayName: this.config.displayName,
      version: this.config.version,
      publisher: this.config.publisher,
      engines: this.config.engines,
      categories: this.config.categories,
      activationEvents: this.config.activationEvents,
      main: this.config.main,
      contributes: this.config.contributes,
    }
    return JSON.stringify(manifest, null, 2)
  }

  convertToDiagnostics(
    violations: Array<{
      filePath: string
      line: number
      column: number
      endLine?: number
      endColumn?: number
      message: string
      severity: string
      ruleId: string
    }>
  ): DiagnosticItem[] {
    return violations.map((v) => ({
      filePath: v.filePath,
      line: v.line,
      column: v.column,
      endLine: v.endLine ?? v.line,
      endColumn: v.endColumn ?? v.column + 1,
      message: v.message,
      severity: this.mapSeverity(v.severity),
      ruleId: v.ruleId,
      source: 'codeforge',
    }))
  }

  getCommands(): import('./types.js').VSCodeCommand[] {
    return [...this.config.contributes.commands]
  }

  getDefaultConfiguration(): Record<string, unknown> {
    const properties = this.config.contributes.configuration.properties
    const defaults: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(properties)) {
      defaults[key] = value.default
    }
    return defaults
  }

  createStatusMessage(
    status: 'running' | 'idle' | 'error',
    details?: string
  ): import('./types.js').ExtensionMessage {
    const typeMap: Record<string, import('./types.js').ExtensionMessage['type']> = {
      running: 'statusUpdate',
      idle: 'statusUpdate',
      error: 'analysisError',
    }
    const mappedType = typeMap[status]
    if (!mappedType) {
      return { type: 'statusUpdate', data: { status, details: details ?? null, timestamp: Date.now() } }
    }
    return {
      type: mappedType,
      data: { status, details: details ?? null, timestamp: Date.now() },
    }
  }

  validateConfig(): string[] {
    const errors: string[] = []

    if (!this.config.extensionId || this.config.extensionId.trim() === '') {
      errors.push('extensionId is required')
    }

    if (!this.config.displayName || this.config.displayName.trim() === '') {
      errors.push('displayName is required')
    }

    if (!this.config.version || !/^\d+\.\d+\.\d+/.test(this.config.version)) {
      errors.push('version must follow semver format (e.g., 1.0.0)')
    }

    if (!this.config.publisher || this.config.publisher.trim() === '') {
      errors.push('publisher is required')
    }

    if (!this.config.engines?.vscode) {
      errors.push('engines.vscode is required')
    }

    if (!this.config.main || this.config.main.trim() === '') {
      errors.push('main entry point is required')
    }

    if (!this.config.contributes?.commands?.length) {
      errors.push('at least one command must be defined')
    }

    if (!this.config.contributes?.configuration) {
      errors.push('configuration is required')
    }

    return errors
  }

  clearDiagnostics(): void {
    this.diagnostics = []
  }

  addDiagnostic(diagnostic: DiagnosticItem): void {
    this.diagnostics.push(diagnostic)
  }

  getDiagnostics(): DiagnosticItem[] {
    return [...this.diagnostics]
  }

  getDiagnosticsByFile(filePath: string): DiagnosticItem[] {
    return this.diagnostics.filter((d) => d.filePath === filePath)
  }

  private mapSeverity(severity: string): 'error' | 'warning' | 'info' | 'hint' {
    const mapping: Record<string, 'error' | 'warning' | 'info' | 'hint'> = {
      error: 'error',
      warning: 'warning',
      info: 'info',
      hint: 'hint',
    }
    return mapping[severity] ?? 'info'
  }
}
