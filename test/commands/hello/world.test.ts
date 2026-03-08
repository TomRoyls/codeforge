import { describe, expect, it } from 'vitest'

describe('hello world', () => {
  it('command module can be imported', async () => {
    const { default: World } = await import('../../../src/commands/hello/world.ts')
    expect(World).toBeDefined()
    expect(World.description).toBe('Say hello world')
  })
})
