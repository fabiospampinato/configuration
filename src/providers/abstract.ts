
/* IMPORT */

import type {Callback, Disposer, Data, DataRaw, DataUpdate, DataParser, Filter, ProviderAbstractOptions} from '../types';
import {SCOPE_ALL} from '../constants';
import Lang from '../utils/lang';
import Parser from '../utils/parser';
import PathProp from '../utils/pp';

/* MAIN */

abstract class ProviderAbstract<Options extends ProviderAbstractOptions = ProviderAbstractOptions> {

  /* VARIABLES */

  scope: string;
  data!: Data;
  dataRaw!: DataRaw;
  dataFiltered!: Data;
  dataParser: DataParser;
  defaults: Data;
  defaultsRaw: DataRaw;
  filter: Filter = Lang.identity;
  handlers: Callback[];

  /* CONSTRUCTOR */

  constructor ( options: Options ) {

    if ( options.scope === SCOPE_ALL ) throw new Error ( `"${SCOPE_ALL}" is not a valid scope name for a provider` );
    // if ( options.scope === SCOPE_DEFAULTS ) throw new Error ( `"${SCOPE_DEFAULTS}" is not a valid scope name for a provider` ); //TODO: Account for the "defaults" scope created internally rather than externally

    this.scope = options.scope;
    this.dataParser = options.parser ?? new Parser ( options?.indentation ?? '\t' );
    this.defaultsRaw = options.defaultsRaw ?? '{\n\t\n}';
    this.defaults = PathProp.unflat ( options.defaults ?? ( this.dataParser.parse ( this.defaultsRaw ) || {} ) );
    this.handlers = [];

    this.init ();

  }

  /* PROTECTED API */

  protected init (): void {

    const {data, dataRaw} = this.readSync ();

    this.data = data;
    this.dataRaw = dataRaw;
    this.dataFiltered = this.filter ( this.data );

  }

  protected isEqual ( data: Data | DataRaw ): boolean {

    return Lang.isString ( data ) ? data === this.dataRaw : Lang.isEqual ( data, this.data );

  }

  protected trigger (): void {

    for ( const handler of this.handlers ) {

      handler ();

    }

  }

  /* PUBLIC API */

  dispose (): void {

    return;

  }

  onChange ( handler: Callback ): Disposer {

    this.handlers.push ( handler );

    return (): void => {

      this.handlers.splice ( this.handlers.indexOf ( handler ), 1 );

    };

  }

  abstract read (): Promise<DataUpdate>;

  abstract readSync (): DataUpdate;

  abstract write ( data: Data | DataRaw, force?: boolean ): Promise<void>;

  abstract writeSync ( data: Data | DataRaw, force?: boolean ): void;

}

/* EXPORT */

export default ProviderAbstract;
