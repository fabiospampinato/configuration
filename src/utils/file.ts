
/* IMPORT */

import {readFile, readFileSync, writeFile, writeFileSync} from 'atomically';
import {FSWatcher} from 'chokidar';

/* FILE */

const File = {
  read: readFile,
  readSync: readFileSync,
  write: writeFile,
  writeSync: writeFileSync,
  watch ( filePath: string, callback: Function ): FSWatcher {
    const watcher = require ( 'chokidar-watcher' ); // Lazy import for performance
    const handler = () => callback ();
    return watcher ( filePath, {}, handler );
  }
};

/* EXPORT */

export default File;
