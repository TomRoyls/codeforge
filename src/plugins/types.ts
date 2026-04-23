export type Severity = 'error' | 'off' | 'warn'

export type RuleType = 'layout' | 'problem' | 'suggestion'

export type RuleSchema = ReadonlyArray<unknown> | Record<string, unknown>

export interface RuleMeta {
  readonly deprecated?: boolean
  readonly docs?: {
    readonly category?: string
    readonly description: string
    readonly recommended?: boolean
    readonly url?: string
  }
  readonly fixable?: 'code' | 'whitespace'
  readonly replacedBy?: readonly string[]
  readonly requiresTypeChecking?: boolean
  readonly schema?: RuleSchema
  readonly severity: Severity
  readonly type: RuleType
}

export interface Position {
  readonly column: number
  readonly line: number
}

export type Range = readonly [number, number]

export interface SourceLocation {
  readonly end: Position
  readonly start: Position
}

export interface ReportDescriptor {
  readonly data?: Record<string, unknown>
  readonly fix?: FixDescriptor
  readonly loc?: SourceLocation
  readonly message: string
  readonly node?: unknown
  readonly suggest?: readonly SuggestionDescriptor[]
}

export interface FixDescriptor {
  readonly range: Range
  readonly text: string
}

export interface SuggestionDescriptor {
  readonly desc: string
  readonly fix: FixDescriptor
  readonly message: string
}

export type RuleVisitor = Record<string, (node: unknown) => Promise<void> | void>

export interface RuleDefinition {
  readonly create: (context: RuleContext) => RuleVisitor
  readonly meta: RuleMeta
}

export interface TransformContext extends PluginContext {
  readonly getFilePath: () => string
  readonly getSource: () => string
  readonly reportError: (error: Error) => void
}

export type TransformFunction = (
  source: string,
  context: TransformContext,
) => Promise<string> | string

export interface TransformDefinition {
  readonly description?: string
  readonly filePatterns?: readonly string[]
  readonly name: string
  readonly transform: TransformFunction
}

export interface HookContext {
  readonly data?: unknown
  readonly logger: Logger
  readonly timestamp: Date
}

export interface PluginHooks {
  readonly afterCheck?: (context: HookContext) => Promise<void> | void
  readonly afterTransform?: (context: HookContext) => Promise<void> | void
  readonly beforeCheck?: (context: HookContext) => Promise<void> | void
  readonly beforeTransform?: (context: HookContext) => Promise<void> | void
  readonly onError?: (error: Error, context: HookContext) => Promise<void> | void
  readonly onLoad?: (context: HookContext) => Promise<void> | void
  readonly onUnload?: (context: HookContext) => Promise<void> | void
}

export interface Logger {
  readonly debug: (message: string, ...args: readonly unknown[]) => void
  readonly error: (message: string, ...args: readonly unknown[]) => void
  readonly info: (message: string, ...args: readonly unknown[]) => void
  readonly warn: (message: string, ...args: readonly unknown[]) => void
}

export interface PluginConfig {
  readonly options?: Record<string, unknown>
  readonly rules?: Record<string, readonly [Severity, ...unknown[]] | Severity>
  readonly transforms?: readonly string[]
}

export interface Plugin {
  readonly dependencies?: readonly string[]
  readonly description?: string
  readonly engines?: {
    readonly codeforge?: string
  }
  readonly hooks?: PluginHooks
  readonly name: string
  readonly rules?: Record<string, RuleDefinition>
  readonly transforms?: Record<string, TransformDefinition>
  readonly version: string
}

export interface PluginManifest {
  readonly description?: string
  readonly main: string
  readonly name: string
  readonly peerDependencies?: Record<string, string>
  readonly version: string
}

export interface PluginContext {
  readonly config: PluginConfig
  readonly logger: Logger
  readonly workspaceRoot: string
}

export interface RuleContext extends PluginContext {
  readonly getAST: () => unknown
  readonly getComments: () => readonly unknown[]
  readonly getFilePath: () => string
  readonly getSource: () => string
  readonly getTokens: () => readonly unknown[]
  readonly parserServices?: {
    readonly esTreeNodeToTSNodeMap?: Map<unknown, unknown>
    readonly program?: unknown
    readonly tsNodeToESTreeNodeMap?: Map<unknown, unknown>
  }
  readonly report: (descriptor: ReportDescriptor) => void
}

export class PluginError extends Error {
  public readonly cause?: Error
  public readonly code: string
  public readonly pluginName: string

  constructor(pluginName: string, message: string, code: string, cause?: Error) {
    super(`[${pluginName}] ${message}`)
    this.name = 'PluginError'
    this.pluginName = pluginName
    this.code = code
    this.cause = cause
  }
}

export class PluginLoadError extends PluginError {
  constructor(pluginName: string, message: string, cause?: Error) {
    super(pluginName, message, 'PLUGIN_LOAD_ERROR', cause)
    this.name = 'PluginLoadError'
  }
}

export class RuleExecutionError extends PluginError {
  public readonly ruleName: string

  constructor(pluginName: string, ruleName: string, message: string, cause?: Error) {
    super(pluginName, `Rule "${ruleName}": ${message}`, 'RULE_EXECUTION_ERROR', cause)
    this.name = 'RuleExecutionError'
    this.ruleName = ruleName
  }
}

export class TransformExecutionError extends PluginError {
  public readonly transformName: string

  constructor(pluginName: string, transformName: string, message: string, cause?: Error) {
    super(
      pluginName,
      `Transform "${transformName}": ${message}`,
      'TRANSFORM_EXECUTION_ERROR',
      cause,
    )
    this.name = 'TransformExecutionError'
    this.transformName = transformName
  }
}

export class HookExecutionError extends PluginError {
  public readonly hookName: string

  constructor(pluginName: string, hookName: string, message: string, cause?: Error) {
    super(pluginName, `Hook "${hookName}": ${message}`, 'HOOK_EXECUTION_ERROR', cause)
    this.name = 'HookExecutionError'
    this.hookName = hookName
  }
}
