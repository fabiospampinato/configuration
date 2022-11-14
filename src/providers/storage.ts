
/* IMPORT */

import type {Data, DataRaw, DataUpdate, ProviderStorageOptions} from '../types';
import {DEFAULTS} from '../config';
import PathProp from '../utils/pp';
import ProviderMemory from './memory';

/* MAIN */

class ProviderStorage<Options extends ProviderStorageOptions = ProviderStorageOptions> extends ProviderMemory<Options> {

  /* VARIABLES */

  id: string;
  storage?: Storage;

  /* CONSTRUCTOR */

  constructor ( options: Partial<Options> ) {

    super ( options );

    if ( !options.storage ) throw new Error ( 'You need to pass a storage instance' );

    this.id = options?.id ?? DEFAULTS.id;
    this.storage = options.storage;

    this.init ();

  }

  /* API */

  readSync (): DataUpdate {

    if ( !this.storage ) return super.readSync ();

    const dataRaw = this.storage.getItem ( this.id ) ?? this.defaultsRaw;
    const data = PathProp.unflat ( this.dataParser.parse ( dataRaw ) ?? this.defaults );

    return {data, dataRaw};

  }

  writeSync ( data: Data | DataRaw, force: boolean = false ): void {

    if ( !this.storage ) return super.writeSync ( data, force );

    if ( !force && this.isEqual ( data ) ) return;

    super.writeSync ( data, true );

    try {

      this.storage.setItem ( this.id, this.dataRaw );

    } catch {}

  }

}

/* EXPORT */

export default ProviderStorage;
