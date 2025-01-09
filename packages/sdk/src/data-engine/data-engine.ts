import { Emitter, Event, UndoRedoStack } from '@frontend-toolkit/bedrock';

import { IDataEngine, IDataView } from './interface';

import {
  Behavior,
  BehaviorApi,
  EChangeType,
  EOperationType,
  IBehaviorApi,
  IDiffData,
  IUndoRedoCommand,
} from '@/behavior';
import { DocumentModel } from '@/model';
import { MutationApi } from '@/mutation';
import { generateUuid } from '@/utils';
import { EActionOperateType } from '@/action';
import { IDocument } from '@/scheme';

export class DataEngine implements IDataEngine {
  api: IBehaviorApi;

  onChangeDiff: Event<[IDiffData]>;

  onDidUndo: Event<[IDiffData]>;

  onDidRedo: Event<[IDiffData]>;

  onAbort: Event<[unknown]>;

  onBatchStart: Event<[]>;

  onBatchEnd: Event<[]>;

  private readonly _model: DocumentModel;

  private readonly _undoRedoStack: UndoRedoStack<IUndoRedoCommand>;

  private readonly _mutationApi: MutationApi;

  private readonly _behavior: Behavior;

  private readonly _onChangeDiff: Emitter<[IDiffData]> = new Emitter<
    [IDiffData]
  >();

  private readonly _onDidUndo: Emitter<[IDiffData]> = new Emitter<
    [IDiffData]
  >();

  private readonly _onDidRedo: Emitter<[IDiffData]> = new Emitter<
    [IDiffData]
  >();

  constructor() {
    this._model = new DocumentModel({
      id: generateUuid(),
      name: '',
      nodes: [],
    });
    this._mutationApi = new MutationApi();
    this._undoRedoStack = new UndoRedoStack<IUndoRedoCommand>();
    this._behavior = new Behavior(
      this._model,
      this._mutationApi,
      this._undoRedoStack,
    );
    this.api = new BehaviorApi(this._model, this._behavior);

    this.onChangeDiff = this._onChangeDiff.event;
    this.onDidUndo = this._onDidUndo.event;
    this.onDidRedo = this._onDidRedo.event;
    this.onAbort = this._behavior.onAbort;
    this.onBatchStart = this._behavior.onBatchStart;
    this.onBatchEnd = this._behavior.onBatchEnd;
    this._initChangeDiffEvent();
  }

  get dataView(): IDataView {
    return this._model as IDataView;
  }

  createDocument(): IDataView {
    this.triggerTotalDraftChangeDiff();
    return this.dataView;
  }

  recoverDocument(obj: Record<string, any>): IDataView {
    this.dataView.recover(obj as IDocument);
    this.triggerTotalDraftChangeDiff();
    return this.dataView;
  }

  getDocumentStr() {
    return JSON.stringify(this._model.serialize());
  }

  private _initChangeDiffEvent(): void {
    this._behavior.onChangeDiff((diffData: IDiffData) => {
      this._onChangeDiff.fire(diffData);
      const { actionOperateType } = diffData;
      if (actionOperateType === EActionOperateType.Undo) {
        this._onDidUndo.fire(diffData);
      } else if (actionOperateType === EActionOperateType.Redo) {
        this._onDidRedo.fire(diffData);
      }
    });
  }

  triggerTotalDraftChangeDiff(): void {
    this._onChangeDiff.fire(this.getChangeNodesFromModel());
  }

  getChangeNodesFromModel(): IDiffData {
    const changeData: IDiffData = {
      [EChangeType.Node]: [],
      actionOperateType: EActionOperateType.History,
      dataView: this._model as IDataView,
    };

    this._model.nodes.forEach(node => {
      changeData[EChangeType.Node].push({
        item: node,
        type: EOperationType.Add,
      });
    });

    return changeData;
  }
}
