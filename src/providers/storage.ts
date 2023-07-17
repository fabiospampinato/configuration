
/* IMPORT */

import type {Data, DataRaw, DataUpdate, ProviderStorageOptions} from '../types';
import PathProp from '../utils/pp';
import ProviderMemory from './memory';

/* MAIN */

class ProviderStorage<Options extends ProviderStorageOptions = ProviderStorageOptions> extends ProviderMemory<Options> {

  /* VARIABLES */

  id: string;
  storage: Storage;

  /* CONSTRUCTOR */

  constructor ( options: Options ) {

    super ( options );

    this.id = options?.id;
    this.storage = options.storage;

    this.init ();

  }

  /* PUBLIC API */

  readSync (): DataUpdate {

    const dataRaw = this.storage.getItem ( this.id ) ?? this.defaultsRaw;
    const data = PathProp.unflat ( this.dataParser.parse ( dataRaw ) ?? this.defaults );

    return {data, dataRaw};

  }

  writeSync ( data: Data | DataRaw, force: boolean = false ): void {

    if ( !force && this.isEqual ( data ) ) return;

    super.writeSync ( data, true );

    try {

      this.storage.setItem ( this.id, this.dataRaw );

    } catch {}

  }

}

/* EXPORT */

export default ProviderStorage;
