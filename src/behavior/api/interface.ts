import { IErrorOr } from '@frontend-toolkit/bedrock';
import { Behavior } from '../behavior';
import { DocumentModel } from '@/model';

import {
  IDeleteNodeActionOptions,
  IInsertNodeActionOptions,
  IUpdateNodeActionOptions,
} from '@/action';

export abstract class BaseBehaviorApi {
  protected readonly model: DocumentModel;

  protected readonly behavior: Behavior;

  constructor(model: DocumentModel, behavior: Behavior) {
    this.model = model;
    this.behavior = behavior;
  }
}

export interface IUndoRedoBehaviorApi {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export interface INodeBehaviorApi {
  insert: (options: IInsertNodeActionOptions) => IErrorOr<IActionKey>;
  delete: (options: IDeleteNodeActionOptions) => IErrorOr<IActionKey>;
  update: (options: IUpdateNodeActionOptions) => IErrorOr<IActionKey>;
}

export interface IBatchBehaviorApi {
  batchStart: () => void;
  batchEnd: (taskId: string) => void;
}

export type IActionKey = string;

export interface IBehaviorApi {
  undoRedo: IUndoRedoBehaviorApi;
  node: INodeBehaviorApi;
  batch: IBatchBehaviorApi;
}
