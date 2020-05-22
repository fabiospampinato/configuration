
/* IMPORT */

import * as JSON5 from 'json5';
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

      const data = JSON5.parse ( raw );

      if ( Type.isObject ( data ) ) return data;

    } catch {}

  }

  stringify ( data: Data ): DataRaw | undefined {

    try {

      return JSON.stringify ( data, undefined, this.indentation );

    } catch {}

  }

};

/* EXPORT */

export default Parser;
