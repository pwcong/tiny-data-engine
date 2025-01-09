import { DeltaConstructorSymbol, ModelConstructorSymbol } from './interface';

const isBasicType = (val: any): boolean => {
  const t = Object.prototype.toString.call(val);
  if (
    t === '[object String]' ||
    t === '[object Boolean]' ||
    t === '[object Number]' ||
    t === '[object Symbol]' ||
    t === '[object BigInt]'
  ) {
    return true;
  }
  return false;
};

const omitKey = [DeltaConstructorSymbol, ModelConstructorSymbol];

type IModel = Record<string, any> & {
  [DeltaConstructorSymbol]: any;
};

type IDelta = Record<string, any> & {
  [ModelConstructorSymbol]: any;
};

type MergeObject = IModel | IDelta;

export const getDeltaConstructor = (target: any) => {
  if (target && typeof target[DeltaConstructorSymbol] !== 'undefined') {
    return target[DeltaConstructorSymbol] as new (...args: any[]) => any;
  }
  return undefined;
};

export const getModelConstructor = (target: any) => {
  if (target && typeof target[ModelConstructorSymbol] !== 'undefined') {
    return target[ModelConstructorSymbol] as new (...args: any[]) => any;
  }
  return undefined;
};

const isDelta = (target: any): target is IDelta => {
  return Boolean(target?.[ModelConstructorSymbol]);
};

const isEmptyDelta = (target: IDelta): boolean => {
  return (
    target &&
    Object.keys(target).filter(key => !omitKey.includes(key)).length === 0
  );
};

// eslint-disable-next-line complexity
export function mergeModel<T = any>(
  modelA: MergeObject,
  modelB: MergeObject,
  notifyDelta?: IDelta,
): T {
  const assignmodelA = modelA;
  for (const key in modelB) {
    const tempValueB = modelB?.[key];
    if (omitKey.includes(key)) {
      continue;
    }

    if (
      (modelA[key] === null || modelA[key] === undefined) &&
      isDelta(tempValueB)
    ) {
      if (notifyDelta) {
        const ctor = getModelConstructor(tempValueB);
        const valueConstruct = new (ctor as new (...args: any[]) => any)();
        const { constructor } = tempValueB as any;
        assignmodelA[key] = mergeModel(
          valueConstruct,
          tempValueB,
          new constructor(),
        );
        notifyDelta[key] = assignmodelA[key];
      } else {
        assignmodelA[key] = tempValueB;
      }
      continue;
    }

    if (typeof modelB[key] === 'undefined') {
      continue;
    }

    if (modelB[key] === null) {
      if (
        assignmodelA[key] !== null &&
        assignmodelA[key] !== undefined &&
        notifyDelta
      ) {
        notifyDelta[key] = null;
      }
      assignmodelA[key] = notifyDelta ? undefined : null;
      continue;
    }

    if (modelA[key] === null || modelA[key] === undefined) {
      if (assignmodelA[key] !== modelB[key] && notifyDelta) {
        notifyDelta[key] = modelB[key];
      }
      assignmodelA[key] = modelB[key];
      continue;
    }

    if (isBasicType(modelB[key])) {
      if (assignmodelA[key] !== modelB[key] && notifyDelta) {
        notifyDelta[key] = modelB[key];
      } else {
        delete notifyDelta?.[key];
      }
      assignmodelA[key] = modelB[key];
      continue;
    }

    if (Array.isArray(modelB[key])) {
      if (notifyDelta) {
        notifyDelta[key] = modelB[key];
      }

      if (assignmodelA[key].length === 0 && modelB[key].length === 0) {
        delete notifyDelta?.[key];
      }
      assignmodelA[key] = modelB[key];
      continue;
    }

    if (typeof modelB[key] === 'object' && typeof modelA[key] === 'object') {
      const { constructor } = modelB[key];
      const delta = new constructor();
      assignmodelA[key] = mergeModel(
        modelA[key],
        modelB[key],
        notifyDelta ? delta : undefined,
      );

      if (notifyDelta) {
        notifyDelta[key] = delta;
      }
      if (isEmptyDelta(delta)) {
        delete notifyDelta?.[key];
      }
      continue;
    }

    if (typeof modelA[key] !== 'object') {
      assignmodelA[key] = modelB[key];
      if (notifyDelta) {
        notifyDelta[key] = modelB[key];
      }
    }
  }
  return modelA as T;
}

export function diffModel<T = any>(
  modelA: MergeObject,
  modelB: MergeObject,
  delta: IDelta,
): T {
  for (const key in modelB) {
    if (typeof modelB[key] === 'undefined') {
      continue;
    }

    if (omitKey.includes(key)) {
      continue;
    }

    if (modelA[key] === null || modelA[key] === undefined) {
      if (modelB[key]) {
        delta[key] = null;
      } else {
        delta[key] = undefined;
      }
      continue;
    }

    if (
      isBasicType(modelB[key]) ||
      modelB[key] === null ||
      Array.isArray(modelB[key])
    ) {
      delta[key] = modelA[key];
      continue;
    }

    if (isDelta(modelB[key])) {
      const ctor = modelB[key].constructor;
      const valueConstruct = new (ctor as new (...args: any[]) => any)();
      delta[key] = diffModel(modelA[key], modelB[key], valueConstruct);
      continue;
    }

    if (typeof modelB[key] === 'object' && typeof modelA[key] === 'object') {
      const { constructor } = modelB[key];
      delta[key] = diffModel(modelA[key], modelB[key], new constructor());
      continue;
    }

    if (typeof modelA[key] !== 'object') {
      delta[key] = modelA[key];
    }
  }
  return delta as T;
}
