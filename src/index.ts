
/* IMPORT */

import {ValidateFunction} from 'ajv';
import * as isPrimitive from 'is-primitive';
import pp from 'path-prop';
import cloneDeep from 'plain-object-clone';
import isEqual from 'plain-object-is-equal';
import merge from 'plain-object-merge';
import {Scope, ScopeAll, Scopes, Path, Value, Data, DataRaw, Schema, ExtendData, Disposer, ChangeHandler, ChangeHandlerData, Options, Provider} from './types';
import {DEFAULTS, SCOPE_ALL, SCOPE_DEFAULTS} from './config';
import ProviderMemory from './providers/memory';
import AJV from './utils/ajv';
import Type from './utils/type';

/* CONFIGURATION */

class Configuration {

  providers: Provider[];
  scopes: Scopes;
  defaults: Provider;
  schema?: Schema;
  validator?: ValidateFunction;
  scope: Scope;
  dataSchema: Data;
  handlers: ChangeHandlerData[];

  constructor ( options: Partial<Options> ) {

    if ( !options.providers?.length ) throw new Error ( 'You need to pass at least one configuration provider' );

    this.providers = options.providers;
    this.scopes = {};
    this.scope = options.scope ?? this.providers[this.providers.length - 1].scope;
    this.handlers = [];

    this.defaults = new ProviderMemory ({ scope: SCOPE_DEFAULTS });
    this.defaults.writeSync ( options.defaults ? pp.unflat ( options.defaults ) : {}, true );

    if ( options.validator ) {

      this.validator = options.validator;

    }

    if ( options.schema ) {

      const schema = AJV.getSchema ( options.schema );

      this.schema = schema;

      if ( !this.validator ) {

        this.validator = AJV.getValidator ( schema );

      }

    }

    this.init ();

  }

  init (): void {

    this.providers.push ( this.defaults );

    for ( let i = 0, l = this.providers.length; i < l; i++ ) {

      const provider = this.providers[i];

      provider.validate = this.validate.bind ( this );
      provider.data = pp.unflat ( provider.data );
      provider.dataSchema = provider.validate ( provider.data );
      provider.onChange ( this.refresh.bind ( this ) );

      this.scopes[provider.scope] = provider;

    }

    this.refresh ();

  }

  dispose (): void {

    for ( let i = 0, l = this.providers.length; i < l; i++ ) {

      const provider = this.providers[i];

      provider.dispose ();

    }

  }

  extend ( namespace: string, data: ExtendData ): Disposer {

    if ( this.has ( namespace ) ) throw new Error ( `The namespace "${namespace}" is already in use` );

    if ( this.schema && !data.schema ) throw new Error ( `You need to provide a schema for the "${namespace}" namespace` );

    if ( data.schema && !AJV.validateSchema ( data.schema ) ) throw new Error ( `The provided schema for the "${namespace}" namespace is invalid` );

    if ( !data.defaults && !data.schema ) return () => {};

    let namespaceSchema = '';

    if ( this.schema && data.schema ) {

      let segments = namespace.split ( '.' ),
          schemaPatch = {};

      for ( let i = 0, l = segments.length - 1; i < l; i++ ) {

        namespaceSchema += `${i ? '.' : ''}properties.${segments[i]}`;

        const typePrev = pp.get ( this.schema, `${namespaceSchema}.type` );

        if ( typePrev && typePrev !== 'object' ) throw new Error ( `The provided schema for the "${namespace}" is incompatible with the existing schema` );

        schemaPatch = pp.set ( schemaPatch, namespaceSchema, { type: 'object', properties: {} } );

      }

      namespaceSchema += `${namespaceSchema ? '.' : ''}properties.${segments[segments.length - 1]}`;

      schemaPatch = AJV.getSchema ( schemaPatch );
      schemaPatch = pp.set ( schemaPatch, namespaceSchema, data.schema );

      const schema = merge ([ this.schema, schemaPatch ]);

      this.schema = schema;
      this.validator = AJV.getValidator ( schema );

    }

    if ( data.defaults ) {

      this.defaults.writeSync ( pp.set ( this.defaults.data, namespace, pp.unflat ( data.defaults ) ), true );

    }

    return () => {

      if ( this.schema && data.schema ) {

        pp.delete ( this.schema, namespaceSchema );

        this.validator = AJV.getValidator ( this.schema );

      }

      if ( data.defaults ) {

        pp.delete ( this.defaults.data, namespace );

        this.defaults.writeSync ( this.defaults.data, true );

      }

    };

  }

  refresh (): void {

    const datas = this.providers.map ( provider => provider.dataSchema ).reverse ();

    this.dataSchema = merge ( datas );

    this.triggerChange ();

  }

  validate ( data: Data ): Data {

    if ( !this.validator ) return data;

    const clone = cloneDeep ( data );

    this.validator ( clone );

    return clone;

  }

  get (): Data;
  get ( scope: ScopeAll ): Record<Scope, Data>;
  get ( scope: ScopeAll, path: Path ): Record<Scope, Value | undefined>;
  get ( scope: Scope, path: Path ): Value | undefined;
  get ( path: Path ): Value | undefined;
  get ( scope?: Scope | Path, path?: Path ): Record<Scope, Data> | Record<Scope, Value | undefined> | Data | Value | undefined {

    if ( Type.isUndefined ( scope ) ) return this.dataSchema;

    if ( scope === SCOPE_ALL ) { // All

      const accumulator = {};

      for ( let scope in this.scopes ) {

        accumulator[scope] = Type.isUndefined ( path ) ? this.scopes[scope].dataSchema : pp.get ( this.scopes[scope].dataSchema, path );

      }

      return accumulator;

    } else if ( Type.isUndefined ( path ) ) { // Path

      return pp.get ( this.dataSchema, scope );

    } else { // Scope + Path

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You can\'t get from unknown scopes' );

      return pp.get ( provider.dataSchema, path );

    }

  }

  has ( scope: ScopeAll ): Record<Scope, boolean>;
  has ( scope: ScopeAll, path: Path ): Record<Scope, boolean>;
  has ( scope: Scope, path: Path ): boolean;
  has ( path: Path ): boolean;
  has ( scope: Scope | Path, path?: Path ): Record<Scope, boolean> | boolean {

    if ( scope === SCOPE_ALL ) { // All

      const accumulator = {};

      for ( let scope in this.scopes ) {

        accumulator[scope] = Type.isUndefined ( path ) ? !!this.scopes[scope].dataSchema : pp.has ( this.scopes[scope].dataSchema, path );

      }

      return accumulator;

    } else if ( Type.isUndefined ( path ) ) { // Path

      return pp.has ( this.dataSchema, scope );

    } else { // Scope + Path

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You can\'t check unknown scopes' );

      return pp.has ( provider.dataSchema, path );

    }

  }

  set ( scope: ScopeAll, path: Path, value: Value ): void;
  set ( scope: Scope, path: Path, value: Value ): void;
  set ( path: Path, value: Value ): void;
  set ( scope: Scope | Path, path: Path | Value, value?: Value ): void {

    if ( Type.isUndefined ( value ) ) return this.set ( this.scope, scope, path ); // Path

    if ( !Type.isString ( path ) ) return; //TSC

    if ( scope === SCOPE_ALL ) { // All

      for ( let scope in this.scopes ) {

        if ( scope === SCOPE_DEFAULTS ) continue;

        const provider = this.scopes[scope];

        if ( pp.get ( provider.data, path ) === value ) continue;

        pp.set ( provider.data, path, value );

        provider.write ( provider.data, true );

      }

    } else { // Scope + Path

      if ( scope === SCOPE_DEFAULTS ) throw new Error ( 'You can\'t set in the "defaults" scope' );

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You can\'t set in unknown scopes' );

      if ( pp.get ( provider.data, path ) === value ) return;

      pp.set ( provider.data, path, value );

      provider.write ( provider.data, true );

    }

  }

  remove ( scope: ScopeAll, path: Path ): void;
  remove ( scope: Scope, path: Path ): void;
  remove ( path: Path ): void;
  remove ( scope: Scope | Path, path?: Path ): void {

    if ( Type.isUndefined ( path ) ) return this.remove ( this.scope, scope ); // Path

    if ( scope === SCOPE_ALL ) { // All

      for ( let scope in this.scopes ) {

        if ( scope === SCOPE_DEFAULTS ) continue;

        const provider = this.scopes[scope];

        if ( !pp.has ( provider.data, path ) ) continue;

        pp.delete ( provider.data, path );

        provider.write ( provider.data, true );

      }

    } else { // Scope + Path

      if ( scope === SCOPE_DEFAULTS ) throw new Error ( 'You can\'t delete in the "defaults" scope' );

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You can\'t remove from unknown scopes' );

      if ( !pp.has ( provider.data, path ) ) return;

      pp.delete ( provider.data, path );

      provider.write ( provider.data, true );

    }

  }

  update ( scope: ScopeAll, data: Data | DataRaw ): void;
  update ( scope: Scope, data: Data | DataRaw ): void;
  update ( data: Data | DataRaw ): void;
  update ( scope: Scope | Data | DataRaw, data?: Data | DataRaw ): void {

    if ( Type.isUndefined ( data ) ) return this.update ( this.scope, scope ); // Data

    if ( !Type.isString ( scope ) ) return; //TSC

    const dataUnflattened = Type.isString ( data ) ? data : pp.unflat ( data );

    if ( scope === SCOPE_ALL ) { // All

      for ( let scope in this.scopes ) {

        if ( scope === SCOPE_DEFAULTS ) continue;

        this.scopes[scope].write ( dataUnflattened );

      }

    } else { // Scope + Path

      if ( scope === SCOPE_DEFAULTS ) throw new Error ( 'You can\'t update in the "defaults" scope' );

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You can\'t update unknown scopes' );

      provider.write ( dataUnflattened );

    }

  }

  reset (): void;
  reset ( scope: Scope ): void;
  reset ( scope: Scope = SCOPE_ALL ): void {

    return this.update ( scope, DEFAULTS.dataRaw );

  }

  triggerChange (): void {

    for ( let i = 0, l = this.handlers.length; i < l; i++ ) {

      const data = this.handlers[i],
            value = data.getter ();

      if ( isEqual ( data.value, value ) ) continue;

      const clone = isPrimitive ( value ) ? value : cloneDeep ( value );

      data.callback ( clone, data.value );

      data.value = clone;

    }

  }

  onChange ( handler: ChangeHandler ): Disposer;
  onChange ( scope: ScopeAll, handler: ChangeHandler ): Disposer;
  onChange ( scope: ScopeAll, path: Path, handler: ChangeHandler ): Disposer;
  onChange ( scope: Scope, path: Path, handler: ChangeHandler ): Disposer;
  onChange ( path: Path, handler: ChangeHandler ): Disposer;
  onChange ( scope: Scope | Path | ChangeHandler, path?: Path | ChangeHandler, handler?: ChangeHandler ): Disposer {

    const {handlers} = this,
          args = arguments,
          getterArgs = Array.prototype.slice.call ( args, 0, -1 ),
          callback = args[args.length - 1],
          getter = () => this.get.apply ( this, getterArgs ),
          valueRaw = getter (),
          value = isPrimitive ( valueRaw ) ? valueRaw : cloneDeep ( valueRaw ),
          data: ChangeHandlerData = {callback, getter, value};

    handlers[handlers.length] = data;

    return () => {

      handlers.splice ( handlers.indexOf ( data ), 1 );

    };

  }

}

/* EXPORT */

export default Configuration;
