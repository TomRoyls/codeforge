/* eslint-disable perfectionist/sort-classes */
/* eslint-disable perfectionist/sort-objects */
import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { join } from 'node:path'

export default class GeneratePlugin extends Command {
  static override description = 'Generate a new CodeForge plugin scaffold'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> my-plugin',
      description: 'Generate a plugin named "my-plugin"',
    },
    {
      command: '<%= config.bin %> <%= command.id %> my-plugin --typescript',
      description: 'Generate a TypeScript plugin',
    },
    {
      command: '<%= config.bin %> <%= command.id %> my-plugin --rule custom-rule',
      description: 'Generate plugin with a custom rule',
    },
  ]

  static override args = {
    name: Args.string({
      description: 'Plugin name (e.g., codeforge-plugin-custom)',
      required: true,
    }),
  }

  static override flags = {
    typescript: Flags.boolean({
      char: 't',
      default: true,
      description: 'Generate TypeScript plugin',
    }),
    rule: Flags.string({
      char: 'r',
      default: 'sample-rule',
      description: 'Name of the initial rule to create',
    }),
    output: Flags.string({
      char: 'o',
      default: '.',
      description: 'Output directory for the plugin',
    }),
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Overwrite existing plugin directory',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(GeneratePlugin)
    const pluginName = args.name as string
    const outputDir = flags.output.startsWith('/')
      ? join(flags.output, pluginName)
      : join(process.cwd(), flags.output, pluginName)

    // Validate plugin name
    if (!this.isValidPluginName(pluginName)) {
      this.error(
        'Plugin name must be lowercase, alphanumeric with hyphens (e.g., codeforge-plugin-custom)',
      )
    }

    // Check if directory exists
    if (existsSync(outputDir) && !flags.force) {
      this.error(`Directory "${outputDir}" already exists. Use --force to overwrite.`)
    }

    this.log(chalk.blue(`\n🚀 Generating CodeForge plugin: ${chalk.bold(pluginName)}\n`))

    try {
      // Create directory structure
      this.log(chalk.dim('Creating directory structure...'))
      await this.createDirectoryStructure(outputDir)
      this.log(chalk.dim('✓ Directory structure created'))

      // Generate files
      this.log(chalk.dim('Generating package.json...'))
      await this.generatePackageJson(outputDir, pluginName)

      this.log(chalk.dim('Generating tsconfig.json...'))
      await this.generateTsConfig(outputDir)

      this.log(chalk.dim('Generating plugin entry file...'))
      await this.generatePluginFile(outputDir, pluginName, flags.rule)

      this.log(chalk.dim('Generating rule file...'))
      await this.generateRuleFile(outputDir, flags.rule)

      this.log(chalk.dim('Generating rule tests...'))
      await this.generateRuleTest(outputDir, flags.rule)

      this.log(chalk.dim('Generating README...'))
      await this.generateReadme(outputDir, pluginName, flags.rule)

      this.log(chalk.dim('Generating .gitignore...'))
      await this.generateGitignore(outputDir)

      this.log(chalk.green('\n✅ Plugin generated successfully!\n'))
      this.log(chalk.dim('Next steps:'))
      this.log(chalk.dim(`  cd ${pluginName}`))
      this.log(chalk.dim('  npm install'))
      this.log(chalk.dim('  npm test'))
      this.log(chalk.dim('\nThen add the plugin to your CodeForge config:'))
      this.log(chalk.dim(`  plugins: ["./${pluginName}"]`))
    } catch (error) {
      this.error(
        `Failed to generate plugin: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  private isValidPluginName(name: string): boolean {
    return /^[a-z0-9]+$/.test(name)
  }

  private async createDirectoryStructure(outputDir: string): Promise<void> {
    const dirs = [
      outputDir,
      join(outputDir, 'src'),
      join(outputDir, 'src', 'rules'),
      join(outputDir, 'test'),
      join(outputDir, 'test', 'rules'),
    ]

    for (const dir of dirs) {
      // eslint-disable-next-line no-await-in-loop
      await fs.mkdir(dir, { recursive: true })
    }
  }

  private async generatePackageJson(outputDir: string, pluginName: string): Promise<void> {
    const packageJson = {
      description: `CodeForge plugin: ${pluginName}`,
      keywords: ['codeforge', 'plugin', 'linter'],
      license: 'MIT',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        test: 'vitest run',
        'test:watch': 'vitest',
        lint: 'eslint src',
      },
      engines: {
        node: '>=18.0.0',
      },
    }

    await fs.writeFile(join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2))
  }

  private async generateTsConfig(outputDir: string): Promise<void> {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        lib: ['ES2022'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'test'],
    }

    await fs.writeFile(join(outputDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2))
  }

  private async generatePluginFile(
    outputDir: string,
    pluginName: string,
    ruleName: string,
  ): Promise<void> {
    const camelRule = this.toCamelCase(ruleName)
    const content = `/**
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

    await fs.writeFile(join(outputDir, 'src', 'index.ts'), content)
  }

  private async generateRuleFile(outputDir: string, ruleName: string): Promise<void> {
    const camelRule = this.toCamelCase(ruleName)
    const content = `/**
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

    await fs.writeFile(join(outputDir, 'src', 'rules', `${ruleName}.ts`), content)
  }

  private async generateRuleTest(outputDir: string, ruleName: string): Promise<void> {
    const camelRule = this.toCamelCase(ruleName)
    const content = `/**
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

    await fs.writeFile(join(outputDir, 'test', 'rules', `${ruleName}.test.ts`), content)
  }

  private async generateReadme(
    outputDir: string,
    pluginName: string,
    ruleName: string,
  ): Promise<void> {
    const content = `# ${pluginName}

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

    await fs.writeFile(join(outputDir, 'README.md'), content)
  }

  private async generateGitignore(outputDir: string): Promise<void> {
    const content = `node_modules/
dist/
*.log
.DS_Store
coverage/
`

    await fs.writeFile(join(outputDir, '.gitignore'), content)
  }

  private toCamelCase(str: string): string {
    return str
      .split('-')
      .map((word, index) => {
        if (index === 0) return word
        return word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join('')
  }
}
