
/* IMPORT */

import {readFile, readFileSync, writeFile, writeFileSync} from 'atomically';
import * as fs from 'fs';
import {FSWatcher} from '../types';

/* FILE */

const File = {
  read: readFile,
  readSync: readFileSync,
  write: writeFile,
  writeSync: writeFileSync,
  watch ( filePath: string, callback: Function ): FSWatcher {
    const listener = () => callback ();
    const close = () => fs.unwatchFile ( filePath, listener );
    fs.watchFile ( filePath, { persistent: false, interval: 3000 }, listener );
    return {close};
  }
};

/* EXPORT */

export default File;
