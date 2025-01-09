import { BaseBehaviorApi, IBatchBehaviorApi } from './interface';

export class BatchBehaviorApi
  extends BaseBehaviorApi
  implements IBatchBehaviorApi
{
  batchStart() {
    return this.behavior.batchStart();
  }

  batchEnd(taskId: string) {
    return this.behavior.batchEnd(taskId);
  }
}
