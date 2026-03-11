import { describe, expect, it, vi } from 'vitest'

describe('hello world', () => {
  it('command module can be imported', async () => {
    const { default: World } = await import('../../../src/commands/hello/world.ts')
    expect(World).toBeDefined()
    expect(World.description).toBe('Say hello world')
  })

  it('run() logs hello world', async () => {
    const { default: World } = await import('../../../src/commands/hello/world.ts')
    const world = new World([], {} as never)
    const logSpy = vi.spyOn(world, 'log')
    await world.run()
    expect(logSpy).toHaveBeenCalledWith('hello world! (./src/commands/hello/world.ts)')
  })
})
