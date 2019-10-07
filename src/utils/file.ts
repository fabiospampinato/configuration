
/* IMPORT */

import {FSWatcher} from 'chokidar';
import * as fs from 'graceful-fs';
import * as util from 'util';

/* FILE */

const File = {
  read: util.promisify ( fs.readFile ),
  readSync: fs.readFileSync,
  write ( filePath: string, content: string ): Promise<void> {
    const writeFileAtomic = require ( 'write-file-atomic' ); // Lazy import for performance
    return util.promisify ( writeFileAtomic )( filePath, content );
  },
  writeSync ( filePath: string, content: string ): void {
    const writeFileAtomic = require ( 'write-file-atomic' ); // Lazy import for performance
    return writeFileAtomic.sync ( filePath, content );
  },
  watch ( filePath: string, callback: Function ): FSWatcher {
    const watcher = require ( 'chokidar-watcher' ); // Lazy import for performance
    const change = () => callback ();
    return watcher ( filePath, {}, {change} );
  }
};

/* EXPORT */

export default File;
