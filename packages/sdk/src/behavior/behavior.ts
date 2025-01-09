import {
  Emitter,
  Event,
  IValueRef,
  makeError,
  makeOkWith,
  UndoRedoItem,
  UndoRedoItemOperateType,
  UndoRedoStack,
  UndoRedoType,
} from '@frontend-toolkit/bedrock';

import { EChangeType, IDiffData } from './change-diff/interface';

import { Action, EActionOperateType, EActionType } from '@/action';
import {
  EMutationSource,
  getChangedDataFromsNodeMutation,
  isNodeMutation,
  Mutation,
} from '@/mutation';
import { DocumentModel } from '@/model';
import { MutationApi } from '@/mutation/api';
import { IDataView } from '@/data-engine';
import { generateUuid } from '@/utils';

export interface IUndoRedoCommand {
  id: string;
  mutations: Mutation[];
  actionType: EActionType;
  actionKey: string;
}

export type Stack = {
  undoMutations: Mutation[];
  redoMutations: Mutation[];
};

export type Batch = {
  isInMode: boolean;
  batchIds: string[];
  stack: Stack;
};

export interface IApplyOptions {
  canUndoRedo?: boolean;
  clearRedoStack?: boolean;
  commit?: boolean;
}

export interface IApplyLocalOptions extends IApplyOptions {
  action: Action<any>;
}

export interface BatchConfig {
  canUndoRedo?: boolean;
  clearRedoStack?: boolean;
  isRecovery?: boolean;
}

/**
 * 上层业务行为的数据层应用接口
 */
export class Behavior {
  public onChangeDiff: Event<[IDiffData]>;

  public onBatchStart: Event<[]>;

  public onBatchEnd: Event<[]>;

  public onAbort: Event<[unknown]>;

  private readonly _onChangeDiff: Emitter<[IDiffData]> = new Emitter<
    [IDiffData]
  >();

  private readonly _onBatchStart: Emitter<[]> = new Emitter<[]>();

  private readonly _onBatchEnd: Emitter<[]> = new Emitter<[]>();

  private readonly _onAbort: Emitter<[unknown]> = new Emitter<[unknown]>();

  private readonly _model: DocumentModel;

  private readonly _mutationApi: MutationApi;

  private readonly _undoredoStack: UndoRedoStack<IUndoRedoCommand>;

  private _batch: Batch = {
    get isInMode() {
      return this.batchIds.length > 0;
    },
    batchIds: [],
    stack: {
      redoMutations: [],
      undoMutations: [],
    },
  };

  private _changeData: IDiffData = {
    [EChangeType.Node]: [],
    dataView: null as unknown as IDataView,
    actionOperateType: EActionOperateType.Local,
    commit: true,
  };

  constructor(
    model: DocumentModel,
    mutationApi: MutationApi,
    undoredoStack: UndoRedoStack<IUndoRedoCommand>,
  ) {
    this.onChangeDiff = this._onChangeDiff.event;
    this.onAbort = this._onAbort.event;
    this.onBatchStart = this._onBatchStart.event;
    this.onBatchEnd = this._onBatchEnd.event;
    this._model = model;
    this._mutationApi = mutationApi;
    this._undoredoStack = undoredoStack;
  }

  batchStart(): string {
    const taskId = generateUuid();
    this._batch.batchIds.push(taskId);
    return taskId;
  }

  batchEnd(
    taskId: string,
    config: BatchConfig = {
      canUndoRedo: true,
      clearRedoStack: true,
    },
  ) {
    const { canUndoRedo = true, clearRedoStack = true } = config;
    if (!this._batch.isInMode) {
      return;
    }
    const latestTaskId = this._batch.batchIds[this._batch.batchIds.length - 1];
    if (latestTaskId !== taskId) {
      throw new Error(`the task ${taskId} is not the latest task`);
    }

    this._batch.batchIds.pop();

    if (this._batch.batchIds.length > 0) {
      return;
    }

    const commitId = generateUuid();
    const { redoMutations, undoMutations } = this._batch.stack;
    this._record(
      redoMutations,
      undoMutations,
      EActionType.BatchApi,
      commitId,
      canUndoRedo,
      clearRedoStack,
      UndoRedoItemOperateType.Local,
    );
    this._fire();
    this._resetBatchStack();
  }

  applyLocal(options: IApplyLocalOptions) {
    const { action } = options;
    const checkResult = action.check(this._model);

    if (!checkResult.ok) {
      const result = makeError(checkResult.code, checkResult.msg || '');
      return result;
    }

    const actionOk = makeOkWith(this._applyLocalAction(options));
    return actionOk;
  }

  applyUndo(): void {
    if (this._batch.isInMode) {
      return;
    }
    try {
      this._undoredoStack.undo();
    } catch (e) {
      this._onAbort.fire(e);
    }
  }

  canUndo(): boolean {
    if (this._batch.isInMode) {
      return false;
    }
    return this._undoredoStack.canUndo();
  }

  applyRedo(): void {
    if (this._batch.isInMode) {
      return;
    }
    try {
      this._undoredoStack.redo();
    } catch (e: unknown) {
      this._onAbort.fire(e);
    }
  }

  canRedo(): boolean {
    return this._undoredoStack.canRedo();
  }

  private _applyLocalAction(options: IApplyLocalOptions) {
    try {
      return this._applyLocalActionToModel(options);
    } catch (error: any) {
      console.error(
        `apply local action error, actionType=${options.action.type}, error:`,
        error,
      );
      this._onAbort.fire(error);
      return options.action.actionKey;
    }
  }

  private _applyLocalActionToModel(options: IApplyLocalOptions) {
    const {
      action,
      canUndoRedo = true,
      clearRedoStack = true,
      commit = true,
    } = options;
    const redoMutations: Mutation[] = [];
    const undoMutations: Mutation[] = [];
    const mutationGenerator = (
      mutationHandler: (
        mutation: Mutation,
        index: number,
      ) => undefined | IValueRef<any>,
    ) =>
      action.run((mutation: Mutation) => {
        this._collectChangeData([mutation], EActionOperateType.Local, commit);

        if (this._batch.isInMode) {
          this._batch.stack.redoMutations.push(mutation);
        } else {
          redoMutations.push(mutation);
        }

        mutationHandler(mutation, redoMutations.length);
      }, this._model);

    const actionValue = this._mutationApi.applyMutationGenerator(
      this._model,
      mutationGenerator,
      undoMutations,
      true,
      {
        mutationSource: EMutationSource.Local,
      },
    );

    if (!this._batch.isInMode) {
      this._record(
        redoMutations,
        undoMutations,
        action.type,
        action.actionKey,
        canUndoRedo,
        clearRedoStack,
        UndoRedoItemOperateType.Local,
      );
    } else {
      this._batch.stack.undoMutations.unshift(...undoMutations);
    }
    if (!this._batch.isInMode) {
      this._fire();
    }

    return actionValue !== undefined ? actionValue : options.action.actionKey;
  }

  private _record(
    redoMutations: Mutation[],
    undoMutations: Mutation[],
    actionType: EActionType,
    actionKey: string,
    canUndoRedo: boolean,
    clearRedoStack: boolean,
    operateType: UndoRedoItemOperateType,
  ): void {
    const uniqueId = generateUuid();
    const undoRedoItem = new UndoRedoItem<IUndoRedoCommand>({
      redoCommand: {
        id: uniqueId,
        mutations: redoMutations,
        actionType,
        actionKey,
      },
      undoCommand: {
        id: uniqueId,
        mutations: undoMutations,
        actionType,
        actionKey,
      },
      canUndoRedo,
      operateType,
      executeCommand: (command, type): void => {
        const actionOperateType =
          type === UndoRedoType.Undo
            ? EActionOperateType.Undo
            : EActionOperateType.Redo;
        command.mutations.forEach(mutation => {
          this._collectChangeData([mutation], actionOperateType, true);
          this._mutationApi.applyMutations(this._model, [mutation], {
            mutationSource: EMutationSource.Local,
            actionType,
            actionOperateType,
          });
        });
        this._fire();
      },
    });

    this._undoredoStack.push(undoRedoItem, clearRedoStack && canUndoRedo);
  }

  private _fire(): void {
    const changeData = { ...this._changeData };
    this._resetChangeData();
    this._onChangeDiff.fire({
      ...changeData,
      dataView: this._model as unknown as IDataView,
      isInBatchMode: this._batch.isInMode,
    });
  }

  private _resetBatchStack(): void {
    this._batch = {
      get isInMode() {
        return this.batchIds.length > 0;
      },
      batchIds: [],
      stack: {
        redoMutations: [],
        undoMutations: [],
      },
    };
  }

  private _collectChangeData(
    mutations: Mutation[],
    actionOperateType: EActionOperateType,
    commit = true,
  ): void {
    this._changeData.actionOperateType = actionOperateType;
    this._changeData.commit = commit;
    mutations.forEach((mutation: Mutation) => {
      if (isNodeMutation(mutation)) {
        this._changeData[EChangeType.Node].push(
          getChangedDataFromsNodeMutation(mutation, this._model),
        );
      }
    });
  }

  private _resetChangeData(): void {
    this._changeData = {
      [EChangeType.Node]: [],
      dataView: this._model as unknown as IDataView,
      actionOperateType: EActionOperateType.Local,
      commit: true,
    };
  }
}
