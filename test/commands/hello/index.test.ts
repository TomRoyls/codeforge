import { describe, expect, it } from 'vitest'

describe('hello', () => {
  it('command module can be imported', async () => {
    const { default: Hello } = await import('../../../src/commands/hello/index.ts')
    expect(Hello).toBeDefined()
    expect(Hello.description).toBe('Say hello')
  })
})
