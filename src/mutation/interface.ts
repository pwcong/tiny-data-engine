export enum EMutationType {
  InsertNode = 1,
  DeleteNode = 2,
  UpdateNode = 3,
}

export enum EMutationSource {
  Local = 0,
  Collab = 1,
  Replay = 2,
  Offline = 3,
}

export enum EMutationErrorCode {
  NodeNotExist = 90001,
  NodeHasExist = 90002,
}
