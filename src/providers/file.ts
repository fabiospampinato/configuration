
/* IMPORT */

import {FSWatcher} from 'chokidar';
import {ProviderFileOptions} from '../types';
import File from '../utils/file';
import ProviderMemory from './memory';

/* FILE */

class ProviderFile<Options extends ProviderFileOptions = ProviderFileOptions> extends ProviderMemory<Options> {

  path: string;
  watcher?: FSWatcher;

  constructor ( options: Partial<Options> ) {

    super ( options );

    if ( !options.path ) throw new Error ( 'You need to provide a path' );

    this.path = options.path;

    if ( options.watch !== false ) this.watch ();

  }

  dispose (): void {

    this.unwatch ();

  }

  watch (): void {

    this.watcher = File.watch ( this.path, async () => {

      const {data, dataRaw} = await this.read ();

      if ( this.isEqual ( dataRaw ) && this.isEqual ( data ) ) return;

      super.write ( data, true );

    });

  }

  unwatch (): void {

    if ( !this.watcher ) return;

    this.watcher.close ();

    delete this.watcher;

  }

}

/* EXPORT */

export default ProviderFile;
