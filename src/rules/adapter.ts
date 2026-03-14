import type { Node, SourceFile } from 'ts-morph'
import type { RuleViolation, VisitorContext, ASTVisitor } from '../ast/visitor.js'
import type { RuleDefinition, RuleOptions, RuleMeta } from './types.js'
import type {
  RuleDefinition as PluginRuleDefinition,
  RuleContext as PluginRuleContext,
  ReportDescriptor,
  Logger,
  PluginConfig,
} from '../plugins/types.js'

const silentLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

const defaultConfig: PluginConfig = {
  options: {},
  rules: {},
  transforms: [],
}

function nodeToGeneric(node: Node): Record<string, unknown> {
  const sourceFile = node.getSourceFile()
  const start = node.getStart()
  const end = node.getEnd()
  const startPos = sourceFile.getLineAndColumnAtPos(start)
  const endPos = sourceFile.getLineAndColumnAtPos(end)

  return {
    type: node.getKindName(),
    range: [start, end] as [number, number],
    loc: {
      start: { line: startPos.line, column: startPos.column },
      end: { line: endPos.line, column: endPos.column },
    },
    start,
    end,
    text: node.getText(),
  }
}

function convertSeverity(severity: 'off' | 'warn' | 'error'): 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'error':
      return 'error'
    case 'warn':
      return 'warning'
    case 'off':
      return 'info'
  }
}

function convertMeta(pluginMeta: PluginRuleDefinition['meta'], ruleId: string): RuleMeta {
  return {
    name: ruleId,
    description: pluginMeta.docs?.description ?? pluginMeta.type,
    category: mapCategory(pluginMeta.docs?.category),
    recommended: pluginMeta.docs?.recommended ?? false,
    deprecated: pluginMeta.deprecated,
    replacedBy: pluginMeta.replacedBy?.[0],
    fixable:
      pluginMeta.fixable === 'code'
        ? 'code'
        : pluginMeta.fixable === 'whitespace'
          ? 'whitespace'
          : undefined,
  }
}

function mapCategory(category: string | undefined): RuleMeta['category'] {
  switch (category?.toLowerCase()) {
    case 'performance':
      return 'performance'
    case 'security':
      return 'security'
    case 'style':
      return 'style'
    case 'correctness':
      return 'correctness'
    case 'complexity':
      return 'complexity'
    default:
      return 'style'
  }
}

export function adaptPluginRule(pluginRule: PluginRuleDefinition, ruleId: string): RuleDefinition {
  return {
    meta: convertMeta(pluginRule.meta, ruleId),
    defaultOptions: {},

    create(_options: RuleOptions) {
      let violations: RuleViolation[] = []
      let sourceFile: SourceFile | null = null
      let sourceText = ''

      const pluginContext: PluginRuleContext = {
        logger: silentLogger,
        config: defaultConfig,
        workspaceRoot: process.cwd(),
        getSource: () => sourceText,
        getFilePath: () => sourceFile?.getFilePath() ?? '',
        getAST: () => null,
        getTokens: () => [],
        getComments: () => [],
        report: (descriptor: ReportDescriptor) => {
          const loc = descriptor.loc ?? {
            start: { line: 1, column: 0 },
            end: { line: 1, column: 1 },
          }

          violations.push({
            ruleId,
            severity: convertSeverity(pluginRule.meta.severity),
            message: descriptor.message,
            filePath: sourceFile?.getFilePath() ?? '',
            range: {
              start: { line: loc.start.line, column: loc.start.column },
              end: { line: loc.end.line, column: loc.end.column },
            },
            suggestion: descriptor.suggest?.[0]?.desc,
          })
        },
      }

      const pluginVisitor = pluginRule.create(pluginContext)

      const visitor: ASTVisitor = {
        visitSourceFile(node, _context: VisitorContext) {
          sourceFile = node
          sourceText = node.getFullText()
          violations = []

          const handler = pluginVisitor['SourceFile'] ?? pluginVisitor['Program']
          if (handler) {
            handler(nodeToGeneric(node))
          }
        },

        visitNode(node, _context: VisitorContext) {
          if (!sourceFile) {
            sourceFile = node.getSourceFile()
            sourceText = sourceFile.getFullText()
          }

          const kindName = node.getKindName()
          const genericNode = nodeToGeneric(node)

          const handler = pluginVisitor[kindName]
          if (handler) {
            handler(genericNode)
          }

          const genericHandler = pluginVisitor['*'] ?? pluginVisitor['Any']
          if (genericHandler) {
            genericHandler(genericNode)
          }
        },
      }

      return {
        visitor,
        onComplete: () => violations,
      }
    },
  }
}

export function adaptPluginRules(
  rules: Record<string, PluginRuleDefinition>,
): Record<string, RuleDefinition> {
  const adapted: Record<string, RuleDefinition> = {}

  for (const [ruleId, pluginRule] of Object.entries(rules)) {
    adapted[ruleId] = adaptPluginRule(pluginRule, ruleId)
  }

  return adapted
}
