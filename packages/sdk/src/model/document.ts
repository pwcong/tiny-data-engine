import {
  BaseModel,
  BaseModelDelta,
  DeltaConstructorSymbol,
  ModelConstructorSymbol,
  NullableDeep,
  PartialDeep,
  ReadonlyDeep,
} from './interface';
import { NodeModel, NodeModelDelta } from './node';
import { mergeModel } from './utils';

import { IDocument } from '@/scheme';

export interface IDocumentModel {
  id: string;
  name: string;
  nodes: NodeModel[];
}

export class DocumentModel extends BaseModel implements IDocumentModel {
  static deserialize(obj: IDocument): DocumentModel {
    return new DocumentModel({
      id: obj.id,
      nodes: obj.nodes.map(node => NodeModel.deserialize(node)),
      name: obj.name ?? '',
    });
  }

  readonly [DeltaConstructorSymbol]: any = DocumentModelDelta;

  id: string;

  name: string;

  nodes: NodeModel[];

  constructor(params: IDocumentModel) {
    super();
    this.id = params.id;
    this.name = params.name;
    this.nodes = params.nodes;
  }

  clone(): DocumentModel {
    return new DocumentModel({
      id: this.id,
      name: this.name,
      nodes: this.nodes.map(node => node.clone()),
    });
  }

  serialize(): IDocument {
    return {
      id: this.id,
      name: this.name,
      nodes: this.nodes.map(node => node.serialize()),
    };
  }

  recover(document: IDocument) {
    const model = DocumentModel.deserialize(document);
    this.nodes = model.nodes;
    this.name = model.name;
  }

  getNodeById(id: string) {
    return this.nodes.find(node => node.id === id);
  }

  getNodeIndexById(id: string) {
    return this.nodes.findIndex(node => node.id === id);
  }

  deleteNodeById(id: string) {
    this.nodes = this.nodes.filter(node => node.id !== id);
  }

  updateNode(nodeId: string, nodeDelta: NodeModelDelta) {
    const node = this.getNodeById(nodeId)!;
    mergeModel(node, nodeDelta);
  }

  insertNode(node: NodeModel, index: number) {
    this.nodes.splice(index, 0, node);
  }
}

export interface DocumentModelDelta
  extends NullableDeep<PartialDeep<IDocumentModel>> {}

export class DocumentModelDelta extends BaseModelDelta {
  readonly [ModelConstructorSymbol]: any = DocumentModel;

  constructor(partial: Partial<IDocumentModel>) {
    super();
    this.name = partial.name;
    this.nodes = partial.nodes;
  }

  clone() {
    const delta = new DocumentModelDelta({});
    delta.name = this.name;
    delta.nodes = this.nodes;
    return delta;
  }
}

export type IDocumentModelReadonly = ReadonlyDeep<IDocumentModel>;
