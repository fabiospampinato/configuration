
/* IMPORT */

import type {WriteOptions} from 'atomically/dist/types';

/* MAIN */

type Encoding = 'ascii' | 'base64' | 'binary' | 'hex' | 'latin1' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2';

type Scope = string;
type ScopeDefaults = 'defaults';
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
  parse: ( dataRaw: DataRaw ) => Data | undefined,
  stringify: ( data: Data, dataRawPrev?: DataRaw ) => DataRaw | undefined
};

type Value = ValuePrimitive | ValueArray | ValueObject;
type ValuePrimitive = null | undefined | boolean | number | string;
type ValueArray = Array<Value>;
type ValueObject = { [key: string]: Value };

type Filter = ( value: Data ) => Data;
type FilterRaw = ( value: Data ) => Data | undefined;

type ChangeHandler = (( value: Value | undefined, valuePrev: Value | undefined ) => void) | (() => void);
type ChangeHandlerData = {
  callback: ChangeHandler,
  getter: () => Value | undefined,
  value: Value | undefined
};

type Callback = () => void;
type Disposer = () => void;

type Options = {
  providers: Provider[],
  defaults?: unknown,
  filter?: FilterRaw
};

/* PROVIDERS TYPES */

type Provider = import ( './providers/abstract' ).default;

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

type ProviderLocalStorageOptions = ProviderAbstractOptions & {
  id: string
};

type ProviderSessionStorageOptions = ProviderAbstractOptions & {
  id: string
};

/* EXPORT */

export type {Encoding, Scope, ScopeDefaults, ScopeAll, Scopes, Path, Data, DataRaw, DataUpdate, DataParser, Value, ValueArray, ValueObject, Filter, ChangeHandler, ChangeHandlerData, Callback, Disposer, Options, Provider, ProviderAbstractOptions, ProviderFileOptions, ProviderJSONOptions, ProviderMemoryOptions, ProviderStorageOptions, ProviderLocalStorageOptions, ProviderSessionStorageOptions};
