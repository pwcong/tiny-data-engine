import { IErrorRef, makeError, makeOk } from '@frontend-toolkit/bedrock';

import { EMutationErrorCode, EMutationType } from '../interface';
import { Mutation } from '../mutation';
import { InsertNodeMutation } from './insert-node-mutation';

import { DocumentModel } from '@/model';

export interface IDeleteNodeMutation {
  id: string;
}

export class DeleteNodeMutation extends Mutation {
  readonly type: EMutationType = EMutationType.DeleteNode;

  id: string;

  constructor(options: IDeleteNodeMutation) {
    super();
    this.id = options.id;
  }

  invert(model: DocumentModel): Mutation[] {
    const index = model.getNodeIndexById(this.id);
    return [
      new InsertNodeMutation({
        index,
        node: model.getNodeById(this.id)!,
      }),
    ];
  }

  protected check(model: DocumentModel): IErrorRef {
    if (!model.getNodeById(this.id)) {
      return makeError(EMutationErrorCode.NodeNotExist, '');
    }
    return makeOk();
  }

  protected runOnModel(model: DocumentModel) {
    model.deleteNodeById(this.id);
  }
}
