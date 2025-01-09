export enum EActionOperateType {
  Local = 0,
  Undo = 1,
  Redo = 2,
  History = 3,
  Collab = 4,
}

export enum EActionType {
  BatchApi = 1,
  InsertNode = 10,
  DeleteNode = 11,
  UpdateNode = 12,
}

export enum EActionErrorCode {
  NodeNotExist = 90001,
  NodeHasExist = 90002,
}

export const UnknownAction = 'UnknownAction';

const ActionTypeNameMap = Object.keys(EActionType).reduce(
  (result, key) => ({
    ...result,
    [EActionType[key as unknown as EActionType]]: key,
  }),
  {} as Record<EActionType, string>,
);

export function getActionTypeName(action: EActionType) {
  return ActionTypeNameMap[action] || UnknownAction;
}
