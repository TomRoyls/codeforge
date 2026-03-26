import { describe, it, expect } from 'vitest'
import { RULE_SUGGESTIONS } from '../../../src/utils/suggestions.js'

describe('suggestions', () => {
  describe('RULE_SUGGESTIONS constant', () => {
    it('should be defined', () => {
      expect(RULE_SUGGESTIONS).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof RULE_SUGGESTIONS).toBe('object')
    })

    it('should have all expected keys', () => {
      expect(RULE_SUGGESTIONS).toHaveProperty('noArrayConstructor')
      expect(RULE_SUGGESTIONS).toHaveProperty('noArrayDestructuring')
      expect(RULE_SUGGESTIONS).toHaveProperty('noAsyncPromiseExecutor')
      expect(RULE_SUGGESTIONS).toHaveProperty('noAsyncWithoutAwait')
      expect(RULE_SUGGESTIONS).toHaveProperty('noCaseDeclarations')
      expect(RULE_SUGGESTIONS).toHaveProperty('useLoggingLibrary')
      expect(RULE_SUGGESTIONS).toHaveProperty('noConsoleLog')
      expect(RULE_SUGGESTIONS).toHaveProperty('useStrictEquality')
      expect(RULE_SUGGESTIONS).toHaveProperty('preferObjectSpread')
      expect(RULE_SUGGESTIONS).toHaveProperty('preferOptionalChain')
      expect(RULE_SUGGESTIONS).toHaveProperty('noEval')
      expect(RULE_SUGGESTIONS).toHaveProperty('preferConst')
    })

    it('should have 12 suggestions', () => {
      const keys = Object.keys(RULE_SUGGESTIONS)
      expect(keys).toHaveLength(12)
    })

    it('should have all values as non-empty strings', () => {
      Object.values(RULE_SUGGESTIONS).forEach((value) => {
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      })
    })
  })
})
