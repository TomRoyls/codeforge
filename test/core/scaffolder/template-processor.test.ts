import { describe, expect, it } from 'vitest'
import { TemplateProcessor } from '../../../src/core/scaffolder/template-processor.js'
import type { ScaffoldTemplate } from '../../../src/core/scaffolder/types.js'

const processor = new TemplateProcessor()

// ─── process() ───

describe('TemplateProcessor process', () => {
  it('replaces a single variable', () => {
    expect(processor.process('Hello {{name}}!', { name: 'World' })).toBe('Hello World!')
  })

  it('replaces multiple variables', () => {
    const result = processor.process('{{greeting}} {{name}}', { greeting: 'Hi', name: 'Alice' })
    expect(result).toBe('Hi Alice')
  })

  it('keeps original placeholder for missing variable with no default', () => {
    expect(processor.process('Hello {{name}}', {})).toBe('Hello {{name}}')
  })

  it('uses default value when variable is not provided', () => {
    expect(processor.process('Hello {{name:World}}', {})).toBe('Hello World')
  })

  it('prefers provided value over default', () => {
    expect(processor.process('Hello {{name:World}}', { name: 'Alice' })).toBe('Hello Alice')
  })

  it('returns empty template unchanged', () => {
    expect(processor.process('', { name: 'x' })).toBe('')
  })

  it('returns template unchanged when no placeholders', () => {
    expect(processor.process('no placeholders here', { name: 'x' })).toBe('no placeholders here')
  })

  it('handles special characters in replacement values', () => {
    expect(processor.process('path: {{dir}}', { dir: '/usr/local/bin' })).toBe('path: /usr/local/bin')
  })

  it('handles dollar signs in values', () => {
    expect(processor.process('cost: {{price}}', { price: '$100' })).toBe('cost: $100')
  })
})

// ─── processPath() ───

describe('TemplateProcessor processPath', () => {
  it('delegates to process for path templating', () => {
    expect(processor.processPath('src/{{module}}/index.ts', { module: 'utils' })).toBe('src/utils/index.ts')
  })

  it('handles path with multiple variables', () => {
    const result = processor.processPath('{{scope}}/{{project}}/README.md', {
      scope: 'my-org',
      project: 'my-app',
    })
    expect(result).toBe('my-org/my-app/README.md')
  })

  it('handles path with default values', () => {
    expect(processor.processPath('src/{{lang:ts}}/index.{{ext:ts}}', {})).toBe('src/ts/index.ts')
  })
})

// ─── validateVariables() ───

describe('TemplateProcessor validateVariables', () => {
  it('returns empty array when all required variables are provided', () => {
    const template: ScaffoldTemplate = {
      name: 'test',
      description: '',
      variables: [
        { name: 'appName', description: '', required: true },
        { name: 'version', description: '', required: true },
      ],
      files: [],
    }
    expect(processor.validateVariables(template, { appName: 'myapp', version: '1.0' })).toEqual([])
  })

  it('returns missing required variables', () => {
    const template: ScaffoldTemplate = {
      name: 'test',
      description: '',
      variables: [
        { name: 'appName', description: '', required: true },
        { name: 'version', description: '', required: true },
      ],
      files: [],
    }
    const missing = processor.validateVariables(template, { appName: 'myapp' })
    expect(missing).toEqual(['version'])
  })

  it('does not list optional variables as missing', () => {
    const template: ScaffoldTemplate = {
      name: 'test',
      description: '',
      variables: [
        { name: 'appName', description: '', required: true },
        { name: 'license', description: '', required: false },
      ],
      files: [],
    }
    const missing = processor.validateVariables(template, { appName: 'myapp' })
    expect(missing).toEqual([])
  })

  it('returns all missing when nothing is provided', () => {
    const template: ScaffoldTemplate = {
      name: 'test',
      description: '',
      variables: [
        { name: 'a', description: '', required: true },
        { name: 'b', description: '', required: true },
        { name: 'c', description: '', required: false },
      ],
      files: [],
    }
    const missing = processor.validateVariables(template, {})
    expect(missing).toEqual(['a', 'b'])
  })

  it('returns empty for template with only optional variables', () => {
    const template: ScaffoldTemplate = {
      name: 'test',
      description: '',
      variables: [
        { name: 'a', description: '', required: false },
        { name: 'b', description: '', required: false, defaultValue: 'x' },
      ],
      files: [],
    }
    expect(processor.validateVariables(template, {})).toEqual([])
  })
})

// ─── extractVariables() ───

describe('TemplateProcessor extractVariables', () => {
  it('finds all unique variable names', () => {
    const result = processor.extractVariables('{{name}} and {{age}}')
    expect(result.sort()).toEqual(['age', 'name'])
  })

  it('deduplicates repeated variable names', () => {
    const result = processor.extractVariables('{{name}}-{{name}}-{{name}}')
    expect(result).toEqual(['name'])
  })

  it('returns empty array for template with no variables', () => {
    expect(processor.extractVariables('plain text')).toEqual([])
  })

  it('handles default-value syntax', () => {
    const result = processor.extractVariables('{{name:default}} and {{age:42}}')
    expect(result.sort()).toEqual(['age', 'name'])
  })

  it('extracts from mixed syntax', () => {
    const result = processor.extractVariables('{{a}} {{b:val}} {{a}}')
    expect(result.sort()).toEqual(['a', 'b'])
  })
})
