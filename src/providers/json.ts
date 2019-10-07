
/* IMPORT */

import {Data, DataRaw, DataUpdate, ProviderJSONOptions} from '../types';
import {DEFAULTS} from '../config';
import File from '../utils/file';
import Serializer from '../utils/serializer';
import ProviderFile from './file';

/* JSON */

class ProviderJSON<Options extends ProviderJSONOptions = ProviderJSONOptions> extends ProviderFile<Options> {

  async read (): Promise<DataUpdate> {

    try {

      const dataRaw = await File.read ( this.path, { encoding: 'utf8' } ) || DEFAULTS.dataRaw,
            data = Serializer.deserialize ( dataRaw );

      return {data, dataRaw};

    } catch {

      const {data, dataRaw} = DEFAULTS;

      return {data, dataRaw};

    }

  }

  readSync (): DataUpdate {

    try {

      const dataRaw = File.readSync ( this.path, { encoding: 'utf8' } ) || DEFAULTS.dataRaw,
            data = Serializer.deserialize ( dataRaw );

      return {data, dataRaw};

    } catch {

      const {data, dataRaw} = DEFAULTS;

      return {data, dataRaw};

    }

  }

  async write ( data: Data | DataRaw, force: boolean = false ): Promise<void> {

    if ( !force && this.isEqual ( data ) ) return;

    await super.write ( data, true );

    File.write ( this.path, this.dataRaw );

  }

  writeSync ( data: Data | DataRaw, force: boolean = false ): void {

    if ( !force && this.isEqual ( data ) ) return;

    super.writeSync ( data, true );

    File.writeSync ( this.path, this.dataRaw );

  }

}

/* EXPORT */

export default ProviderJSON;
