
/* IMPORT */

import * as stringComments from 'strip-json-comments';
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

      const data = JSON.parse ( stringComments ( raw ) );

      if ( Type.isObject ( data ) ) return data;

    } catch {}

  }

  stringify ( data: Data ): DataRaw | undefined {

    try {

      if ( !Type.isArray ( data ) ) return JSON.stringify ( data, undefined, this.indentation );

      //TODO: Publish the following code as 2 separate packages

      const lines = data.map ( item => JSON.stringify ( item, undefined, ' ' )
                        .replace ( /\[\s*?(?:\r?\n|\r)\s*/g, '[' )
                        .replace ( /\s*?(?:\r?\n|\r)\s*]/g, ']' )
                        .replace ( /{\s*?(?:\r?\n|\r)\s*/g, '{ ' )
                        .replace ( /\s*?(?:\r?\n|\r)\s*}/g, ' }' )
                        .replace ( /,\s*?(?:\r?\n|\r)\s*/g, ', ' ) );

      const indentation = Type.isString ( this.indentation ) ? this.indentation : ' '.repeat ( this.indentation || 0 );

      return `[\n${indentation}${lines.join ( `,\n${indentation}` )}\n]`;

    } catch {}

  }

};

/* EXPORT */

export default Parser;
