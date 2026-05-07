import type { RuleSeverity } from '../../rules/types.js'

const TSLINT_TO_CODEFORGE_RULES: Record<string, string> = {
  'curly': 'curly',
  'cyclomatic-complexity': 'max-complexity',
  'max-file-line-count': 'max-lines',
  'max-line-length': 'max-lines',
  'member-access': 'explicit-module-boundary-types',
  'no-angle-bracket-type-assertion': 'no-unnecessary-type-assertion',
  'no-any': 'no-explicit-any',
  'no-console': 'no-console',
  'no-debugger': 'no-debugger',
  'no-empty': 'no-empty',
  'no-eval': 'no-eval',
  'no-inferrable-types': 'no-inferrable-types',
  'no-internal-module': 'no-namespace',
  'no-magic-numbers': 'no-magic-numbers',
  'no-namespace': 'no-namespace',
  'no-require-imports': 'no-require-imports',
  'no-shadowed-variable': 'no-shadow',
  'no-string-throw': 'no-throw-literal',
  'no-unnecessary-initializer': 'no-unnecessary-initialization',
  'no-use-before-declare': 'no-invalid-use-before-def',
  'no-var-keyword': 'prefer-const',
  'no-var-requires': 'no-cjs-imports',
  'only-arrow-functions': 'prefer-arrow-callback',
  'ordered-imports': 'consistent-imports',
  'prefer-const': 'prefer-const',
  'prefer-for-of': 'prefer-for-of',
  'triple-equals': 'eq-eq-eq',
  'typedef': 'explicit-return-type',
  'ban-ts-ignore': 'no-explicit-any',
  'class-name': 'strict-boolean-expressions',
  'array-type': 'prefer-array-find',
}

export interface TSLintMigrationResult {
  rules: Record<string, [RuleSeverity, Record<string, unknown>] | RuleSeverity>
  source: 'tslint'
  unmapped: string[]
}

interface TSLintConfig {
  rules?: Record<string, unknown>
  rulesDirectory?: string[]
}

export function convertTSLintSeverity(severity: unknown): null | RuleSeverity {
  if (typeof severity === 'boolean') {
    return severity ? 'error' : null
  }

  if (Array.isArray(severity)) {
    if (severity.length === 0) return null
    if (typeof severity[0] === 'boolean') {
      return severity[0] ? 'error' : null
    }
    return convertTSLintSeverity(severity[0])
  }

  if (typeof severity === 'string') {
    if (severity === 'error') return 'error'
    if (severity === 'warning' || severity === 'warn') return 'warning'
    if (severity === 'off') return null
  }

  return null
}

function extractTSLintOptions(ruleConfig: unknown): Record<string, unknown> {
  if (Array.isArray(ruleConfig) && ruleConfig.length > 1) {
    const opts = ruleConfig[1]
    return typeof opts === 'object' && opts !== null && !Array.isArray(opts) ? opts : {}
  }
  return {}
}

export function migrateTSLintConfig(config: TSLintConfig): TSLintMigrationResult {
  const rules: TSLintMigrationResult['rules'] = {}
  const unmapped: string[] = []

  if (!config.rules) {
    return { rules, source: 'tslint', unmapped }
  }

  for (const [tslintRule, ruleConfig] of Object.entries(config.rules)) {
    const codeforgeRule = TSLINT_TO_CODEFORGE_RULES[tslintRule]

    if (!codeforgeRule) {
      unmapped.push(tslintRule)
      continue
    }

    const severity = convertTSLintSeverity(ruleConfig)
    if (!severity) {
      continue
    }

    const options = extractTSLintOptions(ruleConfig)
    rules[codeforgeRule] = Object.keys(options).length > 0 ? [severity, options] : severity
  }

  return { rules, source: 'tslint', unmapped }
}

export async function readTSLintConfig(configPath: string): Promise<TSLintConfig | null> {
  try {
    const { readFile } = await import('node:fs/promises')
    const content = await readFile(configPath, 'utf8')
    return JSON.parse(content) as TSLintConfig
  } catch {
    return null
  }
}

export async function detectTSLintConfig(cwd: string): Promise<null | string> {
  const { access } = await import('node:fs/promises')
  const { join } = await import('node:path')

  const filePath = join(cwd, 'tslint.json')
  try {
    await access(filePath)
    return filePath
  } catch {
    return null
  }
}
