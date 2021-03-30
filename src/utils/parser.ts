
/* IMPORT */

import JSONC from 'jsonc-simple-parser';
import {Data, DataRaw} from '../types';
import Type from './type';

/* PARSER */

class Parser {

  indentation: string | number | undefined;

  constructor ( indentation: string | number | undefined ) {

    this.indentation = indentation;

  }

  parse ( raw: DataRaw ): Data | undefined {

    try {

      const data = JSONC.parse ( raw );

      if ( Type.isObject ( data ) ) return data;

    } catch {}

  }

  stringify ( data: Data, dataRawPrev?: DataRaw ): DataRaw | undefined {

    const getContent = ( data: Data ): DataRaw => {

      if ( Type.isArray ( data ) ) {

        //TODO: Publish the following code as 2 separate packages

        const lines = data.map ( item => JSONC.stringify ( item, undefined, ' ' )
                          .replace ( /\[\s*?(?:\r?\n|\r)\s*/g, '[' )
                          .replace ( /\s*?(?:\r?\n|\r)\s*]/g, ']' )
                          .replace ( /{\s*?(?:\r?\n|\r)\s*/g, '{ ' )
                          .replace ( /\s*?(?:\r?\n|\r)\s*}/g, ' }' )
                          .replace ( /,\s*?(?:\r?\n|\r)\s*/g, ', ' ) );

        const indentation = Type.isString ( this.indentation ) ? this.indentation : ' '.repeat ( this.indentation || 0 );

        return `[\n${indentation}${lines.join ( `,\n${indentation}` )}\n]`;

      } else {

        return JSONC.stringify ( data, undefined, this.indentation );

      }

    };

    const getBackup = ( dataRaw?: DataRaw ): DataRaw => {

      if ( !dataRaw ) return '';

      const isValid = JSONC.validate ( dataRaw );

      if ( isValid ) return '';

      const timestamp = new Date ().toLocaleString (),
            header = `// BACKUP (${timestamp})`,
            comments = dataRaw.trim ().replace ( /^/gm, '// ' ),
            backup = `\n\n${header}\n${comments}`;

      return backup;

    };

    try {

      const content = getContent ( data ),
            backup = getBackup ( dataRawPrev );

      return `${content}${backup}`;

    } catch {}

  }

};

/* EXPORT */

export default Parser;
