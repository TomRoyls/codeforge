import { BuddySystem } from '../src/core/buddy-system/buddy-system.js'
import type { AllocationResult, BlockInfo } from '../src/core/buddy-system/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BuddySystem', () => {
  describe('constructor', () => {
    it('creates allocator with total size 1', () => {
      const bs = new BuddySystem(1)
      expect(bs.getTotalSize()).toBe(1)
      expect(bs.getUsedSize()).toBe(0)
      expect(bs.getFreeSize()).toBe(1)
    })

    it('creates allocator with total size 2', () => {
      const bs = new BuddySystem(2)
      expect(bs.getTotalSize()).toBe(2)
    })

    it('creates allocator with total size 16', () => {
      const bs = new BuddySystem(16)
      expect(bs.getTotalSize()).toBe(16)
      expect(bs.getFreeSize()).toBe(16)
      expect(bs.getUsedSize()).toBe(0)
    })

    it('creates allocator with total size 1024', () => {
      const bs = new BuddySystem(1024)
      expect(bs.getTotalSize()).toBe(1024)
    })

    it('initializes with zero allocated blocks', () => {
      const bs = new BuddySystem(64)
      expect(bs.getNumBlocks()).toBe(0)
      expect(bs.getAllocatedBlocks()).toEqual([])
    })

    it('initializes with one free block spanning total size', () => {
      const bs = new BuddySystem(64)
      const free = bs.getFreeBlocks()
      expect(free).toEqual([{ address: 0, size: 64 }])
    })

    it('throws for total size 0', () => {
      expect(() => new BuddySystem(0)).toThrow('Total size must be a positive integer')
    })

    it('throws for negative total size', () => {
      expect(() => new BuddySystem(-1)).toThrow('Total size must be a positive integer')
      expect(() => new BuddySystem(-16)).toThrow('Total size must be a positive integer')
    })

    it('throws for non-integer total size', () => {
      expect(() => new BuddySystem(3.5)).toThrow('Total size must be a positive integer')
      expect(() => new BuddySystem(10.1)).toThrow('Total size must be a positive integer')
    })

    it('throws for non-power-of-2 total size', () => {
      expect(() => new BuddySystem(3)).toThrow('Total size must be a power of 2')
      expect(() => new BuddySystem(5)).toThrow('Total size must be a power of 2')
      expect(() => new BuddySystem(6)).toThrow('Total size must be a power of 2')
      expect(() => new BuddySystem(12)).toThrow('Total size must be a power of 2')
      expect(() => new BuddySystem(100)).toThrow('Total size must be a power of 2')
    })
  })

  // ─── Allocate ─────────────────────────────────────────────────────────

  describe('allocate', () => {
    it('allocates a block of size 1 from total size 16', () => {
      const bs = new BuddySystem(16)
      const result = bs.allocate(1)
      expect(result).not.toBeNull()
      expect(result!.address).toBe(0)
      expect(result!.blockSize).toBe(1)
    })

    it('allocates a block of exact power-of-2 size', () => {
      const bs = new BuddySystem(64)
      const result = bs.allocate(8)
      expect(result).not.toBeNull()
      expect(result!.blockSize).toBe(8)
    })

    it('rounds up non-power-of-2 request to next power of 2', () => {
      const bs = new BuddySystem(64)
      const result = bs.allocate(3)
      expect(result).not.toBeNull()
      expect(result!.blockSize).toBe(4)
    })

    it('rounds up size 5 to block size 8', () => {
      const bs = new BuddySystem(64)
      const result = bs.allocate(5)
      expect(result).not.toBeNull()
      expect(result!.blockSize).toBe(8)
    })

    it('rounds up size 9 to block size 16', () => {
      const bs = new BuddySystem(64)
      const result = bs.allocate(9)
      expect(result).not.toBeNull()
      expect(result!.blockSize).toBe(16)
    })

    it('returns null when requesting more than total size', () => {
      const bs = new BuddySystem(16)
      const result = bs.allocate(17)
      expect(result).toBeNull()
    })

    it('returns null when requesting exactly total size + 1', () => {
      const bs = new BuddySystem(8)
      expect(bs.allocate(9)).toBeNull()
    })

    it('returns null when memory is fully allocated', () => {
      const bs = new BuddySystem(8)
      bs.allocate(8)
      const result = bs.allocate(1)
      expect(result).toBeNull()
    })

    it('returns null when no contiguous block large enough', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      bs.allocate(4)
      bs.allocate(4)
      bs.allocate(4)
      const result = bs.allocate(4)
      expect(result).toBeNull()
    })

    it('throws for size 0', () => {
      const bs = new BuddySystem(16)
      expect(() => bs.allocate(0)).toThrow('Size must be a positive integer')
    })

    it('throws for negative size', () => {
      const bs = new BuddySystem(16)
      expect(() => bs.allocate(-1)).toThrow('Size must be a positive integer')
      expect(() => bs.allocate(-10)).toThrow('Size must be a positive integer')
    })

    it('throws for non-integer size', () => {
      const bs = new BuddySystem(16)
      expect(() => bs.allocate(2.5)).toThrow('Size must be a positive integer')
    })

    it('allocates exact total size in one block', () => {
      const bs = new BuddySystem(32)
      const result = bs.allocate(32)
      expect(result).not.toBeNull()
      expect(result!.blockSize).toBe(32)
      expect(result!.address).toBe(0)
    })

    it('tracks allocated block correctly', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      expect(bs.getNumBlocks()).toBe(1)
      expect(bs.getUsedSize()).toBe(4)
    })

    it('allocates multiple blocks and tracks count', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      bs.allocate(4)
      bs.allocate(4)
      expect(bs.getNumBlocks()).toBe(3)
      expect(bs.getUsedSize()).toBe(12)
    })
  })

  // ─── Free ─────────────────────────────────────────────────────────────

  describe('free', () => {
    it('frees an allocated block', () => {
      const bs = new BuddySystem(16)
      const result = bs.allocate(4)
      bs.free(result!.address)
      expect(bs.getNumBlocks()).toBe(0)
      expect(bs.getUsedSize()).toBe(0)
    })

    it('throws when freeing address that was never allocated', () => {
      const bs = new BuddySystem(16)
      expect(() => bs.free(0)).toThrow('No allocated block at address 0')
    })

    it('throws when freeing an address not at block start', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      expect(() => bs.free(1)).toThrow('No allocated block at address 1')
    })

    it('throws when freeing already freed address', () => {
      const bs = new BuddySystem(16)
      const result = bs.allocate(4)
      bs.free(result!.address)
      expect(() => bs.free(result!.address)).toThrow()
    })
  })

  // ─── Coalescing (Buddy Merging) ───────────────────────────────────────

  describe('coalescing', () => {
    it('merges two buddies of size 1 into size 2', () => {
      const bs = new BuddySystem(4)
      const a = bs.allocate(1)!
      const b = bs.allocate(1)!
      expect(a.address).toBe(0)
      expect(b.address).toBe(1)
      bs.free(a.address)
      bs.free(b.address)
      expect(bs.getUsedSize()).toBe(0)
      expect(bs.getLargestFreeBlock()).toBe(4)
    })

    it('merges buddies when freed in reverse order', () => {
      const bs = new BuddySystem(4)
      const a = bs.allocate(1)!
      const b = bs.allocate(1)!
      bs.free(b.address)
      bs.free(a.address)
      expect(bs.getUsedSize()).toBe(0)
      expect(bs.getLargestFreeBlock()).toBe(4)
    })

    it('does not merge non-buddy blocks', () => {
      const bs = new BuddySystem(16)
      const a = bs.allocate(4)!
      const b = bs.allocate(4)!
      const c = bs.allocate(4)!
      bs.free(b.address)
      expect(bs.getLargestFreeBlock()).toBe(4)
    })

    it('cascades merge up through multiple levels', () => {
      const bs = new BuddySystem(16)
      const a = bs.allocate(4)!
      const b = bs.allocate(4)!
      bs.free(a.address)
      bs.free(b.address)
      expect(bs.getLargestFreeBlock()).toBe(16)
      expect(bs.getFreeSize()).toBe(16)
    })

    it('merges 4 blocks of size 4 back into size 16', () => {
      const bs = new BuddySystem(16)
      const blocks = [
        bs.allocate(4)!,
        bs.allocate(4)!,
        bs.allocate(4)!,
        bs.allocate(4)!,
      ]
      for (const block of blocks) {
        bs.free(block.address)
      }
      expect(bs.getUsedSize()).toBe(0)
      expect(bs.getLargestFreeBlock()).toBe(16)
    })

    it('partially merges only buddy pairs', () => {
      const bs = new BuddySystem(16)
      const a = bs.allocate(4)!
      const b = bs.allocate(4)!
      bs.allocate(4)
      bs.free(a.address)
      bs.free(b.address)
      expect(bs.getLargestFreeBlock()).toBe(8)
    })
  })

  // ─── isAllocated ──────────────────────────────────────────────────────

  describe('isAllocated', () => {
    it('returns true for start of allocated block', () => {
      const bs = new BuddySystem(16)
      const result = bs.allocate(4)!
      expect(bs.isAllocated(result.address)).toBe(true)
    })

    it('returns true for interior address of allocated block', () => {
      const bs = new BuddySystem(16)
      bs.allocate(8)
      expect(bs.isAllocated(3)).toBe(true)
    })

    it('returns false for free address', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      expect(bs.isAllocated(8)).toBe(false)
    })

    it('returns false for address after free', () => {
      const bs = new BuddySystem(16)
      const result = bs.allocate(4)!
      bs.free(result.address)
      expect(bs.isAllocated(result.address)).toBe(false)
    })

    it('returns false when nothing is allocated', () => {
      const bs = new BuddySystem(16)
      expect(bs.isAllocated(0)).toBe(false)
    })

    it('handles adjacent blocks correctly', () => {
      const bs = new BuddySystem(16)
      const a = bs.allocate(4)!
      const b = bs.allocate(4)!
      expect(bs.isAllocated(a.address)).toBe(true)
      expect(bs.isAllocated(b.address)).toBe(true)
      expect(bs.isAllocated(a.address + 1)).toBe(true)
      expect(bs.isAllocated(b.address + 3)).toBe(true)
    })
  })

  // ─── getBlockSize ─────────────────────────────────────────────────────

  describe('getBlockSize', () => {
    it('returns block size for allocated block start address', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      expect(bs.getBlockSize(0)).toBe(4)
    })

    it('returns block size for interior address of allocated block', () => {
      const bs = new BuddySystem(16)
      bs.allocate(8)
      expect(bs.getBlockSize(2)).toBe(8)
    })

    it('returns block size for free block', () => {
      const bs = new BuddySystem(16)
      expect(bs.getBlockSize(0)).toBe(16)
    })

    it('returns block size for split free block', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      expect(bs.getBlockSize(4)).toBe(4)
    })

    it('throws for address outside any block range', () => {
      const bs = new BuddySystem(16)
      expect(() => bs.getBlockSize(16)).toThrow('No block at address 16')
      expect(() => bs.getBlockSize(100)).toThrow('No block at address 100')
    })
  })

  // ─── Stats ────────────────────────────────────────────────────────────

  describe('stats', () => {
    it('getTotalSize returns configured size', () => {
      const bs = new BuddySystem(128)
      expect(bs.getTotalSize()).toBe(128)
    })

    it('getUsedSize returns 0 when nothing allocated', () => {
      const bs = new BuddySystem(64)
      expect(bs.getUsedSize()).toBe(0)
    })

    it('getUsedSize sums allocated block sizes', () => {
      const bs = new BuddySystem(64)
      bs.allocate(8)
      bs.allocate(16)
      expect(bs.getUsedSize()).toBe(24)
    })

    it('getUsedSize accounts for rounded-up sizes', () => {
      const bs = new BuddySystem(64)
      bs.allocate(3)
      expect(bs.getUsedSize()).toBe(4)
    })

    it('getFreeSize is total minus used', () => {
      const bs = new BuddySystem(64)
      bs.allocate(8)
      expect(bs.getFreeSize()).toBe(56)
    })

    it('getFreeSize equals total when nothing allocated', () => {
      const bs = new BuddySystem(32)
      expect(bs.getFreeSize()).toBe(32)
    })

    it('getUtilization is 0 when nothing allocated', () => {
      const bs = new BuddySystem(64)
      expect(bs.getUtilization()).toBe(0)
    })

    it('getUtilization increases after allocation', () => {
      const bs = new BuddySystem(64)
      bs.allocate(16)
      expect(bs.getUtilization()).toBe(16 / 64)
    })

    it('getUtilization is 1 when fully allocated', () => {
      const bs = new BuddySystem(16)
      bs.allocate(16)
      expect(bs.getUtilization()).toBe(1)
    })

    it('getNumBlocks counts allocated blocks', () => {
      const bs = new BuddySystem(64)
      expect(bs.getNumBlocks()).toBe(0)
      bs.allocate(8)
      expect(bs.getNumBlocks()).toBe(1)
      bs.allocate(8)
      expect(bs.getNumBlocks()).toBe(2)
    })
  })

  // ─── Fragmentation ────────────────────────────────────────────────────

  describe('fragmentation', () => {
    it('getFragmentation is 0 with no allocations', () => {
      const bs = new BuddySystem(64)
      expect(bs.getFragmentation()).toBe(0)
    })

    it('getFragmentation is 0 when fully allocated', () => {
      const bs = new BuddySystem(16)
      bs.allocate(16)
      expect(bs.getFragmentation()).toBe(0)
    })

    it('getFragmentation increases when free space is split', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      const frag = bs.getFragmentation()
      expect(frag).toBeGreaterThan(0)
      expect(frag).toBeLessThan(1)
    })

    it('getLargestFreeBlock returns total size when empty', () => {
      const bs = new BuddySystem(64)
      expect(bs.getLargestFreeBlock()).toBe(64)
    })

    it('getLargestFreeBlock returns 0 when fully allocated', () => {
      const bs = new BuddySystem(16)
      bs.allocate(16)
      expect(bs.getLargestFreeBlock()).toBe(0)
    })

    it('getLargestFreeBlock returns largest available after splits', () => {
      const bs = new BuddySystem(64)
      bs.allocate(8)
      expect(bs.getLargestFreeBlock()).toBe(32)
    })
  })

  // ─── getFreeBlocks / getAllocatedBlocks ────────────────────────────────

  describe('getFreeBlocks and getAllocatedBlocks', () => {
    it('getFreeBlocks returns single block for fresh allocator', () => {
      const bs = new BuddySystem(16)
      const free = bs.getFreeBlocks()
      expect(free).toEqual([{ address: 0, size: 16 }])
    })

    it('getFreeBlocks returns split blocks after allocation', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      const free = bs.getFreeBlocks()
      expect(free.length).toBeGreaterThan(1)
      const totalFree = free.reduce((sum, b) => sum + b.size, 0)
      expect(totalFree).toBe(12)
    })

    it('getFreeBlocks returns empty when fully allocated', () => {
      const bs = new BuddySystem(8)
      bs.allocate(8)
      expect(bs.getFreeBlocks()).toEqual([])
    })

    it('getFreeBlocks are sorted by address', () => {
      const bs = new BuddySystem(32)
      bs.allocate(4)
      const free = bs.getFreeBlocks()
      for (let i = 1; i < free.length; i++) {
        expect(free[i].address).toBeGreaterThan(free[i - 1].address)
      }
    })

    it('getAllocatedBlocks returns empty when nothing allocated', () => {
      const bs = new BuddySystem(16)
      expect(bs.getAllocatedBlocks()).toEqual([])
    })

    it('getAllocatedBlocks returns allocated block info', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      const allocated = bs.getAllocatedBlocks()
      expect(allocated).toEqual([{ address: 0, size: 4 }])
    })

    it('getAllocatedBlocks returns multiple blocks sorted by address', () => {
      const bs = new BuddySystem(32)
      bs.allocate(4)
      bs.allocate(8)
      const allocated = bs.getAllocatedBlocks()
      expect(allocated.length).toBe(2)
      for (let i = 1; i < allocated.length; i++) {
        expect(allocated[i].address).toBeGreaterThan(allocated[i - 1].address)
      }
    })
  })

  // ─── Reset ────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('clears all allocations', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      bs.allocate(4)
      bs.reset()
      expect(bs.getNumBlocks()).toBe(0)
      expect(bs.getUsedSize()).toBe(0)
      expect(bs.getFreeSize()).toBe(16)
    })

    it('restores single free block after reset', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      bs.allocate(8)
      bs.reset()
      expect(bs.getFreeBlocks()).toEqual([{ address: 0, size: 16 }])
    })

    it('allows allocation after reset', () => {
      const bs = new BuddySystem(16)
      bs.allocate(16)
      bs.reset()
      const result = bs.allocate(8)
      expect(result).not.toBeNull()
      expect(result!.blockSize).toBe(8)
    })

    it('reset on empty allocator is a no-op', () => {
      const bs = new BuddySystem(16)
      bs.reset()
      expect(bs.getTotalSize()).toBe(16)
      expect(bs.getNumBlocks()).toBe(0)
    })
  })

  // ─── Clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const bs = new BuddySystem(16)
      const cloned = bs.clone()
      expect(cloned.getTotalSize()).toBe(16)
      expect(cloned.getNumBlocks()).toBe(0)
    })

    it('clone reflects current state', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      const cloned = bs.clone()
      expect(cloned.getNumBlocks()).toBe(1)
      expect(cloned.getUsedSize()).toBe(4)
    })

    it('modifications to clone do not affect original', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      const cloned = bs.clone()
      cloned.allocate(4)
      expect(bs.getNumBlocks()).toBe(1)
      expect(cloned.getNumBlocks()).toBe(2)
    })

    it('freeing in clone does not affect original', () => {
      const bs = new BuddySystem(16)
      const result = bs.allocate(4)!
      const cloned = bs.clone()
      cloned.free(result.address)
      expect(bs.getNumBlocks()).toBe(1)
      expect(cloned.getNumBlocks()).toBe(0)
    })

    it('reset on clone does not affect original', () => {
      const bs = new BuddySystem(16)
      bs.allocate(4)
      const cloned = bs.clone()
      cloned.reset()
      expect(bs.getNumBlocks()).toBe(1)
      expect(cloned.getNumBlocks()).toBe(0)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('allocates all memory as single block', () => {
      const bs = new BuddySystem(64)
      const result = bs.allocate(64)
      expect(result!.blockSize).toBe(64)
      expect(bs.getUsedSize()).toBe(64)
      expect(bs.getFreeSize()).toBe(0)
    })

    it('allocates all memory as smallest blocks', () => {
      const bs = new BuddySystem(8)
      const blocks: AllocationResult[] = []
      for (let i = 0; i < 8; i++) {
        const r = bs.allocate(1)
        expect(r).not.toBeNull()
        blocks.push(r!)
      }
      expect(bs.getUsedSize()).toBe(8)
      expect(bs.getFreeSize()).toBe(0)
      expect(bs.getNumBlocks()).toBe(8)
    })

    it('free all blocks restores to initial state', () => {
      const bs = new BuddySystem(16)
      const blocks: AllocationResult[] = []
      for (let i = 0; i < 16; i++) {
        blocks.push(bs.allocate(1)!)
      }
      for (const block of blocks) {
        bs.free(block.address)
      }
      expect(bs.getNumBlocks()).toBe(0)
      expect(bs.getUsedSize()).toBe(0)
      expect(bs.getFreeSize()).toBe(16)
      expect(bs.getLargestFreeBlock()).toBe(16)
    })

    it('size 1 allocation uses block size 1', () => {
      const bs = new BuddySystem(16)
      const result = bs.allocate(1)
      expect(result!.blockSize).toBe(1)
    })

    it('power-of-2 sizes are exact', () => {
      const bs = new BuddySystem(64)
      expect(bs.allocate(1)!.blockSize).toBe(1)
      expect(bs.allocate(2)!.blockSize).toBe(2)
      expect(bs.allocate(4)!.blockSize).toBe(4)
      expect(bs.allocate(8)!.blockSize).toBe(8)
    })

    it('non-power-of-2 sizes round up correctly', () => {
      const bs = new BuddySystem(64)
      expect(bs.allocate(3)!.blockSize).toBe(4)
      expect(bs.allocate(5)!.blockSize).toBe(8)
      expect(bs.allocate(7)!.blockSize).toBe(8)
      expect(bs.allocate(9)!.blockSize).toBe(16)
    })

    it('allocate and free repeatedly', () => {
      const bs = new BuddySystem(16)
      for (let i = 0; i < 5; i++) {
        const result = bs.allocate(4)
        expect(result).not.toBeNull()
        bs.free(result!.address)
      }
      expect(bs.getNumBlocks()).toBe(0)
      expect(bs.getUsedSize()).toBe(0)
    })

    it('handles minimum allocator of size 1', () => {
      const bs = new BuddySystem(1)
      const result = bs.allocate(1)
      expect(result).not.toBeNull()
      expect(result!.address).toBe(0)
      expect(result!.blockSize).toBe(1)
      expect(bs.getUsedSize()).toBe(1)
    })

    it('cannot allocate from size 1 allocator when full', () => {
      const bs = new BuddySystem(1)
      bs.allocate(1)
      expect(bs.allocate(1)).toBeNull()
    })

    it('allocate maximum fitting size', () => {
      const bs = new BuddySystem(128)
      const result = bs.allocate(128)
      expect(result).not.toBeNull()
      expect(result!.blockSize).toBe(128)
    })

    it('interleaved allocate and free', () => {
      const bs = new BuddySystem(16)
      const a = bs.allocate(4)!
      const b = bs.allocate(4)!
      bs.free(a.address)
      const c = bs.allocate(4)!
      expect(c).not.toBeNull()
      expect(bs.getNumBlocks()).toBe(2)
      bs.free(b.address)
      bs.free(c.address)
      expect(bs.getNumBlocks()).toBe(0)
    })

    it('utilization updates after allocate and free', () => {
      const bs = new BuddySystem(32)
      expect(bs.getUtilization()).toBe(0)
      bs.allocate(16)
      expect(bs.getUtilization()).toBe(0.5)
      bs.allocate(16)
      expect(bs.getUtilization()).toBe(1)
    })

    it('fragmentation with alternating alloc/free', () => {
      const bs = new BuddySystem(32)
      const a = bs.allocate(4)!
      const b = bs.allocate(4)!
      const c = bs.allocate(4)!
      const d = bs.allocate(4)!
      bs.free(b.address)
      bs.free(d.address)
      expect(bs.getNumBlocks()).toBe(2)
      expect(bs.getFreeSize()).toBe(24)
    })

    it('large total size handles many small allocations', () => {
      const bs = new BuddySystem(1024)
      const blocks: AllocationResult[] = []
      for (let i = 0; i < 64; i++) {
        const r = bs.allocate(4)
        expect(r).not.toBeNull()
        blocks.push(r!)
      }
      expect(bs.getUsedSize()).toBe(256)
      expect(bs.getNumBlocks()).toBe(64)
    })
  })
})
