import type { DeepNullable, DeepReadonly } from 'ts-essentials';

export type NullableDeep<T> = DeepNullable<T>;

export type PartialDeep<T> = T extends Record<string, any>
  ? {
      [P in keyof T]?: PartialDeep<T[P]>;
    }
  : T;

export type ReadonlyDeep<T> = DeepReadonly<T>;

export type ValueOf<T> = T[keyof T];

export const ModelConstructorSymbol = '__model_constructor__';
export const DeltaConstructorSymbol = '__delta_constructor__';

export abstract class BaseModel {
  static deserialize(_obj: Record<string, any>): BaseModel {
    throw new Error('method not override');
  }

  abstract readonly [DeltaConstructorSymbol]: any;

  abstract serialize(): Record<string, any>;

  abstract clone(): BaseModel;
}

export abstract class BaseModelDelta {
  abstract readonly [ModelConstructorSymbol]: any;
}
