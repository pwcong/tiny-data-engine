import { IErrorRef, makeError, makeOk } from '@frontend-toolkit/bedrock';

import { Action, EActionErrorCode, EActionType } from '..';

import { DocumentModel } from '@/model';
import { Mutation, DeleteNodeMutation } from '@/mutation';

export interface IDeleteNodeActionOptions {
  id: string;
}

export class DeleteNodeAction extends Action<IDeleteNodeActionOptions> {
  static type: EActionType = EActionType.DeleteNode;

  get type(): EActionType {
    return DeleteNodeAction.type;
  }

  check(model: DocumentModel): IErrorRef {
    const node = model.getNodeById(this.options.id);
    if (!node) {
      return makeError(EActionErrorCode.NodeNotExist, '');
    }
    return makeOk();
  }

  do(callback: (mutation: Mutation) => void, _model: DocumentModel): void {
    const { id } = this.options;

    const mutation = new DeleteNodeMutation({
      id,
    });

    callback(mutation);
  }
}
