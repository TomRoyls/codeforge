export function isValidPluginName(name: string): boolean {
  return /^[a-z0-9-]+$/.test(name)
}

export function toCamelCase(str: string): string {
  return str
    .split('-')
    .map((word, index) => {
      if (index === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join('')
}

export function buildPackageJson(pluginName: string): Record<string, unknown> {
  return {
    description: `CodeForge plugin: ${pluginName}`,
    engines: {
      node: '>=18.0.0',
    },
    keywords: ['codeforge', 'plugin', 'linter'],
    license: 'MIT',
    main: 'dist/index.js',
    scripts: {
      build: 'tsc',
      lint: 'eslint src',
      test: 'vitest run',
      'test:watch': 'vitest',
    },
    types: 'dist/index.d.ts',
  }
}

export function buildTsConfig(): Record<string, unknown> {
  return {
    compilerOptions: {
      declaration: true,
      declarationMap: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      lib: ['ES2022'],
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      outDir: './dist',
      rootDir: './src',
      skipLibCheck: true,
      sourceMap: true,
      strict: true,
      target: 'ES2022',
    },
    exclude: ['node_modules', 'dist', 'test'],
    include: ['src/**/*'],
  }
}

export function buildPluginFileContent(pluginName: string, ruleName: string): string {
  const camelRule = toCamelCase(ruleName)
  return `/**
 * ${pluginName} - CodeForge Plugin
 */

import type { PluginDefinition } from 'codeforge'
import { ${camelRule} } from './rules/${ruleName}.js'

export const plugin: PluginDefinition = {
  name: '${pluginName}',
  version: '1.0.0',
  rules: {
    '${ruleName}': ${camelRule},
  },
}

export default plugin
`
}

export function buildRuleFileContent(ruleName: string): string {
  const camelRule = toCamelCase(ruleName)
  return `/**
 * ${ruleName} - Sample CodeForge rule
 * Replace this with your actual rule implementation
 */

import type { RuleDefinition, RuleContext, RuleVisitor } from 'codeforge'

export const ${camelRule}: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description: 'Replace this with your rule description',
      category: 'style',
      recommended: false,
    },
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      // Example: Visit CallExpression nodes
      CallExpression(node: unknown): void {
        // Add your rule logic here
      },
    }
  },
}

export default ${camelRule}
`
}

export function buildRuleTestContent(ruleName: string): string {
  const camelRule = toCamelCase(ruleName)
  return `/**
 * Tests for ${ruleName} rule
 */

import { describe, expect, it } from 'vitest'
import { ${camelRule} } from '../../src/rules/${ruleName}.js'

describe('${ruleName}', () => {
  it('should have valid meta', () => {
    expect(${camelRule}.meta).toBeDefined()
    expect(${camelRule}.meta.type).toBe('problem')
    expect(${camelRule}.meta.docs.description).toBeDefined()
  })

  it('should export create function', () => {
    expect(${camelRule}.create).toBeDefined()
    expect(typeof ${camelRule}.create).toBe('function')
  })

  it('should return visitor object', () => {
    const mockContext = {
      config: { options: [], settings: {}, cwd: process.cwd() },
      sourceCode: { text: '', ast: {}, lines: [], parserServices: {} },
      report: () => {},
      id: '${ruleName}',
      options: [],
      settings: {},
      parserPath: '',
      parserServices: {},
      parserOptions: {},
      featureSwitches: {},
    } as unknown

    const visitor = ${camelRule}.create(mockContext)
    expect(visitor).toBeDefined()
    expect(typeof visitor).toBe('object')
  })
})
`
}

export function buildReadmeContent(pluginName: string, ruleName: string): string {
  return `# ${pluginName}

A CodeForge plugin that provides custom linting rules.

## Installation

\`\`\`bash
npm install ${pluginName}
\`\`\`

## Usage
Add the plugin to your CodeForge configuration:

\`\`\`json
{
  "plugins": ["${pluginName}"],
  "rules": {
    "${ruleName}": "warn"
  }
}
\`\`\`

## Rules
### ${ruleName}

Replace this with your rule description.

## Development

\`\`\`bash
npm install
npm test
npm run build
\`\`\`

## License
MIT
`
}

export function buildGitignoreContent(): string {
  return `node_modules/
dist/
*.log
.DS_Store
coverage/
`
}

export function getDirectoryPaths(outputDir: string): string[] {
  return [
    outputDir,
    `${outputDir}/src`,
    `${outputDir}/src/rules`,
    `${outputDir}/test`,
    `${outputDir}/test/rules`,
  ]
}
