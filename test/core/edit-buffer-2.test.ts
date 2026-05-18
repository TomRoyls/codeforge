import { describe, it, expect } from 'vitest';
import { EditBuffer2 } from '../../src/core/edit-buffer-2/index.js';

describe('EditBuffer2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty buffer', () => {
      const buf = new EditBuffer2();
      expect(buf.getContent()).toBe('');
      expect(buf.getCursor()).toBe(0);
      expect(buf.length).toBe(0);
      expect(buf.isEmpty()).toBe(true);
    });

    it('should accept a custom maxHistory', () => {
      const buf = new EditBuffer2(5);
      for (let i = 0; i < 10; i++) {
        buf.insert('a');
      }
      expect(buf.getContent().length).toBe(10);
    });
  });

  // ─── insert ───
  describe('insert', () => {
    it('should insert text at cursor position', () => {
      const buf = new EditBuffer2();
      buf.insert('hello');
      expect(buf.getContent()).toBe('hello');
      expect(buf.getCursor()).toBe(5);
    });

    it('should insert text in the middle', () => {
      const buf = new EditBuffer2();
      buf.insert('helo');
      buf.moveCursor(2);
      buf.insert('l');
      expect(buf.getContent()).toBe('hello');
    });

    it('should advance cursor after insert', () => {
      const buf = new EditBuffer2();
      buf.insert('ab');
      expect(buf.getCursor()).toBe(2);
      buf.insert('cd');
      expect(buf.getContent()).toBe('abcd');
      expect(buf.getCursor()).toBe(4);
    });

    it('should insert empty string without effect', () => {
      const buf = new EditBuffer2();
      buf.insert('test');
      buf.insert('');
      expect(buf.getContent()).toBe('test');
    });
  });

  // ─── delete ───
  describe('delete', () => {
    it('should delete characters forward from cursor', () => {
      const buf = new EditBuffer2();
      buf.insert('hello');
      buf.moveCursor(0);
      expect(buf.delete(2)).toBe('he');
      expect(buf.getContent()).toBe('llo');
    });

    it('should return deleted text from cursor position', () => {
      const buf = new EditBuffer2();
      buf.insert('hello');
      buf.moveCursor(0);
      expect(buf.delete(3)).toBe('hel');
      expect(buf.getContent()).toBe('lo');
    });

    it('should return empty string for count <= 0', () => {
      const buf = new EditBuffer2();
      buf.insert('test');
      expect(buf.delete(0)).toBe('');
      expect(buf.delete(-1)).toBe('');
      expect(buf.getContent()).toBe('test');
    });

    it('should delete only available characters from cursor', () => {
      const buf = new EditBuffer2();
      buf.insert('ab');
      buf.moveCursor(0);
      expect(buf.delete(10)).toBe('ab');
      expect(buf.getContent()).toBe('');
    });

    it('should delete nothing when cursor is at end', () => {
      const buf = new EditBuffer2();
      buf.insert('hello');
      expect(buf.delete(5)).toBe('');
      expect(buf.getContent()).toBe('hello');
    });
  });

  // ─── moveCursor ───
  describe('moveCursor', () => {
    it('should move cursor to specified position', () => {
      const buf = new EditBuffer2();
      buf.insert('hello');
      buf.moveCursor(3);
      expect(buf.getCursor()).toBe(3);
    });

    it('should clamp to content length', () => {
      const buf = new EditBuffer2();
      buf.insert('hi');
      buf.moveCursor(100);
      expect(buf.getCursor()).toBe(2);
    });

    it('should clamp to 0 for negative position', () => {
      const buf = new EditBuffer2();
      buf.insert('hi');
      buf.moveCursor(-5);
      expect(buf.getCursor()).toBe(0);
    });
  });

  // ─── getCursor ───
  describe('getCursor', () => {
    it('should return 0 initially', () => {
      const buf = new EditBuffer2();
      expect(buf.getCursor()).toBe(0);
    });
  });

  // ─── getContent ───
  describe('getContent', () => {
    it('should return the current content', () => {
      const buf = new EditBuffer2();
      buf.insert('hello world');
      expect(buf.getContent()).toBe('hello world');
    });
  });

  // ─── undo ───
  describe('undo', () => {
    it('should undo an insert', () => {
      const buf = new EditBuffer2();
      buf.insert('hello');
      buf.undo();
      expect(buf.getContent()).toBe('');
      expect(buf.getCursor()).toBe(0);
    });

    it('should undo a delete', () => {
      const buf = new EditBuffer2();
      buf.insert('hello');
      buf.moveCursor(0);
      buf.delete(2);
      buf.undo();
      expect(buf.getContent()).toBe('hello');
    });

    it('should undo multiple operations', () => {
      const buf = new EditBuffer2();
      buf.insert('a');
      buf.insert('b');
      buf.insert('c');
      buf.undo();
      expect(buf.getContent()).toBe('ab');
      buf.undo();
      expect(buf.getContent()).toBe('a');
      buf.undo();
      expect(buf.getContent()).toBe('');
    });

    it('should return false when nothing to undo', () => {
      const buf = new EditBuffer2();
      expect(buf.undo()).toBe(false);
    });

    it('should return true on successful undo', () => {
      const buf = new EditBuffer2();
      buf.insert('x');
      expect(buf.undo()).toBe(true);
    });
  });

  // ─── redo ───
  describe('redo', () => {
    it('should redo an undone insert', () => {
      const buf = new EditBuffer2();
      buf.insert('hello');
      buf.undo();
      buf.redo();
      expect(buf.getContent()).toBe('hello');
      expect(buf.getCursor()).toBe(5);
    });

    it('should redo an undone delete', () => {
      const buf = new EditBuffer2();
      buf.insert('hello');
      buf.moveCursor(0);
      buf.delete(2);
      buf.undo();
      buf.redo();
      expect(buf.getContent()).toBe('llo');
    });

    it('should return false when nothing to redo', () => {
      const buf = new EditBuffer2();
      expect(buf.redo()).toBe(false);
    });

    it('should return true on successful redo', () => {
      const buf = new EditBuffer2();
      buf.insert('x');
      buf.undo();
      expect(buf.redo()).toBe(true);
    });

    it('should clear redo stack on new insert', () => {
      const buf = new EditBuffer2();
      buf.insert('a');
      buf.undo();
      buf.insert('b');
      expect(buf.redo()).toBe(false);
      expect(buf.getContent()).toBe('b');
    });
  });

  // ─── canUndo ───
  describe('canUndo', () => {
    it('should return false for new buffer', () => {
      const buf = new EditBuffer2();
      expect(buf.canUndo()).toBe(false);
    });

    it('should return true after insert', () => {
      const buf = new EditBuffer2();
      buf.insert('x');
      expect(buf.canUndo()).toBe(true);
    });

    it('should return false after undoing everything', () => {
      const buf = new EditBuffer2();
      buf.insert('x');
      buf.undo();
      expect(buf.canUndo()).toBe(false);
    });
  });

  // ─── canRedo ───
  describe('canRedo', () => {
    it('should return false for new buffer', () => {
      const buf = new EditBuffer2();
      expect(buf.canRedo()).toBe(false);
    });

    it('should return true after undo', () => {
      const buf = new EditBuffer2();
      buf.insert('x');
      buf.undo();
      expect(buf.canRedo()).toBe(true);
    });

    it('should return false after redo', () => {
      const buf = new EditBuffer2();
      buf.insert('x');
      buf.undo();
      buf.redo();
      expect(buf.canRedo()).toBe(false);
    });
  });

  // ─── clear ───
  describe('clear', () => {
    it('should clear all content', () => {
      const buf = new EditBuffer2();
      buf.insert('hello');
      buf.clear();
      expect(buf.getContent()).toBe('');
      expect(buf.getCursor()).toBe(0);
      expect(buf.isEmpty()).toBe(true);
    });

    it('should be undoable', () => {
      const buf = new EditBuffer2();
      buf.insert('hello');
      buf.clear();
      buf.undo();
      expect(buf.getContent()).toBe('hello');
    });

    it('should be redoable', () => {
      const buf = new EditBuffer2();
      buf.insert('hello');
      buf.clear();
      buf.undo();
      buf.redo();
      expect(buf.getContent()).toBe('');
    });
  });

  // ─── length ───
  describe('length', () => {
    it('should return content length', () => {
      const buf = new EditBuffer2();
      buf.insert('abc');
      expect(buf.length).toBe(3);
    });
  });

  // ─── isEmpty ───
  describe('isEmpty', () => {
    it('should return true for empty buffer', () => {
      const buf = new EditBuffer2();
      expect(buf.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      const buf = new EditBuffer2();
      buf.insert('x');
      expect(buf.isEmpty()).toBe(false);
    });
  });

  // ─── Edge Cases ───
  describe('edge cases', () => {
    it('should handle inserting at different cursor positions', () => {
      const buf = new EditBuffer2();
      buf.insert('world');
      buf.moveCursor(0);
      buf.insert('hello ');
      expect(buf.getContent()).toBe('hello world');
    });

    it('should handle complex undo/redo sequence', () => {
      const buf = new EditBuffer2();
      buf.insert('a');
      buf.insert('b');
      buf.moveCursor(1);
      buf.delete(1);
      buf.undo();
      expect(buf.getContent()).toBe('ab');
      buf.redo();
      expect(buf.getContent()).toBe('a');
    });

    it('should respect maxHistory by trimming old entries', () => {
      const buf = new EditBuffer2(3);
      buf.insert('1');
      buf.insert('2');
      buf.insert('3');
      buf.insert('4');
      expect(buf.getContent()).toBe('1234');
      expect(buf.canUndo()).toBe(true);
      buf.undo();
      buf.undo();
      buf.undo();
      expect(buf.canUndo()).toBe(false);
    });

    it('should handle insert then delete then undo all', () => {
      const buf = new EditBuffer2();
      buf.insert('test');
      buf.moveCursor(0);
      buf.delete(2);
      buf.undo();
      expect(buf.getContent()).toBe('test');
      buf.undo();
      expect(buf.getContent()).toBe('');
    });

    it('should handle special characters', () => {
      const buf = new EditBuffer2();
      buf.insert('hello\nworld\t!');
      expect(buf.getContent()).toBe('hello\nworld\t!');
      expect(buf.length).toBe(13);
    });
  });
});
