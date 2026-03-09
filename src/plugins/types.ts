export type Severity = 'off' | 'warn' | 'error';

export type RuleType = 'problem' | 'suggestion' | 'layout';

export type RuleSchema = ReadonlyArray<unknown> | Record<string, unknown>;

export interface RuleMeta {
  readonly type: RuleType;
  readonly severity: Severity;
  readonly docs?: {
    readonly description: string;
    readonly category?: string;
    readonly recommended?: boolean;
    readonly url?: string;
  };
  readonly fixable?: 'code' | 'whitespace';
  readonly requiresTypeChecking?: boolean;
  readonly schema?: RuleSchema;
  readonly deprecated?: boolean;
  readonly replacedBy?: readonly string[];
}

export interface Position {
  readonly line: number;
  readonly column: number;
}

export type Range = readonly [number, number];

export interface SourceLocation {
  readonly start: Position;
  readonly end: Position;
}

export interface ReportDescriptor {
  readonly node?: unknown;
  readonly message: string;
  readonly loc?: SourceLocation;
  readonly data?: Record<string, unknown>;
  readonly fix?: FixDescriptor;
  readonly suggest?: readonly SuggestionDescriptor[];
}

export interface FixDescriptor {
  readonly range: Range;
  readonly text: string;
}

export interface SuggestionDescriptor {
  readonly desc: string;
  readonly message: string;
  readonly fix: FixDescriptor;
}

export type RuleVisitor = Record<string, (node: unknown) => void | Promise<void>>;

export interface RuleDefinition {
  readonly meta: RuleMeta;
  readonly create: (context: RuleContext) => RuleVisitor;
}

export interface TransformContext extends PluginContext {
  readonly getSource: () => string;
  readonly getFilePath: () => string;
  readonly reportError: (error: Error) => void;
}

export type TransformFunction = (
  source: string,
  context: TransformContext
) => string | Promise<string>;

export interface TransformDefinition {
  readonly name: string;
  readonly description?: string;
  readonly filePatterns?: readonly string[];
  readonly transform: TransformFunction;
}

export interface HookContext {
  readonly logger: Logger;
  readonly timestamp: Date;
  readonly data?: unknown;
}

export interface PluginHooks {
  readonly onLoad?: (context: HookContext) => void | Promise<void>;
  readonly onUnload?: (context: HookContext) => void | Promise<void>;
  readonly beforeCheck?: (context: HookContext) => void | Promise<void>;
  readonly afterCheck?: (context: HookContext) => void | Promise<void>;
  readonly beforeTransform?: (context: HookContext) => void | Promise<void>;
  readonly afterTransform?: (context: HookContext) => void | Promise<void>;
  readonly onError?: (error: Error, context: HookContext) => void | Promise<void>;
}

export interface Logger {
  readonly debug: (message: string, ...args: readonly unknown[]) => void;
  readonly info: (message: string, ...args: readonly unknown[]) => void;
  readonly warn: (message: string, ...args: readonly unknown[]) => void;
  readonly error: (message: string, ...args: readonly unknown[]) => void;
}

export interface PluginConfig {
  readonly options?: Record<string, unknown>;
  readonly rules?: Record<string, Severity | readonly [Severity, ...unknown[]]>;
  readonly transforms?: readonly string[];
}

export interface Plugin {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly rules?: Record<string, RuleDefinition>;
  readonly transforms?: Record<string, TransformDefinition>;
  readonly hooks?: PluginHooks;
  readonly dependencies?: readonly string[];
  readonly engines?: {
    readonly codeforge?: string;
  };
}

export interface PluginManifest {
  readonly name: string;
  readonly version: string;
  readonly main: string;
  readonly description?: string;
  readonly peerDependencies?: Record<string, string>;
}

export interface PluginContext {
  readonly logger: Logger;
  readonly config: PluginConfig;
  readonly workspaceRoot: string;
}

export interface RuleContext extends PluginContext {
  readonly report: (descriptor: ReportDescriptor) => void;
  readonly getSource: () => string;
  readonly getFilePath: () => string;
  readonly getAST: () => unknown;
  readonly getTokens: () => readonly unknown[];
  readonly getComments: () => readonly unknown[];
  readonly parserServices?: {
    readonly program?: unknown;
    readonly esTreeNodeToTSNodeMap?: Map<unknown, unknown>;
    readonly tsNodeToESTreeNodeMap?: Map<unknown, unknown>;
  };
}

export class PluginError extends Error {
  public readonly pluginName: string;
  public readonly code: string;
  public readonly cause?: Error;

  constructor(pluginName: string, message: string, code: string, cause?: Error) {
    super(`[${pluginName}] ${message}`);
    this.name = 'PluginError';
    this.pluginName = pluginName;
    this.code = code;
    this.cause = cause;
  }
}

export class PluginLoadError extends PluginError {
  constructor(pluginName: string, message: string, cause?: Error) {
    super(pluginName, message, 'PLUGIN_LOAD_ERROR', cause);
    this.name = 'PluginLoadError';
  }
}

export class RuleExecutionError extends PluginError {
  public readonly ruleName: string;

  constructor(
    pluginName: string,
    ruleName: string,
    message: string,
    cause?: Error
  ) {
    super(pluginName, `Rule "${ruleName}": ${message}`, 'RULE_EXECUTION_ERROR', cause);
    this.name = 'RuleExecutionError';
    this.ruleName = ruleName;
  }
}

export class TransformExecutionError extends PluginError {
  public readonly transformName: string;

  constructor(
    pluginName: string,
    transformName: string,
    message: string,
    cause?: Error
  ) {
    super(pluginName, `Transform "${transformName}": ${message}`, 'TRANSFORM_EXECUTION_ERROR', cause);
    this.name = 'TransformExecutionError';
    this.transformName = transformName;
  }
}

export class HookExecutionError extends PluginError {
  public readonly hookName: string;

  constructor(
    pluginName: string,
    hookName: string,
    message: string,
    cause?: Error
  ) {
    super(pluginName, `Hook "${hookName}": ${message}`, 'HOOK_EXECUTION_ERROR', cause);
    this.name = 'HookExecutionError';
    this.hookName = hookName;
  }
}
