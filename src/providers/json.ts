
/* IMPORT */

import cloneDeep from 'plain-object-clone';
import pp from 'path-prop';
import {Data, DataRaw, DataUpdate, ProviderJSONOptions} from '../types';
import File from '../utils/file';
import ProviderFile from './file';

/* JSON */

class ProviderJSON<Options extends ProviderJSONOptions = ProviderJSONOptions> extends ProviderFile<Options> {

  async read (): Promise<DataUpdate> {

    if ( !this.path ) return super.read ();

    try {

      const dataRaw = await File.read ( this.path, { encoding: 'utf8' } ) ?? this.defaultsRaw,
            data = pp.unflat ( this.dataParser.parse ( dataRaw ) ?? this.defaults );

      return {data, dataRaw};

    } catch {

      return {
        data: cloneDeep ( this.defaults ),
        dataRaw: this.defaultsRaw
      };

    }

  }

  readSync (): DataUpdate {

    if ( !this.path ) return super.readSync ();

    try {

      const dataRaw = File.readSync ( this.path, { encoding: 'utf8' } ) ?? this.defaultsRaw,
            data = pp.unflat ( this.dataParser.parse ( dataRaw ) ?? this.defaults );

      return {data, dataRaw};

    } catch {

      return {
        data: cloneDeep ( this.defaults ),
        dataRaw: this.defaultsRaw
      };

    }

  }

  async write ( data: Data | DataRaw, force: boolean = false ): Promise<void> {

    if ( !this.path ) return super.write ( data, force );

    if ( !force && this.isEqual ( data ) ) return;

    await super.write ( data, true );

    File.write ( this.path, this.dataRaw );

  }

  writeSync ( data: Data | DataRaw, force: boolean = false ): void {

    if ( !this.path ) return super.writeSync ( data, force );

    if ( !force && this.isEqual ( data ) ) return;

    super.writeSync ( data, true );

    File.writeSync ( this.path, this.dataRaw );

  }

}

/* EXPORT */

export default ProviderJSON;
