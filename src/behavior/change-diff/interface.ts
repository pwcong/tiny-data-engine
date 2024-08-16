import { EActionOperateType } from '@/action';
import { IDataView } from '@/data-engine';
import { NodeModel, NodeModelDelta } from '@/model';

export enum EChangeType {
  Node = 'Node',
}

export enum EOperationType {
  Add = 'add',
  Update = 'update',
  Delete = 'delete',
}

export type INotifyNodeOperation =
  | {
      item: NodeModel;
      type: EOperationType.Add;
    }
  | {
      item: NodeModelDelta;
      type: EOperationType.Update;
    }
  | {
      item: NodeModel;
      type: EOperationType.Delete;
    };

export interface IDiffData {
  [EChangeType.Node]: INotifyNodeOperation[];
  actionOperateType: EActionOperateType;
  dataView: IDataView;
  isInBatchMode?: boolean;
  commit?: boolean;
}
