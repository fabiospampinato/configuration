
/* IMPORT */

import cloneDeep from 'plain-object-clone';
import type {Data, DataRaw, DataUpdate, ProviderMemoryOptions} from '../types';
import PathProp from '../utils/pp';
import Type from '../utils/type';
import ProviderAbstract from './abstract';

/* MAIN */

class ProviderMemory<Options extends ProviderMemoryOptions = ProviderMemoryOptions> extends ProviderAbstract<Options> {

  /* API */

  async read (): Promise<DataUpdate> {

    return this.readSync ();

  }

  readSync (): DataUpdate {

    const data = this.data ?? cloneDeep ( this.defaults );
    const dataRaw = this.dataRaw ?? this.defaultsRaw;

    return {data, dataRaw};

  }

  async write ( data: Data | DataRaw, force: boolean = false ): Promise<void> {

    return this.writeSync ( data, force );

  }

  writeSync ( data: Data | DataRaw, force: boolean = false ): void {

    if ( !force && this.isEqual ( data ) ) return;

    if ( Type.isString ( data ) ) {

      this.data = PathProp.unflat ( this.dataParser.parse ( data ) ?? this.defaults );
      this.dataRaw = data;
      this.dataSchema = this.filterer ( this.data );

    } else {

      this.data = PathProp.unflat ( data );
      this.dataRaw = this.dataParser.stringify ( data, this.dataRaw ) ?? this.defaultsRaw;
      this.dataSchema = this.filterer ( this.data );

    }

    this.triggerChange ();

  }

}

/* EXPORT */

export default ProviderMemory;
