import { describe, it, expect } from 'vitest'
import { WorkspaceSet2 } from '../../src/core/workspace-set-2/index.js'

// ─── Constructor ───

describe('WorkspaceSet2', () => {
  describe('constructor', () => {
    it('creates an empty workspace set', () => {
      const ws = new WorkspaceSet2<string>()
      expect(ws.getWorkspaceNames()).toEqual([])
      expect(ws.totalItems()).toBe(0)
    })
  })

  // ─── createWorkspace ───

  describe('createWorkspace', () => {
    it('creates a new workspace', () => {
      const ws = new WorkspaceSet2<string>()
      ws.createWorkspace('team-a')
      expect(ws.hasWorkspace('team-a')).toBe(true)
      expect(ws.workspaceSize('team-a')).toBe(0)
    })

    it('no-op if workspace already exists', () => {
      const ws = new WorkspaceSet2<string>()
      ws.createWorkspace('team-a')
      ws.addToWorkspace('team-a', 'item1')
      ws.createWorkspace('team-a')
      expect(ws.workspaceSize('team-a')).toBe(1)
    })
  })

  // ─── deleteWorkspace ───

  describe('deleteWorkspace', () => {
    it('deletes an existing workspace', () => {
      const ws = new WorkspaceSet2<string>()
      ws.createWorkspace('temp')
      expect(ws.deleteWorkspace('temp')).toBe(true)
      expect(ws.hasWorkspace('temp')).toBe(false)
    })

    it('returns false for non-existent workspace', () => {
      const ws = new WorkspaceSet2<string>()
      expect(ws.deleteWorkspace('ghost')).toBe(false)
    })
  })

  // ─── hasWorkspace ───

  describe('hasWorkspace', () => {
    it('returns false for missing workspace', () => {
      const ws = new WorkspaceSet2<string>()
      expect(ws.hasWorkspace('missing')).toBe(false)
    })

    it('returns true for existing workspace', () => {
      const ws = new WorkspaceSet2<string>()
      ws.createWorkspace('exists')
      expect(ws.hasWorkspace('exists')).toBe(true)
    })
  })

  // ─── addToWorkspace ───

  describe('addToWorkspace', () => {
    it('adds item to existing workspace', () => {
      const ws = new WorkspaceSet2<string>()
      ws.createWorkspace('ws1')
      ws.addToWorkspace('ws1', 'item1')
      expect(ws.workspaceSize('ws1')).toBe(1)
      expect(ws.getWorkspace('ws1')).toContain('item1')
    })

    it('creates workspace automatically if missing', () => {
      const ws = new WorkspaceSet2<string>()
      ws.addToWorkspace('auto-created', 'item')
      expect(ws.hasWorkspace('auto-created')).toBe(true)
      expect(ws.workspaceSize('auto-created')).toBe(1)
    })

    it('ignores duplicate item in workspace', () => {
      const ws = new WorkspaceSet2<string>()
      ws.addToWorkspace('ws1', 'dup')
      ws.addToWorkspace('ws1', 'dup')
      expect(ws.workspaceSize('ws1')).toBe(1)
    })
  })

  // ─── removeFromWorkspace ───

  describe('removeFromWorkspace', () => {
    it('removes item from workspace', () => {
      const ws = new WorkspaceSet2<string>()
      ws.addToWorkspace('ws1', 'item')
      expect(ws.removeFromWorkspace('ws1', 'item')).toBe(true)
      expect(ws.workspaceSize('ws1')).toBe(0)
    })

    it('returns false for missing workspace', () => {
      const ws = new WorkspaceSet2<string>()
      expect(ws.removeFromWorkspace('ghost', 'item')).toBe(false)
    })

    it('returns false for missing item', () => {
      const ws = new WorkspaceSet2<string>()
      ws.addToWorkspace('ws1', 'exists')
      expect(ws.removeFromWorkspace('ws1', 'missing')).toBe(false)
    })
  })

  // ─── getWorkspace ───

  describe('getWorkspace', () => {
    it('returns copy of workspace items', () => {
      const ws = new WorkspaceSet2<string>()
      ws.addToWorkspace('ws1', 'a')
      ws.addToWorkspace('ws1', 'b')
      const set = ws.getWorkspace('ws1')
      expect(set.size).toBe(2)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
    })

    it('returns empty set for missing workspace', () => {
      const ws = new WorkspaceSet2<string>()
      expect(ws.getWorkspace('missing')).toEqual(new Set())
    })

    it('returned set is a copy', () => {
      const ws = new WorkspaceSet2<string>()
      ws.addToWorkspace('ws1', 'a')
      const copy = ws.getWorkspace('ws1')
      copy.add('b')
      expect(ws.workspaceSize('ws1')).toBe(1)
    })
  })

  // ─── getWorkspaceNames ───

  describe('getWorkspaceNames', () => {
    it('returns all workspace names', () => {
      const ws = new WorkspaceSet2<string>()
      ws.createWorkspace('a')
      ws.createWorkspace('b')
      ws.createWorkspace('c')
      const names = ws.getWorkspaceNames()
      expect(names).toContain('a')
      expect(names).toContain('b')
      expect(names).toContain('c')
    })

    it('returns empty array when no workspaces', () => {
      const ws = new WorkspaceSet2<string>()
      expect(ws.getWorkspaceNames()).toEqual([])
    })
  })

  // ─── totalItems ───

  describe('totalItems', () => {
    it('counts items across all workspaces', () => {
      const ws = new WorkspaceSet2<string>()
      ws.addToWorkspace('ws1', 'a')
      ws.addToWorkspace('ws1', 'b')
      ws.addToWorkspace('ws2', 'c')
      expect(ws.totalItems()).toBe(3)
    })

    it('counts shared item in each workspace', () => {
      const ws = new WorkspaceSet2<string>()
      ws.addToWorkspace('ws1', 'shared')
      ws.addToWorkspace('ws2', 'shared')
      expect(ws.totalItems()).toBe(2)
    })
  })

  // ─── moveItem ───

  describe('moveItem', () => {
    it('moves item between workspaces', () => {
      const ws = new WorkspaceSet2<string>()
      ws.addToWorkspace('from', 'item')
      expect(ws.moveItem('item', 'from', 'to')).toBe(true)
      expect(ws.workspaceSize('from')).toBe(0)
      expect(ws.getWorkspace('to')).toContain('item')
    })

    it('returns true if source and dest are same', () => {
      const ws = new WorkspaceSet2<string>()
      ws.addToWorkspace('ws1', 'item')
      expect(ws.moveItem('item', 'ws1', 'ws1')).toBe(true)
      expect(ws.workspaceSize('ws1')).toBe(1)
    })

    it('returns false if item not in source', () => {
      const ws = new WorkspaceSet2<string>()
      ws.createWorkspace('from')
      expect(ws.moveItem('missing', 'from', 'to')).toBe(false)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('clears all workspaces', () => {
      const ws = new WorkspaceSet2<string>()
      ws.addToWorkspace('ws1', 'a')
      ws.addToWorkspace('ws2', 'b')
      ws.clear()
      expect(ws.getWorkspaceNames()).toEqual([])
      expect(ws.totalItems()).toBe(0)
    })
  })

  // ─── clearWorkspace ───

  describe('clearWorkspace', () => {
    it('clears items in specific workspace', () => {
      const ws = new WorkspaceSet2<string>()
      ws.addToWorkspace('ws1', 'a')
      ws.addToWorkspace('ws2', 'b')
      ws.clearWorkspace('ws1')
      expect(ws.workspaceSize('ws1')).toBe(0)
      expect(ws.hasWorkspace('ws1')).toBe(true)
      expect(ws.workspaceSize('ws2')).toBe(1)
    })

    it('no-op for missing workspace', () => {
      const ws = new WorkspaceSet2<string>()
      ws.clearWorkspace('ghost')
      expect(ws.totalItems()).toBe(0)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles number type items', () => {
      const ws = new WorkspaceSet2<number>()
      ws.addToWorkspace('nums', 1)
      ws.addToWorkspace('nums', 2)
      expect(ws.workspaceSize('nums')).toBe(2)
    })

    it('handles many workspaces', () => {
      const ws = new WorkspaceSet2<string>()
      for (let i = 0; i < 50; i++) {
        ws.addToWorkspace(`ws-${i}`, `item-${i}`)
      }
      expect(ws.getWorkspaceNames()).toHaveLength(50)
      expect(ws.totalItems()).toBe(50)
    })

    it('move creates destination workspace if needed', () => {
      const ws = new WorkspaceSet2<string>()
      ws.addToWorkspace('src', 'item')
      ws.moveItem('item', 'src', 'new-dest')
      expect(ws.hasWorkspace('new-dest')).toBe(true)
      expect(ws.getWorkspace('new-dest')).toContain('item')
    })
  })
})
