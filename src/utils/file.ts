
/* IMPORT */

import {readFile, readFileSync, writeFile, writeFileSync} from 'atomically';
import watchFile from 'file-pollex';
import type {Callback, Disposer} from '../types';

/* MAIN */

const File = {

  /* API */

  read: readFile,

  readSync: readFileSync,

  write: writeFile,

  writeSync: writeFileSync,

  watch: ( filePath: string, callback: Callback ): Disposer => {

    return watchFile ( filePath, callback, { ignoreInitial: true, ignoreReady: true } );

  }

};

/* EXPORT */

export default File;
