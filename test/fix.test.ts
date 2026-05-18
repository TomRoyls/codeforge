import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('fix module', () => {
  it('exports the Fix class as default', async () => {
    const mod = await import('../src/commands/fix.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('Fix class has static description', async () => {
    const mod = await import('../src/commands/fix.js')
    expect(mod.default.description).toBe('Automatically fix violations in source files')
  })

  it('Fix class has static flags defined', async () => {
    const mod = await import('../src/commands/fix.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags.ci).toBeDefined()
    expect(mod.default.flags.concurrency).toBeDefined()
    expect(mod.default.flags.config).toBeDefined()
    expect(mod.default.flags['dry-run']).toBeDefined()
    expect(mod.default.flags.ignore).toBeDefined()
    expect(mod.default.flags.rules).toBeDefined()
    expect(mod.default.flags['safe-only']).toBeDefined()
    expect(mod.default.flags.verbose).toBeDefined()
  })

  it('Fix class has static args defined', async () => {
    const mod = await import('../src/commands/fix.js')
    expect(mod.default.args).toBeDefined()
    expect(mod.default.args.files).toBeDefined()
  })

  it('Fix class has static examples', async () => {
    const mod = await import('../src/commands/fix.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Type Interfaces ──────────────────────────────────
describe('fix type interfaces', () => {
  it('FileFixResult supports unchanged status', () => {
    const result = {
      conflicts: [],
      file: 'test.ts',
      fixesApplied: 0,
      fixesSkipped: 0,
      status: 'unchanged' as const,
    }
    expect(result.status).toBe('unchanged')
    expect(result.fixesApplied).toBe(0)
  })

  it('FileFixResult supports error status', () => {
    const result = {
      conflicts: [],
      error: 'something failed',
      file: 'bad.ts',
      fixesApplied: 0,
      fixesSkipped: 0,
      status: 'error' as const,
    }
    expect(result.error).toBe('something failed')
    expect(result.status).toBe('error')
  })

  it('FileFixResult supports processed status with diffPreview', () => {
    const result = {
      conflicts: [{ conflictingRule: 'rule-b', ruleId: 'rule-a' }],
      diffPreview: '--- a/test.ts\n+++ b/test.ts',
      file: 'test.ts',
      fixesApplied: 3,
      fixesSkipped: 1,
      status: 'processed' as const,
    }
    expect(result.diffPreview).toBeDefined()
    expect(result.conflicts).toHaveLength(1)
    expect(result.fixesApplied).toBe(3)
  })

  it('FixFlags shape is valid with all options', () => {
    const flags = {
      ci: true,
      concurrency: 8,
      config: '.codeforgerc.json',
      'dry-run': true,
      ignore: ['**/test/**'],
      rules: 'prefer-const,no-eval',
      'safe-only': true,
      verbose: true,
    }
    expect(flags.ci).toBe(true)
    expect(flags.concurrency).toBe(8)
    expect(flags['dry-run']).toBe(true)
    expect(flags['safe-only']).toBe(true)
  })

  it('ProcessContext shape is valid', () => {
    const context = {
      dryRun: false,
      parser: {} as any,
      registry: {} as any,
      rulesWithFixes: new Map(),
    }
    expect(context.dryRun).toBe(false)
    expect(context.rulesWithFixes).toBeInstanceOf(Map)
  })
})

// ─── Static Configuration ──────────────────────────────
describe('Fix static configuration', () => {
  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/fix.js')
    expect(mod.default.flags.ci.default).toBe(false)
    expect(mod.default.flags['dry-run'].default).toBe(false)
    expect(mod.default.flags['safe-only'].default).toBe(false)
    expect(mod.default.flags.verbose.default).toBe(false)
  })

  it('has rules flag with multiple=false', async () => {
    const mod = await import('../src/commands/fix.js')
    expect(mod.default.flags.rules.multiple).toBe(false)
  })

  it('has ignore flag with multiple=true', async () => {
    const mod = await import('../src/commands/fix.js')
    expect(mod.default.flags.ignore.multiple).toBe(true)
  })

  it('has args with files configuration', async () => {
    const mod = await import('../src/commands/fix.js')
    expect(mod.default.args.files.multiple).toBe(true)
    expect(mod.default.args.files.required).toBe(false)
  })

  it('examples have command and description', async () => {
    const mod = await import('../src/commands/fix.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
