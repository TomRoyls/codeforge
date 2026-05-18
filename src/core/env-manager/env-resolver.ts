import type { EnvConfig, EnvName } from './types.js'

const envPatternCache = new Map<string, RegExp>()

export class EnvResolver {
  resolve(configs: EnvConfig[], envName: EnvName): Record<string, string> {
    const chain = this.resolveChain(configs, envName)
    const result: Record<string, string> = {}
    for (const name of chain) {
      const config = configs.find((c) => c.name === name)
      if (config) {
        Object.assign(result, config.variables)
      }
    }
    return result
  }

  resolveChain(configs: EnvConfig[], envName: EnvName): EnvName[] {
    const chain: EnvName[] = []
    const visited = new Set<EnvName>()
    let current: EnvName | undefined = envName
    while (current !== undefined) {
      if (visited.has(current)) {
        break
      }
      visited.add(current)
      chain.unshift(current)
      const config = configs.find((c) => c.name === current)
      current = config?.inherits
    }
    return chain
  }

  resolveVariable(configs: EnvConfig[], envName: EnvName, key: string): string | undefined {
    const resolved = this.resolve(configs, envName)
    return resolved[key]
  }

  interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\$\{(\w+)\}/g, (match, varName: string) => {
      if (varName in variables) {
        return variables[varName]!
      }
      return match
    })
  }

  detectEnv(env: Record<string, string>): EnvName {
    const nodeEnv = env['NODE_ENV']
    if (nodeEnv === 'production') return 'production'
    if (nodeEnv === 'staging') return 'staging'
    if (nodeEnv === 'test') return 'test'
    if (nodeEnv === 'development' || nodeEnv === 'dev') return 'development'
    const envVal = env['ENV']
    if (envVal === 'production') return 'production'
    if (envVal === 'staging') return 'staging'
    if (envVal === 'test') return 'test'
    if (envVal === 'development' || envVal === 'dev') return 'development'
    const appEnv = env['APP_ENV']
    if (appEnv) return appEnv
    return 'development'
  }

  validatePattern(value: string, pattern: string): boolean {
    let regex = envPatternCache.get(pattern)
    if (!regex) {
      regex = new RegExp(pattern)
      envPatternCache.set(pattern, regex)
    }
    return regex.test(value)
  }
}
