
/* IMPORT */

import type {Data, DataRaw, DataUpdate, ProviderJSONOptions} from '../types';
import Lang from '../utils/lang';
import PathProp from '../utils/pp';
import ProviderAbstractFile from './abstract_file';

/* MAIN */

//TODO: Preserve the existing path keys instead of modifying them

abstract class ProviderAbstractJSON<Options extends ProviderJSONOptions = ProviderJSONOptions> extends ProviderAbstractFile<Options> {

  /* PUBLIC API */

  async read (): Promise<DataUpdate> {

    if ( !this.path ) return super.read ();

    try {

      const dataRaw = await this.fileRead ( this.path, 'utf8' ) ?? this.defaultsRaw;
      const data = PathProp.unflat ( this.dataParser.parse ( dataRaw ) ?? this.defaults );

      return {data, dataRaw};

    } catch {

      return {
        data: Lang.cloneDeep ( this.defaults ),
        dataRaw: this.defaultsRaw
      };

    }

  }

  readSync (): DataUpdate {

    if ( !this.path ) return super.readSync ();

    try {

      const dataRaw = this.fileReadSync ( this.path, 'utf8' ) ?? this.defaultsRaw;
      const data = PathProp.unflat ( this.dataParser.parse ( dataRaw ) ?? this.defaults );

      return {data, dataRaw};

    } catch {

      return {
        data: Lang.cloneDeep ( this.defaults ),
        dataRaw: this.defaultsRaw
      };

    }

  }

  async write ( data: Data | DataRaw, force: boolean = false ): Promise<void> {

    if ( !this.path ) return super.writeSync ( data, force );

    if ( !force && this.isEqual ( data ) ) return;

    super.writeSync ( data, true );

    this.fileWrite ( this.path, this.dataRaw, this.writeOptions );

  }

  writeSync ( data: Data | DataRaw, force: boolean = false ): void {

    if ( !this.path ) return super.writeSync ( data, force );

    if ( !force && this.isEqual ( data ) ) return;

    super.writeSync ( data, true );

    this.fileWriteSync ( this.path, this.dataRaw, this.writeSyncOptions );

  }

}

/* EXPORT */

export default ProviderAbstractJSON;
