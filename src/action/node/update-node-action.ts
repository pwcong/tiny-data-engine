import { IErrorRef, makeError, makeOk } from '@frontend-toolkit/bedrock';

import { EActionErrorCode, EActionType } from '../interface';
import { Action } from '..';

import { DocumentModel, NodeModelDelta } from '@/model';
import { Mutation, UpdateNodeMutation } from '@/mutation';

export interface IUpdateNodeActionOptions {
  id: string;
  name?: string;
}

export class UpdateNodeAction extends Action<IUpdateNodeActionOptions> {
  static type: EActionType = EActionType.UpdateNode;

  get type(): EActionType {
    return UpdateNodeAction.type;
  }

  check(model: DocumentModel): IErrorRef {
    const node = model.getNodeById(this.options.id);
    if (!node) {
      return makeError(EActionErrorCode.NodeNotExist, '');
    }
    return makeOk();
  }

  do(callback: (mutation: Mutation) => void, _model: DocumentModel): void {
    const mutation = new UpdateNodeMutation({
      id: this.options.id,
      delta: new NodeModelDelta({
        name: this.options.name,
      }),
    });

    callback(mutation);
  }
}
