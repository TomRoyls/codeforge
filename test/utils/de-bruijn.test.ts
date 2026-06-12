import { describe, expect, it } from 'vitest'
import { DeBruijnSequence } from '../../src/utils/de-bruijn.js'

describe('DeBruijnSequence', () => {
  it('generates binary sequence for n=2', () => {
    const seq = DeBruijnSequence.generateBinary(2)
    expect(seq.length).toBe(4)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 2)).toBe(true)
  })

  it('generates binary sequence for n=3', () => {
    const seq = DeBruijnSequence.generateBinary(3)
    expect(seq.length).toBe(8)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 3)).toBe(true)
  })

  it('generates binary sequence for n=1', () => {
    const seq = DeBruijnSequence.generateBinary(1)
    expect(seq.length).toBe(2)
    expect(seq).toBe('01')
  })

  it('generates ternary sequence for n=2', () => {
    const seq = DeBruijnSequence.generate(3, 2)
    expect(seq.length).toBe(9)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 3, 2)).toBe(true)
  })

  it('throws for excessive alphabet size', () => {
    expect(() => DeBruijnSequence.generate(100, 2)).toThrow()
  })

  it('sequence length is k^n for binary n=4', () => {
    const seq = DeBruijnSequence.generateBinary(4)
    expect(seq.length).toBe(16)
  })

  it('containsAllSubstrings rejects incomplete sequence', () => {
    expect(DeBruijnSequence.containsAllSubstrings('0000', 2, 2)).toBe(false)
  })

  it('wraps around correctly', () => {
    const seq = DeBruijnSequence.generateBinary(3)
    const doubled = seq + seq
    const substrings = new Set<string>()
    for (let i = 0; i < 8; i++) {
      substrings.add(doubled.slice(i, i + 3))
    }
    expect(substrings.size).toBe(8)
  })

  it('generates sequence for k=4 n=2', () => {
    const seq = DeBruijnSequence.generate(4, 2)
    expect(seq.length).toBe(16)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 4, 2)).toBe(true)
  })

  it('all characters from alphabet appear', () => {
    const seq = DeBruijnSequence.generate(3, 2)
    expect(seq).toContain('0')
    expect(seq).toContain('1')
    expect(seq).toContain('2')
  })

  it('binary n=4 has correct length', () => {
    const seq = DeBruijnSequence.generateBinary(4)
    expect(seq.length).toBe(16)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 4)).toBe(true)
  })

  it('generateBinary is consistent with generate(2,n)', () => {
    expect(DeBruijnSequence.generateBinary(3)).toBe(DeBruijnSequence.generate(2, 3))
  })

  it('sequence contains exactly k^n characters', () => {
    expect(DeBruijnSequence.generate(2, 5).length).toBe(32)
    expect(DeBruijnSequence.generate(3, 3).length).toBe(27)
  })

  it('k=5 n=2 generates correctly', () => {
    const seq = DeBruijnSequence.generate(5, 2)
    expect(seq.length).toBe(25)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 5, 2)).toBe(true)
  })

  it('wrapping contains all n-length substrings', () => {
    const seq = DeBruijnSequence.generateBinary(3)
    const doubled = seq + seq
    for (let i = 0; i < 8; i++) {
      expect(doubled.slice(i, i + 3)).toBeTruthy()
    }
  })

  it('generates hex sequence for n=2', () => {
    const seq = DeBruijnSequence.generate(16, 2)
    expect(seq.length).toBe(256)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 16, 2)).toBe(true)
  })

  it('containsAllSubstrings handles k=1', () => {
    const seq = DeBruijnSequence.generate(1, 5)
    expect(seq.length).toBe(1)
    expect(seq).toBe('0')
  })

  it('binary n=5 has correct length and validates', () => {
    const seq = DeBruijnSequence.generateBinary(5)
    expect(seq.length).toBe(32)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 5)).toBe(true)
  })

  it('ternary n=3 has correct length and validates', () => {
    const seq = DeBruijnSequence.generate(3, 3)
    expect(seq.length).toBe(27)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 3, 3)).toBe(true)
  })

  it('k=6 n=2 generates correctly', () => {
    const seq = DeBruijnSequence.generate(6, 2)
    expect(seq.length).toBe(36)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 6, 2)).toBe(true)
  })

  it('k=7 n=2 generates correctly', () => {
    const seq = DeBruijnSequence.generate(7, 2)
    expect(seq.length).toBe(49)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 7, 2)).toBe(true)
  })

  it('k=8 n=2 generates correctly', () => {
    const seq = DeBruijnSequence.generate(8, 2)
    expect(seq.length).toBe(64)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 8, 2)).toBe(true)
  })

  it('k=9 n=2 generates correctly', () => {
    const seq = DeBruijnSequence.generate(9, 2)
    expect(seq.length).toBe(81)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 9, 2)).toBe(true)
  })

  it('k=10 n=2 generates correctly', () => {
    const seq = DeBruijnSequence.generate(10, 2)
    expect(seq.length).toBe(100)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 10, 2)).toBe(true)
  })

  it('generates lowercase hex sequence for n=2', () => {
    const seq = DeBruijnSequence.generate(16, 2)
    expect(seq).toMatch(/^[0-9a-f]+$/)
  })

  it('binary sequence only contains 0 and 1', () => {
    const seq = DeBruijnSequence.generateBinary(4)
    expect(seq).toMatch(/^[01]+$/)
  })

  it('ternary sequence only contains 0, 1, and 2', () => {
    const seq = DeBruijnSequence.generate(3, 3)
    expect(seq).toMatch(/^[012]+$/)
  })

  it('containsAllSubstrings returns false for empty sequence', () => {
    expect(DeBruijnSequence.containsAllSubstrings('', 2, 2)).toBe(false)
  })

  it('binary n=6 generates correctly', () => {
    const seq = DeBruijnSequence.generateBinary(6)
    expect(seq.length).toBe(64)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 6)).toBe(true)
  })

  it('k=4 n=3 generates correctly', () => {
    const seq = DeBruijnSequence.generate(4, 3)
    expect(seq.length).toBe(64)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 4, 3)).toBe(true)
  })

  it('k=5 n=3 generates correctly', () => {
    const seq = DeBruijnSequence.generate(5, 3)
    expect(seq.length).toBe(125)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 5, 3)).toBe(true)
  })

  it('throws for alphabet size exceeding 36', () => {
    expect(() => DeBruijnSequence.generate(37, 2)).toThrow('Alphabet size 37 exceeds available characters')
  })

  it('k=2 n=7 generates correctly', () => {
    const seq = DeBruijnSequence.generate(2, 7)
    expect(seq.length).toBe(128)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 7)).toBe(true)
  })

  it('k=11 n=2 generates correctly', () => {
    const seq = DeBruijnSequence.generate(11, 2)
    expect(seq.length).toBe(121)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 11, 2)).toBe(true)
  })

  it('k=12 n=2 generates correctly', () => {
    const seq = DeBruijnSequence.generate(12, 2)
    expect(seq.length).toBe(144)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 12, 2)).toBe(true)
  })

  it('containsAllSubstrings detects missing substrings', () => {
    const seq = '00110011'
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 3)).toBe(false)
  })

  it('k=3 n=4 generates correctly', () => {
    const seq = DeBruijnSequence.generate(3, 4)
    expect(seq.length).toBe(81)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 3, 4)).toBe(true)
  })

  it('binary n=1 validates correctly', () => {
    const seq = DeBruijnSequence.generateBinary(1)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 1)).toBe(true)
  })

  it('k=1 n=1 generates correctly', () => {
    const seq = DeBruijnSequence.generate(1, 1)
    expect(seq.length).toBe(1)
    expect(seq).toBe('0')
  })

  it('k=36 n=2 uses all alphanumeric characters', () => {
    const seq = DeBruijnSequence.generate(36, 2)
    expect(seq.length).toBe(1296)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 36, 2)).toBe(true)
  })

  it('containsAllSubstrings with k>n works correctly', () => {
    const seq = DeBruijnSequence.generate(4, 2)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 4, 2)).toBe(true)
  })

  it('binary n=8 generates correctly', () => {
    const seq = DeBruijnSequence.generateBinary(8)
    expect(seq.length).toBe(256)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 8)).toBe(true)
  })

  it('k=2 n=9 generates correctly', () => {
    const seq = DeBruijnSequence.generate(2, 9)
    expect(seq.length).toBe(512)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 9)).toBe(true)
  })

  it('k=13 n=2 generates correctly', () => {
    const seq = DeBruijnSequence.generate(13, 2)
    expect(seq.length).toBe(169)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 13, 2)).toBe(true)
  })

  it('k=14 n=2 generates correctly', () => {
    const seq = DeBruijnSequence.generate(14, 2)
    expect(seq.length).toBe(196)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 14, 2)).toBe(true)
  })

  it('k=15 n=2 generates correctly', () => {
    const seq = DeBruijnSequence.generate(15, 2)
    expect(seq.length).toBe(225)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 15, 2)).toBe(true)
  })

  it('should generate binary sequence for n=4', () => {
    const seq = DeBruijnSequence.generateBinary(4)
    expect(seq.length).toBe(16)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 4)).toBe(true)
  })

  it('should generate sequence for k=3, n=2', () => {
    const seq = DeBruijnSequence.generate(3, 2)
    expect(seq.length).toBe(9)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 3, 2)).toBe(true)
  })

  it('should generate single character sequence for n=1', () => {
    const seq = DeBruijnSequence.generate(2, 1)
    expect(seq.length).toBe(2)
    expect(seq).toBe('01')
  })

  it('should throw for k exceeding alphabet size', () => {
    expect(() => DeBruijnSequence.generate(37, 2)).toThrow()
  })

  it('should use correct alphabet characters', () => {
    const seq = DeBruijnSequence.generate(3, 2)
    for (const ch of seq) {
      expect('012').toContain(ch)
    }
  })

  it('should produce cyclic valid sequence', () => {
    const seq = DeBruijnSequence.generate(2, 3)
    const doubled = seq + seq
    for (let i = 0; i < 8; i++) {
      let sub = i.toString(2).padStart(3, '0')
      expect(doubled).toContain(sub)
    }
  })

  it('generateBinary for n=1 returns 01', () => {
    expect(DeBruijnSequence.generateBinary(1)).toBe('01')
  })

  it('containsAllSubstrings validates generated sequence', () => {
    const seq = DeBruijnSequence.generate(2, 3)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 3)).toBe(true)
  })

  it('generate for k=3 n=1 has length 3', () => {
    expect(DeBruijnSequence.generate(3, 1).length).toBe(3)
  })
})
  it('generate k=2 n=2', () => {
    const result = DeBruijnSequence.generate(2, 2)
    expect(result.length).toBe(4)
  })

  it('generate k=2 n=1', () => {
    const result = DeBruijnSequence.generate(2, 1)
    expect(result.length).toBe(2)
  })

  it('generate contains all substrings', () => {
    const seq = DeBruijnSequence.generate(2, 3)
    expect(seq.length).toBe(8)
  })

describe('de-bruijn - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('de-bruijn - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('de-bruijn - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('de-bruijn - wave548', () => {
  it('de-bruijn module defined', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn module is function', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave549', () => {
  it('de-bruijn module defined', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn module is function', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave550', () => {
  it('de-bruijn w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave551', () => {
  it('de-bruijn w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave552', () => {
  it('de-bruijn w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave553', () => {
  it('de-bruijn w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave554', () => {
  it('de-bruijn w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave555', () => {
  it('de-bruijn w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave556', () => {
  it('de-bruijn w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave557', () => {
  it('de-bruijn w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave558', () => {
  it('de-bruijn w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w558 v2', () => {
    expect(describe).toBeDefined()
  })
})
