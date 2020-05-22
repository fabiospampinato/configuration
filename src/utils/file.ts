
/* IMPORT */

import {FSWatcher} from 'chokidar';
import * as fs from 'graceful-fs';
import * as path from 'path';
import * as util from 'util';
import Folder from './folder';

/* FILE */

const File = {
  read: util.promisify ( fs.readFile ),
  readSync: fs.readFileSync,
  write ( filePath: string, content: string ): Promise<void> {
    const writeFileAtomic = util.promisify ( require ( 'write-file-atomic' ) ); // Lazy import for performance
    const folderPath = path.dirname ( filePath );
    return Folder.ensure ( folderPath ).then ( () => writeFileAtomic ( filePath, content ) );
  },
  writeSync ( filePath: string, content: string ): void {
    const writeFileAtomic = require ( 'write-file-atomic' ); // Lazy import for performance
    const folderPath = path.dirname ( filePath );
    Folder.ensureSync ( folderPath );
    return writeFileAtomic.sync ( filePath, content );
  },
  watch ( filePath: string, callback: Function ): FSWatcher {
    const watcher = require ( 'chokidar-watcher' ); // Lazy import for performance
    const handler = () => callback ();
    return watcher ( filePath, {}, handler );
  }
};

/* EXPORT */

export default File;
