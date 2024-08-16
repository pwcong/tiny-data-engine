import { Behavior } from '../behavior';
import { BatchBehaviorApi } from './batch-api';
import { IBehaviorApi, IUndoRedoBehaviorApi } from './interface';
import { NodeBehaviorApi } from './node-api';
import { UndoRedoBehaviorApi } from './undo-redo-api';
import { DocumentModel } from '@/model';

export * from './interface';
export * from './node-api';
export * from './batch-api';
export * from './undo-redo-api';

export class BehaviorApi implements IBehaviorApi {
  undoRedo: IUndoRedoBehaviorApi;

  node: NodeBehaviorApi;

  batch: BatchBehaviorApi;

  private readonly _model: DocumentModel;

  private readonly _behavior: Behavior;

  constructor(model: DocumentModel, behavior: Behavior) {
    this._model = model;
    this._behavior = behavior;

    this.undoRedo = new UndoRedoBehaviorApi(this._model, this._behavior);
    this.node = new NodeBehaviorApi(this._model, this._behavior);
    this.batch = new BatchBehaviorApi(this._model, this._behavior);
  }
}
