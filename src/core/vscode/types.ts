export interface VSCodeExtensionConfig {
  extensionId: string
  displayName: string
  version: string
  publisher: string
  engines: { vscode: string }
  categories: string[]
  activationEvents: string[]
  main: string
  contributes: VSCodeContributes
}

export interface VSCodeContributes {
  commands: VSCodeCommand[]
  configuration: VSCodeConfiguration
  languages: VSCodeLanguage[]
}

export interface VSCodeCommand {
  command: string
  title: string
  category?: string
  icon?: string
}

export interface VSCodeConfiguration {
  title: string
  properties: Record<string, VSCodeProperty>
}

export interface VSCodeProperty {
  type: string
  default: unknown
  description: string
  enum?: string[]
}

export interface VSCodeLanguage {
  id: string
  extensions: string[]
  aliases: string[]
}

export interface DiagnosticItem {
  filePath: string
  line: number
  column: number
  endLine: number
  endColumn: number
  message: string
  severity: 'error' | 'warning' | 'info' | 'hint'
  ruleId: string
  source: string
}

export interface ExtensionMessage {
  type: 'analysisComplete' | 'analysisError' | 'configChanged' | 'statusUpdate'
  data: unknown
}
