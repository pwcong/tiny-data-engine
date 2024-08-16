import { BaseBehaviorApi, INodeBehaviorApi } from './interface';

import {
  DeleteNodeAction,
  IDeleteNodeActionOptions,
  IInsertNodeActionOptions,
  InsertNodeAction,
  IUpdateNodeActionOptions,
  UpdateNodeAction,
} from '@/action';

export class NodeBehaviorApi
  extends BaseBehaviorApi
  implements INodeBehaviorApi
{
  insert(options: IInsertNodeActionOptions, canUndoRedo = true, commit = true) {
    return this.behavior.applyLocal({
      action: new InsertNodeAction(options),
      canUndoRedo,
      commit,
    });
  }

  delete(options: IDeleteNodeActionOptions, canUndoRedo = true, commit = true) {
    return this.behavior.applyLocal({
      action: new DeleteNodeAction(options),
      canUndoRedo,
      commit,
    });
  }

  update(options: IUpdateNodeActionOptions, canUndoRedo = true, commit = true) {
    return this.behavior.applyLocal({
      action: new UpdateNodeAction(options),
      canUndoRedo,
      commit,
    });
  }
}
