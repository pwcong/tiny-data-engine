import { assertNever } from '@frontend-toolkit/bedrock';

import { EMutationType } from './interface';
import { Mutation } from './mutation';
import {
  DeleteNodeMutation,
  InsertNodeMutation,
  UpdateNodeMutation,
} from './node';

import { EOperationType, INotifyNodeOperation } from '@/behavior';
import { DocumentModel, NodeModelDelta } from '@/model';

export type NodeMutation =
  | InsertNodeMutation
  | DeleteNodeMutation
  | UpdateNodeMutation;

export const isNodeMutation = (mutation: Mutation): mutation is NodeMutation =>
  [
    EMutationType.InsertNode,
    EMutationType.DeleteNode,
    EMutationType.UpdateNode,
  ].includes(mutation.type);

export function getChangedDataFromsNodeMutation(
  mutation: NodeMutation,
  model: DocumentModel,
): INotifyNodeOperation {
  switch (mutation.type) {
    case EMutationType.InsertNode:
      return {
        item: (mutation as InsertNodeMutation).node,
        type: EOperationType.Add,
      };

    case EMutationType.DeleteNode:
      const node = model.getNodeById((mutation as DeleteNodeMutation).id);
      return {
        item: node!,
        type: EOperationType.Delete,
      };
    case EMutationType.UpdateNode:
      return {
        item: {
          ...(mutation as UpdateNodeMutation).delta.clone(),
          id: (mutation as UpdateNodeMutation).id,
        } as unknown as NodeModelDelta,
        type: EOperationType.Update,
      };
    default:
      return assertNever(mutation.type, 'unexpect mutation type');
  }
}
