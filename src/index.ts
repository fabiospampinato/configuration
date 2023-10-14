
/* IMPORT */

import {SCOPE_ALL, SCOPE_DEFAULTS} from './constants';
import ProviderMemory from './providers/memory';
import Lang from './utils/lang';
import PathProp from './utils/pp';
import type {Scope, ScopeAll, Scopes, Path, Value, Data, DataRaw, Disposer, ChangeHandler, ChangeHandlerData, Options, Provider, Filter} from './types';

/* MAIN */

//TODO: Somehow preserve comments in `dataRaw` when editing `data` via the APIs (edit `dataRaw` directly when possible)

class Configuration {

  /* VARIABLES */

  private providers: Provider[];
  private scopes: Scopes;

  private isArray: boolean;
  private defaults: Provider;
  private data: Data;
  private filter: Filter;

  private handlers: ChangeHandlerData[];

  /* CONSTRUCTOR */

  constructor ( options: Options ) {

    if ( !options.providers.length ) throw new Error ( 'You need to provide at least one configuration provider' );

    this.providers = options.providers;
    this.scopes = {};

    this.isArray = Lang.isArray ( options.defaults );
    this.defaults = new ProviderMemory ({ scope: SCOPE_DEFAULTS });
    this.defaults.writeSync ( options.defaults, true );

    this.data = options.defaults.constructor ();
    this.filter = value => options.filter?.( value ) ?? value;

    this.handlers = [];

    this.init ();

  }

  /* HELPERS */

  private getDefaultScope (): Scope | undefined {

    return this.providers[this.providers.length - 2]?.scope; //UGLY

  }

  private getTargetScopeForPath ( path: Path ): Scope | undefined {

    for ( let i = 0, l = this.providers.length - 1; i < l; i++ ) {

      const {scope} = this.providers[i];

      if ( this.has ( scope, path ) ) return scope;

    }

    return this.getDefaultScope ();

  }

  /* PRIVATE API */

  private init (): void {

    this.providers.push ( this.defaults );

    for ( const provider of this.providers ) {

      provider.filter = this.filter;
      provider.dataFiltered = provider.filter ( provider.data );
      provider.onChange ( this.refresh.bind ( this ) );

      this.scopes[provider.scope] = provider;

    }

    this.refresh ();

  }

  private refresh (): void {

    const datas = this.providers.map ( provider => provider.dataFiltered ).reverse ();
    const datasFiltered = datas.filter ( data => Lang.isArray ( data ) === this.isArray );

    this.data = this.isArray ? datasFiltered.flat () : Lang.merge ( datasFiltered );

    this.trigger ();

  }

  private trigger (): void {

    for ( const data of this.handlers ) {

      const value = data.getter ();

      if ( ( Lang.isUndefined ( data.value ) || !Lang.isPrimitive ( data.value ) ) && !Lang.isPrimitive ( value ) && Lang.isNullary ( data.callback ) ) { //TODO: This is not exactly correct, something might have been changed while the flattened configuration could still be the same, but this is much faster

        data.callback ();

        data.value = value;

      } else if ( !Lang.isEqual ( data.value, value ) ) {

        const valueNext = Lang.cloneDeep ( value );

        data.callback ( valueNext, data.value );

        data.value = valueNext;

      }

    }

  }

  /* PUBLIC API */

  dispose (): void {

    for ( const provider of this.providers ) {

      provider.dispose ();

    }

  }

  get (): Data;
  get ( scope: ScopeAll ): Record<Scope, Data>;
  get ( scope: ScopeAll, path: Path ): Record<Scope, Value | undefined>;
  get ( scope: Scope, path: Path ): Value | undefined;
  get ( path: Path ): Value | undefined;
  get ( scope?: Scope | Path, path?: Path ): Record<Scope, Data> | Record<Scope, Value | undefined> | Data | Value | undefined {

    if ( Lang.isUndefined ( scope ) ) { // Data

      return this.data;

    } else if ( scope === SCOPE_ALL ) { // All

      const scopes: Record<Scope, Data | Value | undefined> = {};

      for ( const scope in this.scopes ) {

        scopes[scope] = Lang.isUndefined ( path ) ? this.scopes[scope].dataFiltered : PathProp.get ( this.scopes[scope].dataFiltered, path );

      }

      return scopes;

    } else if ( Lang.isUndefined ( path ) ) { // Path

      return PathProp.get ( this.data, scope );

    } else { // Scope + Path

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You cannot get from unknown scopes' );

      return PathProp.get ( provider.dataFiltered, path );

    }

  }

  has ( scope: ScopeAll ): Record<Scope, boolean>;
  has ( scope: ScopeAll, path: Path ): Record<Scope, boolean>;
  has ( scope: Scope, path: Path ): boolean;
  has ( path: Path ): boolean;
  has ( scope: Scope | Path, path?: Path ): Record<Scope, boolean> | boolean {

    if ( scope === SCOPE_ALL ) { // All

      const scopes: Record<Scope, boolean> = {};

      for ( const scope in this.scopes ) {

        scopes[scope] = Lang.isUndefined ( path ) ? !!this.scopes[scope].dataFiltered : PathProp.has ( this.scopes[scope].dataFiltered, path );

      }

      return scopes;

    } else if ( Lang.isUndefined ( path ) ) { // Path

      return PathProp.has ( this.data, scope );

    } else { // Scope + Path

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You cannot check unknown scopes' );

      return PathProp.has ( provider.dataFiltered, path );

    }

  }

  remove ( scope: ScopeAll, path: Path ): void;
  remove ( scope: Scope, path: Path ): void;
  remove ( path: Path ): void;
  remove ( scope: Scope | Path, path?: Path ): void {

    if ( Lang.isUndefined ( path ) ) { // Path

      return this.remove ( SCOPE_ALL, scope );

    } else if ( scope === SCOPE_ALL ) { // All

      for ( const scope in this.scopes ) {

        if ( scope === SCOPE_DEFAULTS ) continue;

        const provider = this.scopes[scope];

        if ( !PathProp.has ( provider.data, path ) ) continue;

        PathProp.remove ( provider.data, path );

        provider.write ( provider.data, true );

      }

    } else { // Scope + Path

      if ( scope === SCOPE_DEFAULTS ) throw new Error ( 'You cannot delete in the "defaults" scope' );

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You cannot remove from unknown scopes' );

      if ( !PathProp.has ( provider.data, path ) ) return;

      PathProp.remove ( provider.data, path );

      provider.write ( provider.data, true );

    }

  }

  reset (): void;
  reset ( scope: Scope ): void;
  reset ( scope: Scope = SCOPE_ALL ): void {

    if ( scope === SCOPE_ALL ) { // All

      for ( const scope in this.scopes ) {

        if ( scope === SCOPE_DEFAULTS ) continue;

        this.scopes[scope].write ( this.scopes[scope].defaultsRaw );

      }

    } else { // Scope

      if ( scope === SCOPE_DEFAULTS ) throw new Error ( 'You cannot reset the "defaults" scope' );

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You cannot reset unknown scopes' );

      provider.write ( provider.defaultsRaw );

    }

  }

  scope ( scope: Scope ): Provider | undefined {

    return this.scopes[scope];

  }

  set ( scope: ScopeAll, path: Path, value: Value ): void;
  set ( scope: Scope, path: Path, value: Value ): void;
  set ( path: Path, value: Value ): void;
  set ( scope: Scope | Path, path: Path | Value, value?: Value ): void {

    if ( Lang.isUndefined ( value ) ) { // Path

      const targetScope = this.getTargetScopeForPath ( scope );

      if ( !targetScope ) throw new Error ( 'You cannot set without any providers' );

      return this.set ( targetScope, scope, path );

    }

    if ( !Lang.isString ( path ) ) return; //TSC

    if ( scope === SCOPE_ALL ) { // All

      for ( const scope in this.scopes ) {

        if ( scope === SCOPE_DEFAULTS ) continue;

        const provider = this.scopes[scope];

        if ( Lang.isEqual ( PathProp.get ( provider.data, path ), value ) ) continue;

        PathProp.set ( provider.data, path, value );

        provider.write ( provider.data, true );

      }

    } else { // Scope + Path

      if ( scope === SCOPE_DEFAULTS ) throw new Error ( 'You cannot set in the "defaults" scope' );

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You cannot set in unknown scopes' );

      if ( Lang.isEqual ( PathProp.get ( provider.data, path ), value ) ) return;

      PathProp.set ( provider.data, path, value );

      provider.write ( provider.data, true );

    }

  }

  update ( scope: ScopeAll, data: Data | DataRaw ): void;
  update ( scope: Scope, data: Data | DataRaw ): void;
  update ( data: Data | DataRaw ): void;
  update ( scope: Scope | Data | DataRaw, data?: Data | DataRaw ): void {

    if ( Lang.isUndefined ( data ) ) { // Data

      const targetScope = this.getDefaultScope ();

      if ( !targetScope ) throw new Error ( 'You cannot update without any providers' );

      return this.update ( targetScope, scope );

    }

    if ( !Lang.isString ( scope ) ) return; //TSC

    if ( scope === SCOPE_ALL ) { // All

      for ( const scope in this.scopes ) {

        if ( scope === SCOPE_DEFAULTS ) continue;

        this.scopes[scope].write ( data );

      }

    } else { // Scope + Path

      if ( scope === SCOPE_DEFAULTS ) throw new Error ( 'You cannot update in the "defaults" scope' );

      const provider = this.scopes[scope];

      if ( !provider ) throw new Error ( 'You cannot update unknown scopes' );

      provider.write ( data );

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
    const getter = () => this.get ( ...getterArgs );
    const valueRaw = getter ();
    const value = Lang.isPrimitive ( valueRaw ) || !Lang.isNullary ( callback ) ? Lang.cloneDeep ( valueRaw ) : undefined;
    const data: ChangeHandlerData = {callback, getter, value};

    handlers.push ( data );

    return (): void => {

      handlers.splice ( handlers.indexOf ( data ), 1 );

    };

  }

}

/* EXPORT */

export default Configuration;
