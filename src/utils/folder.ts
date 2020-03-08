
/* IMPORT */

import * as fs from 'graceful-fs';

/* FOLDER */

const Folder = {
  ensure ( folderPath: string ): Promise<void> {
    return fs.promises.mkdir ( folderPath, { recursive: true } ).catch ( () => {} );
  },
  ensureSync ( folderPath: string ): void {
    try {
      fs.mkdirSync ( folderPath, { recursive: true } );
    } catch {}
  }
};

/* EXPORT */

export default Folder;
