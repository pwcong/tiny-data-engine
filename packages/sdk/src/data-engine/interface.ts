import { type Event } from '@frontend-toolkit/bedrock';

import { IDiffData } from '@/behavior';
import { INodeModel } from '@/model';
import { IDocument } from '@/scheme';

export interface IDataView {
  recover: (document: IDocument) => void;

  getNodeById: (id: string) => INodeModel | undefined;
}

export interface IDataEngine {
  dataView: IDataView;

  createDocument: () => IDataView;

  recoverDocument: (obj: Record<string, any>) => IDataView;

  getDocumentStr: () => string;

  onChangeDiff: Event<[IDiffData]>;

  onDidUndo: Event<[IDiffData]>;

  onDidRedo: Event<[IDiffData]>;

  onAbort: Event<[unknown]>;

  onBatchStart: Event<[]>;

  onBatchEnd: Event<[]>;
}
