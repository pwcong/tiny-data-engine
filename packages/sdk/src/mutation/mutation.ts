import {
  IErrorRef,
  makeOkWith,
  type IErrorOr,
} from '@frontend-toolkit/bedrock';

import { EMutationType } from './interface';

import { DocumentModel } from '@/model';

export interface IMutationData {
  type: EMutationType;
}

export abstract class Mutation {
  public version: string = '0.0.1';

  abstract type: EMutationType;

  needPersist(): boolean {
    return true;
  }

  run(model: DocumentModel): IErrorOr<any> {
    const checkResult = this.check(model);
    if (!checkResult.ok) {
      return checkResult;
    }

    const result = this.runOnModel(model);

    return makeOkWith(result);
  }

  abstract invert(model: DocumentModel): Mutation[];

  protected abstract check(mdoel: DocumentModel): IErrorRef;

  protected abstract runOnModel(mdoel: DocumentModel): void;
}
