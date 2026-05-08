import type { ScaffoldConfig, ScaffoldTemplate, ScaffoldResult } from './types.js'
import { DEFAULT_SCAFFOLD_CONFIG } from './types.js'
import { TemplateProcessor } from './template-processor.js'

export class Scaffolder {
  private config: ScaffoldConfig
  private templates: Map<string, ScaffoldTemplate>
  private processor: TemplateProcessor

  constructor(config?: Partial<ScaffoldConfig>) {
    this.config = { ...DEFAULT_SCAFFOLD_CONFIG, ...config }
    this.templates = new Map()
    this.processor = new TemplateProcessor()
  }

  registerTemplate(template: ScaffoldTemplate): void {
    this.templates.set(template.name, template)
  }

  getTemplate(name: string): ScaffoldTemplate | undefined {
    return this.templates.get(name)
  }

  listTemplates(): string[] {
    return Array.from(this.templates.keys())
  }

  scaffold(templateName: string, variables?: Record<string, string>): ScaffoldResult {
    const template = this.templates.get(templateName)
    if (!template) {
      throw new Error(`Template not found: ${templateName}`)
    }

    const mergedVars = { ...this.config.variables, ...variables }
    const missing = this.processor.validateVariables(template, mergedVars)
    if (missing.length > 0) {
      throw new Error(`Missing required variables: ${missing.join(', ')}`)
    }

    const resolvedVars = this.resolveAllVariables(template, mergedVars)
    const filesCreated: string[] = []
    const filesSkipped: string[] = []
    const seen = new Set<string>()

    for (const file of template.files) {
      const processedPath = this.processor.processPath(file.path, resolvedVars)
      if (seen.has(processedPath) && !this.config.overwrite) {
        filesSkipped.push(processedPath)
      } else {
        filesCreated.push(processedPath)
        seen.add(processedPath)
      }
    }

    return {
      filesCreated,
      filesSkipped,
      variables: resolvedVars,
    }
  }

  addBuiltinTemplates(): void {
    this.registerTemplate(this.createTypeScriptModuleTemplate())
    this.registerTemplate(this.createTestFileTemplate())
    this.registerTemplate(this.createConfigJsonTemplate())
  }

  getConfig(): ScaffoldConfig {
    return { ...this.config }
  }

  getProcessor(): TemplateProcessor {
    return this.processor
  }

  private resolveAllVariables(
    template: ScaffoldTemplate,
    provided: Record<string, string>,
  ): Record<string, string> {
    const resolved: Record<string, string> = {}
    for (const v of template.variables) {
      const providedValue = provided[v.name]
      if (providedValue !== undefined) {
        resolved[v.name] = providedValue
      } else if (v.defaultValue !== undefined) {
        resolved[v.name] = v.defaultValue
      }
    }
    return resolved
  }

  private createTypeScriptModuleTemplate(): ScaffoldTemplate {
    return {
      name: 'typescript-module',
      description: 'Creates a TypeScript module file with interface, class, and export',
      variables: [
        { name: 'moduleName', description: 'Name of the module', required: true },
        { name: 'description', description: 'Module description', defaultValue: 'A TypeScript module', required: false },
        { name: 'author', description: 'Module author', defaultValue: 'CodeForge', required: false },
      ],
      files: [
        {
          path: 'src/{{moduleName}}.ts',
          content: `// {{description}}
// Author: {{author}}

export interface I{{moduleName}} {
  execute(): void
}

export class {{moduleName}} implements I{{moduleName}} {
  execute(): void {
    // Implementation
  }
}

export default {{moduleName}}`,
          executable: false,
        },
      ],
    }
  }

  private createTestFileTemplate(): ScaffoldTemplate {
    return {
      name: 'test-file',
      description: 'Creates a vitest test file with describe/it blocks',
      variables: [
        { name: 'moduleName', description: 'Name of the module to test', required: true },
        { name: 'description', description: 'Test description', defaultValue: 'Test file', required: false },
      ],
      files: [
        {
          path: 'test/{{moduleName}}.test.ts',
          content: `import { describe, it, expect } from 'vitest'
import { {{moduleName}} } from '../src/{{moduleName}}.js'

describe('{{description}}', () => {
  it('should be defined', () => {
    expect({{moduleName}}).toBeDefined()
  })

  it('should execute correctly', () => {
    const instance = new {{moduleName}}()
    expect(instance).toBeDefined()
  })
})`,
          executable: false,
        },
      ],
    }
  }

  private createConfigJsonTemplate(): ScaffoldTemplate {
    return {
      name: 'config-json',
      description: 'Creates a JSON config file template',
      variables: [
        { name: 'configName', description: 'Name of the config file', required: true },
        { name: 'version', description: 'Config version', defaultValue: '1.0.0', required: false },
        { name: 'description', description: 'Config description', defaultValue: 'Configuration file', required: false },
      ],
      files: [
        {
          path: '{{configName}}.json',
          content: `{
  "name": "{{configName}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "settings": {}
}`,
          executable: false,
        },
      ],
    }
  }
}
