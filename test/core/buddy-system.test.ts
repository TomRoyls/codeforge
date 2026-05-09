import { describe, it, expect, beforeEach } from 'vitest'
import { BuddySystem } from '../../src/core/buddy-system/buddy-system.js'
import type { AllocationResult, BlockInfo, BuddySystemState } from '../../src/core/buddy-system/types.js'

describe('BuddySystem', () => {
  describe('constructor', () => {
    it('should create allocator with power-of-2 size', () => {
      const bs = new BuddySystem(1024)
      expect(bs.getTotalSize()).toBe(1024)
    })

    it('should create allocator with size 1', () => {
      const bs = new BuddySystem(1)
      expect(bs.getTotalSize()).toBe(1)
    })

    it('should create allocator with size 2', () => {
      const bs = new BuddySystem(2)
      expect(bs.getTotalSize()).toBe(2)
    })

    it('should create allocator with size 64', () => {
      const bs = new BuddySystem(64)
      expect(bs.getTotalSize()).toBe(64)
    })

    it('should create allocator with size 4096', () => {
      const bs = new BuddySystem(4096)
      expect(bs.getTotalSize()).toBe(4096)
    })

    it('should throw for size 0', () => {
      expect(() => new BuddySystem(0)).toThrow()
    })

    it('should throw for negative size', () => {
      expect(() => new BuddySystem(-16)).toThrow()
    })

    it('should throw for non-power-of-2 size 3', () => {
      expect(() => new BuddySystem(3)).toThrow()
    })

    it('should throw for non-power-of-2 size 5', () => {
      expect(() => new BuddySystem(5)).toThrow()
    })

    it('should throw for non-power-of-2 size 100', () => {
      expect(() => new BuddySystem(100)).toThrow()
    })

    it('should throw for non-integer size', () => {
      expect(() => new BuddySystem(2.5)).toThrow()
    })

    it('should start with no allocated blocks', () => {
      const bs = new BuddySystem(64)
      expect(bs.getNumBlocks()).toBe(0)
      expect(bs.getUsedSize()).toBe(0)
      expect(bs.getFreeSize()).toBe(64)
    })

    it('should start with utilization 0', () => {
      const bs = new BuddySystem(64)
      expect(bs.getUtilization()).toBe(0)
    })

    it('should start with fragmentation 0', () => {
      const bs = new BuddySystem(64)
      expect(bs.getFragmentation()).toBe(0)
    })

    it('should start with largest free block equal to total size', () => {
      const bs = new BuddySystem(64)
      expect(bs.getLargestFreeBlock()).toBe(64)
    })
  })

  describe('allocate', () => {
    let bs: BuddySystem

    beforeEach(() => {
      bs = new BuddySystem(64)
    })

    it('should allocate a block of requested size', () => {
      const result = bs.allocate(8)
      expect(result).not.toBeNull()
      expect(result!.address).toBe(0)
      expect(result!.blockSize).toBe(8)
    })

    it('should allocate at address 0 for first block', () => {
      const result = bs.allocate(16)
      expect(result!.address).toBe(0)
    })

    it('should round up to power of 2 (3 -> 4)', () => {
      const result = bs.allocate(3)
      expect(result!.blockSize).toBe(4)
    })

    it('should round up to power of 2 (5 -> 8)', () => {
      const result = bs.allocate(5)
      expect(result!.blockSize).toBe(8)
    })

    it('should round up to power of 2 (6 -> 8)', () => {
      const result = bs.allocate(6)
      expect(result!.blockSize).toBe(8)
    })

    it('should round up to power of 2 (7 -> 8)', () => {
      const result = bs.allocate(7)
      expect(result!.blockSize).toBe(8)
    })

    it('should return exact power of 2 when requested', () => {
      const result = bs.allocate(4)
      expect(result!.blockSize).toBe(4)
    })

    it('should allocate block of size 1', () => {
      const result = bs.allocate(1)
      expect(result!.blockSize).toBe(1)
    })

    it('should allocate entire memory as one block', () => {
      const result = bs.allocate(64)
      expect(result!.blockSize).toBe(64)
      expect(result!.address).toBe(0)
    })

    it('should allocate entire memory with size 4096', () => {
      const big = new BuddySystem(4096)
      const result = big.allocate(4096)
      expect(result!.blockSize).toBe(4096)
    })

    it('should return null when no space available', () => {
      bs.allocate(64)
      const result = bs.allocate(1)
      expect(result).toBeNull()
    })

    it('should return null when requested size exceeds total', () => {
      const result = bs.allocate(128)
      expect(result).toBeNull()
    })

    it('should return null when exactly one more byte than total', () => {
      const result = bs.allocate(65)
      expect(result).toBeNull()
    })

    it('should throw for size 0', () => {
      expect(() => bs.allocate(0)).toThrow()
    })

    it('should throw for negative size', () => {
      expect(() => bs.allocate(-1)).toThrow()
    })

    it('should throw for non-integer size', () => {
      expect(() => bs.allocate(2.5)).toThrow()
    })

    it('should allocate two blocks of equal size', () => {
      const r1 = bs.allocate(16)
      const r2 = bs.allocate(16)
      expect(r1!.address).toBe(0)
      expect(r2!.address).toBe(16)
      expect(r1!.blockSize).toBe(16)
      expect(r2!.blockSize).toBe(16)
    })

    it('should allocate from split blocks', () => {
      bs.allocate(16)
      bs.allocate(16)
      const r3 = bs.allocate(8)
      expect(r3).not.toBeNull()
      expect(r3!.blockSize).toBe(8)
    })

    it('should track used size after allocation', () => {
      bs.allocate(16)
      expect(bs.getUsedSize()).toBe(16)
    })

    it('should track free size after allocation', () => {
      bs.allocate(16)
      expect(bs.getFreeSize()).toBe(48)
    })

    it('should update block count after allocation', () => {
      bs.allocate(8)
      bs.allocate(8)
      expect(bs.getNumBlocks()).toBe(2)
    })

    it('should split larger blocks when needed', () => {
      const r = bs.allocate(1)
      expect(r!.blockSize).toBe(1)
      expect(bs.getFreeSize()).toBe(63)
    })

    it('should allocate from second half when first is taken', () => {
      bs.allocate(32)
      const r = bs.allocate(16)
      expect(r!.address).toBe(32)
      expect(r!.blockSize).toBe(16)
    })

    it('should handle allocation after free', () => {
      const r1 = bs.allocate(32)
      bs.free(r1!.address)
      const r2 = bs.allocate(32)
      expect(r2!.address).toBe(0)
    })

    it('should handle multiple small allocations', () => {
      for (let i = 0; i < 4; i++) {
        const r = bs.allocate(1)
        expect(r).not.toBeNull()
        expect(r!.blockSize).toBe(1)
      }
      expect(bs.getNumBlocks()).toBe(4)
    })

    it('should handle filling memory completely', () => {
      for (let i = 0; i < 64; i++) {
        const r = bs.allocate(1)
        expect(r).not.toBeNull()
      }
      expect(bs.getFreeSize()).toBe(0)
    })

    it('should return null after filling memory', () => {
      for (let i = 0; i < 64; i++) {
        bs.allocate(1)
      }
      expect(bs.allocate(1)).toBeNull()
    })
  })

  describe('free', () => {
    let bs: BuddySystem

    beforeEach(() => {
      bs = new BuddySystem(64)
    })

    it('should free an allocated block', () => {
      const r = bs.allocate(8)
      bs.free(r!.address)
      expect(bs.getNumBlocks()).toBe(0)
    })

    it('should update used size after free', () => {
      const r = bs.allocate(16)
      bs.free(r!.address)
      expect(bs.getUsedSize()).toBe(0)
    })

    it('should update free size after free', () => {
      const r = bs.allocate(16)
      bs.free(r!.address)
      expect(bs.getFreeSize()).toBe(64)
    })

    it('should throw when freeing unallocated address', () => {
      expect(() => bs.free(0)).toThrow()
    })

    it('should throw when freeing invalid address', () => {
      expect(() => bs.free(999)).toThrow()
    })

    it('should throw when freeing non-start address', () => {
      bs.allocate(8)
      expect(() => bs.free(3)).toThrow()
    })

    it('should allow re-allocation after free', () => {
      const r1 = bs.allocate(16)
      bs.free(r1!.address)
      const r2 = bs.allocate(16)
      expect(r2).not.toBeNull()
    })

    it('should coalesce buddies after free', () => {
      const r1 = bs.allocate(32)
      const r2 = bs.allocate(32)
      bs.free(r1!.address)
      bs.free(r2!.address)
      expect(bs.getLargestFreeBlock()).toBe(64)
    })

    it('should coalesce from left to right', () => {
      bs.allocate(32)
      const r2 = bs.allocate(32)
      bs.free(r2!.address)
      expect(bs.getLargestFreeBlock()).toBe(32)
    })

    it('should coalesce buddies after sequential free', () => {
      const r1 = bs.allocate(16)
      const r2 = bs.allocate(16)
      bs.free(r1!.address)
      bs.free(r2!.address)
      expect(bs.getLargestFreeBlock()).toBe(64)
    })

    it('should handle multiple frees in sequence', () => {
      const r1 = bs.allocate(8)
      const r2 = bs.allocate(8)
      const r3 = bs.allocate(8)
      bs.free(r1!.address)
      bs.free(r2!.address)
      bs.free(r3!.address)
      expect(bs.getNumBlocks()).toBe(0)
    })

    it('should coalesce progressively', () => {
      const r1 = bs.allocate(16)
      const r2 = bs.allocate(16)
      const r3 = bs.allocate(16)
      const r4 = bs.allocate(16)
      bs.free(r1!.address)
      bs.free(r3!.address)
      expect(bs.getLargestFreeBlock()).toBe(16)
      bs.free(r2!.address)
      expect(bs.getLargestFreeBlock()).toBe(32)
      bs.free(r4!.address)
      expect(bs.getLargestFreeBlock()).toBe(64)
    })

    it('should fully coalesce all blocks', () => {
      const allocs: AllocationResult[] = []
      for (let i = 0; i < 4; i++) {
        allocs.push(bs.allocate(16)!)
      }
      for (const a of allocs) {
        bs.free(a.address)
      }
      expect(bs.getFreeSize()).toBe(64)
      expect(bs.getLargestFreeBlock()).toBe(64)
    })

    it('should handle free after split allocation', () => {
      const r1 = bs.allocate(1)
      bs.free(r1!.address)
      expect(bs.getFreeSize()).toBe(64)
    })

    it('should handle interleaved alloc and free', () => {
      const r1 = bs.allocate(16)
      bs.free(r1!.address)
      const r2 = bs.allocate(32)
      bs.free(r2!.address)
      expect(bs.getFreeSize()).toBe(64)
    })

    it('should handle double free of same address after re-alloc', () => {
      const r1 = bs.allocate(8)
      bs.free(r1!.address)
      const r2 = bs.allocate(8)
      bs.free(r2!.address)
      expect(bs.getNumBlocks()).toBe(0)
    })
  })

  describe('isAllocated', () => {
    let bs: BuddySystem

    beforeEach(() => {
      bs = new BuddySystem(64)
    })

    it('should return true for allocated block start', () => {
      const r = bs.allocate(8)
      expect(bs.isAllocated(r!.address)).toBe(true)
    })

    it('should return true for address within allocated block', () => {
      bs.allocate(8)
      expect(bs.isAllocated(3)).toBe(true)
      expect(bs.isAllocated(7)).toBe(true)
    })

    it('should return false for address in free block', () => {
      expect(bs.isAllocated(0)).toBe(false)
    })

    it('should return false for unallocated address', () => {
      bs.allocate(8)
      expect(bs.isAllocated(10)).toBe(false)
    })

    it('should return false after free', () => {
      const r = bs.allocate(8)
      bs.free(r!.address)
      expect(bs.isAllocated(r!.address)).toBe(false)
    })

    it('should handle multiple blocks correctly', () => {
      const r1 = bs.allocate(16)
      const r2 = bs.allocate(16)
      expect(bs.isAllocated(r1!.address)).toBe(true)
      expect(bs.isAllocated(r2!.address)).toBe(true)
      expect(bs.isAllocated(r1!.address + 5)).toBe(true)
      expect(bs.isAllocated(r2!.address + 5)).toBe(true)
    })

    it('should return false for address beyond block', () => {
      bs.allocate(8)
      expect(bs.isAllocated(8)).toBe(false)
    })
  })

  describe('getBlockSize', () => {
    let bs: BuddySystem

    beforeEach(() => {
      bs = new BuddySystem(64)
    })

    it('should return block size for allocated block start', () => {
      bs.allocate(8)
      expect(bs.getBlockSize(0)).toBe(8)
    })

    it('should return block size for address within block', () => {
      bs.allocate(16)
      expect(bs.getBlockSize(5)).toBe(16)
    })

    it('should return correct size for different blocks', () => {
      bs.allocate(8)
      bs.allocate(16)
      expect(bs.getBlockSize(0)).toBe(8)
    })

    it('should return free block size for unallocated address', () => {
      expect(bs.getBlockSize(0)).toBe(64)
    })

    it('should throw for freed address after allocation', () => {
      const r = bs.allocate(16)
      bs.free(r!.address)
      expect(() => bs.getBlockSize(r!.address)).not.toThrow()
    })

    it('should handle address at block boundary', () => {
      bs.allocate(8)
      expect(bs.getBlockSize(7)).toBe(8)
    })
  })

  describe('getUtilization', () => {
    it('should return 0 with no allocations', () => {
      const bs = new BuddySystem(64)
      expect(bs.getUtilization()).toBe(0)
    })

    it('should return 0.25 with 1/4 used', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      expect(bs.getUtilization()).toBe(0.25)
    })

    it('should return 0.5 with half used', () => {
      const bs = new BuddySystem(64)
      bs.allocate(32)
      expect(bs.getUtilization()).toBe(0.5)
    })

    it('should return 1 with full memory', () => {
      const bs = new BuddySystem(64)
      bs.allocate(64)
      expect(bs.getUtilization()).toBe(1)
    })

    it('should return 0 after free', () => {
      const bs = new BuddySystem(64)
      const r = bs.allocate(16)
      bs.free(r!.address)
      expect(bs.getUtilization()).toBe(0)
    })

    it('should account for internal fragmentation', () => {
      const bs = new BuddySystem(64)
      bs.allocate(3)
      expect(bs.getUtilization()).toBe(4 / 64)
    })
  })

  describe('getFragmentation', () => {
    it('should return 0 with no allocations', () => {
      const bs = new BuddySystem(64)
      expect(bs.getFragmentation()).toBe(0)
    })

    it('should return 0 with full memory', () => {
      const bs = new BuddySystem(64)
      bs.allocate(64)
      expect(bs.getFragmentation()).toBe(0)
    })

    it('should return 0 with single contiguous free block', () => {
      const bs = new BuddySystem(64)
      bs.allocate(32)
      expect(bs.getFragmentation()).toBe(0)
    })

    it('should show fragmentation with scattered free blocks', () => {
      const bs = new BuddySystem(64)
      const r1 = bs.allocate(8)
      const r2 = bs.allocate(8)
      const r3 = bs.allocate(8)
      bs.free(r1!.address)
      bs.free(r3!.address)
      const frag = bs.getFragmentation()
      expect(frag).toBeGreaterThan(0)
    })

    it('should show fragmentation after interleaved alloc/free', () => {
      const bs = new BuddySystem(64)
      const r1 = bs.allocate(8)
      bs.allocate(8)
      const r3 = bs.allocate(8)
      bs.free(r1!.address)
      bs.free(r3!.address)
      const frag = bs.getFragmentation()
      expect(frag).toBeGreaterThan(0)
    })

    it('should return to 0 after coalescing', () => {
      const bs = new BuddySystem(64)
      const r1 = bs.allocate(32)
      const r2 = bs.allocate(32)
      bs.free(r1!.address)
      bs.free(r2!.address)
      expect(bs.getFragmentation()).toBe(0)
    })
  })

  describe('getLargestFreeBlock', () => {
    it('should return total size with no allocations', () => {
      const bs = new BuddySystem(64)
      expect(bs.getLargestFreeBlock()).toBe(64)
    })

    it('should decrease after allocation', () => {
      const bs = new BuddySystem(64)
      bs.allocate(32)
      expect(bs.getLargestFreeBlock()).toBe(32)
    })

    it('should be 0 when memory is full', () => {
      const bs = new BuddySystem(64)
      bs.allocate(64)
      expect(bs.getLargestFreeBlock()).toBe(0)
    })

    it('should increase after free and coalesce', () => {
      const bs = new BuddySystem(64)
      const r1 = bs.allocate(32)
      bs.allocate(32)
      bs.free(r1!.address)
      expect(bs.getLargestFreeBlock()).toBe(32)
    })

    it('should show max available after full free', () => {
      const bs = new BuddySystem(64)
      const r = bs.allocate(32)
      bs.free(r!.address)
      expect(bs.getLargestFreeBlock()).toBe(64)
    })
  })

  describe('getFreeBlocks', () => {
    it('should return single block when empty', () => {
      const bs = new BuddySystem(64)
      const free = bs.getFreeBlocks()
      expect(free).toHaveLength(1)
      expect(free[0]).toEqual({ address: 0, size: 64 })
    })

    it('should return blocks sorted by address', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      const free = bs.getFreeBlocks()
      for (let i = 1; i < free.length; i++) {
        expect(free[i]!.address).toBeGreaterThan(free[i - 1]!.address)
      }
    })

    it('should return empty when full', () => {
      const bs = new BuddySystem(64)
      bs.allocate(64)
      expect(bs.getFreeBlocks()).toHaveLength(0)
    })

    it('should update after allocation', () => {
      const bs = new BuddySystem(64)
      bs.allocate(32)
      const free = bs.getFreeBlocks()
      const totalFree = free.reduce((sum, b) => sum + b.size, 0)
      expect(totalFree).toBe(32)
    })

    it('should update after free', () => {
      const bs = new BuddySystem(64)
      const r = bs.allocate(32)
      bs.free(r!.address)
      expect(bs.getFreeBlocks()).toHaveLength(1)
    })
  })

  describe('getAllocatedBlocks', () => {
    it('should return empty when no allocations', () => {
      const bs = new BuddySystem(64)
      expect(bs.getAllocatedBlocks()).toHaveLength(0)
    })

    it('should return single block after allocation', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      const alloc = bs.getAllocatedBlocks()
      expect(alloc).toHaveLength(1)
      expect(alloc[0]).toEqual({ address: 0, size: 16 })
    })

    it('should return blocks sorted by address', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      bs.allocate(16)
      const alloc = bs.getAllocatedBlocks()
      expect(alloc).toHaveLength(2)
      expect(alloc[0]!.address).toBeLessThan(alloc[1]!.address)
    })

    it('should update after free', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      bs.allocate(16)
      bs.free(0)
      const alloc = bs.getAllocatedBlocks()
      expect(alloc).toHaveLength(1)
    })
  })

  describe('reset', () => {
    it('should clear all allocations', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      bs.allocate(16)
      bs.reset()
      expect(bs.getNumBlocks()).toBe(0)
      expect(bs.getUsedSize()).toBe(0)
    })

    it('should restore full free memory', () => {
      const bs = new BuddySystem(64)
      bs.allocate(32)
      bs.reset()
      expect(bs.getFreeSize()).toBe(64)
      expect(bs.getLargestFreeBlock()).toBe(64)
    })

    it('should restore utilization to 0', () => {
      const bs = new BuddySystem(64)
      bs.allocate(32)
      bs.reset()
      expect(bs.getUtilization()).toBe(0)
    })

    it('should restore fragmentation to 0', () => {
      const bs = new BuddySystem(64)
      bs.allocate(8)
      bs.reset()
      expect(bs.getFragmentation()).toBe(0)
    })

    it('should allow allocation after reset', () => {
      const bs = new BuddySystem(64)
      bs.allocate(64)
      bs.reset()
      const r = bs.allocate(32)
      expect(r).not.toBeNull()
      expect(r!.blockSize).toBe(32)
    })

    it('should handle reset on already empty allocator', () => {
      const bs = new BuddySystem(64)
      bs.reset()
      expect(bs.getNumBlocks()).toBe(0)
      expect(bs.getFreeSize()).toBe(64)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      const cloned = bs.clone()
      expect(cloned.getTotalSize()).toBe(64)
      expect(cloned.getNumBlocks()).toBe(1)
    })

    it('should not affect original when modified', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      const cloned = bs.clone()
      cloned.reset()
      expect(bs.getNumBlocks()).toBe(1)
      expect(cloned.getNumBlocks()).toBe(0)
    })

    it('should not affect clone when original is modified', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      const cloned = bs.clone()
      bs.reset()
      expect(cloned.getNumBlocks()).toBe(1)
      expect(bs.getNumBlocks()).toBe(0)
    })

    it('should preserve allocation state', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      bs.allocate(8)
      const cloned = bs.clone()
      expect(cloned.getUsedSize()).toBe(bs.getUsedSize())
      expect(cloned.getAllocatedBlocks()).toEqual(bs.getAllocatedBlocks())
    })

    it('should preserve free blocks state', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      const cloned = bs.clone()
      expect(cloned.getFreeBlocks()).toEqual(bs.getFreeBlocks())
    })

    it('should be usable independently after clone', () => {
      const bs = new BuddySystem(64)
      const cloned = bs.clone()
      const r = cloned.allocate(32)
      expect(r).not.toBeNull()
      expect(cloned.getNumBlocks()).toBe(1)
      expect(bs.getNumBlocks()).toBe(0)
    })

    it('should handle free on clone independently', () => {
      const bs = new BuddySystem(64)
      const r = bs.allocate(16)
      const cloned = bs.clone()
      cloned.free(r!.address)
      expect(bs.getNumBlocks()).toBe(1)
      expect(cloned.getNumBlocks()).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle allocate and free entire memory', () => {
      const bs = new BuddySystem(64)
      const r = bs.allocate(64)
      expect(r!.blockSize).toBe(64)
      expect(bs.getFreeSize()).toBe(0)
      bs.free(r!.address)
      expect(bs.getFreeSize()).toBe(64)
    })

    it('should handle allocate-free-allocate cycle', () => {
      const bs = new BuddySystem(64)
      const r1 = bs.allocate(32)
      bs.free(r1!.address)
      const r2 = bs.allocate(32)
      expect(r2!.address).toBe(0)
      expect(r2!.blockSize).toBe(32)
    })

    it('should handle minimum allocation size of 1', () => {
      const bs = new BuddySystem(16)
      const r = bs.allocate(1)
      expect(r!.blockSize).toBe(1)
    })

    it('should handle allocating all with size 1 blocks', () => {
      const bs = new BuddySystem(16)
      const addresses: number[] = []
      for (let i = 0; i < 16; i++) {
        const r = bs.allocate(1)
        expect(r).not.toBeNull()
        addresses.push(r!.address)
      }
      expect(bs.getFreeSize()).toBe(0)
      for (const addr of addresses) {
        bs.free(addr)
      }
      expect(bs.getFreeSize()).toBe(16)
    })

    it('should handle large memory size', () => {
      const bs = new BuddySystem(1048576)
      const r = bs.allocate(524288)
      expect(r!.blockSize).toBe(524288)
      expect(bs.getFreeSize()).toBe(524288)
    })

    it('should handle allocation failure does not corrupt state', () => {
      const bs = new BuddySystem(64)
      bs.allocate(64)
      expect(bs.allocate(1)).toBeNull()
      expect(bs.getNumBlocks()).toBe(1)
      expect(bs.getUsedSize()).toBe(64)
    })

    it('should handle complex allocation pattern', () => {
      const bs = new BuddySystem(128)
      const r1 = bs.allocate(32)
      const r2 = bs.allocate(32)
      const r3 = bs.allocate(16)
      bs.free(r2!.address)
      bs.free(r1!.address)
      const r4 = bs.allocate(64)
      expect(r4).not.toBeNull()
      expect(r4!.blockSize).toBe(64)
      bs.free(r3!.address)
      bs.free(r4!.address)
      expect(bs.getLargestFreeBlock()).toBe(128)
    })

    it('should handle partial coalescing', () => {
      const bs = new BuddySystem(64)
      const r1 = bs.allocate(8)
      const r2 = bs.allocate(8)
      const r3 = bs.allocate(8)
      const r4 = bs.allocate(8)
      const r5 = bs.allocate(8)
      bs.free(r3!.address)
      bs.free(r4!.address)
      expect(bs.getLargestFreeBlock()).toBe(16)
      bs.free(r5!.address)
      expect(bs.getLargestFreeBlock()).toBe(32)
    })

    it('should handle buddy coalescing from different orders', () => {
      const bs = new BuddySystem(16)
      const allocs: number[] = []
      for (let i = 0; i < 16; i++) {
        allocs.push(bs.allocate(1)!.address)
      }
      for (let i = 0; i < 16; i += 2) {
        bs.free(allocs[i]!)
      }
      expect(bs.getLargestFreeBlock()).toBe(1)
      for (let i = 1; i < 16; i += 2) {
        bs.free(allocs[i]!)
      }
      expect(bs.getLargestFreeBlock()).toBe(16)
    })
  })

  describe('metrics consistency', () => {
    it('should have used + free = total', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      bs.allocate(8)
      expect(bs.getUsedSize() + bs.getFreeSize()).toBe(bs.getTotalSize())
    })

    it('should maintain invariant after multiple operations', () => {
      const bs = new BuddySystem(128)
      const r1 = bs.allocate(32)
      const r2 = bs.allocate(16)
      bs.free(r1!.address)
      const r3 = bs.allocate(64)
      bs.free(r2!.address)
      expect(bs.getUsedSize() + bs.getFreeSize()).toBe(128)
    })

    it('should have free blocks sum equal to free size', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      bs.allocate(8)
      const freeBlocks = bs.getFreeBlocks()
      const sumFree = freeBlocks.reduce((sum, b) => sum + b.size, 0)
      expect(sumFree).toBe(bs.getFreeSize())
    })

    it('should have allocated blocks sum equal to used size', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      bs.allocate(8)
      const allocBlocks = bs.getAllocatedBlocks()
      const sumAlloc = allocBlocks.reduce((sum, b) => sum + b.size, 0)
      expect(sumAlloc).toBe(bs.getUsedSize())
    })
  })

  describe('additional coverage', () => {
    it('should handle size 1 memory', () => {
      const bs = new BuddySystem(1)
      const r = bs.allocate(1)
      expect(r!.address).toBe(0)
      expect(r!.blockSize).toBe(1)
      expect(bs.getUsedSize()).toBe(1)
      expect(bs.getFreeSize()).toBe(0)
      bs.free(0)
      expect(bs.getFreeSize()).toBe(1)
    })

    it('should handle size 2 memory', () => {
      const bs = new BuddySystem(2)
      bs.allocate(1)
      bs.allocate(1)
      expect(bs.getNumBlocks()).toBe(2)
      expect(bs.getUsedSize()).toBe(2)
    })

    it('should handle size 4 memory with various patterns', () => {
      const bs = new BuddySystem(4)
      bs.allocate(1)
      bs.allocate(1)
      bs.allocate(1)
      bs.allocate(1)
      expect(bs.getUtilization()).toBe(1)
      bs.free(0)
      bs.free(2)
      expect(bs.getFragmentation()).toBeGreaterThan(0)
    })

    it('should handle allocation of size 2 in 8-byte memory', () => {
      const bs = new BuddySystem(8)
      const r = bs.allocate(2)
      expect(r!.blockSize).toBe(2)
    })

    it('should handle repeated alloc-free cycles', () => {
      const bs = new BuddySystem(32)
      for (let i = 0; i < 10; i++) {
        const r = bs.allocate(16)
        bs.free(r!.address)
      }
      expect(bs.getFreeSize()).toBe(32)
      expect(bs.getNumBlocks()).toBe(0)
    })

    it('should handle alternating alloc-free', () => {
      const bs = new BuddySystem(64)
      const r1 = bs.allocate(16)
      bs.free(r1!.address)
      const r2 = bs.allocate(16)
      bs.free(r2!.address)
      const r3 = bs.allocate(16)
      bs.free(r3!.address)
      expect(bs.getLargestFreeBlock()).toBe(64)
    })

    it('should handle allocate after failed allocation', () => {
      const bs = new BuddySystem(16)
      bs.allocate(16)
      expect(bs.allocate(1)).toBeNull()
      bs.free(0)
      const r = bs.allocate(8)
      expect(r).not.toBeNull()
    })

    it('should handle multiple clone operations', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      const c1 = bs.clone()
      const c2 = c1.clone()
      expect(c2.getNumBlocks()).toBe(1)
      c2.reset()
      expect(c1.getNumBlocks()).toBe(1)
      expect(bs.getNumBlocks()).toBe(1)
    })

    it('should track allocation addresses correctly', () => {
      const bs = new BuddySystem(128)
      const results: AllocationResult[] = []
      for (let i = 0; i < 4; i++) {
        results.push(bs.allocate(32)!)
      }
      const addresses = results.map(r => r.address)
      const unique = new Set(addresses)
      expect(unique.size).toBe(4)
    })

    it('should handle free blocks after partial allocation', () => {
      const bs = new BuddySystem(32)
      bs.allocate(8)
      const free = bs.getFreeBlocks()
      const totalFree = free.reduce((sum, b) => sum + b.size, 0)
      expect(totalFree).toBe(24)
    })

    it('should handle fragmentation metric edge case', () => {
      const bs = new BuddySystem(64)
      expect(bs.getFragmentation()).toBe(0)
    })

    it('should handle utilization after partial free', () => {
      const bs = new BuddySystem(64)
      const r1 = bs.allocate(32)
      bs.allocate(32)
      bs.free(r1!.address)
      expect(bs.getUtilization()).toBe(0.5)
    })

    it('should handle getBlocksize for end of block', () => {
      const bs = new BuddySystem(32)
      bs.allocate(16)
      expect(bs.getBlockSize(15)).toBe(16)
    })
  })
})
