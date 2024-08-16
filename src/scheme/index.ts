export enum ENodeType {
  TypeA,
  TypeB,
}

export interface INode {
  id: string;
  name: string;
  type: ENodeType;
}

export interface IDocument {
  id: string;
  name: string;
  nodes: INode[];
}
