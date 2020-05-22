
/* IMPORT */

import {FSWatcher} from 'chokidar';
import {ProviderFileOptions} from '../types';
import File from '../utils/file';
import ProviderMemory from './memory';

/* FILE */

class ProviderFile<Options extends ProviderFileOptions = ProviderFileOptions> extends ProviderMemory<Options> {

  path?: string;
  watching: boolean;
  watcher?: FSWatcher;

  constructor ( options: Partial<Options> ) {

    super ( options );

    this.watching = !!options.watch;

    this.swap ( options.path, true );

  }

  dispose (): void {

    this.unwatch ();

  }

  swap ( path?: string, _initial: boolean = false ): void {

    if ( path === this.path ) return;

    this.dispose ();

    this.path = path;

    this.init ();

    if ( !_initial ) this.triggerChange ();

    if ( this.watching ) this.watch ();

  }

  watch (): void {

    if ( !this.path ) return;

    const path = this.path;

    this.watcher = File.watch ( path, async () => {

      const {data, dataRaw} = await this.read ();

      if ( path !== this.path ) return;

      if ( this.isEqual ( dataRaw ) ) return;

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
