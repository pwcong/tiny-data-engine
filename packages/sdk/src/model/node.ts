import {
  BaseModel,
  BaseModelDelta,
  DeltaConstructorSymbol,
  ModelConstructorSymbol,
  NullableDeep,
  PartialDeep,
  ReadonlyDeep,
} from './interface';

import { ENodeType, INode } from '@/scheme';

export interface INodeModel {
  id: string;
  name: string;
  type: ENodeType;
}

export class NodeModel extends BaseModel implements INodeModel {
  static deserialize(obj: INode): NodeModel {
    return new NodeModel({
      id: obj.id,
      name: obj.name,
      type: obj.type,
    });
  }

  readonly [DeltaConstructorSymbol]: any = NodeModelDelta;

  id: string;

  name: string;

  type: ENodeType;

  constructor(params: INodeModel) {
    super();
    this.id = params.id;
    this.type = params.type;
    this.name = params.name;
  }

  clone(): NodeModel {
    return new NodeModel({
      id: this.id,
      name: this.name,
      type: this.type,
    });
  }

  serialize(): INode {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
    };
  }
}

export interface NodeModelDelta extends NullableDeep<PartialDeep<INodeModel>> {}

export class NodeModelDelta extends BaseModelDelta {
  readonly [ModelConstructorSymbol]: any = NodeModel;

  constructor(partial: Partial<INodeModel>) {
    super();
    this.name = partial?.name;
  }

  clone() {
    const delta = new NodeModelDelta({});
    delta.name = this.name;
    return delta;
  }
}

export type INodeModelReadonly = ReadonlyDeep<INodeModel>;
