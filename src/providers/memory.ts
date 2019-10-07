
/* IMPORT */

import {Data, DataRaw, DataUpdate, ProviderMemoryOptions} from '../types';
import {DEFAULTS} from '../config';
import Serializer from '../utils/serializer';
import Type from '../utils/type';
import ProviderAbstract from './abstract';

/* MEMORY */

class ProviderMemory<Options extends ProviderMemoryOptions = ProviderMemoryOptions> extends ProviderAbstract<Options> {

  async read (): Promise<DataUpdate> {

    return this.readSync ();

  }

  readSync (): DataUpdate {

    const data = this.data || DEFAULTS.data,
          dataRaw = this.dataRaw || DEFAULTS.dataRaw;

    return {data, dataRaw};

  }

  async write ( data: Data | DataRaw, force: boolean = false ): Promise<void> {

    return this.writeSync ( data, force );

  }

  writeSync ( data: Data | DataRaw, force: boolean = false ): void {

    if ( !force && this.isEqual ( data ) ) return;

    if ( Type.isString ( data ) ) {

      this.data = Serializer.deserialize ( data );
      this.dataRaw = data;
      this.dataSchema = this.validate ( this.data );

    } else {

      this.data = data;
      this.dataRaw = Serializer.serialize ( this.data, this.indentation );
      this.dataSchema = this.validate ( this.data );

    }

    this.triggerChange ();

  }

}

/* EXPORT */

export default ProviderMemory;
