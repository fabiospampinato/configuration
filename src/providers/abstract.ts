
/* IMPORT */

import isEqual from 'plain-object-is-equal';
import {Disposer, Data, DataRaw, DataUpdate, ProviderChangeHandler, ProviderAbstractOptions} from '../types';
import {DEFAULTS, SCOPE_ALL} from '../config';
import Type from '../utils/type';

/* ABSTRACT */

abstract class ProviderAbstract<Options extends ProviderAbstractOptions = ProviderAbstractOptions> {

  scope: string;
  indentation: string | number;
  data: Data;
  dataRaw: DataRaw;
  dataSchema: Data;
  handlers: ProviderChangeHandler[];

  constructor ( options?: Partial<Options> ) {

    if ( options?.scope === SCOPE_ALL ) throw new Error ( `"${SCOPE_ALL}" is not a valid scope name for a provider` );

    this.scope = options?.scope ?? DEFAULTS.scope;
    this.indentation = options?.indentation ?? DEFAULTS.indentation;
    this.handlers = [];

    this.init ();

  }

  init (): void {

    const {data, dataRaw} = this.readSync ();

    this.data = data;
    this.dataRaw = dataRaw;
    this.dataSchema = this.validate ( this.data );

  }

  dispose (): void {}

  validate ( data: Data ): Data {

    return data;

  }

  isEqual ( data: Data | DataRaw ): boolean {

    return Type.isString ( data ) ? data === this.dataRaw : isEqual ( data, this.data );

  }

  triggerChange (): void {

    for ( let i = 0, l = this.handlers.length; i < l; i++ ) {

      this.handlers[i]();

    }

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
