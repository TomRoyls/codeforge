import { PluginLoadError } from './types.js'

export const PLUGIN_PREFIX = 'codeforge-plugin-'
const SCOPED_PLUGIN_PATTERN = /^@[^/]+\/codeforge-plugin-/

export function isPluginName(name: string): boolean {
  return name.startsWith(PLUGIN_PREFIX) || SCOPED_PLUGIN_PATTERN.test(name)
}

export function parsePluginName(fullName: string): { scope: string | null; name: string } {
  if (fullName.startsWith('@')) {
    const [scope, name] = fullName.split('/')
    if (!scope || !name) {
      throw new PluginLoadError(fullName, `Invalid scoped plugin name: ${fullName}`)
    }
    return { scope, name }
  }

  return { scope: null, name: fullName }
}

export const PLUGIN_PATTERNS = {
  prefix: PLUGIN_PREFIX,
  scoped: SCOPED_PLUGIN_PATTERN,
} as const
