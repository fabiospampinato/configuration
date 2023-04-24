
/* IMPORT */

import type {WriteOptions} from 'atomically/dist/types';
import type {JSONSchema7} from 'json-schema';

/* MAIN */

type Encoding = 'ascii' | 'base64' | 'binary' | 'hex' | 'latin1' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2';

type Scope = string;
type ScopeAll = '*';

type Scopes = {
  [key: string]: Provider
};

type Path = string;

type Data = ValueArray | ValueObject;
type DataRaw = string;
type DataUpdate = {
  data: Data,
  dataRaw: DataRaw
};

type DataParser = {
  parse: ( raw: DataRaw ) => Data | undefined,
  stringify: ( data: Data, dataRawPrev?: DataRaw ) => DataRaw | undefined
};

type Value = ValuePrimitive | ValueArray | ValueObject;
type ValuePrimitive = null | undefined | boolean | number | string;
type ValueArray = Array<Value>;
type ValueObject = { [key: string]: Value };

type Schema = JSONSchema7;

type Filterer = ( value: Data, schema?: Schema ) => Data;

type FiltererWrapper = ( value: Data ) => Data;

type ExtendData = {
  defaults?: Data,
  schema?: Schema
};

type ChangeHandler = (( value: Value | undefined, valuePrev: Value | undefined ) => void) | (() => void);
type ChangeHandlerData = {
  callback: ChangeHandler,
  getter: () => Value | undefined,
  value: Value | undefined
};

type Disposer = () => void;

type FSWatcher = {
  close: () => void
};

type Options = {
  providers: Provider[],
  defaults: Data,
  schema: Schema,
  filterer: Filterer,
  scope: Scope
};

/* PROVIDERS TYPES */

type Provider = import ( './providers/abstract' ).default;

type ProviderChangeHandler = () => void;

type ProviderAbstractOptions = {
  scope: string,
  defaults?: Data,
  defaultsRaw?: DataRaw,
  indentation?: string | number,
  parser?: DataParser
};

type ProviderFileOptions = ProviderAbstractOptions & {
  path?: string,
  watch?: boolean,
  writeOptions?: WriteOptions,
  writeSyncOptions?: WriteOptions
};

type ProviderJSONOptions = ProviderFileOptions;

type ProviderMemoryOptions = ProviderAbstractOptions;

type ProviderStorageOptions = ProviderAbstractOptions & {
  id: string,
  storage: Storage
};

/* EXPORT */

export type {Encoding, Scope, ScopeAll, Scopes, Path, Data, DataRaw, DataUpdate, DataParser, ExtendData, Value, ValueArray, ValueObject, Schema, Filterer, FiltererWrapper, ChangeHandler, ChangeHandlerData, Disposer, FSWatcher, Options, Provider, ProviderChangeHandler, ProviderAbstractOptions, ProviderFileOptions, ProviderJSONOptions, ProviderMemoryOptions, ProviderStorageOptions};
