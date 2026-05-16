import { describe, it, expect, beforeEach } from 'vitest';
import { WorkspaceSet2 } from '../src/core/workspace-set-2/index.js';

describe('WorkspaceSet2', () => {
  let ws: WorkspaceSet2<string>;

  beforeEach(() => {
    ws = new WorkspaceSet2<string>();
  });

  describe('constructor', () => {
    it('should create an empty WorkspaceSet2', () => {
      expect(ws.getWorkspaceNames()).toEqual([]);
      expect(ws.totalItems()).toBe(0);
    });
  });

  describe('createWorkspace', () => {
    it('should create a new workspace', () => {
      ws.createWorkspace('workspace1');
      expect(ws.hasWorkspace('workspace1')).toBe(true);
      expect(ws.workspaceSize('workspace1')).toBe(0);
    });

    it('should not create duplicate workspace', () => {
      ws.createWorkspace('workspace1');
      ws.addToWorkspace('workspace1', 'item1');
      ws.createWorkspace('workspace1');
      expect(ws.workspaceSize('workspace1')).toBe(1);
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete an existing workspace', () => {
      ws.createWorkspace('workspace1');
      ws.addToWorkspace('workspace1', 'item1');
      expect(ws.deleteWorkspace('workspace1')).toBe(true);
      expect(ws.hasWorkspace('workspace1')).toBe(false);
    });

    it('should return false for non-existent workspace', () => {
      expect(ws.deleteWorkspace('nonexistent')).toBe(false);
    });
  });

  describe('hasWorkspace', () => {
    it('should return true for existing workspace', () => {
      ws.createWorkspace('workspace1');
      expect(ws.hasWorkspace('workspace1')).toBe(true);
    });

    it('should return false for non-existent workspace', () => {
      expect(ws.hasWorkspace('nonexistent')).toBe(false);
    });
  });

  describe('addToWorkspace', () => {
    it('should add item to existing workspace', () => {
      ws.createWorkspace('workspace1');
      ws.addToWorkspace('workspace1', 'item1');
      expect(ws.workspaceSize('workspace1')).toBe(1);
      const items = ws.getWorkspace('workspace1');
      expect(items.has('item1')).toBe(true);
    });

    it('should create workspace if it does not exist', () => {
      ws.addToWorkspace('newWorkspace', 'item1');
      expect(ws.hasWorkspace('newWorkspace')).toBe(true);
      expect(ws.workspaceSize('newWorkspace')).toBe(1);
    });

    it('should not add duplicate items', () => {
      ws.addToWorkspace('workspace1', 'item1');
      ws.addToWorkspace('workspace1', 'item1');
      expect(ws.workspaceSize('workspace1')).toBe(1);
    });
  });

  describe('removeFromWorkspace', () => {
    it('should remove item from workspace', () => {
      ws.addToWorkspace('workspace1', 'item1');
      ws.addToWorkspace('workspace1', 'item2');
      expect(ws.removeFromWorkspace('workspace1', 'item1')).toBe(true);
      expect(ws.workspaceSize('workspace1')).toBe(1);
      expect(ws.getWorkspace('workspace1').has('item1')).toBe(false);
    });

    it('should return false for non-existent item', () => {
      ws.addToWorkspace('workspace1', 'item1');
      expect(ws.removeFromWorkspace('workspace1', 'nonexistent')).toBe(false);
    });

    it('should return false for non-existent workspace', () => {
      expect(ws.removeFromWorkspace('nonexistent', 'item1')).toBe(false);
    });
  });

  describe('getWorkspace', () => {
    it('should return Set for existing workspace', () => {
      ws.addToWorkspace('workspace1', 'item1');
      const result = ws.getWorkspace('workspace1');
      expect(result instanceof Set).toBe(true);
      expect(result.size).toBe(1);
      expect(result.has('item1')).toBe(true);
    });

    it('should return empty Set for non-existent workspace', () => {
      const result = ws.getWorkspace('nonexistent');
      expect(result instanceof Set).toBe(true);
      expect(result.size).toBe(0);
    });

    it('should return independent Set instances', () => {
      ws.addToWorkspace('workspace1', 'item1');
      const set1 = ws.getWorkspace('workspace1');
      const set2 = ws.getWorkspace('workspace1');
      expect(set1).not.toBe(set2);
    });
  });

  describe('getWorkspaceNames', () => {
    it('should return empty array for no workspaces', () => {
      expect(ws.getWorkspaceNames()).toEqual([]);
    });

    it('should return all workspace names', () => {
      ws.createWorkspace('workspace1');
      ws.createWorkspace('workspace2');
      ws.createWorkspace('workspace3');
      const names = ws.getWorkspaceNames();
      expect(names).toContain('workspace1');
      expect(names).toContain('workspace2');
      expect(names).toContain('workspace3');
      expect(names.length).toBe(3);
    });
  });

  describe('workspaceSize', () => {
    it('should return 0 for non-existent workspace', () => {
      expect(ws.workspaceSize('nonexistent')).toBe(0);
    });

    it('should return correct size for workspace', () => {
      ws.addToWorkspace('workspace1', 'item1');
      ws.addToWorkspace('workspace1', 'item2');
      ws.addToWorkspace('workspace1', 'item3');
      expect(ws.workspaceSize('workspace1')).toBe(3);
    });

    it('should return 0 for empty workspace', () => {
      ws.createWorkspace('workspace1');
      expect(ws.workspaceSize('workspace1')).toBe(0);
    });
  });

  describe('totalItems', () => {
    it('should return 0 for empty WorkspaceSet2', () => {
      expect(ws.totalItems()).toBe(0);
    });

    it('should return total items across all workspaces', () => {
      ws.addToWorkspace('workspace1', 'item1');
      ws.addToWorkspace('workspace1', 'item2');
      ws.addToWorkspace('workspace2', 'item3');
      ws.addToWorkspace('workspace3', 'item4');
      ws.addToWorkspace('workspace3', 'item5');
      expect(ws.totalItems()).toBe(5);
    });

    it('should update after adding and removing items', () => {
      ws.addToWorkspace('workspace1', 'item1');
      ws.addToWorkspace('workspace1', 'item2');
      expect(ws.totalItems()).toBe(2);
      ws.removeFromWorkspace('workspace1', 'item1');
      expect(ws.totalItems()).toBe(1);
    });
  });

  describe('moveItem', () => {
    it('should move item between workspaces', () => {
      ws.addToWorkspace('from', 'item1');
      ws.addToWorkspace('from', 'item2');
      ws.addToWorkspace('to', 'item3');
      expect(ws.moveItem('item1', 'from', 'to')).toBe(true);
      expect(ws.getWorkspace('from').size).toBe(1);
      expect(ws.getWorkspace('to').size).toBe(2);
      expect(ws.getWorkspace('from').has('item1')).toBe(false);
      expect(ws.getWorkspace('to').has('item1')).toBe(true);
    });

    it('should return false for non-existent item', () => {
      ws.addToWorkspace('from', 'item1');
      expect(ws.moveItem('nonexistent', 'from', 'to')).toBe(false);
    });

    it('should return false for non-existent source workspace', () => {
      expect(ws.moveItem('item1', 'nonexistent', 'to')).toBe(false);
    });

    it('should create destination workspace if it does not exist', () => {
      ws.addToWorkspace('from', 'item1');
      expect(ws.moveItem('item1', 'from', 'new')).toBe(true);
      expect(ws.hasWorkspace('new')).toBe(true);
      expect(ws.getWorkspace('new').has('item1')).toBe(true);
    });

    it('should return true when moving to same workspace', () => {
      ws.addToWorkspace('same', 'item1');
      expect(ws.moveItem('item1', 'same', 'same')).toBe(true);
      expect(ws.workspaceSize('same')).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all workspaces', () => {
      ws.addToWorkspace('workspace1', 'item1');
      ws.addToWorkspace('workspace2', 'item2');
      ws.addToWorkspace('workspace3', 'item3');
      ws.clear();
      expect(ws.getWorkspaceNames()).toEqual([]);
      expect(ws.totalItems()).toBe(0);
    });

    it('should clear empty WorkspaceSet2', () => {
      ws.clear();
      expect(ws.getWorkspaceNames()).toEqual([]);
      expect(ws.totalItems()).toBe(0);
    });
  });

  describe('clearWorkspace', () => {
    it('should clear specific workspace', () => {
      ws.addToWorkspace('workspace1', 'item1');
      ws.addToWorkspace('workspace1', 'item2');
      ws.addToWorkspace('workspace2', 'item3');
      ws.clearWorkspace('workspace1');
      expect(ws.workspaceSize('workspace1')).toBe(0);
      expect(ws.workspaceSize('workspace2')).toBe(1);
      expect(ws.hasWorkspace('workspace1')).toBe(true);
    });

    it('should handle non-existent workspace', () => {
      ws.clearWorkspace('nonexistent');
      expect(ws.getWorkspaceNames()).toEqual([]);
    });

    it('should handle empty workspace', () => {
      ws.createWorkspace('workspace1');
      ws.clearWorkspace('workspace1');
      expect(ws.workspaceSize('workspace1')).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle duplicate items across workspaces', () => {
      ws.addToWorkspace('workspace1', 'shared');
      ws.addToWorkspace('workspace2', 'shared');
      ws.addToWorkspace('workspace3', 'shared');
      expect(ws.workspaceSize('workspace1')).toBe(1);
      expect(ws.workspaceSize('workspace2')).toBe(1);
      expect(ws.workspaceSize('workspace3')).toBe(1);
      expect(ws.totalItems()).toBe(3);
    });

    it('should work with different item types', () => {
      const numberWs = new WorkspaceSet2<number>();
      numberWs.addToWorkspace('nums', 1);
      numberWs.addToWorkspace('nums', 2);
      expect(numberWs.workspaceSize('nums')).toBe(2);
      expect(numberWs.totalItems()).toBe(2);

      const objectWs = new WorkspaceSet2<{ id: number }>();
      objectWs.addToWorkspace('objs', { id: 1 });
      objectWs.addToWorkspace('objs', { id: 2 });
      expect(objectWs.workspaceSize('objs')).toBe(2);
      expect(objectWs.totalItems()).toBe(2);
    });

    it('should handle adding multiple items to same workspace', () => {
      ws.addToWorkspace('workspace1', 'a');
      ws.addToWorkspace('workspace1', 'b');
      ws.addToWorkspace('workspace1', 'c');
      ws.addToWorkspace('workspace1', 'd');
      ws.addToWorkspace('workspace1', 'e');
      expect(ws.workspaceSize('workspace1')).toBe(5);
      expect(ws.totalItems()).toBe(5);
    });

    it('should handle removing item from one workspace but not others', () => {
      ws.addToWorkspace('workspace1', 'shared');
      ws.addToWorkspace('workspace2', 'shared');
      ws.addToWorkspace('workspace3', 'shared');
      ws.removeFromWorkspace('workspace1', 'shared');
      expect(ws.getWorkspace('workspace1').has('shared')).toBe(false);
      expect(ws.getWorkspace('workspace2').has('shared')).toBe(true);
      expect(ws.getWorkspace('workspace3').has('shared')).toBe(true);
    });

    it('should handle workspace names', () => {
      const ws = new WorkspaceSet2();
      ws.createWorkspace('a');
      ws.createWorkspace('b');
      const names = ws.getWorkspaceNames();
      expect(names).toContain('a');
      expect(names).toContain('b');
    });

    it('should handle totalItems', () => {
      const ws = new WorkspaceSet2<string>();
      ws.createWorkspace('ws1');
      ws.addToWorkspace('ws1', 'a');
      ws.addToWorkspace('ws1', 'b');
      expect(ws.totalItems()).toBe(2);
    });
  });
});
