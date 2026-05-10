import { describe, it, expect } from "vitest"
import { LindyEffect } from "../../src/core/lindy-effect/lindy-effect.js"

describe("LindyEffect", () => {
  describe("construction", () => {
    it("creates with default options", () => {
      const l = new LindyEffect()
      expect(l.size).toBe(0)
    })

    it("creates with custom halfLife", () => {
      const now = 1000
      const l = new LindyEffect({ halfLife: 5, now: () => now })
      l.add("a")
      expect(l.lindyScore("a")).toBeGreaterThan(0)
    })

    it("creates with custom now function", () => {
      let t = 1000
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 2000
      expect(l.age("a")).toBe(1000)
    })

    it("creates with both options", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 10, now: () => t })
      l.add("a")
      t = 100
      expect(l.age("a")).toBe(100)
    })

    it("creates with no options argument", () => {
      const l = new LindyEffect(undefined)
      expect(l.size).toBe(0)
    })
  })

  describe("add", () => {
    it("adds a single item", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("item1")
      expect(l.size).toBe(1)
      expect(l.has("item1")).toBe(true)
    })

    it("adds multiple items", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.add("b")
      l.add("c")
      expect(l.size).toBe(3)
    })

    it("overwrites existing item on re-add", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      expect(l.getItem("a")!.observations).toBe(1)
      t = 100
      l.add("a")
      expect(l.size).toBe(1)
      expect(l.getItem("a")!.addedAt).toBe(100)
      expect(l.getItem("a")!.observations).toBe(1)
    })

    it("sets observations to 1 on add", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("x")
      expect(l.getItem("x")!.observations).toBe(1)
    })

    it("sets lastSeen equal to addedAt on add", () => {
      const t = 42
      const l = new LindyEffect({ now: () => t })
      l.add("x")
      const item = l.getItem("x")!
      expect(item.lastSeen).toBe(item.addedAt)
    })

    it("adds item with empty string key", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("")
      expect(l.has("")).toBe(true)
    })
  })

  describe("observe", () => {
    it("increments observations", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.observe("a")
      expect(l.getItem("a")!.observations).toBe(2)
    })

    it("updates lastSeen", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 50
      l.observe("a")
      expect(l.getItem("a")!.lastSeen).toBe(50)
    })

    it("handles multiple observations", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.observe("a")
      l.observe("a")
      l.observe("a")
      expect(l.getItem("a")!.observations).toBe(4)
    })

    it("does nothing for non-existent key", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.observe("missing")
      expect(l.size).toBe(0)
    })

    it("observe on existing item changes nothing else", () => {
      let t = 100
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      const originalAddedAt = l.getItem("a")!.addedAt
      t = 200
      l.observe("a")
      expect(l.getItem("a")!.addedAt).toBe(originalAddedAt)
    })
  })

  describe("remove", () => {
    it("removes an existing item", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      const result = l.remove("a")
      expect(result).toBe(true)
      expect(l.has("a")).toBe(false)
    })

    it("returns false for non-existent key", () => {
      const l = new LindyEffect({ now: () => 0 })
      expect(l.remove("missing")).toBe(false)
    })

    it("removes correct item among many", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.add("b")
      l.add("c")
      l.remove("b")
      expect(l.has("a")).toBe(true)
      expect(l.has("b")).toBe(false)
      expect(l.has("c")).toBe(true)
    })

    it("size decreases after remove", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.add("b")
      expect(l.size).toBe(2)
      l.remove("a")
      expect(l.size).toBe(1)
    })
  })

  describe("has", () => {
    it("returns true for existing item", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      expect(l.has("a")).toBe(true)
    })

    it("returns false for non-existent item", () => {
      const l = new LindyEffect({ now: () => 0 })
      expect(l.has("missing")).toBe(false)
    })

    it("returns false after removal", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.remove("a")
      expect(l.has("a")).toBe(false)
    })
  })

  describe("age", () => {
    it("returns 0 for non-existent item", () => {
      const l = new LindyEffect({ now: () => 0 })
      expect(l.age("missing")).toBe(0)
    })

    it("returns 0 immediately after add", () => {
      const t = 100
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      expect(l.age("a")).toBe(0)
    })

    it("returns correct age after time passes", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 500
      expect(l.age("a")).toBe(500)
    })

    it("age increases with time", () => {
      let t = 100
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 200
      expect(l.age("a")).toBe(100)
      t = 300
      expect(l.age("a")).toBe(200)
    })
  })

  describe("lindyScore", () => {
    it("returns 0 for non-existent item", () => {
      const l = new LindyEffect({ now: () => 0 })
      expect(l.lindyScore("missing")).toBe(0)
    })

    it("returns 1 when age is 0 (just added)", () => {
      const t = 100
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      expect(l.lindyScore("a")).toBe(1)
    })

    it("decreases with age when no observations added", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      t = 10
      const score = l.lindyScore("a")
      expect(score).toBeCloseTo(0.1, 5)
    })

    it("increases with observations", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      t = 10
      l.observe("a")
      l.observe("a")
      l.observe("a")
      const score = l.lindyScore("a")
      expect(score).toBeCloseTo(0.4, 5)
    })

    it("is capped at 1", () => {
      const t = 0
      const l = new LindyEffect({ halfLife: 100, now: () => t })
      l.add("a")
      expect(l.lindyScore("a")).toBe(1)
    })

    it("respects halfLife parameter", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 5, now: () => t })
      l.add("a")
      t = 10
      const score = l.lindyScore("a")
      expect(score).toBeCloseTo(0.5, 5)
    })

    it("formula: min(1, observations * halfLife / max(1, age))", () => {
      let t = 100
      const l = new LindyEffect({ halfLife: 2, now: () => t })
      l.add("a")
      t = 110
      l.observe("a")
      const age = 10
      const observations = 2
      const expected = Math.min(1, (observations * 2) / Math.max(1, age))
      expect(l.lindyScore("a")).toBeCloseTo(expected, 5)
    })

    it("returns 1 when halfLife equals age with 1 observation", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 100, now: () => t })
      l.add("a")
      t = 100
      expect(l.lindyScore("a")).toBeCloseTo(1, 5)
    })

    it("handles very small age", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      t = 1
      expect(l.lindyScore("a")).toBeCloseTo(1, 5)
    })
  })

  describe("expectedLifetime", () => {
    it("returns 0 for non-existent item", () => {
      const l = new LindyEffect({ now: () => 0 })
      expect(l.expectedLifetime("missing")).toBe(0)
    })

    it("returns current age as expected lifetime", () => {
      let t = 1000
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 3000
      expect(l.expectedLifetime("a")).toBe(2000)
    })

    it("returns 0 right after add", () => {
      const t = 1000
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      expect(l.expectedLifetime("a")).toBe(0)
    })
  })

  describe("survivalProbability", () => {
    it("returns 0 for non-existent item", () => {
      const l = new LindyEffect({ now: () => 0 })
      expect(l.survivalProbability("missing", 100)).toBe(0)
    })

    it("returns 1 when futureMs is 0", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 100
      expect(l.survivalProbability("a", 0)).toBe(1)
    })

    it("returns 0.5 when futureMs equals current age", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 100
      expect(l.survivalProbability("a", 100)).toBeCloseTo(0.5, 5)
    })

    it("decreases with larger futureMs", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 100
      const p1 = l.survivalProbability("a", 50)
      const p2 = l.survivalProbability("a", 200)
      expect(p1).toBeGreaterThan(p2)
    })

    it("increases with age for same futureMs", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 100
      const p1 = l.survivalProbability("a", 100)
      t = 500
      const p2 = l.survivalProbability("a", 100)
      expect(p2).toBeGreaterThan(p1)
    })

    it("formula: age / (age + futureMs)", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 200
      const age = 200
      const futureMs = 300
      const expected = age / (age + futureMs)
      expect(l.survivalProbability("a", futureMs)).toBeCloseTo(expected, 5)
    })

    it("returns value between 0 and 1", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 100
      const p = l.survivalProbability("a", 50)
      expect(p).toBeGreaterThan(0)
      expect(p).toBeLessThanOrEqual(1)
    })
  })

  describe("rank", () => {
    it("returns empty array when no items", () => {
      const l = new LindyEffect({ now: () => 0 })
      expect(l.rank()).toEqual([])
    })

    it("returns single item", () => {
      const t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      expect(l.rank()).toEqual(["a"])
    })

    it("sorts by lindyScore descending", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("old")
      t = 5
      l.add("new")
      t = 10
      const ranked = l.rank()
      expect(ranked[0]).toBe("new")
      expect(ranked[1]).toBe("old")
    })

    it("items with more observations rank higher", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      l.add("b")
      t = 10
      l.observe("a")
      l.observe("a")
      l.observe("a")
      const ranked = l.rank()
      expect(ranked[0]).toBe("a")
      expect(ranked[1]).toBe("b")
    })

    it("handles three items correctly", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("low")
      t = 2
      l.add("mid")
      l.observe("mid")
      t = 4
      l.add("high")
      l.observe("high")
      l.observe("high")
      t = 10
      const ranked = l.rank()
      expect(ranked.length).toBe(3)
      expect(ranked).toContain("low")
      expect(ranked).toContain("mid")
      expect(ranked).toContain("high")
    })
  })

  describe("topK", () => {
    it("returns empty array for no items", () => {
      const l = new LindyEffect({ now: () => 0 })
      expect(l.topK(3)).toEqual([])
    })

    it("returns top k items with scores", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      l.add("b")
      l.add("c")
      t = 10
      l.observe("c")
      l.observe("c")
      l.observe("c")
      const top = l.topK(2)
      expect(top.length).toBe(2)
      expect(top[0]!.key).toBe("c")
      expect(top[0]!.score).toBeGreaterThan(0)
    })

    it("returns all items when k > size", () => {
      const t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      l.add("b")
      expect(l.topK(10).length).toBe(2)
    })

    it("returns empty array for k=0", () => {
      const t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      expect(l.topK(0)).toEqual([])
    })

    it("includes score for each item", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      t = 5
      const top = l.topK(1)
      expect(top[0]!.score).toBeCloseTo(0.2, 5)
    })

    it("maintains sorted order", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("x")
      t = 5
      l.add("y")
      t = 10
      const top = l.topK(2)
      expect(top[0]!.score).toBeGreaterThanOrEqual(top[1]!.score)
    })
  })

  describe("size", () => {
    it("returns 0 initially", () => {
      const l = new LindyEffect({ now: () => 0 })
      expect(l.size).toBe(0)
    })

    it("increases with adds", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.add("b")
      expect(l.size).toBe(2)
    })

    it("decreases with removes", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.add("b")
      l.remove("a")
      expect(l.size).toBe(1)
    })

    it("resets to 0 after clear", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.add("b")
      l.reset()
      expect(l.size).toBe(0)
    })
  })

  describe("items", () => {
    it("returns empty array when no items", () => {
      const l = new LindyEffect({ now: () => 0 })
      expect(l.items).toEqual([])
    })

    it("returns all keys", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.add("b")
      l.add("c")
      const keys = l.items
      expect(keys).toHaveLength(3)
      expect(keys).toContain("a")
      expect(keys).toContain("b")
      expect(keys).toContain("c")
    })

    it("does not include removed keys", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.add("b")
      l.remove("a")
      expect(l.items).toEqual(["b"])
    })
  })

  describe("getItem", () => {
    it("returns undefined for non-existent key", () => {
      const l = new LindyEffect({ now: () => 0 })
      expect(l.getItem("missing")).toBeUndefined()
    })

    it("returns full item record", () => {
      const t = 42
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      const item = l.getItem("a")!
      expect(item.addedAt).toBe(42)
      expect(item.observations).toBe(1)
      expect(item.lastSeen).toBe(42)
    })

    it("returns updated item after observe", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 100
      l.observe("a")
      const item = l.getItem("a")!
      expect(item.observations).toBe(2)
      expect(item.lastSeen).toBe(100)
    })

    it("returns undefined after remove", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.remove("a")
      expect(l.getItem("a")).toBeUndefined()
    })
  })

  describe("reset", () => {
    it("clears all items", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.add("b")
      l.add("c")
      l.reset()
      expect(l.size).toBe(0)
      expect(l.items).toEqual([])
    })

    it("allows adding after reset", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.reset()
      l.add("b")
      expect(l.size).toBe(1)
      expect(l.has("b")).toBe(true)
    })

    it("makes all previous keys unavailable", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.add("b")
      l.reset()
      expect(l.has("a")).toBe(false)
      expect(l.has("b")).toBe(false)
    })
  })

  describe("bulkObserve", () => {
    it("observes multiple keys at once", () => {
      const t = 50
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      l.add("b")
      l.add("c")
      l.bulkObserve(["a", "b", "c"])
      expect(l.getItem("a")!.observations).toBe(2)
      expect(l.getItem("b")!.observations).toBe(2)
      expect(l.getItem("c")!.observations).toBe(2)
    })

    it("updates lastSeen for all observed items", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      l.add("b")
      t = 100
      l.bulkObserve(["a", "b"])
      expect(l.getItem("a")!.lastSeen).toBe(100)
      expect(l.getItem("b")!.lastSeen).toBe(100)
    })

    it("skips non-existent keys silently", () => {
      const t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      l.bulkObserve(["a", "missing"])
      expect(l.getItem("a")!.observations).toBe(2)
      expect(l.has("missing")).toBe(false)
    })

    it("handles empty array", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.bulkObserve([])
      expect(l.getItem("a")!.observations).toBe(1)
    })

    it("handles duplicate keys in input", () => {
      const t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      l.bulkObserve(["a", "a", "a"])
      expect(l.getItem("a")!.observations).toBe(4)
    })

    it("does not observe partial keys", () => {
      const t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      l.add("b")
      l.bulkObserve(["a"])
      expect(l.getItem("b")!.observations).toBe(1)
    })
  })

  describe("decay", () => {
    it("reduces observations by factor", () => {
      const t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      l.observe("a")
      l.observe("a")
      l.observe("a")
      l.decay("a", 0.5)
      expect(l.getItem("a")!.observations).toBe(2)
    })

    it("floors the result", () => {
      const t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      l.observe("a")
      l.decay("a", 0.9)
      expect(l.getItem("a")!.observations).toBe(1)
    })

    it("ensures minimum of 1 observation", () => {
      const t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      l.decay("a", 0.01)
      expect(l.getItem("a")!.observations).toBe(1)
    })

    it("does nothing for non-existent key", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.decay("missing", 0.5)
      expect(l.size).toBe(0)
    })

    it("decaying with factor 1 keeps observations", () => {
      const t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      l.observe("a")
      l.observe("a")
      l.decay("a", 1)
      expect(l.getItem("a")!.observations).toBe(3)
    })

    it("decay affects lindyScore", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      l.observe("a")
      l.observe("a")
      l.observe("a")
      t = 10
      const before = l.lindyScore("a")
      l.decay("a", 0.5)
      const after = l.lindyScore("a")
      expect(after).toBeLessThan(before)
    })

    it("decay with factor 0 floors to 1", () => {
      const t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      l.observe("a")
      l.observe("a")
      l.decay("a", 0)
      expect(l.getItem("a")!.observations).toBe(1)
    })
  })

  describe("edge cases", () => {
    it("handles re-adding after removal", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      l.observe("a")
      l.remove("a")
      t = 100
      l.add("a")
      expect(l.getItem("a")!.observations).toBe(1)
      expect(l.getItem("a")!.addedAt).toBe(100)
    })

    it("handles very large ages", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      t = Number.MAX_SAFE_INTEGER
      const score = l.lindyScore("a")
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    })

    it("handles many items", () => {
      const t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      for (let i = 0; i < 1000; i++) {
        l.add(`item-${i}`)
      }
      expect(l.size).toBe(1000)
    })

    it("handles very small halfLife", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 0.001, now: () => t })
      l.add("a")
      t = 1
      const score = l.lindyScore("a")
      expect(score).toBeCloseTo(0.001, 5)
    })

    it("handles very large halfLife", () => {
      const t = 0
      const l = new LindyEffect({ halfLife: 1000000, now: () => t })
      l.add("a")
      expect(l.lindyScore("a")).toBe(1)
    })

    it("observe then remove then has returns false", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.observe("a")
      l.remove("a")
      expect(l.has("a")).toBe(false)
    })

    it("age after re-add reflects new add time", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 100
      l.remove("a")
      l.add("a")
      t = 150
      expect(l.age("a")).toBe(50)
    })

    it("lindyScore is 0 after remove", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.observe("a")
      l.remove("a")
      expect(l.lindyScore("a")).toBe(0)
    })

    it("expectedLifetime is 0 after remove", () => {
      let t = 0
      const l = new LindyEffect({ now: () => t })
      l.add("a")
      t = 100
      l.remove("a")
      expect(l.expectedLifetime("a")).toBe(0)
    })

    it("survivalProbability is 0 after remove", () => {
      const l = new LindyEffect({ now: () => 0 })
      l.add("a")
      l.remove("a")
      expect(l.survivalProbability("a", 100)).toBe(0)
    })

    it("topK after removals works correctly", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      l.add("b")
      l.add("c")
      l.remove("b")
      const top = l.topK(3)
      expect(top.length).toBe(2)
    })
  })

  describe("stress", () => {
    it("handles rapid add/observe cycles", () => {
      const t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      for (let i = 0; i < 500; i++) {
        l.add(`item-${i}`)
        l.observe(`item-${i}`)
      }
      expect(l.size).toBe(500)
    })

    it("handles bulk operations", () => {
      const t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      const keys: string[] = []
      for (let i = 0; i < 200; i++) {
        l.add(`k-${i}`)
        keys.push(`k-${i}`)
      }
      for (let round = 0; round < 10; round++) {
        l.bulkObserve(keys)
      }
      expect(l.getItem("k-0")!.observations).toBe(11)
    })

    it("handles mixed operations", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      for (let i = 0; i < 100; i++) {
        l.add(`item-${i}`)
      }
      t = 10
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          l.observe(`item-${i}`)
        } else {
          l.remove(`item-${i}`)
        }
      }
      expect(l.size).toBe(50)
      const ranked = l.rank()
      expect(ranked.length).toBe(50)
    })

    it("rank consistency under many operations", () => {
      let t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      l.add("b")
      l.add("c")
      t = 10
      for (let i = 0; i < 20; i++) {
        l.observe("a")
      }
      for (let i = 0; i < 5; i++) {
        l.observe("b")
      }
      const ranked = l.rank()
      expect(ranked[0]).toBe("a")
      expect(ranked[1]).toBe("b")
      expect(ranked[2]).toBe("c")
    })

    it("decay does not break invariants", () => {
      const t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      l.add("a")
      for (let i = 0; i < 100; i++) {
        l.observe("a")
      }
      for (let i = 0; i < 50; i++) {
        l.decay("a", 0.99)
      }
      expect(l.getItem("a")!.observations).toBeGreaterThanOrEqual(1)
      const score = l.lindyScore("a")
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    })

    it("topK with many items returns correct count", () => {
      const t = 0
      const l = new LindyEffect({ halfLife: 1, now: () => t })
      for (let i = 0; i < 200; i++) {
        l.add(`item-${i}`)
      }
      const top = l.topK(10)
      expect(top.length).toBe(10)
      for (const entry of top) {
        expect(entry.score).toBe(1)
      }
    })
  })
})
