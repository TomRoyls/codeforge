import type { RuleSeverity } from '../../rules/types.js'

const BIOME_TO_CODEFORGE_RULES: Record<string, string> = {
  'complexity/noBannedImports': 'no-restricted-imports',
  'complexity/noExcessiveCognitiveComplexity': 'max-complexity',
  'complexity/noExtraBooleanCast': 'no-unnecessary-boolean',
  'complexity/noForEach': 'no-array-reduce',
  'complexity/noMultipleSpaceInLine': 'no-multi-spaces',
  'complexity/noStaticOnlyClass': 'no-unnecessary-class',
  'complexity/noUselessCatch': 'no-useless-catch',
  'complexity/noUselessFragments': 'no-unnecessary-fragment',
  'complexity/noUselessLabel': 'no-unnecessary-label',
  'complexity/noUselessLoneBlockStatements': 'no-unnecessary-block',
  'complexity/noUselessRename': 'no-useless-rename',
  'complexity/noUselessStringConcat': 'no-unnecessary-string-concat',
  'complexity/noVoidTypeReturn': 'no-meaningless-void',
  'complexity/useFlatMap': 'prefer-flat-map',
  'complexity/useLiteralKeys': 'no-unnecessary-literal-key',
  'complexity/useOptionalChain': 'prefer-optional-chain',
  'correctness/noConstAssign': 'no-const-assign',
  'correctness/noConstantCondition': 'no-constant-condition',
  'correctness/noInnerDeclarations': 'no-inner-declarations',
  'correctness/noPrecisionLoss': 'no-loss-of-precision',
  'correctness/noUnnecessaryContinue': 'no-unnecessary-continue',
  'correctness/noUnusedImports': 'no-duplicate-imports',
  'correctness/noUnusedLabels': 'no-unnecessary-label',
  'nursery/noAccidentalInfiniteLoops': 'no-approximate-constants',
  'performance/noBarrelFile': 'no-barrel-imports',
  'performance/noDelete': 'no-dynamic-delete',
  'performance/noReExportAll': 'no-barrel-imports',
  'security/noDangerouslySetInnerHtml': 'no-unsafe-html',
  'security/noGlobalEval': 'no-eval',
  'style/noDoneCallback': 'no-done-callback',
  'style/noInferrableTypes': 'no-inferrable-types',
  'style/noNamespace': 'no-namespace',
  'style/noNamespaceImport': 'no-namespace',
  'style/noNegationElse': 'no-lonely-if',
  'style/noNonNullAssertion': 'no-non-null-assertion',
  'style/noParameterAssign': 'no-param-reassign',
  'style/noRestrictedGlobals': 'no-restricted-globals',
  'style/noRestrictedImports': 'no-restricted-imports',
  'style/useConst': 'prefer-const',
  'style/useExponentOperator': 'prefer-exponent-operator',
  'style/useNumberNamespace': 'no-unnecessary-number-wrapper',
  'style/useTemplate': 'prefer-string-template',
  'suspicious/noApproximativeNumericConstant': 'no-approximate-constants',
  'suspicious/noAssignInExpressions': 'no-param-reassign',
  'suspicious/noAsyncPromiseExecutor': 'no-async-promise-executor',
  'suspicious/noCompareNegZero': 'no-compare-neg-zero',
  'suspicious/noConfusingVoidType': 'no-confusing-void-expression',
  'suspicious/noConsoleLog': 'no-console',
  'suspicious/noConstEnum': 'no-const-enum',
  'suspicious/noDebugger': 'no-debugger',
  'suspicious/noDoubleEquals': 'eq-eq-eq',
  'suspicious/noEmptyBlockStatements': 'no-empty',
  'suspicious/noExplicitAny': 'no-explicit-any',
  'suspicious/noExtraNonNullAssertion': 'no-non-null-assertion',
  'suspicious/noGlobalAssign': 'no-implicit-globals',
  'suspicious/noSelfCompare': 'no-compare-negation',
  'suspicious/noShadowRestrictedNames': 'no-shadow',
  'suspicious/noUnsafeOptionalChaining': 'no-non-null-asserted-optional-chain',
  'suspicious/noUnusedLabels': 'no-unnecessary-label',
  'suspicious/useIsArray': 'no-unnecessary-instanceof-array',
  'suspicious/useNamespaceKeyword': 'no-namespace',
}

export interface BiomeMigrationResult {
  rules: Record<string, [RuleSeverity, Record<string, unknown>] | RuleSeverity>
  source: 'biome'
  unmapped: string[]
}

interface BiomeConfig {
  linter?: {
    rules?: Record<string, unknown>
  }
}

export function convertBiomeSeverity(level: string): null | RuleSeverity {
  if (level === 'error') return 'error'
  if (level === 'warn' || level === 'warning') return 'warning'
  if (level === 'info') return 'info'
  if (level === 'off') return null
  return null
}

function flattenBiomeRules(
  rulesObj: Record<string, unknown>,
): Array<[string, unknown]> {
  const flat: Array<[string, unknown]> = []

  for (const [key, value] of Object.entries(rulesObj)) {
    if (key.includes('/')) {
      flat.push([key, value])
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const categoryRules = value as Record<string, unknown>
      for (const [ruleName, ruleValue] of Object.entries(categoryRules)) {
        flat.push([`${key}/${ruleName}`, ruleValue])
      }
    } else {
      flat.push([key, value])
    }
  }

  return flat
}

export function migrateBiomeConfig(config: {
  linter?: { rules?: Record<string, unknown> }
}): BiomeMigrationResult {
  const rules: BiomeMigrationResult['rules'] = {}
  const unmapped: string[] = []

  const linterRules = config.linter?.rules
  if (!linterRules) {
    return { rules, source: 'biome', unmapped }
  }

  const flatRules = flattenBiomeRules(linterRules)

  for (const [biomeRule, ruleConfig] of flatRules) {
    const codeforgeRule = BIOME_TO_CODEFORGE_RULES[biomeRule]

    if (!codeforgeRule) {
      unmapped.push(biomeRule)
      continue
    }

    let severity: null | RuleSeverity = null
    let options: Record<string, unknown> = {}

    if (typeof ruleConfig === 'string') {
      severity = convertBiomeSeverity(ruleConfig)
    } else if (typeof ruleConfig === 'object' && ruleConfig !== null && !Array.isArray(ruleConfig)) {
      const configObj = ruleConfig as Record<string, unknown>
      const level = configObj.level
      if (typeof level === 'string') {
        severity = convertBiomeSeverity(level)
      }
      const opts = configObj.options
      if (typeof opts === 'object' && opts !== null && !Array.isArray(opts)) {
        options = opts as Record<string, unknown>
      }
    } else if (Array.isArray(ruleConfig) && ruleConfig.length > 0) {
      if (typeof ruleConfig[0] === 'string') {
        severity = convertBiomeSeverity(ruleConfig[0])
      }
    }

    if (!severity) {
      continue
    }

    rules[codeforgeRule] = Object.keys(options).length > 0 ? [severity, options] : severity
  }

  return { rules, source: 'biome', unmapped }
}

export async function readBiomeConfig(configPath: string): Promise<BiomeConfig | null> {
  try {
    const { readFile } = await import('node:fs/promises')
    const content = await readFile(configPath, 'utf8')
    return JSON.parse(content) as BiomeConfig
  } catch {
    return null
  }
}

export async function detectBiomeConfig(cwd: string): Promise<null | string> {
  const { access } = await import('node:fs/promises')
  const { join } = await import('node:path')

  const filePath = join(cwd, 'biome.json')
  try {
    await access(filePath)
    return filePath
  } catch {
    return null
  }
}
