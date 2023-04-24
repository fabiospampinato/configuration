
/* IMPORT */

import cloneDeep from 'plain-object-clone';
import isEqual from 'plain-object-is-equal';
import merge from 'plain-object-merge';
import {SCOPE_ALL, SCOPE_DEFAULTS} from './config';
import ProviderMemory from './providers/memory';
import PathProp from './utils/pp';
import Type from './utils/type';
import type {Scope, ScopeAll, Scopes, Path, Value, Data, DataRaw, Schema, ExtendData, Disposer, ChangeHandler, ChangeHandlerData, Options, Provider, Filterer, FiltererWrapper} from './types';

/* MAIN */

class Configuration {

  /* VARIABLES */

  providers: Provider[];
  scopes: Scopes;
  defaults: Provider;
  isArray: boolean;
  schema?: Schema;
  filtererRaw: Filterer;
  filterer: FiltererWrapper;
  scope: Scope;
  dataSchema!: Data;
  handlers: ChangeHandlerData[];

  /* CONSTRUCTOR */

  constructor ( options: Partial<Options> & Pick<Options, 'filterer'> ) {

    if ( !options.providers?.length ) throw new Error ( 'You need to pass at least one configuration provider' );

    this.providers = options.providers;
    this.scopes = {};
    this.scope = options.scope ?? this.providers[this.providers.length - 1].scope;
    this.handlers = [];

    this.isArray = Type.isArray ( options.defaults );

    this.defaults = new ProviderMemory ({ scope: SCOPE_DEFAULTS });
    this.defaults.writeSync ( options.defaults || {}, true );

    this.schema = options.schema;
    this.filtererRaw = options.filterer;
    this.filterer = value => this.filtererRaw ( value, this.schema );

    this.init ();

  }

  /* HELPERS */

  _getTargetScopeForPath ( path: Path ): Scope {

    for ( let i = 0, l = this.providers.length - 1; i < l; i++ ) {

      const {scope} = this.providers[i];

      if ( this.has ( scope, path ) ) return scope;

    }

    return this.scope;

  }

  /* API */

  init (): void {

    this.providers.push ( this.defaults );

    for ( let i = 0, l = this.providers.length; i < l; i++ ) {

      const provider = this.providers[i];

      provider.filterer = this.filterer;
      provider.dataSchema = provider.filterer ( provider.data );
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

    if ( data.schema ) throw new Error ( `The provided schema for the "${namespace}" namespace is invalid` ); //TODO: Actually validate schema

    if ( !data.defaults && !data.schema ) return () => {};

    let namespaceSchema = '';

    if ( this.schema && data.schema ) {

      let segments = namespace.split ( '.' );
      let schemaPatch = {};

      for ( let i = 0, l = segments.length - 1; i < l; i++ ) {

        namespaceSchema += `${i ? '.' : ''}properties.${segments[i]}`;

        const typePrev = PathProp.get ( this.schema, `${namespaceSchema}.type` );

        if ( typePrev && typePrev !== 'object' ) throw new Error ( `The provided schema for the "${namespace}" is incompatible with the existing schema` );

        schemaPatch = PathProp.set ( schemaPatch, namespaceSchema, { type: 'object', properties: {} } );

      }

      namespaceSchema += `${namespaceSchema ? '.' : ''}properties.${segments[segments.length - 1]}`;

      schemaPatch = PathProp.set ( schemaPatch, namespaceSchema, data.schema );

      const schema = merge ([ this.schema, schemaPatch ]);

      this.schema = schema;

    }

    if ( data.defaults ) {

      this.defaults.writeSync ( PathProp.set ( this.defaults.data, namespace, PathProp.unflat ( data.defaults ) ), true );

    }

    return () => {

      if ( this.schema && data.schema ) {

        PathProp.delete ( this.schema, namespaceSchema );

      }

      if ( data.defaults ) {

        PathProp.delete ( this.defaults.data, namespace );

        this.defaults.writeSync ( this.defaults.data, true );

      }

    };

  }

  refresh (): void {

    const datas = this.providers.map ( provider => provider.dataSchema ).reverse ();
    const datasFiltered = datas.filter ( data => Type.isArray ( data ) === this.isArray );

    this.dataSchema = this.isArray ? Array.prototype.concat ( ...datasFiltered ) : merge ( datasFiltered );

    this.triggerChange ();

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

        accumulator[scope] = Type.isUndefined ( path ) ? this.scopes[scope].dataSchema : PathProp.get ( this.scopes[scope].dataSchema, path );

      }

      return accumulator;

    } else if ( Type.isUndefined ( path ) ) { // Path

      return PathProp.get ( this.dataSchema, scope );

    } else { // Scope + Path

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You can\'t get from unknown scopes' );

      return PathProp.get ( provider.dataSchema, path );

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

        accumulator[scope] = Type.isUndefined ( path ) ? !!this.scopes[scope].dataSchema : PathProp.has ( this.scopes[scope].dataSchema, path );

      }

      return accumulator;

    } else if ( Type.isUndefined ( path ) ) { // Path

      return PathProp.has ( this.dataSchema, scope );

    } else { // Scope + Path

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You can\'t check unknown scopes' );

      return PathProp.has ( provider.dataSchema, path );

    }

  }

  set ( scope: ScopeAll, path: Path, value: Value ): void;
  set ( scope: Scope, path: Path, value: Value ): void;
  set ( path: Path, value: Value ): void;
  set ( scope: Scope | Path, path: Path | Value, value?: Value ): void {

    if ( Type.isUndefined ( value ) ) return this.set ( this._getTargetScopeForPath ( scope ), scope, path ); // Path

    if ( !Type.isString ( path ) ) return; //TSC

    if ( scope === SCOPE_ALL ) { // All

      for ( let scope in this.scopes ) {

        if ( scope === SCOPE_DEFAULTS ) continue;

        const provider = this.scopes[scope];

        if ( PathProp.get ( provider.data, path ) === value ) continue;

        PathProp.set ( provider.data, path, value );

        provider.write ( provider.data, true );

      }

    } else { // Scope + Path

      if ( scope === SCOPE_DEFAULTS ) throw new Error ( 'You can\'t set in the "defaults" scope' );

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You can\'t set in unknown scopes' );

      if ( PathProp.get ( provider.data, path ) === value ) return;

      PathProp.set ( provider.data, path, value );

      provider.write ( provider.data, true );

    }

  }

  remove ( scope: ScopeAll, path: Path ): void;
  remove ( scope: Scope, path: Path ): void;
  remove ( path: Path ): void;
  remove ( scope: Scope | Path, path?: Path ): void {

    if ( Type.isUndefined ( path ) ) return this.remove ( SCOPE_ALL, scope ); // Path

    if ( scope === SCOPE_ALL ) { // All

      for ( let scope in this.scopes ) {

        if ( scope === SCOPE_DEFAULTS ) continue;

        const provider = this.scopes[scope];

        if ( !PathProp.has ( provider.data, path ) ) continue;

        PathProp.delete ( provider.data, path );

        provider.write ( provider.data, true );

      }

    } else { // Scope + Path

      if ( scope === SCOPE_DEFAULTS ) throw new Error ( 'You can\'t delete in the "defaults" scope' );

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You can\'t remove from unknown scopes' );

      if ( !PathProp.has ( provider.data, path ) ) return;

      PathProp.delete ( provider.data, path );

      provider.write ( provider.data, true );

    }

  }

  update ( scope: ScopeAll, data: Data | DataRaw ): void;
  update ( scope: Scope, data: Data | DataRaw ): void;
  update ( data: Data | DataRaw ): void;
  update ( scope: Scope | Data | DataRaw, data?: Data | DataRaw ): void {

    if ( Type.isUndefined ( data ) ) return this.update ( this.scope, scope ); // Data

    if ( !Type.isString ( scope ) ) return; //TSC

    if ( scope === SCOPE_ALL ) { // All

      for ( let scope in this.scopes ) {

        if ( scope === SCOPE_DEFAULTS ) continue;

        this.scopes[scope].write ( data );

      }

    } else { // Scope + Path

      if ( scope === SCOPE_DEFAULTS ) throw new Error ( 'You can\'t update in the "defaults" scope' );

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You can\'t update unknown scopes' );

      provider.write ( data );

    }

  }

  reset (): void;
  reset ( scope: Scope ): void;
  reset ( scope: Scope = SCOPE_ALL ): void {

    if ( scope === SCOPE_ALL ) { // All

      for ( let scope in this.scopes ) {

        if ( scope === SCOPE_DEFAULTS ) continue;

        this.scopes[scope].write ( this.scopes[scope].defaultsRaw );

      }

    } else { // Scope

      if ( scope === SCOPE_DEFAULTS ) throw new Error ( 'You can\'t reset the "defaults" scope' );

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You can\'t reset unknown scopes' );

      provider.write ( provider.defaultsRaw );

    }

  }

  triggerChange (): void {

    for ( let i = 0, l = this.handlers.length; i < l; i++ ) {

      const data = this.handlers[i];
      const value = data.getter ();

      if ( Type.isNullary ( data.callback ) ) { //TODO: This is not exactly correct, something might have been changed while the flattened configuration could still be the same, but it's much faster

        data.callback ();

      } else {

        if ( isEqual ( data.value, value ) ) continue;

        const clone = Type.isPrimitive ( value ) ? value : cloneDeep ( value );

        data.callback ( clone, data.value );

        data.value = clone;

      }

    }

  }

  onChange ( handler: ChangeHandler ): Disposer;
  onChange ( scope: ScopeAll, handler: ChangeHandler ): Disposer;
  onChange ( scope: ScopeAll, path: Path, handler: ChangeHandler ): Disposer;
  onChange ( scope: Scope, path: Path, handler: ChangeHandler ): Disposer;
  onChange ( path: Path, handler: ChangeHandler ): Disposer;
  onChange ( scope: Scope | Path | ChangeHandler, path?: Path | ChangeHandler, handler?: ChangeHandler ): Disposer {

    const {handlers} = this;
    const args = arguments;
    const getterArgs = Array.prototype.slice.call ( args, 0, -1 );
    const callback = args[args.length - 1];
    const getter = () => this.get.apply ( this, getterArgs );
    const valueRaw = getter ();
    const value = !Type.isNullary ( callback ) ? ( Type.isPrimitive ( valueRaw ) ? valueRaw : cloneDeep ( valueRaw ) ) : undefined;
    const data: ChangeHandlerData = {callback, getter, value};

    handlers[handlers.length] = data;

    return () => {

      handlers.splice ( handlers.indexOf ( data ), 1 );

    };

  }

}

/* EXPORT */

export default Configuration;
