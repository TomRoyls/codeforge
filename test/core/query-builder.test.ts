import { describe, it, expect } from 'vitest'
import { FilterEngine } from '../../src/core/query-builder/filter-engine.js'
import { QueryBuilder } from '../../src/core/query-builder/query-builder.js'
import type { QueryFilter } from '../../src/core/query-builder/types.js'

interface TestItem {
  name: string
  age: number
  score: number
  active: boolean
  tags: string[]
}

function makeItem(overrides: Partial<TestItem> = {}): TestItem {
  return {
    name: 'Alice',
    age: 30,
    score: 85,
    active: true,
    tags: ['dev', 'ts'],
    ...overrides,
  }
}

const testData: TestItem[] = [
  { name: 'Alice', age: 30, score: 85, active: true, tags: ['dev', 'ts'] },
  { name: 'Bob', age: 25, score: 90, active: false, tags: ['dev'] },
  { name: 'Charlie', age: 35, score: 75, active: true, tags: ['ops'] },
  { name: 'Diana', age: 28, score: 95, active: true, tags: ['dev', 'rust'] },
  { name: 'Eve', age: 32, score: 80, active: false, tags: ['design'] },
]

describe('FilterEngine', () => {
  const engine = new FilterEngine()

  describe('evaluate', () => {
    it('should match equal values with eq', () => {
      const item = makeItem()
      const filter: QueryFilter = { field: 'name', operator: 'eq', value: 'Alice' }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should not match different values with eq', () => {
      const item = makeItem()
      const filter: QueryFilter = { field: 'name', operator: 'eq', value: 'Bob' }
      expect(engine.evaluate(item, filter)).toBe(false)
    })

    it('should match different values with neq', () => {
      const item = makeItem()
      const filter: QueryFilter = { field: 'name', operator: 'neq', value: 'Bob' }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should not match equal values with neq', () => {
      const item = makeItem()
      const filter: QueryFilter = { field: 'name', operator: 'neq', value: 'Alice' }
      expect(engine.evaluate(item, filter)).toBe(false)
    })

    it('should match greater values with gt', () => {
      const item = makeItem({ age: 30 })
      const filter: QueryFilter = { field: 'age', operator: 'gt', value: 25 }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should not match lesser or equal values with gt', () => {
      const item = makeItem({ age: 20 })
      const filter: QueryFilter = { field: 'age', operator: 'gt', value: 25 }
      expect(engine.evaluate(item, filter)).toBe(false)
    })

    it('should match greater values with gte', () => {
      const item = makeItem({ age: 30 })
      const filter: QueryFilter = { field: 'age', operator: 'gte', value: 25 }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should match equal values with gte', () => {
      const item = makeItem({ age: 30 })
      const filter: QueryFilter = { field: 'age', operator: 'gte', value: 30 }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should not match lesser values with gte', () => {
      const item = makeItem({ age: 20 })
      const filter: QueryFilter = { field: 'age', operator: 'gte', value: 25 }
      expect(engine.evaluate(item, filter)).toBe(false)
    })

    it('should match lesser values with lt', () => {
      const item = makeItem({ age: 20 })
      const filter: QueryFilter = { field: 'age', operator: 'lt', value: 25 }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should not match greater or equal values with lt', () => {
      const item = makeItem({ age: 30 })
      const filter: QueryFilter = { field: 'age', operator: 'lt', value: 25 }
      expect(engine.evaluate(item, filter)).toBe(false)
    })

    it('should match lesser values with lte', () => {
      const item = makeItem({ age: 20 })
      const filter: QueryFilter = { field: 'age', operator: 'lte', value: 25 }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should match equal values with lte', () => {
      const item = makeItem({ age: 25 })
      const filter: QueryFilter = { field: 'age', operator: 'lte', value: 25 }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should not match greater values with lte', () => {
      const item = makeItem({ age: 30 })
      const filter: QueryFilter = { field: 'age', operator: 'lte', value: 25 }
      expect(engine.evaluate(item, filter)).toBe(false)
    })

    it('should match containing string with contains', () => {
      const item = makeItem({ name: 'Alice' })
      const filter: QueryFilter = { field: 'name', operator: 'contains', value: 'lic' }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should not match non-containing string with contains', () => {
      const item = makeItem({ name: 'Alice' })
      const filter: QueryFilter = { field: 'name', operator: 'contains', value: 'bob' }
      expect(engine.evaluate(item, filter)).toBe(false)
    })

    it('should match starting string with startsWith', () => {
      const item = makeItem({ name: 'Alice' })
      const filter: QueryFilter = { field: 'name', operator: 'startsWith', value: 'Ali' }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should not match non-starting string with startsWith', () => {
      const item = makeItem({ name: 'Alice' })
      const filter: QueryFilter = { field: 'name', operator: 'startsWith', value: 'lice' }
      expect(engine.evaluate(item, filter)).toBe(false)
    })

    it('should match ending string with endsWith', () => {
      const item = makeItem({ name: 'Alice' })
      const filter: QueryFilter = { field: 'name', operator: 'endsWith', value: 'ice' }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should not match non-ending string with endsWith', () => {
      const item = makeItem({ name: 'Alice' })
      const filter: QueryFilter = { field: 'name', operator: 'endsWith', value: 'Ali' }
      expect(engine.evaluate(item, filter)).toBe(false)
    })

    it('should match value in array with in', () => {
      const item = makeItem({ name: 'Alice' })
      const filter: QueryFilter = { field: 'name', operator: 'in', value: ['Alice', 'Bob'] }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should not match value not in array with in', () => {
      const item = makeItem({ name: 'Alice' })
      const filter: QueryFilter = { field: 'name', operator: 'in', value: ['Bob', 'Charlie'] }
      expect(engine.evaluate(item, filter)).toBe(false)
    })

    it('should match value not in array with notIn', () => {
      const item = makeItem({ name: 'Alice' })
      const filter: QueryFilter = { field: 'name', operator: 'notIn', value: ['Bob', 'Charlie'] }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should not match value in array with notIn', () => {
      const item = makeItem({ name: 'Alice' })
      const filter: QueryFilter = { field: 'name', operator: 'notIn', value: ['Alice', 'Bob'] }
      expect(engine.evaluate(item, filter)).toBe(false)
    })

    it('should match regex pattern with matches', () => {
      const item = makeItem({ name: 'Alice' })
      const filter: QueryFilter = { field: 'name', operator: 'matches', value: '^Al.*e$' }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should not match non-matching regex with matches', () => {
      const item = makeItem({ name: 'Alice' })
      const filter: QueryFilter = { field: 'name', operator: 'matches', value: '^Bob' }
      expect(engine.evaluate(item, filter)).toBe(false)
    })

    it('should return true for existing field with exists', () => {
      const item = makeItem()
      const filter: QueryFilter = { field: 'name', operator: 'exists', value: null }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should return false for missing field with exists', () => {
      const item = makeItem()
      const filter: QueryFilter = { field: 'nonexistent', operator: 'exists', value: null }
      expect(engine.evaluate(item, filter)).toBe(false)
    })

    it('should return true for missing field with notExists', () => {
      const item = makeItem()
      const filter: QueryFilter = { field: 'nonexistent', operator: 'notExists', value: null }
      expect(engine.evaluate(item, filter)).toBe(true)
    })

    it('should return false for existing field with notExists', () => {
      const item = makeItem()
      const filter: QueryFilter = { field: 'name', operator: 'notExists', value: null }
      expect(engine.evaluate(item, filter)).toBe(false)
    })
  })

  describe('evaluateAll', () => {
    it('should filter items with AND logic', () => {
      const items = testData
      const filters: QueryFilter[] = [
        { field: 'active', operator: 'eq', value: true },
        { field: 'score', operator: 'gte', value: 80 },
      ]
      const result = engine.evaluateAll(items, filters)
      expect(result.length).toBe(2)
      expect(result.every(item => item.active && item.score >= 80)).toBe(true)
    })

    it('should return all items when no filters', () => {
      const result = engine.evaluateAll(testData, [])
      expect(result.length).toBe(5)
    })

    it('should return empty when one filter fails all items', () => {
      const filters: QueryFilter[] = [
        { field: 'name', operator: 'eq', value: 'Nobody' },
      ]
      const result = engine.evaluateAll(testData, filters)
      expect(result.length).toBe(0)
    })

    it('should handle empty items array', () => {
      const filters: QueryFilter[] = [
        { field: 'name', operator: 'eq', value: 'Alice' },
      ]
      const result = engine.evaluateAll([], filters)
      expect(result).toEqual([])
    })
  })

  describe('sort', () => {
    it('should sort ascending by field', () => {
      const result = engine.sort(testData, [{ field: 'age', direction: 'asc' }])
      expect(result[0]?.name).toBe('Bob')
      expect(result[4]?.name).toBe('Charlie')
    })

    it('should sort descending by field', () => {
      const result = engine.sort(testData, [{ field: 'score', direction: 'desc' }])
      expect(result[0]?.name).toBe('Diana')
      expect(result[4]?.name).toBe('Charlie')
    })

    it('should sort by multiple fields', () => {
      const data = [
        makeItem({ name: 'A', age: 30, score: 80 }),
        makeItem({ name: 'B', age: 25, score: 90 }),
        makeItem({ name: 'C', age: 30, score: 70 }),
      ]
      const result = engine.sort(data, [
        { field: 'age', direction: 'desc' },
        { field: 'score', direction: 'asc' },
      ])
      expect(result[0]?.name).toBe('C')
      expect(result[1]?.name).toBe('A')
      expect(result[2]?.name).toBe('B')
    })

    it('should return copy when no sorts', () => {
      const result = engine.sort(testData, [])
      expect(result).toEqual(testData)
      expect(result).not.toBe(testData)
    })

    it('should handle empty array', () => {
      const result = engine.sort([], [{ field: 'age', direction: 'asc' }])
      expect(result).toEqual([])
    })
  })

  describe('group', () => {
    it('should group and count items', () => {
      const result = engine.group(testData, { field: 'active', aggregate: 'count' })
      expect(result.get('true')).toBe(3)
      expect(result.get('false')).toBe(2)
    })

    it('should group and sum values', () => {
      const data = [
        makeItem({ name: 'A', age: 10 }),
        makeItem({ name: 'B', age: 10 }),
        makeItem({ name: 'C', age: 20 }),
      ]
      const result = engine.group(data, { field: 'age', aggregate: 'sum' })
      expect(result.get('10')).toBe(20)
      expect(result.get('20')).toBe(20)
    })

    it('should group and calculate average', () => {
      const data = [
        makeItem({ name: 'A', age: 10 }),
        makeItem({ name: 'B', age: 10 }),
        makeItem({ name: 'C', age: 20 }),
      ]
      const result = engine.group(data, { field: 'age', aggregate: 'avg' })
      expect(result.get('10')).toBe(10)
      expect(result.get('20')).toBe(20)
    })

    it('should group and find minimum', () => {
      const data = [
        makeItem({ name: 'A', age: 10 }),
        makeItem({ name: 'B', age: 10 }),
        makeItem({ name: 'C', age: 20 }),
      ]
      const result = engine.group(data, { field: 'age', aggregate: 'min' })
      expect(result.get('10')).toBe(10)
      expect(result.get('20')).toBe(20)
    })

    it('should group and find maximum', () => {
      const data = [
        makeItem({ name: 'A', age: 10 }),
        makeItem({ name: 'B', age: 10 }),
        makeItem({ name: 'C', age: 20 }),
      ]
      const result = engine.group(data, { field: 'age', aggregate: 'max' })
      expect(result.get('10')).toBe(10)
      expect(result.get('20')).toBe(20)
    })

    it('should handle empty items', () => {
      const result = engine.group([], { field: 'age', aggregate: 'count' })
      expect(result.size).toBe(0)
    })

    it('should handle single item', () => {
      const data = [makeItem({ name: 'Solo', age: 42 })]
      const result = engine.group(data, { field: 'name', aggregate: 'count' })
      expect(result.size).toBe(1)
      expect(result.get('Solo')).toBe(1)
    })
  })

  describe('paginate', () => {
    it('should apply limit', () => {
      const result = engine.paginate(testData, { limit: 2 })
      expect(result.length).toBe(2)
    })

    it('should apply offset', () => {
      const result = engine.paginate(testData, { offset: 3 })
      expect(result.length).toBe(2)
      expect(result[0]?.name).toBe('Diana')
    })

    it('should apply both limit and offset', () => {
      const result = engine.paginate(testData, { limit: 2, offset: 1 })
      expect(result.length).toBe(2)
      expect(result[0]?.name).toBe('Bob')
      expect(result[1]?.name).toBe('Charlie')
    })

    it('should return all items with no options', () => {
      const result = engine.paginate(testData, {})
      expect(result.length).toBe(5)
    })
  })
})

describe('QueryBuilder', () => {
  describe('constructor', () => {
    it('should store data', () => {
      const builder = new QueryBuilder(testData)
      const result = builder.execute()
      expect(result.items.length).toBe(5)
    })

    it('should handle empty array', () => {
      const builder = new QueryBuilder([])
      const result = builder.execute()
      expect(result.items).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('where', () => {
    it('should add filter and return this for chaining', () => {
      const builder = new QueryBuilder(testData)
      const returned = builder.where('active', 'eq', true)
      expect(returned).toBe(builder)
    })

    it('should filter data on execute', () => {
      const result = new QueryBuilder(testData)
        .where('active', 'eq', true)
        .execute()
      expect(result.items.length).toBe(3)
      expect(result.items.every(item => item.active)).toBe(true)
    })
  })

  describe('andWhere', () => {
    it('should be alias for where', () => {
      const result = new QueryBuilder(testData)
        .where('active', 'eq', true)
        .andWhere('score', 'gte', 80)
        .execute()
      expect(result.items.length).toBe(2)
      expect(result.items.every(item => item.active && item.score >= 80)).toBe(true)
    })
  })

  describe('orWhere', () => {
    it('should add OR filter', () => {
      const result = new QueryBuilder(testData)
        .where('score', 'gte', 90)
        .orWhere('name', 'eq', 'Eve')
        .execute()
      const names = result.items.map(item => item.name)
      expect(names).toContain('Diana')
      expect(names).toContain('Eve')
      expect(result.items.length).toBe(3)
    })

    it('should combine with AND filters', () => {
      const result = new QueryBuilder(testData)
        .where('active', 'eq', true)
        .orWhere('name', 'eq', 'Eve')
        .execute()
      const names = result.items.map(item => item.name)
      expect(names).toContain('Alice')
      expect(names).toContain('Eve')
    })
  })

  describe('orderBy', () => {
    it('should sort ascending', () => {
      const result = new QueryBuilder(testData)
        .orderBy('age', 'asc')
        .execute()
      expect(result.items[0]?.name).toBe('Bob')
      expect(result.items[4]?.name).toBe('Charlie')
    })

    it('should sort descending', () => {
      const result = new QueryBuilder(testData)
        .orderBy('score', 'desc')
        .execute()
      expect(result.items[0]?.name).toBe('Diana')
      expect(result.items[4]?.name).toBe('Charlie')
    })
  })

  describe('limit', () => {
    it('should limit results', () => {
      const result = new QueryBuilder(testData)
        .orderBy('score', 'desc')
        .limit(2)
        .execute()
      expect(result.items.length).toBe(2)
      expect(result.items[0]?.name).toBe('Diana')
      expect(result.items[1]?.name).toBe('Bob')
    })
  })

  describe('offset', () => {
    it('should skip results', () => {
      const result = new QueryBuilder(testData)
        .orderBy('score', 'desc')
        .offset(1)
        .execute()
      expect(result.items.length).toBe(4)
      expect(result.items[0]?.name).toBe('Bob')
    })
  })

  describe('execute', () => {
    it('should return all items with no clauses', () => {
      const result = new QueryBuilder(testData).execute()
      expect(result.items.length).toBe(5)
    })

    it('should return correct total', () => {
      const result = new QueryBuilder(testData)
        .where('active', 'eq', true)
        .execute()
      expect(result.total).toBe(5)
    })

    it('should return correct filtered count', () => {
      const result = new QueryBuilder(testData)
        .where('active', 'eq', true)
        .execute()
      expect(result.filtered).toBe(3)
      expect(result.items.length).toBe(3)
    })

    it('should apply groupBy', () => {
      const result = new QueryBuilder(testData)
        .groupBy('active', 'count')
        .execute()
      expect(result.groups).toBeDefined()
      expect(result.groups?.get('true')).toBe(3)
      expect(result.groups?.get('false')).toBe(2)
      expect(result.items.length).toBe(5)
    })
  })

  describe('count', () => {
    it('should return filtered count', () => {
      const count = new QueryBuilder(testData)
        .where('active', 'eq', true)
        .count()
      expect(count).toBe(3)
    })

    it('should return total with no filters', () => {
      const count = new QueryBuilder(testData).count()
      expect(count).toBe(5)
    })
  })

  describe('first', () => {
    it('should return first matching item', () => {
      const item = new QueryBuilder(testData)
        .where('name', 'eq', 'Bob')
        .first()
      expect(item).toBeDefined()
      expect(item?.name).toBe('Bob')
    })

    it('should return undefined when no matches', () => {
      const item = new QueryBuilder(testData)
        .where('name', 'eq', 'Nobody')
        .first()
      expect(item).toBeUndefined()
    })
  })

  describe('reset', () => {
    it('should clear all clauses', () => {
      const builder = new QueryBuilder(testData)
        .where('active', 'eq', true)
        .orderBy('age', 'asc')
        .limit(2)
      builder.reset()
      const result = builder.execute()
      expect(result.items.length).toBe(5)
      expect(result.filtered).toBe(5)
    })

    it('should allow re-querying after reset', () => {
      const builder = new QueryBuilder(testData)
      builder.where('name', 'eq', 'Alice')
      const first = builder.execute()
      expect(first.items.length).toBe(1)

      builder.reset()
      builder.where('active', 'eq', true)
      const second = builder.execute()
      expect(second.items.length).toBe(3)
    })
  })

  describe('complex queries', () => {
    it('should handle multiple filters and sort', () => {
      const result = new QueryBuilder(testData)
        .where('active', 'eq', true)
        .where('score', 'gte', 80)
        .orderBy('score', 'desc')
        .limit(2)
        .execute()
      expect(result.items.length).toBe(2)
      expect(result.items[0]?.name).toBe('Diana')
      expect(result.items[1]?.name).toBe('Alice')
      expect(result.total).toBe(5)
      expect(result.filtered).toBe(2)
    })

    it('should handle limit and offset together', () => {
      const result = new QueryBuilder(testData)
        .orderBy('age', 'asc')
        .limit(2)
        .offset(1)
        .execute()
      expect(result.items.length).toBe(2)
      expect(result.items[0]?.name).toBe('Diana')
      expect(result.items[1]?.name).toBe('Alice')
    })

    it('should handle groupBy with execute', () => {
      const result = new QueryBuilder(testData)
        .where('active', 'eq', true)
        .groupBy('name', 'count')
        .execute()
      expect(result.groups).toBeDefined()
      expect(result.groups?.size).toBe(3)
    })

    it('should preserve generic types', () => {
      const builder = new QueryBuilder<TestItem>(testData)
      const result = builder.execute()
      const firstItem = result.items[0]
      if (firstItem) {
        expect(typeof firstItem.name).toBe('string')
        expect(typeof firstItem.age).toBe('number')
        expect(Array.isArray(firstItem.tags)).toBe(true)
      }
    })
  })
})

describe('Edge cases', () => {
  it('should handle empty data', () => {
    const result = new QueryBuilder([])
      .where('name', 'eq', 'Alice')
      .execute()
    expect(result.items).toEqual([])
    expect(result.total).toBe(0)
    expect(result.filtered).toBe(0)
  })

  it('should handle no filters returning all', () => {
    const result = new QueryBuilder(testData).execute()
    expect(result.items.length).toBe(5)
    expect(result.filtered).toBe(5)
    expect(result.total).toBe(5)
  })

  it('should handle multiple sorts', () => {
    const data = [
      makeItem({ name: 'A', age: 30, score: 80 }),
      makeItem({ name: 'B', age: 25, score: 90 }),
      makeItem({ name: 'C', age: 30, score: 70 }),
    ]
    const result = new QueryBuilder(data)
      .orderBy('age', 'desc')
      .orderBy('score', 'asc')
      .execute()
    expect(result.items[0]?.name).toBe('C')
    expect(result.items[1]?.name).toBe('A')
    expect(result.items[2]?.name).toBe('B')
  })

  it('should maintain chaining', () => {
    const builder = new QueryBuilder(testData)
    const ref1 = builder.where('active', 'eq', true)
    const ref2 = ref1.orderBy('age', 'asc')
    const ref3 = ref2.limit(5)
    expect(ref1).toBe(builder)
    expect(ref2).toBe(builder)
    expect(ref3).toBe(builder)
  })

  it('should handle orWhere only without AND filters', () => {
    const result = new QueryBuilder(testData)
      .orWhere('name', 'eq', 'Alice')
      .orWhere('name', 'eq', 'Eve')
      .execute()
    const names = result.items.map(item => item.name)
    expect(names).toContain('Alice')
    expect(names).toContain('Eve')
    expect(result.items.length).toBe(2)
  })

  it('should handle paginate at end of array', () => {
    const result = new QueryBuilder(testData)
      .offset(10)
      .execute()
    expect(result.items).toEqual([])
  })

  it('should handle reset and re-query', () => {
    const builder = new QueryBuilder(testData)
    const result1 = builder.where('active', 'eq', true).execute()
    expect(result1.filtered).toBe(3)

    const returned = builder.reset()
    expect(returned).toBe(builder)

    const result2 = builder.where('score', 'gt', 85).execute()
    expect(result2.filtered).toBe(2)
  })

  it('should handle first with sort applied', () => {
    const item = new QueryBuilder(testData)
      .orderBy('score', 'desc')
      .first()
    expect(item).toBeDefined()
    expect(item?.name).toBe('Diana')
  })

  it('should handle execute with groupBy sum', () => {
    const result = new QueryBuilder(testData)
      .groupBy('age', 'sum')
      .execute()
    expect(result.groups).toBeDefined()
    expect(result.groups?.size).toBe(5)
  })

  it('should handle generic type preservation through full pipeline', () => {
    const builder = new QueryBuilder<TestItem>(testData)
    const item = builder
      .where('active', 'eq', true)
      .orderBy('score', 'desc')
      .first()
    expect(item).toBeDefined()
    if (item) {
      expect(item.name).toBe('Diana')
      expect(item.score).toBe(95)
      expect(item.tags).toEqual(['dev', 'rust'])
    }
  })
})
