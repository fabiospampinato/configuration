
/* IMPORT */

import stringify from 'json-oneline-stringify';
import JSONC from 'tiny-jsonc';
import type {Data, DataRaw} from '../types';
import Lang from './lang';

/* MAIN */

class Parser {

  /* VARIABLES */

  private indentation: string | number;

  /* CONSTRUCTOR */

  constructor ( indentation: string | number ) {

    this.indentation = indentation;

  }

  /* API */

  parse ( dataRaw: DataRaw ): Data | undefined {

    try {

      const data = JSONC.parse ( dataRaw );

      if ( Lang.isObject ( data ) ) return data;

    } catch {

      return undefined;

    }

  }

  stringify ( data: Data, dataRawPrev?: DataRaw ): DataRaw | undefined {

    const getContent = ( data: Data ): DataRaw => {

      if ( Lang.isArray ( data ) ) {

        const lines = data.map ( stringify );
        const indentation = Lang.isString ( this.indentation ) ? this.indentation : ' '.repeat ( this.indentation );

        return `[\n${indentation}${lines.join ( `,\n${indentation}` )}\n]`;

      } else {

        return JSON.stringify ( data, undefined, this.indentation );

      }

    };

    const getBackup = ( dataRaw?: DataRaw ): DataRaw => {

      if ( !dataRaw ) return '';

      const isValid = !!this.parse ( dataRaw );

      if ( isValid ) return '';

      const timestamp = new Date ().toLocaleString ();
      const header = `// BACKUP (${timestamp})`;
      const comments = dataRaw.trim ().replace ( /^/gm, '// ' );
      const backup = `\n\n${header}\n${comments}`;

      return backup;

    };

    try {

      const content = getContent ( data );
      const backup = getBackup ( dataRawPrev );

      return `${content}${backup}`;

    } catch {

      return undefined;

    }

  }

};

/* EXPORT */

export default Parser;
