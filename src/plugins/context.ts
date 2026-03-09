import type {
  Logger,
  PluginConfig,
  ReportDescriptor,
  RuleContext as RuleContextType,
  PluginContext as PluginContextType,
} from './types.js'

export interface PluginContextOptions {
  logger: Logger
  config: PluginConfig
  workspaceRoot: string
}

export interface RuleContextOptions extends PluginContextOptions {
  source: string
  filePath: string
  ast: unknown
  tokens: readonly unknown[]
  comments: readonly unknown[]
  parserServices?: RuleContextType['parserServices']
}

export interface ReportCollector {
  reports: ReportDescriptor[]
  clear: () => void
}

function createReportCollector(): ReportCollector {
  const reports: ReportDescriptor[] = []

  return {
    reports,
    clear: (): void => {
      reports.length = 0
    },
  }
}

export function createPluginContext(options: PluginContextOptions): PluginContextType {
  const { logger, config, workspaceRoot } = options

  return {
    logger,
    config,
    workspaceRoot,
  }
}

export function createRuleContext(
  options: RuleContextOptions,
): RuleContextType & { collector: ReportCollector } {
  const { logger, config, workspaceRoot, source, filePath, ast, tokens, comments, parserServices } =
    options

  const collector = createReportCollector()

  const report = (descriptor: ReportDescriptor): void => {
    if (!descriptor.message || typeof descriptor.message !== 'string') {
      throw new TypeError('Report descriptor must have a valid message string')
    }
    collector.reports.push(descriptor)
  }

  const getSource = (): string => source
  const getFilePath = (): string => filePath
  const getAST = (): unknown => ast
  const getTokens = (): readonly unknown[] => tokens
  const getComments = (): readonly unknown[] => comments

  return {
    logger,
    config,
    workspaceRoot,
    report,
    getSource,
    getFilePath,
    getAST,
    getTokens,
    getComments,
    parserServices,
    collector,
  }
}

export function createDefaultLogger(): Logger {
  return {
    debug: (message: string, ...args: readonly unknown[]): void => {
      console.debug(`[DEBUG] ${message}`, ...args)
    },
    info: (message: string, ...args: readonly unknown[]): void => {
      console.info(`[INFO] ${message}`, ...args)
    },
    warn: (message: string, ...args: readonly unknown[]): void => {
      console.warn(`[WARN] ${message}`, ...args)
    },
    error: (message: string, ...args: readonly unknown[]): void => {
      console.error(`[ERROR] ${message}`, ...args)
    },
  }
}

export function createSilentLogger(): Logger {
  return {
    debug: (): void => {},
    info: (): void => {},
    warn: (): void => {},
    error: (): void => {},
  }
}
