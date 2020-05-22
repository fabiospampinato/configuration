
/* IMPORT */

import {Data, DataRaw, DataUpdate, ProviderMemoryOptions} from '../types';
import {DEFAULTS} from '../config';
import Type from '../utils/type';
import ProviderAbstract from './abstract';

/* MEMORY */

class ProviderMemory<Options extends ProviderMemoryOptions = ProviderMemoryOptions> extends ProviderAbstract<Options> {

  async read (): Promise<DataUpdate> {

    return this.readSync ();

  }

  readSync (): DataUpdate {

    const data = this.data ?? DEFAULTS.data,
          dataRaw = this.dataRaw ?? DEFAULTS.dataRaw;

    return {data, dataRaw};

  }

  async write ( data: Data | DataRaw, force: boolean = false ): Promise<void> {

    return this.writeSync ( data, force );

  }

  writeSync ( data: Data | DataRaw, force: boolean = false ): void {

    if ( !force && this.isEqual ( data ) ) return;

    if ( Type.isString ( data ) ) {

      this.data = this.dataParser.parse ( data );
      this.dataRaw = data;
      this.dataSchema = this.validate ( this.data );

    } else {

      this.data = data;
      this.dataRaw = this.dataParser.stringify ( this.data );
      this.dataSchema = this.validate ( this.data );

    }

    this.triggerChange ();

  }

}

/* EXPORT */

export default ProviderMemory;
