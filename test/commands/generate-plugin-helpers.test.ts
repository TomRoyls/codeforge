import { describe, expect, it } from 'vitest'

import {
  isValidPluginName,
  toCamelCase,
  buildPackageJson,
  buildTsConfig,
  buildPluginFileContent,
  buildRuleFileContent,
  buildRuleTestContent,
  buildReadmeContent,
  buildGitignoreContent,
  getDirectoryPaths,
} from '../../src/commands/generate-plugin-helpers.js'

// ─── isValidPluginName ───

describe('isValidPluginName', () => {
  it('accepts lowercase with hyphens', () => {
    expect(isValidPluginName('my-plugin')).toBe(true)
    expect(isValidPluginName('codeforge-plugin-test')).toBe(true)
  })

  it('accepts numbers', () => {
    expect(isValidPluginName('plugin-123')).toBe(true)
  })

  it('rejects uppercase', () => {
    expect(isValidPluginName('My-Plugin')).toBe(false)
  })

  it('rejects spaces', () => {
    expect(isValidPluginName('my plugin')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidPluginName('')).toBe(false)
  })
})

// ─── toCamelCase ───

describe('toCamelCase', () => {
  it('converts kebab-case', () => {
    expect(toCamelCase('my-rule')).toBe('myRule')
  })

  it('handles single word', () => {
    expect(toCamelCase('rule')).toBe('rule')
  })
})

// ─── buildPackageJson ───

describe('buildPackageJson', () => {
  it('includes plugin name in description', () => {
    const pkg = buildPackageJson('my-plugin')
    expect(pkg.description).toContain('my-plugin')
  })

  it('has required scripts', () => {
    const pkg = buildPackageJson('test')
    const scripts = pkg.scripts as Record<string, string>
    expect(scripts.build).toBeDefined()
    expect(scripts.test).toBeDefined()
  })

  it('has MIT license', () => {
    expect(buildPackageJson('x').license).toBe('MIT')
  })
})

// ─── buildTsConfig ───

describe('buildTsConfig', () => {
  it('has strict mode enabled', () => {
    const config = buildTsConfig()
    const opts = config.compilerOptions as Record<string, unknown>
    expect(opts.strict).toBe(true)
  })

  it('targets ES2022', () => {
    const config = buildTsConfig()
    const opts = config.compilerOptions as Record<string, unknown>
    expect(opts.target).toBe('ES2022')
  })

  it('includes src files', () => {
    const config = buildTsConfig()
    expect(config.include).toContain('src/**/*')
  })
})

// ─── buildPluginFileContent ───

describe('buildPluginFileContent', () => {
  it('includes plugin name', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain("name: 'my-plugin'")
  })

  it('includes rule name', () => {
    const content = buildPluginFileContent('my-plugin', 'sample-rule')
    expect(content).toContain('sampleRule')
    expect(content).toContain("sample-rule")
  })
})

// ─── buildRuleFileContent ───

describe('buildRuleFileContent', () => {
  it('includes rule name in meta', () => {
    const content = buildRuleFileContent('my-rule')
    expect(content).toContain('myRule')
  })

  it('exports rule definition', () => {
    const content = buildRuleFileContent('test-rule')
    expect(content).toContain('export const')
  })
})

// ─── buildRuleTestContent ───

describe('buildRuleTestContent', () => {
  it('includes vitest imports', () => {
    const content = buildRuleTestContent('my-rule')
    expect(content).toContain("from 'vitest'")
  })

  it('includes rule name in describe', () => {
    const content = buildRuleTestContent('my-rule')
    expect(content).toContain('my-rule')
  })
})

// ─── buildReadmeContent ───

describe('buildReadmeContent', () => {
  it('includes plugin name as title', () => {
    const content = buildReadmeContent('my-plugin', 'my-rule')
    expect(content).toContain('# my-plugin')
  })

  it('includes installation instructions', () => {
    const content = buildReadmeContent('my-plugin', 'my-rule')
    expect(content).toContain('npm install my-plugin')
  })

  it('includes rule name', () => {
    const content = buildReadmeContent('my-plugin', 'my-rule')
    expect(content).toContain('my-rule')
  })
})

// ─── buildGitignoreContent ───

describe('buildGitignoreContent', () => {
  it('includes node_modules', () => {
    expect(buildGitignoreContent()).toContain('node_modules/')
  })

  it('includes dist', () => {
    expect(buildGitignoreContent()).toContain('dist/')
  })
})

// ─── getDirectoryPaths ───

describe('getDirectoryPaths', () => {
  it('returns expected directory structure', () => {
    const paths = getDirectoryPaths('/output/my-plugin')
    expect(paths).toContain('/output/my-plugin')
    expect(paths).toContain('/output/my-plugin/src')
    expect(paths).toContain('/output/my-plugin/src/rules')
    expect(paths).toContain('/output/my-plugin/test')
    expect(paths).toContain('/output/my-plugin/test/rules')
  })

  it('returns exactly 5 paths', () => {
    expect(getDirectoryPaths('.')).toHaveLength(5)
  })
})
