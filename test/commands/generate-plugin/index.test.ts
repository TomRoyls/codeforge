import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('generate-plugin command', () => {
  const testOutputDir = join(process.cwd(), 'test-plugin-output')

  beforeEach(() => {
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true })
    }
  })

  afterEach(() => {
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true })
    }
  })

  it('command module can be imported', async () => {
    const { default: GeneratePlugin } = await import('../../../src/commands/generate-plugin.ts')
    expect(GeneratePlugin).toBeDefined()
    expect(GeneratePlugin.description).toContain('Generate a new CodeForge plugin scaffold')
  })

  it('has correct flags defined', async () => {
    const { default: GeneratePlugin } = await import('../../../src/commands/generate-plugin.ts')
    expect(GeneratePlugin.flags).toBeDefined()
    expect(GeneratePlugin.flags.typescript).toBeDefined()
    expect(GeneratePlugin.flags.rule).toBeDefined()
    expect(GeneratePlugin.flags.output).toBeDefined()
    expect(GeneratePlugin.flags.force).toBeDefined()
  })

  it('has correct args defined', async () => {
    const { default: GeneratePlugin } = await import('../../../src/commands/generate-plugin.ts')
    expect(GeneratePlugin.args).toBeDefined()
    expect(GeneratePlugin.args.name).toBeDefined()
    expect(GeneratePlugin.args.name.required).toBe(true)
  })

  it('has examples defined', async () => {
    const { default: GeneratePlugin } = await import('../../../src/commands/generate-plugin.ts')
    expect(GeneratePlugin.examples).toBeDefined()
    expect(Array.isArray(GeneratePlugin.examples)).toBe(true)
    expect(GeneratePlugin.examples.length).toBeGreaterThan(0)
  })
})
