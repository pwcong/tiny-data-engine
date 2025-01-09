import { IErrorRef, makeError, makeOk } from '@frontend-toolkit/bedrock';

import { EActionErrorCode, EActionType } from '../interface';
import { Action } from '..';

import { ENodeType } from '@/scheme';
import { DocumentModel, NodeModel } from '@/model';
import { Mutation, InsertNodeMutation } from '@/mutation';

export interface IInsertNodeActionOptions {
  index: number;
  id: string;
  name: string;
  type: ENodeType;
}

export class InsertNodeAction extends Action<IInsertNodeActionOptions> {
  static type: EActionType = EActionType.InsertNode;

  get type(): EActionType {
    return InsertNodeAction.type;
  }

  check(model: DocumentModel): IErrorRef {
    const node = model.getNodeById(this.options.id);
    if (node) {
      return makeError(EActionErrorCode.NodeHasExist, '');
    }
    return makeOk();
  }

  do(callback: (mutation: Mutation) => void, _model: DocumentModel): void {
    const node = new NodeModel({
      id: this.options.id,
      name: this.options.name,
      type: this.options.type,
    });
    const mutation = new InsertNodeMutation({
      index: this.options.index,
      node,
    });
    callback(mutation);
  }
}
