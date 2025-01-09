import { IErrorRef, makeError, makeOk } from '@frontend-toolkit/bedrock';

import { EMutationErrorCode, EMutationType } from '../interface';
import { Mutation } from '../mutation';

import { DocumentModel, NodeModelDelta, diffModel } from '@/model';

export interface IUpdateNodeMutation {
  id: string;
  delta: NodeModelDelta;
}

export class UpdateNodeMutation extends Mutation {
  readonly type: EMutationType = EMutationType.UpdateNode;

  id: string;

  delta: NodeModelDelta;

  constructor(options: IUpdateNodeMutation) {
    super();
    this.id = options.id;
    this.delta = options.delta;
  }

  invert(model: DocumentModel): Mutation[] {
    const node = model.getNodeById(this.id)!;

    const nodeDelta = new NodeModelDelta({});

    const newNodeDelta = diffModel<NodeModelDelta>(node, this.delta, nodeDelta);

    return [
      new UpdateNodeMutation({
        id: this.id,
        delta: newNodeDelta,
      }),
    ];
  }

  protected check(model: DocumentModel): IErrorRef {
    if (model.getNodeById(this.id)) {
      return makeError(EMutationErrorCode.NodeHasExist, '');
    }
    return makeOk();
  }

  protected runOnModel(model: DocumentModel) {
    const delta = this.delta.clone();
    model.updateNode(this.id, delta);
  }
}
