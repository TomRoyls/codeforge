import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { parseEnvVars, clearEnvVars } from '../../../src/config/env-parser.js'
import { mergeEnvConfig } from '../../../src/config/merger.js'
import type { CodeForgeConfig } from '../../../src/config/types.js'

describe('Environment Variable Config', () => {
  beforeEach(() => {
    clearEnvVars()
  })

  afterEach(() => {
    clearEnvVars()
  })

  describe('parseEnvVars', () => {
    it('should parse CODEFORGE_FILES with comma-separated values', () => {
      process.env.CODEFORGE_FILES = '**/*.ts,**/*.js'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts', '**/*.js'])
    })

    it('should parse CODEFORGE_IGNORE with comma-separated values', () => {
      process.env.CODEFORGE_IGNORE = 'node_modules/**,dist/**'
      const config = parseEnvVars()
      expect(config.ignore).toEqual(['node_modules/**', 'dist/**'])
    })

    it('should parse CODEFORGE_RULES_<RULEID> for rule severity', () => {
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      process.env.CODEFORGE_RULES_MAX_PARAMS = 'warning'
      const config = parseEnvVars()
      expect(config.rules).toEqual({
        'max-complexity': 'error',
        'max-params': 'warning',
      })
    })

    it('should parse CODEFORGE_RULES_<RULEID>_OPTIONS as JSON', () => {
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS = '{"max": 10}'
      const config = parseEnvVars()
      expect(config.rules).toEqual({
        'max-complexity': ['error', { max: 10 }],
      })
    })

    it('should return empty config when no env vars set', () => {
      const config = parseEnvVars()
      expect(config).toEqual({})
    })

    it('should handle single file pattern', () => {
      process.env.CODEFORGE_FILES = '**/*.ts'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts'])
    })

    it('should handle invalid JSON in options gracefully', () => {
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS = '{invalid}'
      const config = parseEnvVars()
      // Should fall back to severity only
      expect(config.rules).toEqual({
        'max-complexity': 'error',
      })
    })

    it('should convert underscore to hyphen in rule IDs', () => {
      process.env.CODEFORGE_RULES_MAX_LINES_PER_FUNCTION = 'error'
      const config = parseEnvVars()
      expect(config.rules).toHaveProperty('max-lines-per-function')
    })

    it('should trim whitespace from array values', () => {
      process.env.CODEFORGE_FILES = '  **/*.ts  ,  **/*.js  '
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts', '**/*.js'])
    })
  })

  describe('mergeEnvConfig', () => {
    it('should override file config with env config', () => {
      const fileConfig: CodeForgeConfig = {
        rules: {
          'max-complexity': 'warning',
        },
      }
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.rules?.['max-complexity']).toBe('error')
    })

    it('should merge arrays (files, ignore) from env', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
      }
      process.env.CODEFORGE_FILES = '**/*.js,**/*.ts'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.files).toEqual(['**/*.js', '**/*.ts'])
    })

    it('should use file config when env not set', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
        rules: { 'max-complexity': 'error' },
      }
      const merged = mergeEnvConfig(fileConfig, parseEnvVars())
      expect(merged).toEqual(fileConfig)
    })

    it('should add new rules from env to existing rules', () => {
      const fileConfig: CodeForgeConfig = {
        rules: { 'max-complexity': 'error' },
      }
      process.env.CODEFORGE_RULES_MAX_PARAMS = 'warning'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.rules).toEqual({
        'max-complexity': 'error',
        'max-params': 'warning',
      })
    })
  })

  describe('env var naming convention', () => {
    it('should only process CODEFORGE_ prefixed vars', () => {
      process.env.OTHER_VAR = 'value'
      process.env.CODEFORGE_FILES = '**/*.ts'
      const config = parseEnvVars()
      expect(config.files).toBeDefined()
    })

    it('should be case-sensitive (CODEFORGE_ not codeforge_)', () => {
      process.env.codeforge_files = '**/*.js'
      process.env.CODEFORGE_FILES = '**/*.ts'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts'])
    })
  })
})
