export {
  createDefaultLogger,
  createPluginContext,
  createRuleContext,
  createSilentLogger,
  type PluginContextOptions,
  type ReportCollector,
  type RuleContextOptions,
} from './context.js'

export { type PluginLoadOptions, PluginManager, type PluginManagerOptions } from './manager.js'

export { isPluginName, parsePluginName, PLUGIN_PATTERNS, PluginRegistry } from './registry.js'

export type {
  FixDescriptor,
  HookContext,
  Logger,
  Plugin,
  PluginConfig,
  PluginContext,
  PluginHooks,
  PluginManifest,
  Position,
  Range,
  ReportDescriptor,
  RuleContext,
  RuleDefinition,
  RuleMeta,
  RuleSchema,
  RuleType,
  RuleVisitor,
  Severity,
  SourceLocation,
  SuggestionDescriptor,
  TransformContext,
  TransformDefinition,
  TransformFunction,
} from './types.js'

export {
  HookExecutionError,
  PluginError,
  PluginLoadError,
  RuleExecutionError,
  TransformExecutionError,
} from './types.js'
