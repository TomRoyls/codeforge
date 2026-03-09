import { describe, test, expect } from 'vitest'
import { mergeConfigs } from '../../../src/config/merger'
import { DEFAULT_CONFIG } from '../../../src/config/types'
import type { CodeForgeConfig } from '../../../src/config/types'

describe('mergeConfigs', () => {
  test('uses defaults when both empty', () => {
    const result = mergeConfigs({}, {})
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
    expect(result.rules).toEqual({})
  })

  test('CLI flags override file config', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      files: ['lib/**/*.js'],
      ignore: ['dist/**'],
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.files).toEqual(['lib/**/*.js'])
    expect(result.ignore).toEqual(['dist/**'])
  })

  test('CLI rules override file rules', () => {
    const fileConfig: CodeForgeConfig = {
      rules: {
        'max-complexity': 'error',
        'no-eval': 'warning',
      },
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      rules: {
        'max-complexity': 'info',
      },
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.rules).toEqual({
      'max-complexity': 'info',
      'no-eval': 'warning',
    })
  })

  test('uses file config when CLI not provided', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
      rules: {
        'max-complexity': 'error',
      },
    }
    const result = mergeConfigs(fileConfig, {})
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['node_modules/**'])
    expect(result.rules).toEqual({ 'max-complexity': 'error' })
  })

  test('properly merges nested rules objects', () => {
    const fileConfig: CodeForgeConfig = {
      rules: {
        'max-complexity': ['error', { max: 10 }],
        'max-lines': ['warning', { max: 500 }],
        'no-eval': 'error',
      },
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      rules: {
        'max-complexity': ['warning', { max: 20 }],
        'prefer-const': 'error',
      },
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.rules).toEqual({
      'max-complexity': ['warning', { max: 20 }],
      'max-lines': ['warning', { max: 500 }],
      'no-eval': 'error',
      'prefer-const': 'error',
    })
  })

  test('CLI empty array overrides file config', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      files: [],
      ignore: [],
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.files).toEqual([])
    expect(result.ignore).toEqual([])
  })

  test('CLI undefined falls back to file config', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      files: undefined,
      ignore: undefined,
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['node_modules/**'])
  })
})
