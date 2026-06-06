import type {
  Logger,
  PluginConfig,
  PluginContext as PluginContextType,
  ReportDescriptor,
  RuleContext as RuleContextType,
} from './types.js'

export interface PluginContextOptions {
  config: PluginConfig
  logger: Logger
  workspaceRoot: string
}

export interface RuleContextOptions extends PluginContextOptions {
  ast: unknown
  comments: readonly unknown[]
  filePath: string
  parserServices?: RuleContextType['parserServices']
  source: string
  tokens: readonly unknown[]
}

export interface ReportCollector {
  clear: () => void
  reports: ReportDescriptor[]
}

function createReportCollector(): ReportCollector {
  const reports: ReportDescriptor[] = []

  return {
    clear(): void {
      reports.length = 0
    },
    reports,
  }
}

export function createPluginContext(options: PluginContextOptions): PluginContextType {
  const { config, logger, workspaceRoot } = options

  return {
    config,
    logger,
    workspaceRoot,
  }
}

export function createRuleContext(
  options: RuleContextOptions,
): RuleContextType & { collector: ReportCollector } {
  const { ast, comments, config, filePath, logger, parserServices, source, tokens, workspaceRoot } =
    options

  const collector = createReportCollector()

  const report = (descriptor: ReportDescriptor): void => {
    if (
      (!descriptor.message || typeof descriptor.message !== 'string') &&
      !descriptor.messageId
    ) {
      throw new TypeError('Report descriptor must have a valid message string or messageId')
    }

    collector.reports.push(descriptor)
  }

  const getSource = (): string => source
  const getFilePath = (): string => filePath
  const getAST = (): unknown => ast
  const getTokens = (): readonly unknown[] => tokens
  const getComments = (): readonly unknown[] => comments

  return {
    collector,
    config,
    getAST,
    getComments,
    getFilePath,
    getSource,
    getTokens,
    logger,
    parserServices,
    report,
    workspaceRoot,
  }
}

export function createDefaultLogger(): Logger {
  return {
    debug(message: string, ...args: readonly unknown[]): void {
      console.debug(`[DEBUG] ${message}`, ...args)
    },
    error(message: string, ...args: readonly unknown[]): void {
      console.error(`[ERROR] ${message}`, ...args)
    },
    info(message: string, ...args: readonly unknown[]): void {
      console.info(`[INFO] ${message}`, ...args)
    },
    warn(message: string, ...args: readonly unknown[]): void {
      console.warn(`[WARN] ${message}`, ...args)
    },
  }
}

export function createSilentLogger(): Logger {
  return {
    debug(): void {},
    error(): void {},
    info(): void {},
    warn(): void {},
  }
}
