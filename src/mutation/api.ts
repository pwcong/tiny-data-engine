import { IValueRef } from '@frontend-toolkit/bedrock';

import { EMutationSource } from './interface';
import { Mutation } from './mutation';

import { EActionOperateType, EActionType } from '@/action';
import { DocumentModel } from '@/model';

export interface IApplyMutationOptions {
  mutationSource: EMutationSource;
}

export class MutationApi {
  applyMutations(
    model: DocumentModel,
    mutations: Mutation[],
    applyOptions: IApplyMutationOptions & {
      actionType?: EActionType;
      actionOperateType?: EActionOperateType;
    },
  ) {
    mutations.forEach(mutation => {
      this.applyMutation(model, mutation, applyOptions);
    });
  }

  public applyMutationGenerator(
    model: DocumentModel,
    mutationGenerator: (
      mutationHandler: (
        mutation: Mutation,
        index: number,
      ) => undefined | IValueRef<any>,
    ) => any,
    invertMutations: Mutation[],
    isNeedInvertMutations: boolean,
    applyOptions?: IApplyMutationOptions,
  ) {
    return mutationGenerator((mutation: Mutation, _index: number) => {
      let invertMutationsFromOneMutation: Mutation[] = [];
      if (isNeedInvertMutations) {
        invertMutationsFromOneMutation = mutation.invert(model);
      }
      const result = this.applyMutation(model, mutation, applyOptions);

      if (isNeedInvertMutations) {
        invertMutations.unshift(...invertMutationsFromOneMutation);
      }
      return result;
    });
  }

  public applyMutation(
    model: DocumentModel,
    mutation: Mutation,
    _applyOptions: IApplyMutationOptions & {
      actionType?: EActionType;
    } = {
      mutationSource: EMutationSource.Local,
    },
  ) {
    try {
      const result = mutation.run(model);
      if (!result.ok) {
        throw new Error(result.toString());
      }
      return result;
    } catch (error: any) {
      console.error('apply mutation error', error.message, error);
      throw error;
    }
  }
}
