
/* IMPORT */

import cloneDeep from 'plain-object-clone';
import {Data, DataRaw, DataUpdate, ProviderMemoryOptions} from '../types';
import Type from '../utils/type';
import ProviderAbstract from './abstract';

/* MEMORY */

class ProviderMemory<Options extends ProviderMemoryOptions = ProviderMemoryOptions> extends ProviderAbstract<Options> {

  async read (): Promise<DataUpdate> {

    return this.readSync ();

  }

  readSync (): DataUpdate {

    const data = this.data ?? cloneDeep ( this.defaults ),
          dataRaw = this.dataRaw ?? this.defaultsRaw;

    return {data, dataRaw};

  }

  async write ( data: Data | DataRaw, force: boolean = false ): Promise<void> {

    return this.writeSync ( data, force );

  }

  writeSync ( data: Data | DataRaw, force: boolean = false ): void {

    if ( !force && this.isEqual ( data ) ) return;

    if ( Type.isString ( data ) ) {

      this.data = this.dataParser.parse ( data ) ?? cloneDeep ( this.defaults );
      this.dataRaw = data;
      this.dataSchema = this.validate ( this.data );

    } else {

      this.data = data;
      this.dataRaw = this.dataParser.stringify ( this.data ) ?? this.defaultsRaw;
      this.dataSchema = this.validate ( this.data );

    }

    this.triggerChange ();

  }

}

/* EXPORT */

export default ProviderMemory;
