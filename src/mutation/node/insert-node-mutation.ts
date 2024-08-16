import { IErrorRef, makeError, makeOk } from '@frontend-toolkit/bedrock';

import { EMutationErrorCode, EMutationType } from '../interface';
import { Mutation } from '../mutation';
import { DeleteNodeMutation } from './delete-node-mutation';

import { DocumentModel, NodeModel } from '@/model';

export interface IInsertNodeMutation {
  index: number;
  node: NodeModel;
}

export class InsertNodeMutation extends Mutation {
  readonly type: EMutationType = EMutationType.InsertNode;

  index: number;

  node: NodeModel;

  constructor(options: IInsertNodeMutation) {
    super();
    this.node = options.node;
    this.index = options.index;
  }

  invert(_model: DocumentModel): Mutation[] {
    return [
      new DeleteNodeMutation({
        id: this.node.id,
      }),
    ];
  }

  protected check(model: DocumentModel): IErrorRef {
    if (model.getNodeById(this.node.id)) {
      return makeError(EMutationErrorCode.NodeHasExist, '');
    }
    return makeOk();
  }

  protected runOnModel(model: DocumentModel) {
    const node = this.node.clone();
    model.insertNode(node, this.index);
  }
}
