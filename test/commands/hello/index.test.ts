import { describe, expect, it, vi } from 'vitest'

describe('hello', () => {
  it('command module can be imported', async () => {
    const { default: Hello } = await import('../../../src/commands/hello/index.ts')
    expect(Hello).toBeDefined()
    expect(Hello.description).toBe('Say hello')
  })

  it('run() logs hello with person and from', async () => {
    const { default: Hello } = await import('../../../src/commands/hello/index.ts')
    const hello = new Hello(['friend'], {} as never)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(hello as any).parse = vi
      .fn()
      .mockResolvedValue({ args: { person: 'friend' }, flags: { from: 'oclif' } })
    const logSpy = vi.spyOn(hello, 'log')
    await hello.run()
    expect(logSpy).toHaveBeenCalledWith('hello friend from oclif! (./src/commands/hello/index.ts)')
  })
})
