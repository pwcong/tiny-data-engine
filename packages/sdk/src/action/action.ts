import { IErrorRef, makeOk } from '@frontend-toolkit/bedrock';

import { EActionType } from './interface';

import { Mutation } from '@/mutation';
import { generateUuid } from '@/utils';
import { DocumentModel } from '@/model';

export interface IAction {
  readonly actionKey: string;
  readonly type: EActionType;
  check: (model: DocumentModel) => IErrorRef;
  run: (callback: (mutation: Mutation) => void, model: DocumentModel) => void;
}

export abstract class Action<T> implements IAction {
  readonly actionKey: string = generateUuid();

  protected readonly options: T;

  constructor(options: T) {
    this.options = options;
  }

  abstract get type(): EActionType;

  check(_model: DocumentModel): IErrorRef {
    return makeOk();
  }

  run(callback: (mutation: Mutation) => void, model: DocumentModel) {
    return this.do((mutation: Mutation) => {
      callback(mutation);
    }, model);
  }

  protected abstract do(
    callback: (mutation: Mutation) => void,
    model: DocumentModel,
  ): any;
}
