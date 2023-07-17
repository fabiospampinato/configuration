
/* IMPORT */

import type {Data, DataRaw, DataUpdate, ProviderMemoryOptions} from '../types';
import Lang from '../utils/lang';
import PathProp from '../utils/pp';
import ProviderAbstract from './abstract';

/* MAIN */

class ProviderMemory<Options extends ProviderMemoryOptions = ProviderMemoryOptions> extends ProviderAbstract<Options> {

  /* PUBLIC API */

  async read (): Promise<DataUpdate> {

    return this.readSync ();

  }

  readSync (): DataUpdate {

    const data = this.data ?? Lang.cloneDeep ( this.defaults );
    const dataRaw = this.dataRaw ?? this.defaultsRaw;

    return {data, dataRaw};

  }

  async write ( data: Data | DataRaw, force: boolean = false ): Promise<void> {

    return this.writeSync ( data, force );

  }

  writeSync ( data: Data | DataRaw, force: boolean = false ): void {

    if ( !force && this.isEqual ( data ) ) return;

    if ( Lang.isString ( data ) ) {

      this.data = PathProp.unflat ( this.dataParser.parse ( data ) ?? this.defaults );
      this.dataRaw = data;
      this.dataFiltered = this.filter ( this.data );

    } else {

      this.data = PathProp.unflat ( data );
      this.dataRaw = this.dataParser.stringify ( data, this.dataRaw ) ?? this.defaultsRaw;
      this.dataFiltered = this.filter ( this.data );

    }

    this.trigger ();

  }

}

/* EXPORT */

export default ProviderMemory;
