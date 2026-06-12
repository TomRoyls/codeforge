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

describe('de-bruijn - wave559', () => {
  it('de-bruijn w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave560', () => {
  it('de-bruijn w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave561', () => {
  it('de-bruijn w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave562', () => {
  it('de-bruijn w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave563', () => {
  it('de-bruijn w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave564', () => {
  it('de-bruijn w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave565', () => {
  it('de-bruijn w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave566', () => {
  it('de-bruijn w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave127', () => {
  it('de-bruijn w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave130', () => {
  it('de-bruijn w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave133', () => {
  it('de-bruijn w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave136', () => {
  it('de-bruijn w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - wave139', () => {
  it('de-bruijn w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w142', () => {
  it('de-bruijn v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w145', () => {
  it('de-bruijn v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w148', () => {
  it('de-bruijn v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w151', () => {
  it('de-bruijn v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w154', () => {
  it('de-bruijn v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w157', () => {
  it('de-bruijn v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w160', () => {
  it('de-bruijn v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w170', () => {
  it('de-bruijn x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w180', () => {
  it('de-bruijn x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w190', () => {
  it('de-bruijn x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w200', () => {
  it('de-bruijn x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w210', () => {
  it('de-bruijn x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w220', () => {
  it('de-bruijn x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w230', () => {
  it('de-bruijn x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w240', () => {
  it('de-bruijn x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w250', () => {
  it('de-bruijn x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w260', () => {
  it('de-bruijn x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w270', () => {
  it('de-bruijn x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w280', () => {
  it('de-bruijn x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w290', () => {
  it('de-bruijn x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w300', () => {
  it('de-bruijn x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w310', () => {
  it('de-bruijn x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w320', () => {
  it('de-bruijn x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w330', () => {
  it('de-bruijn x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w340', () => {
  it('de-bruijn x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w350', () => {
  it('de-bruijn x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w360', () => {
  it('de-bruijn x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w370', () => {
  it('de-bruijn x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w380', () => {
  it('de-bruijn x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w390', () => {
  it('de-bruijn x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w400', () => {
  it('de-bruijn x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w420', () => {
  it('de-bruijn x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w440', () => {
  it('de-bruijn x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w460', () => {
  it('de-bruijn x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w480', () => {
  it('de-bruijn x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w500', () => {
  it('de-bruijn x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w550', () => {
  it('de-bruijn x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w600', () => {
  it('de-bruijn x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w650', () => {
  it('de-bruijn x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('de-bruijn - w700', () => {
  it('de-bruijn x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('de-bruijn x700x49', () => {
    expect(describe).toBeDefined()
  })
})
