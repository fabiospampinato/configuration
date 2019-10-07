
/* IMPORT */

import {ValidateFunction} from 'ajv';
import {JSONSchema7} from 'json-schema';

/* TYPES */

type Scope = string;
type ScopeAll = '*';

type Scopes = {
  [key: string]: Provider
};

type Path = string;

type Data = ValueObject;
type DataRaw = string;
type DataUpdate = {
  data: Data,
  dataRaw: DataRaw
};

type Value = ValuePrimitive | ValueArray | ValueObject;
type ValuePrimitive = null | boolean | number | string;
type ValueArray = Array<Value>;
type ValueObject = { [key: string]: Value };

type Schema = JSONSchema7;

type ExtendData = {
  defaults?: Data,
  schema?: Schema
};

type ChangeHandler = ( value: Value | undefined, valuePrev: Value | undefined ) => void;
type ChangeHandlerData = {
  callback: ChangeHandler,
  getter: () => Value | undefined,
  value: Value | undefined
};

type Disposer = () => void;

type Options = {
  providers: Provider[],
  defaults: Data,
  schema: Schema,
  validator: ValidateFunction,
  scope: Scope
};

/* PROVIDERS TYPES */

type Provider = import ( './providers/abstract' ).default;

type ProviderChangeHandler = () => void;

type ProviderAbstractOptions = {
  scope: string,
  indentation: string | number
};

type ProviderFileOptions = ProviderAbstractOptions & {
  path: string,
  watch?: boolean
};

type ProviderJSONOptions = ProviderFileOptions;

type ProviderMemoryOptions = ProviderAbstractOptions;

type ProviderStorageOptions = ProviderAbstractOptions & {
  id: string,
  storage: Storage
};

/* EXPORT */

export {Scope, ScopeAll, Scopes, Path, Data, DataRaw, DataUpdate, ExtendData, Value, ValueObject, Schema, ChangeHandler, ChangeHandlerData, Disposer, Options, Provider, ProviderChangeHandler, ProviderAbstractOptions, ProviderFileOptions, ProviderJSONOptions, ProviderMemoryOptions, ProviderStorageOptions};
