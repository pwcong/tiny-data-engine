import { BaseBehaviorApi, IUndoRedoBehaviorApi } from './interface';

export class UndoRedoBehaviorApi
  extends BaseBehaviorApi
  implements IUndoRedoBehaviorApi
{
  undo(): void {
    this.behavior.applyUndo();
  }

  redo(): void {
    this.behavior.applyRedo();
  }

  canUndo(): boolean {
    return this.behavior.canUndo();
  }

  canRedo(): boolean {
    return this.behavior.canRedo();
  }
}
