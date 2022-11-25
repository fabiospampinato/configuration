
/* IMPORT */

import type {WriteOptions} from 'atomically/dist/types';
import type {Encoding, FSWatcher, ProviderFileOptions} from '../types';
import File from '../utils/file';
import ProviderAbstractFile from './abstract_file';

/* MAIN */

class ProviderFile<Options extends ProviderFileOptions = ProviderFileOptions> extends ProviderAbstractFile<Options> {

  /* API */

  fileRead ( filePath: string, encoding: Encoding ): Promise<string> {

    return File.read ( filePath, encoding );

  }

  fileReadSync ( filePath: string, encoding: Encoding ): string {

    return File.readSync ( filePath, encoding );

  }

  fileWrite ( filePath: string, data: string, options?: WriteOptions ): Promise<void> {

    return File.write ( filePath, data, options );

  }

  fileWriteSync ( filePath: string, data: string, options?: WriteOptions ): void {

    return File.writeSync ( filePath, data, options );

  }

  fileWatch ( filePath: string, callback: Function ): FSWatcher {

    return File.watch ( filePath, callback );

  }

}

/* EXPORT */

export default ProviderFile;
