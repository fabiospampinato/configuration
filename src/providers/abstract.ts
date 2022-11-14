
/* IMPORT */

import isEqual from 'plain-object-is-equal';
import type {Disposer, Data, DataRaw, DataUpdate, DataParser, ProviderChangeHandler, ProviderAbstractOptions} from '../types';
import {DEFAULTS, SCOPE_ALL} from '../config';
import Parser from '../utils/parser';
import PathProp from '../utils/pp';
import Type from '../utils/type';

/* MAIN */

abstract class ProviderAbstract<Options extends ProviderAbstractOptions = ProviderAbstractOptions> {

  /* VARIABLES */

  scope: string;
  data!: Data;
  dataRaw!: DataRaw;
  dataSchema!: Data;
  dataParser: DataParser;
  defaults: Data;
  defaultsRaw: DataRaw;
  handlers: ProviderChangeHandler[];

  /* CONSTRUCTOR */

  constructor ( options?: Partial<Options> ) {

    if ( options?.scope === SCOPE_ALL ) throw new Error ( `"${SCOPE_ALL}" is not a valid scope name for a provider` );

    this.scope = options?.scope ?? DEFAULTS.scope;
    this.dataParser = options?.parser ?? new Parser ( options?.indentation ?? DEFAULTS.indentation );
    this.defaultsRaw = options?.defaultsRaw ?? DEFAULTS.defaultsRaw;
    this.defaults = PathProp.unflat ( options?.defaults ?? ( this.dataParser.parse ( this.defaultsRaw ) || DEFAULTS.defaults ) );
    this.handlers = [];

    this.init ();

  }

  /* API */

  init (): void {

    const {data, dataRaw} = this.readSync ();

    this.data = data;
    this.dataRaw = dataRaw;
    this.dataSchema = this.filterer ( this.data );

  }

  dispose (): void {}

  filterer ( data: Data ): Data {

    return data;

  }

  isEqual ( data: Data | DataRaw ): boolean {

    return Type.isString ( data ) ? data === this.dataRaw : isEqual ( data, this.data );

  }

  triggerChange (): void {

    this.handlers.forEach ( handler => handler () );

  }

  onChange ( handler: ProviderChangeHandler ): Disposer {

    this.handlers.push ( handler );

    return () => {

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
