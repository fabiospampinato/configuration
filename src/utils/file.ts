
/* IMPORT */

import {readFile, readFileSync, writeFile, writeFileSync} from 'atomically';
import Watcher from 'watcher';
import type {FSWatcher} from '../types';

/* MAIN */

const File = {
  read: readFile,
  readSync: readFileSync,
  write: writeFile,
  writeSync: writeFileSync,
  watch ( filePath: string, callback: Function ): FSWatcher {
    const listener = () => callback ();
    return new Watcher ( filePath, { persistent: false, pollingInterval: 3000 }, listener );
  }
};

/* EXPORT */

export default File;
