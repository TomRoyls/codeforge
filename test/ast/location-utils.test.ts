import { describe, expect, it } from 'vitest'

import { extractLocation } from '../../src/ast/location-utils.js'

// ─── Default location for invalid inputs ───

describe('extractLocation', () => {
  it('returns default location for null input', () => {
    const result = extractLocation(null)
    expect(result).toEqual({
      end: { column: 1, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  it('returns default location for undefined input', () => {
    const result = extractLocation(undefined)
    expect(result).toEqual({
      end: { column: 1, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  it('returns default location for string input', () => {
    const result = extractLocation('not-an-object')
    expect(result).toEqual({
      end: { column: 1, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  it('returns default location for number input', () => {
    const result = extractLocation(42)
    expect(result).toEqual({
      end: { column: 1, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  it('returns default location for boolean input', () => {
    const result = extractLocation(true)
    expect(result).toEqual({
      end: { column: 1, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  // ─── Default location for objects without loc ───

  it('returns default location for empty object (no loc)', () => {
    const result = extractLocation({})
    expect(result).toEqual({
      end: { column: 1, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  it('returns default location for object with null loc', () => {
    const result = extractLocation({ loc: null })
    expect(result).toEqual({
      end: { column: 1, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  it('returns default location for object with undefined loc', () => {
    const result = extractLocation({ loc: undefined })
    expect(result).toEqual({
      end: { column: 1, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  // ─── Valid location extraction ───

  it('extracts location from object with valid loc', () => {
    const node = {
      loc: {
        end: { column: 15, line: 10 },
        start: { column: 0, line: 5 },
      },
    }
    const result = extractLocation(node)
    expect(result).toEqual({
      end: { column: 15, line: 10 },
      start: { column: 0, line: 5 },
    })
  })

  // ─── Custom defaultLine parameter ───

  it('uses custom defaultLine parameter for null input', () => {
    const result = extractLocation(null, 42)
    expect(result).toEqual({
      end: { column: 1, line: 42 },
      start: { column: 0, line: 42 },
    })
  })

  it('uses custom defaultLine parameter for object without loc', () => {
    const result = extractLocation({}, 7)
    expect(result).toEqual({
      end: { column: 1, line: 7 },
      start: { column: 0, line: 7 },
    })
  })

  // ─── Graceful handling of malformed loc ───

  it('handles loc with missing start and end gracefully', () => {
    const node = { loc: {} }
    const result = extractLocation(node)
    expect(result).toEqual({
      end: { column: 0, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  it('handles loc with non-numeric column and line', () => {
    const node = {
      loc: {
        end: { column: 'bad', line: 'bad' },
        start: { column: 'bad', line: 'bad' },
      },
    }
    const result = extractLocation(node)
    expect(result).toEqual({
      end: { column: 0, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  it('handles loc with non-numeric column and custom defaultLine', () => {
    const node = {
      loc: {
        end: { column: null, line: null },
        start: { column: null, line: null },
      },
    }
    const result = extractLocation(node, 10)
    expect(result).toEqual({
      end: { column: 0, line: 10 },
      start: { column: 0, line: 10 },
    })
  })

  it('handles loc where only start exists (end defaults)', () => {
    const node = {
      loc: {
        start: { column: 4, line: 3 },
      },
    }
    const result = extractLocation(node)
    expect(result).toEqual({
      end: { column: 0, line: 1 },
      start: { column: 4, line: 3 },
    })
  })

  it('handles loc where only end exists (start defaults)', () => {
    const node = {
      loc: {
        end: { column: 20, line: 8 },
      },
    }
    const result = extractLocation(node)
    expect(result).toEqual({
      end: { column: 20, line: 8 },
      start: { column: 0, line: 1 },
    })
  })

  // ─── Mixed valid and invalid fields ───

  it('handles loc with valid start but invalid end fields', () => {
    const node = {
      loc: {
        end: { column: 'x', line: 'y' },
        start: { column: 2, line: 5 },
      },
    }
    const result = extractLocation(node)
    expect(result).toEqual({
      end: { column: 0, line: 1 },
      start: { column: 2, line: 5 },
    })
  })

  it('handles loc with invalid start but valid end fields', () => {
    const node = {
      loc: {
        end: { column: 10, line: 12 },
        start: { column: false, line: true },
      },
    }
    const result = extractLocation(node)
    expect(result).toEqual({
      end: { column: 10, line: 12 },
      start: { column: 0, line: 1 },
    })
  })
})
