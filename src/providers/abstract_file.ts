
/* IMPORT */

import type {WriteOptions} from 'atomically/dist/types';
import type {Disposer, Encoding, ProviderFileOptions} from '../types';
import ProviderMemory from './memory';

/* MAIN */

abstract class ProviderAbstractFile<Options extends ProviderFileOptions = ProviderFileOptions> extends ProviderMemory<Options> {

  /* MAIN */

  path?: string;
  watching: boolean;
  watcherDisposer?: Disposer;
  writeOptions?: WriteOptions;
  writeSyncOptions?: WriteOptions;

  /* CONSTRUCTOR */

  constructor ( options: Options ) {

    super ( options );

    this.watching = options.watch ?? false;
    this.writeOptions = options.writeOptions;
    this.writeSyncOptions = options.writeSyncOptions;

    this.swap ( options.path, true );

  }

  /* PUBLIC API */

  dispose (): void {

    super.dispose ();

    this.unwatch ();

  }

  swap ( path?: string, _initial: boolean = false ): void {

    if ( path === this.path ) return;

    this.dispose ();

    this.path = path;

    this.init ();

    if ( !_initial ) this.trigger ();

    if ( this.watching ) this.watch ();

  }

  watch (): void {

    if ( !this.path ) return;

    const path = this.path;

    this.watcherDisposer = this.fileWatch ( path, async () => {

      const {dataRaw} = await this.read ();

      if ( path !== this.path ) return;

      if ( this.isEqual ( dataRaw ) ) return;

      super.writeSync ( dataRaw, true );

    });

  }

  unwatch (): void {

    this.watcherDisposer?.();
    this.watcherDisposer = undefined;

  }

  abstract fileRead ( filePath: string, encoding: Encoding ): Promise<string>;

  abstract fileReadSync ( filePath: string, encoding: Encoding ): string;

  abstract fileWrite ( filePath: string, data: string, options?: WriteOptions ): Promise<void>;

  abstract fileWriteSync ( filePath: string, data: string, options?: WriteOptions ): void;

  abstract fileWatch ( filePath: string, callback: Function ): Disposer;

}

/* EXPORT */

export default ProviderAbstractFile;
