type UndoAction = {
  type: 'insert' | 'delete';
  text: string;
  position: number;
  previousCursor: number;
} | {
  type: 'clear';
  previousContent: string;
  previousCursor: number;
};

import { clamp } from '../../utils/math-helpers.js'

export class EditBuffer2 {
  private content: string = '';
  private cursor: number = 0;
  private undoStack: UndoAction[] = [];
  private redoStack: UndoAction[] = [];
  private maxHistory: number;

  constructor(maxHistory?: number) {
    this.maxHistory = maxHistory ?? 100;
  }

  insert(text: string): void {
    const previousCursor = this.cursor;
    this.content = this.content.slice(0, this.cursor) + text + this.content.slice(this.cursor);
    this.cursor += text.length;
    
    this.undoStack.push({
      type: 'insert',
      text,
      position: this.cursor - text.length,
      previousCursor
    });
    
    this.redoStack = [];
    this.trimStack(this.undoStack);
  }

  delete(count: number): string {
    if (count <= 0) {
      return '';
    }
    
    const actualCount = Math.min(count, this.content.length - this.cursor);
    if (actualCount === 0) {
      return '';
    }
    
    const deletedText = this.content.slice(this.cursor, this.cursor + actualCount);
    const previousCursor = this.cursor;
    
    this.content = this.content.slice(0, this.cursor) + this.content.slice(this.cursor + actualCount);
    
    this.undoStack.push({
      type: 'delete',
      text: deletedText,
      position: this.cursor,
      previousCursor
    });
    
    this.redoStack = [];
    this.trimStack(this.undoStack);
    
    return deletedText;
  }

  moveCursor(position: number): void {
    this.cursor = clamp(position, 0, this.content.length);
  }

  getCursor(): number {
    return this.cursor;
  }

  getContent(): string {
    return this.content;
  }

  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }
    
    const action = this.undoStack.pop()!;
    this.redoStack.push(action);
    this.trimStack(this.redoStack);
    
    if (action.type === 'insert') {
      this.content = this.content.slice(0, action.position) + this.content.slice(action.position + action.text.length);
      this.cursor = action.previousCursor;
    } else if (action.type === 'delete') {
      this.content = this.content.slice(0, action.position) + action.text + this.content.slice(action.position);
      this.cursor = action.previousCursor;
    } else if (action.type === 'clear') {
      this.content = action.previousContent;
      this.cursor = action.previousCursor;
    }
    
    return true;
  }

  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }
    
    const action = this.redoStack.pop()!;
    this.undoStack.push(action);
    this.trimStack(this.undoStack);
    
    if (action.type === 'insert') {
      this.content = this.content.slice(0, action.position) + action.text + this.content.slice(action.position);
      this.cursor = action.position + action.text.length;
    } else if (action.type === 'delete') {
      this.content = this.content.slice(0, action.position) + this.content.slice(action.position + action.text.length);
      this.cursor = action.position;
    } else if (action.type === 'clear') {
      this.content = '';
      this.cursor = 0;
    }
    
    return true;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    const previousContent = this.content;
    const previousCursor = this.cursor;
    
    this.content = '';
    this.cursor = 0;
    
    this.undoStack.push({
      type: 'clear',
      previousContent,
      previousCursor
    });
    
    this.redoStack = [];
    this.trimStack(this.undoStack);
  }

  get length(): number {
    return this.content.length;
  }

  isEmpty(): boolean {
    return this.content.length === 0;
  }

  private trimStack(stack: UndoAction[]): void {
    if (stack.length > this.maxHistory) {
      const excess = stack.length - this.maxHistory
      stack.splice(0, excess)
    }
  }

  toString(): string {
    return `EditBuffer2()`
  }
}
